using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BE.DTOs.ItemDto
{
    public class ItemCreateDto
    {
        public string? ItemImg { get; set; }
        public string ItemName { get; set; } = null!;
    }
}