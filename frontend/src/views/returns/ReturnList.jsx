import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  CBadge,
  CPagination,
  CPaginationItem,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CToast,
  CToastHeader,
  CToastBody,
  CToaster
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilCheckCircle, cilList, cilWarning } from '@coreui/icons'
import axiosClient from '../../api/axiosClient'

const ReturnList = () => {
  const navigate = useNavigate()
  const [returns, setReturns] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Modal & Toast states
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [selectedReturnId, setSelectedReturnId] = useState(null)
  
  // Detail Modal states
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [detailData, setDetailData] = useState(null)

  const toaster = React.useRef()
  const [toast, addToast] = useState(0)

  useEffect(() => {
    fetchReturns(currentPage)
  }, [currentPage])

  const fetchReturns = async (page = 1) => {
    try {
      setLoading(true)
      const res = await axiosClient.get(`/returns?page=${page}&limit=11`)
      if (res && res.data) {
        setReturns(res.data)
        if (res.meta) {
          setTotalPages(res.meta.totalPages || 1)
          setCurrentPage(res.meta.currentPage || 1)
        }
      }
    } catch (error) {
      console.error("Error fetching returns:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveClick = (id) => {
    setSelectedReturnId(id)
    setShowConfirmModal(true)
  }

  const confirmApprove = async () => {
    setShowConfirmModal(false)
    if (!selectedReturnId) return

    try {
      await axiosClient.patch(`/returns/${selectedReturnId}/approve`)
      addToast(
        <CToast color="success" className="text-white align-items-center">
          <CToastHeader closeButton><strong className="me-auto">Thành công</strong></CToastHeader>
          <CToastBody>Duyệt phiếu trả hàng thành công! Số lượng đã được cộng lại vào kho.</CToastBody>
        </CToast>
      )
      fetchReturns(currentPage)
    } catch (e) {
      addToast(
        <CToast color="danger" className="text-white align-items-center">
          <CToastHeader closeButton><strong className="me-auto">Lỗi</strong></CToastHeader>
          <CToastBody>{e.response?.data?.message || e.message}</CToastBody>
        </CToast>
      )
    }
  }

  const handleViewDetail = async (id) => {
    try {
      const res = await axiosClient.get(`/returns/${id}`)
      setDetailData(res.data)
      setShowDetailModal(true)
    } catch (e) {
      addToast(
        <CToast color="danger" className="text-white align-items-center">
          <CToastHeader closeButton><strong className="me-auto">Lỗi</strong></CToastHeader>
          <CToastBody>Không thể tải chi tiết phiếu trả hàng!</CToastBody>
        </CToast>
      )
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0)
  }

  return (
    <>
      <CToaster ref={toaster} push={toast} placement="top-end" />
      <CCard className="mb-4 shadow-sm">
        <CCardHeader className="d-flex justify-content-between align-items-center bg-white">
          <strong>Quản Lý Phiếu Trả Hàng</strong>
          <CButton 
            color="danger" 
            className="text-white d-flex align-items-center gap-1"
            onClick={() => navigate('/returns/create')}
          >
            <CIcon icon={cilPlus} /> Tạo phiếu trả mới
          </CButton>
        </CCardHeader>
      <CCardBody>
        {loading ? (
          <div className="text-center my-4">Đang tải dữ liệu...</div>
        ) : (
          <div className="table-responsive">
            <CTable hover align="middle">
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell>Mã Phiếu</CTableHeaderCell>
                  <CTableHeaderCell>Ngày Trả</CTableHeaderCell>
                  <CTableHeaderCell>Khách Hàng</CTableHeaderCell>
                  <CTableHeaderCell>Mã Đơn Gốc</CTableHeaderCell>
                  <CTableHeaderCell className="text-end">Tiền Hoàn</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Trạng Thái</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Hành Động</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {returns.length === 0 ? (
                  <CTableRow><CTableDataCell colSpan="7" className="text-center">Chưa có dữ liệu</CTableDataCell></CTableRow>
                ) : returns.map((ret) => (
                  <CTableRow key={ret.id}>
                    <CTableDataCell className="fw-bold text-danger">{ret.code}</CTableDataCell>
                    <CTableDataCell>{new Date(ret.createdAt).toLocaleString('vi-VN')}</CTableDataCell>
                    <CTableDataCell>
                      <strong>{ret.customer?.name}</strong>
                    </CTableDataCell>
                    <CTableDataCell>{ret.order?.code}</CTableDataCell>
                    <CTableDataCell className="text-end text-danger fw-semibold">
                      {formatCurrency(ret.finalRefundAmount)}
                    </CTableDataCell>
                    <CTableDataCell className="text-center">
                      {ret.status === 'PENDING' ? (
                        <CBadge color="warning" shape="rounded-pill" className="px-3 py-2">
                          Chờ Nhập Kho
                        </CBadge>
                      ) : (
                        <CBadge color="success" shape="rounded-pill" className="px-3 py-2">
                          Đã Nhập Kho
                        </CBadge>
                      )}
                    </CTableDataCell>
                    <CTableDataCell>
                      <div className="d-flex justify-content-center gap-2">
                        <CButton 
                          color="success" 
                          variant="ghost" 
                          size="sm" 
                          title="Duyệt Nhập Kho" 
                          onClick={() => handleApproveClick(ret.id)}
                          style={{ visibility: ret.status === 'PENDING' ? 'visible' : 'hidden' }}
                        >
                          <CIcon icon={cilCheckCircle} />
                        </CButton>
                        <CButton color="secondary" variant="ghost" size="sm" title="Xem chi tiết" onClick={() => handleViewDetail(ret.id)}>
                          <CIcon icon={cilList} />
                        </CButton>
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
            
            {totalPages > 1 && (
              <CPagination className="mt-3 justify-content-center">
                <CPaginationItem 
                  disabled={currentPage === 1} 
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Trước
                </CPaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <CPaginationItem 
                    key={page} 
                    active={page === currentPage}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </CPaginationItem>
                ))}
                <CPaginationItem 
                  disabled={currentPage === totalPages} 
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Sau
                </CPaginationItem>
              </CPagination>
            )}
          </div>
        )}
      </CCardBody>
    </CCard>

    {/* MODAL XÁC NHẬN DUYỆT */}
    <CModal visible={showConfirmModal} onClose={() => setShowConfirmModal(false)} backdrop="static">
      <CModalHeader className="border-0 bg-warning">
        <CModalTitle className="d-flex align-items-center text-dark">
          <CIcon icon={cilWarning} size="xl" className="me-2" />
          Xác nhận Duyệt Nhập Kho
        </CModalTitle>
      </CModalHeader>
      <CModalBody className="py-4 text-center">
        <h5 className="mb-3">Bạn có chắc chắn muốn duyệt phiếu trả hàng này?</h5>
        <p className="text-muted">
          Hành động này sẽ <strong>cộng số lượng hàng hoá</strong> trở lại vào kho và không thể hoàn tác!
        </p>
      </CModalBody>
      <CModalFooter className="border-0 justify-content-center pb-4">
        <CButton color="secondary" variant="ghost" onClick={() => setShowConfirmModal(false)}>
          Hủy bỏ
        </CButton>
        <CButton color="success" className="text-white fw-bold px-4" onClick={confirmApprove}>
          Đồng ý Duyệt
        </CButton>
      </CModalFooter>
    </CModal>

    {/* MODAL CHI TIẾT */}
    <CModal visible={showDetailModal} onClose={() => setShowDetailModal(false)} size="lg">
      <CModalHeader>
        <CModalTitle>Chi Tiết Phiếu Trả: <strong className="text-danger">{detailData?.code}</strong></CModalTitle>
      </CModalHeader>
      <CModalBody>
        {detailData && (
          <>
            <div className="row mb-4">
              <div className="col-md-6">
                <p className="mb-1">Khách hàng: <strong>{detailData.customer?.name} ({detailData.customer?.phone})</strong></p>
                <p className="mb-1">Nhân viên nhận: <strong>{detailData.user?.fullName}</strong></p>
                <p className="mb-1">Ngày trả: {new Date(detailData.createdAt).toLocaleString('vi-VN')}</p>
              </div>
              <div className="col-md-6 text-md-end">
                <p className="mb-1">Từ hóa đơn gốc: <strong>{detailData.order?.code}</strong></p>
                <p className="mb-1">Trạng thái: 
                  <CBadge color={detailData.status === 'COMPLETED' ? 'success' : 'warning'} className="ms-2">
                    {detailData.status === 'COMPLETED' ? 'Đã Nhập Kho' : 'Chờ Nhập Kho'}
                  </CBadge>
                </p>
              </div>
            </div>

            <h6 className="fw-bold mb-3">Danh sách mặt hàng trả lại</h6>
            <div className="table-responsive">
              <CTable bordered align="middle">
                <CTableHead color="light">
                  <CTableRow>
                    <CTableHeaderCell>STT</CTableHeaderCell>
                    <CTableHeaderCell>Sản phẩm</CTableHeaderCell>
                    <CTableHeaderCell>Giá hoàn</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Số lượng</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">Thành tiền</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {detailData.items?.map((item, idx) => (
                    <CTableRow key={item.id}>
                      <CTableDataCell>{idx + 1}</CTableDataCell>
                      <CTableDataCell>
                        <div className="fw-bold">{item.variant?.product?.name}</div>
                        <div className="small text-muted">
                          {typeof item.variant?.attributes === 'object' 
                            ? Object.values(item.variant?.attributes || {}).join(', ')
                            : item.variant?.attributes}
                        </div>
                      </CTableDataCell>
                      <CTableDataCell>{formatCurrency(item.refundPrice)}</CTableDataCell>
                      <CTableDataCell className="text-center fw-bold text-danger">{item.quantity}</CTableDataCell>
                      <CTableDataCell className="text-end fw-semibold">
                        {formatCurrency(item.refundPrice * item.quantity)}
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </div>

            <div className="row mt-4">
              <div className="col-md-6">
                {detailData.note && (
                  <div>
                    <strong className="text-muted">Ghi chú:</strong>
                    <div className="p-2 bg-light rounded mt-1">{detailData.note}</div>
                  </div>
                )}
              </div>
              <div className="col-md-6">
                <div className="d-flex justify-content-between mb-2">
                  <span>Phí trả hàng (khách chịu):</span>
                  <strong>{formatCurrency(detailData.refundFee)}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-danger fw-bold fs-6">Tổng tiền hoàn:</span>
                  <strong className="text-danger fs-6">{formatCurrency(detailData.finalRefundAmount)}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-success">Đã trả tiền mặt/CK:</span>
                  <strong className="text-success">{formatCurrency(detailData.paidAmount)}</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-primary fst-italic">Đã cấn trừ nợ:</span>
                  <strong className="text-primary fst-italic">
                    {formatCurrency(Math.max(0, detailData.finalRefundAmount - detailData.paidAmount))}
                  </strong>
                </div>
              </div>
            </div>
          </>
        )}
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => setShowDetailModal(false)}>Đóng</CButton>
      </CModalFooter>
    </CModal>
  </>
  )
}

export default ReturnList
