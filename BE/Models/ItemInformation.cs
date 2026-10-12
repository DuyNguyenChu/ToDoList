using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace BE.Models;

[Table("ItemInformation")]
public partial class ItemInformation
{
    [Key]
    [Column("ItemInformationID")]
    public Guid ItemInformationId { get; set; }

    [Column("ItemInformation_Price", TypeName = "decimal(18, 2)")]
    public decimal ItemInformationPrice { get; set; }

    [Column("ItemInformation_ItemType")]
    [StringLength(50)]
    public string ItemInformationItemType { get; set; } = null!;

    [InverseProperty("ItemInformation")]
    public virtual ICollection<StoresItemsItemInformation> StoresItemsItemInformations { get; set; } = new List<StoresItemsItemInformation>();
}
