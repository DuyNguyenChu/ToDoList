using System;
using System.Threading.Tasks;
using BE.DTOs.Authen;
using BE.Models;
using BE.repositories.Authen;
using BCrypt.Net;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;

namespace BE.Services.AuthenService
{
    public class AuthenService : IAuthenService
    {
        private readonly IAuthenRepository _authenRepository;
        private readonly IConfiguration _configuration;

        public AuthenService(IAuthenRepository authenRepository, IConfiguration configuration)
        {
            _authenRepository = authenRepository;
            _configuration = configuration;
        }

        public async Task<(string Token, string Role, string UserName, Guid UserId)> LoginAsync(LoginDto loginDto)
        {
            var user = await _authenRepository.GetUserByEmailOrPhoneAsync(loginDto.EmailPhone);
            if (user == null)
            {
                throw new Exception("Thông tin xác thực không hợp lệ");
            }

            if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, user.UserPassword))
            {
                throw new Exception("Thông tin xác thực không hợp lệ");
            }

            if (user.UserRoleEndDate.HasValue && user.UserRoleEndDate.Value <= DateTime.UtcNow)
            {
                var currentRole = user.Roles?.RolesName;
                if (!string.Equals(currentRole, "User", StringComparison.OrdinalIgnoreCase))
                {
                    var defaultRole = await _authenRepository.GetDefaultRoleAsync("User");
                    if (defaultRole != null)
                    {
                        user.RolesId = defaultRole.RolesId;
                        user.Roles = defaultRole;
                        user.UserRoleStartDate = DateTime.UtcNow;
                        user.UserRoleEndDate = null;
                        await _authenRepository.SaveChangesAsync();
                    }
                }
            }

            var token = GenerateJwtAccessToken(user);
            var role = user.Roles?.RolesName ?? "User";
            return (token, role, user.UserName, user.UserId);
        }

        public async Task<bool> RegisterAsync(RegisterDto registerDto)
        {
            var email = string.IsNullOrWhiteSpace(registerDto.UserEmail) ? null : registerDto.UserEmail.Trim();
            var phone = string.IsNullOrWhiteSpace(registerDto.UserPhone) ? null : registerDto.UserPhone.Trim();

            if (string.IsNullOrEmpty(email) && string.IsNullOrEmpty(phone))
            {
                throw new Exception("Phải cung cấp email hoặc số điện thoại.");
            }

            if (!string.IsNullOrEmpty(email) && await _authenRepository.CheckEmailExistsAsync(email))
            {
                throw new Exception("Email này đã được sử dụng bởi một tài khoản khác.");
            }

            if (!string.IsNullOrEmpty(phone) && await _authenRepository.CheckPhoneExistsAsync(phone))
            {
                throw new Exception("Số điện thoại này đã được sử dụng bởi một tài khoản khác.");
            }

            var defaultRole = await _authenRepository.GetDefaultRoleAsync("User");
            if (defaultRole == null)
            {
                throw new Exception("Không tìm thấy vai trò mặc định");
            }

            var user = new User
            {
                UserId = Guid.NewGuid(),
                RolesId = defaultRole.RolesId,
                UserName = registerDto.UserName?.Trim() ?? string.Empty,
                UserEmail = email,
                UserPhone = phone,
                UserPassword = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
                UserCreateDate = DateTime.UtcNow,
                IsOnline = false
            };

            await _authenRepository.RegisterAsync(user);
            return true;
        }

        private string GenerateJwtAccessToken(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["Secret"] ?? throw new Exception("Lỗi nghiêm trọng: Thiếu SecretKey trong appsettings.json!");
            
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.UserEmail ?? string.Empty),
                new Claim(JwtRegisteredClaimNames.PhoneNumber, user.UserPhone ?? string.Empty),
                new Claim("UserName", user.UserName),
                new Claim(ClaimTypes.Role, user.Roles?.RolesName ?? "User")
            };

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"] ?? "MyAuthServer",
                audience: jwtSettings["Audience"] ?? "MyAuthClient",
                claims: claims,
                expires: DateTime.UtcNow.AddHours(12),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}