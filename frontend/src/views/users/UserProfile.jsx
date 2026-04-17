import React, { useState, useEffect, useRef } from 'react'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CRow,
  CCol,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CForm,
  CFormLabel,
  CFormInput,
  CButton,
  CAvatar,
  CToaster,
  CToast,
  CToastBody,
  CToastClose,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSave, cilUser, cilLockLocked } from '@coreui/icons'
import { useAuth } from 'src/contexts/AuthContext'
import axiosClient from 'src/api/axiosClient'

const UserProfile = () => {
  const { user, updateUserSession, logout } = useAuth()
  const [activeTab, setActiveTab] = useState(1)

  // Tab 1: Thông tin chung state
  const [profileData, setProfileData] = useState({
    fullName: '',
    phone: '',
    email: '',
    roleKey: ''
  })
  const [avatarObj, setAvatarObj] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)

  // Tab 2: Bảo mật state
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Toaster State & Ref
  const [toast, addToast] = useState(0)
  const toaster = useRef()

  const createToast = (title, message, color) => {
    return (
      <CToast color={color} className="text-white align-items-center">
        <div className="d-flex">
          <CToastBody>
            <strong>{title}:</strong> {message}
          </CToastBody>
          <CToastClose className="me-2 m-auto" white />
        </div>
      </CToast>
    )
  }

  // Nạp dữ liệu từ user context
  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || '',
        phone: user.phone || '',
        email: user.email || '',
        roleKey: user.role?.name || ''
      })
      if (user.avatar) {
        let avatarUrl = user.avatar
        if (avatarUrl.startsWith('/public/')) {
          avatarUrl = `http://localhost:5000${avatarUrl}`
        }
        setAvatarPreview(avatarUrl)
      }
    }
  }, [user])

  // --- Handlers Tab 1 ---
  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileData(prev => ({ ...prev, [name]: value }))
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatarObj(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleUpdateProfile = async () => {
    setIsUpdatingProfile(true)
    try {
      let payload = {
        fullName: profileData.fullName,
        phone: profileData.phone
      }

      // Nếu có đổi ảnh, upload ảnh trước
      if (avatarObj) {
        const formData = new FormData()
        formData.append('avatar', avatarObj)
        if (user && user.avatar && !user.avatar.startsWith('blob:')) {
          formData.append('old_url', user.avatar)
        }
        const uploadRes = await axiosClient.post('/upload/avatar', formData)
        
        if (uploadRes && uploadRes.url) {
          payload.avatar = uploadRes.url
        }
      }

      const res = await axiosClient.put('/profile', payload)
      
      if (res && res.data) {
        updateUserSession(res.data)
        addToast(createToast('Thành công', 'Cập nhật hồ sơ thành công!', 'success'))
      }
    } catch (error) {
      console.error('Update profile error:', error)
      const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra!'
      addToast(createToast('Lỗi', `Cập nhật thất bại: ${errorMsg}`, 'danger'))
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  // --- Handlers Tab 2 ---
  const handlePassChange = (e) => {
    const { name, value } = e.target
    setPasswords(prev => ({ ...prev, [name]: value }))
  }

  const handleChangePassword = async () => {
    if (passwords.newPassword.length < 6) {
      return addToast(createToast('Cảnh báo', 'Mật khẩu mới phải có ít nhất 6 ký tự.', 'warning'))
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      return addToast(createToast('Lỗi', 'Mật khẩu xác nhận không khớp với mật khẩu mới!', 'danger'))
    }

    setIsChangingPassword(true)
    try {
      const res = await axiosClient.put('/profile/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      })

      if (res && res.message) {
        addToast(createToast('Thành công', res.message, 'success'))
        // Chờ 1.5s để người dùng đọc thông báo rồi mới đẩy ra ngoài
        setTimeout(() => logout(), 1500)
      }
    } catch (error) {
      console.error('Change pass error:', error)
      const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra!'
      addToast(createToast('Lỗi', `Đổi mật khẩu thất bại: ${errorMsg}`, 'danger'))
    } finally {
      setIsChangingPassword(false)
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    }
  }

  const defaultAvatar = 'https://ui-avatars.com/api/?name=' + (user?.fullName || 'User')

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4 shadow-sm border-0">
          <CCardHeader className="bg-white">
            <h5 className="mb-0 fw-bold">Quản lý Hồ Sơ Cá Nhân</h5>
          </CCardHeader>
          <CCardBody>
            <CNav variant="tabs" className="mb-4">
              <CNavItem>
                <CNavLink 
                  active={activeTab === 1} 
                  onClick={() => setActiveTab(1)}
                  style={{ cursor: 'pointer' }}
                >
                  <CIcon icon={cilUser} className="me-2"/> Thông tin chung
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink 
                  active={activeTab === 2} 
                  onClick={() => setActiveTab(2)}
                  style={{ cursor: 'pointer' }}
                >
                  <CIcon icon={cilLockLocked} className="me-2"/> Bảo mật & Mật khẩu
                </CNavLink>
              </CNavItem>
            </CNav>

            <CTabContent>
              {/* TAB 1 */}
              <CTabPane visible={activeTab === 1}>
                <CRow>
                  <CCol md={3} className="text-center mb-4 border-end">
                    <DAvatarWrapper src={avatarPreview || defaultAvatar} />
                    <h5 className="mt-3">{profileData.fullName || 'Chưa cập nhật'}</h5>
                    <p className="text-muted mb-3">{profileData.roleKey}</p>
                    
                    <div className="d-flex justify-content-center">
                      <CFormInput 
                        type="file" 
                        accept="image/*" 
                        id="avatarInput" 
                        className="d-none"
                        onChange={handleAvatarChange}
                      />
                      <CButton 
                        color="secondary" 
                        variant="outline" 
                        size="sm"
                        onClick={() => document.getElementById('avatarInput').click()}
                      >
                        Đổi ảnh đại diện
                      </CButton>
                    </div>
                  </CCol>
                  
                  <CCol md={9}>
                    <CForm className="row g-3">
                      <CCol md={6}>
                        <CFormLabel>Họ và Tên</CFormLabel>
                        <CFormInput 
                          name="fullName"
                          value={profileData.fullName}
                          onChange={handleProfileChange}
                        />
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel>Số điện thoại</CFormLabel>
                        <CFormInput 
                          name="phone"
                          value={profileData.phone}
                          onChange={handleProfileChange}
                        />
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel>Email đăng nhập</CFormLabel>
                        <CFormInput 
                          value={profileData.email}
                          disabled
                        />
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel>Chức vụ / Nhóm quyền</CFormLabel>
                        <CFormInput 
                          value={profileData.roleKey}
                          disabled
                        />
                      </CCol>
                      <CCol xs={12} className="mt-4">
                        <CButton 
                          color="primary" 
                          onClick={handleUpdateProfile}
                          disabled={isUpdatingProfile}
                        >
                          <CIcon icon={cilSave} className="me-2"/>
                          {isUpdatingProfile ? 'Đang cập nhật...' : 'Lưu thay đổi'}
                        </CButton>
                      </CCol>
                    </CForm>
                  </CCol>
                </CRow>
              </CTabPane>

              {/* TAB 2 */}
              <CTabPane visible={activeTab === 2}>
                <CRow className="justify-content-center">
                  <CCol md={6}>
                    <CForm className="row g-3">
                      <CCol xs={12}>
                        <CFormLabel>Mật khẩu hiện tại</CFormLabel>
                        <CFormInput 
                          type="password" 
                          name="currentPassword"
                          value={passwords.currentPassword}
                          onChange={handlePassChange}
                        />
                      </CCol>
                      <CCol xs={12}>
                        <CFormLabel>Mật khẩu mới</CFormLabel>
                        <CFormInput 
                          type="password" 
                          name="newPassword"
                          value={passwords.newPassword}
                          onChange={handlePassChange}
                        />
                      </CCol>
                      <CCol xs={12}>
                        <CFormLabel>Nhập lại mật khẩu mới</CFormLabel>
                        <CFormInput 
                          type="password" 
                          name="confirmPassword"
                          value={passwords.confirmPassword}
                          onChange={handlePassChange}
                        />
                      </CCol>
                      <CCol xs={12} className="mt-4 text-center">
                        <CButton 
                          color="warning" 
                          className="text-white fw-bold px-5"
                          onClick={handleChangePassword}
                          disabled={isChangingPassword}
                        >
                          Đổi mật khẩu
                        </CButton>
                        <p className="text-muted small mt-2">
                          Lưu ý: Bạn sẽ phải đăng nhập lại sau khi đổi mật khẩu thành công.
                        </p>
                      </CCol>
                    </CForm>
                  </CCol>
                </CRow>
              </CTabPane>
            </CTabContent>
          </CCardBody>
        </CCard>
      </CCol>
      
      <CToaster ref={toaster} push={toast} placement="top-end" />
    </CRow>
  )
}

// Wrapper local để giữ tỷ lệ ảnh vuông cho đẹp
const DAvatarWrapper = ({ src }) => {
  return (
    <div style={{ width: '120px', height: '120px', margin: '0 auto', borderRadius: '50%', overflow: 'hidden', border: '3px solid #eee' }}>
      <img src={src} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  )
}

export default UserProfile
