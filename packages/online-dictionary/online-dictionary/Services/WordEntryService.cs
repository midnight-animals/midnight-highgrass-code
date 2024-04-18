using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using online_dictionary.Data;
using online_dictionary.Models;
using Polly;

namespace online_dictionary.Services
{
    public interface IWordEntryService
    {
        Task<bool> IsMongoDBConnected();
        Task<WordEntry> GetWordEntryAsync(string word);
        //Task<IEnumerable<WordEntry>> GetAllWordEntriesAsync();
        Task<List<string>> GetPaginatedWordEntriesAsync(int page, int pageSize);
        Task<List<string>> GetAllOnlyWordsAsync();
        Task<List<string>> Search(string query);
        Task<long> GetCountAsync();
        Task AddWordEntryAsync(WordEntry wordEntry);
        Task AddManyWordEntryAsync(List<WordEntry> wordEntries);
        Task UpdateWordEntryAsync(WordEntry oldWordEntry, WordEntry newWordEntry);
        Task DeleteManyWordEntriesAsync(List<WordEntry> wordEntries);
        Task DeleteWordEntryAsync(WordEntry wordEntry);
    }
    public class WordEntryService : IWordEntryService
    {
        private readonly IMongoCollection<WordEntry> _wordEntriesCollection;
        private readonly IMongoClient _mongoClient;
        private readonly OnlineDictionaryContext _sqlContext;
        public WordEntryService(OnlineDictionaryContext context)
        {
            _mongoClient = new MongoClient(Environment.GetEnvironmentVariable("MONGODB_CONNECTION_URI"));
            IMongoDatabase database = _mongoClient.GetDatabase(Environment.GetEnvironmentVariable("MONGODB_DATABASE"));
            _wordEntriesCollection = database.GetCollection<WordEntry>("word_entries");
            _sqlContext = context;
        }
        public async Task<bool> IsMongoDBConnected()
        {
            try
            {
                await _mongoClient.ListDatabaseNamesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }
        public async Task<WordEntry> GetWordEntryAsync(string word)
        {
            var filter = Builders<WordEntry>.Filter.Eq(w => w.Word, word);
            return await _wordEntriesCollection.Find(filter).FirstOrDefaultAsync();
        }

        //public async Task<IEnumerable<WordEntry>> GetAllWordEntriesAsync()
        //{
        //    return await _wordEntriesCollection.Find(_ => true).ToListAsync();
        //}

        public async Task<List<string>> GetAllOnlyWordsAsync()
        {
            var projection = Builders<WordEntry>.Projection.Include(w => w.Word);
            var cursor = await _wordEntriesCollection.Find(FilterDefinition<WordEntry>.Empty)
                .Project(projection)
                .ToCursorAsync();

            var words = new List<string>();
            await cursor.ForEachAsync(document =>
            {
                words.Add(document.GetValue("Word").AsString);
            });
            return words;
        }

        public async Task<List<string>> GetPaginatedWordEntriesAsync(int page, int pageSize)
        {
            var skip = (page - 1) * pageSize;
            var sortDefinition = Builders<WordEntry>.Sort.Ascending(w => w.Word); // Sort by word in ascending order
            var projection = Builders<WordEntry>.Projection.Include(w => w.Word);
            var cursor = await _wordEntriesCollection.Find(FilterDefinition<WordEntry>.Empty)
                .Project(projection)
                .Sort(sortDefinition)
                .Skip(skip)
                .Limit(pageSize)
                .ToCursorAsync();

            var words = new List<string>();
            await cursor.ForEachAsync(document =>
            {
                words.Add(document.GetValue("Word").ToString());
            });
            return words;
        }

        public async Task<long> GetCountAsync()
        {
            var count = await _wordEntriesCollection.CountDocumentsAsync(FilterDefinition<WordEntry>.Empty);
            return count;
        }

        public async Task<List<string>> Search(string query)
        {
            var filter = Builders<WordEntry>.Filter.Regex(x => x.Word, new BsonRegularExpression(query, "i"));
            var sortDefinition = Builders<WordEntry>.Sort.Ascending(w => w.Word); // Sort by word in ascending order
            var projection = Builders<WordEntry>.Projection.Include(w => w.Word);
            var cursor = await _wordEntriesCollection.Find(filter)
                .Project(projection)
                .Sort(sortDefinition)
                .Limit(10)
                .ToCursorAsync();

            var words = new List<string>();
            await cursor.ForEachAsync(document =>
            {
                words.Add(document.GetValue("Word").AsString);
            });
            return words;
        }

        public async Task AddManyWordEntryAsync(List<WordEntry> wordEntries)
        {
            // Start SQL Server transaction
            using (var sqlTransaction = await _sqlContext.Database.BeginTransactionAsync())
            {
                try
                {
                    List<string> objectIds;
                    try
                    {
                        // Save data to MongoDB
                        await _wordEntriesCollection.InsertManyAsync(wordEntries);
                        objectIds = wordEntries.Select(w => w.Id).ToList();
                    }
                    catch (Exception ex)
                    {
                        throw ex;
                    }

                    List<WordSQL> wordSQLs = new List<WordSQL>();
                    foreach (string id in objectIds)
                    {
                        wordSQLs.Add(new WordSQL { Id = id });
                    }
                    // Save data to SQL Server
                    _sqlContext.WordSQLs.AddRange(wordSQLs);
                    await _sqlContext.SaveChangesAsync();

                    // Commit SQL Server transaction
                    await sqlTransaction.CommitAsync();
                }
                catch (Exception ex)
                {
                    // Roll back SQL Server transaction on error
                    await sqlTransaction.RollbackAsync();
                    throw ex;
                }
            }
        }

        public async Task AddWordEntryAsync(WordEntry wordEntry)
        {
            var policy = Policy
            .Handle<Exception>()
            .WaitAndRetryAsync(3, retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)));

            await policy.ExecuteAsync(async () =>
            {
                // Start SQL Server transaction
                using (var sqlTransaction = await _sqlContext.Database.BeginTransactionAsync())
                {
                    try
                    {
                        string objectId;
                        try
                        {
                            // Save data to MongoDB
                            await _wordEntriesCollection.InsertOneAsync(wordEntry);
                            objectId = wordEntry.Id;
                        }
                        catch (Exception ex)
                        {
                            throw ex;
                        }

                        // Save data to SQL Server
                        _sqlContext.WordSQLs.Add(new WordSQL { Id = objectId });
                        await _sqlContext.SaveChangesAsync();

                        // Commit SQL Server transaction
                        await sqlTransaction.CommitAsync();
                    }
                    catch (Exception ex)
                    {
                        // Roll back SQL Server transaction on error
                        await sqlTransaction.RollbackAsync();
                        throw ex;
                    }
                }
            });
        }

        public async Task UpdateWordEntryAsync(WordEntry oldWordEntry, WordEntry newWordEntry)
        {
            // Ensure that the word ID remains unchanged
            newWordEntry.Id = oldWordEntry.Id;

            var filter = Builders<WordEntry>.Filter.Eq(w => w.Id, oldWordEntry.Id);
            await _wordEntriesCollection.ReplaceOneAsync(filter, newWordEntry);
        }
        public async Task DeleteManyWordEntriesAsync(List<WordEntry> wordEntries)
        {
            // Start SQL Server transaction
            using (var sqlTransaction = await _sqlContext.Database.BeginTransactionAsync())
            {
                try
                {
                    List<string> objectIds = wordEntries.Select(w => w.Id).ToList();

                    List<WordSQL> wordSQLs = await _sqlContext.WordSQLs
                        .Where(ws => objectIds.Contains(ws.Id))
                        .ToListAsync();
                    _sqlContext.RemoveRange(wordSQLs);
                    // Save data to SQL Server
                    await _sqlContext.SaveChangesAsync();

                    try
                    {
                        // Create a filter to match WordEntry documents by their IDs
                        var filter = Builders<WordEntry>.Filter.In(we => we.Id, objectIds);
                        // Delete WordEntry documents matching the filter
                        await _wordEntriesCollection.DeleteManyAsync(filter);
                    }
                    catch (Exception ex)
                    {
                        // Handle exceptions
                        Console.WriteLine($"Error deleting WordEntry documents: {ex.Message}");
                        throw ex;
                    }

                    // Commit SQL Server transaction
                    await sqlTransaction.CommitAsync();
                }
                catch (Exception ex)
                {
                    // Roll back SQL Server transaction on error
                    await sqlTransaction.RollbackAsync();
                    throw ex;
                }
            }
        }
        public async Task DeleteWordEntryAsync(WordEntry wordEntry)
        {
            var policy = Policy
            .Handle<Exception>()
            .WaitAndRetryAsync(3, retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)));

            await policy.ExecuteAsync(async () =>
            {
                using (var sqlTransaction = await _sqlContext.Database.BeginTransactionAsync())
                {
                    try
                    {
                        WordSQL wordSql = await _sqlContext.WordSQLs.FindAsync(wordEntry.Id);
                        _sqlContext.WordSQLs.Remove(wordSql);
                        await _sqlContext.SaveChangesAsync();
                        // Commit SQL Server transaction
                        await sqlTransaction.CommitAsync();
                        try
                        {
                            //Delete WordEntry
                            await _wordEntriesCollection.DeleteOneAsync(entry => entry.Id == wordSql.Id);
                        }
                        catch (Exception ex)
                        {
                            throw ex;
                        }
                    }
                    catch (Exception ex)
                    {
                        await sqlTransaction.RollbackAsync();
                        throw ex;
                    }
                }
            });
        }
    }
}
