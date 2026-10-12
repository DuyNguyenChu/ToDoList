using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace BE.Models;

[Table("ToDoList")]
public partial class ToDoList
{
    [Key]
    [Column("ToDoListID")]
    public Guid ToDoListId { get; set; }

    [Column("UserID")]
    public Guid UserId { get; set; }

    [Column("StoresItemsItemInformationID")]
    public Guid StoresItemsItemInformationId { get; set; }

    [StringLength(500)]
    public string? ToDoListDecription { get; set; }

    public bool IsDone { get; set; }

    [ForeignKey("StoresItemsItemInformationId")]
    [InverseProperty("ToDoLists")]
    public virtual StoresItemsItemInformation StoresItemsItemInformation { get; set; } = null!;

    [ForeignKey("UserId")]
    [InverseProperty("ToDoLists")]
    public virtual User User { get; set; } = null!;
}
