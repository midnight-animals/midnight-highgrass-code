﻿using online_dictionary.Models;
using Bogus;
using MongoDB.Driver;
using online_dictionary.Services;
using Microsoft.Extensions.Options;

namespace online_dictionary.Seeder
{
	public interface IWordEntrySeeder
	{
		async Task Seed(int count) { }
	}
	public class WordEntrySeeder : IWordEntrySeeder
	{
		private readonly IMongoCollection<WordEntry> _wordEntryFakeCollection;
		private readonly IMongoClient _mongoClient;
		public WordEntrySeeder(IOptions<MongoDBSettings> options)
		{
			_mongoClient = new MongoClient(options.Value.ConnectionURI);
			IMongoDatabase database = _mongoClient.GetDatabase("online_dictionary_fake");
			_wordEntryFakeCollection = database.GetCollection<WordEntry>("word_entries");
		}
		public async Task Seed(int count)
		{
			try
			{
                // Clean up old fake data
                await _wordEntryFakeCollection.DeleteManyAsync(FilterDefinition<WordEntry>.Empty);
				await _wordEntryFakeCollection.InsertManyAsync(GenerateWordEntries(count));
				Console.WriteLine("Successfully added " + count + " fake word entries to the test database");
			} catch (Exception ex)
			{
				Console.WriteLine(ex);
			}
			
		}
		public List<WordEntry> GenerateWordEntries(int count)
		{
			//To-do: learn how to generate only unique words here.
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
					Complexity = faker.Random.Enum<Complexity>().ToString(),
					Examples = new List<string>(faker.Make(faker.Random.Number(1, 3), () => faker.Lorem.Sentence())),
					Synonyms = new List<string>(faker.Make(faker.Random.Number(1, 3), () => faker.Lorem.Word())),
				};

				interpretations.Add(interpretation);
			}

			return interpretations;
		}
	}
	public enum Complexity
	{
		A1, A2, B1, B2, C1, C2
	}
	public enum Type
	{
		noun, verb, adj, adverb
	}
}