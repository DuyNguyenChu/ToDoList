using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BE.DTOs.RoleDto
{
    public class RoleViewDto
    {
        public Guid RolesId { get; set; }
        public string RolesName { get; set; } = null!;
    }
}