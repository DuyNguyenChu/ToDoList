using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BE.DTOs.ItemDto
{
    public class ItemUpdateDto
    {
        public Guid ItemId { get; set; }
        public string? ItemImg { get; set; }
        public string ItemName { get; set; } = null!;
    }
}