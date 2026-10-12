using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BE.Models;
using Microsoft.EntityFrameworkCore;

namespace BE.repositories.ToDoListRepo
{
    public class ToDoListRepository : IToDoListRepository
    {
        private readonly ToDolistContext _context;
        public ToDoListRepository(ToDolistContext context)
        {
            _context = context;
        }
        public async Task<IEnumerable<ToDoList>> GetAllAsync()
        {
            return await _context.ToDoLists
                .Include(t => t.StoresItemsItemInformation)
                    .ThenInclude(s => s.Item)
                .Include(t => t.StoresItemsItemInformation)
                    .ThenInclude(s => s.Store)
                .Include(t => t.StoresItemsItemInformation)
                    .ThenInclude(s => s.ItemInformation)
                .AsNoTracking()
                .ToListAsync();
        }
        public async Task<ToDoList?> GetByIdAsync(Guid id)
        {
            return await _context.ToDoLists
                .Include(t => t.StoresItemsItemInformation)
                    .ThenInclude(s => s.Item)
                .Include(t => t.StoresItemsItemInformation)
                    .ThenInclude(s => s.Store)
                .Include(t => t.StoresItemsItemInformation)
                    .ThenInclude(s => s.ItemInformation)
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.ToDoListId == id);
        }

        public async Task<(IEnumerable<ToDoList> Items, int TotalCount)> SearchAsync(string? keyword, int pageNumber, int pageSize)
        {
            var query = _context.ToDoLists
                .Include(t => t.StoresItemsItemInformation)
                    .ThenInclude(s => s.Item)
                .Include(t => t.StoresItemsItemInformation)
                    .ThenInclude(s => s.Store)
                .Include(t => t.StoresItemsItemInformation)
                    .ThenInclude(s => s.ItemInformation)
                .AsNoTracking()
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                var kw = keyword.Trim();
                query = query.Where(x => 
                    (x.StoresItemsItemInformation != null && x.StoresItemsItemInformation.Item != null && x.StoresItemsItemInformation.Item.ItemName.Contains(kw)) ||
                    (x.StoresItemsItemInformation != null && x.StoresItemsItemInformation.Store != null && x.StoresItemsItemInformation.Store.StoreName.Contains(kw)) ||
                    (x.StoresItemsItemInformation != null && x.StoresItemsItemInformation.ItemInformation != null && x.StoresItemsItemInformation.ItemInformation.ItemInformationItemType.Contains(kw)) ||
                    (x.ToDoListDecription != null && x.ToDoListDecription.Contains(kw))
                );
            }

            int totalCount = await query.CountAsync();
            var items = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();

            return (items, totalCount);
        }
        public async Task AddAsync(ToDoList entity)
        {
            await _context.ToDoLists.AddAsync(entity);
        }
        public void Update(ToDoList entity)
        {
            _context.ToDoLists.Update(entity);
        }
        public void Remove(ToDoList entity)
        {
            _context.ToDoLists.Remove(entity);
        }
        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}