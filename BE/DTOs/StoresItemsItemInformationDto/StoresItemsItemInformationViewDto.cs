using System;

namespace BE.DTOs.StoresItemsItemInformationDto
{
    public class StoresItemsItemInformationViewDto
    {
        public Guid StoresItemsItemInformationId { get; set; }
        public Guid StoreId { get; set; }
        public Guid ItemId { get; set; }
        public Guid ItemInformationId { get; set; }

        public string ItemName { get; set; } = null!;
        public string? ItemImg { get; set; }
        public string StoreName { get; set; } = null!;
        public string? StoreAddressInText { get; set; }
        public double? StoreAddressInGpsLatitude { get; set; }
        public double? StoreAddressInGpsLongitude { get; set; }
        public decimal ItemInformationPrice { get; set; }
        public string ItemInformationItemType { get; set; } = null!;
        public double? DistanceKm { get; set; }
    }
}