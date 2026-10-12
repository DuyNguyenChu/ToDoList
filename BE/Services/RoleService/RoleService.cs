using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BE.DTOs.RoleDto;
using BE.Mappers;
using BE.repositories.RoleRepo;

namespace BE.Services.RoleService
{
    public class RoleService : IRoleService
    {
        private readonly IRoleRepository _repository;
        public RoleService(IRoleRepository repository)
        {
            _repository = repository;
        }
        public async Task<IEnumerable<RoleViewDto>> GetAllAsync()
        {
            var entity = await _repository.GetAllAsync();
            return entity.Select(i => i.ViewEntityToDto());
        }
        public async Task<RoleViewDto?> GetByIdAsync(Guid id)
        {
            var entity = await _repository.GetByIdAsync(id);
            return entity?.ViewEntityToDto();
        }
        public async Task<RoleViewDto> CreateAsync(RoleCreateDto dto)
        {
            var entity = dto.CreateDtoToEntity();
            await _repository.AddAsync(entity);
            await _repository.SaveChangesAsync();
            return entity.ViewEntityToDto();
        }
        public async Task<bool> UpdateAsync(Guid id, RoleUpdateDto dto)
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