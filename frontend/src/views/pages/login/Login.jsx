import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilEnvelopeClosed } from '@coreui/icons'
import axiosInstance from '../../../utils/axios'
import { useAuth } from '../../../contexts/AuthContext'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  // Nơi người dùng thực sự muốn đến trước khi bị chặn, mặc định là '/'
  const from = location.state?.from?.pathname || '/'

  const handleLogin = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    if (!email || !password) {
      setErrorMsg('Vui lòng nhập đầy đủ Email và Mật khẩu')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await axiosInstance.post('/auth/login', { email, password })
      
      const { user, token } = response.data.data
      
      // Lưu vào Context và LocalStorage (được xử lý trong AuthContext)
      login(user, token)

      // Điều hướng về màn hình Dashboard hoặc đích ban đầu
      navigate(from, { replace: true })
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMsg(error.response.data.message)
      } else {
        setErrorMsg('Lỗi kết nối máy chủ. Vui lòng thử lại.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={handleLogin}>
                    <h2 className="text-primary fw-bold">Hệ thống Quản Trị (ERP)</h2>
                    <p className="text-body-secondary">Đăng nhập bằng Email công việc của bạn</p>
                    
                    {errorMsg && (
                      <div className="alert alert-danger p-2 small mb-3">
                        {errorMsg}
                      </div>
                    )}

                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilEnvelopeClosed} />
                      </CInputGroupText>
                      <CFormInput 
                        placeholder="Email" 
                        autoComplete="username" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </CInputGroup>
                    <CRow>
                      <CCol xs={6}>
                        <CButton color="primary" type="submit" className="px-4 fw-bold" disabled={isSubmitting}>
                          {isSubmitting ? <CSpinner size="sm" /> : 'ĐĂNG NHẬP'}
                        </CButton>
                      </CCol>
                      <CCol xs={6} className="text-end">
                        <CButton color="link" className="px-0 text-muted">
                          Quên mật khẩu?
                        </CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
              <CCard className="text-white bg-primary py-5 d-none d-md-flex align-items-center justify-content-center" style={{ width: '44%' }}>
                <CCardBody className="text-center d-flex flex-column justify-content-center">
                  <div>
                    <h3 className="fw-bold">APPABT ERP</h3>
                    <p className="mt-3 opacity-75">
                      Hệ thống Quản trị Doanh nghiệp Khép kín. Vui lòng không chia sẻ tài khoản cho người ngoài nội bộ công ty.
                    </p>
                  </div>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
