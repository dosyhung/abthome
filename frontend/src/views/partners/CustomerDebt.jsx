import React, { useState, useEffect } from 'react'
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
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  CInputGroup,
  CInputGroupText,
  CRow,
  CCol,
  CBadge
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilMoney, cilUser } from '@coreui/icons'

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0)
}

const CustomerDebt = () => {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)

  // -- Modal State --
  const [visible, setVisible] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  
  // -- Unpaid Orders State --
  const [unpaidOrders, setUnpaidOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)

  // -- Thu nợ Form State --
  const [payAmount, setPayAmount] = useState('')
  const [payMethod, setPayMethod] = useState('Tiền mặt')
  const [payNote, setPayNote] = useState('')

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/payments/partners/debt?type=CUSTOMER')
      if (res.ok) {
        const data = await res.json()
        setCustomers(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const openModal = async (customer) => {
    setSelectedCustomer(customer)
    setVisible(true)
    setUnpaidOrders([])
    setSelectedOrder(null)
    setPayAmount('')
    
    // Fetch Unpaid Orders for this customer
    try {
      const res = await fetch(`/api/payments/partners/${customer.id}/unpaid-orders`)
      if (res.ok) {
        const orders = await res.json()
        setUnpaidOrders(orders)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleSelectOrder = (order) => {
    setSelectedOrder(order)
    const debtAmount = Number(order.finalAmount) - Number(order.paidAmount)
    setPayAmount(String(debtAmount))
    setPayNote(`Thu nợ Đơn hàng: ${order.code} của KH: ${selectedCustomer?.name}`)
  }

  const handleCollectDebt = async () => {
    const amountToCollect = Number(payAmount)
    
    if (!amountToCollect || amountToCollect <= 0) {
      alert("Vui lòng nhập số tiền hợp lệ!")
      return
    }

    // Prepare API Body
    const bodyArgs = {
      partnerId: selectedCustomer?.id,
      amount: amountToCollect,
      method: payMethod,
      note: payNote
    }

    if (selectedOrder) {
      bodyArgs.orderId = selectedOrder.id
    }

    try {
      const res = await fetch('/api/payments/receive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyArgs)
      })

      if (res.ok) {
        alert(`Thu thành công ${formatCurrency(amountToCollect)}!`)
        setVisible(false)
        fetchCustomers() // Refresh
      } else {
        const errorData = await res.json()
        alert(`Lỗi: ${errorData.message || 'Không thể thu tiền'}`)
      }
    } catch (error) {
      console.error(error)
      alert("Đã xảy ra lỗi mạng!")
    }
  }

  return (
    <>
      <CCard className="mb-4 shadow-sm border-top-primary border-top-3">
        <CCardHeader className="bg-white pb-0 d-flex justify-content-between align-items-center">
          <h5 className="mb-3 text-primary"><CIcon icon={cilUser} className="me-2"/>Quản lý Công nợ Khách hàng</h5>
        </CCardHeader>
        <CCardBody>
          {loading ? (
            <div className="text-center py-5">Đang tải dữ liệu công nợ...</div>
          ) : customers.length === 0 ? (
             <div className="text-center text-success fw-bold py-5 fs-5">
              Tuyệt vời! Hiện tại không có khách hàng nào đang nợ.
            </div>
          ) : (
            <CTable bordered hover responsive align="middle">
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell>Khách hàng</CTableHeaderCell>
                  <CTableHeaderCell>Điện thoại</CTableHeaderCell>
                  <CTableHeaderCell className="text-end">Dư Nợ Tổng</CTableHeaderCell>
                  <CTableHeaderCell className="text-center" style={{ width: '150px' }}>Hành động</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {customers.map((c) => (
                  <CTableRow key={c.id}>
                    <CTableDataCell>
                       <strong className="d-block">{c.name}</strong>
                    </CTableDataCell>
                    <CTableDataCell>{c.phone}</CTableDataCell>
                    <CTableDataCell className="text-end fw-bold text-danger fs-6">
                      {formatCurrency(c.debtBalance)}
                    </CTableDataCell>
                    <CTableDataCell className="text-center">
                      <CButton 
                        color="success" 
                        size="sm" 
                        variant="outline"
                        className="d-flex align-items-center justify-content-center m-auto gap-1 fw-bold"
                        onClick={() => openModal(c)}
                      >
                        <CIcon icon={cilMoney} /> Chi tiết & Thu
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>

      <CModal 
        size="lg"
        visible={visible} 
        onClose={() => setVisible(false)}
        backdrop="static"
      >
        <CModalHeader onClose={() => setVisible(false)}>
          <CModalTitle className="text-primary fw-bold">Chi tiết Nợ & Thu tiền - {selectedCustomer?.name}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CRow>
            {/* Modal Đôi: Bên trái chọn Đơn, Bên phải Form */}
            <CCol md={6} className="border-end">
              <h6 className="fw-bold bg-light p-2 rounded">1. Chọn đơn hàng cần thanh toán</h6>
              {unpaidOrders.length === 0 ? (
                <div className="text-muted text-center p-3">Đang tải cấu trúc đơn nợ hoặc Khách hàng nợ chung không theo đơn...</div>
              ) : (
                <div style={{maxHeight: '300px', overflowY: 'auto'}}>
                  {unpaidOrders.map(order => {
                    const debtAmount = Number(order.finalAmount) - Number(order.paidAmount)
                    const isSelected = selectedOrder?.id === order.id
                    return (
                      <div 
                        key={order.id} 
                        className={`p-3 mb-2 border rounded cursor-pointer ${isSelected ? 'bg-info bg-opacity-10 border-info border-2' : 'bg-white'}`}
                        onClick={() => handleSelectOrder(order)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="d-flex justify-content-between mb-1">
                          <strong>Mã: {order.code}</strong>
                          <span className="text-danger fw-bold">{formatCurrency(debtAmount)}</span>
                        </div>
                        <div className="small text-muted d-flex justify-content-between">
                          <span>Tổng Hóa Đơn: {formatCurrency(order.finalAmount)}</span>
                          <span>Đã trả: {formatCurrency(order.paidAmount)}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CCol>

            <CCol md={6}>
              <h6 className="fw-bold bg-light p-2 rounded">2. Phiếu Thu Tiền</h6>
              {selectedOrder && (
                <CBadge color="info" className="mb-3 w-100 p-2 fs-6">Đang thu nợ cho: {selectedOrder.code}</CBadge>
              )}
              
              <div className="mb-3 mt-2">
                <label className="fw-bold mb-1">Số tiền khách trả (*)</label>
                <CInputGroup>
                  <CFormInput 
                    type="number" 
                    min="1"
                    className="fs-5 fw-bold text-end text-success"
                    value={payAmount} 
                    onChange={(e) => setPayAmount(e.target.value)} 
                    placeholder="Nhập số tiền..."
                  />
                  <CInputGroupText>VNĐ</CInputGroupText>
                </CInputGroup>
              </div>

              <div className="mb-3">
                <label className="fw-bold mb-1">Phương thức</label>
                <CFormSelect value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
                  <option value="Tiền mặt">Tiền mặt</option>
                  <option value="Chuyển khoản">Chuyển khoản / Bank</option>
                </CFormSelect>
              </div>

              <div className="mb-3">
                <label className="fw-bold mb-1">Lý do / Ghi chú</label>
                <CFormTextarea 
                  rows={3} 
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  placeholder="Ghi chú chi tiết giao dịch..."
                />
              </div>
            </CCol>
          </CRow>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="ghost" onClick={() => setVisible(false)}>
            Đóng
          </CButton>
          <CButton color="success" className="text-white fw-bold px-4" onClick={handleCollectDebt}>
            XÁC NHẬN THU TIỀN
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default CustomerDebt
