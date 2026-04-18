/**
 * Sidebar Navigation Configuration
 *
 * Defines the structure and content of the sidebar navigation menu.
 * Supports multiple navigation component types from CoreUI React:
 * - CNavItem: Single navigation link
 * - CNavGroup: Collapsible group of links
 * - CNavTitle: Section title/divider
 *
 * @module _nav
 */

import React from 'react'
import {
  Gauge,
  Receipt,
  ListDashes,
  PlusCircle,
  Package,
  Tag,
  Stack,
  ClockCounterClockwise,
  Users,
  Buildings,
  Money,
  Bank,
  Gear,
  Image
} from '@phosphor-icons/react'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

/**
 * Navigation menu structure array
 */
const _nav = [
  {
    component: CNavItem,
    name: 'Trang Chủ',
    to: '/dashboard',
    icon: <Gauge size={24} weight="duotone" className="nav-icon text-info" />,
  },
  {
    component: CNavTitle,
    name: 'Quản Lý Bán Hàng',
  },
  {
    component: CNavGroup,
    name: 'Quản Lý Bán Hàng',
    icon: <Receipt size={24} weight="duotone" className="nav-icon text-warning" />,
    items: [
      {
        component: CNavItem,
        name: 'Danh Sách Đơn Hàng',
        icon: <ListDashes size={20} weight="duotone" className="nav-icon text-warning" style={{ opacity: 0.8 }} />,
        to: '/orders/list',
      },
      {
        component: CNavItem,
        name: 'Tạo Hoá Đơn Bán',
        icon: <PlusCircle size={20} weight="duotone" className="nav-icon text-warning" style={{ opacity: 0.8 }} />,
        to: '/orders/create',
      },
    ],
  },
  {
    component: CNavTitle,
    name: 'Quản Sản Phẩm',
  },
  {
    component: CNavGroup,
    name: 'Quản Lý Sản Phẩm',
    icon: <Package size={24} weight="duotone" className="nav-icon text-primary" />,
    items: [
      {
        component: CNavItem,
        name: 'Quản Lý Sản Phẩm',
        to: '/products/list',
        icon: <Stack size={20} weight="duotone" className="nav-icon text-primary" style={{ opacity: 0.8 }} />,
      },
    ],
  },
  {
    component: CNavTitle,
    name: 'Quản Lý Danh Mục',
  },
  {
    component: CNavItem,
    name: 'Danh Mục Sản Phẩm',
    to: '/products/categories',
    icon: <Tag size={20} weight="duotone" className="nav-icon text-primary" style={{ opacity: 0.8 }} />,
  },
  {
    component: CNavTitle,
    name: 'Quản Lý Kho',
  },
  {
    component: CNavGroup,
    name: 'Quản Lý Kho',
    icon: <Package size={24} weight="duotone" className="nav-icon text-primary" />,
    items: [
      {
        component: CNavItem,
        name: 'Quản lý Danh Mục',
        to: '/products/categories',
        icon: <Tag size={20} weight="duotone" className="nav-icon text-primary" style={{ opacity: 0.8 }} />,
      },
      {
        component: CNavItem,
        name: 'Danh sách Phiếu Nhập',
        to: '/inventory/list',
        icon: <ClockCounterClockwise size={20} weight="duotone" className="nav-icon text-primary" style={{ opacity: 0.8 }} />,
      },
      {
        component: CNavItem,
        name: 'Tạo Phiếu Nhập',
        to: '/inventory/import',
        icon: <PlusCircle size={20} weight="duotone" className="nav-icon text-primary" style={{ opacity: 0.8 }} />,
      },
    ],
  },
  {
    component: CNavTitle,
    name: 'Khách Hàng & Đối Tác',
  },
  {
    component: CNavGroup,
    name: 'Khách hàng & Đối tác',
    icon: <Users size={24} weight="duotone" className="nav-icon text-success" />,
    items: [
      {
        component: CNavItem,
        name: 'Danh sách Nhà Cung Cấp',
        to: '/partners/suppliers',
        icon: <Buildings size={20} weight="duotone" className="nav-icon text-success" style={{ opacity: 0.8 }} />,
      },
      {
        component: CNavItem,
        name: 'Thu nợ Khách Hàng',
        to: '/partners/debt',
        icon: <Money size={20} weight="duotone" className="nav-icon text-success" style={{ opacity: 0.8 }} />,
      },
      {
        component: CNavItem,
        name: 'Chi nợ Nhà Cung Cấp',
        to: '/partners/supplier-debt',
        icon: <Bank size={20} weight="duotone" className="nav-icon text-success" style={{ opacity: 0.8 }} />,
      },
    ],
  },
  {
    component: CNavTitle,
    name: 'Quản Lý Thu Chi',
  },
  {
    component: CNavGroup,
    name: 'Tài chính & Sổ quỹ',
    icon: <Bank size={24} weight="duotone" className="nav-icon text-danger" />,
    items: [
      {
        component: CNavItem,
        name: 'Sổ Lịch sử Thu/Chi',
        to: '/cashbook',
        icon: <ClockCounterClockwise size={20} weight="duotone" className="nav-icon text-danger" style={{ opacity: 0.8 }} />,
      },
    ],
  },
  {
    component: CNavTitle,
    name: 'Quản Lý Nhân Sự',
  },
  {
    component: CNavItem,
    name: 'Quản lý Nhân Viên',
    to: '/users',
    icon: <Users size={24} weight="duotone" className="nav-icon text-info" />,
  },
  {
    component: CNavTitle,
    name: 'Quản Lý Hệ Thống',
  },
  {
    component: CNavGroup,
    name: 'Cấu Hình Hệ Thống',
    icon: <Gear size={24} weight="duotone" className="nav-icon text-secondary" />,
    items: [
      {
        component: CNavItem,
        name: 'Cấu Hình In Ấn',
        to: '/settings/print',
        icon: <Gear size={20} weight="duotone" className="nav-icon text-secondary" style={{ opacity: 0.8 }} />,
      },
      {
        component: CNavItem,
        name: 'Cài Đặt Logo App',
        to: '/settings/logo',
        icon: <Image size={20} weight="duotone" className="nav-icon text-secondary" style={{ opacity: 0.8 }} />,
      },
    ]
  },
]

export default _nav
