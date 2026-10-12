using System;

namespace BE.DTOs.ToDoListDto
{
    public class ToDoListViewDto
    {
        public Guid ToDoListId { get; set; }
        public Guid StoresItemsItemInformationId { get; set; }
        public string? ToDoListDecription { get; set; }
        public bool IsDone { get; set; }

        public string ItemName { get; set; } = null!;
        public string StoreName { get; set; } = null!;
        public string? StoreAddressInText { get; set; }
        public double? StoreAddressInGpsLatitude { get; set; }
        public double? StoreAddressInGpsLongitude { get; set; }
        public decimal ItemInformationPrice { get; set; }
        public string ItemInformationItemType { get; set; } = null!;
        public double? DistanceKm { get; set; }
        public decimal? TotalPrice { get; set; }
    }
}