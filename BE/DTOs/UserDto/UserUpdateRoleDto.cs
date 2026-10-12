using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BE.DTOs.UserDto
{
    public class UserUpdateRoleDto
    {
        public Guid UserId { get; set; }
        public Guid RolesId { get; set; }
        public DateTime? UserRoleStartDate { get; set; } = DateTime.Now;
        public DateTime? UserRoleEndDate { get; set; }
    }
}