using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BE.Models;

namespace BE.repositories.StoreRepo
{
    public interface IStoreRepository
    {
        Task<IEnumerable<Store>> GetAllAsync();
        Task<Store?> GetByIdAsync(Guid id);
        Task<(IEnumerable<Store> Items, int TotalCount)> SearchAsync(string? keyword, int pageNumber, int pageSize);
        Task AddAsync(Store entity);
        void Update(Store entity);
        Task<bool> HasProductsAsync(Guid id);
        void Remove(Store entity);
        Task SaveChangesAsync();
    }
}