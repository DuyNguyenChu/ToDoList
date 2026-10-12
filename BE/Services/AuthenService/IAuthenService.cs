using System;
using System.Threading.Tasks;
using BE.DTOs.Authen;

namespace BE.Services.AuthenService
{
    public interface IAuthenService
    {
        Task<(string Token, string Role, string UserName, Guid UserId)> LoginAsync(LoginDto loginDto);
        Task<bool> RegisterAsync(RegisterDto registerDto);
    }
}