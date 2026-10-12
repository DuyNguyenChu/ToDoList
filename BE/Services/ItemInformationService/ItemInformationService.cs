using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BE.DTOs.ItemInformationDto;
using BE.DTOs.Common;
using BE.Mappers;
using BE.repositories.ItemInformationRepo;

namespace BE.Services.ItemInformationService
{
    public class ItemInformationService : IItemInformationService
    {
        private readonly IItemInformationRepository _repository;
        public ItemInformationService(IItemInformationRepository repository)
        {
            _repository = repository;
        }
        public async Task<IEnumerable<ItemInformationViewDto>> GetAllAsync()
        {
            var entity = await _repository.GetAllAsync();
            return entity.Select(i => i.ViewEntityToDto());
        }
        public async Task<ItemInformationViewDto?> GetByIdAsync(Guid id)
        {
            var entity = await _repository.GetByIdAsync(id);
            return entity?.ViewEntityToDto();
        }
        public async Task<PagedResult<ItemInformationViewDto>> SearchAsync(string? keyword, int pageNumber, int pageSize)
        {
            var result = await _repository.SearchAsync(keyword, pageNumber, pageSize);
            return new PagedResult<ItemInformationViewDto>
            {
                Items = result.Items.Select(i => i.ViewEntityToDto()),
                TotalCount = result.TotalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }
        public async Task<ItemInformationViewDto> CreateAsync(ItemInformationCreateDto dto)
        {
            var entity = dto.CreateDtoToEntity();
            await _repository.AddAsync(entity);
            await _repository.SaveChangesAsync();
            return entity.ViewEntityToDto();
        }
        public async Task<bool> UpdateAsync(Guid id, ItemInformationUpdateDto dto)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return false;
            existing.UpdateDtoToEntity(dto);
            _repository.Update(existing);
            await _repository.SaveChangesAsync();
            return true;
        }
        public async Task<bool> DeleteAsync(Guid id)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return false;
            _repository.Remove(existing);
            await _repository.SaveChangesAsync();
            return true;
        }
    }
}