using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BE.DTOs.ItemInformationDto;
using BE.DTOs.Common;

namespace BE.Services.ItemInformationService
{
    public interface IItemInformationService
    {
        Task<IEnumerable<ItemInformationViewDto>> GetAllAsync();
        Task<ItemInformationViewDto?> GetByIdAsync(Guid id);
        Task<PagedResult<ItemInformationViewDto>> SearchAsync(string? keyword, int pageNumber, int pageSize);
        Task<ItemInformationViewDto> CreateAsync(ItemInformationCreateDto dto);
        Task<bool> UpdateAsync(Guid id, ItemInformationUpdateDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}