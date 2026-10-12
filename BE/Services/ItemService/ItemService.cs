using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using BE.DTOs.ItemDto;
using BE.DTOs.Common;
using BE.Mappers;
using BE.repositories.ItemRepo;

namespace BE.Services.ItemService
{
    public class ItemService : IItemService
    {
        private readonly IItemRepository _Repository;
        public ItemService(IItemRepository Repository)
        {
            _Repository = Repository;
        }
        public async Task<IEnumerable<ItemViewDto>> GetAllAsync()
        {
            var entity = await _Repository.GetAllAsync();
            return entity.Select(i => i.ViewEntityToDto());
        }
        public async Task<ItemViewDto?> GetByIdAsync(Guid id)
        {
            var entity = await _Repository.GetByIdAsync(id);
            return entity?.ViewEntityToDto();
        }
        public async Task<PagedResult<ItemViewDto>> SearchAsync(string? keyword, int pageNumber, int pageSize)
        {
            var result = await _Repository.SearchAsync(keyword, pageNumber, pageSize);
            return new PagedResult<ItemViewDto>
            {
                Items = result.Items.Select(i => i.ViewEntityToDto()),
                TotalCount = result.TotalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }
        public async Task<ItemViewDto> CreateAsync(ItemCreateDto dto)
        {
            var entity = dto.CreateDtoToEntity();
            await _Repository.AddAsync(entity);
            await _Repository.SaveChangesAsync();
            return entity.ViewEntityToDto();
        }
        public async Task<bool> UpdateAsync(Guid id, ItemUpdateDto dto)
        {
            var existing = await _Repository.GetByIdAsync(id);
            if (existing == null) return false;
            existing.UpdateDtoToEntity(dto);
            _Repository.Update(existing);
            await _Repository.SaveChangesAsync();
            return true;
        }
        public async Task<bool> DeleteAsync(Guid id)
        {
            var existing = await _Repository.GetByIdAsync(id);
            if (existing == null) return false;
            _Repository.Remove(existing);
            await _Repository.SaveChangesAsync();
            return true;
        }
    }
}