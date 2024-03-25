using System;
using System.Diagnostics;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using MongoDB.Bson;
using MongoDB.Driver;
using online_dictionary.Models;
using Xunit;

namespace online_dictionary.Tests
{
    public class MongoDBIntegrationTests : IDisposable
    {
        private readonly IMongoClient _mongoClient;
        private readonly IMongoDatabase _database;
        public MongoDBIntegrationTests()
        {
            //var configuration = new ConfigurationBuilder()
            //    .AddJsonFile("appsettings.json")
            //    .Build();

            //var connectionString = configuration.GetSection("MongoDB").GetSection("ConnectionURI").Value;
            // To-do: if this is mongodb://mongodb:27017... it will fail
            // Need to find out how to fix this and use the right configuration file and not a pure string like this.
            _mongoClient = new MongoClient("mongodb://localhost:27017?retryWrites=true&w=majority");
            _database = _mongoClient.GetDatabase("test_database");
        }

        [Fact]
        public async Task TestInsertDocument()
        {
            // Arrange
            var collection = _database.GetCollection<BsonDocument>("test_collection");

            // Act
            var document = new BsonDocument("key", "name");
            await collection.InsertOneAsync(document);

            // Assert
            var insertDocument = await collection.Find(document).FirstOrDefaultAsync();
            Assert.NotNull(insertDocument);
        }

        public void Dispose() {
            // Clean up
            _database.DropCollection("test_collection");
        }
    }
}
