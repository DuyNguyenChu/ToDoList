using System;

namespace BE.DTOs.UserDto
{
    public class UserViewDto
    {
        public Guid UserId { get; set; }
        public Guid RolesId { get; set; }
        public string RoleName { get; set; } = null!;
        public string? UserImg { get; set; }
        public string UserName { get; set; } = null!;
        public string UserEmail { get; set; } = null!;
        public string UserPhone { get; set; } = null!;
        public double? UserAddressInGpsLatitude { get; set; }
        public double? UserAddressInGpsLongitude { get; set; }
        public string? UserAddressInText { get; set; }
        public bool? UserGender { get; set; }
        public DateTime UserCreateDate { get; set; }
        public DateTime? UserRoleStartDate { get; set; }
        public DateTime? UserRoleEndDate { get; set; }
        public bool IsOnline { get; set; }
    }
}