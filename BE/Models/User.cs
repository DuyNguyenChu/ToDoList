using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace BE.Models;

[Index("UserEmail", Name = "UQ__Users__08638DF8FC4DD420", IsUnique = true)]
[Index("UserPhone", Name = "UQ__Users__F2577C47D9AE5A91", IsUnique = true)]
public partial class User
{
    [Key]
    [Column("UserID")]
    public Guid UserId { get; set; }

    [Column("RolesID")]
    public Guid RolesId { get; set; }

    [Column("UserIMG")]
    [StringLength(500)]
    public string? UserImg { get; set; }

    [StringLength(100)]
    public string UserName { get; set; } = null!;

    [StringLength(250)]
    public string? UserEmail { get; set; }

    [StringLength(20)]
    public string? UserPhone { get; set; }

    [StringLength(256)]
    public string UserPassword { get; set; } = null!;

    [StringLength(250)]
    public string? UserAddressInText { get; set; }

    public bool? UserGender { get; set; }

    public DateTime UserCreateDate { get; set; }

    public DateTime? UserRoleStartDate { get; set; }

    public DateTime? UserRoleEndDate { get; set; }

    public bool IsOnline { get; set; }

    [Column("UserAddressInGPSLatitude")]
    public double? UserAddressInGpslatitude { get; set; }

    [Column("UserAddressInGPSLongitude")]
    public double? UserAddressInGpslongitude { get; set; }

    [ForeignKey("RolesId")]
    [InverseProperty("Users")]
    public virtual Role Roles { get; set; } = null!;

    [InverseProperty("User")]
    public virtual ICollection<ToDoList> ToDoLists { get; set; } = new List<ToDoList>();
}
