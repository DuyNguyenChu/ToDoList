using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BE.DTOs.Authen
{
    public class LoginDto
    {
        public string EmailPhone { get; set; } = null!;
        public string Password { get; set; } = null!;
    }
}