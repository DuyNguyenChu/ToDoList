using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BE.Models;
namespace BE.repositories.ItemRepo
{
    public interface IItemRepository
    {
        Task<IEnumerable<Item>> GetAllAsync();
        Task<Item?> GetByIdAsync(Guid id);
        Task<(IEnumerable<Item> Items, int TotalCount)> SearchAsync(string? keyword, int pageNumber, int pageSize);
        Task AddAsync(Item entity);
        void Update(Item entity);
        void Remove(Item entity);
        Task SaveChangesAsync();
    }
}