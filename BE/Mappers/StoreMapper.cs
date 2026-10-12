using System;
using BE.Models;
using BE.DTOs.StoreDto;

namespace BE.Mappers
{
    public static class StoreMapper
    {
        public static StoreViewDto ViewEntityToDto(this Store entity)
        {
            if (entity == null) return null!;

            return new StoreViewDto 
            {
                StoreId = entity.StoreId,
                StoreImg = entity.StoreImg,
                StoreName = entity.StoreName,
                StoreAddressInGpsLatitude = entity.StoreAddressInGpslatitude,
                StoreAddressInGpsLongitude = entity.StoreAddressInGpslongitude,
                StoreAddressInText = entity.StoreAddressInText,
                IsActive = entity.IsActive,
            };
        }

        public static Store CreateDtoToEntity(this StoreCreateDto dto)
        {
            if (dto == null) return null!;

            return new Store 
            {
                StoreImg = dto.StoreImg,
                StoreName = dto.StoreName,
                StoreAddressInGpslatitude = dto.StoreAddressInGpsLatitude,
                StoreAddressInGpslongitude = dto.StoreAddressInGpsLongitude,
                StoreAddressInText = dto.StoreAddressInText,
                IsActive = dto.IsActive,
            };
        }

        public static void UpdateDtoToEntity(this Store entity, StoreUpdateDto dto)
        {
            if (entity == null || dto == null) return;

            entity.StoreImg = dto.StoreImg;
            entity.StoreName = dto.StoreName;
            entity.StoreAddressInGpslatitude = dto.StoreAddressInGpsLatitude;
            entity.StoreAddressInGpslongitude = dto.StoreAddressInGpsLongitude;
            entity.StoreAddressInText = dto.StoreAddressInText;
            entity.IsActive = dto.IsActive;
        }
    }
}