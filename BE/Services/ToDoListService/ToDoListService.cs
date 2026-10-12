using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BE.DTOs.ToDoListDto;
using BE.DTOs.Common;
using BE.Mappers;
using BE.repositories.ToDoListRepo;
using BE.Helpers;

namespace BE.Services.ToDoListService
{
    public class ToDoListService : IToDoListService
    {
        private readonly IToDoListRepository _repository;
        public ToDoListService(IToDoListRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<ToDoListViewDto>> GetAllAsync(double? userLat = null, double? userLng = null)
        {
            var entity = await _repository.GetAllAsync();
            var dtos = entity.Select(i => i.ViewEntityToDto()).ToList();

            var totalPrice = dtos.Sum(d => d.ItemInformationPrice);

            if (userLat.HasValue && userLng.HasValue)
            {
                foreach (var dto in dtos)
                {
                    dto.DistanceKm = GeoHelper.CalculateDistanceKm(userLat, userLng, dto.StoreAddressInGpsLatitude, dto.StoreAddressInGpsLongitude);
                    dto.TotalPrice = totalPrice;
                }

                return dtos.OrderBy(t => t.DistanceKm.HasValue ? 0 : 1)
                           .ThenBy(t => t.DistanceKm)
                           .ThenBy(t => t.ItemInformationPrice);
            }

            foreach (var dto in dtos)
            {
                dto.TotalPrice = totalPrice;
            }

            return dtos.OrderBy(t => t.ItemInformationPrice);
        }

        public async Task<ToDoListSummaryDto> GetSummaryAsync(double? userLat = null, double? userLng = null)
        {
            var items = (await GetAllAsync(userLat, userLng)).ToList();
            var totalPrice = items.Sum(d => d.ItemInformationPrice);

            return new ToDoListSummaryDto
            {
                Items = items,
                TotalPrice = totalPrice,
                TotalItems = items.Count,
                DoneItems = items.Count(x => x.IsDone)
            };
        }

        public async Task<ToDoListViewDto?> GetByIdAsync(Guid id)
        {
            var entity = await _repository.GetByIdAsync(id);
            return entity?.ViewEntityToDto();
        }

        public async Task<PagedResult<ToDoListViewDto>> SearchAsync(string? keyword, int pageNumber, int pageSize, double? userLat = null, double? userLng = null)
        {
            if (pageSize > 100) pageSize = 100;
            if (pageSize < 1) pageSize = 10;
            if (pageNumber < 1) pageNumber = 1;

            var result = await _repository.SearchAsync(keyword, pageNumber, pageSize);
            var dtos = result.Items.Select(i => i.ViewEntityToDto()).ToList();

            var totalPrice = dtos.Sum(d => d.ItemInformationPrice);

            if (userLat.HasValue && userLng.HasValue)
            {
                foreach (var dto in dtos)
                {
                    dto.DistanceKm = GeoHelper.CalculateDistanceKm(userLat, userLng, dto.StoreAddressInGpsLatitude, dto.StoreAddressInGpsLongitude);
                    dto.TotalPrice = totalPrice;
                }

                dtos = dtos.OrderBy(t => t.DistanceKm.HasValue ? 0 : 1)
                           .ThenBy(t => t.DistanceKm)
                           .ThenBy(t => t.ItemInformationPrice)
                           .ToList();
            }
            else
            {
                foreach (var dto in dtos)
                {
                    dto.TotalPrice = totalPrice;
                }
                dtos = dtos.OrderBy(t => t.ItemInformationPrice).ToList();
            }

            return new PagedResult<ToDoListViewDto>
            {
                Items = dtos,
                TotalCount = result.TotalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<ToDoListViewDto> CreateAsync(ToDoListCreateDto dto)
        {
            var entity = dto.CreateDtoToEntity();
            await _repository.AddAsync(entity);
            await _repository.SaveChangesAsync();
            var created = await _repository.GetByIdAsync(entity.ToDoListId);
            return (created ?? entity).ViewEntityToDto();
        }

        public async Task<bool> UpdateAsync(Guid id, ToDoListUpdateDto dto)
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