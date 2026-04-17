import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CBadge,
  CCollapse,
} from '@coreui/react'
// Nếu không tìm thấy CIcon thì comment out hoặc cài đặt bổ sung thư viện @coreui/icons-react
// Ở đây tôi dùng text thay thế nếu dự án chưa import đúng icon, hoặc giữ CIcon nếu đã cài
import CIcon from '@coreui/icons-react'
import { cilPlus, cilChevronBottom, cilChevronRight } from '@coreui/icons'

// ===============================================
// MOCK API FUNCTONS (Simulate axios request)
// ===============================================
const mockFetchProducts = () => {
  const mockData = [
    {
      id: 1,
      code: 'SP-MDF',
      name: 'Ván MDF cốt xanh',
      category: { id: 1, name: 'Ván gỗ công nghiệp' },
      variants: [
        { id: 101, sku: 'MDF-X-15', attributes: { thickness: '15mm', size: '1220x2440' }, importPrice: 250000, sellPrice: 300000, stockCount: 150 },
        { id: 102, sku: 'MDF-X-17', attributes: { thickness: '17mm', size: '1220x2440' }, importPrice: 280000, sellPrice: 340000, stockCount: 80 },
      ],
    },
    {
      id: 2,
      code: 'SP-KEO-PUR',
      name: 'Keo dán cạnh PUR',
      category: { id: 2, name: 'Phụ liệu sản xuất' },
      variants: [
        { id: 201, sku: 'PUR-TRANG-2KG', attributes: { color: 'Trắng', weight: '2kg' }, importPrice: 400000, sellPrice: 500000, stockCount: 20 },
        { id: 202, sku: 'PUR-TRONG-2KG', attributes: { color: 'Trong suốt', weight: '2kg' }, importPrice: 450000, sellPrice: 550000, stockCount: 15 },
      ],
    },
    {
      id: 3,
      code: 'SP-BL-GC',
      name: 'Bản lề giảm chấn',
      category: { id: 3, name: 'Phụ kiện tủ' },
      variants: [
        { id: 301, sku: 'BL-GC-THANG', attributes: { type: 'Thẳng', material: 'Inox 304' }, importPrice: 15000, sellPrice: 25000, stockCount: 500 },
        { id: 302, sku: 'BL-GC-CONG-IT', attributes: { type: 'Cong ít', material: 'Inox 304' }, importPrice: 16000, sellPrice: 26000, stockCount: 300 },
        { id: 303, sku: 'BL-GC-CONG-NHIEU', attributes: { type: 'Cong nhiều', material: 'Inox 304' }, importPrice: 17000, sellPrice: 27000, stockCount: 250 },
      ],
    },
  ];

  return new Promise((resolve) => {
    // Giả lập độ trễ network 500ms
    setTimeout(() => {
      resolve({ data: mockData })
    }, 500)
  })
}

// ===============================================
// MAIN COMPONENT
// ===============================================
const ProductList = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState([]) // Lưu ID của các dòng đang được mở rộng

  // Component Did Mount
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await mockFetchProducts()
      setProducts(response.data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  // Toggle thu gọn / mở rộng dòng
  const toggleRow = (id) => {
    const isExpanded = expanded.includes(id)
    if (isExpanded) {
      setExpanded(expanded.filter((item) => item !== id))
    } else {
      setExpanded([...expanded, id])
    }
  }

  // Helper tính tổng tồn kho từ mảng variants
  const calculateTotalStock = (variants) => {
    if (!variants || variants.length === 0) return 0
    return variants.reduce((acc, curr) => acc + curr.stockCount, 0)
  }

  // Format số liệu tiền tệ VND
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  }

  return (
    <CCard className="mb-4">
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <strong>Danh mục vật tư & Sản phẩm</strong>
        <CButton color="primary" className="d-flex align-items-center gap-2">
          <CIcon icon={cilPlus} />
          Thêm mới
        </CButton>
      </CCardHeader>
      <CCardBody>
        {loading ? (
          <div className="text-center">Đang tải dữ liệu...</div>
        ) : (
          <CTable responsive hover className="align-middle">
            <CTableHead color="light">
              <CTableRow>
                <CTableHeaderCell scope="col" style={{ width: '5%' }}></CTableHeaderCell>
                <CTableHeaderCell scope="col" style={{ width: '15%' }}>Mã SP</CTableHeaderCell>
                <CTableHeaderCell scope="col" style={{ width: '30%' }}>Tên Sản phẩm</CTableHeaderCell>
                <CTableHeaderCell scope="col" style={{ width: '20%' }}>Danh mục</CTableHeaderCell>
                <CTableHeaderCell scope="col" className="text-center">Tồn kho tổng</CTableHeaderCell>
                <CTableHeaderCell scope="col" className="text-end">Hành động</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {products.map((product) => {
                const isExpanded = expanded.includes(product.id)
                const totalStock = calculateTotalStock(product.variants)

                return (
                  <React.Fragment key={product.id}>
                    {/* Dòng chính cho Product */}
                    <CTableRow onClick={() => toggleRow(product.id)} style={{ cursor: 'pointer' }}>
                      <CTableDataCell className="text-center">
                        <CIcon icon={isExpanded ? cilChevronBottom : cilChevronRight} />
                      </CTableDataCell>
                      <CTableDataCell><strong>{product.code}</strong></CTableDataCell>
                      <CTableDataCell>{product.name}</CTableDataCell>
                      <CTableDataCell>
                        <CBadge color="info" shape="rounded-pill">
                          {product.category?.name || 'N/A'}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        <CBadge color={totalStock > 0 ? "success" : "danger"}>
                          {totalStock > 0 ? totalStock : 'Hết hàng'}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell className="text-end">
                        <CButton color="secondary" variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); /* handle edit */ }}>Sửa</CButton>
                      </CTableDataCell>
                    </CTableRow>

                    {/* Dòng phụ (Variants) được mở rộng bằng chức năng Collapse */}
                    <CTableRow>
                      <CTableDataCell colSpan="6" className="p-0 border-0">
                        <CCollapse visible={isExpanded}>
                          <div className="p-3 bg-light m-2 rounded">
                            <h6 className="mb-3 text-secondary">Các biến thể (Variants) của: {product.name}</h6>
                            <CTable small bordered className="mb-0">
                              <CTableHead>
                                <CTableRow>
                                  <CTableHeaderCell>SKU</CTableHeaderCell>
                                  <CTableHeaderCell>Thuộc tính</CTableHeaderCell>
                                  <CTableHeaderCell className="text-end">Giá nhập</CTableHeaderCell>
                                  <CTableHeaderCell className="text-end">Giá bán</CTableHeaderCell>
                                  <CTableHeaderCell className="text-end">Tồn kho</CTableHeaderCell>
                                </CTableRow>
                              </CTableHead>
                              <CTableBody>
                                {product.variants && product.variants.length > 0 ? (
                                  product.variants.map((v) => (
                                    <CTableRow key={v.id}>
                                      <CTableDataCell><strong>{v.sku}</strong></CTableDataCell>
                                      <CTableDataCell>
                                        {/* Render thuộc tính từ JSON */}
                                        {Object.entries(v.attributes).map(([key, val]) => (
                                          <CBadge key={key} color="secondary" className="me-1">
                                            {key}: {val}
                                          </CBadge>
                                        ))}
                                      </CTableDataCell>
                                      <CTableDataCell className="text-end">{formatCurrency(v.importPrice)}</CTableDataCell>
                                      <CTableDataCell className="text-end text-primary">{formatCurrency(v.sellPrice)}</CTableDataCell>
                                      <CTableDataCell className="text-end">
                                        <strong className={v.stockCount <= 5 ? "text-danger" : ""}>{v.stockCount}</strong>
                                      </CTableDataCell>
                                    </CTableRow>
                                  ))
                                ) : (
                                  <CTableRow>
                                    <CTableDataCell colSpan="5" className="text-center">Chưa có biến thể nào</CTableDataCell>
                                  </CTableRow>
                                )}
                              </CTableBody>
                            </CTable>
                          </div>
                        </CCollapse>
                      </CTableDataCell>
                    </CTableRow>
                  </React.Fragment>
                )
              })}
            </CTableBody>
          </CTable>
        )}
      </CCardBody>
    </CCard>
  )
}

export default ProductList
