/**
 * Application Routes Configuration
 *
 * Defines all protected routes in the application using React lazy loading
 * for code splitting and performance optimization.
 *
 * Each route object contains:
 * - path: URL path for the route
 * - name: Human-readable name for breadcrumbs
 * - element: Lazy-loaded React component
 * - exact: (optional) Requires exact path match
 *
 * @module routes
 */

import React from 'react'

// Dashboard
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

// Quản trị Nhân viên & Hồ sơ
const UserList = React.lazy(() => import('./views/users/UserList'))
const UserProfile = React.lazy(() => import('./views/users/UserProfile'))
const AttendanceReport = React.lazy(() => import('./views/users/AttendanceReport'))
const SalaryList = React.lazy(() => import('./views/users/SalaryList'))


// Products & Inventory
const ProductList = React.lazy(() => import('./views/products/ProductList'))
const ProductCreate = React.lazy(() => import('./views/products/ProductCreate'))
const ProductEdit = React.lazy(() => import('./views/products/ProductEdit'))
const CostAdjustment = React.lazy(() => import('./views/products/CostAdjustment'))
const CategoryList = React.lazy(() => import('./views/products/CategoryList'))
const ImportInventoryForm = React.lazy(() => import('./views/inventory/ImportInventoryForm'))
const InventoryList = React.lazy(() => import('./views/inventory/InventoryList'))
const LowStockWarning = React.lazy(() => import('./views/inventory/LowStockWarning'))
const StocktakeList = React.lazy(() => import('./views/inventory/StocktakeList'))
const StocktakeCreate = React.lazy(() => import('./views/inventory/StocktakeCreate'))
const StocktakeDetail = React.lazy(() => import('./views/inventory/StocktakeDetail'))

// Orders
const OrderList = React.lazy(() => import('./views/orders/OrderList'))
const CreateOrder = React.lazy(() => import('./views/orders/CreateOrder'))
const OrderDetail = React.lazy(() => import('./views/orders/OrderDetail'))

// Partners
const CustomerList = React.lazy(() => import('./views/partners/CustomerList'))
const CustomerDebt = React.lazy(() => import('./views/partners/CustomerDebt'))
const SupplierDebt = React.lazy(() => import('./views/partners/SupplierDebt'))
const SupplierList = React.lazy(() => import('./views/partners/SupplierList'))

// Finance
const Cashbook = React.lazy(() => import('./views/cashbook/Cashbook'))

// Settings
const PrintSettings = React.lazy(() => import('./views/settings/PrintSettings'))
const LogoSettings = React.lazy(() => import('./views/settings/LogoSettings'))
/**
 * Array of route configuration objects
 *
 * @type {Array<Object>}
 * @property {string} path - URL path pattern
 * @property {string} name - Display name for breadcrumbs and navigation
 * @property {React.LazyExoticComponent} element - Lazy-loaded component
 * @property {boolean} [exact] - Whether to match path exactly
 *
 * @example
 * // Route renders when URL matches '/dashboard'
 * { path: '/dashboard', name: 'Dashboard', element: Dashboard }
 *
 * @example
 * // Route with exact match required
 * { path: '/base', name: 'Base', element: Cards, exact: true }
 */
export const routes = [
  { path: '/', exact: true, name: 'Trang Chủ' },
  { path: '/dashboard', name: 'Thống Kê', element: Dashboard },

  { path: '/products', name: 'Sản phẩm', exact: true },
  { path: '/products/list', name: 'Danh mục vật tư/SP', element: ProductList },
  { path: '/products/cost-adjustment', name: 'Điều chỉnh giá vốn', element: CostAdjustment },
  { path: '/products/create', name: 'Thêm mới Sản Phẩm', element: ProductCreate },
  { path: '/products/edit/:id', name: 'Cập nhật Sản Phẩm', element: ProductEdit },
  { path: '/products/categories', name: 'Quản lý Danh Mục', element: CategoryList },
  { path: '/inventory', name: 'Giao dịch Kho', exact: true },
  { path: '/inventory/list', name: 'Danh sách Phiếu', element: InventoryList },
  { path: '/inventory/import', name: 'Nhập kho', element: ImportInventoryForm },
  { path: '/inventory/low-stock', name: 'Cảnh báo tồn kho', element: LowStockWarning },
  { path: '/inventory/stocktakes', name: 'Phiếu Kiểm Kê', element: StocktakeList, exact: true },
  { path: '/inventory/stocktakes/create', name: 'Tạo Phiếu Kiểm Kê', element: StocktakeCreate },
  { path: '/inventory/stocktakes/:id', name: 'Chi tiết Kiểm Kê', element: StocktakeDetail },
  { path: '/orders', name: 'Bán hàng', exact: true },
  { path: '/orders/list', name: 'Quản lý Đơn hàng', element: OrderList },
  { path: '/orders/create', name: 'Tạo đơn mới (POS)', element: CreateOrder },
  { path: '/orders/detail', name: 'Chi tiết Đơn hàng', element: OrderDetail },
  { path: '/orders/detail/:id', name: 'Chi tiết ID', element: OrderDetail },
  { path: '/partners', name: 'Đối tác', exact: true },
  { path: '/partners/customers', name: 'Quản lý Khách hàng', element: CustomerList },
  { path: '/partners/suppliers', name: 'Nhà cung cấp', element: SupplierList },
  { path: '/partners/debt', name: 'Thu Nợ Khách hàng', element: CustomerDebt },
  { path: '/partners/supplier-debt', name: 'Chi Nợ Nhà Cung Cấp', element: SupplierDebt },
  { path: '/cashbook', name: 'Sổ Quỹ', element: Cashbook },
  { path: '/users', name: 'Quản lý Nhân viên v2', element: UserList },
  { path: '/users/attendance-report', name: 'Bảng Chấm Công', element: AttendanceReport },
  { path: '/users/salary', name: 'Lương Nhân Viên', element: SalaryList },
  { path: '/profile', name: 'Hồ sơ Cá nhân', element: UserProfile },
  { path: '/settings', name: 'Cấu hình Hệ thống', exact: true },
  { path: '/settings/print', name: 'Cấu Hình In Ấn', element: PrintSettings },
  { path: '/settings/logo', name: 'Cấu hình logo app', element: LogoSettings },
]

export default routes
