-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th4 17, 2026 lúc 01:08 PM
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

--
-- Đang đổ dữ liệu cho bảng `batch`
--

INSERT INTO `batch` (`id`, `batchNumber`, `mfgDate`, `expiryDate`, `variantId`, `initialQty`, `currentQty`, `importPrice`, `createdAt`) VALUES
(1, '112', NULL, '2026-04-17 00:00:00.000', 1, 1, 91, 95000.00, '2026-04-17 04:34:15.289'),
(2, '113', NULL, '2026-04-17 00:00:00.000', 1, 1, 0, 95000.00, '2026-04-17 04:35:51.397'),
(3, '1135', NULL, '2026-04-17 00:00:00.000', 1, 1, 0, 95000.00, '2026-04-17 04:36:14.041'),
(4, '002', NULL, '2026-04-17 00:00:00.000', 1, 1, 0, 95000.00, '2026-04-17 04:38:24.001'),
(5, '1', NULL, '2026-04-17 00:00:00.000', 3, 9, 4, 10.00, '2026-04-17 05:32:12.199'),
(6, '2', NULL, '2026-04-17 00:00:00.000', 3, 10, 10, 10.00, '2026-04-17 08:50:21.878');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `category`
--

CREATE TABLE `category` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `category`
--

INSERT INTO `category` (`id`, `name`, `description`) VALUES
(1, 'Tấm Ốp Nano', 'Tấm ốp nano các kích thước'),
(2, 'Tấm Ốp Than Tre', 'tấm than tre các kích thước'),
(3, 'Phụ kiện bếp', 'àasfasfasfasf');

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

--
-- Đang đổ dữ liệu cho bảng `inventorydetail`
--

INSERT INTO `inventorydetail` (`id`, `transactionId`, `variantId`, `batchId`, `quantity`, `unitPrice`) VALUES
(1, 1, 1, 1, 1, 95000.00),
(2, 2, 1, 1, 100, 95000.00),
(3, 3, 1, 2, 1, 95000.00),
(4, 4, 1, 3, 1, 95000.00),
(5, 5, 1, 4, 1, 95000.00),
(6, 6, 3, 5, 9, 10.00),
(7, 7, 3, 6, 10, 10.00);

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

--
-- Đang đổ dữ liệu cho bảng `inventorytransaction`
--

INSERT INTO `inventorytransaction` (`id`, `code`, `type`, `status`, `userId`, `partnerId`, `note`, `createdAt`, `paidAmount`, `totalAmount`) VALUES
(1, 'PN455283', 'IMPORT', 'COMPLETED', 4, 1, '', '2026-04-17 04:34:15.285', 0.00, 95000.00),
(2, 'PN484578', 'IMPORT', 'COMPLETED', 4, 1, '', '2026-04-17 04:34:44.580', 0.00, 9500000.00),
(3, 'PN551394', 'IMPORT', 'COMPLETED', 4, 1, '', '2026-04-17 04:35:51.395', 0.00, 95000.00),
(4, 'PN574034', 'IMPORT', 'COMPLETED', 4, 1, '', '2026-04-17 04:36:14.036', 0.00, 95000.00),
(5, 'PN703994', 'IMPORT', 'COMPLETED', 4, 1, '', '2026-04-17 04:38:23.996', 0.00, 95000.00),
(6, 'PN932188', 'IMPORT', 'COMPLETED', 4, 1, '', '2026-04-17 05:32:12.191', 0.00, 90.00),
(7, 'PN821871', 'IMPORT', 'COMPLETED', 4, 1, '', '2026-04-17 08:50:21.873', 0.00, 100.00);

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
  `status` enum('PENDING','PROCESSING','SHIPPED','DELIVERED','COMPLETED','CANCELLED') NOT NULL DEFAULT 'PROCESSING',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `paidAmount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `note` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `order`
--

INSERT INTO `order` (`id`, `code`, `customerId`, `userId`, `totalAmount`, `discount`, `finalAmount`, `status`, `createdAt`, `paidAmount`, `note`) VALUES
(1, 'ORD708993', 4, 4, 24000.00, 0.00, 24000.00, 'DELIVERED', '2026-04-17 06:18:28.995', 24000.00, NULL),
(2, 'ORD797849', 4, 4, 18000.00, 0.00, 18000.00, 'DELIVERED', '2026-04-17 06:19:57.850', 18000.00, NULL),
(5, 'ORD664759', 4, 4, 460000.00, 0.00, 460000.00, 'DELIVERED', '2026-04-17 06:34:24.762', 460000.00, NULL),
(6, 'ORD688063', 4, 4, 115000.00, 0.00, 115000.00, 'DELIVERED', '2026-04-17 06:34:48.065', 115000.00, NULL),
(7, 'ORD319270', 5, 4, 115000.00, 0.00, 115000.00, 'DELIVERED', '2026-04-17 06:45:19.272', 115000.00, NULL),
(8, 'ORD335286', 5, 4, 115000.00, 0.00, 115000.00, 'DELIVERED', '2026-04-17 06:45:35.287', 115000.00, NULL),
(9, 'ORD302863', 4, 4, 115000.00, 0.00, 115000.00, 'COMPLETED', '2026-04-17 07:01:42.868', 115000.00, NULL),
(10, 'ORD452699', 4, 4, 6000.00, 0.00, 6000.00, 'COMPLETED', '2026-04-17 07:04:12.701', 6000.00, NULL),
(11, 'ORD747806', 4, 4, 236000.00, 0.00, 236000.00, 'COMPLETED', '2026-04-17 07:59:07.808', 236000.00, NULL),
(12, 'ORD769611', 4, 4, 115000.00, 0.00, 115000.00, 'COMPLETED', '2026-04-17 08:16:09.613', 115000.00, NULL),
(13, 'ORD837022', 4, 4, 115000.00, 0.00, 115000.00, 'COMPLETED', '2026-04-17 08:33:57.024', 115000.00, 'Nếu bạn hay bị treo server và lười phải gõ lệnh kill-port, bạn có'),
(14, 'ORD148979', 4, 4, 115000.00, 1000.00, 114000.00, 'COMPLETED', '2026-04-17 08:39:08.980', 112000.00, 'khách hàng đã chuyển khoản, giao hàng thu tiền'),
(15, 'HD698878', 4, 4, 18000.00, 0.00, 18000.00, 'COMPLETED', '2026-04-17 09:04:58.881', 18000.00, ''),
(16, 'HD840655', 4, 4, 6000.00, 1000.00, 5000.00, 'PENDING', '2026-04-17 09:07:20.657', 5000.00, ''),
(17, 'HD503926', 4, 4, 12000.00, 5000.00, 7000.00, 'PENDING', '2026-04-17 09:18:23.927', 7000.00, 'đã nhận tiền'),
(18, 'HD901954', 4, 4, 115000.00, 0.00, 115000.00, 'PENDING', '2026-04-17 09:41:41.957', 115000.00, ''),
(19, 'HD154452', 4, 4, 95000.00, 0.00, 95000.00, 'PENDING', '2026-04-17 09:45:54.454', 95000.00, ''),
(20, 'HD645881', 4, 4, 115000.00, 0.00, 115000.00, 'PENDING', '2026-04-17 09:54:05.883', 115000.00, ''),
(21, 'HD863953', 4, 4, 115000.00, 0.00, 115000.00, 'PENDING', '2026-04-17 09:57:43.955', 115000.00, ''),
(22, 'HD880336', 5, 4, 115000.00, 0.00, 115000.00, 'PENDING', '2026-04-17 09:58:00.338', 115000.00, ''),
(23, 'HD972652', 5, 4, 115000.00, 0.00, 115000.00, 'PENDING', '2026-04-17 09:59:32.654', 115000.00, ''),
(24, 'HD121337', 5, 4, 127000.00, 0.00, 127000.00, 'PENDING', '2026-04-17 10:02:01.339', 127000.00, '');

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

--
-- Đang đổ dữ liệu cho bảng `orderitem`
--

INSERT INTO `orderitem` (`id`, `orderId`, `variantId`, `batchId`, `quantity`, `price`) VALUES
(1, 1, 3, NULL, 4, 6000.00),
(2, 2, 3, NULL, 3, 6000.00),
(5, 5, 1, NULL, 4, 115000.00),
(6, 6, 1, NULL, 1, 115000.00),
(7, 7, 1, NULL, 1, 115000.00),
(8, 8, 1, NULL, 1, 115000.00),
(9, 9, 1, NULL, 1, 115000.00),
(10, 10, 3, NULL, 1, 6000.00),
(11, 11, 1, NULL, 2, 115000.00),
(12, 11, 3, NULL, 1, 6000.00),
(13, 12, 1, NULL, 1, 115000.00),
(14, 13, 1, NULL, 1, 115000.00),
(15, 14, 1, NULL, 1, 115000.00),
(16, 15, 3, NULL, 3, 6000.00),
(17, 16, 3, NULL, 1, 6000.00),
(18, 17, 3, NULL, 2, 6000.00),
(19, 18, 1, 1, 1, 115000.00),
(20, 19, 1, NULL, 1, 95000.00),
(21, 20, 1, NULL, 1, 115000.00),
(22, 21, 1, NULL, 1, 115000.00),
(23, 22, 1, NULL, 1, 115000.00),
(24, 23, 1, NULL, 1, 115000.00),
(25, 24, 3, NULL, 2, 6000.00),
(26, 24, 1, NULL, 1, 115000.00);

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

--
-- Đang đổ dữ liệu cho bảng `partner`
--

INSERT INTO `partner` (`id`, `type`, `name`, `phone`, `address`, `taxCode`, `debtBalance`) VALUES
(1, 'SUPPLIER', 'Công Ty Cổ Phần Thương Mại ABT', '0987767777', 'Tp Vinh - Nghệ An', '46546465', 0.00),
(2, 'SUPPLIER', 'Công Ty TNHH Vinh Phúc', '351646516', 'Hà Nội', '4165465', 0.00),
(3, 'SUPPLIER', 'Công Ty TNHH TAT VIỆT NAM', '0962155366', 'Thạch Thất - Hà Nội', '465465465', 0.00),
(4, 'CUSTOMER', 'Anh Hùng ABT', '0983233566', 'àdafasfafaf', NULL, 2000.00),
(5, 'CUSTOMER', 'Chị Linh', '54166516', 'adfasfasfaf', NULL, 0.00);

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

--
-- Đang đổ dữ liệu cho bảng `payment`
--

INSERT INTO `payment` (`id`, `code`, `type`, `amount`, `partnerId`, `orderId`, `method`, `note`, `createdAt`, `inventoryTransactionId`) VALUES
(1, 'REC709003', 'INCOME', 24000.00, 4, 1, 'CASH', 'Thanh toán cho đơn bán hàng ORD708993', '2026-04-17 06:18:29.004', NULL),
(2, 'REC797857', 'INCOME', 18000.00, 4, 2, 'CASH', 'Thanh toán cho đơn bán hàng ORD797849', '2026-04-17 06:19:57.858', NULL),
(3, 'REC664767', 'INCOME', 460000.00, 4, 5, 'CASH', 'Thanh toán cho đơn bán hàng ORD664759', '2026-04-17 06:34:24.768', NULL),
(4, 'REC688074', 'INCOME', 115000.00, 4, 6, 'CASH', 'Thanh toán cho đơn bán hàng ORD688063', '2026-04-17 06:34:48.076', NULL),
(5, 'REC319280', 'INCOME', 115000.00, 5, 7, 'CASH', 'Thanh toán cho đơn bán hàng ORD319270', '2026-04-17 06:45:19.281', NULL),
(6, 'REC335299', 'INCOME', 115000.00, 5, 8, 'CASH', 'Thanh toán cho đơn bán hàng ORD335286', '2026-04-17 06:45:35.300', NULL),
(7, 'REC302874', 'INCOME', 115000.00, 4, 9, 'CASH', 'Thanh toán cho đơn bán hàng ORD302863', '2026-04-17 07:01:42.875', NULL),
(8, 'REC452710', 'INCOME', 6000.00, 4, 10, 'CASH', 'Thanh toán cho đơn bán hàng ORD452699', '2026-04-17 07:04:12.712', NULL),
(9, 'REC747817', 'INCOME', 236000.00, 4, 11, 'CASH', 'Thanh toán cho đơn bán hàng ORD747806', '2026-04-17 07:59:07.818', NULL),
(10, 'REC769619', 'INCOME', 115000.00, 4, 12, 'CASH', 'Thanh toán cho đơn bán hàng ORD769611', '2026-04-17 08:16:09.621', NULL),
(11, 'REC837026', 'INCOME', 115000.00, 4, 13, 'CASH', 'Thanh toán cho đơn bán hàng ORD837022', '2026-04-17 08:33:57.028', NULL),
(12, 'REC148988', 'INCOME', 115000.00, 4, 14, 'CASH', 'Thanh toán cho đơn bán hàng ORD148979', '2026-04-17 08:39:08.989', NULL),
(13, 'REC698890', 'INCOME', 18000.00, 4, 15, 'CASH', 'Thanh toán cho đơn bán hàng HD698878', '2026-04-17 09:04:58.892', NULL),
(14, 'REC840661', 'INCOME', 5000.00, 4, 16, 'CASH', 'Thanh toán cho đơn bán hàng HD840655', '2026-04-17 09:07:20.662', NULL),
(15, 'REC503931', 'INCOME', 7000.00, 4, 17, 'CASH', 'Thanh toán cho đơn bán hàng HD503926', '2026-04-17 09:18:23.932', NULL),
(16, 'REC901961', 'INCOME', 115000.00, 4, 18, 'CASH', 'Thanh toán cho đơn bán hàng HD901954', '2026-04-17 09:41:41.963', NULL),
(17, 'REC154456', 'INCOME', 95000.00, 4, 19, 'CASH', 'Thanh toán cho đơn bán hàng HD154452', '2026-04-17 09:45:54.457', NULL),
(18, 'REC645888', 'INCOME', 115000.00, 4, 20, 'CASH', 'Thanh toán cho đơn bán hàng HD645881', '2026-04-17 09:54:05.889', NULL),
(19, 'REC863961', 'INCOME', 115000.00, 4, 21, 'CASH', 'Thanh toán cho đơn bán hàng HD863953', '2026-04-17 09:57:43.963', NULL),
(20, 'REC880346', 'INCOME', 115000.00, 5, 22, 'CASH', 'Thanh toán cho đơn bán hàng HD880336', '2026-04-17 09:58:00.347', NULL),
(21, 'REC972659', 'INCOME', 115000.00, 5, 23, 'CASH', 'Thanh toán cho đơn bán hàng HD972652', '2026-04-17 09:59:32.660', NULL),
(22, 'REC121344', 'INCOME', 127000.00, 5, 24, 'CASH', 'Thanh toán cho đơn bán hàng HD121337', '2026-04-17 10:02:01.345', NULL);

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

--
-- Đang đổ dữ liệu cho bảng `product`
--

INSERT INTO `product` (`id`, `code`, `name`, `description`, `categoryId`, `createdAt`, `updatedAt`) VALUES
(1, 'SP144706', 'Tấm Ốp Nano Abt 08', NULL, 1, '2026-04-17 04:29:04.707', '2026-04-17 04:29:04.707'),
(2, 'SP190608', 'Tấm Ốp Nano Abt 021', NULL, 1, '2026-04-17 04:29:50.609', '2026-04-17 04:29:50.609'),
(3, 'SP898994', 'Tấm Ốp Than Tre', NULL, 2, '2026-04-17 05:31:38.996', '2026-04-17 05:31:38.996');

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

--
-- Đang đổ dữ liệu cho bảng `productvariant`
--

INSERT INTO `productvariant` (`id`, `sku`, `productId`, `attributes`, `importPrice`, `sellPrice`, `stockCount`, `minStockLevel`) VALUES
(1, 'SKU-SP144706-1', 1, '{\"details\":\"Khổ 3000\"}', 95000.00, 115000.00, 91, 5),
(2, 'SKU-SP190608-1', 2, '{\"details\":\"dài 3m\"}', 95000.00, 115000.00, 0, 10),
(3, 'SKU-SP898994-1', 3, '{\"details\":\"pet acrylic\"}', 10.00, 6000.00, 7, 10);

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
('print_company_address', 'Số 10 Nguyễn Thiếp - P. Hạc Thành - T.Thanh Hoá'),
('print_company_logo', '/public/uploads/logo-1776411265831-729310422.png'),
('print_company_name', 'CÔNG TY TNHH THƯƠNG MẠI VÀ XÂY DỰNG TOP HOME'),
('print_company_phone', 'ĐT: 0922.860.999'),
('print_invoice_title', 'HOÁ ĐƠN BÁN HÀNG'),
('print_paper_size', 'a5'),
('print_show_discount', 'false'),
('print_show_signatures', 'false'),
('system_sidebar_logo', '/public/uploads/logo-1776397942126-667444183.png');

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
(2, 'sale@hungphat.com', '$2a$10$.5Elh8fgxypNUWhpUUr/xOa2sZm0VIaE0qWuGGl9otUfobb46T1Pq', 'Nhân viên Sale', '0912345678', 1, 2, '2026-04-13 16:11:11.166', '2026-04-17 09:32:59.557', NULL),
(3, 'kho@hungphat.com', '$2a$10$.5Elh8fgxypNUWhpUUr/xOa2sZm0VIaE0qWuGGl9otUfobb46T1Pq', 'Thủ Kho', '0999999999', 1, 3, '2026-04-13 16:11:11.166', '2026-04-13 10:05:12.000', NULL),
(4, 'manhhung.it.dhv@gmail.com', '$2b$10$gHnWAjfiFnSnWHKqoHxlz.zC8/ECA0w7NbQqv8I.EE7y5w70T80mS', 'Đỗ Hùng', '0983233566', 1, 1, '2026-04-15 13:37:19.038', '2026-04-17 06:07:38.458', '/public/uploads/logo-1776406058445-559708043.png');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `category`
--
ALTER TABLE `category`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `inventorydetail`
--
ALTER TABLE `inventorydetail`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `inventorytransaction`
--
ALTER TABLE `inventorytransaction`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `order`
--
ALTER TABLE `order`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT cho bảng `orderitem`
--
ALTER TABLE `orderitem`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT cho bảng `partner`
--
ALTER TABLE `partner`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `payment`
--
ALTER TABLE `payment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT cho bảng `product`
--
ALTER TABLE `product`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `productvariant`
--
ALTER TABLE `productvariant`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

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
