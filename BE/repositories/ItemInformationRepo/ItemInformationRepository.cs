using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BE.Models;
using Microsoft.EntityFrameworkCore;

namespace BE.repositories.ItemInformationRepo
{
    public class ItemInformationRepository : IItemInformationRepository
    {
        private readonly ToDolistContext _context;
        public ItemInformationRepository(ToDolistContext context)
        {
            _context = context;
        }
        public async Task<IEnumerable<ItemInformation>> GetAllAsync()
        {
            return await _context.ItemInformations.AsNoTracking().ToListAsync();
        }
        public async Task<ItemInformation?> GetByIdAsync(Guid id)
        {
            return await _context.ItemInformations.AsNoTracking().FirstOrDefaultAsync(x => x.ItemInformationId == id);
        }
        public async Task<(IEnumerable<ItemInformation> Items, int TotalCount)> SearchAsync(string? keyword, int pageNumber, int pageSize)
        {
            var query = _context.ItemInformations.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                string trimmed = keyword.Trim();
                string cleanNum = trimmed.Replace(" ", "").Replace(".", "").Replace(",", "");

                query = query.Where(x =>
                    (x.ItemInformationItemType != null && EF.Functions.ILike(EF.Functions.Unaccent(x.ItemInformationItemType), $"%{EF.Functions.Unaccent(trimmed)}%")) ||
                    x.ItemInformationPrice.ToString().Contains(cleanNum) ||
                    x.ItemInformationPrice.ToString().Contains(trimmed)
                );
            }

            int totalCount = await query.CountAsync();
            var items = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();

            return (items, totalCount);
        }
        public async Task AddAsync(ItemInformation entity)
        {
            await _context.ItemInformations.AddAsync(entity);
        }
        public void Update(ItemInformation entity)
        {
            _context.ItemInformations.Update(entity);
        }
        public void Remove(ItemInformation entity)
        {
            _context.ItemInformations.Remove(entity);
        }
        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}