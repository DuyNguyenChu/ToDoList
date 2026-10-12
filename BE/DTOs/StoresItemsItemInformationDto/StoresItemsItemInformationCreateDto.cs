using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BE.DTOs.StoresItemsItemInformationDto
{
    public class StoresItemsItemInformationCreateDto
    {
        public Guid StoreId { get; set; }
        public Guid ItemId { get; set; }
        public Guid ItemInformationId { get; set; }
    }
}