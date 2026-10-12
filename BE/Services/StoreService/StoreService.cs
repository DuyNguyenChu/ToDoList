using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BE.DTOs.StoreDto;
using BE.DTOs.Common;
using BE.Mappers;
using BE.repositories.StoreRepo;
using BE.Helpers;

namespace BE.Services.StoreService
{
    public class StoreService : IStoreService
    {
        private readonly IStoreRepository _repository;
        public StoreService(IStoreRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<StoreViewDto>> GetAllAsync(double? userLat = null, double? userLng = null)
        {
            var entity = await _repository.GetAllAsync();
            var dtos = entity.Select(i => i.ViewEntityToDto()).ToList();

            if (userLat.HasValue && userLng.HasValue)
            {
                foreach (var dto in dtos)
                {
                    dto.DistanceKm = GeoHelper.CalculateDistanceKm(userLat, userLng, dto.StoreAddressInGpsLatitude, dto.StoreAddressInGpsLongitude);
                }

                return dtos.OrderBy(s => s.DistanceKm.HasValue ? 0 : 1)
                           .ThenBy(s => s.DistanceKm)
                           .ThenBy(s => s.StoreName);
            }

            return dtos;
        }

        public async Task<StoreViewDto?> GetByIdAsync(Guid id)
        {
            var entity = await _repository.GetByIdAsync(id);
            return entity?.ViewEntityToDto();
        }

        public async Task<PagedResult<StoreViewDto>> SearchAsync(string? keyword, int pageNumber, int pageSize, double? userLat = null, double? userLng = null)
        {
            if (pageSize > 100) pageSize = 100;
            if (pageSize < 1) pageSize = 10;
            if (pageNumber < 1) pageNumber = 1;

            var result = await _repository.SearchAsync(keyword, pageNumber, pageSize);
            var dtos = result.Items.Select(i => i.ViewEntityToDto()).ToList();

            if (userLat.HasValue && userLng.HasValue)
            {
                foreach (var dto in dtos)
                {
                    dto.DistanceKm = GeoHelper.CalculateDistanceKm(userLat, userLng, dto.StoreAddressInGpsLatitude, dto.StoreAddressInGpsLongitude);
                }

                dtos = dtos.OrderBy(s => s.DistanceKm.HasValue ? 0 : 1)
                           .ThenBy(s => s.DistanceKm)
                           .ThenBy(s => s.StoreName)
                           .ToList();
            }

            return new PagedResult<StoreViewDto>
            {
                Items = dtos,
                TotalCount = result.TotalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<StoreViewDto> CreateAsync(StoreCreateDto dto)
        {
            var entity = dto.CreateDtoToEntity();
            await _repository.AddAsync(entity);
            await _repository.SaveChangesAsync();
            return entity.ViewEntityToDto();
        }

        public async Task<bool> UpdateAsync(Guid id, StoreUpdateDto dto)
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

            if (await _repository.HasProductsAsync(id))
            {
                throw new InvalidOperationException("Không thể xóa cửa hàng vì vẫn còn sản phẩm.");
            }

            _repository.Remove(existing);
            await _repository.SaveChangesAsync();
            return true;
        }
    }
}