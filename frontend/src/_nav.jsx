import React from 'react'

// Icon Phosphor cũ dành cho các Sub-menu và mục Cài Đặt
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
  Image as ImageIcon
} from '@phosphor-icons/react'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

// Các file ảnh PNG local từ thư mục flaticon
import imgCategory from './assets/flaticon/category.png'
import imgTask from './assets/flaticon/completed-task.png'
import imgCoop from './assets/flaticon/cooperation.png'
import imgDebt from './assets/flaticon/debt.png'
import imgDebt2 from './assets/flaticon/debt2.png'
import imgFunding from './assets/flaticon/funding.png'
import imgGroup from './assets/flaticon/group.png'
import imgPackaging from './assets/flaticon/packaging.png'
import imgProducts from './assets/flaticon/products.png'
import imgRevenue from './assets/flaticon/revenue.png'
import imgWarehouse from './assets/flaticon/warehouse.png'
import shoppinglist from './assets/flaticon/shopping-list.png'
import ecommerce from './assets/flaticon/ecommerce.png'
import bestproduct from './assets/flaticon/best-product.png'
import sothu from './assets/flaticon/sothu.png'
import setting from './assets/flaticon/settings.png'
import printer from './assets/flaticon/printer.png'
import picture from './assets/flaticon/picture.png'
import warning from './assets/flaticon/warning.png'
import restock from './assets/flaticon/restock.png'
import adjust from './assets/flaticon/adjust.png'
import dashboard from './assets/flaticon/dashboard.png'

// Wrappers giúp chuẩn hóa kích thước của ảnh khi chèn vào Navigation
const makeIcon = (src) => (
  <img src={src} className="nav-icon" style={{ width: '26px', height: '26px', objectFit: 'contain', filter: 'drop-shadow(1px 2px 3px rgba(0,0,0,0.1))', marginRight: '16px' }} alt="icon" />
)
const makeSmallIcon = (src) => (
  <img src={src} className="nav-icon" style={{ width: '20px', height: '20px', objectFit: 'contain', opacity: 0.9, marginRight: '16px' }} alt="icon" />
)

const _nav = [
  {
    component: CNavItem,
    name: 'Trang Chủ',
    to: '/dashboard',
    // Dùng hình ảnh Doanh Thu làm biểu tượng Dashboard
    icon: makeIcon(dashboard),
  },
  {
    component: CNavTitle,
    name: 'Quản Lý Bán Hàng',
  },
  {
    component: CNavGroup,
    name: 'Quản Lý Bán Hàng',
    icon: makeIcon(imgTask),
    items: [
      {
        component: CNavItem,
        name: 'Danh Sách Đơn Hàng',
        icon: makeSmallIcon(shoppinglist),
        to: '/orders/list',
      },
      {
        component: CNavItem,
        name: 'Tạo Hoá Đơn Bán',
        icon: makeSmallIcon(ecommerce),
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
    icon: makeIcon(imgProducts),
    items: [
      {
        component: CNavItem,
        name: 'Quản Lý Sản Phẩm',
        to: '/products/list',
        icon: makeIcon(bestproduct),
      },
      {
        component: CNavItem,
        name: 'Điều chỉnh giá vốn',
        to: '/products/cost-adjustment',
        icon: makeSmallIcon(adjust),
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
    icon: makeIcon(imgCategory),
  },
  {
    component: CNavTitle,
    name: 'Quản Lý Kho',
  },
  {
    component: CNavGroup,
    name: 'Quản Lý Kho',
    icon: makeIcon(imgWarehouse),
    items: [
      {
        component: CNavItem,
        name: 'Danh sách Phiếu Nhập',
        to: '/inventory/list',
        icon: makeSmallIcon(imgTask)
      },
      {
        component: CNavItem,
        name: 'Tạo Phiếu Nhập',
        to: '/inventory/import',
        // Dùng icon Đóng gói hàng cho Phiếu Nhập
        icon: makeSmallIcon(imgPackaging),
      },
      {
        component: CNavItem,
        name: 'Cảnh báo tồn kho',
        to: '/inventory/low-stock',
        icon: makeSmallIcon(warning),
      },
      {
        component: CNavItem,
        name: 'Phiếu Kiểm Kê',
        to: '/inventory/stocktakes',
        icon: makeSmallIcon(restock),
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
    icon: makeIcon(imgCoop),
    items: [
      {
        component: CNavItem,
        name: 'Quản lý Khách Hàng',
        to: '/partners/customers',
        icon: makeSmallIcon(imgGroup),
      },
      {
        component: CNavItem,
        name: 'Danh sách Nhà Cung Cấp',
        to: '/partners/suppliers',
        icon: makeSmallIcon(imgCoop),
      },
      {
        component: CNavItem,
        name: 'Thu nợ Khách Hàng',
        to: '/partners/debt',
        icon: makeSmallIcon(imgDebt),
      },
      {
        component: CNavItem,
        name: 'Chi nợ Nhà Cung Cấp',
        to: '/partners/supplier-debt',
        icon: makeSmallIcon(imgDebt2),
      },
    ],
  },
  {
    component: CNavTitle,
    name: 'Quản Lý Thu Chi',
  },
  {
    component: CNavGroup,
    name: 'Sổ Quỹ Kế Toán',
    icon: makeIcon(imgFunding),
    items: [
      {
        component: CNavItem,
        name: 'Sổ Quỹ Thu / Chi',
        to: '/cashbook',
        icon: makeSmallIcon(sothu),
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
    icon: makeIcon(imgGroup),
  },
  {
    component: CNavTitle,
    name: 'Quản Lý Hệ Thống',
  },
  {
    component: CNavGroup,
    name: 'Cấu Hình Hệ Thống',
    icon: makeIcon(setting),
    items: [
      {
        component: CNavItem,
        name: 'Cấu Hình In Ấn',
        to: '/settings/print',
        icon: makeSmallIcon(printer),
      },
      {
        component: CNavItem,
        name: 'Cài Đặt Logo App',
        to: '/settings/logo',
        icon: makeSmallIcon(picture),
      },
    ]
  },
]

export default _nav
