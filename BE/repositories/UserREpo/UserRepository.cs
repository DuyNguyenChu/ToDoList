using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BE.Models;
using Microsoft.EntityFrameworkCore;

namespace BE.repositories.UserRepo
{
    public class UserRepository : IUserRepository
    {
        private readonly ToDolistContext _context;
        public UserRepository(ToDolistContext context)
        {
            _context = context;
        }
        public async Task<IEnumerable<User>> GetAllAsync()
        {
            return await _context.Users
                .Include(u => u.Roles)
                .AsNoTracking()
                .ToListAsync();
        }
        public async Task<User?> GetByIdAsync(Guid id)
        {
            return await _context.Users
                .Include(u => u.Roles)
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserId == id);
        }
        public async Task AddAsync(User entity)
        {
            await _context.Users.AddAsync(entity);
        }
        public void Update(User entity)
        {
            entity.Roles = null!;
            _context.Users.Update(entity);
        }
        public void Remove(User entity)
        {
            entity.Roles = null!;
            var relatedToDos = _context.ToDoLists.Where(t => t.UserId == entity.UserId);
            _context.ToDoLists.RemoveRange(relatedToDos);
            _context.Users.Remove(entity);
        }
        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        public async Task<int> DowngradeExpiredRolesAsync()
        {
            var now = DateTime.UtcNow;
            var defaultUserRole = await _context.Roles.AsNoTracking().FirstOrDefaultAsync(r => r.RolesName == "User");
            if (defaultUserRole == null) return 0;

            var expiredUsers = await _context.Users
                .Where(u => u.UserRoleEndDate != null && u.UserRoleEndDate <= now && u.RolesId != defaultUserRole.RolesId)
                .ToListAsync();

            if (!expiredUsers.Any()) return 0;

            foreach (var user in expiredUsers)
            {
                user.RolesId = defaultUserRole.RolesId;
                user.UserRoleStartDate = now;
                user.UserRoleEndDate = null;
            }

            return await _context.SaveChangesAsync();
        }

        public async Task<bool> ExistsByEmailAsync(string email, Guid? excludeUserId = null)
        {
            if (string.IsNullOrWhiteSpace(email)) return false;
            var trimmed = email.Trim();
            var query = _context.Users.AsNoTracking().Where(u => u.UserEmail == trimmed);
            if (excludeUserId.HasValue)
            {
                query = query.Where(u => u.UserId != excludeUserId.Value);
            }
            return await query.AnyAsync();
        }

        public async Task<bool> ExistsByPhoneAsync(string phone, Guid? excludeUserId = null)
        {
            if (string.IsNullOrWhiteSpace(phone)) return false;
            var trimmed = phone.Trim();
            var query = _context.Users.AsNoTracking().Where(u => u.UserPhone == trimmed);
            if (excludeUserId.HasValue)
            {
                query = query.Where(u => u.UserId != excludeUserId.Value);
            }
            return await query.AnyAsync();
        }
    }
}