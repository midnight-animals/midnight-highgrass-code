using AutoMapper;
using online_dictionary.Data;
using online_dictionary.Models;
using online_dictionary.DTOs;
using Microsoft.AspNetCore.Identity;

namespace online_dictionary.Services
{
    public interface IUserService
    {
        Task<User> RegisterUserAsync(RegisterRequest registerRequest);
        Task<User?> LoginUserAsync(LoginRequest loginRequest);

	}
    public class UserService : IUserService
    {
        private readonly OnlineDictionaryContext _sqlContext;
        private readonly IMapper _mapper;
        public UserService(OnlineDictionaryContext context, IMapper mapper)
        {
            _sqlContext = context;
            _mapper = mapper;
        }
        public async Task<User> RegisterUserAsync(RegisterRequest registerRequest)
        {
            User user = _mapper.Map<User>(registerRequest);
            // Hash the password using PasswordHasher
            user.PasswordHash = new PasswordHasher<User>().HashPassword(user, registerRequest.Password);
            _sqlContext.Users.Add(user);
            await _sqlContext.SaveChangesAsync();
            return user;
        }
        public async Task<User?> LoginUserAsync(LoginRequest loginRequest) {
            string usernameOrEmail = loginRequest.UsernameOrEmail.ToString();
            Console.WriteLine(usernameOrEmail);
            User userToCheck = _sqlContext.Users
                .Where(user => user.Username == usernameOrEmail || user.Email == usernameOrEmail)
                .FirstOrDefault();
            if (userToCheck == null)
            {
                return null;
            }
            if (VerifyPasswordHash(userToCheck, loginRequest.Password, userToCheck.PasswordHash))
            {
                return userToCheck;
            }
            return null;
        }
        private bool VerifyPasswordHash(User user, string providedPassword, string? hashedPassword)
        {
            var passwordHasher = new PasswordHasher<User>();
            Console.WriteLine(providedPassword);
            var result = passwordHasher.VerifyHashedPassword(user, hashedPassword, providedPassword);
            Console.WriteLine(result);
			return result == PasswordVerificationResult.Success;
        }
    }
}
