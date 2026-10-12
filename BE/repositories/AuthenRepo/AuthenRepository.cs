using System;
using System.Threading.Tasks;
using BE.Models;
using Microsoft.EntityFrameworkCore;

namespace BE.repositories.Authen
{
    public class AuthenRepository : IAuthenRepository
    {
        private readonly ToDolistContext _context;

        public AuthenRepository(ToDolistContext context)
        {
            _context = context;
        }

        public async Task<bool> CheckEmailPhoneExistsAsync(string emailPhone)
        {
            return await _context.Users.AsNoTracking().AnyAsync(u => u.UserEmail == emailPhone || u.UserPhone == emailPhone);
        }

        public async Task<bool> CheckEmailExistsAsync(string email)
        {
            return await _context.Users.AsNoTracking().AnyAsync(u => u.UserEmail == email);
        }

        public async Task<bool> CheckPhoneExistsAsync(string phone)
        {
            return await _context.Users.AsNoTracking().AnyAsync(u => u.UserPhone == phone);
        }

        public async Task<User?> GetUserByEmailOrPhoneAsync(string emailPhone)
        {
            return await _context.Users
                .Include(u => u.Roles)
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserEmail == emailPhone || u.UserPhone == emailPhone);
        }

        public async Task<User> RegisterAsync(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<Role?> GetDefaultRoleAsync(string roleName)
        {
            return await _context.Roles.AsNoTracking().FirstOrDefaultAsync(r => r.RolesName == roleName);
        }

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }
    }
}