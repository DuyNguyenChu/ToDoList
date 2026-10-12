using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BE.Models;
using Microsoft.EntityFrameworkCore;

namespace BE.repositories.RoleRepo
{
    public class RoleRepository : IRoleRepository
    {
        private readonly ToDolistContext _context;
        public RoleRepository(ToDolistContext context)
        {
            _context = context;
        }
        public async Task<IEnumerable<Role>> GetAllAsync()
        {
            return await _context.Roles.AsNoTracking().ToListAsync();
        }
        public async Task<Role?> GetByIdAsync(Guid id)
        {
            return await _context.Roles.AsNoTracking().FirstOrDefaultAsync(x => x.RolesId == id);
        }
        public async Task AddAsync(Role entity)
        {
            await _context.Roles.AddAsync(entity);
        }
        public void Update(Role entity)
        {
            _context.Roles.Update(entity);
        }
        public void Remove(Role entity)
        {
            _context.Roles.Remove(entity);
        }
        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}