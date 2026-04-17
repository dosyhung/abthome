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
  CFormLabel
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilPencil } from '@coreui/icons'
import axiosClient from '../../api/axiosClient'

const SupplierList = () => {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)

  // -- Modal State --
  const [visible, setVisible] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    phone: '',
    address: '',
    taxCode: ''
  })
  const [formError, setFormError] = useState('')

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    try {
      setLoading(true)
      const data = await axiosClient.get('/partners?type=SUPPLIER')
      setSuppliers(data)
    } catch (error) {
      console.error('Error fetching suppliers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenAddModal = () => {
    setFormData({ id: null, name: '', phone: '', address: '', taxCode: '' })
    setFormError('')
    setIsEditing(false)
    setVisible(true)
  }

  const handleOpenEditModal = (supplier) => {
    setFormData({ ...supplier })
    setFormError('')
    setIsEditing(true)
    setVisible(true)
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    if (!formData.name || !formData.phone) {
      setFormError('Vui lòng nhập Tên và Số điện thoại')
      return
    }

    try {
      setFormError('')
      let payload = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        taxCode: formData.taxCode,
        type: 'SUPPLIER'
      }

      if (isEditing) {
        await axiosClient.put(`/partners/${formData.id}`, payload)
      } else {
        await axiosClient.post('/partners', payload)
      }

      setVisible(false)
      fetchSuppliers() // Refresh lists
    } catch (error) {
      setFormError(error.response?.data?.message || 'Có lỗi xảy ra khi lưu')
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0)
  }

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <strong>Quản lý Nhà Cung Cấp</strong>
          <CButton color="primary" onClick={handleOpenAddModal} className="d-flex align-items-center gap-2">
            <CIcon icon={cilPlus} /> Thêm mới
          </CButton>
        </CCardHeader>
        <CCardBody>
          {loading ? (
            <div className="text-center">Đang tải dữ liệu...</div>
          ) : (
            <CTable hover responsive align="middle">
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell>Tên NCC</CTableHeaderCell>
                  <CTableHeaderCell>Điện thoại</CTableHeaderCell>
                  <CTableHeaderCell>Địa chỉ</CTableHeaderCell>
                  <CTableHeaderCell>Mã số thuế</CTableHeaderCell>
                  <CTableHeaderCell className="text-end">Dư nợ</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Hành động</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {suppliers.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan={6} className="text-center">Không có nhà cung cấp nào.</CTableDataCell>
                  </CTableRow>
                ) : (
                  suppliers.map((s) => (
                    <CTableRow key={s.id}>
                      <CTableDataCell><strong>{s.name}</strong></CTableDataCell>
                      <CTableDataCell>{s.phone}</CTableDataCell>
                      <CTableDataCell>{s.address || '-'}</CTableDataCell>
                      <CTableDataCell>{s.taxCode || '-'}</CTableDataCell>
                      <CTableDataCell className={`text-end fw-bold ${s.debtBalance > 0 ? 'text-danger' : 'text-success'}`}>
                        {formatCurrency(s.debtBalance)}
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        <CButton color="secondary" variant="ghost" size="sm" onClick={() => handleOpenEditModal(s)}>
                          <CIcon icon={cilPencil} /> Sửa
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

      {/* Modal Thêm/Sửa */}
      <CModal visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader>
          <CModalTitle>{isEditing ? 'Sửa thông tin Nhà cung cấp' : 'Thêm Nhà cung cấp'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {formError && <div className="alert alert-danger p-2 mb-3">{formError}</div>}
          <CForm>
            <div className="mb-3">
              <CFormLabel>Tên Nhà cung cấp <span className="text-danger">*</span></CFormLabel>
              <CFormInput name="name" value={formData.name} onChange={handleInputChange} placeholder="Nhập tên..." />
            </div>
            <div className="mb-3">
              <CFormLabel>Số điện thoại <span className="text-danger">*</span></CFormLabel>
              <CFormInput name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Nhập số điện thoại..." />
            </div>
            <div className="mb-3">
              <CFormLabel>Địa chỉ</CFormLabel>
              <CFormInput name="address" value={formData.address} onChange={handleInputChange} placeholder="Nhập địa chỉ..." />
            </div>
            <div className="mb-3">
              <CFormLabel>Mã số thuế</CFormLabel>
              <CFormInput name="taxCode" value={formData.taxCode} onChange={handleInputChange} placeholder="Nhập mã số thuế..." />
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>Hủy</CButton>
          <CButton color="primary" onClick={handleSave}>Lưu lại</CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default SupplierList
