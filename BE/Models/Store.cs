using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace BE.Models;

public partial class Store
{
    [Key]
    [Column("StoreID")]
    public Guid StoreId { get; set; }

    [Column("StoreIMG")]
    [StringLength(500)]
    [Unicode(false)]
    public string? StoreImg { get; set; }

    [StringLength(100)]
    public string StoreName { get; set; } = null!;

    [StringLength(250)]
    public string? StoreAddressInText { get; set; }

    public bool IsActive { get; set; }

    [Column("StoreAddressInGPSLatitude")]
    public double? StoreAddressInGpslatitude { get; set; }

    [Column("StoreAddressInGPSLongitude")]
    public double? StoreAddressInGpslongitude { get; set; }

    [InverseProperty("Store")]
    public virtual ICollection<StoresItemsItemInformation> StoresItemsItemInformations { get; set; } = new List<StoresItemsItemInformation>();
}
