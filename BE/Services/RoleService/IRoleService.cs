using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BE.DTOs.RoleDto;

namespace BE.Services.RoleService
{
    public interface IRoleService
    {
        Task<IEnumerable<RoleViewDto>> GetAllAsync();
        Task<RoleViewDto?> GetByIdAsync(Guid id);
        Task<RoleViewDto> CreateAsync(RoleCreateDto dto);
        Task<bool> UpdateAsync(Guid id, RoleUpdateDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}