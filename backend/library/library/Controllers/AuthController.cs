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

        // Dependency Injection для доступу до бази та сервісу JWT
        public AuthController(LibraryDbContext context, IJwtService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        // POST: api/Auth/register
        [HttpPost("register")]
        public async Task<ActionResult> Register(UserRegisterDto request)
        {
            // 1. Перевірка на існування користувача
            if (await _context.Users.AnyAsync(u => u.Name == request.Name))
            {
                return BadRequest("Username is already taken.");
            }

            // 2. Хешування пароля (Використовуємо статичний PasswordHasher)
            PasswordHasher.CreatePasswordHash(
                request.Password,
                out byte[] passwordHash,
                out byte[] passwordSalt
            );

            // 3. Створення об'єкта користувача (використовуємо Name!)
            var user = new User
            {
                Name = request.Name,
                PasswordHash = passwordHash,
                PasswordSalt = passwordSalt,
                // Роль виключено для спрощення
            };

            // 4. Збереження в базу даних
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Повертаємо 201 Created
            return StatusCode(201, "User registered successfully. You can now log in.");
        }

        // POST: api/Auth/login
        [HttpPost("login")]
        public async Task<ActionResult<string>> Login(UserLoginDto request)
        {
            // 1. Пошук користувача (Використовуємо Name!)
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Name == request.Name);
            if (user == null)
            {
                // Не розкриваємо, що саме неправильно — логін чи пароль
                return BadRequest("Invalid username or password.");
            }

            // 2. Перевірка пароля (Використовуємо статичний PasswordHasher)
            if (!PasswordHasher.VerifyPasswordHash(request.Password, user.PasswordHash, user.PasswordSalt))
            {
                return BadRequest("Invalid username or password.");
            }

            // 3. Генерація JWT-токена
            string token = _jwtService.GenerateToken(user);

            // 4. Повернення токена клієнту
            return Ok(token);
        }
    }
}