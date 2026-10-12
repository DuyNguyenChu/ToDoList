using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BE.DTOs.StoreDto;
using BE.DTOs.Common;

namespace BE.Services.StoreService
{
    public interface IStoreService
    {
        Task<IEnumerable<StoreViewDto>> GetAllAsync(double? userLat = null, double? userLng = null);
        Task<StoreViewDto?> GetByIdAsync(Guid id);
        Task<PagedResult<StoreViewDto>> SearchAsync(string? keyword, int pageNumber, int pageSize, double? userLat = null, double? userLng = null);
        Task<StoreViewDto> CreateAsync(StoreCreateDto dto);
        Task<bool> UpdateAsync(Guid id, StoreUpdateDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}