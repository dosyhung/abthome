import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CBadge,
  CPagination,
  CPaginationItem
} from '@coreui/react'
import { Warning } from '@phosphor-icons/react'
import axiosClient from '../../api/axiosClient'

const LowStockWarning = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const payload = await axiosClient.get('/dashboard/low-stock')
        setData(payload || [])
      } catch (err) {
        console.error('Failed to fetch low stock items', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const totalPages = Math.ceil(data.length / itemsPerPage)
  const currentData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex align-items-center text-danger fw-bold fs-5">
            <Warning size={24} weight="fill" className="me-2" />
            Cảnh Báo Tồn Kho Sắp Hết
          </CCardHeader>
          <CCardBody>
            {loading ? (
              <div className="text-center my-5">
                <div className="spinner-border text-danger" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : data.length > 0 ? (
              <>
                <CTable hover responsive bordered align="middle" className="text-nowrap mt-3">
                  <CTableHead color="dark">
                    <CTableRow>
                      <CTableHeaderCell scope="col" className="text-center" style={{ width: '60px' }}>#</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Mã Sản Phẩm</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Tên Sản Phẩm</CTableHeaderCell>
                      <CTableHeaderCell scope="col" className="text-center" style={{ width: '120px' }}>Tồn kho thực</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {currentData.map((item, index) => (
                      <CTableRow key={item.id}>
                        <CTableHeaderCell scope="row" className="text-center">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </CTableHeaderCell>
                        <CTableDataCell className="fw-semibold font-monospace">{item.sku}</CTableDataCell>
                        <CTableDataCell className="text-wrap" style={{ minWidth: '200px' }}>{item.productName}</CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CBadge color="danger" className="px-3 py-2 fs-6 rounded-pill">
                            {item.stockCount}
                          </CBadge>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>

                {totalPages > 1 && (
                  <div className="d-flex justify-content-end mt-4">
                    <CPagination aria-label="Page navigation" style={{ cursor: 'pointer' }}>
                      <CPaginationItem
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                      >
                        Trước
                      </CPaginationItem>

                      {[...Array(totalPages)].map((_, i) => (
                        <CPaginationItem
                          key={i + 1}
                          active={i + 1 === currentPage}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </CPaginationItem>
                      ))}

                      <CPaginationItem
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                      >
                        Sau
                      </CPaginationItem>
                    </CPagination>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-muted my-5 py-5 border rounded bg-body-tertiary">
                <h4 className="text-success mb-3">✔️ Tuyệt vời!</h4>
                <p>Kho hàng đang hoạt động ổn định, không có mặt hàng nào thiếu hụt (còn ít hơn 50 cái).</p>
              </div>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default LowStockWarning
