using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace BE.Models;

public partial class ToDolistContext : DbContext
{
    public ToDolistContext(DbContextOptions<ToDolistContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Item> Items { get; set; }

    public virtual DbSet<ItemInformation> ItemInformations { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<Store> Stores { get; set; }

    public virtual DbSet<StoresItemsItemInformation> StoresItemsItemInformations { get; set; }

    public virtual DbSet<ToDoList> ToDoLists { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Item>(entity =>
        {
            entity.HasKey(e => e.ItemId).HasName("PK__Items__727E83EB72B4C5FF");

            entity.Property(e => e.ItemId).HasDefaultValueSql("gen_random_uuid()");
        });

        modelBuilder.Entity<ItemInformation>(entity =>
        {
            entity.HasKey(e => e.ItemInformationId).HasName("PK__ItemInfo__E63A593D1540653D");

            entity.Property(e => e.ItemInformationId).HasDefaultValueSql("gen_random_uuid()");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.RolesId).HasName("PK__Roles__C4B278200BBE066E");

            entity.Property(e => e.RolesId).HasDefaultValueSql("gen_random_uuid()");
        });

        modelBuilder.Entity<Store>(entity =>
        {
            entity.HasKey(e => e.StoreId).HasName("PK__Stores__3B82F0E18AD78C72");

            entity.Property(e => e.StoreId).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
        });

        modelBuilder.Entity<StoresItemsItemInformation>(entity =>
        {
            entity.HasKey(e => e.StoresItemsItemInformationId).HasName("PK__StoresIt__C4D86B10B5C22880");

            entity.Property(e => e.StoresItemsItemInformationId).HasDefaultValueSql("gen_random_uuid()");

            entity.HasOne(d => d.Item).WithMany(p => p.StoresItemsItemInformations)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__StoresIte__ItemI__4D94879B");

            entity.HasOne(d => d.ItemInformation).WithMany(p => p.StoresItemsItemInformations)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__StoresIte__ItemI__4E88ABD4");

            entity.HasOne(d => d.Store).WithMany(p => p.StoresItemsItemInformations)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__StoresIte__Store__4CA06362");
        });

        modelBuilder.Entity<ToDoList>(entity =>
        {
            entity.HasKey(e => e.ToDoListId).HasName("PK__ToDoList__1BEFD50CE39920E5");

            entity.Property(e => e.ToDoListId).HasDefaultValueSql("gen_random_uuid()");

            entity.HasOne(d => d.StoresItemsItemInformation).WithMany(p => p.ToDoLists)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ToDoList__Stores__5441852A");

            entity.HasOne(d => d.User).WithMany(p => p.ToDoLists)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ToDoList__UserID__534D60F1");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__Users__1788CCAC2A1B08F9");

            entity.Property(e => e.UserId).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.UserCreateDate).HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(d => d.Roles).WithMany(p => p.Users)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Users__RolesID__3F466844");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
