using System.ComponentModel.DataAnnotations;

namespace BE.DTOs.Authen
{
    public class RegisterDto
    {
        public string UserName { get; set; } = null!;
        public string? UserEmail { get; set; }
        public string? UserPhone { get; set; }
        public string Password { get; set; } = null!;
    }
}
