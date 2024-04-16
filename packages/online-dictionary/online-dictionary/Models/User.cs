using System.ComponentModel.DataAnnotations;

namespace online_dictionary.Models
{
    public class User
    {
        public int Id { get; set; }
        [Required]
        public string DisplayName { get; set; } = null!;
        [Required]
        public string Username { get; set; } = null!;
        [Required]
        public string Email { get; set; } = null!;
        public string? PasswordHash { get; set; }
        public string? GoogleId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public ICollection<Comment>? Comments { get; set; }

    }
}
