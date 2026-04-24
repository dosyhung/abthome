import React, { useState, useEffect } from 'react'
import {
  COffcanvas,
  COffcanvasHeader,
  COffcanvasTitle,
  COffcanvasBody,
  CSpinner,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilHistory, cilUser } from '@coreui/icons'
import axiosClient from '../api/axiosClient'

const ActivityLogOffcanvas = ({ visible, setVisible }) => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    if (visible) {
      setLogs([])
      setPage(1)
      setHasMore(true)
      fetchLogs(1)
    }
  }, [visible])

  const fetchLogs = async (pageNum) => {
    try {
      setLoading(true)
      const res = await axiosClient.get(`/logs?page=${pageNum}&limit=20`)
      if (res && res.data) {
        if (pageNum === 1) {
          setLogs(res.data)
        } else {
          setLogs(prev => [...prev, ...res.data])
        }
        if (res.meta && res.meta.page >= res.meta.totalPages) {
          setHasMore(false)
        }
      }
    } catch (error) {
      console.error('Lỗi khi tải lịch sử:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(p => p + 1)
      fetchLogs(page + 1)
    }
  }

  const formatTime = (isoString) => {
    const d = new Date(isoString)
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(d)
  }

  const getActionColor = (method) => {
    if (method.includes('POST')) return 'success'
    if (method.includes('PUT') || method.includes('PATCH')) return 'warning'
    if (method.includes('DELETE')) return 'danger'
    return 'primary'
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0)
  }

  const formatLogAction = (action, detailsStr) => {
    let actionText = action;
    let detailsText = detailsStr;
    try {
      const details = detailsStr ? JSON.parse(detailsStr) : {};
      
      if (action.includes('/api/orders')) {
        if (action.includes('POST')) {
          actionText = 'Tạo Đơn Hàng Mới';
          detailsText = `Khách hàng ID: ${details.customerId} | Tiền khách phải trả: ${formatCurrency(details.finalAmount)}`;
        } else if (action.includes('PATCH') && action.includes('quick-update')) {
          actionText = 'Sửa Nhanh Hóa Đơn';
          detailsText = `Chiết khấu mới: ${formatCurrency(details.discount)} | Khách đưa: ${formatCurrency(details.paidAmount)}`;
        } else if (action.includes('PATCH') && action.includes('approve')) {
          actionText = 'Duyệt Đơn Hàng';
          detailsText = 'Đã chốt đơn và xuất kho';
        }
      } else if (action.includes('/api/products')) {
        if (action.includes('POST')) {
          actionText = 'Thêm Sản Phẩm Mới';
          detailsText = `Tên SP: ${details.name || ''}`;
        } else if (action.includes('PUT') || action.includes('PATCH')) {
          actionText = 'Cập Nhật Sản Phẩm';
          detailsText = `Tên SP: ${details.name || ''}`;
        } else if (action.includes('DELETE')) {
          actionText = 'Xóa Sản Phẩm';
          detailsText = '';
        }
      } else if (action.includes('/api/partners')) {
         if (action.includes('POST')) {
          actionText = 'Thêm Đối Tác/Khách';
          detailsText = `Tên: ${details.name || 'Không rõ'} | SĐT: ${details.phone || 'Không rõ'}`;
         } else if (action.includes('PUT')) {
          actionText = 'Sửa Đối Tác/Khách';
          detailsText = `Tên mới: ${details.name || ''}`;
         }
      } else {
        if (action.includes('POST')) actionText = 'Tạo Mới Dữ Liệu';
        if (action.includes('PUT') || action.includes('PATCH')) actionText = 'Cập Nhật Dữ Liệu';
        if (action.includes('DELETE')) actionText = 'Xóa Dữ Liệu';
      }
    } catch(e) {
       // if not valid JSON, leave as is
    }
    
    return { actionText, detailsText };
  }

  return (
    <COffcanvas placement="end" visible={visible} onHide={() => setVisible(false)} style={{ width: '400px' }}>
      <COffcanvasHeader className="bg-light border-bottom">
        <COffcanvasTitle className="d-flex align-items-center text-primary">
          <CIcon icon={cilHistory} size="lg" className="me-2" />
          Lịch sử thao tác
        </COffcanvasTitle>
      </COffcanvasHeader>
      <COffcanvasBody className="p-0" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="p-3">
          {logs.length === 0 && !loading && (
            <div className="text-center text-muted mt-5">Chưa có lịch sử thao tác nào.</div>
          )}

          <div className="timeline-container" style={{ position: 'relative', borderLeft: '2px solid #dee2e6', margin: '10px 20px' }}>
            {logs.map((log, index) => {
              const color = getActionColor(log.action)
              const { actionText, detailsText } = formatLogAction(log.action, log.details)
              
              return (
                <div key={log.id} className="mb-4 position-relative" style={{ paddingLeft: '20px' }}>
                  {/* Timeline Dot */}
                  <div 
                    className={`bg-${color} rounded-circle position-absolute`} 
                    style={{ width: '12px', height: '12px', left: '-7px', top: '5px', border: '2px solid #fff' }}
                  ></div>
                  
                  {/* Log Content */}
                  <div className="bg-white p-3 rounded shadow-sm border">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="fw-bold text-dark d-flex align-items-center">
                        <CIcon icon={cilUser} className="me-1 text-secondary" size="sm" />
                        {log.user ? log.user.fullName : 'Hệ thống'}
                      </span>
                      <small className="text-muted" style={{ fontSize: '0.75rem' }}>{formatTime(log.createdAt)}</small>
                    </div>
                    <div className="mb-2">
                      <CBadge color={color} className="me-2">{actionText}</CBadge>
                      <small className="text-muted" style={{ fontSize: '0.7rem' }}>{log.action}</small>
                    </div>
                    {detailsText && (
                      <div className="bg-light p-2 rounded text-break mt-2" style={{ fontSize: '0.85rem', color: '#333', borderLeft: `3px solid var(--cui-${color})` }}>
                        {detailsText}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {loading && (
            <div className="text-center my-3">
              <CSpinner size="sm" color="primary" /> Đang tải...
            </div>
          )}

          {!loading && hasMore && logs.length > 0 && (
            <div className="text-center my-3">
              <button className="btn btn-outline-primary btn-sm rounded-pill px-4" onClick={loadMore}>
                Tải thêm
              </button>
            </div>
          )}
        </div>
      </COffcanvasBody>
    </COffcanvas>
  )
}

export default ActivityLogOffcanvas
