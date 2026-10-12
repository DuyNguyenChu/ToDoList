using System;
using BE.Models;
using BE.DTOs.StoresItemsItemInformationDto;

namespace BE.Mappers
{
    public static class StoresItemsItemInformationMapper
    {
        public static StoresItemsItemInformationViewDto ViewEntityToDto(this StoresItemsItemInformation entity)
        {
            if (entity == null) return null!;

            return new StoresItemsItemInformationViewDto 
            {
                StoresItemsItemInformationId = entity.StoresItemsItemInformationId,
                StoreId = entity.StoreId,
                ItemId = entity.ItemId,
                ItemInformationId = entity.ItemInformationId,
                ItemName = entity.Item?.ItemName ?? string.Empty,
                ItemImg = entity.Item?.ItemImg,
                StoreName = entity.Store?.StoreName ?? string.Empty,
                StoreAddressInText = entity.Store?.StoreAddressInText,
                StoreAddressInGpsLatitude = entity.Store?.StoreAddressInGpslatitude,
                StoreAddressInGpsLongitude = entity.Store?.StoreAddressInGpslongitude,
                ItemInformationPrice = entity.ItemInformation?.ItemInformationPrice ?? 0,
                ItemInformationItemType = entity.ItemInformation?.ItemInformationItemType ?? string.Empty,
            };
        }

        public static StoresItemsItemInformation CreateDtoToEntity(this StoresItemsItemInformationCreateDto dto)
        {
            if (dto == null) return null!;

            return new StoresItemsItemInformation 
            {
                StoreId = dto.StoreId,
                ItemId = dto.ItemId,
                ItemInformationId = dto.ItemInformationId,
            };
        }

        public static void UpdateDtoToEntity(this StoresItemsItemInformation entity, StoresItemsItemInformationUpdateDto dto)
        {
            if (entity == null || dto == null) return;

            entity.StoreId = dto.StoreId;
            entity.ItemId = dto.ItemId;
            entity.ItemInformationId = dto.ItemInformationId;
        }
    }
}