using System.ComponentModel.DataAnnotations;

namespace online_dictionary.DTOs
{
	public class LoginRequest
	{
		[Required]
		public string UsernameOrEmail { get; set; }

		[Required(ErrorMessage = "Password is required")]
		[MinLength(6, ErrorMessage = "Password must be at least 6 characters long")]
		[MaxLength(32, ErrorMessage = "Password must be no more than 32 characters long")]
		public string Password { get; set; }
	}
}
