using library.Data;
using library.DTOs;
using library.Models;
using library.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace library.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // api/Auth
    public class AuthController : ControllerBase
    {
        private readonly LibraryDbContext _context;
        private readonly IJwtService _jwtService;

        public AuthController(LibraryDbContext context, IJwtService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        // POST: api/Auth/register
        [HttpPost("register")]
        public async Task<ActionResult> Register(UserRegisterDto request)
        {
            if (await _context.Users.AnyAsync(u => u.Name == request.Name))
            {
                return BadRequest("Username is already taken.");
            }

            PasswordHasher.CreatePasswordHash(
                request.Password,
                out byte[] passwordHash,
                out byte[] passwordSalt
            );

            var user = new User
            {
                Name = request.Name,
                PasswordHash = passwordHash,
                PasswordSalt = passwordSalt,
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return StatusCode(201, "User registered successfully. You can now log in.");
        }

        // POST: api/Auth/login
        [HttpPost("login")]
        public async Task<ActionResult<string>> Login(UserLoginDto request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Name == request.Name);
            if (user == null)
            {
                return BadRequest("Invalid username or password.");
            }

            if (!PasswordHasher.VerifyPasswordHash(request.Password, user.PasswordHash, user.PasswordSalt))
            {
                return BadRequest("Invalid username or password.");
            }

            string token = _jwtService.GenerateToken(user);

            return Ok(token);
        }
    }
}