using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace online_dictionary.Models
{
    public class WordEntry
    {
        [BsonId]
        [BsonRepresentation(BsonType.String)]
        public string Word { get; set; }
        public List<Interpretation>? Interpretations { get; set; } = null!;
    }
}
