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
  CAlert,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CSpinner,
} from '@coreui/react'
import { useNavigate, useLocation } from 'react-router-dom'
// Nếu không tìm thấy CIcon thì comment out hoặc cài đặt bổ sung thư viện @coreui/icons-react
// Ở đây tôi dùng text thay thế nếu dự án chưa import đúng icon, hoặc giữ CIcon nếu đã cài
import CIcon from '@coreui/icons-react'
import { cilPlus, cilChevronBottom, cilChevronRight, cilTrash, cilPencil, cilWarning } from '@coreui/icons'
import axiosClient from '../../api/axiosClient'

// ===============================================
// MAIN COMPONENT
// ===============================================
const ProductList = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [products, setProducts] = useState([])
  const [alertMessage, setAlertMessage] = useState(location.state?.successMessage || '')
  const [errorAlert, setErrorAlert] = useState('')

  useEffect(() => {
    if (alertMessage) {
      // Clear react router status
      window.history.replaceState({}, document.title)
      const t = setTimeout(() => setAlertMessage(''), 4000)
      return () => clearTimeout(t)
    }
  }, [alertMessage])

  useEffect(() => {
    if (errorAlert) {
      const t = setTimeout(() => setErrorAlert(''), 6000)
      return () => clearTimeout(t)
    }
  }, [errorAlert])

  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState([]) // Lưu ID của các dòng đang được mở rộng

  // State chuyên dùng cho Modal Cảnh báo Xóa
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

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

  // Helper kích hoạt Pop-up thay vì dùng hàm xóa trực tiếp
  const triggerDelete = (product, e) => {
    e.stopPropagation()
    setProductToDelete(product)
    setDeleteModalVisible(true)
  }

  // Thực thi Delete khi bấm Click Đồng ý trên Modal 
  const executeDelete = async () => {
    if (!productToDelete) return
    try {
      setIsDeleting(true)
      await axiosClient.delete(`/products/${productToDelete.id}`)
      setProducts(products.filter(p => p.id !== productToDelete.id))
      setAlertMessage('Đã xóa sản phẩm thành công!')
      setDeleteModalVisible(false) // Đóng ngay lập tức nếu thành công
      setProductToDelete(null)
    } catch (error) {
      setErrorAlert(error.response?.data?.message || 'Có lỗi xảy ra khi xóa sản phẩm')
      // Đóng hộp thoại modal và giữ nguyên ở danh sách SP
      setDeleteModalVisible(false)
      setProductToDelete(null)
    } finally {
      setIsDeleting(false)
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
    <>
      {alertMessage && (
        <CAlert color="success" dismissible onClose={() => setAlertMessage('')}>
          {alertMessage}
        </CAlert>
      )}
      {errorAlert && (
        <CAlert color="danger" dismissible onClose={() => setErrorAlert('')} className="d-flex align-items-center gap-2 mb-3">
          <CIcon icon={cilWarning} size="lg"/>
          <div>{errorAlert}</div>
        </CAlert>
      )}
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
                        <div className="d-flex justify-content-end gap-2">
                          <CButton color="info" variant="ghost" size="sm" className="p-1 px-2 d-flex align-items-center gap-1" onClick={(e) => { e.stopPropagation(); navigate(`/products/edit/${product.id}`) }}>
                            <CIcon icon={cilPencil} size="sm" /> Sửa
                          </CButton>
                          <CButton color="danger" variant="ghost" size="sm" className="p-1 px-2 d-flex align-items-center gap-1" onClick={(e) => triggerDelete(product, e)}>
                            <CIcon icon={cilTrash} size="sm" /> Xóa
                          </CButton>
                        </div>
                      </CTableDataCell>
                    </CTableRow>

                    {/* Dòng phụ (Variants) được mở rộng bằng chức năng Collapse */}
                    <CTableRow>
                      <CTableDataCell colSpan="6" className="p-0 border-0">
                        <CCollapse visible={isExpanded}>
                          <div className="p-3 bg-light m-2 rounded">
                            <h6 className="mb-3 text-secondary">Thông Tin Chi Tiết</h6>
                            <CTable small bordered className="mb-0">
                              <CTableHead>
                                <CTableRow>
                                  <CTableHeaderCell>Mã Sản Phẩm</CTableHeaderCell>
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
                                            {key === 'details' ? val : `${key}: ${val}`}
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

      {/* HIỂN THỊ HỘP THOẠI CONFIRM XÓA */}
      <CModal backdrop="static" visible={deleteModalVisible} onClose={() => setDeleteModalVisible(false)}>
        <CModalHeader className="bg-danger border-0">
          <CModalTitle className="d-flex align-items-center gap-2 text-white">
            <CIcon icon={cilWarning} size="xl" />
            Cảnh báo rủi ro dữ liệu
          </CModalTitle>
        </CModalHeader>
        <CModalBody className="p-4 text-center">
          <h5 className="mb-3 text-dark">Bạn có chắc chắn muốn xóa vĩnh viễn mặt hàng này?</h5>
          {productToDelete && (
            <p className="fs-5 text-danger fw-bold border p-2 mb-3 bg-light rounded">
              [{productToDelete.code}] {productToDelete.name}
            </p>
          )}
          <p className="text-muted small mb-0">
            Thao tác này <strong>không thể hoàn tác</strong> và mọi thông số biến thể đính kèm sẽ bị gỡ bỏ.<br/>
            (Hệ thống tự động chặn nếu sản phẩm này đã từng nhập kho hoặc phát sinh giao dịch).
          </p>
        </CModalBody>
        <CModalFooter className="justify-content-center border-0 pb-4">
          <CButton color="secondary" variant="ghost" onClick={() => setDeleteModalVisible(false)}>
            Hủy bỏ
          </CButton>
          <CButton color="danger" onClick={executeDelete} disabled={isDeleting} className="px-4 text-white shadow-sm">
            {isDeleting ? (
              <><CSpinner size="sm" className="me-2" /> Đang xóa...</>
            ) : 'Đồng ý Xóa'}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default ProductList
