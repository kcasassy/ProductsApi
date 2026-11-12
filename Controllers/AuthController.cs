using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using ProductsApi.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ProductsApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private static readonly List<User> _users = new();
        private static int _nextId = 1;

        private static readonly PasswordHasher<User> _hasher = new();

        private readonly IConfiguration _config;

        public AuthController(IConfiguration config)
        {
            _config = config;
        }

        public record AuthRequest(string Username, string Password);

        [HttpPost("register")]
        [AllowAnonymous]
        public IActionResult Register(AuthRequest req)
        {
            if (_users.Any(u =>
                u.Username.Equals(req.Username,
                    StringComparison.OrdinalIgnoreCase)))
            {
                return BadRequest("Username already taken.");
            }

            var user = new User
            {
                Id = _nextId++,
                Username = req.Username,
                Role = req.Username.Equals(
                    "admin", StringComparison.OrdinalIgnoreCase)
                    ? "Admin" : "User"
            };

            user.PasswordHash =
                _hasher.HashPassword(user, req.Password);

            _users.Add(user);

            return Created("", new
            {
                user.Id,
                user.Username
            });
        }

        // LOGIN
        [HttpPost("login")]
        [AllowAnonymous]
        public IActionResult Login(AuthRequest req)
        {
            var user = _users.FirstOrDefault(u =>
                u.Username.Equals(req.Username,
                    StringComparison.OrdinalIgnoreCase));

            if (user is null)
                return Unauthorized("Invalid credentials.");

            var check = _hasher.VerifyHashedPassword(
                user,
                user.PasswordHash,
                req.Password);

            if (check == PasswordVerificationResult.Failed)
                return Unauthorized("Invalid credentials.");

            return Ok(new
            {
                token = CreateToken(user)
            });
        }

        private string CreateToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(
                    ClaimTypes.NameIdentifier,
                    user.Id.ToString()),

                new Claim(
                    ClaimTypes.Name,
                    user.Username),

                new Claim(
                    ClaimTypes.Role,
                    user.Role)
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(
                    _config["Jwt:Key"]!));

            var creds = new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(
                    int.Parse(_config["Jwt:ExpiryMinutes"]!)),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler()
                .WriteToken(token);
        }
    }
}
