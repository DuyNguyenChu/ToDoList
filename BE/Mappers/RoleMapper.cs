using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BE.Models;
using BE.DTOs.RoleDto;

namespace BE.Mappers
{
    public static class RoleMapper
    {
        public static RoleViewDto ViewEntityToDto(this Role entity)
        {
            if (entity == null) return null!;

            return new RoleViewDto 
            {
                RolesId = entity.RolesId,
                RolesName = entity.RolesName,
            };
        }

        public static Role CreateDtoToEntity(this RoleCreateDto dto)
        {
            if (dto == null) return null!;

            return new Role 
            {
                RolesName = dto.RolesName,
            };
        }

        public static void UpdateDtoToEntity(this Role entity, RoleUpdateDto dto)
        {
            if (entity == null || dto == null) return;

            entity.RolesName = dto.RolesName;
        }
    }
}