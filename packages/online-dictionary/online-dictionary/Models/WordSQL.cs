using System.ComponentModel.DataAnnotations;

namespace online_dictionary.Models
{
    public class WordSQL
    {
        public int Id { get; set; }
        [Required]
        public string Word { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
