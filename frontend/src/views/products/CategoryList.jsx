import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
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
  CForm,
  CFormInput,
  CFormLabel,
  CFormTextarea
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilPencil } from '@coreui/icons'
import axiosClient from '../../api/axiosClient'

const CategoryList = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  // -- Modal State --
  const [visible, setVisible] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({ id: null, name: '', description: '' })
  const [formError, setFormError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const data = await axiosClient.get('/categories')
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenAddModal = () => {
    setFormData({ id: null, name: '', description: '' })
    setFormError('')
    setIsEditing(false)
    setVisible(true)
  }

  const handleOpenEditModal = (cat) => {
    setFormData({ id: cat.id, name: cat.name, description: cat.description || '' })
    setFormError('')
    setIsEditing(true)
    setVisible(true)
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setFormError('Vui lòng nhập Tên danh mục')
      return
    }

    try {
      setIsSaving(true)
      setFormError('')
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim()
      }

      if (isEditing) {
        await axiosClient.put(`/categories/${formData.id}`, payload)
      } else {
        await axiosClient.post('/categories', payload)
      }

      setVisible(false)
      fetchCategories()
    } catch (error) {
      setFormError(error.response?.data?.message || 'Có lỗi xảy ra khi lưu')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <strong>Quản lý Danh Mục Sản Phẩm</strong>
          <CButton color="primary" onClick={handleOpenAddModal} className="d-flex align-items-center gap-2">
            <CIcon icon={cilPlus} /> Thêm Mới
          </CButton>
        </CCardHeader>
        <CCardBody>
          {loading ? (
            <div className="text-center py-4">Đang tải biểu dữ liệu...</div>
          ) : (
            <CTable hover responsive align="middle">
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell style={{ width: '80px' }}>ID</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: '250px' }}>Tên Danh Mục</CTableHeaderCell>
                  <CTableHeaderCell>Mô tả chi tiết</CTableHeaderCell>
                  <CTableHeaderCell className="text-center" style={{ width: '120px' }}>Hành động</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {categories.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan={4} className="text-center py-4">Chưa có danh mục nào. Hãy bấm Thêm mới!</CTableDataCell>
                  </CTableRow>
                ) : (
                  categories.map((cat) => (
                    <CTableRow key={cat.id}>
                      <CTableDataCell>#{cat.id}</CTableDataCell>
                      <CTableDataCell><strong>{cat.name}</strong></CTableDataCell>
                      <CTableDataCell>{cat.description || <span className="text-muted fst-italic">Không có mô tả</span>}</CTableDataCell>
                      <CTableDataCell className="text-center">
                        <CButton color="secondary" variant="ghost" size="sm" onClick={() => handleOpenEditModal(cat)}>
                          <CIcon icon={cilPencil} className="me-1" /> Sửa
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))
                )}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>

      {/* Modal Thêm/Sửa Danh Mục */}
      <CModal visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader closeButton>
          <CModalTitle>{isEditing ? 'Chỉnh sửa Danh Mục' : 'Thêm Danh Mục Mới'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {formError && <div className="alert alert-danger p-2 mb-3">{formError}</div>}
          <CForm>
            <div className="mb-3">
              <CFormLabel>Tên Danh Mục <span className="text-danger">*</span></CFormLabel>
              <CFormInput 
                name="name" 
                value={formData.name} 
                onChange={handleInputChange} 
                placeholder="VD: Điện thoại, Thời trang, Chăm sóc nhà cửa..." 
              />
            </div>
            <div className="mb-3">
              <CFormLabel>Mô tả tham khảo</CFormLabel>
              <CFormTextarea 
                name="description" 
                value={formData.description} 
                onChange={handleInputChange} 
                placeholder="Nhập ghi chú hoặc mô tả ngắn..." 
                rows="3"
              />
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="ghost" onClick={() => setVisible(false)}>Hủy</CButton>
          <CButton color="primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Đang lưu...' : 'Lưu lại'}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default CategoryList
