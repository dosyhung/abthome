import React, { useState, useEffect } from 'react';
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
  CSpinner
} from '@coreui/react';
import { CheckCircle, PencilSimple, Wallet } from '@phosphor-icons/react';
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
      alert(e.response?.data?.message || "Lỗi cập nhật thành phần lương!");
    }
  };

  const handlePay = async (userId) => {
    if (!window.confirm("Bạn có chắc chắn muốn thanh toán bảng lương này không? (Hành động này sẽ tạo phiếu Chi trong sổ quỹ)")) return;
    
    try {
      await axiosClient.post('/salary/pay', {
        userId,
        month,
        year
      });
      alert("Thanh toán thành công!");
      fetchSalaries();
    } catch (e) {
      alert(e.response?.data?.message || "Lỗi thanh toán lương!");
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val || 0);
  };

  const formatNumberInput = (val) => {
    if (!val) return '';
    return new Intl.NumberFormat('vi-VN').format(val);
  };

  return (
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
                            <CButton color="success" size="sm" className="text-white" title="Thanh Toán" onClick={() => handlePay(row.userId)}>
                              <Wallet size={18} className="me-1" /> Thanh Toán
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
  );
};

export default SalaryList;
