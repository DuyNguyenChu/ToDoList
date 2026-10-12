using System;
using BE.Models;
using BE.DTOs.UserDto;

namespace BE.Mappers
{
    public static class UserMapper
    {
        public static UserViewDto ViewEntityToDto(this User entity)
        {
            if (entity == null) return null!;

            return new UserViewDto 
            {
                UserId = entity.UserId,
                RolesId = entity.RolesId,
                RoleName = entity.Roles?.RolesName ?? string.Empty,
                UserImg = entity.UserImg,
                UserName = entity.UserName,
                UserEmail = entity.UserEmail ?? string.Empty,
                UserPhone = entity.UserPhone ?? string.Empty,
                UserAddressInGpsLatitude = entity.UserAddressInGpslatitude,
                UserAddressInGpsLongitude = entity.UserAddressInGpslongitude,
                UserAddressInText = entity.UserAddressInText,
                UserGender = entity.UserGender,
                UserCreateDate = entity.UserCreateDate,
                UserRoleStartDate = entity.UserRoleStartDate,
                UserRoleEndDate = entity.UserRoleEndDate,
                IsOnline = entity.IsOnline,
            };
        }

        public static User CreateDtoToEntity(this UserCreateDto dto)
        {
            if (dto == null) return null!;

            return new User 
            {
                UserName = dto.UserName,
                UserEmail = dto.UserEmail,
                UserPhone = dto.UserPhone,
                UserPassword = dto.UserPassword,
                UserAddressInGpslatitude = dto.UserAddressInGpsLatitude,
                UserAddressInGpslongitude = dto.UserAddressInGpsLongitude,
                UserAddressInText = dto.UserAddressInText,
                UserGender = dto.UserGender,
                UserCreateDate = DateTime.UtcNow,
                IsOnline = false,
            };
        }

        public static void UpdateDtoToEntity_Information(this User entity, UserUpdateInformationDto dto)
        {
            if (entity == null || dto == null) return;

            entity.UserImg = dto.UserImg;
            entity.UserName = dto.UserName;
            entity.UserAddressInGpslatitude = dto.UserAddressInGpsLatitude;
            entity.UserAddressInGpslongitude = dto.UserAddressInGpsLongitude;
            entity.UserAddressInText = dto.UserAddressInText;
            entity.UserGender = dto.UserGender;
        }

        public static void UpdateDtoToEntity_Role(this User entity, UserUpdateRoleDto dto)
        {
            if (entity == null || dto == null) return;

            entity.RolesId = dto.RolesId;
            entity.UserRoleStartDate = dto.UserRoleStartDate ?? DateTime.UtcNow;
            entity.UserRoleEndDate = dto.UserRoleEndDate;
        }
    }
}