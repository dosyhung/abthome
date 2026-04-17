import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from 'src/contexts/AuthContext'
import {
  CAvatar,
  CBadge,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
} from '@coreui/react'
import {
  cilLockLocked,
  cilUser,
  cilAccountLogout,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'

import avatar8 from './../../assets/images/avatars/8.jpg'

const AppHeaderDropdown = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showConfirm, setShowConfirm] = useState(false)

  const handleLogout = () => {
    logout()
    setShowConfirm(false)
    navigate('/login')
  }

  // Resolve ảnh đại diện
  let avatarUrl = avatar8
  if (user && user.avatar) {
    if (user.avatar.startsWith('/public/')) {
      avatarUrl = `http://localhost:5000${user.avatar}`
    } else {
      avatarUrl = user.avatar
    }
  }

  return (
    <>
      <CDropdown variant="nav-item">
        <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
          <CAvatar src={avatarUrl} size="md" />
        </CDropdownToggle>
        <CDropdownMenu className="pt-0" placement="bottom-end">
          <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">
            Xin chào, {user?.fullName || 'Người Dùng'}!
          </CDropdownHeader>

          <CDropdownItem 
            onClick={() => navigate('/profile')} 
            style={{ cursor: 'pointer' }}
          >
            <CIcon icon={cilUser} className="me-2" />
            Hồ sơ cá nhân
          </CDropdownItem>

          <CDropdownDivider />

          <CDropdownItem
            className="text-danger"
            onClick={() => setShowConfirm(true)}
            style={{ cursor: 'pointer' }}
          >
            <CIcon icon={cilAccountLogout} className="me-2" />
            Đăng xuất
          </CDropdownItem>
        </CDropdownMenu>
      </CDropdown>

      <CModal visible={showConfirm} onClose={() => setShowConfirm(false)}>
        <CModalHeader onClose={() => setShowConfirm(false)}>
          <CModalTitle>Xác nhận Đăng xuất</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowConfirm(false)}>
            Hủy bỏ
          </CButton>
          <CButton color="danger" className="text-white" onClick={handleLogout}>
            Đăng xuất ngay
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default AppHeaderDropdown
