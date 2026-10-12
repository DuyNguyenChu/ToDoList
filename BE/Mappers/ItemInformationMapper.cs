using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BE.Models;
using BE.DTOs.ItemInformationDto;

namespace BE.Mappers
{
    public static class ItemInformationMapper
    {
        public static ItemInformationViewDto ViewEntityToDto(this ItemInformation entity)
        {
            if (entity == null) return null!;

            return new ItemInformationViewDto
            {
                ItemInformationId = entity.ItemInformationId,
                ItemInformationPrice = entity.ItemInformationPrice,
                ItemInformationItemType = entity.ItemInformationItemType,
            };
        }

        public static ItemInformation CreateDtoToEntity(this ItemInformationCreateDto dto)
        {
            if (dto == null) return null!;

            return new ItemInformation
            {
                ItemInformationPrice = dto.ItemInformationPrice,
                ItemInformationItemType = dto.ItemInformationItemType,
            };
        }

        public static void UpdateDtoToEntity(this ItemInformation entity, ItemInformationUpdateDto dto)
        {
            if (entity == null || dto == null) return;

            entity.ItemInformationPrice = dto.ItemInformationPrice;
            entity.ItemInformationItemType = dto.ItemInformationItemType;
        }
    }
}