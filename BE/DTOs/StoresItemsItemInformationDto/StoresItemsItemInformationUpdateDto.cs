using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BE.DTOs.StoresItemsItemInformationDto
{
    public class StoresItemsItemInformationUpdateDto
    {
        public Guid StoresItemsItemInformationId { get; set; }
        public Guid StoreId { get; set; }
        public Guid ItemId { get; set; }
        public Guid ItemInformationId { get; set; }
    }
}