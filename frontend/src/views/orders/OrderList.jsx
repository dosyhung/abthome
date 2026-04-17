import React, { useState, useEffect, useRef } from 'react'
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
  CModalFooter
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilPrint, cilTrash, cilList } from '@coreui/icons'
import { useReactToPrint } from 'react-to-print'
import InvoicePrintTemplate from './InvoicePrintTemplate'
import axiosClient from '../../api/axiosClient'


// HELPER FUNCTIONS
// ===============================================
const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0)
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
const OrderList = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, addToast] = useState(0)
  const toaster = useRef()
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [selectedOrderToApprove, setSelectedOrderToApprove] = useState(null)

  // -- LOGIC IN ẤN --
  const [printData, setPrintData] = useState(null)
  const [printSettings, setPrintSettings] = useState({})
  const printComponentRef = useRef()

  const handlePrint = useReactToPrint({
    contentRef: printComponentRef,
    onAfterPrint: () => setPrintData(null),
  })

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
        setPrintData(orderRes.data)
        setTimeout(() => {
          handlePrint();
        }, 150)
      } else {
        alert("Không tải được chi tiết đơn hàng")
      }
    } catch (error) {
      console.error("Error fetching order detail", error)
      alert("Lỗi tải chi tiết đơn hàng")
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await axiosClient.get('/orders')
      if (res && res.data) {
        setOrders(res.data)
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
        <CButton color="info" className="text-white d-flex align-items-center gap-1">
          <CIcon icon={cilPlus} /> Tạo đơn mới
        </CButton>
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
                        {/* Font nổi bật */}
                        <span className="fw-bold text-primary">{order.code}</span>
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
                        <CButton color="secondary" variant="ghost" size="sm" title="Xem chi tiết">
                          <CIcon icon={cilList} />
                        </CButton>
                        <CButton 
                          color="info" 
                          variant="ghost" 
                          size="sm" 
                          className="mx-1" 
                          title="In Hóa Đơn"
                          onClick={() => onPrintClick(order)}
                        >
                          <CIcon icon={cilPrint} />
                        </CButton>
                        <CButton color="danger" variant="ghost" size="sm" title="Hủy Đơn" disabled={order.status === 'DELIVERED' || order.status === 'COMPLETED' || order.status === 'CANCELLED'}>
                          <CIcon icon={cilTrash} />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  )
                })}
              </CTableBody>
            </CTable>
          </div>
        )}
      </CCardBody>

      {/* Component In Ẩn */}
      <div style={{ position: 'absolute', top: '-10000px', left: '-10000px' }}>
        {printData && (
          <InvoicePrintTemplate 
            ref={printComponentRef} 
            orderData={printData} 
            settings={printSettings} 
          />
        )}
      </div>

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
