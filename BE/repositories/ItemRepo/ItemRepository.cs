using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BE.Models;
using Microsoft.EntityFrameworkCore;

namespace BE.repositories.ItemRepo
{
    public class ItemRepository : IItemRepository
    {
        private readonly ToDolistContext _context;
        public ItemRepository(ToDolistContext context)
        {
            _context = context;
        }
        public async Task<IEnumerable<Item>> GetAllAsync()
        {
            return await _context.Items.AsNoTracking().ToListAsync();
        }
        public async Task<Item?> GetByIdAsync(Guid id)
        {
            return await _context.Items.AsNoTracking().FirstOrDefaultAsync(x => x.ItemId == id);
        }
        public async Task<(IEnumerable<Item> Items, int TotalCount)> SearchAsync(string? keyword, int pageNumber, int pageSize)
        {
            var query = _context.Items.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                var trimmed = keyword.Trim();
                query = query.Where(x => x.ItemName != null && x.ItemName.Contains(trimmed));
            }

            int totalCount = await query.CountAsync();
            var items = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();

            return (items, totalCount);
        }
        public async Task AddAsync(Item entity)
        {
            await _context.Items.AddAsync(entity);
        }
        public void Update(Item entity)
        {
            _context.Items.Update(entity);
        }
        public void Remove(Item entity)
        {
            _context.Items.Remove(entity);
        }
        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}