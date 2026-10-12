using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace BE.Models;

public partial class Item
{
    [Key]
    [Column("ItemID")]
    public Guid ItemId { get; set; }

    [Column("ItemIMG")]
    [StringLength(500)]
    [Unicode(false)]
    public string? ItemImg { get; set; }

    [StringLength(100)]
    public string ItemName { get; set; } = null!;

    [InverseProperty("Item")]
    public virtual ICollection<StoresItemsItemInformation> StoresItemsItemInformations { get; set; } = new List<StoresItemsItemInformation>();
}
