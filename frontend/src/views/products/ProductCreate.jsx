import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CRow,
  CCol,
  CForm,
  CFormLabel,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilTrash, cilSave, cilArrowLeft } from '@coreui/icons'
import axiosClient from '../../api/axiosClient'

const ProductCreate = () => {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [isSaving, setIsSaving] = useState(false)

  // Master Data
  const [productData, setProductData] = useState({
    name: '',
    categoryId: '',
    description: ''
  })

  // Variants Array
  const [variants, setVariants] = useState([
    { id: Date.now(), sku: '', attributes: '', importPrice: 0, sellPrice: 0, minStockLevel: 5 }
  ])

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const data = await axiosClient.get('/categories')
      setCategories(data)
    } catch (e) {
      console.error('Error fetching categories:', e)
    }
  }

  const handleProductChange = (e) => {
    setProductData({ ...productData, [e.target.name]: e.target.value })
  }

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      { id: Date.now(), sku: '', attributes: '', importPrice: 0, sellPrice: 0, minStockLevel: 5 }
    ])
  }

  const handleRemoveVariant = (id) => {
    if (variants.length === 1) return // Giữ tối thiểu 1 dòng
    setVariants(variants.filter(v => v.id !== id))
  }

  const handleVariantChange = (id, field, value) => {
    setVariants(variants.map(v => {
      if (v.id === id) {
        return { ...v, [field]: value }
      }
      return v
    }))
  }

  const handleSave = async () => {
    if (!productData.name.trim() || !productData.categoryId) {
      alert("Vui lòng điền đủ Tên Sản Phẩm và Danh Mục!")
      return
    }

    // Validate variants
    const hasEmptyAttribute = variants.some(v => typeof v.attributes === 'string' && v.attributes.trim() === '')
    if (hasEmptyAttribute) {
      alert("Vui lòng nhập Phân loại / Thuộc tính cho tất cả biến thể!")
      return
    }

    try {
      setIsSaving(true)
      const payload = {
        name: productData.name.trim(),
        categoryId: parseInt(productData.categoryId),
        description: productData.description.trim(),
        variants: variants.map(v => ({
          sku: v.sku.trim(),
          attributes: v.attributes.trim(),
          importPrice: Number(v.importPrice),
          sellPrice: Number(v.sellPrice),
          minStockLevel: Number(v.minStockLevel)
        }))
      }

      await axiosClient.post('/products', payload)
      alert("Khởi tạo Sản Phẩm thành công!")
      navigate('/products/list')
      
    } catch (error) {
      const msg = error.response?.data?.message || 'Có lỗi xảy ra khi lưu sản phẩm'
      alert(msg)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="mb-0">Thêm Mới Sản Phẩm</h4>
          <CButton color="secondary" variant="ghost" onClick={() => navigate('/products/list')} className="d-flex align-items-center gap-2">
            <CIcon icon={cilArrowLeft} /> Quay lại
          </CButton>
        </div>
      </CCol>

      {/* THÔNG TIN CHUNG */}
      <CCol lg={4}>
        <CCard className="mb-4 shadow-sm border-top-primary border-top-3">
          <CCardHeader className="bg-white">
            <strong className="text-primary">Thông Tin Chung</strong>
          </CCardHeader>
          <CCardBody>
            <CForm>
              <div className="mb-3 text-muted small fst-italic">
                * Mã Sản Phẩm sẽ được hệ thống sinh tự động.
              </div>
              <div className="mb-3">
                <CFormLabel className="fw-bold">Tên Sản Phẩm <span className="text-danger">*</span></CFormLabel>
                <CFormInput 
                  name="name"
                  value={productData.name}
                  onChange={handleProductChange}
                  placeholder="Ví dụ: iPhone 15 Pro Max..." 
                />
              </div>
              <div className="mb-3">
                <CFormLabel className="fw-bold">Danh Mục <span className="text-danger">*</span></CFormLabel>
                <CFormSelect name="categoryId" value={productData.categoryId} onChange={handleProductChange}>
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </CFormSelect>
              </div>
              <div className="mb-3">
                <CFormLabel className="fw-bold">Mô tả chi tiết</CFormLabel>
                <CFormTextarea 
                  name="description"
                  value={productData.description}
                  onChange={handleProductChange}
                  rows="4"
                  placeholder="Ghi chú về sản phẩm..."
                ></CFormTextarea>
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>

      {/* DANH SÁCH BIẾN THỂ */}
      <CCol lg={8}>
        <CCard className="mb-4 shadow-sm border-top-success border-top-3">
          <CCardHeader className="bg-white d-flex justify-content-between align-items-center">
            <strong className="text-success">Biến Thể (Quy cách / Phân loại)</strong>
            <CButton color="success" variant="outline" size="sm" onClick={handleAddVariant} className="d-flex align-items-center gap-1">
              <CIcon icon={cilPlus} /> Thêm Loại
            </CButton>
          </CCardHeader>
          <CCardBody className="p-0">
            <div className="table-responsive">
              <CTable bordered hover size="sm" className="mb-0 border-0 align-middle text-nowrap">
                <CTableHead color="light">
                  <CTableRow>
                    <CTableHeaderCell style={{ width: '130px' }}>Mã Vạch / SKU</CTableHeaderCell>
                    <CTableHeaderCell style={{ minWidth: '150px' }}>Thuộc Tính <span className="text-danger">*</span></CTableHeaderCell>
                    <CTableHeaderCell style={{ width: '120px' }}>Giá Nhập</CTableHeaderCell>
                    <CTableHeaderCell style={{ width: '120px' }}>Giá Bán</CTableHeaderCell>
                    <CTableHeaderCell style={{ width: '90px' }} title="Cảnh báo tồn kho" className="text-center">Min Stock</CTableHeaderCell>
                    <CTableHeaderCell style={{ width: '40px' }}></CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {variants.map((variant) => (
                    <CTableRow key={variant.id}>
                      <CTableDataCell>
                        <CFormInput 
                          size="sm" 
                          placeholder="(Tự sinh)" 
                          value={variant.sku}
                          onChange={(e) => handleVariantChange(variant.id, 'sku', e.target.value)}
                        />
                      </CTableDataCell>
                      <CTableDataCell>
                        <CFormInput 
                          size="sm" 
                          placeholder="Màu Trắng, 256GB..." 
                          value={variant.attributes}
                          onChange={(e) => handleVariantChange(variant.id, 'attributes', e.target.value)}
                        />
                      </CTableDataCell>
                      <CTableDataCell>
                        <CFormInput 
                          type="number" size="sm" min="0" step="1000"
                          value={variant.importPrice}
                          onChange={(e) => handleVariantChange(variant.id, 'importPrice', e.target.value)}
                        />
                      </CTableDataCell>
                      <CTableDataCell>
                        <CFormInput 
                          type="number" size="sm" min="0" step="1000"
                          value={variant.sellPrice}
                          onChange={(e) => handleVariantChange(variant.id, 'sellPrice', e.target.value)}
                        />
                      </CTableDataCell>
                      <CTableDataCell>
                        <CFormInput 
                          type="number" size="sm" min="0" className="text-center"
                          value={variant.minStockLevel}
                          onChange={(e) => handleVariantChange(variant.id, 'minStockLevel', e.target.value)}
                        />
                      </CTableDataCell>
                      <CTableDataCell className="text-center bg-light">
                        <CButton 
                          color="danger" variant="ghost" size="sm" className="p-1"
                          onClick={() => handleRemoveVariant(variant.id)}
                          disabled={variants.length === 1}
                        >
                          <CIcon icon={cilTrash} />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </div>
            <div className="p-3 border-top bg-light text-end">
               <CButton 
                 color="primary" 
                 size="lg" 
                 className="px-4 d-inline-flex align-items-center gap-2"
                 disabled={isSaving}
                 onClick={handleSave}
               >
                 <CIcon icon={cilSave} /> {isSaving ? 'Đang hệ thống hoá...' : 'Lưu Sản Phẩm'}
               </CButton>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default ProductCreate
