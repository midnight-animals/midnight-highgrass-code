using System.ComponentModel.DataAnnotations;

namespace online_dictionary.Models
{
    public class Comment
    {
        public int Id { get; set; }
        [Required]
        public string Content { get; set; } = null!;
        [Required]
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        [Required]
        public User User { get; set; } = null!;
        [Required]
        public WordSQL WordSQL {  get; set; } = null!;
    }
}
