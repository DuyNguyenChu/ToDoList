using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace BE.Models;

public partial class Role
{
    [Key]
    [Column("RolesID")]
    public Guid RolesId { get; set; }

    [StringLength(100)]
    public string RolesName { get; set; } = null!;

    [InverseProperty("Roles")]
    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
