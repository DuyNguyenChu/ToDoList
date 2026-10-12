-- =========================================================================
-- SCRIPT TẠO DATABASE POSTGRESQL CHO SUPABASE
-- DỰ ÁN: TODOLIST (ASP.NET CORE WEB API + REACT)
-- Cách dùng: Mở Supabase -> Chọn Project -> Chọn "SQL Editor" -> Dán toàn bộ mã này -> Bấm "RUN"
-- =========================================================================

-- Kích hoạt extension pgcrypto để sinh UUID ngẫu nhiên
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. BẢNG Roles (Vai trò người dùng)
CREATE TABLE IF NOT EXISTS "Roles" (
    "RolesID" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "RolesName" VARCHAR(100) NOT NULL
);

-- 2. BẢNG Users (Người dùng)
CREATE TABLE IF NOT EXISTS "Users" (
    "UserID" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "RolesID" UUID NOT NULL REFERENCES "Roles"("RolesID"),
    "UserIMG" VARCHAR(500) NULL,
    "UserName" VARCHAR(100) NOT NULL,
    "UserEmail" VARCHAR(250) UNIQUE NULL,
    "UserPhone" VARCHAR(20) UNIQUE NULL,
    "UserPassword" VARCHAR(256) NOT NULL,
    "UserAddressInGPSLatitude" DOUBLE PRECISION NULL,
    "UserAddressInGPSLongitude" DOUBLE PRECISION NULL,
    "UserAddressInText" VARCHAR(250) NULL,
    "UserGender" BOOLEAN NULL,
    "UserCreateDate" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "UserRoleStartDate" TIMESTAMP WITH TIME ZONE NULL,
    "UserRoleEndDate" TIMESTAMP WITH TIME ZONE NULL,
    "IsOnline" BOOLEAN DEFAULT FALSE NOT NULL
);

-- 3. BẢNG Stores (Cửa hàng)
CREATE TABLE IF NOT EXISTS "Stores" (
    "StoreID" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "StoreIMG" VARCHAR(500) NULL,
    "StoreName" VARCHAR(100) NOT NULL,
    "StoreAddressInGPSLatitude" DOUBLE PRECISION NULL,
    "StoreAddressInGPSLongitude" DOUBLE PRECISION NULL,
    "StoreAddressInText" VARCHAR(250) NULL,
    "IsActive" BOOLEAN DEFAULT TRUE NOT NULL
);

-- 4. BẢNG Items (Vật phẩm/Hàng hóa)
CREATE TABLE IF NOT EXISTS "Items" (
    "ItemID" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "ItemIMG" VARCHAR(500) NULL,
    "ItemName" VARCHAR(100) NOT NULL
);

-- 5. BẢNG ItemInformation (Thông tin giá và loại hàng)
CREATE TABLE IF NOT EXISTS "ItemInformation" (
    "ItemInformationID" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "ItemInformation_Price" NUMERIC(18, 2) NOT NULL,
    "ItemInformation_ItemType" VARCHAR(50) NOT NULL
);

-- 6. BẢNG StoresItemsItemInformation (Liên kết Cửa hàng - Mặt hàng - Giá)
CREATE TABLE IF NOT EXISTS "StoresItemsItemInformation" (
    "StoresItemsItemInformationID" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "StoreID" UUID NOT NULL REFERENCES "Stores"("StoreID") ON DELETE RESTRICT,
    "ItemID" UUID NOT NULL REFERENCES "Items"("ItemID") ON DELETE RESTRICT,
    "ItemInformationID" UUID NOT NULL REFERENCES "ItemInformation"("ItemInformationID") ON DELETE RESTRICT
);

-- 7. BẢNG ToDoList (Danh sách cần mua)
CREATE TABLE IF NOT EXISTS "ToDoList" (
    "ToDoListID" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "UserID" UUID NOT NULL REFERENCES "Users"("UserID") ON DELETE RESTRICT,
    "StoresItemsItemInformationID" UUID NOT NULL REFERENCES "StoresItemsItemInformation"("StoresItemsItemInformationID") ON DELETE RESTRICT,
    "ToDoListDecription" VARCHAR(500) NULL,
    "IsDone" BOOLEAN DEFAULT FALSE NOT NULL
);

-- =========================================================================
-- KHỞI TẠO DỮ LIỆU BAN ĐẦU (SEED DATA)
-- =========================================================================

-- Thêm vai trò Admin và User mặc định
INSERT INTO "Roles" ("RolesID", "RolesName")
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Admin'),
    ('22222222-2222-2222-2222-222222222222', 'User')
ON CONFLICT ("RolesID") DO NOTHING;
