using System;

namespace BE.DTOs.StoreDto
{
    public class StoreCreateDto
    {
        public string? StoreImg { get; set; }
        public string StoreName { get; set; } = null!;
        public double? StoreAddressInGpsLatitude { get; set; }
        public double? StoreAddressInGpsLongitude { get; set; }
        public string? StoreAddressInText { get; set; }
        public bool IsActive { get; set; } = true;
    }
}