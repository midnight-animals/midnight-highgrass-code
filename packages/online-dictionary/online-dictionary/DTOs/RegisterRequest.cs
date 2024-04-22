using online_dictionary.Data;
using online_dictionary.Models;
using System.ComponentModel.DataAnnotations;

namespace online_dictionary.DTOs
{
    public class RegisterRequest
    {
        [Required(ErrorMessage = "Display name is required")]
        public string DisplayName { get; set; }

        [Required(ErrorMessage = "Username is required")]
		[MaxLength(255)]
		[RegularExpression(@"^[a-zA-Z0-9_]*$", ErrorMessage = "Username can only contain letters, numbers, and underscores.")]
		[UniqueUsername(ErrorMessage = "Username already exists.")]
		public string Username { get; set; }

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
		[MaxLength(255)]
		[UniqueEmail(ErrorMessage = "Email is already in use.")]
		public string Email { get; set; }

        [Required(ErrorMessage = "Password is required")]
        [MinLength(6, ErrorMessage = "Password must be at least 6 characters long")]
        [MaxLength(32, ErrorMessage = "Password must be no more than 32 characters long")]
        public string Password { get; set; }
    }
	public class UniqueUsernameAttribute : ValidationAttribute
	{

		protected override ValidationResult IsValid(object value, ValidationContext validationContext)
		{
			var dbContext = (OnlineDictionaryContext)validationContext.GetService(typeof(OnlineDictionaryContext)); // Replace YourDbContext with your actual DbContext type
			var existingUser = dbContext.Users.FirstOrDefault(u => u.Username == value.ToString());

			if (existingUser != null)
			{
				return new ValidationResult("Username already exists.");
			}

			return ValidationResult.Success;
		}
	}
	public class UniqueEmailAttribute : ValidationAttribute
	{
		protected override ValidationResult IsValid(object value, ValidationContext validationContext)
		{
			var dbContext = (OnlineDictionaryContext)validationContext.GetService(typeof(OnlineDictionaryContext)); // Replace YourDbContext with your actual DbContext type
			var existingUser = dbContext.Users.FirstOrDefault(u => u.Email == value.ToString());

			if (existingUser != null)
			{
				return new ValidationResult("Email is already in use.");
			}

			return ValidationResult.Success;
		}
	}
}
