using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BE.Models;

namespace BE.repositories.UserRepo
{
    public interface IUserRepository
    {
        Task<IEnumerable<User>> GetAllAsync();
        Task<User?> GetByIdAsync(Guid id);
        Task AddAsync(User entity);
        void Update(User entity);
        void Remove(User entity);
        Task SaveChangesAsync();
        Task<int> DowngradeExpiredRolesAsync();
        Task<bool> ExistsByEmailAsync(string email, Guid? excludeUserId = null);
        Task<bool> ExistsByPhoneAsync(string phone, Guid? excludeUserId = null);
    }
}