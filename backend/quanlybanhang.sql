-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th4 16, 2026 lúc 09:25 AM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `quanlybanhang`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `batch`
--

CREATE TABLE `batch` (
  `id` int(11) NOT NULL,
  `batchNumber` varchar(191) NOT NULL,
  `mfgDate` datetime(3) DEFAULT NULL,
  `expiryDate` datetime(3) DEFAULT NULL,
  `variantId` int(11) NOT NULL,
  `initialQty` int(11) NOT NULL,
  `currentQty` int(11) NOT NULL,
  `importPrice` decimal(15,2) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `category`
--

CREATE TABLE `category` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `inventorydetail`
--

CREATE TABLE `inventorydetail` (
  `id` int(11) NOT NULL,
  `transactionId` int(11) NOT NULL,
  `variantId` int(11) NOT NULL,
  `batchId` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `unitPrice` decimal(15,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `inventorytransaction`
--

CREATE TABLE `inventorytransaction` (
  `id` int(11) NOT NULL,
  `code` varchar(191) NOT NULL,
  `type` enum('IMPORT','EXPORT') NOT NULL,
  `status` enum('PENDING','COMPLETED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `userId` int(11) NOT NULL,
  `partnerId` int(11) DEFAULT NULL,
  `note` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `paidAmount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `totalAmount` decimal(15,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `order`
--

CREATE TABLE `order` (
  `id` int(11) NOT NULL,
  `code` varchar(191) NOT NULL,
  `customerId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `totalAmount` decimal(15,2) NOT NULL,
  `discount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `finalAmount` decimal(15,2) NOT NULL,
  `status` enum('PROCESSING','SHIPPED','DELIVERED','CANCELLED') NOT NULL DEFAULT 'PROCESSING',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `paidAmount` decimal(15,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `orderitem`
--

CREATE TABLE `orderitem` (
  `id` int(11) NOT NULL,
  `orderId` int(11) NOT NULL,
  `variantId` int(11) NOT NULL,
  `batchId` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(15,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `partner`
--

CREATE TABLE `partner` (
  `id` int(11) NOT NULL,
  `type` enum('CUSTOMER','SUPPLIER') NOT NULL,
  `name` varchar(191) NOT NULL,
  `phone` varchar(191) NOT NULL,
  `address` varchar(191) DEFAULT NULL,
  `taxCode` varchar(191) DEFAULT NULL,
  `debtBalance` decimal(15,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `payment`
--

CREATE TABLE `payment` (
  `id` int(11) NOT NULL,
  `code` varchar(191) NOT NULL,
  `type` enum('INCOME','EXPENSE') NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `partnerId` int(11) DEFAULT NULL,
  `orderId` int(11) DEFAULT NULL,
  `method` varchar(191) NOT NULL,
  `note` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `inventoryTransactionId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product`
--

CREATE TABLE `product` (
  `id` int(11) NOT NULL,
  `code` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `categoryId` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `productvariant`
--

CREATE TABLE `productvariant` (
  `id` int(11) NOT NULL,
  `sku` varchar(191) NOT NULL,
  `productId` int(11) NOT NULL,
  `attributes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`attributes`)),
  `importPrice` decimal(15,2) NOT NULL,
  `sellPrice` decimal(15,2) NOT NULL,
  `stockCount` int(11) NOT NULL DEFAULT 0,
  `minStockLevel` int(11) NOT NULL DEFAULT 5
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `role`
--

CREATE TABLE `role` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`permissions`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `role`
--

INSERT INTO `role` (`id`, `name`, `permissions`) VALUES
(1, 'ADMIN', '[\"ALL_ACCESS\"]'),
(2, 'SALE', '[\"VIEW_DASHBOARD\", \"CREATE_ORDER\"]'),
(3, 'KHO', '[\"MANAGE_INVENTORY\"]');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `shipping`
--

CREATE TABLE `shipping` (
  `id` int(11) NOT NULL,
  `orderId` int(11) NOT NULL,
  `carrierName` varchar(191) NOT NULL,
  `trackingNumber` varchar(191) DEFAULT NULL,
  `shippingFee` decimal(15,2) NOT NULL,
  `status` enum('PENDING','IN_TRANSIT','DELIVERED','RETURNED') NOT NULL DEFAULT 'PENDING',
  `expectedDate` datetime(3) DEFAULT NULL,
  `shippedDate` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `stocktake`
--

CREATE TABLE `stocktake` (
  `id` int(11) NOT NULL,
  `code` varchar(191) NOT NULL,
  `userId` int(11) NOT NULL,
  `status` enum('DRAFT','ADJUSTED') NOT NULL DEFAULT 'DRAFT',
  `note` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `stocktakedetail`
--

CREATE TABLE `stocktakedetail` (
  `id` int(11) NOT NULL,
  `stocktakeId` int(11) NOT NULL,
  `variantId` int(11) NOT NULL,
  `batchId` int(11) DEFAULT NULL,
  `systemQty` int(11) NOT NULL,
  `actualQty` int(11) NOT NULL,
  `adjustment` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `systemsetting`
--

CREATE TABLE `systemsetting` (
  `key` varchar(191) NOT NULL,
  `value` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `systemsetting`
--

INSERT INTO `systemsetting` (`key`, `value`) VALUES
('print_company_address', 'số 10 nguyễn thiếp - phường hạc thành'),
('print_company_logo', '/public/uploads/logo-1776265842118-864923379.jpg'),
('print_company_name', 'CÔNG TY TNHH THƯƠNG MẠI VÀ XÂY DỰNG TOP HOME'),
('print_company_phone', 'ĐT: 0922.860.999 - MST: 0312345678'),
('print_invoice_title', 'HOÁ ĐƠN BÁN HÀNG'),
('print_paper_size', 'a5'),
('print_show_discount', 'true'),
('print_show_signatures', 'true');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `fullName` varchar(191) NOT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `roleId` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `avatar` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `user`
--

INSERT INTO `user` (`id`, `email`, `password`, `fullName`, `phone`, `isActive`, `roleId`, `createdAt`, `updatedAt`, `avatar`) VALUES
(1, 'admin@hungphat.com', '$2a$10$.5Elh8fgxypNUWhpUUr/xOa2sZm0VIaE0qWuGGl9otUfobb46T1Pq', 'Đỗ Hùng (Giám Đốc)', '0988888888', 1, 1, '2026-04-13 16:11:11.166', '2026-04-15 15:34:31.160', NULL),
(2, 'sale@hungphat.com', '$2a$10$.5Elh8fgxypNUWhpUUr/xOa2sZm0VIaE0qWuGGl9otUfobb46T1Pq', 'Nhân viên Sale', '0912345678', 1, 2, '2026-04-13 16:11:11.166', '2026-04-15 13:36:52.641', NULL),
(3, 'kho@hungphat.com', '$2a$10$.5Elh8fgxypNUWhpUUr/xOa2sZm0VIaE0qWuGGl9otUfobb46T1Pq', 'Thủ Kho', '0999999999', 1, 3, '2026-04-13 16:11:11.166', '2026-04-13 10:05:12.000', NULL),
(4, 'manhhung.it.dhv@gmail.com', '$2b$10$gHnWAjfiFnSnWHKqoHxlz.zC8/ECA0w7NbQqv8I.EE7y5w70T80mS', 'Đỗ Hùng', '0983233566', 1, 1, '2026-04-15 13:37:19.038', '2026-04-15 15:47:09.795', '/public/uploads/logo-1776267856628-127983385.jpg');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('14c08a38-e61c-45e5-bb9a-ef697798c7f1', 'b9134db833544bb95d95b72736f077473362d4c4d2b3fbdfb9b2c5965e33b356', '2026-04-12 14:13:22.476', '20260412141322_init_mysql_db', NULL, NULL, '2026-04-12 14:13:22.137', 1);

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `batch`
--
ALTER TABLE `batch`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Batch_batchNumber_variantId_key` (`batchNumber`,`variantId`),
  ADD KEY `Batch_variantId_fkey` (`variantId`);

--
-- Chỉ mục cho bảng `category`
--
ALTER TABLE `category`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `inventorydetail`
--
ALTER TABLE `inventorydetail`
  ADD PRIMARY KEY (`id`),
  ADD KEY `InventoryDetail_transactionId_fkey` (`transactionId`),
  ADD KEY `InventoryDetail_variantId_fkey` (`variantId`),
  ADD KEY `InventoryDetail_batchId_fkey` (`batchId`);

--
-- Chỉ mục cho bảng `inventorytransaction`
--
ALTER TABLE `inventorytransaction`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `InventoryTransaction_code_key` (`code`),
  ADD KEY `InventoryTransaction_userId_fkey` (`userId`),
  ADD KEY `InventoryTransaction_partnerId_fkey` (`partnerId`);

--
-- Chỉ mục cho bảng `order`
--
ALTER TABLE `order`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Order_code_key` (`code`),
  ADD KEY `Order_customerId_fkey` (`customerId`),
  ADD KEY `Order_userId_fkey` (`userId`);

--
-- Chỉ mục cho bảng `orderitem`
--
ALTER TABLE `orderitem`
  ADD PRIMARY KEY (`id`),
  ADD KEY `OrderItem_orderId_fkey` (`orderId`),
  ADD KEY `OrderItem_variantId_fkey` (`variantId`),
  ADD KEY `OrderItem_batchId_fkey` (`batchId`);

--
-- Chỉ mục cho bảng `partner`
--
ALTER TABLE `partner`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Partner_phone_key` (`phone`);

--
-- Chỉ mục cho bảng `payment`
--
ALTER TABLE `payment`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Payment_code_key` (`code`),
  ADD KEY `Payment_partnerId_fkey` (`partnerId`),
  ADD KEY `Payment_orderId_fkey` (`orderId`),
  ADD KEY `Payment_inventoryTransactionId_fkey` (`inventoryTransactionId`);

--
-- Chỉ mục cho bảng `product`
--
ALTER TABLE `product`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Product_code_key` (`code`),
  ADD KEY `Product_categoryId_fkey` (`categoryId`);

--
-- Chỉ mục cho bảng `productvariant`
--
ALTER TABLE `productvariant`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ProductVariant_sku_key` (`sku`),
  ADD KEY `ProductVariant_productId_fkey` (`productId`);

--
-- Chỉ mục cho bảng `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Role_name_key` (`name`);

--
-- Chỉ mục cho bảng `shipping`
--
ALTER TABLE `shipping`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Shipping_orderId_key` (`orderId`);

--
-- Chỉ mục cho bảng `stocktake`
--
ALTER TABLE `stocktake`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Stocktake_code_key` (`code`),
  ADD KEY `Stocktake_userId_fkey` (`userId`);

--
-- Chỉ mục cho bảng `stocktakedetail`
--
ALTER TABLE `stocktakedetail`
  ADD PRIMARY KEY (`id`),
  ADD KEY `StocktakeDetail_stocktakeId_fkey` (`stocktakeId`),
  ADD KEY `StocktakeDetail_variantId_fkey` (`variantId`),
  ADD KEY `StocktakeDetail_batchId_fkey` (`batchId`);

--
-- Chỉ mục cho bảng `systemsetting`
--
ALTER TABLE `systemsetting`
  ADD PRIMARY KEY (`key`);

--
-- Chỉ mục cho bảng `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `User_email_key` (`email`),
  ADD KEY `User_roleId_fkey` (`roleId`);

--
-- Chỉ mục cho bảng `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `batch`
--
ALTER TABLE `batch`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `category`
--
ALTER TABLE `category`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `inventorydetail`
--
ALTER TABLE `inventorydetail`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `inventorytransaction`
--
ALTER TABLE `inventorytransaction`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `order`
--
ALTER TABLE `order`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `orderitem`
--
ALTER TABLE `orderitem`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `partner`
--
ALTER TABLE `partner`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `payment`
--
ALTER TABLE `payment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `product`
--
ALTER TABLE `product`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `productvariant`
--
ALTER TABLE `productvariant`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `role`
--
ALTER TABLE `role`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `shipping`
--
ALTER TABLE `shipping`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `stocktake`
--
ALTER TABLE `stocktake`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `stocktakedetail`
--
ALTER TABLE `stocktakedetail`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `batch`
--
ALTER TABLE `batch`
  ADD CONSTRAINT `Batch_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `productvariant` (`id`) ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `inventorydetail`
--
ALTER TABLE `inventorydetail`
  ADD CONSTRAINT `InventoryDetail_batchId_fkey` FOREIGN KEY (`batchId`) REFERENCES `batch` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `InventoryDetail_transactionId_fkey` FOREIGN KEY (`transactionId`) REFERENCES `inventorytransaction` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `InventoryDetail_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `productvariant` (`id`) ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `inventorytransaction`
--
ALTER TABLE `inventorytransaction`
  ADD CONSTRAINT `InventoryTransaction_partnerId_fkey` FOREIGN KEY (`partnerId`) REFERENCES `partner` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `InventoryTransaction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `order`
--
ALTER TABLE `order`
  ADD CONSTRAINT `Order_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `partner` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `orderitem`
--
ALTER TABLE `orderitem`
  ADD CONSTRAINT `OrderItem_batchId_fkey` FOREIGN KEY (`batchId`) REFERENCES `batch` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `order` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `OrderItem_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `productvariant` (`id`) ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `payment`
--
ALTER TABLE `payment`
  ADD CONSTRAINT `Payment_inventoryTransactionId_fkey` FOREIGN KEY (`inventoryTransactionId`) REFERENCES `inventorytransaction` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Payment_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `order` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Payment_partnerId_fkey` FOREIGN KEY (`partnerId`) REFERENCES `partner` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `product`
--
ALTER TABLE `product`
  ADD CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `category` (`id`) ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `productvariant`
--
ALTER TABLE `productvariant`
  ADD CONSTRAINT `ProductVariant_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `shipping`
--
ALTER TABLE `shipping`
  ADD CONSTRAINT `Shipping_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `order` (`id`) ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `stocktake`
--
ALTER TABLE `stocktake`
  ADD CONSTRAINT `Stocktake_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `stocktakedetail`
--
ALTER TABLE `stocktakedetail`
  ADD CONSTRAINT `StocktakeDetail_batchId_fkey` FOREIGN KEY (`batchId`) REFERENCES `batch` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `StocktakeDetail_stocktakeId_fkey` FOREIGN KEY (`stocktakeId`) REFERENCES `stocktake` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `StocktakeDetail_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `productvariant` (`id`) ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `User_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `role` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
