namespace online_dictionary.Models
{
    public class Interpretation
    {
        public string Meaning { get; set; }
        public string Type { get; set; }
        public string Complexity { get; set; }
        public List<string> Examples { get; set; }
        public List<string> Synonyms { get; set; }
    }
}
