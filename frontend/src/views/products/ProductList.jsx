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
  CTableRow,
  CTableHeaderCell,
  CBadge,
  CCollapse,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
// Nếu không tìm thấy CIcon thì comment out hoặc cài đặt bổ sung thư viện @coreui/icons-react
// Ở đây tôi dùng text thay thế nếu dự án chưa import đúng icon, hoặc giữ CIcon nếu đã cài
import CIcon from '@coreui/icons-react'
import { cilPlus, cilChevronBottom, cilChevronRight } from '@coreui/icons'
import axiosClient from '../../api/axiosClient'

// ===============================================
// MAIN COMPONENT
// ===============================================
const ProductList = () => {
  const navigate = useNavigate()
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
      const data = await axiosClient.get('/products')
      setProducts(data)
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
        <CButton color="primary" onClick={() => navigate('/products/create')} className="d-flex align-items-center gap-2">
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
                            <h6 className="mb-3 text-secondary">Khay chứa: Biến thể (Variants) & Lô hàng (Batches)</h6>
                            <CTable small bordered className="mb-0">
                              <CTableHead>
                                <CTableRow>
                                  <CTableHeaderCell>SKU</CTableHeaderCell>
                                  <CTableHeaderCell>Thuộc tính</CTableHeaderCell>
                                  <CTableHeaderCell className="text-end">Giá nhập</CTableHeaderCell>
                                  <CTableHeaderCell className="text-end">Giá bán</CTableHeaderCell>
                                  <CTableHeaderCell className="text-end">Tồn kho / Phân Lô</CTableHeaderCell>
                                </CTableRow>
                              </CTableHead>
                              <CTableBody>
                                {product.variants && product.variants.length > 0 ? (
                                  product.variants.map((v) => (
                                    <CTableRow key={v.id}>
                                      <CTableDataCell><strong>{v.sku}</strong></CTableDataCell>
                                      <CTableDataCell>
                                        {/* Render thuộc tính từ JSON */}
                                        {v.attributes && Object.entries(v.attributes).map(([key, val]) => (
                                          <CBadge key={key} color="secondary" className="me-1">
                                            {key}: {val}
                                          </CBadge>
                                        ))}
                                      </CTableDataCell>
                                      <CTableDataCell className="text-end">{formatCurrency(v.importPrice)}</CTableDataCell>
                                      <CTableDataCell className="text-end text-primary">{formatCurrency(v.sellPrice)}</CTableDataCell>
                                      <CTableDataCell className="text-end">
                                        <div className="mb-1">
                                          <strong className={v.stockCount <= (v.minStockLevel || 5) ? "text-danger" : ""}>Tổng: {v.stockCount}</strong>
                                        </div>
                                        {/* Hiển thị phân rã Lô Hàng */}
                                        {v.batches && v.batches.length > 0 && (
                                          <div className="d-flex flex-column align-items-end gap-1 mt-1">
                                            {v.batches.map(batch => (
                                              <CBadge key={batch.id} color="warning" shape="rounded-pill" textColor="dark" className="d-block w-auto text-end" style={{ fontSize: '0.7em' }}>
                                                Lô {batch.batchNumber}: {batch.currentQty}
                                              </CBadge>
                                            ))}
                                          </div>
                                        )}
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
