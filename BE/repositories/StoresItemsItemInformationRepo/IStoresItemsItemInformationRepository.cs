using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BE.Models;

namespace BE.repositories.StoresItemsItemInformationRepo
{
    public interface IStoresItemsItemInformationRepository
    {
        Task<IEnumerable<StoresItemsItemInformation>> GetAllAsync();
        Task<StoresItemsItemInformation?> GetByIdAsync(Guid id);
        Task<IEnumerable<StoresItemsItemInformation>> GetByStoreIdAsync(Guid storeId, string? keyword = null);
        Task<(IEnumerable<StoresItemsItemInformation> Items, int TotalCount)> SearchAsync(string? keyword, int pageNumber, int pageSize);
        Task AddAsync(StoresItemsItemInformation entity);
        void Update(StoresItemsItemInformation entity);
        void Remove(StoresItemsItemInformation entity);
        Task SaveChangesAsync();
    }
}