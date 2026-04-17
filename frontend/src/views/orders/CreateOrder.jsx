import React, { useState, useMemo } from 'react'
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
  CBadge
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilSearch, cilCart } from '@coreui/icons'

// ===============================================
// MOCK DATA
// ===============================================
const mockCustomers = [
  { id: 1, name: 'Khách vãng lai' },
  { id: 2, name: 'Công ty TNHH Kiến Trúc Xanh' },
  { id: 3, name: 'Hộ KD Nội thất Minh Quân' }
]

const mockSalesUsers = [
  { id: 101, fullName: 'Nguyễn Văn Bán Hàng' },
  { id: 102, fullName: 'Trần Thị Kế Toán' }
]

// Mock Variants bao gồm cả stockCount và danh sách Batches đang tồn tại
const mockVariants = [
  { 
    id: 1, sku: 'MDF-X-15', name: 'Ván MDF cốt xanh 15mm', 
    sellPrice: 300000, stockCount: 150, 
    batches: [ 
      { id: 1, batchNumber: 'LOT-Jan24', currentQty: 100 }, 
      { id: 2, batchNumber: 'LOT-Feb24', currentQty: 50 } 
    ] 
  },
  { 
    id: 2, sku: 'MDF-X-17', name: 'Ván MDF cốt xanh 17mm', 
    sellPrice: 340000, stockCount: 20, 
    batches: [ { id: 3, batchNumber: 'LOT-Mar24', currentQty: 20 } ] 
  },
  { 
    id: 3, sku: 'PUR-TRANG-2KG', name: 'Keo PUR Trắng 2kg', 
    sellPrice: 500000, stockCount: 5, 
    batches: [] // Không có lô hoặc không quản lý lô
  },
  {
    id: 4, sku: 'BL-GC-THANG', name: 'Bản lề giảm chấn Thẳng',
    sellPrice: 25000, stockCount: 2, // Stock rất ít để test hiệu ứng thiếu hàng
    batches: [] 
  }
]

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
  // --- STATE: THÔNG TIN CHUNG ---
  const [customerId, setCustomerId] = useState(1) // Mặc định khách lẻ
  const [userId, setUserId] = useState(101)
  
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
    const results = mockVariants.filter(
      v => v.sku.toLowerCase().includes(lowerTerm) || v.name.toLowerCase().includes(lowerTerm)
    )
    setSearchResults(results)
  }

  // --- LOGIC: THÊM VÀO GIỎ HÀNG ---
  const addToCart = (variant) => {
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
  const handleCheckout = () => {
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
      userId: parseInt(userId),
      totalAmount,
      discount: Number(discount),
      finalAmount,
      status: 'PROCESSING', // OrderStatus theo Enum
      paymentMethod,
      items: cartItems.map(i => ({
        variantId: i.variant.id,
        batchId: i.batchId ? parseInt(i.batchId) : null,
        quantity: parseInt(i.quantity),
        price: parseFloat(i.price)
      }))
    }

    console.log("Dữ liệu tạo đơn (POST /api/orders):", payload)
    alert(`Tạo đơn hàng thành công! Thu tiền: ${formatCurrency(finalAmount)}`)
    // Reset form...
    setCartItems([])
    setDiscount(0)
  }

  return (
    <CRow>
      <CCol md={12}>
        <CCard className="mb-4">
          <CCardHeader className="bg-primary text-white d-flex align-items-center gap-2">
             <CIcon icon={cilCart} size="lg" />
             <strong className="fs-5">Tạo Đơn Hàng Mới (POS)</strong>
          </CCardHeader>
          <CCardBody className="p-4">
            
            {/* THÔNG TIN CHUNG */}
            <CRow className="mb-4">
              <CCol md={6}>
                <label className="fw-bold mb-2">Khách hàng mua</label>
                <CFormSelect value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                  {mockCustomers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <label className="fw-bold mb-2">Nhân viên chốt đơn</label>
                <CFormSelect value={userId} onChange={(e) => setUserId(e.target.value)}>
                   {mockSalesUsers.map(u => (
                     <option key={u.id} value={u.id}>{u.fullName}</option>
                   ))}
                </CFormSelect>
              </CCol>
            </CRow>

            <hr className="mb-4" />

            {/* PHẦN CHỌN SẢN PHẨM */}
            <CRow className="mb-4 position-relative">
              <CCol md={12}>
                <label className="fw-bold mb-2">Tra cứu sản phẩm (Nhập tên hoặc SKU)</label>
                <CInputGroup>
                  <CInputGroupText className="bg-light"><CIcon icon={cilSearch}/></CInputGroupText>
                  <CFormInput 
                    placeholder="Quét mã vạch tự động hoặc nhập tay SKU..." 
                    value={searchTerm}
                    onChange={handleSearch}
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
                            <strong>{v.sku}</strong> - {v.name}
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
                    <CTableHeaderCell style={{ width: '30%' }}>Mặt hàng (SKU)</CTableHeaderCell>
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
                             <strong>{item.variant.sku}</strong>
                             <div className="text-muted small">{item.variant.name}</div>
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
                              <CIcon icon={cilTrash}/>
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
                    
                    <hr/>
                    
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
    </CRow>
  )
}

export default CreateOrder
