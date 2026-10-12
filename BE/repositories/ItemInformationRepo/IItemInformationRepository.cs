using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BE.Models;

namespace BE.repositories.ItemInformationRepo
{
    public interface IItemInformationRepository
    {
        Task<IEnumerable<ItemInformation>> GetAllAsync();
        Task<ItemInformation?> GetByIdAsync(Guid id);
        Task<(IEnumerable<ItemInformation> Items, int TotalCount)> SearchAsync(string? keyword, int pageNumber, int pageSize);
        Task AddAsync(ItemInformation entity);
        void Update(ItemInformation entity);
        void Remove(ItemInformation entity);
        Task SaveChangesAsync();
    }
}