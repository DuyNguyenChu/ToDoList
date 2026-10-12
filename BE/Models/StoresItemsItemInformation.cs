using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace BE.Models;

[Table("StoresItemsItemInformation")]
public partial class StoresItemsItemInformation
{
    [Key]
    [Column("StoresItemsItemInformationID")]
    public Guid StoresItemsItemInformationId { get; set; }

    [Column("StoreID")]
    public Guid StoreId { get; set; }

    [Column("ItemID")]
    public Guid ItemId { get; set; }

    [Column("ItemInformationID")]
    public Guid ItemInformationId { get; set; }

    [ForeignKey("ItemId")]
    [InverseProperty("StoresItemsItemInformations")]
    public virtual Item Item { get; set; } = null!;

    [ForeignKey("ItemInformationId")]
    [InverseProperty("StoresItemsItemInformations")]
    public virtual ItemInformation ItemInformation { get; set; } = null!;

    [ForeignKey("StoreId")]
    [InverseProperty("StoresItemsItemInformations")]
    public virtual Store Store { get; set; } = null!;

    [InverseProperty("StoresItemsItemInformation")]
    public virtual ICollection<ToDoList> ToDoLists { get; set; } = new List<ToDoList>();
}
