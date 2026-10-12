using System;
using BE.Models;
using BE.DTOs.ToDoListDto;

namespace BE.Mappers
{
    public static class ToDoListMapper
    {
        public static ToDoListViewDto ViewEntityToDto(this ToDoList entity)
        {
            if (entity == null) return null!;

            return new ToDoListViewDto 
            {
                ToDoListId = entity.ToDoListId,
                StoresItemsItemInformationId = entity.StoresItemsItemInformationId,
                ToDoListDecription = entity.ToDoListDecription,
                IsDone = entity.IsDone,
                ItemName = entity.StoresItemsItemInformation?.Item?.ItemName ?? string.Empty,
                StoreName = entity.StoresItemsItemInformation?.Store?.StoreName ?? string.Empty,
                StoreAddressInText = entity.StoresItemsItemInformation?.Store?.StoreAddressInText,
                StoreAddressInGpsLatitude = entity.StoresItemsItemInformation?.Store?.StoreAddressInGpslatitude,
                StoreAddressInGpsLongitude = entity.StoresItemsItemInformation?.Store?.StoreAddressInGpslongitude,
                ItemInformationPrice = entity.StoresItemsItemInformation?.ItemInformation?.ItemInformationPrice ?? 0,
                ItemInformationItemType = entity.StoresItemsItemInformation?.ItemInformation?.ItemInformationItemType ?? string.Empty,
            };
        }

        public static ToDoList CreateDtoToEntity(this ToDoListCreateDto dto)
        {
            if (dto == null) return null!;

            return new ToDoList 
            {
                UserId = dto.UserId,
                StoresItemsItemInformationId = dto.StoresItemsItemInformationId,
                ToDoListDecription = dto.ToDoListDecription,
                IsDone = false, 
            };
        }

        public static void UpdateDtoToEntity(this ToDoList entity, ToDoListUpdateDto dto)
        {
            if (entity == null || dto == null) return;

            entity.StoresItemsItemInformationId = dto.StoresItemsItemInformationId;
            entity.ToDoListDecription = dto.ToDoListDecription;
            entity.IsDone = dto.IsDone;
        }
    }
}