namespace online_dictionary.Models
{
    public class Interpretation
    {
        public string Meaning { get; set; } = null!;
        public string Type { get; set; } = null!;
        //public string Complexity { get; set; } = null!;
        public List<string>? Examples { get; set; } = [];
		public string Synonyms { get; set; } = "";
    }
}
