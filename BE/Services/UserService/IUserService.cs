using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BE.DTOs.UserDto;

namespace BE.Services.UserService
{
    public interface IUserService
    {
        Task<IEnumerable<UserViewDto>> GetAllAsync();
        Task<UserViewDto?> GetByIdAsync(Guid id);
        Task<UserViewDto> CreateAsync(UserCreateDto dto);
        Task<bool> UpdateAsync(Guid id, UserUpdateInformationDto dto);
        Task<bool> DeleteAsync(Guid id);
        Task<(bool Success, string Message)> ChangePasswordAsync(Guid id, ChangePasswordDto dto);
        Task<(bool Success, string Message)> UpdateContactAsync(Guid id, UserUpdateContactDto dto);
        Task<bool> UpdateRoleAsync(Guid id, UserUpdateRoleDto dto);
    }
}