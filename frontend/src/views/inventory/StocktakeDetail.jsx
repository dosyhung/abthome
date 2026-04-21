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
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CSpinner,
  CAlert
} from '@coreui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, WarningCircle } from '@phosphor-icons/react';
import axiosClient from '../../api/axiosClient';

const StocktakeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stocktake, setStocktake] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [successAlert, setSuccessAlert] = useState('');
  const [errorAlert, setErrorAlert] = useState('');

  useEffect(() => {
    fetchStocktakeDetail();
  }, [id]);

  const fetchStocktakeDetail = async () => {
    try {
      setLoading(true);
      const data = await axiosClient.get(`/stocktakes/${id}`);
      setStocktake(data);
    } catch (error) {
      console.error('Failed to load stocktake details', error);
      setErrorAlert('Lỗi khi tải chi tiết phiếu kiểm kê');
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustInventory = () => {
    setConfirmModalVisible(true);
  };

  const executeAdjustInventory = async () => {
    try {
      setProcessing(true);
      await axiosClient.put(`/stocktakes/${id}/adjust`);
      setSuccessAlert('Cân bằng kho thành công!');
      fetchStocktakeDetail(); // Reload to see ADJUSTED status
      setConfirmModalVisible(false);
    } catch (error) {
      console.error('Failed to adjust inventory', error);
      setErrorAlert(error.response?.data?.message || 'Lỗi hệ thống khi cân bằng kho');
      setConfirmModalVisible(false);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'DRAFT') return <CBadge color="warning" shape="rounded-pill">Đang Nháp</CBadge>;
    if (status === 'ADJUSTED') return <CBadge color="success" shape="rounded-pill">Đã Cân Bằng</CBadge>;
    return <CBadge color="secondary">{status}</CBadge>;
  };

  const getAdjustmentBadge = (systemQty, actualQty) => {
    const diff = actualQty - systemQty;
    if (diff === 0) return <CBadge color="secondary">Khớp (0)</CBadge>;
    if (diff > 0) return <CBadge color="success">Thừa (+{diff})</CBadge>;
    return <CBadge color="danger">Thiếu ({diff})</CBadge>;
  };

  if (loading) return <div className="text-center mt-5">Đang tải...</div>;
  if (!stocktake) return <div className="text-center mt-5 text-danger">Không tìm thấy phiếu kiểm kê!</div>;

  return (
    <CRow>
      <CCol xs={12}>
        {successAlert && (
          <CAlert color="success" dismissible onClose={() => setSuccessAlert('')}>
            {successAlert}
          </CAlert>
        )}
        {errorAlert && (
          <CAlert color="danger" dismissible onClose={() => setErrorAlert('')} className="d-flex align-items-center gap-2">
            <WarningCircle size={24} />
            <div>{errorAlert}</div>
          </CAlert>
        )}
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <CButton color="secondary" variant="ghost" className="p-1" onClick={() => navigate('/inventory/stocktakes')}>
                <ArrowLeft size={24} />
              </CButton>
              <strong>Chi tiết Kiểm Kê: {stocktake.code}</strong>
              {getStatusBadge(stocktake.status)}
            </div>

            {stocktake.status === 'DRAFT' && (
              <CButton
                color="success"
                className="text-white fw-semibold"
                onClick={handleAdjustInventory}
                disabled={processing}
              >
                <CheckCircle size={20} className="me-2" />
                {processing ? 'Đang xử lý...' : 'Chốt Cân Bằng Kho'}
              </CButton>
            )}
          </CCardHeader>
          <CCardBody>
            <CRow className="mb-4">
              <CCol md={6}>
                <div className="mb-2"><strong>Người lập:</strong> {stocktake.user?.fullName}</div>
                <div className="mb-2"><strong>Ngày lập:</strong> {new Date(stocktake.createdAt).toLocaleString('vi-VN')}</div>
                <div className="mb-2">
                  <strong>Ghi chú:</strong> <br />
                  <div className="p-2 mt-1 bg-light rounded text-body-secondary" style={{ minHeight: '60px' }}>
                    {stocktake.note || 'Không có ghi chú'}
                  </div>
                </div>
              </CCol>
            </CRow>

            <h5 className="mb-3">Danh sách sản phẩm kiểm đếm</h5>
            <CTable hover responsive bordered align="middle">
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell style={{ width: '60px' }} className="text-center">STT</CTableHeaderCell>
                  <CTableHeaderCell>Mã (SKU)</CTableHeaderCell>
                  <CTableHeaderCell>Tên Sản Phẩm (Quy cách)</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Tồn Sổ Sách</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Tồn Thực Tế</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Chênh Lệch</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {stocktake.details?.map((item, index) => (
                  <CTableRow key={item.id}>
                    <CTableDataCell className="text-center">{index + 1}</CTableDataCell>
                    <CTableDataCell className="fw-semibold font-monospace">{item.variant?.sku}</CTableDataCell>
                    <CTableDataCell>{item.variant?.product?.name}</CTableDataCell>
                    <CTableDataCell className="text-center fw-semibold text-body-secondary">{item.systemQty}</CTableDataCell>
                    <CTableDataCell className="text-center fw-bold">{item.actualQty}</CTableDataCell>
                    <CTableDataCell className="text-center">
                      {getAdjustmentBadge(item.systemQty, item.actualQty)}
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>

      {/* HIỂN THỊ HỘP THOẠI CONFIRM TRƯỚC KHI CÂN BẰNG KHO */}
      <CModal backdrop="static" visible={confirmModalVisible} onClose={() => setConfirmModalVisible(false)}>
        <CModalHeader className="bg-warning border-0">
          <CModalTitle className="d-flex align-items-center gap-2 text-dark">
            <WarningCircle size={24} />
            Cảnh báo ghi đè Tồn Kho
          </CModalTitle>
        </CModalHeader>
        <CModalBody className="p-4 text-center">
          <h5 className="mb-3 text-dark">Bạn có chắc chắn muốn Cân Bằng Kho bây giờ?</h5>
          <p className="text-muted small mb-0">
            Hành động này sẽ so sánh và <strong>GHI ĐÈ</strong> tồn kho thực tế, ảnh hưởng đến số dư hàng hóa. Không thể hoàn tác tiến trình này một cách tự động.
          </p>
        </CModalBody>
        <CModalFooter className="justify-content-center border-0 pb-4">
          <CButton color="secondary" variant="ghost" onClick={() => setConfirmModalVisible(false)} disabled={processing}>
            Hủy bỏ
          </CButton>
          <CButton color="primary" onClick={executeAdjustInventory} disabled={processing} className="px-4 text-white shadow-sm">
            {processing ? (
              <><CSpinner size="sm" className="me-2" /> Đang chốt...</>
            ) : 'Đồng ý Chốt Cân Bằng'}
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  );
};

export default StocktakeDetail;
