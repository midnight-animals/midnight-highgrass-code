using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using online_dictionary.DTOs;
using online_dictionary.Models;
using online_dictionary.Services;

namespace online_dictionary.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : Controller
    {
        private readonly IUserService _userService;
        private readonly IMapper _mapper;
        public AuthController(IUserService userService, IMapper mapper) { 
            _userService = userService;
            _mapper = mapper;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest registerRequest)
        {
            try
            {
                User user = await _userService.RegisterUserAsync(registerRequest);
                return Ok(_mapper.Map<UserDto>(user));
            } catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
                return StatusCode(500, "An error occurred while processing your request.");
			}
		}

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest loginRequest)
        {
            try
            {
                User? user = await _userService.LoginUserAsync(loginRequest);
                if (user == null)
                {
                    return BadRequest("Login failed");
                }
                return Ok(user);
            } catch (Exception ex)
            {
                Console.WriteLine($"Error {ex.ToString()}");
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }
    }
}
