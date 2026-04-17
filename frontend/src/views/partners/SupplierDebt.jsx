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
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  CInputGroup,
  CInputGroupText,
  CRow,
  CCol,
  CBadge
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilMoney, cilBuilding } from '@coreui/icons'

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0)
}

const SupplierDebt = () => {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)

  // -- Modal State --
  const [visible, setVisible] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  
  // -- Unpaid Imports State --
  const [unpaidImports, setUnpaidImports] = useState([])
  const [selectedImport, setSelectedImport] = useState(null)

  // -- Chi nợ Form State --
  const [payAmount, setPayAmount] = useState('')
  const [payMethod, setPayMethod] = useState('Chuyển khoản') // Thường B2B hay dùng chuyển khoản
  const [payNote, setPayNote] = useState('')

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/payments/partners/debt?type=SUPPLIER')
      if (res.ok) {
        const data = await res.json()
        setSuppliers(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const openModal = async (supplier) => {
    setSelectedSupplier(supplier)
    setVisible(true)
    setUnpaidImports([])
    setSelectedImport(null)
    setPayAmount('')
    
    try {
      const res = await fetch(`/api/payments/partners/${supplier.id}/unpaid-imports`)
      if (res.ok) {
        const importsList = await res.json()
        setUnpaidImports(importsList)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleSelectImport = (inv) => {
    setSelectedImport(inv)
    const debtAmount = Number(inv.totalAmount) - Number(inv.paidAmount)
    setPayAmount(String(debtAmount))
    setPayNote(`Thanh toán đơn nhập: ${inv.code} cho NCC: ${selectedSupplier?.name}`)
  }

  const handleMakePayment = async () => {
    const amountToPay = Number(payAmount)
    
    if (!amountToPay || amountToPay <= 0) {
      alert("Vui lòng nhập số tiền hợp lệ!")
      return
    }

    const bodyArgs = {
      partnerId: selectedSupplier?.id,
      amount: amountToPay,
      method: payMethod,
      note: payNote
    }

    if (selectedImport) {
      bodyArgs.inventoryId = selectedImport.id
    }

    try {
      const res = await fetch('/api/payments/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyArgs)
      })

      if (res.ok) {
        alert(`Thanh toán thành công ${formatCurrency(amountToPay)}!`)
        setVisible(false)
        fetchSuppliers() // Refresh
      } else {
        const errorData = await res.json()
        alert(`Lỗi: ${errorData.message || 'Không thể chi tiền'}`)
      }
    } catch (error) {
      console.error(error)
      alert("Đã xảy ra lỗi mạng!")
    }
  }

  return (
    <>
      <CCard className="mb-4 shadow-sm border-top-warning border-top-3">
        <CCardHeader className="bg-white pb-0 d-flex justify-content-between align-items-center">
          <h5 className="mb-3 text-warning"><CIcon icon={cilBuilding} className="me-2"/>Quản lý Công nợ Nhà cung cấp</h5>
        </CCardHeader>
        <CCardBody>
          {loading ? (
            <div className="text-center py-5">Đang tải dữ liệu...</div>
          ) : suppliers.length === 0 ? (
             <div className="text-center text-success fw-bold py-5 fs-5">
              Tuyệt vời! Công ty không nợ Nhà cung cấp nào.
            </div>
          ) : (
            <CTable bordered hover responsive align="middle">
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell>Nhà cung cấp</CTableHeaderCell>
                  <CTableHeaderCell>Điện thoại</CTableHeaderCell>
                  <CTableHeaderCell className="text-end">Nợ Phải Trả</CTableHeaderCell>
                  <CTableHeaderCell className="text-center" style={{ width: '150px' }}>Hành động</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {suppliers.map((s) => (
                  <CTableRow key={s.id}>
                    <CTableDataCell>
                       <strong className="d-block">{s.name}</strong>
                    </CTableDataCell>
                    <CTableDataCell>{s.phone}</CTableDataCell>
                    <CTableDataCell className="text-end fw-bold text-danger fs-6">
                      {formatCurrency(s.debtBalance)}
                    </CTableDataCell>
                    <CTableDataCell className="text-center">
                      <CButton 
                        color="warning" 
                        size="sm" 
                        variant="outline"
                        className="d-flex align-items-center justify-content-center m-auto gap-1 fw-bold text-dark"
                        onClick={() => openModal(s)}
                      >
                        <CIcon icon={cilMoney} /> Chi trả nợ
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>

      <CModal 
        size="lg"
        visible={visible} 
        onClose={() => setVisible(false)}
        backdrop="static"
      >
        <CModalHeader onClose={() => setVisible(false)}>
          <CModalTitle className="text-warning text-dark fw-bold">Thanh Toán Nợ - {selectedSupplier?.name}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CRow>
            <CCol md={6} className="border-end">
              <h6 className="fw-bold bg-light p-2 rounded">1. Chọn đơn nhập hàng cần trả</h6>
              {unpaidImports.length === 0 ? (
                <div className="text-muted text-center p-3">Đang tải đơn hàng hoặc Nợ tồn đọng không theo đơn...</div>
              ) : (
                <div style={{maxHeight: '300px', overflowY: 'auto'}}>
                  {unpaidImports.map(inv => {
                    const debtAmount = Number(inv.totalAmount) - Number(inv.paidAmount)
                    const isSelected = selectedImport?.id === inv.id
                    return (
                      <div 
                        key={inv.id} 
                        className={`p-3 mb-2 border rounded cursor-pointer ${isSelected ? 'bg-warning bg-opacity-10 border-warning border-2' : 'bg-white'}`}
                        onClick={() => handleSelectImport(inv)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="d-flex justify-content-between mb-1">
                          <strong>Mã Nhập: {inv.code}</strong>
                          <span className="text-danger fw-bold">{formatCurrency(debtAmount)}</span>
                        </div>
                        <div className="small text-muted d-flex justify-content-between">
                          <span>Tổng Đơn hàng: {formatCurrency(inv.totalAmount)}</span>
                          <span>Đã trả: {formatCurrency(inv.paidAmount)}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CCol>

            <CCol md={6}>
              <h6 className="fw-bold bg-light p-2 rounded">2. Phiếu Chi Tiền</h6>
              {selectedImport && (
                <CBadge color="warning" className="mb-3 w-100 p-2 fs-6 text-dark border">Thanh toán cho: {selectedImport.code}</CBadge>
              )}
              
              <div className="mb-3 mt-2">
                <label className="fw-bold mb-1">Số tiền chi trả (*)</label>
                <CInputGroup>
                  <CFormInput 
                    type="number" 
                    min="1"
                    className="fs-5 fw-bold text-end text-danger"
                    value={payAmount} 
                    onChange={(e) => setPayAmount(e.target.value)} 
                    placeholder="Nhập số tiền..."
                  />
                  <CInputGroupText>VNĐ</CInputGroupText>
                </CInputGroup>
              </div>

              <div className="mb-3">
                <label className="fw-bold mb-1">Phương thức</label>
                <CFormSelect value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
                  <option value="Chuyển khoản">Chuyển khoản / Bank</option>
                  <option value="Tiền mặt">Tiền mặt</option>
                </CFormSelect>
              </div>

              <div className="mb-3">
                <label className="fw-bold mb-1">Lý do / Ghi chú</label>
                <CFormTextarea 
                  rows={3} 
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  placeholder="Ghi chú chi tiết giao dịch ra khỏi quỹ..."
                />
              </div>
            </CCol>
          </CRow>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="ghost" onClick={() => setVisible(false)}>
            Hủy
          </CButton>
          <CButton color="warning" className="text-dark fw-bold px-4" onClick={handleMakePayment}>
            TẠO PHIẾU CHI
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default SupplierDebt
