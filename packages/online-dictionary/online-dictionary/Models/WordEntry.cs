using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace online_dictionary.Models
{
    public class WordEntry
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        public string Word { get; set; } = null!;
        public List<Interpretation>? Interpretations { get; set; } = null!;
    }
}
