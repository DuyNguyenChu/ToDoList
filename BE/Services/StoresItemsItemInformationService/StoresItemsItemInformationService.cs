using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BE.DTOs.StoresItemsItemInformationDto;
using BE.DTOs.Common;
using BE.Mappers;
using BE.repositories.StoresItemsItemInformationRepo;
using BE.Helpers;

namespace BE.Services.StoresItemsItemInformationService
{
    public class StoresItemsItemInformationService : IStoresItemsItemInformationService
    {
        private readonly IStoresItemsItemInformationRepository _repository;
        public StoresItemsItemInformationService(IStoresItemsItemInformationRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<StoresItemsItemInformationViewDto>> GetAllAsync(double? userLat = null, double? userLng = null)
        {
            var entity = await _repository.GetAllAsync();
            var dtos = entity.Select(i => i.ViewEntityToDto()).ToList();

            if (userLat.HasValue && userLng.HasValue)
            {
                foreach (var dto in dtos)
                {
                    dto.DistanceKm = GeoHelper.CalculateDistanceKm(userLat, userLng, dto.StoreAddressInGpsLatitude, dto.StoreAddressInGpsLongitude);
                }

                return dtos.OrderBy(i => i.DistanceKm.HasValue ? 0 : 1)
                           .ThenBy(i => i.DistanceKm)
                           .ThenBy(i => i.ItemInformationPrice);
            }

            return dtos.OrderBy(i => i.ItemInformationPrice);
        }

        public async Task<StoresItemsItemInformationViewDto?> GetByIdAsync(Guid id)
        {
            var entity = await _repository.GetByIdAsync(id);
            return entity?.ViewEntityToDto();
        }

        public async Task<IEnumerable<StoresItemsItemInformationViewDto>> GetByStoreIdAsync(Guid storeId, string? keyword = null)
        {
            var entities = await _repository.GetByStoreIdAsync(storeId, keyword);
            return entities.Select(i => i.ViewEntityToDto())
                           .OrderBy(i => i.ItemInformationPrice);
        }

        public async Task<PagedResult<StoresItemsItemInformationViewDto>> SearchAsync(string? keyword, int pageNumber, int pageSize, double? userLat = null, double? userLng = null)
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

                dtos = dtos.OrderBy(i => i.DistanceKm.HasValue ? 0 : 1)
                           .ThenBy(i => i.DistanceKm)
                           .ThenBy(i => i.ItemInformationPrice)
                           .ToList();
            }
            else
            {
                dtos = dtos.OrderBy(i => i.ItemInformationPrice).ToList();
            }

            return new PagedResult<StoresItemsItemInformationViewDto>
            {
                Items = dtos,
                TotalCount = result.TotalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<StoresItemsItemInformationViewDto> CreateAsync(StoresItemsItemInformationCreateDto dto)
        {
            var entity = dto.CreateDtoToEntity();
            await _repository.AddAsync(entity);
            await _repository.SaveChangesAsync();
            var created = await _repository.GetByIdAsync(entity.StoresItemsItemInformationId);
            return (created ?? entity).ViewEntityToDto();
        }

        public async Task<bool> UpdateAsync(Guid id, StoresItemsItemInformationUpdateDto dto)
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