import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CBadge,
  CToaster,
  CToast,
  CToastHeader,
  CToastBody,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormInput,
  CFormTextarea,
  CFormSelect,
  CPagination,
  CPaginationItem
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilPrint, cilTrash, cilList, cilWarning } from '@coreui/icons'
import InvoicePrintTemplate from './InvoicePrintTemplate'
import axiosClient from '../../api/axiosClient'


// HELPER FUNCTIONS
// ===============================================
const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0)
}

const formatInputCurrency = (val) => {
  if (val === 0) return ''
  if (!val) return ''
  return new Intl.NumberFormat('vi-VN').format(val)
}

const parseInputCurrency = (val) => {
  const cleanStr = val.toString().replace(/\D/g, '')
  return cleanStr ? Number(cleanStr) : 0
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
}

const getOrderStatusBadge = (status) => {
  const statusMap = {
    PENDING: { color: 'warning', text: 'Chờ duyệt' },
    COMPLETED: { color: 'success', text: 'Hoàn thành' },
    PROCESSING: { color: 'warning', text: 'Đang xử lý' },
    SHIPPED: { color: 'info', text: 'Đã gửi đi' },
    DELIVERED: { color: 'success', text: 'Hoàn thành' },
    CANCELLED: { color: 'danger', text: 'Đã Hủy' }
  }
  return statusMap[status] || { color: 'secondary', text: status }
}

const getShippingStatusBadge = (shipping) => {
  if (!shipping || !shipping.status) return { color: 'secondary', text: 'Chưa có' }
  const statusMap = {
    PENDING: { color: 'warning', text: 'Chờ lấy hàng' },
    IN_TRANSIT: { color: 'info', text: 'Đang giao' },
    DELIVERED: { color: 'success', text: 'Đã phát' },
    RETURNED: { color: 'danger', text: 'Hoàn hàng' }
  }
  return statusMap[shipping.status] || { color: 'secondary', text: shipping.status }
}

// ===============================================
// MAIN COMPONENT
// ===============================================
// ===============================================
const OrderList = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, addToast] = useState(0)
  const toaster = useRef()
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [selectedOrderToApprove, setSelectedOrderToApprove] = useState(null)

  // -- LOGIC PHÂN TRANG & LỌC --
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [timeFilter, setTimeFilter] = useState('ALL')

  // -- LOGIC IN ẤN --
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [printData, setPrintData] = useState(null)
  const [printSettings, setPrintSettings] = useState({})

  const onPrintClick = async (orderSummary) => {
    // 1. Fetch settings
    try {
      const resSettings = await axiosClient.get('/settings')
      setPrintSettings(resSettings)
    } catch (error) {
      console.warn("Could not fetch print settings", error)
    }

    // 2. Fetch order details
    try {
      const orderRes = await axiosClient.get(`/orders/${orderSummary.id}`)
      if (orderRes && orderRes.data) {
        setPrintData({
          ...orderRes.data,
          originalPaidAmount: orderRes.data.paidAmount
        })
        setShowPrintModal(true)
      } else {
        alert("Không tải được chi tiết đơn hàng")
      }
    } catch (error) {
      console.error("Error fetching order detail", error)
      alert("Lỗi tải chi tiết đơn hàng")
    }
  }

  // Cập nhật Nhanh (Lưu vào DB Dữ liệu in ảo)
  const handleQuickUpdateOrder = async () => {
    try {
      if (!printData) return;
      await axiosClient.patch(`/orders/${printData.id}/quick-update`, {
        note: printData.note,
        paidAmount: printData.paidAmount,
        discount: printData.discount
      });
      addToast(
        <CToast color="success" className="text-white align-items-center">
          <CToastHeader closeButton>
            <strong className="me-auto">Thành công</strong>
          </CToastHeader>
          <CToastBody>Đã lưu Cập nhật In Ấn vào Hệ thống!</CToastBody>
        </CToast>
      );
      fetchOrders(); // Reload background data
    } catch (e) {
      console.error(e);
      alert('Lỗi cập nhật ' + (e.response?.data?.message || e.message));
    }
  }

  useEffect(() => {
    fetchOrders(1, timeFilter)
  }, [timeFilter])

  const fetchOrders = async (page = 1, currentFilter = timeFilter) => {
    try {
      setLoading(true)
      const res = await axiosClient.get(`/orders?page=${page}&limit=11&timeFilter=${currentFilter}`)
      if (res && res.data) {
        setOrders(res.data)
        if (res.meta) {
          setTotalPages(res.meta.totalPages || 1)
          setCurrentPage(res.meta.currentPage || 1)
        }
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveOrder = async () => {
    if (!selectedOrderToApprove) return;
    try {
      await axiosClient.patch(`/orders/${selectedOrderToApprove.id}/approve`)
      addToast(
        <CToast color="success" className="text-white align-items-center">
          <CToastHeader closeButton>
            <strong className="me-auto">Thành công</strong>
          </CToastHeader>
          <CToastBody>Duyệt đơn và xuất kho thành công!</CToastBody>
        </CToast>
      )
      setShowApproveModal(false)
      fetchOrders() // Tải lại danh sách
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Lỗi khi duyệt đơn')
    }
  }

  return (
    <>
    <CCard className="mb-4">
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <strong>Quản lý đơn hàng bán</strong>
        <div className="d-flex gap-2">
          {/* Nút màng lọc */}
          <CFormSelect 
            value={timeFilter}
            onChange={(e) => {
              setTimeFilter(e.target.value)
              setCurrentPage(1) // Về lại trang 1 khi đổi màng lọc
            }}
            style={{ width: '180px', cursor: 'pointer' }}
          >
            <option value="ALL">Tất cả thời gian</option>
            <option value="TODAY">Hôm nay</option>
            <option value="WEEK">Tuần này</option>
            <option value="MONTH">Tháng này</option>
          </CFormSelect>

          <CButton 
            color="info" 
            className="text-white d-flex align-items-center gap-1"
            onClick={() => navigate('/orders/create')}
          >
            <CIcon icon={cilPlus} /> Tạo đơn mới
          </CButton>
        </div>
      </CCardHeader>
      <CCardBody>
        {loading ? (
          <div className="text-center">Đang tải dữ liệu đơn hàng...</div>
        ) : (
          <div className="table-responsive">
            <CTable hover align="middle" responsive>
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell>Mã Đơn</CTableHeaderCell>
                  <CTableHeaderCell>Ngày Tạo</CTableHeaderCell>
                  <CTableHeaderCell>Khách Hàng</CTableHeaderCell>
                  <CTableHeaderCell className="text-end">Tổng Tiền</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Trạng Thái Đơn</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Vận Chuyển</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Hành Động</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {orders.map((order) => {
                  const orderBadge = getOrderStatusBadge(order.status)
                  const shippingBadge = getShippingStatusBadge(order.shipping)
                  
                  return (
                    <CTableRow key={order.id}>
                      <CTableDataCell>
                        <span 
                          className="fw-bold text-primary" 
                          style={{ cursor: 'pointer', textDecoration: 'underline' }} 
                          title="Xem lại Hóa Đơn"
                          onClick={() => onPrintClick(order)}
                        >
                          {order.code}
                        </span>
                      </CTableDataCell>
                      <CTableDataCell>{formatDate(order.createdAt)}</CTableDataCell>
                      <CTableDataCell>
                        <strong>{order.customer?.name}</strong>
                      </CTableDataCell>
                      <CTableDataCell className="text-end fw-semibold">
                        {formatCurrency(order.finalAmount)}
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        {order.status === 'PENDING' ? (
                          <CBadge 
                            color={orderBadge.color} 
                            shape="rounded-pill" 
                            className="px-3 py-2"
                            style={{ cursor: 'pointer' }}
                            title="Click để duyệt đơn"
                            onClick={() => { setSelectedOrderToApprove(order); setShowApproveModal(true); }}
                          >
                            {orderBadge.text}
                          </CBadge>
                        ) : (
                          <CBadge color={orderBadge.color} shape="rounded-pill" className="px-3 py-2">
                            {orderBadge.text}
                          </CBadge>
                        )}
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        <CBadge color={shippingBadge.color} className="px-2 py-1">
                          {shippingBadge.text}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell className="text-center text-nowrap">
                        <CButton 
                          color="secondary" 
                          variant="ghost" 
                          size="sm" 
                          title="Chi tiết & Hóa đơn"
                          onClick={() => onPrintClick(order)}
                        >
                          <CIcon icon={cilList} />
                        </CButton>
                        <CButton 
                          color="info" 
                          variant="ghost" 
                          size="sm" 
                          className="mx-1" 
                          title="In Hóa Đơn Nhanh"
                          onClick={() => onPrintClick(order)}
                        >
                          <CIcon icon={cilPrint} />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  )
                })}
              </CTableBody>
            </CTable>

            {/* BỘ PHÂN TRANG */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-4">
                <CPagination aria-label="Page navigation" className="mb-0">
                  <CPaginationItem 
                    disabled={currentPage === 1} 
                    onClick={() => fetchOrders(currentPage - 1)}
                    style={{ cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                  >
                    Trang trước
                  </CPaginationItem>
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <CPaginationItem 
                      key={i + 1} 
                      active={i + 1 === currentPage} 
                      onClick={() => fetchOrders(i + 1)}
                      style={{ cursor: 'pointer' }}
                    >
                      {i + 1}
                    </CPaginationItem>
                  ))}
                  
                  <CPaginationItem 
                    disabled={currentPage === totalPages} 
                    onClick={() => fetchOrders(currentPage + 1)}
                    style={{ cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                  >
                    Trang sau
                  </CPaginationItem>
                </CPagination>
              </div>
            )}
          </div>
        )}
      </CCardBody>

      {/* Component In PDF Modal */}
      <CModal size="xl" visible={showPrintModal} onClose={() => { setShowPrintModal(false); setPrintData(null); }} alignment="center">
        <CModalHeader>
          <CModalTitle>Xem và In Hóa Đơn (PDF)</CModalTitle>
        </CModalHeader>
        <CModalBody style={{ height: '85vh', padding: 0, display: 'flex' }}>
          {/* Bảng Điều Khiển Sửa Nhanh */}
          <div style={{ width: '320px', backgroundColor: '#f8f9fa', padding: '20px', borderRight: '1px solid #ddd', overflowY: 'auto' }}>
            <h5 className="mb-4 text-primary">Chỉnh Sửa Nhanh</h5>
            <div className="mb-3">
              <label className="form-label fw-bold">Chiết khấu (VNĐ)</label>
              <CFormInput 
                type="text"
                className="text-end"
                value={formatInputCurrency(printData?.discount)}
                onChange={(e) => setPrintData({...printData, discount: parseInputCurrency(e.target.value)})}
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">Khách đưa (Thanh toán)</label>
              <CFormInput 
                type="text"
                className="text-end"
                value={formatInputCurrency(printData?.paidAmount)}
                onChange={(e) => setPrintData({...printData, paidAmount: parseInputCurrency(e.target.value)})}
              />
            </div>
            <div className="mb-4">
              <label className="form-label fw-bold">Ghi chú in</label>
              <CFormTextarea 
                rows={4}
                value={printData?.note || ''}
                onChange={(e) => setPrintData({...printData, note: e.target.value})}
              />
            </div>
            <CButton color="primary" size="lg" className="w-100 mb-3" onClick={handleQuickUpdateOrder}>
              LƯU VÀO SỔ NỢ
            </CButton>
            <div className="text-muted small">
              <CIcon icon={cilWarning} className="me-1" />
              Mẹo: Các ô trên có tác dụng cập nhật chữ trực tiếp lên Hóa Đơn bên phải theo Thời Gian Thực. Bấm Lưu để chốt ghi đè vào Hệ thống CSDL.
            </div>
          </div>

          <div style={{ flex: 1, height: '100%' }}>
            {printData && (
              <InvoicePrintTemplate 
                orderData={printData} 
                settings={printSettings} 
              />
            )}
          </div>
        </CModalBody>
      </CModal>

    </CCard>
      
      <CToaster ref={toaster} push={toast} placement="top-end" />

      {/* Modal Duyệt Đơn */}
      <CModal visible={showApproveModal} onClose={() => setShowApproveModal(false)} alignment="center">
        <CModalHeader>
          <CModalTitle>Xác nhận duyệt đơn hàng</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Bạn có chắc chắn muốn duyệt lệnh trừ kho cho đơn hàng số <strong className="text-primary">{selectedOrderToApprove?.code}</strong> không?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowApproveModal(false)}>
            Hủy
          </CButton>
          <CButton color="success" className="text-white" onClick={handleApproveOrder}>
            Xác nhận
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default OrderList
