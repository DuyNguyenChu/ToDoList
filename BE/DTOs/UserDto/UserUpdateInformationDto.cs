using System;

namespace BE.DTOs.UserDto
{
    public class UserUpdateInformationDto
    {
        public Guid UserId { get; set; }
        public string? UserImg { get; set; }
        public string UserName { get; set; } = null!;
        public double? UserAddressInGpsLatitude { get; set; }
        public double? UserAddressInGpsLongitude { get; set; }
        public string? UserAddressInText { get; set; }
        public bool? UserGender { get; set; }
    }
}