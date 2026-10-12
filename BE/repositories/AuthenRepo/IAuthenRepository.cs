using System;
using System.Threading.Tasks;
using BE.Models;

namespace BE.repositories.Authen
{
    public interface IAuthenRepository
    {
        Task<bool> CheckEmailPhoneExistsAsync(string emailPhone);
        Task<bool> CheckEmailExistsAsync(string email);
        Task<bool> CheckPhoneExistsAsync(string phone);
        Task<User> RegisterAsync(User user);
        Task<User?> GetUserByEmailOrPhoneAsync(string emailPhone);
        Task<Role?> GetDefaultRoleAsync(string roleName);
        Task<int> SaveChangesAsync();
    }
}