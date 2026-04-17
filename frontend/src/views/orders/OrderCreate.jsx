import React, { useState, useEffect } from 'react'
import {
  CCard, CCardHeader, CCardBody, CRow, CCol, CTable, CTableHead, CTableRow, 
  CTableHeaderCell, CTableBody, CTableDataCell, CButton, CInputGroup, 
  CFormInput, CBadge, CModal, CModalHeader, CModalTitle, CModalBody, 
  CModalFooter, CFormSelect, CSpinner
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCart, cilTrash, cilCash, cilPrint } from '@coreui/icons'
import axiosInstance from '../../../utils/axios'
import { PDFDownloadLink } from '@react-pdf/renderer'
import ReceiptPDF from './ReceiptPDF'

const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0)

const OrderCreate = () => {
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Checkout State
  const [checkoutVisible, setCheckoutVisible] = useState(false)
  const [customerId, setCustomerId] = useState('')
  const [discount, setDiscount] = useState(0)
  const [paidAmount, setPaidAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // PDF Bill State
  const [billVisible, setBillVisible] = useState(false)
  const [savedOrderData, setSavedOrderData] = useState(null)

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    setLoading(true)
    try {
      const [prodRes, custRes] = await Promise.all([
        axiosInstance.get('/products/variants-for-sale'),
        axiosInstance.get('/partners?type=CUSTOMER')
      ])
      setProducts(prodRes.data || [])
      setCustomers(custRes.data || [])
      if (custRes.data?.length > 0) {
        setCustomerId(custRes.data[0].id)
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu POS", error)
    } finally {
      setLoading(false)
    }
  }

  // --- CART LOGIC ---
  const addToCart = (variant) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === variant.id)
      if (existing) {
        if (existing.quantity >= variant.stockCount) {
          alert('Vượt quá tồn kho thực tế!')
          return prev
        }
        return prev.map(item => item.id === variant.id ? { ...item, quantity: item.quantity + 1 } : item)
      }
      return [...prev, { ...variant, quantity: 1 }]
    })
  }

  const updateCartQty = (id, newQty, maxStock) => {
    if (newQty < 1) return
    if (newQty > maxStock) {
      alert('Không đủ tồn kho!')
      return
    }
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: newQty } : item))
  }

  const removeCartItem = (id) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }

  const totalAmount = cart.reduce((sum, item) => sum + (Number(item.sellPrice) * item.quantity), 0)
  const finalAmount = Math.max(0, totalAmount - discount)

  // --- CHECKOUT LOGIC ---
  const handleOpenCheckout = () => {
    if (cart.length === 0) return alert('Chưa có sản phẩm nào trong giỏ!')
    if (!customerId) return alert('Chưa chọn Khách hàng!')
    setPaidAmount(String(finalAmount)) // Gợi ý mặc định thanh toán đủ
    setCheckoutVisible(true)
  }

  const handleProcessOrder = async () => {
    setIsSubmitting(true)
    try {
      const orderPayload = {
        customerId,
        discount: Number(discount),
        paidAmount: Number(paidAmount),
        paymentMethod: 'Tiền mặt',
        items: cart.map(c => ({
          variantId: c.id,
          quantity: c.quantity,
          price: Number(c.sellPrice)
        }))
      }

      const res = await axiosInstance.post('/orders', orderPayload)
      const orderData = res.data.data
      
      // Thành công -> Đổi sang Tab Hóa Đơn PDF
      setCart([])
      setDiscount(0)
      setCheckoutVisible(false)
      setSavedOrderData(orderData)
      setBillVisible(true) // Mở modal hóa đơn

      // Reload lại kho hàng
      fetchInitialData()
    } catch (e) {
      alert("Lỗi khi chốt đơn: " + (e.response?.data?.message || e.message))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Lọc sản phẩm theo khung Search
  const filteredProducts = products.filter(p => 
    p.product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      <CRow>
        {/* KHU VỰC CHỌN SẢN PHẨM TRÁI */}
        <CCol md={7}>
          <CCard className="mb-4 shadow-sm border-top-primary">
            <CCardHeader className="bg-white">
              <CInputGroup>
                <CFormInput 
                  placeholder="Tìm theo Tên hoặc SKU sản phẩm..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <CButton color="primary" variant="outline">Tìm kiếm</CButton>
              </CInputGroup>
            </CCardHeader>
            <CCardBody style={{ height: '70vh', overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
              {loading ? (
                <div className="text-center py-5"><CSpinner color="primary"/></div>
              ) : (
                <CRow>
                  {filteredProducts.map(v => (
                    <CCol xs={6} lg={4} key={v.id} className="mb-3">
                      <CCard className="h-100 cursor-pointer hover-shadow" onClick={() => addToCart(v)}>
                        <CCardBody className="text-center p-2">
                          <div className="fw-bold text-primary mb-1" style={{ fontSize: '0.9rem' }}>
                            {v.product.name}
                          </div>
                          <CBadge color="secondary" className="mb-2">{v.sku}</CBadge>
                          <div className="text-danger fw-bold">{formatCurrency(v.sellPrice)}</div>
                          <div className="small text-muted mt-2 border-top pt-1">
                            Tồn: <span className="fw-bold">{v.stockCount}</span>
                          </div>
                        </CCardBody>
                      </CCard>
                    </CCol>
                  ))}
                  {filteredProducts.length === 0 && (
                    <div className="text-center w-100 py-3 text-muted">Không tìm thấy hàng tồn.</div>
                  )}
                </CRow>
              )}
            </CCardBody>
          </CCard>
        </CCol>

        {/* KHU VỰC GIỎ HÀNG PHẢI */}
        <CCol md={5}>
          <CCard className="mb-4 shadow-sm border-top-success h-100 flex-column d-flex">
            <CCardHeader className="bg-white fw-bold d-flex align-items-center">
              <CIcon icon={cilCart} className="me-2 text-success" size="lg" /> 
              Giỏ Hàng POS
            </CCardHeader>
            <CCardBody className="flex-grow-1" style={{ overflowY: 'auto' }}>
              <CTable hover align="middle" borderless className="mb-0">
                <CTableHead color="light">
                  <CTableRow>
                    <CTableHeaderCell>Tên hàng</CTableHeaderCell>
                    <CTableHeaderCell className="text-center" style={{ width: '100px' }}>SL</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">T.Tiền</CTableHeaderCell>
                    <CTableHeaderCell></CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {cart.map(item => (
                    <CTableRow key={item.id}>
                      <CTableDataCell>
                        <div className="fw-bold" style={{ fontSize: '0.85rem' }}>{item.product.name}</div>
                        <div className="small text-muted">{formatCurrency(item.sellPrice)}</div>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CFormInput 
                          type="number" 
                          size="sm" 
                          value={item.quantity} 
                          min="1"
                          onChange={e => updateCartQty(item.id, Number(e.target.value), item.stockCount)}
                        />
                      </CTableDataCell>
                      <CTableDataCell className="text-end fw-bold text-danger" style={{ fontSize: '0.9rem' }}>
                        {formatCurrency(item.quantity * item.sellPrice)}
                      </CTableDataCell>
                      <CTableDataCell className="text-end">
                        <CButton color="danger" variant="ghost" size="sm" onClick={() => removeCartItem(item.id)}>
                          <CIcon icon={cilTrash} />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                  {cart.length === 0 && (
                    <CTableRow>
                      <CTableDataCell colSpan="4" className="text-center text-muted py-4">
                        Giỏ hàng trống. Hãy chọn sản phẩm!
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>
            </CCardBody>
            
            {/* THỐNG KÊ CART */}
            <div className="border-top p-3 bg-light mt-auto">
              <div className="mb-2">
                <label className="fw-bold small text-muted">Khách hàng</label>
                <CFormSelect value={customerId} onChange={e => setCustomerId(e.target.value)}>
                  <option value="">-- Chọn Khách Mua Hàng --</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>)}
                </CFormSelect>
              </div>
              <div className="d-flex justify-content-between mb-1 mt-3">
                <span className="text-muted fw-bold">Tổng tiền hàng:</span>
                <span className="fw-bold fs-6">{formatCurrency(totalAmount)}</span>
              </div>
              <CButton 
                color="success" 
                className="w-100 fw-bold py-2 mt-3 text-white fs-5" 
                onClick={handleOpenCheckout}
                disabled={cart.length === 0}
              >
                THANH TOÁN
              </CButton>
            </div>
          </CCard>
        </CCol>
      </CRow>

      {/* MODAL CHECKOUT & NHẬP TIỀN */}
      <CModal visible={checkoutVisible} onClose={() => setCheckoutVisible(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle className="text-success"><CIcon icon={cilCash} className="me-2"/> Màn Hình Chốt Đơn POS</CModalTitle>
        </CModalHeader>
        <CModalBody>
           <div className="mb-3 d-flex justify-content-between bg-body-tertiary p-3 rounded border">
              <span className="fw-bold">Tổng tiền hàng:</span>
              <span className="fw-bold text-dark fs-5">{formatCurrency(totalAmount)}</span>
           </div>
           
           <div className="mb-3">
              <label className="fw-bold mb-1">Chiết khấu (VNĐ)</label>
              <CFormInput 
                type="number" 
                min="0"
                value={discount} 
                onChange={(e) => {
                  setDiscount(Number(e.target.value))
                  setPaidAmount(String(Math.max(0, totalAmount - Number(e.target.value)))) // Tự update tiền khách cần trả
                }} 
              />
           </div>

           <div className="mb-3 d-flex justify-content-between bg-primary bg-opacity-10 text-primary p-3 rounded border border-primary">
              <span className="fw-bold">KHÁCH CẦN TRẢ:</span>
              <span className="fw-bold fs-4">{formatCurrency(finalAmount)}</span>
           </div>

           <div className="mb-3">
              <label className="fw-bold mb-1">Tiền Khách Đưa (Thực Thu)</label>
              <CInputGroup>
                <CFormInput 
                  type="number" 
                  min="0"
                  className="fs-4 text-end text-success fw-bold"
                  value={paidAmount} 
                  onChange={(e) => setPaidAmount(e.target.value)} 
                />
                <CInputGroupText>VNĐ</CInputGroupText>
              </CInputGroup>
              <div className="small text-muted mt-1 fst-italic">
                {Number(paidAmount) < finalAmount 
                  ? `Khách sẽ bị ghi nợ: ${formatCurrency(finalAmount - Number(paidAmount))}`
                  : `Tiền thối lại cho khách: ${formatCurrency(Number(paidAmount) - finalAmount)}`
                }
              </div>
           </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setCheckoutVisible(false)}>Hủy</CButton>
          <CButton color="success" className="text-white px-4 fw-bold" disabled={isSubmitting} onClick={handleProcessOrder}>
            {isSubmitting ? <CSpinner size="sm"/> : 'XÁC NHẬN VÀ IN BILL'}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* MODAL KẾT QUẢ & IN PDF BẰNG REACT-PDF */}
      <CModal visible={billVisible} onClose={() => setBillVisible(false)} size="lg" backdrop="static">
        <CModalHeader>
          <CModalTitle className="text-success"><CIcon icon={cilPrint} className="me-2"/> Giao Dịch Thành Công</CModalTitle>
        </CModalHeader>
        <CModalBody className="text-center p-5 bg-light">
          <CIcon icon={cilCash} className="text-success mb-3" style={{width: '60px', height: '60px'}}/>
          <h3 className="mb-4 text-primary">Đơn hàng {savedOrderData?.code} đã được lưu</h3>
          
          <div className="d-flex justify-content-center mt-4">
             {savedOrderData && (
                <PDFDownloadLink 
                  document={<ReceiptPDF orderData={savedOrderData} />} 
                  fileName={`Bill_${savedOrderData.code}.pdf`}
                  className="btn btn-warning fs-5 fw-bold px-5 py-3 shadow"
                >
                  {({ blob, url, loading, error }) => 
                    loading ? 'Đang tạo File PDF...' : 'TẢI FILE HÓA ĐƠN PDF TẠI ĐÂY'
                  }
                </PDFDownloadLink>
             )}
          </div>
          <div className="small text-muted mt-3">Hàng tồn kho đã được trừ và Tiền đã vào Sổ Quỹ Cashbook.</div>
        </CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={() => setBillVisible(false)}>Quay lại POS để tạo đơn mới</CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default OrderCreate
