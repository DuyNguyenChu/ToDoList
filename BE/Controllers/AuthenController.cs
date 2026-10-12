using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using BE.DTOs.Authen;
using BE.Services.AuthenService;

namespace BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthenController : ControllerBase
    {
        private readonly IAuthenService _authenService;

        public AuthenController(IAuthenService authenService)
        {
            _authenService = authenService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var (token, role, userName, userId) = await _authenService.LoginAsync(loginDto);

                if (string.IsNullOrEmpty(token))
                {
                    return Unauthorized(new { Message = "Thông tin xác thực không hợp lệ" });
                }

                var cookieOptions = new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.None,
                    Path = "/",
                    Expires = DateTime.UtcNow.AddHours(12)
                };
                Response.Cookies.Append("jwt", token, cookieOptions);

                return Ok(new
                {
                    Message = "Đăng nhập thành công",
                    Role = role,
                    UserName = userName,
                    UserId = userId,
                    Token = token
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("jwt", new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Path = "/"
            });
            return Ok(new { Message = "Đăng xuất thành công" });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var result = await _authenService.RegisterAsync(registerDto);
                if (result)
                {
                    return Ok(new { Message = "Đăng ký thành công" });
                }
                return BadRequest(new { Message = "Đăng ký thất bại" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }
    }
}