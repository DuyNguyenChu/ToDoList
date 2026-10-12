using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BE.DTOs.ItemInformationDto
{
    public class ItemInformationViewDto
    {
        public Guid ItemInformationId { get; set; }
        public decimal ItemInformationPrice { get; set; }   
        public string ItemInformationItemType { get; set; } = null!;
    }
}