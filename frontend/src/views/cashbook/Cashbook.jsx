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
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLibrary } from '@coreui/icons'

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

  useEffect(() => {
    fetchCashbook()
  }, [])

  const fetchCashbook = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/payments/cashbook')
      if (res.ok) {
        const data = await res.json()
        setPayments(data)
      }
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

  return (
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
                </CTableRow>
              ))}
              {payments.filter(p => filterType === 'ALL' || p.type === filterType).length === 0 && (
                <CTableRow>
                  <CTableDataCell colSpan={7} className="text-center text-muted py-4">
                    Không có giao dịch nào ở trạng thái này.
                  </CTableDataCell>
                </CTableRow>
              )}
            </CTableBody>
          </CTable>
        )}
      </CCardBody>
    </CCard>
  )
}

export default Cashbook
