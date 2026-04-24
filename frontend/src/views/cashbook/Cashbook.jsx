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
  CBadge,
  CButtonGroup,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLibrary, cilList, cilCheckCircle, cilInfo } from '@coreui/icons'
import axiosClient from '../../api/axiosClient'

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0)
}

const formatDate = (isoString) => {
  if (!isoString) return ''
  const d = new Date(isoString)
  return d.toLocaleString('vi-VN')
}

const Cashbook = () => {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('ALL') // ALL, INCOME, EXPENSE

  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)

  useEffect(() => {
    fetchCashbook()
  }, [])

  const fetchCashbook = async () => {
    setLoading(true)
    try {
      const res = await axiosClient.get('/payments/cashbook')
      setPayments(Array.isArray(res) ? res : res?.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // Phân tích trạng thái thu/chi để In màu
  const renderAmount = (p) => {
    if (p.type === 'INCOME') {
      return <span className="text-success fw-bold">+{formatCurrency(p.amount)}</span>
    }
    return <span className="text-danger fw-bold">-{formatCurrency(p.amount)}</span>
  }

  const renderBadge = (type) => {
    if (type === 'INCOME') return <CBadge color="success">THU</CBadge>
    return <CBadge color="danger">CHI</CBadge>
  }

  // Tạo text Tham chiếu Đơn Hàng / Đơn Nhập
  const renderReference = (p) => {
    if (p.order?.code) return `Đơn Bán: ${p.order.code}`
    if (p.inventory?.code) return `Đơn Nhập: ${p.inventory.code}`
    return <span className="text-muted fst-italic">Thu/Chi chung</span>
  }

  const handleViewDetail = (payment) => {
    setSelectedPayment(payment)
    setShowDetailModal(true)
  }

  return (
    <>
      <CCard className="mb-4 shadow-sm border-top-info border-top-3">
      <CCardHeader className="bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center">
        <h5 className="mb-3 mb-md-0 text-info"><CIcon icon={cilLibrary} className="me-2" />Sổ Quỹ Tiền Mặt & Ngân Hàng</h5>
        
        <CButtonGroup role="group" aria-label="Lọc dòng tiền">
          <CButton 
            color={filterType === 'ALL' ? 'dark' : 'outline-dark'} 
            onClick={() => setFilterType('ALL')}
          >
            Tất cả
          </CButton>
          <CButton 
            color={filterType === 'INCOME' ? 'success' : 'outline-success'} 
            onClick={() => setFilterType('INCOME')}
          >
            Lịch sử Thu
          </CButton>
          <CButton 
            color={filterType === 'EXPENSE' ? 'danger' : 'outline-danger'} 
            onClick={() => setFilterType('EXPENSE')}
          >
            Lịch sử Chi
          </CButton>
        </CButtonGroup>
      </CCardHeader>
      <CCardBody>
        {loading ? (
          <div className="text-center py-5">Đang tải lịch sử giao dịch...</div>
        ) : payments.length === 0 ? (
          <div className="text-center text-muted py-5">Chưa có giao dịch dòng tiền nào được ghi nhận.</div>
        ) : (
          <CTable bordered hover responsive align="middle">
            <CTableHead color="light">
              <CTableRow>
                <CTableHeaderCell>Thời gian</CTableHeaderCell>
                <CTableHeaderCell>Mã GD</CTableHeaderCell>
                <CTableHeaderCell>Loại</CTableHeaderCell>
                <CTableHeaderCell>Đối tượng</CTableHeaderCell>
                <CTableHeaderCell>Tham chiếu</CTableHeaderCell>
                <CTableHeaderCell>Phương thức</CTableHeaderCell>
                <CTableHeaderCell className="text-end">Số tiền (VNĐ)</CTableHeaderCell>
                <CTableHeaderCell className="text-center">Hành động</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {payments
                .filter(p => filterType === 'ALL' || p.type === filterType)
                .map(p => (
                <CTableRow key={p.id}>
                  <CTableDataCell className="small text-muted">{formatDate(p.createdAt)}</CTableDataCell>
                  <CTableDataCell className="fw-bold">{p.code}</CTableDataCell>
                  <CTableDataCell>{renderBadge(p.type)}</CTableDataCell>
                  <CTableDataCell>
                    {p.partner?.name || 'Khách vãng lai/Khác'}
                  </CTableDataCell>
                  <CTableDataCell className="small">{renderReference(p)}</CTableDataCell>
                  <CTableDataCell>
                    {p.method === 'CASH' ? 'Tiền mặt' :
                      (p.method === 'BANK_TRANSFER' ? 'Chuyển khoản' :
                        (p.method === 'CARD' ? 'Quẹt thẻ' : p.method))}
                  </CTableDataCell>
                  <CTableDataCell className="text-end fs-6">{renderAmount(p)}</CTableDataCell>
                  <CTableDataCell className="text-center">
                    <CButton color="secondary" variant="ghost" size="sm" onClick={() => handleViewDetail(p)}>
                      <CIcon icon={cilList} />
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
              {payments.filter(p => filterType === 'ALL' || p.type === filterType).length === 0 && (
                <CTableRow>
                  <CTableDataCell colSpan={8} className="text-center text-muted py-4">
                    Không có giao dịch nào ở trạng thái này.
                  </CTableDataCell>
                </CTableRow>
              )}
            </CTableBody>
          </CTable>
        )}
      </CCardBody>
    </CCard>

    {/* MODAL CHI TIẾT */}
    <CModal visible={showDetailModal} onClose={() => setShowDetailModal(false)} size="lg">
      <CModalHeader className="bg-light">
        <CModalTitle className="d-flex align-items-center">
          <CIcon icon={cilInfo} className="me-2 text-info" /> 
          Chi Tiết Giao Dịch
        </CModalTitle>
      </CModalHeader>
      <CModalBody className="py-4">
        {selectedPayment && (
          <div className="row g-4">
            <div className="col-md-6">
              <h6 className="fw-bold mb-3 text-secondary border-bottom pb-2">THÔNG TIN CHUNG</h6>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Mã giao dịch:</span>
                <span className="fw-bold">{selectedPayment.code}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Thời gian:</span>
                <span>{formatDate(selectedPayment.createdAt)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Loại giao dịch:</span>
                <span>{renderBadge(selectedPayment.type)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Phương thức:</span>
                <span>
                  {selectedPayment.method === 'CASH' ? 'Tiền mặt' :
                    (selectedPayment.method === 'BANK_TRANSFER' ? 'Chuyển khoản' :
                      (selectedPayment.method === 'CARD' ? 'Quẹt thẻ' : selectedPayment.method))}
                </span>
              </div>
            </div>

            <div className="col-md-6">
              <h6 className="fw-bold mb-3 text-secondary border-bottom pb-2">ĐỐI TƯỢNG & TÀI CHÍNH</h6>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Khách hàng / NCC:</span>
                <span className="fw-bold text-primary">
                  {selectedPayment.partner?.name || 'Khách vãng lai/Khác'}
                </span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Tham chiếu:</span>
                <span>{renderReference(selectedPayment)}</span>
              </div>
              <div className="d-flex justify-content-between mt-3 pt-3 border-top">
                <span className="fw-bold">Số tiền:</span>
                <span className="fs-5">{renderAmount(selectedPayment)}</span>
              </div>
            </div>

            <div className="col-12 mt-4">
              <h6 className="fw-bold mb-2 text-secondary">LÝ DO / GHI CHÚ CHI TIẾT</h6>
              <div className="p-3 bg-light rounded fst-italic border">
                {selectedPayment.note ? selectedPayment.note : <span className="text-muted">Không có ghi chú nào được cung cấp.</span>}
              </div>
            </div>
          </div>
        )}
      </CModalBody>
      <CModalFooter className="border-0">
        <CButton color="secondary" onClick={() => setShowDetailModal(false)}>Đóng</CButton>
      </CModalFooter>
    </CModal>
    </>
  )
}

export default Cashbook
