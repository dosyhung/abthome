import React, { useState, useEffect, useRef } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CFormSelect,
  CBadge,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormLabel,
  CFormInput,
  CAvatar,
  CSpinner,
  CToaster,
  CToast,
  CToastBody,
  CToastClose
} from '@coreui/react';
import { CheckCircle, PencilSimple, Wallet, WarningCircle, Eye } from '@phosphor-icons/react';
import axiosClient, { getImageUrl } from '../../api/axiosClient';
import { useAuth } from '../../contexts/AuthContext';


const SalaryList = () => {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role?.name?.toUpperCase() === 'ADMIN';

  const [loading, setLoading] = useState(false);
  const [salaries, setSalaries] = useState([]);
  
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());

  const [savingEdit, setSavingEdit] = useState(false);
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [payingUserId, setPayingUserId] = useState(null);
  const [isPaying, setIsPaying] = useState(false);
  
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewingRecord, setViewingRecord] = useState(null);

  const [toast, addToast] = useState(0);
  const toaster = useRef();

  const createToast = (title, message, color) => {
    return (
      <CToast color={color} className="text-white align-items-center">
        <div className="d-flex">
          <CToastBody>
            <strong>{title}:</strong> {message}
          </CToastBody>
          <CToastClose className="me-2 m-auto" white />
        </div>
      </CToast>
    );
  };

  useEffect(() => {
    fetchSalaries();
  }, [month, year]);

  const fetchSalaries = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/salary?month=${month}&year=${year}`);
      if (res) {
        setSalaries(res);
      }
    } catch (e) {
      console.error('Lỗi tải bảng lương', e);
    } finally {
      setLoading(false);
    }
  };

  // Deleted modal handlers

  const handleComponentBlur = async (record) => {
    try {
      await axiosClient.put('/salary/components', {
        userId: record.userId,
        month,
        year,
        baseSalary: record.baseSalary,
        bonus: record.bonus,
        deduction: record.deduction
      });
      fetchSalaries();
    } catch (e) {
      addToast(createToast('Lỗi', e.response?.data?.message || "Lỗi cập nhật thành phần lương!", 'danger'));
    }
  };

  const confirmPay = (userId) => {
    setPayingUserId(userId);
    setShowConfirmModal(true);
  };

  const handlePay = async () => {
    if (!payingUserId) return;
    
    try {
      setIsPaying(true);
      await axiosClient.post('/salary/pay', {
        userId: payingUserId,
        month,
        year
      });
      setShowConfirmModal(false);
      setPayingUserId(null);
      addToast(createToast('Thành công', 'Thanh toán thành công! Đã tạo phiếu chi.', 'success'));
      fetchSalaries();
    } catch (e) {
      addToast(createToast('Lỗi', e.response?.data?.message || "Lỗi thanh toán lương!", 'danger'));
      setShowConfirmModal(false);
      setPayingUserId(null);
    } finally {
      setIsPaying(false);
    }
  };

  const openDetailModal = (record) => {
    setViewingRecord(record);
    setShowDetailModal(true);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val || 0);
  };

  const formatNumberInput = (val) => {
    if (!val) return '';
    return new Intl.NumberFormat('vi-VN').format(val);
  };

  return (
    <>
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Bảng Lương Nhân Viên</strong>
            <div className="d-flex gap-2">
              <CFormSelect value={month} onChange={(e) => setMonth(parseInt(e.target.value))} style={{ minWidth: '130px', width: 'auto' }}>
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                ))}
              </CFormSelect>
              <CFormSelect value={year} onChange={(e) => setYear(parseInt(e.target.value))} style={{ minWidth: '140px', width: 'auto' }}>
                {[2024, 2025, 2026, 2027].map(y => (
                  <option key={y} value={y}>Năm {y}</option>
                ))}
              </CFormSelect>
            </div>
          </CCardHeader>
          <CCardBody>
            {loading ? <div className="text-center my-5"><CSpinner /> Đang tải...</div> : (
              <div className="table-responsive">
                <CTable bordered align="middle" className="text-center text-nowrap" hover>
                  <CTableHead color="light">
                    <CTableRow>
                      <CTableHeaderCell className="text-start">Nhân Viên</CTableHeaderCell>
                      <CTableHeaderCell>Lương CB</CTableHeaderCell>
                      <CTableHeaderCell>Ngày Công</CTableHeaderCell>
                      <CTableHeaderCell>Thưởng</CTableHeaderCell>
                      <CTableHeaderCell>Phạt</CTableHeaderCell>
                      <CTableHeaderCell>Thực Lãnh</CTableHeaderCell>
                      <CTableHeaderCell>Trạng Thái</CTableHeaderCell>
                      <CTableHeaderCell>Hành Động</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {salaries.map(row => (
                      <CTableRow key={row.id}>
                        <CTableDataCell className="text-start">
                          <div className="d-flex align-items-center">
                            <CAvatar src={row.user?.avatar ? getImageUrl(row.user.avatar) : '/assets/images/avatars/1.jpg'} size="md" className="me-3" />
                            <div>
                              <div className="fw-bold">{row.user?.fullName}</div>
                              <small className="text-muted">{row.user?.email}</small>
                            </div>
                          </div>
                        </CTableDataCell>
                        <CTableDataCell className="fw-semibold">
                           {isAdmin && row.status === 'PENDING' ? (
                             <CFormInput 
                               type="text"
                               value={formatNumberInput(row.baseSalary)}
                               onChange={(e) => {
                                 const rawValue = e.target.value.replace(/\D/g, '');
                                 setSalaries(salaries.map(s => s.userId === row.userId ? { ...s, baseSalary: rawValue } : s));
                               }}
                               onBlur={() => handleComponentBlur(row)}
                               className="text-primary fw-bold text-center form-control-sm"
                               style={{ width: '120px', margin: '0 auto' }}
                             />
                           ) : (
                             formatCurrency(row.baseSalary)
                           )}
                        </CTableDataCell>
                        <CTableDataCell>
                           <div className="text-success fw-bold">{row.presentDays} <small className="fw-normal">ngày</small></div>
                           {row.lateDays > 0 && <small className="text-warning">({row.lateDays} trễ)</small>}
                        </CTableDataCell>
                        <CTableDataCell className="text-success fw-semibold">
                          {isAdmin && row.status === 'PENDING' ? (
                             <CFormInput 
                               type="text"
                               value={formatNumberInput(row.bonus)}
                               onChange={(e) => {
                                 const rawValue = e.target.value.replace(/\D/g, '');
                                 setSalaries(salaries.map(s => s.userId === row.userId ? { ...s, bonus: rawValue } : s));
                               }}
                               onBlur={() => handleComponentBlur(row)}
                               className="text-success fw-bold text-center form-control-sm border-success"
                               style={{ width: '110px', margin: '0 auto' }}
                             />
                           ) : (
                             `+${formatCurrency(row.bonus)}`
                           )}
                        </CTableDataCell>
                        <CTableDataCell className="text-danger fw-semibold">
                          {isAdmin && row.status === 'PENDING' ? (
                             <CFormInput 
                               type="text"
                               value={formatNumberInput(row.deduction)}
                               onChange={(e) => {
                                 const rawValue = e.target.value.replace(/\D/g, '');
                                 setSalaries(salaries.map(s => s.userId === row.userId ? { ...s, deduction: rawValue } : s));
                               }}
                               onBlur={() => handleComponentBlur(row)}
                               className="text-danger fw-bold text-center form-control-sm border-danger"
                               style={{ width: '110px', margin: '0 auto' }}
                             />
                           ) : (
                             `-${formatCurrency(row.deduction)}`
                           )}
                        </CTableDataCell>
                        <CTableDataCell className="fw-bold fs-6 text-primary">
                          {formatCurrency(row.netSalary)}
                        </CTableDataCell>
                        <CTableDataCell>
                           {row.status === 'PAID' ? (
                             <CBadge color="success" className="px-3 py-2"><CheckCircle size={16} className="me-1"/> Đã TT</CBadge>
                           ) : (
                             <CBadge color="secondary" className="px-3 py-2 text-dark">Chờ TT</CBadge>
                           )}
                        </CTableDataCell>
                        <CTableDataCell>
                          {isAdmin && row.status === 'PENDING' && (
                            <CButton color="success" size="sm" className="text-white" title="Thanh Toán" onClick={() => confirmPay(row.userId)}>
                              <Wallet size={18} className="me-1" /> Thanh Toán
                            </CButton>
                          )}
                          {row.status === 'PAID' && (
                            <CButton color="info" size="sm" variant="outline" title="Xem Chi Tiết" onClick={() => openDetailModal(row)}>
                              <Eye size={18} className="me-1" /> Chi Tiết
                            </CButton>
                          )}
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                    {salaries.length === 0 && (
                      <CTableRow>
                        <CTableDataCell colSpan={8} className="py-4 text-muted">
                           Không có dữ liệu.
                        </CTableDataCell>
                      </CTableRow>
                    )}
                  </CTableBody>
                </CTable>
              </div>
            )}
          </CCardBody>
        </CCard>
      </CCol>

    </CRow>
    <CModal visible={showConfirmModal} onClose={() => setShowConfirmModal(false)} alignment="center">
      <CModalHeader closeButton className="border-0 pb-0"></CModalHeader>
      <CModalBody className="text-center pt-0 pb-4">
        <WarningCircle size={80} className="text-warning mb-3" weight="fill" />
        <h4 className="fw-bold mb-3">Xác nhận thanh toán</h4>
        <p className="text-muted mb-0">
          Bạn có chắc chắn muốn thanh toán bảng lương này không? 
        </p>
        <p className="text-muted mb-0">
          <small>(Hành động này sẽ tự động tạo một phiếu Chi tương ứng trong Sổ Quỹ)</small>
        </p>
      </CModalBody>
      <CModalFooter className="justify-content-center border-0">
        <CButton color="secondary" variant="ghost" onClick={() => setShowConfirmModal(false)} className="px-4">Hủy</CButton>
        <CButton color="success" className="text-white px-4 fw-bold" onClick={handlePay} disabled={isPaying}>
          {isPaying ? <><CSpinner size="sm" className="me-2"/> Đang xử lý...</> : 'Đồng ý Thanh Toán'}
        </CButton>
      </CModalFooter>
    </CModal>

    {/* Modal Chi tiết lương */}
    <CModal visible={showDetailModal} onClose={() => setShowDetailModal(false)} alignment="center" size="lg">
      <CModalHeader closeButton className="bg-light">
        <CModalTitle>Phiếu Lương Tháng {month}/{year}</CModalTitle>
      </CModalHeader>
      <CModalBody className="p-4">
        {viewingRecord && (
          <div>
            <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
              <CAvatar src={viewingRecord.user?.avatar ? getImageUrl(viewingRecord.user.avatar) : '/assets/images/avatars/1.jpg'} size="xl" className="me-3" />
              <div>
                <h4 className="fw-bold mb-1">{viewingRecord.user?.fullName}</h4>
                <p className="text-muted mb-0">{viewingRecord.user?.email}</p>
              </div>
              <div className="ms-auto text-end">
                <CBadge color={viewingRecord.status === 'PAID' ? 'success' : 'secondary'} className="px-3 py-2 fs-6">
                  {viewingRecord.status === 'PAID' ? 'Đã Thanh Toán' : 'Chưa Thanh Toán'}
                </CBadge>
                {viewingRecord.paidAt && (
                  <div className="text-muted small mt-2">Ngày TT: {new Date(viewingRecord.paidAt).toLocaleDateString('vi-VN')}</div>
                )}
              </div>
            </div>

            <CRow className="mb-4">
              <CCol md={6}>
                <div className="bg-light p-3 rounded">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Lương cơ bản:</span>
                    <span className="fw-semibold">{formatCurrency(viewingRecord.baseSalary)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Ngày công chuẩn:</span>
                    <span className="fw-semibold">26 ngày</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Ngày đi làm thực tế:</span>
                    <span className="fw-semibold text-primary">{viewingRecord.presentDays} ngày {viewingRecord.lateDays > 0 ? `(${viewingRecord.lateDays} trễ)` : ''}</span>
                  </div>
                </div>
              </CCol>
              <CCol md={6}>
                <div className="bg-light p-3 rounded">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Tổng lương theo ngày:</span>
                    <span className="fw-semibold">{formatCurrency((viewingRecord.baseSalary / 26) * viewingRecord.presentDays)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Thưởng:</span>
                    <span className="fw-semibold text-success">+{formatCurrency(viewingRecord.bonus)}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Phạt:</span>
                    <span className="fw-semibold text-danger">-{formatCurrency(viewingRecord.deduction)}</span>
                  </div>
                </div>
              </CCol>
            </CRow>

            <div className="bg-primary bg-opacity-10 p-3 rounded d-flex justify-content-between align-items-center border border-primary">
              <h5 className="mb-0 text-primary fw-bold">Tổng Thực Lãnh:</h5>
              <h3 className="mb-0 text-primary fw-bold">{formatCurrency(viewingRecord.netSalary)}</h3>
            </div>
          </div>
        )}
      </CModalBody>
      <CModalFooter className="bg-light">
        <CButton color="secondary" onClick={() => setShowDetailModal(false)}>Đóng</CButton>
      </CModalFooter>
    </CModal>

    <CToaster ref={toaster} push={toast} placement="top-end" />
    </>
  );
};

export default SalaryList;
