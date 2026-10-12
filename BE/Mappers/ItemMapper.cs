using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BE.Models;
using BE.DTOs.ItemDto;
namespace BE.Mappers
{
    public static class ItemMapper
    {
        public static ItemViewDto ViewEntityToDto(this Item entity)
        {
            if (entity == null) return null!;

            return new ItemViewDto
            {
                ItemId = entity.ItemId,
                ItemName = entity.ItemName,
                ItemImg = entity.ItemImg,
            };
        }


        public static Item CreateDtoToEntity(this ItemCreateDto dto)
        {
            if (dto == null) return null!;

            return new Item
            {
                ItemName = dto.ItemName,
                ItemImg = dto.ItemImg,
            };
        }

        public static void UpdateDtoToEntity(this Item entity, ItemUpdateDto dto)
        {
            if (entity == null || dto == null) return;

            entity.ItemName = dto.ItemName;
            entity.ItemImg = dto.ItemImg;
        }
    }
}