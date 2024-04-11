using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using online_dictionary.Models;

namespace online_dictionary.Services
{
    public interface IWordEntryService
    {
		Task<bool> IsMongoDBConnected();
		Task<WordEntry> GetWordEntryAsync(string word);
        Task<IEnumerable<WordEntry>> GetAllWordEntriesAsync();
        Task<IEnumerable<WordEntry>> GetPaginatedWordEntriesAsync(int page, int pageSize);
        Task<List<string>> GetAllOnlyWordsAsync();

		Task<long> GetCountAsync();
        Task AddWordEntryAsync(WordEntry wordEntry);
        Task UpdateWordEntryAsync(string word, WordEntry wordEntry);
        Task DeleteWordEntryAsync(string word);
    }
    public class WordEntryService : IWordEntryService
    {
        private readonly IMongoCollection<WordEntry> _wordEntriesCollection;
        private readonly IMongoClient _mongoClient;
        public WordEntryService(IOptions<MongoDBSettings> options) {
            _mongoClient = new MongoClient(options.Value.ConnectionURI);
            IMongoDatabase database = _mongoClient.GetDatabase("online_dictionary");
            _wordEntriesCollection = database.GetCollection<WordEntry>("word_entries");
        }
        public async Task<bool> IsMongoDBConnected()
        {
            try
            {
                await _mongoClient.ListDatabaseNamesAsync();
                return true;
            } catch
            {
                return false;
            }
        }
        public async Task<WordEntry> GetWordEntryAsync(string word)
        {
            var filter = Builders<WordEntry>.Filter.Eq(w => w.Word, word);
            return await _wordEntriesCollection.Find(filter).FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<WordEntry>> GetAllWordEntriesAsync()
        {
            return await _wordEntriesCollection.Find(_ => true).ToListAsync();
        }

		public async Task<List<string>> GetAllOnlyWordsAsync()
        {
            var projection = Builders<WordEntry>.Projection.Include(w => w.Word);
            var cursor = await _wordEntriesCollection.Find(FilterDefinition<WordEntry>.Empty)
                .Project(projection)
                .ToCursorAsync();

            var words = new List<string>();
            await cursor.ForEachAsync(document =>
            {
                words.Add(document.GetValue("_id").AsString);
            });
            return words;
        }


		public async Task<IEnumerable<WordEntry>> GetPaginatedWordEntriesAsync(int page, int pageSize)
        {
            var skip = (page - 1) * pageSize;
            var wordEntries = await _wordEntriesCollection.Find(entry => true)
                .Skip(skip)
                .Limit(pageSize)
                .ToListAsync();
            var all = await GetAllWordEntriesAsync();
            return wordEntries;
        }

        public async Task<long> GetCountAsync()
        {
            var count = await _wordEntriesCollection.CountDocumentsAsync(FilterDefinition<WordEntry>.Empty);
            return count;
        }

        public async Task AddWordEntryAsync(WordEntry wordEntry)
        {
            await _wordEntriesCollection.InsertOneAsync(wordEntry);
        }

        public async Task UpdateWordEntryAsync(string word, WordEntry wordEntry)
        {
            var filter = Builders<WordEntry>.Filter.Eq(w => w.Word, word);
            await _wordEntriesCollection.ReplaceOneAsync(filter, wordEntry);
        }

        public async Task DeleteWordEntryAsync(string word)
        {
            var filter = Builders<WordEntry>.Filter.Eq(w => w.Word, word);
            await _wordEntriesCollection.DeleteOneAsync(filter);
        }
    }
}
