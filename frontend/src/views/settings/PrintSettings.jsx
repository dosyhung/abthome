import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CAlert,
  CForm,
  CFormLabel,
  CFormInput,
  CFormSwitch,
  CFormSelect,
  CButton,
  CRow,
  CCol,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSave, cilCloudUpload, cilLockLocked } from '@coreui/icons'
import InvoicePrintTemplate from '../orders/InvoicePrintTemplate'
import axiosClient, { getImageUrl } from '../../api/axiosClient'
import { useAuth } from '../../contexts/AuthContext'

const PrintSettings = () => {
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
    print_company_name: 'NHÀ MÁY SẢN XUẤT ABT',
    print_company_address: 'Số 123, Đường Công Nghiệp, KCN ABC, TP. HCM',
    print_company_phone: '0123.456.789 - MST: 0312345678',
    print_invoice_title: 'PHIẾU XUẤT KHO KIÊM BÁN HÀNG',
    print_paper_size: 'a4',
    print_show_signatures: 'true',
    print_company_logo: '',
    print_bank_id_name: 'techcombank',
    print_bank_account: '19035881724013',
    print_bank_owner: 'CONG TY ABT',
  })

  // Print Logo State
  const [logoFile, setLogoFile] = useState(null)
  const [oldLogoUrl, setOldLogoUrl] = useState('')

  const [isSaving, setIsSaving] = useState(false)

  // Fetch dữ liệu từ DB khi vừa vào trang
  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await axiosClient.get('/settings')
      // Merge với default
      if (res && Object.keys(res).length > 0) {
        setSettings(prev => ({
          ...prev,
          ...res
        }))
        if (res.print_company_logo) {
          setOldLogoUrl(res.print_company_logo)
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }

  // Handle thay đổi input
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 'true' : 'false') : value,
    }))
  }

  const handleFileChange = (e, target) => {
    const file = e.target.files[0]
    if (file) {
      const objectUrl = URL.createObjectURL(file)
      if (target === 'print') {
        setLogoFile(file)
        setSettings(prev => ({ ...prev, print_company_logo: objectUrl }))
      }
    }
  }

  // Lưu cấu hình
  const handleSave = async () => {
    setIsSaving(true)
    try {
      let finalSettings = { ...settings }

      // 1. Nếu có chọn logo mới, upload file trước
      if (logoFile) {
        const formData = new FormData()
        formData.append('logo', logoFile)
        if (oldLogoUrl && !oldLogoUrl.startsWith('blob:')) {
          formData.append('old_url', oldLogoUrl)
        }
        
        const uploadRes = await axiosClient.post('/upload/logo', formData)
        
        if (uploadRes && uploadRes.url) {
          finalSettings.print_company_logo = uploadRes.url
          setSettings(prev => ({ ...prev, print_company_logo: uploadRes.url }))
          setOldLogoUrl(uploadRes.url)
        }
      }

      // 2. Lưu toàn bộ config xuống DB
      await axiosClient.put('/settings', finalSettings)
      alert("Lưu cấu hình in ấn thành công!")
    } catch (error) {
      console.error('Error saving settings:', error)
      const errorMsg = error.response?.data?.message || error.message || ''
      alert(`Có lỗi xảy ra khi lưu cấu hình!\nChi tiết: ${errorMsg}`)
    } finally {
      setIsSaving(false)
    }
  }

  // Tạo mock data cho live preview
  const mockOrderData = {
    code: 'ABT-TEST-001',
    createdAt: new Date().toISOString(),
    customer: { name: 'Nguyễn Văn Khách Test', phone: '0988.777.666', address: 'Quận 1, TP. HCM' },
    orderItems: [
      { name: 'Sản phẩm demo 1', quantity: 2, price: 1500000, unit: 'Bộ' },
      { name: 'Sản phẩm demo 2', quantity: 5, price: 50000, unit: 'Cái' }
    ],
    totalAmount: 3250000,
    discount: 250000,
    finalAmount: 3000000
  }

  // Chặn nếu không phải Admin
  if (!isAdmin) {
    return (
      <CAlert color="danger" className="d-flex align-items-center">
        <CIcon icon={cilLockLocked} className="flex-shrink-0 me-2" width={24} height={24} />
        <div>
          <strong>Từ chối truy cập!</strong> Bạn không có quyền xem hoặc chỉnh sửa Cấu Hình In Ấn. Chỉ có Quản trị viên (Admin) mới có quyền truy cập trang này.
        </div>
      </CAlert>
    )
  }

  return (
    <div className="mb-4">
      <CRow>
        {/* CỘT TRÁI: FORM CẤU HÌNH */}
        <CCol md={4} className="mb-4">
          <CCard className="h-100 shadow-sm border-0">
            <CCardHeader className="bg-primary text-white">
              <strong>Cài đặt Mẫu In</strong>
            </CCardHeader>
            <CCardBody>
              <CForm>
                <h6 className="mb-3 fw-bold text-secondary">Cấu Hình Mẫu Giấy In</h6>

                <div className="mb-3">
                  <CFormLabel><strong>Logo Cửa Hàng (In lên Giấy)</strong></CFormLabel>
                  <CFormInput type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'print')} />
                  <div className="text-muted small mt-1">Hỗ trợ JPG, PNG (Khuyên dùng: Ảnh chữ Đen/Đỏ dành cho nền trắng)</div>
                </div>

                <div className="mb-3">
                  <CFormLabel>Tên Công Ty / Cửa Hàng</CFormLabel>
                  <CFormInput 
                    name="print_company_name"
                    value={settings.print_company_name || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="mb-3">
                  <CFormLabel>Tiêu đề in (Ví dụ: HÓA ĐƠN BÁN HÀNG)</CFormLabel>
                  <CFormInput 
                    name="print_invoice_title"
                    value={settings.print_invoice_title || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="mb-3">
                  <CFormLabel>Địa chỉ</CFormLabel>
                  <CFormInput 
                    name="print_company_address"
                    value={settings.print_company_address || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="mb-3">
                  <CFormLabel>Số điện thoại / MST</CFormLabel>
                  <CFormInput 
                    name="print_company_phone"
                    value={settings.print_company_phone || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <hr />
                <h6 className="mb-3 fw-bold text-secondary">Cấu Hình Thanh Toán (Mã QR)</h6>

                <div className="mb-3">
                  <CFormLabel>Ngân Hàng (Mã viết tắt)</CFormLabel>
                  <CFormInput 
                    name="print_bank_id_name"
                    value={settings.print_bank_id_name || ''}
                    placeholder="VD: techcombank, mbbank, vcb, vietinbank..."
                    onChange={handleInputChange}
                  />
                  <div className="text-secondary small mt-1">Viết liền không dấu, theo mã chuẩn của VietQR.</div>
                </div>

                <div className="mb-3">
                  <CFormLabel>Số Tài Khoản</CFormLabel>
                  <CFormInput 
                    name="print_bank_account"
                    value={settings.print_bank_account || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="mb-3">
                  <CFormLabel>Tên Chủ Tài Khoản</CFormLabel>
                  <CFormInput 
                    name="print_bank_owner"
                    value={settings.print_bank_owner || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <hr />
                <h6 className="mb-3 fw-bold text-secondary">Tùy chọn hiển thị</h6>

                <div className="mb-3">
                  <CFormLabel>Khổ Giấy Máy In</CFormLabel>
                  <CFormSelect 
                    name="print_paper_size"
                    value={settings.print_paper_size || 'a4'}
                    onChange={handleInputChange}
                  >
                    <option value="a4">Khổ A4 (Lớn)</option>
                    <option value="a5">Khổ A5 (Vừa - Ngang/Dọc)</option>
                  </CFormSelect>
                </div>

                <div className="mb-3 d-flex align-items-center justify-content-between border-bottom pb-2">
                  <span>Hiển thị hàng "Chiết khấu"</span>
                  <CFormSwitch 
                    name="print_show_discount"
                    checked={settings.print_show_discount === 'true'}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="mb-4 d-flex align-items-center justify-content-between border-bottom pb-2">
                  <span>Hiển thị Khung Chữ Ký</span>
                  <CFormSwitch 
                    name="print_show_signatures"
                    checked={settings.print_show_signatures === 'true'}
                    onChange={handleInputChange}
                  />
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

        {/* CỘT PHẢI: LIVE PREVIEW */}
        <CCol md={8}>
          <CCard className="h-100 shadow-sm border-0 bg-light">
            <CCardHeader className="d-flex justify-content-between align-items-center bg-white border-bottom-0 pb-0">
              <strong className="text-secondary">Live Preview (Xem trước thời gian thực)</strong>
              <div className="text-muted small">Khổ giấy hiện tại: <span className="fw-bold">{settings.print_paper_size?.toUpperCase()}</span></div>
            </CCardHeader>
            <CCardBody className="d-flex justify-content-center align-items-start" style={{ overflowY: 'auto' }}>
              
              {/* Đây là khung bọc giả lập tỷ lệ giấy */}
              <div className={`preview-wrapper shadow rounded ${settings.print_paper_size === 'a5' ? 'w-75' : 'w-100'}`} style={{ backgroundColor: '#fff', zoom: 0.85, transition: 'all 0.3s ease' }}>
                <InvoicePrintTemplate 
                  orderData={mockOrderData} 
                  settings={settings}
                />
              </div>

            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  )
}

export default PrintSettings
