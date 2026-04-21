import React, { useState, useEffect } from 'react';
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
  CButton,
  CBadge,
  CAlert,
} from '@coreui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Eye } from '@phosphor-icons/react';
import axiosClient from '../../api/axiosClient';

const StocktakeList = () => {
  const [stocktakes, setStocktakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [alertMessage, setAlertMessage] = useState(location.state?.successMessage || '');

  useEffect(() => {
    if (alertMessage) {
      window.history.replaceState({}, document.title);
      const t = setTimeout(() => setAlertMessage(''), 4000);
      return () => clearTimeout(t);
    }
  }, [alertMessage]);

  useEffect(() => {
    fetchStocktakes();
  }, []);

  const fetchStocktakes = async () => {
    try {
      setLoading(true);
      const data = await axiosClient.get('/stocktakes');
      setStocktakes(data || []);
    } catch (error) {
      console.error('Failed to load stocktakes', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DRAFT':
        return <CBadge color="warning" shape="rounded-pill">Đang Nháp</CBadge>;
      case 'ADJUSTED':
        return <CBadge color="success" shape="rounded-pill">Đã Cân Bằng</CBadge>;
      default:
        return <CBadge color="secondary" shape="rounded-pill">{status}</CBadge>;
    }
  };

  return (
    <CRow>
      <CCol xs={12}>
        {alertMessage && (
          <CAlert color="success" dismissible onClose={() => setAlertMessage('')}>
            {alertMessage}
          </CAlert>
        )}
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Danh sách Phiếu Kiểm Kê</strong>
            <CButton color="primary" onClick={() => navigate('/inventory/stocktakes/create')}>
              <Plus size={20} className="me-2" />
              Tạo Phiếu Kiểm Kê
            </CButton>
          </CCardHeader>
          <CCardBody>
            {loading ? (
              <div className="text-center my-4">Đang tải dữ liệu...</div>
            ) : (
              <CTable hover responsive bordered align="middle">
                <CTableHead color="light">
                  <CTableRow>
                    <CTableHeaderCell>Mã Phiếu</CTableHeaderCell>
                    <CTableHeaderCell>Ngày Tạo</CTableHeaderCell>
                    <CTableHeaderCell>Người Lập</CTableHeaderCell>
                    <CTableHeaderCell>Ghi Chú</CTableHeaderCell>
                    <CTableHeaderCell>Số khoản mục</CTableHeaderCell>
                    <CTableHeaderCell>Trạng Thái</CTableHeaderCell>
                    <CTableHeaderCell>Hành Động</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {stocktakes.length > 0 ? stocktakes.map((item) => (
                    <CTableRow key={item.id}>
                      <CTableDataCell className="fw-semibold">{item.code}</CTableDataCell>
                      <CTableDataCell>{new Date(item.createdAt).toLocaleString('vi-VN')}</CTableDataCell>
                      <CTableDataCell>{item.user?.fullName}</CTableDataCell>
                      <CTableDataCell>{item.note || '-'}</CTableDataCell>
                      <CTableDataCell>{item._count?.details || 0} mục</CTableDataCell>
                      <CTableDataCell>{getStatusBadge(item.status)}</CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          color="info"
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/inventory/stocktakes/${item.id}`)}
                        >
                          <Eye size={20} />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  )) : (
                    <CTableRow>
                      <CTableDataCell colSpan="7" className="text-center text-muted py-4">
                        Chưa có phiếu kiểm kê nào trong hệ thống.
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default StocktakeList;
