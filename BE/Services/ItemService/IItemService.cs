using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using BE.DTOs.ItemDto;
using BE.DTOs.Common;
using BE.Models;

namespace BE.Services.ItemService
{
    public interface IItemService
    {
        Task<IEnumerable<ItemViewDto>> GetAllAsync();
        Task<ItemViewDto?> GetByIdAsync(Guid id);
        Task<PagedResult<ItemViewDto>> SearchAsync(string? keyword, int pageNumber, int pageSize);
        Task<ItemViewDto> CreateAsync(ItemCreateDto dto);
        Task<bool> UpdateAsync(Guid id, ItemUpdateDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}