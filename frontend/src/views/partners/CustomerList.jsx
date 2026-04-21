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
  CFormSelect
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilPencil, cilUser } from '@coreui/icons'
import axiosClient from '../../api/axiosClient'
import { useAuth } from '../../contexts/AuthContext'

const CustomerList = () => {
  const { user } = useAuth()
  const [customers, setCustomers] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  let canManageUsers = false
  if (user?.role?.permissions) {
    const perms = typeof user.role.permissions === 'string'
      ? JSON.parse(user.role.permissions)
      : user.role.permissions
    canManageUsers = Array.isArray(perms) && perms.includes('ALL_ACCESS')
  }

  // Khai báo state phục vụ form thêm/sửa khách hàng
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

  // State phục vụ confirm form (chuyển người phụ trách)
  const [confirmVisible, setConfirmVisible] = useState(false)
  const [pendingAssign, setPendingAssign] = useState(null) // { customerId, newUserId, oldUserId }

  useEffect(() => {
    fetchCustomers()
    if (canManageUsers) {
      fetchUsers()
    }
  }, [canManageUsers])

  const fetchUsers = async () => {
    try {
      const res = await axiosClient.get('/users')
      setUsers(Array.isArray(res) ? res : res?.data || [])
    } catch (e) {
      console.error(e)
    }
  }

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const res = await axiosClient.get('/partners?type=CUSTOMER')
      setCustomers(Array.isArray(res) ? res : res?.data || [])
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  // --------------- Xử Lý Form Thêm/Sửa Tên SDT Mặc Định ---------------
  const handleOpenAddModal = () => {
    setFormData({ id: null, name: '', phone: '', address: '', taxCode: '' })
    setFormError('')
    setIsEditing(false)
    setVisible(true)
  }

  const handleOpenEditModal = (c) => {
    setFormData({ ...c })
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
        type: 'CUSTOMER'
      }

      if (isEditing) {
        await axiosClient.put(`/partners/${formData.id}`, payload)
      } else {
        await axiosClient.post('/partners', payload)
      }

      setVisible(false)
      fetchCustomers() // Refresh
    } catch (error) {
      setFormError(error.response?.data?.message || 'Có lỗi xảy ra khi lưu')
    }
  }

  // --------------- Xử Lý Pop-up Gán Nhân Viên (Chia khách) ---------------
  const handleDropdownChange = (customerId, currentAssignedToId, newUserId) => {
    // Nếu chọn lại chính người cũ hoặc không đổi thì bỏ qua
    if (String(currentAssignedToId || '') === String(newUserId || '')) return;

    setPendingAssign({ customerId, newUserId, oldUserId: currentAssignedToId })
    setConfirmVisible(true) // Bật pop up hỏi
  }

  const confirmAssignment = async () => {
    if (!pendingAssign) return
    try {
      await axiosClient.put(`/partners/${pendingAssign.customerId}`, { assignedToId: pendingAssign.newUserId || null })
      setConfirmVisible(false)
      setPendingAssign(null)
      fetchCustomers()
    } catch (err) {
      setConfirmVisible(false)
      alert("Lỗi khi chuyển phụ trách khách hàng: " + (err.response?.data?.message || err.message))
    }
  }

  const cancelAssignment = () => {
    setConfirmVisible(false)
    setPendingAssign(null)
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0)
  }

  // Tìm tên User cho Popup
  const getSelectedUserName = (userId) => {
    if (!userId) return "Trống (Ai cũng có thể tiếp cận nếu admin tự giao hoặc khách vãng lai)"
    const u = users.find(x => String(x.id) === String(userId))
    return u ? u.fullName : "Không xác định"
  }

  return (
    <>
      <CCard className="mb-4 shadow-sm border-top-primary border-top-3">
        <CCardHeader className="bg-white d-flex justify-content-between align-items-center">
          <strong className="text-primary d-flex align-items-center gap-2">
            <CIcon icon={cilUser} /> Danh sách Khách Hàng
          </strong>
          <CButton color="primary" onClick={handleOpenAddModal} className="d-flex align-items-center gap-2">
            <CIcon icon={cilPlus} /> Thêm khách hàng
          </CButton>
        </CCardHeader>
        <CCardBody>
          {loading ? (
            <div className="text-center py-4">Đang tải dữ liệu...</div>
          ) : (
            <CTable hover responsive align="middle" className="border">
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell>Tên Khách Hàng</CTableHeaderCell>
                  <CTableHeaderCell>Điện thoại</CTableHeaderCell>
                  <CTableHeaderCell>Địa chỉ</CTableHeaderCell>
                  <CTableHeaderCell className="text-end">Dư nợ</CTableHeaderCell>
                  {canManageUsers && <CTableHeaderCell className="text-center bg-info bg-opacity-10">Quyền Phụ Trách</CTableHeaderCell>}
                  <CTableHeaderCell className="text-center">Hành động</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {customers.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan={canManageUsers ? 6 : 5} className="text-center py-5">Chưa có khách hàng nào trong hệ thống.</CTableDataCell>
                  </CTableRow>
                ) : (
                  customers.map((c) => (
                    <CTableRow key={c.id}>
                      <CTableDataCell>
                        <strong>{c.name}</strong>
                      </CTableDataCell>
                      <CTableDataCell>{c.phone}</CTableDataCell>
                      <CTableDataCell>{c.address || '-'}</CTableDataCell>
                      <CTableDataCell className={`text-end fw-bold ${c.debtBalance > 0 ? 'text-danger' : 'text-success'}`}>
                        {formatCurrency(c.debtBalance)}
                      </CTableDataCell>

                      {canManageUsers && (
                        <CTableDataCell className="text-center bg-info bg-opacity-10">
                          {/* Chặn select tự update liên tục nếu đang đổi assign */}
                          <CFormSelect
                            size="sm"
                            value={pendingAssign?.customerId === c.id ? (pendingAssign.newUserId || '') : (c.assignedToId || '')}
                            onChange={(e) => handleDropdownChange(c.id, c.assignedToId, e.target.value)}
                            style={{ minWidth: '150px' }}
                          >
                            <option value="">-- Trống --</option>
                            {users.map(u => (
                              <option key={u.id} value={u.id}>{u.fullName}</option>
                            ))}
                          </CFormSelect>
                        </CTableDataCell>
                      )}

                      <CTableDataCell className="text-center">
                        <CButton color="secondary" variant="ghost" size="sm" onClick={() => handleOpenEditModal(c)}>
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

      {/* MODAL THÊM / SỬA KH */}
      <CModal visible={visible} onClose={() => setVisible(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle>{isEditing ? 'Sửa thông tin Khách hàng' : 'Thêm Khách hàng mới'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {formError && <div className="alert alert-danger p-2 mb-3">{formError}</div>}
          <CForm>
            <div className="mb-3">
              <CFormLabel>Tên Khách hàng <span className="text-danger">*</span></CFormLabel>
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
              <CFormLabel>Mã số định danh/Thuế (Optional)</CFormLabel>
              <CFormInput name="taxCode" value={formData.taxCode} onChange={handleInputChange} placeholder="Nhập CMND/Mã số thuế..." />
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>Hủy bỏ</CButton>
          <CButton color="primary" onClick={handleSave}>Lưu dữ liệu</CButton>
        </CModalFooter>
      </CModal>

      {/* MODAL CẢNH BÁO CHUYỂN USER */}
      <CModal visible={confirmVisible} onClose={cancelAssignment} alignment="center">
        <CModalHeader className="bg-warning text-dark border-0">
          <CModalTitle>Xác nhận Chuyển Phụ Trách</CModalTitle>
        </CModalHeader>
        <CModalBody className="text-center py-4">
          <CIcon icon={cilUser} size="3xl" className="text-warning mb-3" />
          <h5 className="mb-2">Bạn có chắc muốn chuyển trách nhiệm chăm sóc?</h5>
          <p className="text-muted mb-0">
            Khách hàng này sẽ được bàn giao cho nhân viên: <br />
            <strong className="text-primary fs-5">{getSelectedUserName(pendingAssign?.newUserId)}</strong>
          </p>
        </CModalBody>
        <CModalFooter className="border-0 justify-content-center">
          <CButton color="secondary" variant="ghost" onClick={cancelAssignment}>
            Hủy lệnh
          </CButton>
          <CButton color="warning" onClick={confirmAssignment} className="fw-bold px-4">
            ĐỒNG Ý CHUYỂN
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default CustomerList
