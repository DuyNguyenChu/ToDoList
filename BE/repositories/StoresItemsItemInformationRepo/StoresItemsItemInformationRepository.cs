using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BE.Models;
using Microsoft.EntityFrameworkCore;

namespace BE.repositories.StoresItemsItemInformationRepo
{
    public class StoresItemsItemInformationRepository : IStoresItemsItemInformationRepository
    {
        private readonly ToDolistContext _context;
        public StoresItemsItemInformationRepository(ToDolistContext context)
        {
            _context = context;
        }
        public async Task<IEnumerable<StoresItemsItemInformation>> GetAllAsync()
        {
            return await _context.StoresItemsItemInformations
                .Include(x => x.Item)
                .Include(x => x.Store)
                .Include(x => x.ItemInformation)
                .AsNoTracking()
                .ToListAsync();
        }
        public async Task<StoresItemsItemInformation?> GetByIdAsync(Guid id)
        {
            return await _context.StoresItemsItemInformations
                .Include(x => x.Item)
                .Include(x => x.Store)
                .Include(x => x.ItemInformation)
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.StoresItemsItemInformationId == id);
        }

        public async Task<IEnumerable<StoresItemsItemInformation>> GetByStoreIdAsync(Guid storeId, string? keyword = null)
        {
            var query = _context.StoresItemsItemInformations
                .Include(x => x.Item)
                .Include(x => x.Store)
                .Include(x => x.ItemInformation)
                .Where(x => x.StoreId == storeId)
                .AsNoTracking()
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                var kw = keyword.Trim();
                query = query.Where(x =>
                    (x.Item != null && x.Item.ItemName != null && EF.Functions.ILike(EF.Functions.Unaccent(x.Item.ItemName), $"%{EF.Functions.Unaccent(kw)}%")) ||
                    (x.ItemInformation != null && x.ItemInformation.ItemInformationItemType != null && EF.Functions.ILike(EF.Functions.Unaccent(x.ItemInformation.ItemInformationItemType), $"%{EF.Functions.Unaccent(kw)}%"))
                );
            }

            return await query.ToListAsync();
        }

        public async Task<(IEnumerable<StoresItemsItemInformation> Items, int TotalCount)> SearchAsync(string? keyword, int pageNumber, int pageSize)
        {
            var query = _context.StoresItemsItemInformations
                .Include(x => x.Item)
                .Include(x => x.Store)
                .Include(x => x.ItemInformation)
                .AsNoTracking()
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                var kw = keyword.Trim();
                query = query.Where(x => 
                    (x.Item != null && x.Item.ItemName != null && EF.Functions.ILike(EF.Functions.Unaccent(x.Item.ItemName), $"%{EF.Functions.Unaccent(kw)}%")) ||
                    (x.Store != null && x.Store.StoreName != null && EF.Functions.ILike(EF.Functions.Unaccent(x.Store.StoreName), $"%{EF.Functions.Unaccent(kw)}%")) ||
                    (x.ItemInformation != null && x.ItemInformation.ItemInformationItemType != null && EF.Functions.ILike(EF.Functions.Unaccent(x.ItemInformation.ItemInformationItemType), $"%{EF.Functions.Unaccent(kw)}%"))
                );
            }

            int totalCount = await query.CountAsync();
            var items = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();

            return (items, totalCount);
        }
        public async Task AddAsync(StoresItemsItemInformation entity)
        {
            await _context.StoresItemsItemInformations.AddAsync(entity);
        }
        public void Update(StoresItemsItemInformation entity)
        {
            _context.StoresItemsItemInformations.Update(entity);
        }
        public void Remove(StoresItemsItemInformation entity)
        {
            _context.StoresItemsItemInformations.Remove(entity);
        }
        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}