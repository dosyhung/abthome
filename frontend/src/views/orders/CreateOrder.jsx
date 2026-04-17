import React, { useState, useMemo, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import axiosClient from '../../api/axiosClient'
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
  CListGroup,
  CListGroupItem,
  CBadge,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilSearch, cilCart, cilUser, cilWarning } from '@coreui/icons'

// Data sẽ lấy từ API

// ===============================================
// HELPER FUNCTIONS
// ===============================================
const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0)
}

// ===============================================
// MAIN COMPONENT
// ===============================================
const CreateOrder = () => {
  const { user } = useAuth()

  // --- STATE: DATA TỪ BACKEND ---
  const [customers, setCustomers] = useState([])
  const [variantsList, setVariantsList] = useState([])

  // --- STATE: THÔNG TIN CHUNG ---
  const [customerId, setCustomerId] = useState('')

  // --- STATE: MODAL KHÁCH HÀNG ---
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', address: '' })

  // --- STATE: CẢNH BÁO TỒN KHO ---
  const [showStockWarning, setShowStockWarning] = useState(false)
  const [warningMessage, setWarningMessage] = useState('')

  useEffect(() => {
    fetchInitData()
  }, [])

  const fetchInitData = async () => {
    try {
      const [custRes, varRes] = await Promise.all([
        axiosClient.get('/partners?type=CUSTOMER'),
        axiosClient.get('/products/variants-for-sale')
      ])
      setCustomers(custRes)
      setVariantsList(varRes)
    } catch (e) {
      console.error('Lỗi khi kéo data POS', e)
    }
  }

  const handleCustomerChange = (e) => {
    const val = e.target.value
    if (val === 'NEW') {
      setShowCustomerModal(true)
      // Tạm reset về rỗng để dropdown không đọng chữ NEW
      setCustomerId('')
    } else {
      setCustomerId(val)
    }
  }

  const handleSaveCustomer = async () => {
    if (!newCustomer.name || !newCustomer.phone) {
      alert('Vui lòng nhập tên và số điện thoại!')
      return
    }
    try {
      const res = await axiosClient.post('/partners', {
        type: 'CUSTOMER',
        name: newCustomer.name,
        phone: newCustomer.phone,
        address: newCustomer.address
      })
      // Cập nhật mảng hiện tại mà ko cần F5
      setCustomers([...customers, res.data])
      setCustomerId(res.data.id)
      setShowCustomerModal(false)
      setNewCustomer({ name: '', phone: '', address: '' })
    } catch (e) {
      alert('Lỗi khi thêm Khách hàng (SĐT có thể bị trùng)')
    }
  }

  // --- STATE: TÌM KIẾM MẶT HÀNG ---
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])

  // --- STATE: GIỎ HÀNG (OrderItem) ---
  const [cartItems, setCartItems] = useState([])

  // --- STATE: THANH TOÁN ---
  const [discount, setDiscount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState('CASH') // CASH, BANK_TRANSFER

  // --- LOGIC: TÌM KIẾM SẢN PHẨM ---
  const handleSearch = (e) => {
    const term = e.target.value
    setSearchTerm(term)
    if (term.trim() === '') {
      setSearchResults([])
      return
    }
    const lowerTerm = term.toLowerCase()
    const results = variantsList.filter(
      v =>
        (v.sku && v.sku.toLowerCase().includes(lowerTerm)) ||
        (v.product?.code && v.product.code.toLowerCase().includes(lowerTerm)) ||
        (v.product?.name && v.product.name.toLowerCase().includes(lowerTerm))
    )
    setSearchResults(results)
  }

  // --- LOGIC: THÊM VÀO GIỎ HÀNG ---
  const addToCart = (variant) => {
    // Chặn ĐỨNG nếu Tồn Kho = 0
    if (variant.stockCount <= 0) {
      setWarningMessage(` ${variant.product?.name || variant.sku} đang hết hàng !`)
      setShowStockWarning(true)
      return
    }

    // Kiểm tra xem đã có trong giỏ rỗng lô chưa (Giản lược logic cho POS)
    const existingIndex = cartItems.findIndex(item => item.variant.id === variant.id && !item.batchId)

    if (existingIndex >= 0) {
      const newCart = [...cartItems]
      newCart[existingIndex].quantity += 1
      setCartItems(newCart)
    } else {
      setCartItems([
        ...cartItems,
        {
          id: Date.now() + Math.random(), // Unique mapping key
          variant: variant,
          quantity: 1,
          batchId: '', // Default trống
          price: variant.sellPrice
        }
      ])
    }
    // Xóa ô search sau khi chọn
    setSearchTerm('')
    setSearchResults([])
  }

  // --- LOGIC: CẬP NHẬT GIỎ HÀNG ---
  const handleCartChange = (id, field, value) => {
    setCartItems(cartItems.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value }
      }
      return item
    }))
  }

  const removeFromCart = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id))
  }

  // --- TÍNH TOÁN ---
  const totalAmount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.price)), 0)
  }, [cartItems])

  const finalAmount = Math.max(totalAmount - Number(discount), 0)

  // Validate Submit
  const handleCheckout = async () => {
    if (!customerId || customerId === '') {
      alert("Vui lòng chọn hoặc thêm Khách Hàng trước khi chốt đơn!")
      return
    }
    if (cartItems.length === 0) {
      alert("Giỏ hàng đang trống!")
      return
    }
    const hasError = cartItems.some(i => i.quantity <= 0 || i.quantity > i.variant.stockCount)
    if (hasError) {
      alert("Có lỗi về số lượng (vượt quá tồn kho hoặc <= 0). Vui lòng kiểm tra lại dòng đỏ!")
      return
    }

    const payload = {
      customerId: parseInt(customerId),
      userId: user?.id, 
      totalAmount,
      discount: Number(discount),
      finalAmount,
      paidAmount: finalAmount, // Mặc định thu đủ tiền khách đưa (POS)
      status: 'PENDING',
      paymentMethod,
      items: cartItems.map(i => ({
        variantId: i.variant.id,
        batchId: i.batchId ? parseInt(i.batchId) : null,
        quantity: parseInt(i.quantity),
        price: parseFloat(i.price)
      }))
    }

    console.log("Payload gửi lên:", payload)

    try {
      const response = await axiosClient.post('/orders', payload)
      // Nạp thành công
      setCartItems([])
      setDiscount(0)
      setSearchTerm('')
      fetchInitData() // Kéo lại kho
      alert("Chốt đơn thành công!")
    } catch (err) {
      console.error('Lỗi Check out:', err)
      alert(err.response?.data?.message || 'Có lỗi khi tạo đơn')
    }
  }

  return (
    <CRow>
      <CCol md={12}>
        <CCard className="mb-4">
          <CCardHeader className="bg-primary text-white d-flex align-items-center gap-2">
            <CIcon icon={cilCart} size="lg" />
            <strong className="fs-5">Tạo Đơn Hàng Mới</strong>
          </CCardHeader>
          <CCardBody className="p-4">

            {/* THÔNG TIN CHUNG */}
            <CRow className="mb-4">
              <CCol md={6}>
                <label className="fw-bold mb-2">Khách hàng mua</label>
                <CFormSelect value={customerId} onChange={handleCustomerChange}>
                  <option value="NEW" className="text-primary fw-bold">-- ➕ Thêm Khách Hàng Nhanh --</option>
                  <option value="">-- Chọn khách hàng (Mặc định: Khách vãng lai) --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.phone} - {c.name}</option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <label className="fw-bold mb-2">Nhân viên chốt đơn</label>
                <div className="p-2 border rounded bg-light text-primary">
                  <CIcon icon={cilUser} className="me-2" />
                  <strong>{user?.fullName || 'Đang tải...'}</strong>
                </div>
              </CCol>
            </CRow>

            <hr className="mb-4" />

            {/* PHẦN CHỌN SẢN PHẨM */}
            <CRow className="mb-4 position-relative">
              <CCol md={12}>
                <label className="fw-bold mb-2">Sản Phẩm (Nhập tên hoặc Mã SP)</label>
                <CInputGroup>
                  <CInputGroupText className="bg-light"><CIcon icon={cilSearch} /></CInputGroupText>
                  <CFormInput
                    placeholder="Nhập tên hoặc Mã SP..."
                    value={searchTerm}
                    onChange={handleSearch}
                    onFocus={(e) => {
                      if (!searchTerm) {
                        // Show all when focused and empty (max 10)
                        setSearchResults(variantsList.slice(0, 10))
                      }
                    }}
                  />
                </CInputGroup>

                {/* Floating Search Results */}
                {searchResults.length > 0 && (
                  <div className="position-absolute w-100 mt-1 shadow" style={{ zIndex: 1000, top: '100%' }}>
                    <CListGroup>
                      {searchResults.map(v => (
                        <CListGroupItem
                          key={v.id}
                          component="button"
                          className="d-flex justify-content-between align-items-center list-group-item-action"
                          onClick={() => addToCart(v)}
                        >
                          <div>
                            <strong>{v.product?.code || v.sku}</strong> - <span className="text-secondary">{v.product?.name || 'Chưa cập nhật tên'}</span>
                          </div>
                          <div>
                            <span className="me-3 fw-bold text-primary">{formatCurrency(v.sellPrice)}</span>
                            <CBadge color={v.stockCount > 0 ? "success" : "danger"}>
                              Tồn: {v.stockCount}
                            </CBadge>
                          </div>
                        </CListGroupItem>
                      ))}
                    </CListGroup>
                  </div>
                )}
              </CCol>
            </CRow>

            {/* BẢNG GIỎ HÀNG */}
            <div className="table-responsive mb-4" style={{ minHeight: '200px' }}>
              <CTable bordered align="middle">
                <CTableHead color="light">
                  <CTableRow>
                    <CTableHeaderCell style={{ width: '5%' }}>STT</CTableHeaderCell>
                    <CTableHeaderCell style={{ width: '30%' }}>Mặt hàng (Mã SP)</CTableHeaderCell>
                    <CTableHeaderCell style={{ width: '15%' }}>Giá bán</CTableHeaderCell>
                    <CTableHeaderCell style={{ width: '15%' }}>Số lượng</CTableHeaderCell>
                    <CTableHeaderCell style={{ width: '15%' }}>Chiết Lô (Batch)</CTableHeaderCell>
                    <CTableHeaderCell style={{ width: '15%' }} className="text-end">Thành tiền</CTableHeaderCell>
                    <CTableHeaderCell style={{ width: '5%' }} className="text-center"></CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {cartItems.length === 0 ? (
                    <CTableRow>
                      <CTableDataCell colSpan={7} className="text-center text-muted py-4">
                        Giỏ hàng trống. Vui lòng tìm và thêm sản phẩm.
                      </CTableDataCell>
                    </CTableRow>
                  ) : (
                    cartItems.map((item, index) => {
                      // Logic cảnh báo tồn kho
                      const isOutOfStock = Number(item.quantity) > item.variant.stockCount
                      const lineTotal = Number(item.quantity) * Number(item.price)

                      return (
                        <CTableRow key={item.id} color={isOutOfStock ? "danger" : ""}>
                          <CTableDataCell className="text-center fw-bold">{index + 1}</CTableDataCell>
                          <CTableDataCell>
                            <strong>{item.variant.product?.code || item.variant.sku}</strong>
                            <div className="text-muted small">{item.variant.product?.name || 'Tên SP'}</div>
                            {isOutOfStock && <div className="text-danger small mt-1">Lỗi: Kho chỉ còn {item.variant.stockCount}</div>}
                          </CTableDataCell>
                          <CTableDataCell>
                            <CFormInput
                              type="number"
                              size="sm"
                              value={item.price}
                              onChange={(e) => handleCartChange(item.id, 'price', e.target.value)}
                            />
                          </CTableDataCell>
                          <CTableDataCell>
                            <CFormInput
                              type="number"
                              size="sm"
                              min="1"
                              className={isOutOfStock ? "is-invalid" : ""}
                              value={item.quantity}
                              onChange={(e) => handleCartChange(item.id, 'quantity', e.target.value)}
                            />
                          </CTableDataCell>
                          <CTableDataCell>
                            <CFormSelect
                              size="sm"
                              value={item.batchId}
                              onChange={(e) => handleCartChange(item.id, 'batchId', e.target.value)}
                              disabled={!item.variant.batches || item.variant.batches.length === 0}
                            >
                              <option value="">-- Mặc định --</option>
                              {item.variant.batches && item.variant.batches.map(b => (
                                <option key={b.id} value={b.id}>{b.batchNumber} (Tồn lô: {b.currentQty})</option>
                              ))}
                            </CFormSelect>
                          </CTableDataCell>
                          <CTableDataCell className="text-end fw-semibold">
                            {formatCurrency(lineTotal)}
                          </CTableDataCell>
                          <CTableDataCell className="text-center">
                            <CButton color="danger" variant="ghost" size="sm" onClick={() => removeFromCart(item.id)}>
                              <CIcon icon={cilTrash} />
                            </CButton>
                          </CTableDataCell>
                        </CTableRow>
                      )
                    })
                  )}
                </CTableBody>
              </CTable>
            </div>

            {/* BLOCK TÍNH TOÁN CUỐI CÙNG */}
            <CRow className="justify-content-end">
              <CCol md={5}>
                <CCard className="border-primary" style={{ backgroundColor: '#f8fbff' }}>
                  <CCardBody>
                    <div className="d-flex justify-content-between mb-3">
                      <span className="fw-semibold">Tổng tiền hàng:</span>
                      <span className="fw-semibold">{formatCurrency(totalAmount)}</span>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="fw-semibold">Giảm giá Đơn hàng:</span>
                      <CInputGroup style={{ width: '150px' }} size="sm">
                        <CFormInput
                          type="number"
                          min="0"
                          value={discount}
                          onChange={(e) => setDiscount(e.target.value)}
                          className="text-end"
                        />
                        <CInputGroupText>đ</CInputGroupText>
                      </CInputGroup>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="fw-semibold">Phương thức TT:</span>
                      <CFormSelect
                        size="sm"
                        style={{ width: '150px' }}
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      >
                        <option value="CASH">Tiền mặt</option>
                        <option value="BANK_TRANSFER">Chuyển khoản</option>
                        <option value="CARD">Quẹt thẻ</option>
                      </CFormSelect>
                    </div>

                    <hr />

                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <span className="fs-5 fw-bold">KHÁCH PHẢI TRẢ:</span>
                      <span className="fs-4 fw-bold text-danger">{formatCurrency(finalAmount)}</span>
                    </div>

                    <div className="d-grid mt-4">
                      <CButton color="primary" size="lg" onClick={handleCheckout}>
                        CHỐT ĐƠN HÀNG
                      </CButton>
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>

          </CCardBody>
        </CCard>
      </CCol>

      {/* MODAL THÊM KHÁCH HÀNG NHANH */}
      <CModal visible={showCustomerModal} onClose={() => setShowCustomerModal(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle>Thêm Khách Hàng Nhanh</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <label className="form-label fw-bold">Tên Khách Hàng <span className="text-danger">*</span></label>
            <CFormInput
              value={newCustomer.name}
              onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
              placeholder="VD: Anh Hải - Bãi Tập..."
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-bold">Số Điện Thoại <span className="text-danger">*</span></label>
            <CFormInput
              value={newCustomer.phone}
              onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })}
              placeholder="VD: 0912..."
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-bold">Địa chỉ</label>
            <CFormInput
              value={newCustomer.address}
              onChange={e => setNewCustomer({ ...newCustomer, address: e.target.value })}
              placeholder="Tùy chọn..."
            />
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowCustomerModal(false)}>Hủy</CButton>
          <CButton color="primary" onClick={handleSaveCustomer}>Lưu Khách Hàng</CButton>
        </CModalFooter>
      </CModal>

      {/* MODAL CẢNH BÁO TỒN KHO */}
      <CModal visible={showStockWarning} onClose={() => setShowStockWarning(false)} alignment="center">
        <CModalHeader className="border-0 bg-danger text-white">
          <CModalTitle className="d-flex align-items-center">
            <CIcon icon={cilWarning} size="xl" className="me-2" />
            Cảnh báo tồn kho
          </CModalTitle>
        </CModalHeader>
        <CModalBody className="text-center py-4">
          <div className="fs-5 fw-semibold">{warningMessage}</div>
          <p className="text-muted mt-2">Vui lòng nhập kho hoặc chọn lô khác trước khi bán!</p>
        </CModalBody>
        <CModalFooter className="border-0 justify-content-center">
          <CButton className="px-4" color="warning" onClick={() => setShowStockWarning(false)}>
            QUAY LẠI
          </CButton>
        </CModalFooter>
      </CModal>

    </CRow>
  )
}

export default CreateOrder
