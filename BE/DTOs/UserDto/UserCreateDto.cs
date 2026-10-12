using System;

namespace BE.DTOs.UserDto
{
    public class UserCreateDto
    {
        public string UserName { get; set; } = null!;
        public string? UserEmail { get; set; }
        public string? UserPhone { get; set; }
        public string UserPassword { get; set; } = null!;
        public double? UserAddressInGpsLatitude { get; set; }
        public double? UserAddressInGpsLongitude { get; set; }
        public string? UserAddressInText { get; set; }
        public bool? UserGender { get; set; }
    }
}