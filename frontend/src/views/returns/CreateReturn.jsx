import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CFormSelect,
  CFormInput,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CInputGroup,
  CInputGroupText,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormTextarea,
  CToast,
  CToastHeader,
  CToastBody,
  CToaster,
  CAlert
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilSearch, cilUser, cilCheckCircle } from '@coreui/icons'
import axiosClient from '../../api/axiosClient'

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0)
}

const CreateReturn = () => {
  const navigate = useNavigate()
  
  // TOAST REFS
  const toaster = useRef()
  const [toast, addToast] = useState(0)

  // DATA
  const [customers, setCustomers] = useState([])
  const [orders, setOrders] = useState([])
  
  // FORM STATE
  const [customerId, setCustomerId] = useState('')
  const [orderId, setOrderId] = useState('')
  const [orderItems, setOrderItems] = useState([]) // Hàng trong hoá đơn gốc
  const [returnItems, setReturnItems] = useState([]) // Hàng được chọn để trả
  const [refundFee, setRefundFee] = useState(0)
  const [paidAmount, setPaidAmount] = useState(0)
  const [note, setNote] = useState('')

  // SUCCESS MODAL
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const res = await axiosClient.get('/partners?type=CUSTOMER&limit=1000')
      setCustomers(Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []))
    } catch (e) {
      console.error(e)
    }
  }

  // Khi chọn khách hàng -> Lấy danh sách hóa đơn đã hoàn thành
  const handleCustomerChange = async (e) => {
    const custId = e.target.value
    setCustomerId(custId)
    setOrderId('')
    setOrderItems([])
    setReturnItems([])
    
    if (custId) {
      try {
        const res = await axiosClient.get(`/orders?customerId=${custId}&status=COMPLETED,DELIVERED&limit=100`)
        setOrders(res.data || [])
      } catch (err) {
        console.error(err)
      }
    } else {
      setOrders([])
    }
  }

  // Khi chọn hóa đơn -> Lấy chi tiết hàng hóa
  const handleOrderChange = async (e) => {
    const oId = e.target.value
    setOrderId(oId)
    setReturnItems([])
    
    if (oId) {
      try {
        const res = await axiosClient.get(`/orders/${oId}`)
        if (res.data && res.data.items) {
          // Lưu lại danh sách hàng của hóa đơn gốc
          setOrderItems(res.data.items)
          // Mặc định ném hết vào giỏ trả hàng với số lượng 0
          const initialReturnItems = res.data.items.map(item => ({
            ...item,
            returnQty: 0 // Default 0, nhân viên tự gõ số muốn trả
          }))
          setReturnItems(initialReturnItems)
        }
      } catch (err) {
        console.error(err)
      }
    } else {
      setOrderItems([])
    }
  }

  // Xử lý thay đổi số lượng trả
  const handleReturnQtyChange = (index, value) => {
    const newItems = [...returnItems]
    let val = parseInt(value, 10)
    if (isNaN(val) || val < 0) val = 0
    // Không được vượt quá số lượng mua gốc
    if (val > newItems[index].quantity) val = newItems[index].quantity
    
    newItems[index].returnQty = val
    setReturnItems(newItems)
  }

  // Tính toán
  const totalReturnGoodsValue = returnItems.reduce((acc, item) => acc + (Number(item.price) * item.returnQty), 0)
  const finalRefundAmount = totalReturnGoodsValue - refundFee
  const debtOffset = finalRefundAmount - paidAmount // Tiền nợ sẽ trừ cho khách

  // Validate Submit
  const handleCheckout = async () => {
    if (!customerId) {
      showErrorToast("Lỗi", "Vui lòng chọn khách hàng")
      return
    }
    if (!orderId) {
      showErrorToast("Lỗi", "Vui lòng chọn Hóa đơn gốc")
      return
    }
    const hasItems = returnItems.some(i => i.returnQty > 0)
    if (!hasItems) {
      showErrorToast("Cảnh báo", "Vui lòng nhập số lượng trả cho ít nhất 1 mặt hàng")
      return
    }
    if (finalRefundAmount < 0) {
      showErrorToast("Lỗi tính toán", "Phí trả hàng không được lớn hơn tổng giá trị hàng trả")
      return
    }

    // Submit
    const payload = {
      orderId: Number(orderId),
      customerId: Number(customerId),
      refundFee: Number(refundFee),
      paidAmount: Number(paidAmount),
      note: note,
      items: returnItems.filter(i => i.returnQty > 0).map(i => ({
        variantId: i.variantId,
        batchId: i.batchId,
        quantity: i.returnQty,
        refundPrice: i.price
      }))
    }

    try {
      await axiosClient.post('/returns', payload)
      setShowSuccessModal(true)
    } catch (e) {
      showErrorToast("Lỗi server", e.response?.data?.message || e.message)
    }
  }

  const showErrorToast = (title, message) => {
    addToast(
      <CToast color="danger" className="text-white align-items-center">
        <CToastHeader closeButton><strong className="me-auto">{title}</strong></CToastHeader>
        <CToastBody>{message}</CToastBody>
      </CToast>
    )
  }

  return (
    <CRow>
      <CToaster ref={toaster} push={toast} placement="top-end" />
      
      {/* CỘT TRÁI: CHỌN ĐƠN VÀ HÀNG HÓA */}
      <CCol lg={8}>
        <CCard className="mb-4 border-top-danger border-top-3 shadow-sm">
          <CCardHeader className="bg-white">
            <strong className="text-danger fs-5">CHI TIẾT TRẢ HÀNG</strong>
          </CCardHeader>
          <CCardBody>
            <CRow className="mb-4">
              <CCol md={6}>
                <CInputGroup>
                  <CInputGroupText className="bg-light"><CIcon icon={cilUser} /></CInputGroupText>
                  <CFormSelect value={customerId} onChange={handleCustomerChange}>
                    <option value="">-- Chọn Khách Hàng --</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>)}
                  </CFormSelect>
                </CInputGroup>
              </CCol>
              <CCol md={6}>
                <CFormSelect value={orderId} onChange={handleOrderChange} disabled={!customerId}>
                  <option value="">-- Chọn Hóa Đơn Gốc (Bắt buộc) --</option>
                  {orders.map(o => <option key={o.id} value={o.id}>{o.code} - {new Date(o.createdAt).toLocaleDateString('vi-VN')} - {formatCurrency(o.finalAmount)}</option>)}
                </CFormSelect>
              </CCol>
            </CRow>

            {orderId && returnItems.length > 0 ? (
              <div className="table-responsive">
                <CTable hover align="middle" className="border">
                  <CTableHead color="light">
                    <CTableRow>
                      <CTableHeaderCell>STT</CTableHeaderCell>
                      <CTableHeaderCell>Mặt hàng (Mã SP)</CTableHeaderCell>
                      <CTableHeaderCell>Đã mua</CTableHeaderCell>
                      <CTableHeaderCell>Giá lúc mua</CTableHeaderCell>
                      <CTableHeaderCell style={{width: '150px'}} className="text-danger">SL TRẢ LẠI</CTableHeaderCell>
                      <CTableHeaderCell className="text-end">Thành tiền hoàn</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {returnItems.map((item, idx) => (
                      <CTableRow key={idx} className={item.returnQty > 0 ? 'table-warning' : ''}>
                        <CTableDataCell>{idx + 1}</CTableDataCell>
                        <CTableDataCell>
                          <div className="fw-bold">{item.variant?.product?.name}</div>
                          <div className="small text-muted">
                            {typeof item.variant?.attributes === 'object' 
                              ? Object.values(item.variant?.attributes || {}).join(', ')
                              : item.variant?.attributes}
                          </div>
                        </CTableDataCell>
                        <CTableDataCell>{item.quantity}</CTableDataCell>
                        <CTableDataCell>{formatCurrency(item.price)}</CTableDataCell>
                        <CTableDataCell>
                          <CFormInput 
                            type="number" 
                            min="0" 
                            max={item.quantity}
                            value={item.returnQty} 
                            onChange={(e) => handleReturnQtyChange(idx, e.target.value)}
                            className="border-danger fw-bold text-center"
                          />
                        </CTableDataCell>
                        <CTableDataCell className="text-end fw-semibold text-danger">
                          {formatCurrency(item.price * item.returnQty)}
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </div>
            ) : (
              <CAlert color="info">Vui lòng chọn Khách hàng và Hóa đơn gốc để hiển thị danh sách mặt hàng có thể trả.</CAlert>
            )}
          </CCardBody>
        </CCard>
      </CCol>

      {/* CỘT PHẢI: TÍNH TIỀN */}
      <CCol lg={4}>
        <CCard className="shadow-sm border-top-secondary border-top-3 sticky-top" style={{ top: '20px' }}>
          <CCardHeader className="bg-white">
            <strong className="text-secondary fs-5">TỔNG KẾT HOÀN TIỀN</strong>
          </CCardHeader>
          <CCardBody>
            <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
              <span className="text-muted fw-semibold">Tổng giá trị hàng trả:</span>
              <span className="fw-bold fs-5">{formatCurrency(totalReturnGoodsValue)}</span>
            </div>

            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
              <span className="text-muted fw-semibold">Phí trả hàng (Khách chịu):</span>
              <CInputGroup size="sm" style={{ width: '150px' }}>
                <CFormInput 
                  type="text" 
                  value={refundFee === 0 ? '' : new Intl.NumberFormat('vi-VN').format(refundFee)}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^\d]/g, '')
                    setRefundFee(val ? parseInt(val, 10) : 0)
                  }}
                  className="text-end fw-bold border-warning" 
                  placeholder="0"
                />
                <CInputGroupText>đ</CInputGroupText>
              </CInputGroup>
            </div>

            <div className="d-flex justify-content-between mb-4 bg-light p-2 rounded">
              <span className="fw-bold fs-5 text-danger">TỔNG THỰC HOÀN:</span>
              <span className="fw-bold fs-4 text-danger">{formatCurrency(finalRefundAmount)}</span>
            </div>

            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
              <span className="text-muted fw-semibold" title="Nhập số tiền mặt/CK thực tế đưa cho khách lúc này. Phần còn dư sẽ trừ nợ.">
                Đã trả tiền mặt (hoặc CK):
              </span>
              <CInputGroup size="sm" style={{ width: '150px' }}>
                <CFormInput 
                  type="text" 
                  value={paidAmount === 0 ? '' : new Intl.NumberFormat('vi-VN').format(paidAmount)}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^\d]/g, '')
                    setPaidAmount(val ? parseInt(val, 10) : 0)
                  }}
                  className="text-end fw-bold text-success" 
                  placeholder="0"
                />
                <CInputGroupText>đ</CInputGroupText>
              </CInputGroup>
            </div>

            <div className="d-flex justify-content-between mb-3 pt-2">
              <span className="text-muted fw-semibold fst-italic">Cấn trừ công nợ Khách:</span>
              <span className="fw-bold text-primary fst-italic">{formatCurrency(debtOffset > 0 ? debtOffset : 0)}</span>
            </div>

            <div className="mb-4">
              <CFormTextarea 
                rows="2" 
                placeholder="Ghi chú (Ví dụ: Khách chê màu xấu)..." 
                value={note}
                onChange={(e) => setNote(e.target.value)}
              ></CFormTextarea>
            </div>

            <CButton 
              color="danger" 
              className="w-100 fs-5 py-2 fw-bold text-white shadow"
              onClick={handleCheckout}
            >
              CHỐT PHIẾU TRẢ HÀNG
            </CButton>
          </CCardBody>
        </CCard>
      </CCol>

      {/* MODAL THÀNH CÔNG */}
      <CModal visible={showSuccessModal} onClose={() => setShowSuccessModal(false)} backdrop="static" alignment="center">
        <CModalHeader className="border-0 bg-success text-white">
          <CModalTitle className="d-flex align-items-center">
            Hoàn tất Trả Hàng!
          </CModalTitle>
        </CModalHeader>
        <CModalBody className="text-center py-4">
          <CIcon icon={cilCheckCircle} size="3xl" className="text-success mb-3" />
          <h5 className="fw-bold mb-3">Tạo phiếu trả hàng thành công</h5>
          <p className="text-muted mb-4">Hàng hoá sẽ được cộng lại vào kho sau khi có Quản lý duyệt phiếu.</p>
          <div className="d-grid gap-3 px-4">
            <CButton 
              color="success" 
              size="lg" 
              className="text-white fw-bold"
              onClick={() => {
                setShowSuccessModal(false)
                // Chuyển về danh sách
                navigate('/returns/list')
              }}
            >
              Về Danh Sách Phiếu Trả
            </CButton>
            
            <CButton 
              color="secondary" 
              variant="outline"
              onClick={() => {
                setShowSuccessModal(false)
                // Tải lại trang để tiếp tục trả món khác
                window.location.reload()
              }}
            >
              Tiếp tục trả hàng
            </CButton>
          </div>
        </CModalBody>
      </CModal>

    </CRow>
  )
}

export default CreateReturn
