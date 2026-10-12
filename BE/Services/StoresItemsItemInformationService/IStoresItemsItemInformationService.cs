using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BE.DTOs.StoresItemsItemInformationDto;
using BE.DTOs.Common;

namespace BE.Services.StoresItemsItemInformationService
{
    public interface IStoresItemsItemInformationService
    {
        Task<IEnumerable<StoresItemsItemInformationViewDto>> GetAllAsync(double? userLat = null, double? userLng = null);
        Task<StoresItemsItemInformationViewDto?> GetByIdAsync(Guid id);
        Task<IEnumerable<StoresItemsItemInformationViewDto>> GetByStoreIdAsync(Guid storeId, string? keyword = null);
        Task<PagedResult<StoresItemsItemInformationViewDto>> SearchAsync(string? keyword, int pageNumber, int pageSize, double? userLat = null, double? userLng = null);
        Task<StoresItemsItemInformationViewDto> CreateAsync(StoresItemsItemInformationCreateDto dto);
        Task<bool> UpdateAsync(Guid id, StoresItemsItemInformationUpdateDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}