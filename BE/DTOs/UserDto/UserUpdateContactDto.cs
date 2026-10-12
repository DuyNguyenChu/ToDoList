using System.ComponentModel.DataAnnotations;

namespace BE.DTOs.UserDto
{
    public class UserUpdateContactDto
    {
        [EmailAddress(ErrorMessage = "Email không đúng định dạng.")]
        public string? UserEmail { get; set; }

        public string? UserPhone { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập mật khẩu hiện tại để xác nhận.")]
        public string CurrentPassword { get; set; } = null!;
    }
}
