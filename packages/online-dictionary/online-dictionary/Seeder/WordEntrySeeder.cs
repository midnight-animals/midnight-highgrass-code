using online_dictionary.Models;
using Bogus;
using MongoDB.Driver;
using online_dictionary.Services;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using online_dictionary.Data;
using Microsoft.EntityFrameworkCore;

namespace online_dictionary.Seeder
{
	public interface IWordEntrySeeder
	{
		Task Seed(int count);
		Task Import(string path);
	}
	public class WordEntrySeeder : IWordEntrySeeder
	{
		private readonly IMongoCollection<WordEntry> _wordEntryCollection;
		private readonly IWordEntryService _wordEntryService;
		private readonly IMongoClient _mongoClient;
		public WordEntrySeeder(IWordEntryService wordEntryService)
		{
            _mongoClient = new MongoClient(Environment.GetEnvironmentVariable("MONGODB_CONNECTION_URI"));
			IMongoDatabase database_real = _mongoClient.GetDatabase(Environment.GetEnvironmentVariable("MONGODB_DATABASE"));
			_wordEntryCollection = database_real.GetCollection<WordEntry>("word_entries");
			_wordEntryService = wordEntryService;
        }
        public async Task Seed(int count)
		{
			try
			{
				// Clean up old fake data
				await _wordEntryService.DeleteManyWordEntriesAsync(await _wordEntryCollection.Find(_ => true).ToListAsync());

				List<WordEntry> fakeWordEntries = GenerateWordEntries(count);
				// Add new fake data
				await _wordEntryService.AddManyWordEntryAsync(fakeWordEntries);
				Console.WriteLine("Successfully added " + count + " fake word entries to the fake Mongo database");
                Console.WriteLine("Successfully updated " + count + " words in MSSQL Server.");

            }
			catch (Exception ex)
			{
				Console.WriteLine(ex);
			}
			
		}

		public async Task Import(string filePath)
		{
			try
			{
				var jsonString = await File.ReadAllTextAsync(filePath);
				var data = JsonConvert.DeserializeObject<WordDefinitionJson>(jsonString);
				var wordEntries = CleanDuplicate(data.Data);
				// Clean up old data
				await _wordEntryService.DeleteManyWordEntriesAsync(await _wordEntryCollection.Find(_ => true).ToListAsync());

                // Add newly imported data
                await _wordEntryService.AddManyWordEntryAsync(wordEntries);
                Console.WriteLine("Successfully added " + data.Count + " word entries to the database");
                Console.WriteLine("Successfully imported " + data.Count + " words to MSSQL Server.");
                Console.WriteLine("Data imported to MongoDB successfully.");

            }
            catch (Exception ex)
			{
				Console.WriteLine(ex);
				throw new Exception("There is an error with importing json file", ex);
			}
		}
		private List<WordEntry> CleanDuplicate(List<WordEntry> wordEntries) {
			var wordList = new HashSet<string>();
			List<WordEntry> newWordEntries = new List<WordEntry>();
			foreach (var wordEntry in wordEntries)
			{
				if (wordList.Add(wordEntry.Word))
				{
					newWordEntries.Add(wordEntry);
				}
			}

			return newWordEntries;
		}
		private List<WordEntry> GenerateWordEntries(int count)
		{
			var wordList = new HashSet<string>();
			var faker = new Faker<WordEntry>()
			.RuleFor(w => w.Word, f =>
            {
				string word;
                do
                {
                    word = f.Lorem.Word();
                } while (wordList.Contains(word)); // Check if the word is already generated
                wordList.Add(word); // Add the word to the HashSet
                return word;
            })
			.RuleFor(w => w.Interpretations, f => GenerateInterpretations(f, f.Random.Number(1, 5)));

			return faker.Generate(count);
		}
		private List<Interpretation> GenerateInterpretations(Faker faker, int count)
		{
			var interpretations = new List<Interpretation>();

			for (int i = 0; i < count; i++)
			{
				var interpretation = new Interpretation
				{
					Meaning = faker.Lorem.Sentence(),
					Type = faker.Random.Enum<Type>().ToString(),
					//Complexity = faker.Random.Enum<Complexity>().ToString(),
					Examples = new List<string>(faker.Make(faker.Random.Number(1, 3), () => faker.Lorem.Sentence())),
					//Synonyms = new List<string>(faker.Make(faker.Random.Number(1, 3), () => faker.Lorem.Word())),
					Synonyms = faker.Lorem.Word(),
				};

				interpretations.Add(interpretation);
			}

			return interpretations;
		}
	}

	public class WordDefinitionJson
	{
		public int Count { get; set; }
		public List<WordEntry> Data { get; set; }
	}
	public enum Complexity
	{
		A1, A2, B1, B2, C1, C2
	}
	public enum Type
	{
		Noun, Verb, Adjective, Adverb
	}
}
