using System.ComponentModel.DataAnnotations;

namespace online_dictionary.DTOs
{
    public class UserDto
    {
        public string DisplayName { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
    }
}
