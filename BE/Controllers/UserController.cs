using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Mvc;
using BE.Services.UserService;
using BE.DTOs.UserDto;

namespace BE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _service;

        public UserController(IUserService service)
        {
            _service = service;
        }

        private async Task<Guid?> GetCurrentUserIdAsync()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? User.FindFirst("sub")?.Value
                    ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            if (Guid.TryParse(claim, out var id)) return id;

            try
            {
                var authResult = await HttpContext.AuthenticateAsync(JwtBearerDefaults.AuthenticationScheme);
                if (authResult.Succeeded && authResult.Principal != null)
                {
                    claim = authResult.Principal.FindFirst(ClaimTypes.NameIdentifier)?.Value
                        ?? authResult.Principal.FindFirst("sub")?.Value
                        ?? authResult.Principal.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
                    if (Guid.TryParse(claim, out var authId)) return authId;
                }
            }
            catch
            {
            }

            if (Request.Headers.TryGetValue("Authorization", out var authHeader))
            {
                var headerVal = authHeader.ToString();
                if (headerVal.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                {
                    var tokenStr = headerVal.Substring(7).Trim();
                    var idFromToken = ExtractUserIdFromToken(tokenStr);
                    if (idFromToken.HasValue) return idFromToken;
                }
            }

            if (Request.Cookies.TryGetValue("jwt", out var cookieToken) && !string.IsNullOrEmpty(cookieToken))
            {
                var idFromCookie = ExtractUserIdFromToken(cookieToken);
                if (idFromCookie.HasValue) return idFromCookie;
            }

            return null;
        }

        private Guid? ExtractUserIdFromToken(string tokenStr)
        {
            try
            {
                var handler = new JwtSecurityTokenHandler();
                if (handler.CanReadToken(tokenStr))
                {
                    var jwt = handler.ReadJwtToken(tokenStr);
                    var claim = jwt.Claims.FirstOrDefault(c =>
                        c.Type == ClaimTypes.NameIdentifier ||
                        c.Type == "sub" ||
                        c.Type == JwtRegisteredClaimNames.Sub ||
                        c.Type == "UserId" ||
                        c.Type == "id"
                    )?.Value;
                    if (Guid.TryParse(claim, out var id)) return id;
                }
            }
            catch
            {
            }
            return null;
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetMe([FromQuery] Guid? userId)
        {
            var currentId = await GetCurrentUserIdAsync();
            var targetId = currentId ?? userId;
            if (!targetId.HasValue) return Unauthorized(new { message = "Chưa đăng nhập hoặc phiên đã hết hạn." });
            var user = await _service.GetByIdAsync(targetId.Value);
            if (user == null) return NotFound(new { message = "Không tìm thấy người dùng." });
            return Ok(user);
        }

        [HttpPut("me")]
        public async Task<IActionResult> UpdateMe([FromBody] UserUpdateInformationDto dto, [FromQuery] Guid? userId)
        {
            var currentId = await GetCurrentUserIdAsync();
            var targetId = currentId ?? (dto.UserId != Guid.Empty ? dto.UserId : userId);
            if (!targetId.HasValue || targetId.Value == Guid.Empty) return Unauthorized(new { message = "Chưa đăng nhập hoặc phiên đã hết hạn." });
            if (!ModelState.IsValid) return BadRequest(ModelState);
            dto.UserId = targetId.Value;
            var success = await _service.UpdateAsync(targetId.Value, dto);
            if (!success) return NotFound();
            return Ok(new { message = "Cập nhật thông tin thành công." });
        }

        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto, [FromQuery] Guid? userId)
        {
            var currentId = await GetCurrentUserIdAsync();
            var targetId = currentId ?? userId;
            if (!targetId.HasValue) return Unauthorized(new { message = "Chưa đăng nhập hoặc phiên đã hết hạn." });
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var result = await _service.ChangePasswordAsync(targetId.Value, dto);
            if (!result.Success) return BadRequest(new { message = result.Message });
            return Ok(new { message = result.Message });
        }

        [HttpPost("{id}/change-password")]
        public async Task<IActionResult> ChangePasswordById(Guid id, [FromBody] ChangePasswordDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var result = await _service.ChangePasswordAsync(id, dto);
            if (!result.Success) return BadRequest(new { message = result.Message });
            return Ok(new { message = result.Message });
        }

        [HttpPut("contact")]
        public async Task<IActionResult> UpdateContact([FromBody] UserUpdateContactDto dto, [FromQuery] Guid? userId)
        {
            var currentId = await GetCurrentUserIdAsync();
            var targetId = currentId ?? userId;
            if (!targetId.HasValue) return Unauthorized(new { message = "Chưa đăng nhập hoặc phiên đã hết hạn." });
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var result = await _service.UpdateContactAsync(targetId.Value, dto);
            if (!result.Success) return BadRequest(new { message = result.Message });
            return Ok(new { message = result.Message });
        }

        [HttpPut("{id}/contact")]
        public async Task<IActionResult> UpdateContactById(Guid id, [FromBody] UserUpdateContactDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var result = await _service.UpdateContactAsync(id, dto);
            if (!result.Success) return BadRequest(new { message = result.Message });
            return Ok(new { message = result.Message });
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var entity = await _service.GetAllAsync();
            return Ok(entity);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var entity = await _service.GetByIdAsync(id);
            if (entity == null) return NotFound();
            return Ok(entity);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] UserCreateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var result = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.UserId }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UserUpdateInformationDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            dto.UserId = id;
            var success = await _service.UpdateAsync(id, dto);
            if (!success) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var success = await _service.DeleteAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }

        [HttpPut("{id}/role")]
        public async Task<IActionResult> UpdateRole(Guid id, [FromBody] UserUpdateRoleDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            dto.UserId = id;
            var success = await _service.UpdateRoleAsync(id, dto);
            if (!success) return NotFound(new { message = "Không tìm thấy người dùng." });
            return Ok(new { message = "Cập nhật vai trò thành công." });
        }
    }
}
