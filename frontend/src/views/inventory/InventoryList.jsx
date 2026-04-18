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
  CBadge,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch } from '@coreui/icons'
import axiosClient from '../../api/axiosClient'

const InventoryList = () => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const data = await axiosClient.get('/inventory')
      setTransactions(data)
    } catch (error) {
      console.error('Error fetching inventory transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED': return <CBadge color="success">Hoàn thành</CBadge>
      case 'PENDING': return <CBadge color="warning">Chờ xử lý</CBadge>
      case 'CANCELLED': return <CBadge color="danger">Đã hủy</CBadge>
      default: return <CBadge color="secondary">{status}</CBadge>
    }
  }

  const getTypeBadge = (type) => {
    if (type === 'IMPORT') return <CBadge color="info">Nhập kho</CBadge>
    if (type === 'EXPORT') return <CBadge color="primary">Xuất kho</CBadge>
    return <CBadge color="secondary">{type}</CBadge>
  }

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <strong>Danh sách Phiếu Nhập / Xuất (Lịch sử Giao dịch Kho)</strong>
      </CCardHeader>
      <CCardBody>
        {loading ? (
          <div className="text-center">Đang tải dữ liệu...</div>
        ) : (
          <div className="table-responsive">
            <CTable hover align="middle" className="text-nowrap">
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell>Mã Phiếu</CTableHeaderCell>
                  <CTableHeaderCell>Loại</CTableHeaderCell>
                  <CTableHeaderCell>Ngày tạo</CTableHeaderCell>
                  <CTableHeaderCell>Đối tác</CTableHeaderCell>
                  <CTableHeaderCell>Người tạo</CTableHeaderCell>
                  <CTableHeaderCell className="text-end">Tổng tiền</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Trạng thái</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Hành động</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {transactions.map((tx) => (
                  <CTableRow key={tx.id}>
                    <CTableDataCell><strong>{tx.code}</strong></CTableDataCell>
                    <CTableDataCell>{getTypeBadge(tx.type)}</CTableDataCell>
                    <CTableDataCell>{new Date(tx.createdAt).toLocaleString('vi-VN')}</CTableDataCell>
                    <CTableDataCell>{tx.partner?.name || 'N/A'}</CTableDataCell>
                    <CTableDataCell>{tx.user?.fullName || 'N/A'}</CTableDataCell>
                    <CTableDataCell className="text-end text-primary fw-bold">
                      {formatCurrency(tx.totalAmount)}
                    </CTableDataCell>
                    <CTableDataCell className="text-center">{getStatusBadge(tx.status)}</CTableDataCell>
                    <CTableDataCell className="text-center">
                      <CButton 
                        color="info" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => { setSelectedTransaction(tx); setShowModal(true); }}
                      >
                        <CIcon icon={cilSearch} />
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
                {transactions.length === 0 && (
                  <CTableRow>
                    <CTableDataCell colSpan={7} className="text-center">
                      Không có giao dịch kho nào.
                    </CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
            </CTable>
          </div>
        )}
      </CCardBody>

      <CModal size="lg" visible={showModal} onClose={() => setShowModal(false)} alignment="center">
        <CModalHeader>
          <CModalTitle>
            Chi tiết {selectedTransaction?.type === 'IMPORT' ? 'Phiếu Nhập' : 'Phiếu Xuất'} - <strong className="text-primary">{selectedTransaction?.code}</strong>
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedTransaction && (
            <>
              <div className="mb-3 d-flex justify-content-between">
                <div>
                  <strong>Đối tác: </strong> {selectedTransaction.partner?.name || 'N/A'} <br/>
                  <strong>Ngày tạo: </strong> {new Date(selectedTransaction.createdAt).toLocaleString('vi-VN')}
                </div>
                <div className="text-end">
                  <strong>Trạng thái: </strong> {getStatusBadge(selectedTransaction.status)} <br/>
                  <strong>Người thiết lập: </strong> {selectedTransaction.user?.fullName || 'N/A'}
                </div>
              </div>
              
              <div className="table-responsive">
                <CTable bordered hover small align="middle" className="text-nowrap mb-0 border">
                  <CTableHead color="light">
                    <CTableRow>
                      <CTableHeaderCell className="text-center border-bottom-0" style={{width: '5%'}}>STT</CTableHeaderCell>
                      <CTableHeaderCell className="border-bottom-0">Mã (SKU)</CTableHeaderCell>
                      <CTableHeaderCell className="border-bottom-0">Tên Sản Phẩm</CTableHeaderCell>
                      <CTableHeaderCell className="text-center border-bottom-0">Số Lô</CTableHeaderCell>
                      <CTableHeaderCell className="text-end border-bottom-0">S.Lượng</CTableHeaderCell>
                      <CTableHeaderCell className="text-end border-bottom-0">Đơn Giá</CTableHeaderCell>
                      <CTableHeaderCell className="text-end border-bottom-0">Thành Tiền</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {selectedTransaction.details && selectedTransaction.details.length > 0 ? (
                      selectedTransaction.details.map((item, idx) => (
                        <CTableRow key={idx}>
                          <CTableDataCell className="text-center bg-body-tertiary">{idx + 1}</CTableDataCell>
                          <CTableDataCell className="fw-bold">{item.variant?.product?.code || item.variant?.sku}</CTableDataCell>
                          <CTableDataCell>{item.variant?.product?.name || 'N/A'}</CTableDataCell>
                          <CTableDataCell className="text-center">{item.batch?.batchNumber || <span className="text-muted small">N/A</span>}</CTableDataCell>
                          <CTableDataCell className="text-end fw-semibold">{item.quantity}</CTableDataCell>
                          <CTableDataCell className="text-end">{formatCurrency(item.unitPrice)}</CTableDataCell>
                          <CTableDataCell className="text-end text-danger fw-bold">{formatCurrency((item.quantity * item.unitPrice))}</CTableDataCell>
                        </CTableRow>
                      ))
                    ) : (
                      <CTableRow>
                        <CTableDataCell colSpan={7} className="text-center text-muted">Không có chi tiết mặt hàng.</CTableDataCell>
                      </CTableRow>
                    )}
                  </CTableBody>
                </CTable>
              </div>

              {selectedTransaction.note && (
                <div className="mt-3 text-muted small p-2 bg-light rounded">
                  <strong>Ghi chú:</strong> {selectedTransaction.note}
                </div>
              )}

              <div className="mt-4 d-flex justify-content-end align-items-center gap-3">
                <span className="fs-5 fw-bold">Tổng Cộng:</span>
                <span className="fs-4 fw-bold text-primary">{formatCurrency(selectedTransaction.totalAmount)}</span>
              </div>
            </>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowModal(false)}>Đóng lại</CButton>
        </CModalFooter>
      </CModal>

    </CCard>
  )
}

export default InventoryList
