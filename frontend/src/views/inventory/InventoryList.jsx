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
} from '@coreui/react'
import axiosClient from '../../api/axiosClient'

const InventoryList = () => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

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
    </CCard>
  )
}

export default InventoryList
