import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CBadge,
  CFormSwitch,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormSelect,
  CSpinner,
  CToast,
  CToastBody,
  CToaster
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilPencil, cilLockLocked } from '@coreui/icons'
import axiosInstance from "../../utils/axios";
import { useAuth } from "../../contexts/AuthContext";

const UserList = () => {
  const { user } = useAuth()

  // States
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, addToast] = useState(0)

  // Modal State
  const [visible, setVisible] = useState(false)
  const [formMode, setFormMode] = useState('ADD') // 'ADD' or 'EDIT'
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    roleId: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Kiểm tra quyền MANAGE_USERS theo đúng chuẩn JSON array
  let canManageUsers = false
  if (user?.role?.permissions) {
    const perms = typeof user.role.permissions === 'string'
      ? JSON.parse(user.role.permissions)
      : user.role.permissions
    canManageUsers = Array.isArray(perms) &&
      (perms.includes('MANAGE_USERS') || perms.includes('ALL_ACCESS'))
  }

  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [])

  const pushToast = (message, color = 'success') => {
    addToast(
      <CToast color={color} className="text-white align-items-center">
        <div className="d-flex">
          <CToastBody>{message}</CToastBody>
        </div>
      </CToast>
    )
  }

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get('/users')
      console.log('Dữ liệu API trả về:', res.data)
      // Tùy theo cách Backend bọc dữ liệu, ta bóc đúng lớp Array
      const userData = Array.isArray(res.data) ? res.data : res.data?.data || []
      setUsers(userData)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const res = await axiosInstance.get('/users/roles')
      setRoles(res.data)
    } catch (e) {
      console.error("No roles API yet or error: ", e)
    }
  }

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await axiosInstance.put(`/users/${id}`, { isActive: !currentStatus })
      pushToast(`Đã ${!currentStatus ? 'mở khóa' : 'khóa'} tài khoản thành công!`)
      fetchUsers()
    } catch (e) {
      pushToast('Lỗi khi cập nhật trạng thái!', 'danger')
    }
  }

  const handleResetPassword = async (id) => {
    if (!window.confirm('Bạn có chắc muốn Reset mật khẩu về 123456?')) return
    try {
      await axiosInstance.put(`/users/${id}/reset-password`)
      pushToast('Reset mật khẩu thành công: 123456')
    } catch (e) {
      pushToast('Lỗi khi reset mật khẩu', 'danger')
    }
  }

  // Khởi tạo Form
  const openModalAdd = () => {
    setFormMode('ADD')
    setFormData({ email: '', password: '', fullName: '', phone: '', roleId: roles[0]?.id || '' })
    setVisible(true)
  }

  const openModalEdit = (u) => {
    setFormMode('EDIT')
    setSelectedUserId(u.id)
    setFormData({
      email: u.email,
      password: '', // Khi edit không hiện pass, nếu có nhập là cố tình update (phần Backend update pass có thể không thiết kế, nên giữ trống)
      fullName: u.fullName || '',
      phone: u.phone || '',
      roleId: u.roleId || ''
    })
    setVisible(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (formMode === 'ADD') {
        await axiosInstance.post('/users', formData)
        pushToast('Tạo nhân viên thành công!')
      } else {
        // Chỉ gửi những trường cho phép sửa
        const { fullName, phone, roleId } = formData
        await axiosInstance.put(`/users/${selectedUserId}`, { fullName, phone, roleId })
        pushToast('Cập nhật nhân viên thành công!')
      }
      setVisible(false)
      fetchUsers()
    } catch (e) {
      const err = e.response?.data?.message || 'Lỗi xử lý với máy chủ'
      pushToast(err, 'danger')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Toast Notification Container */}
      <CToaster push={toast} placement="top-end" />

      <CCard className="mb-4">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <strong>Quản lý Nhân viên</strong>
          {canManageUsers && (
            <CButton color="primary" onClick={openModalAdd}>
              <CIcon icon={cilPlus} className="me-2" />
              Thêm nhân viên mới
            </CButton>
          )}
        </CCardHeader>
        <CCardBody>
          {loading ? (
            <div className="text-center p-3"><CSpinner color="primary" /></div>
          ) : (
            <CTable bordered hover responsive>
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell>Tên / Email</CTableHeaderCell>
                  <CTableHeaderCell>SĐT</CTableHeaderCell>
                  <CTableHeaderCell>Vai trò</CTableHeaderCell>
                  <CTableHeaderCell>Trạng thái</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Hành động</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {users.map(u => (
                  <CTableRow key={u.id}>
                    <CTableDataCell>
                      <div className="fw-bold">{u.fullName}</div>
                      <div className="small text-muted">{u.email}</div>
                    </CTableDataCell>
                    <CTableDataCell>{u.phone || 'Chưa cập nhật'}</CTableDataCell>
                    <CTableDataCell>
                      <CBadge color="info" shape="rounded-pill">
                        {u.role?.name || `RoleID: ${u.roleId}`}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CFormSwitch
                        id={`switch-${u.id}`}
                        label={u.isActive ? "Hoạt động" : "Bị khóa"}
                        checked={u.isActive}
                        onChange={() => handleToggleActive(u.id, u.isActive)}
                        disabled={!canManageUsers || u.email === 'admin@admin.com'} // Khóa không cho khóa superadmin
                      />
                    </CTableDataCell>
                    <CTableDataCell className="text-center">
                      <CButton
                        color="secondary"
                        variant="ghost"
                        size="sm"
                        className="me-2"
                        title="Chỉnh sửa (Chỉ MANAGE_USERS)"
                        disabled={!canManageUsers}
                        onClick={() => openModalEdit(u)}
                      >
                        <CIcon icon={cilPencil} />
                      </CButton>
                      <CButton
                        color="warning"
                        variant="ghost"
                        size="sm"
                        title="Khôi phục Mật khẩu về 123456"
                        disabled={!canManageUsers}
                        onClick={() => handleResetPassword(u.id)}
                      >
                        <CIcon icon={cilLockLocked} />
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
                {users.length === 0 && (
                  <CTableRow>
                    <CTableDataCell colSpan="5" className="text-center text-muted p-4">
                      Không tìm thấy dữ liệu.
                    </CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>

      {/* MODAL FORM */}
      <CModal visible={visible} onClose={() => setVisible(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle>{formMode === 'ADD' ? 'Tạo Nhân viên mới' : 'Cập nhật Nhân viên'}</CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleSubmit}>
          <CModalBody>
            {formMode === 'ADD' && (
              <>
                <div className="mb-3">
                  <label className="mb-1 fw-bold">Email (Dùng để đăng nhập)</label>
                  <CFormInput
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="mb-1 fw-bold">Mật khẩu khởi tạo</label>
                  <CFormInput
                    type="text"
                    required
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </>
            )}

            <div className="mb-3">
              <label className="mb-1 fw-bold">Họ và Tên</label>
              <CFormInput
                type="text"
                required
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>

            <div className="mb-3">
              <label className="mb-1 fw-bold">Số điện thoại</label>
              <CFormInput
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="mb-3">
              <label className="mb-1 fw-bold">Quyền Hệ thống (Role)</label>
              <CFormSelect value={formData.roleId} onChange={e => setFormData({ ...formData, roleId: e.target.value })} required>
                <option value="">-- Chọn Role Phân quyền --</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </CFormSelect>
            </div>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" variant="ghost" onClick={() => setVisible(false)}>Hủy bỏ</CButton>
            <CButton color="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? <CSpinner size="sm" /> : 'Lưu thông tin'}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>
    </>
  )
}

export default UserList
