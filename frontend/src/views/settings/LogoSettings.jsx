import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CAlert,
  CForm,
  CFormLabel,
  CFormInput,
  CButton,
  CRow,
  CCol,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSave, cilLockLocked } from '@coreui/icons'
import axiosClient, { getImageUrl } from '../../api/axiosClient'
import { useAuth } from '../../contexts/AuthContext'

const LogoSettings = () => {
  const { user } = useAuth()
  const permissions = user?.role?.permissions || []
  let parsedPerms = []
  if (typeof permissions === 'string') {
    try { parsedPerms = JSON.parse(permissions) } catch(e){}
  } else if (Array.isArray(permissions)) {
    parsedPerms = permissions
  }
  const isAdmin = parsedPerms.includes('ALL_ACCESS') || user?.role?.name === 'ADMIN'

  const [settings, setSettings] = useState({
    system_sidebar_logo: '',
  })

  const [sidebarLogoFile, setSidebarLogoFile] = useState(null)
  const [oldSidebarLogoUrl, setOldSidebarLogoUrl] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await axiosClient.get('/settings')
      if (res && res.system_sidebar_logo) {
        setSettings(prev => ({ ...prev, system_sidebar_logo: res.system_sidebar_logo }))
        setOldSidebarLogoUrl(res.system_sidebar_logo)
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const objectUrl = URL.createObjectURL(file)
      setSidebarLogoFile(file)
      setSettings(prev => ({ ...prev, system_sidebar_logo: objectUrl }))
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      let finalSettings = { ...settings }

      if (sidebarLogoFile) {
        const formDataSide = new FormData()
        formDataSide.append('logo', sidebarLogoFile)
        if (oldSidebarLogoUrl && !oldSidebarLogoUrl.startsWith('blob:')) {
          formDataSide.append('old_url', oldSidebarLogoUrl)
        }

        const uploadSideRes = await axiosClient.post('/upload/logo', formDataSide)

        if (uploadSideRes && uploadSideRes.url) {
          finalSettings.system_sidebar_logo = uploadSideRes.url
          setSettings(prev => ({ ...prev, system_sidebar_logo: uploadSideRes.url }))
          setOldSidebarLogoUrl(uploadSideRes.url)
        }
      }

      await axiosClient.put('/settings', finalSettings)
      alert("Lưu cấu hình logo hệ thống thành công!")
    } catch (error) {
      console.error('Error saving settings:', error)
      const errorMsg = error.response?.data?.message || error.message || ''
      alert(`Có lỗi xảy ra khi lưu cấu hình!\nChi tiết: ${errorMsg}`)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isAdmin) {
    return (
      <CAlert color="danger" className="d-flex align-items-center">
        <CIcon icon={cilLockLocked} className="flex-shrink-0 me-2" width={24} height={24} />
        <div>
          <strong>Từ chối truy cập!</strong> Bạn không có quyền truy cập trang này. Chỉ có Quản trị viên (Admin) mới có quyền chỉnh sửa cấu hình.
        </div>
      </CAlert>
    )
  }

  return (
    <div className="mb-4">
      <CRow className="justify-content-center">
        <CCol md={6}>
          <CCard className="shadow-sm border-0">
            <CCardHeader className="bg-primary text-white">
              <strong>Cấu hình Logo App</strong>
            </CCardHeader>
            <CCardBody>
              <CForm>
                <div className="mb-4 bg-dark text-white p-3 rounded">
                  <CFormLabel className="fw-bold">Logo Sidebar Hệ thống</CFormLabel>
                  <CFormInput type="file" accept="image/*" onChange={handleFileChange} />
                  <div className="text-secondary small mt-1">Dùng để hiển thị lên góc trái thanh Sidebar. (Khuyên dùng: Ảnh trong suốt chữ màu Trắng/Sáng). Cần <a href="/" className="text-info">Tải lại trang</a> để xem thay đổi.</div>
                  {settings.system_sidebar_logo && (
                    <div className="mt-2 text-center p-2 rounded" style={{ background: '#3c4b64', width: 'fit-content' }}>
                       <img src={getImageUrl(settings.system_sidebar_logo)} alt="Preview Sidebar Logo" style={{ maxHeight: '40px' }} />
                    </div>
                  )}
                </div>

                <CButton 
                  color="success" 
                  className="w-100 text-white d-flex align-items-center justify-content-center gap-2"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  <CIcon icon={cilSave} /> {isSaving ? 'Đang lưu...' : 'Lưu Cấu Hình'}
                </CButton>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  )
}

export default LogoSettings
