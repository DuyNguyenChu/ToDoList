use master
go

create database ToDolist
go

use ToDolist
go

create table dbo.Roles(
	RolesID UNIQUEIDENTIFIER default newid() primary key not null,
	RolesName nvarchar(100) not null,
)
go

create table dbo.Users(
	UserID UNIQUEIDENTIFIER default newid() primary key not null,
	RolesID UNIQUEIDENTIFIER not null,
	UserIMG nvarchar(500) null,
	UserName nvarchar(100) not null,
	UserEmail nvarchar(250) unique null,
	UserPhone nvarchar(20) unique null,
	UserPassword nvarchar(256) not null,
	UserAddressInGPSLatitude FLOAT NULL,
	UserAddressInGPSLongitude FLOAT NULL,
	UserAddressInText nvarchar(250) null,
	UserGender bit null,
	UserCreateDate datetime2 default getdate() not null,
	UserRoleStartDate datetime2 null,
	UserRoleEndDate datetime2 null,
	IsOnline bit default 0 not null,
	foreign key (RolesID) references dbo.Roles(RolesID)
)
go

create table dbo.Stores(
	StoreID UNIQUEIDENTIFIER default newid() primary key not null,
	StoreIMG varchar(500) null,
	StoreName nvarchar(100) not null,
	StoreAddressInGPSLatitude FLOAT NULL,
	StoreAddressInGPSLongitude FLOAT NULL,
	StoreAddressInText nvarchar(250) null,
	IsActive bit default 1 not null
)
go

create table dbo.Items(
	ItemID UNIQUEIDENTIFIER default newid() primary key not null,
	ItemIMG varchar(500) null,
	ItemName nvarchar(100) not null
)
go

create table dbo.ItemInformation(
	ItemInformationID UNIQUEIDENTIFIER default newid() primary key not null,
	ItemInformation_Price decimal(18,2) not null,
	ItemInformation_ItemType nvarchar(50) not null
)
go

create table StoresItemsItemInformation(
	StoresItemsItemInformationID UNIQUEIDENTIFIER default newid() primary key not null,
	StoreID UNIQUEIDENTIFIER not null,
	ItemID UNIQUEIDENTIFIER not null,
	ItemInformationID UNIQUEIDENTIFIER not null,
	foreign key (StoreID) references dbo.Stores(StoreID),
	foreign key (ItemID) references dbo.Items(ItemID),
	foreign key (ItemInformationID) references dbo.ItemInformation(ItemInformationID)
)	
go

create table ToDoList(
	ToDoListID UNIQUEIDENTIFIER default newid() primary key not null,
	UserID UNIQUEIDENTIFIER not null,
	StoresItemsItemInformationID UNIQUEIDENTIFIER not null,
	ToDoListDecription nvarchar(500) null,
	IsDone bit default 0 not null,
	foreign key (UserID) references dbo.Users(UserID),
	foreign key (StoresItemsItemInformationID) references dbo.StoresItemsItemInformation(StoresItemsItemInformationID)
)
go

