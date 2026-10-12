using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BE.Models;
using Microsoft.EntityFrameworkCore;

namespace BE.repositories.StoreRepo
{
    public class StoreRepository : IStoreRepository
    {
        private readonly ToDolistContext _context;
        public StoreRepository(ToDolistContext context)
        {
            _context = context;
        }
        public async Task<IEnumerable<Store>> GetAllAsync()
        {
            return await _context.Stores.AsNoTracking().ToListAsync();
        }
        public async Task<Store?> GetByIdAsync(Guid id)
        {
            return await _context.Stores.AsNoTracking().FirstOrDefaultAsync(x => x.StoreId == id);
        }
        
        public async Task<(IEnumerable<Store> Items, int TotalCount)> SearchAsync(string? keyword, int pageNumber, int pageSize)
        {
            var query = _context.Stores.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                var kw = keyword.Trim();
                query = query.Where(x => 
                    (x.StoreName != null && EF.Functions.ILike(EF.Functions.Unaccent(x.StoreName), $"%{EF.Functions.Unaccent(kw)}%")) ||
                    (x.StoreAddressInText != null && EF.Functions.ILike(EF.Functions.Unaccent(x.StoreAddressInText), $"%{EF.Functions.Unaccent(kw)}%"))
                );
            }

            int totalCount = await query.CountAsync();
            var items = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();

            return (items, totalCount);
        }
        public async Task AddAsync(Store entity)
        {
            await _context.Stores.AddAsync(entity);
        }
        public void Update(Store entity)
        {
            _context.Stores.Update(entity);
        }
        public async Task<bool> HasProductsAsync(Guid id)
        {
            return await _context.StoresItemsItemInformations.AnyAsync(x => x.StoreId == id);
        }
        public void Remove(Store entity)
        {
            _context.Stores.Remove(entity);
        }
        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}