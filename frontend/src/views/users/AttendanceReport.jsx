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
  CPagination,
  CPaginationItem,
  CTooltip
} from '@coreui/react';
import { Check, Clock, X, Gear, FloppyDisk } from '@phosphor-icons/react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../contexts/AuthContext';

const AttendanceReport = () => {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role?.name?.toUpperCase() === 'ADMIN';

  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [records, setRecords] = useState([]);
  
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());

  const [showSettings, setShowSettings] = useState(false);
  const [lateTime, setLateTime] = useState('08:30');
  const [savingSettings, setSavingSettings] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    setCurrentPage(1);
    fetchReport();
  }, [month, year]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/attendance/report?month=${month}&year=${year}`);
      if (res && res.allUsers) {
        setUsers(res.allUsers);
        setRecords(res.attendances || []);
      }
    } catch (e) {
      console.error('Lỗi tải báo cáo chấm công', e);
    } finally {
      setLoading(false);
    }
  };

  const openSettings = async () => {
    setShowSettings(true);
    try {
      const res = await axiosClient.get('/settings');
      if (res && res.ATTENDANCE_LATE_TIME) {
        setLateTime(res.ATTENDANCE_LATE_TIME);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSavingSettings(true);
      await axiosClient.put('/settings', { ATTENDANCE_LATE_TIME: lateTime });
      setShowSettings(false);
    } catch (e) {
      alert("Lỗi lưu cấu hình!");
      console.error(e);
    } finally {
      setSavingSettings(false);
    }
  };

  const daysInMonth = new Date(year, month, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const isPastOrToday = (day) => {
    const targetDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return targetDate <= today;
  };

  // Lấy trạng thái của nhân viên trong ngày cụ thể
  const getStatusInfo = (userId, day) => {
    const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const record = records.find(r => r.userId === userId && r.dateString === dateStr);
    
    if (!record) return null; // Chưa chấm công
    
    if (record.status === 'PRESENT') {
      return { type: 'PRESENT', icon: <Check size={16} weight="bold" />, color: 'success', time: record.checkInTime };
    }
    if (record.status === 'LATE') {
      return { type: 'LATE', icon: <Clock size={16} weight="bold" />, color: 'warning', time: record.checkInTime };
    }
    return { type: record.status, icon: <Check size={16} />, color: 'secondary', time: record.checkInTime };
  };

  // Tính tổng
  const calculateTotals = (userId) => {
    let present = 0;
    let late = 0;
    
    daysArray.forEach(day => {
      const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const record = records.find(r => r.userId === userId && r.dateString === dateStr);
      if (record) {
        if (record.status === 'PRESENT') present++;
        if (record.status === 'LATE') late++;
      }
    });

    return { present, late, total: present + late };
  };

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Bảng Chấm Công Nhân Sự</strong>
            <div className="d-flex gap-2">
              {isAdmin && (
                <CButton color="secondary" variant="outline" className="d-flex align-items-center fw-semibold text-dark border-secondary" onClick={openSettings}>
                   <Gear size={20} className="me-2 text-primary"/> Cấu Hình Giờ
                </CButton>
              )}
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
            <div className="d-flex gap-4 mb-3 small text-muted">
               <div className="d-flex align-items-center"><CBadge color="success" className="me-2"><Check size={12} weight="bold"/></CBadge> Đúng giờ</div>
               <div className="d-flex align-items-center"><CBadge color="warning" className="me-2"><Clock size={12} weight="bold"/></CBadge> Đi trễ</div>
               <div className="d-flex align-items-center"><span className="text-danger fw-bold me-1"><X size={16} weight="bold" /></span> Vắng mặt (Không ghi nhận)</div>
            </div>

            {loading ? <div className="text-center my-5">Đang tải biểu mẫu...</div> : (
              <div className="table-responsive">
                <CTable bordered align="middle" className="text-center text-nowrap table-frozen-column" hover small>
                  <CTableHead color="light">
                    <CTableRow>
                      <CTableHeaderCell rowSpan={2} className="align-middle text-start" style={{ minWidth: '200px' }}>Nhân Viên</CTableHeaderCell>
                      <CTableHeaderCell colSpan={daysInMonth}>Ngày trong tháng {month}/{year}</CTableHeaderCell>
                      <CTableHeaderCell rowSpan={2} className="align-middle border-start-2 border-start-secondary">Tổng Bằng Công</CTableHeaderCell>
                    </CTableRow>
                    <CTableRow>
                      {daysArray.map(day => (
                        <CTableHeaderCell key={day} style={{ minWidth: '40px', padding: '0.2rem' }}>
                          <small>{day}</small>
                        </CTableHeaderCell>
                      ))}
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {users.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(user => {
                      const totals = calculateTotals(user.id);
                      return (
                        <CTableRow key={user.id}>
                          <CTableDataCell className="text-start fw-bold">
                            {user.fullName} <br/>
                            <small className="text-muted fw-normal">{user.email}</small>
                          </CTableDataCell>
                          
                          {daysArray.map(day => {
                            const status = getStatusInfo(user.id, day);
                            const pastOrToday = isPastOrToday(day);
                            
                            return (
                              <CTableDataCell key={day} style={{ padding: '0.2rem' }}>
                                {status ? (
                                  <CTooltip 
                                    content={`Check-in lúc: ${new Date(status.time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`}
                                    placement="top"
                                  >
                                    <CBadge color={status.color} className="p-1 px-2" style={{ cursor: 'pointer' }}>
                                      {status.icon}
                                    </CBadge>
                                  </CTooltip>
                                ) : pastOrToday ? (
                                  <span className="text-danger fw-bold"><X size={16} weight="bold" /></span>
                                ) : (
                                  <span className="text-muted opacity-25" style={{ fontSize: '10px' }}>-</span>
                                )}
                              </CTableDataCell>
                            );
                          })}
                          
                          <CTableDataCell className="border-start-2 border-start-secondary">
                             <div className="text-success fw-bold p-1 bg-success bg-opacity-10 rounded mb-1 border border-success border-opacity-25">
                               {totals.present} <small className="fw-normal text-dark">chuẩn</small>
                             </div>
                             <div className="text-warning fw-bold p-1 bg-warning bg-opacity-10 rounded border border-warning border-opacity-25">
                               {totals.late} <small className="fw-normal text-dark">trễ</small>
                             </div>
                          </CTableDataCell>
                        </CTableRow>
                      );
                    })}
                    {users.length === 0 && (
                      <CTableRow>
                        <CTableDataCell colSpan={daysInMonth + 2} className="py-4 text-muted">
                           Hệ thống chưa có nhân viên nào.
                        </CTableDataCell>
                      </CTableRow>
                    )}
                  </CTableBody>
                </CTable>
              </div>
            )}
            
            {/* Phân trang */}
            {!loading && users.length > 0 && (
              <div className="d-flex justify-content-center mt-4">
                <CPagination size="sm" aria-label="Page navigation" className="mb-0">
                  <CPaginationItem disabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>
                    Trước
                  </CPaginationItem>
                  {[...Array(Math.ceil(users.length / itemsPerPage))].map((_, idx) => (
                    <CPaginationItem 
                       key={idx + 1} 
                       active={currentPage === idx + 1}
                       onClick={() => setCurrentPage(idx + 1)}
                    >
                      {idx + 1}
                    </CPaginationItem>
                  ))}
                  <CPaginationItem 
                     disabled={currentPage === Math.ceil(users.length / itemsPerPage)} 
                     onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(users.length / itemsPerPage)))}
                  >
                    Sau
                  </CPaginationItem>
                </CPagination>
              </div>
            )}
          </CCardBody>
        </CCard>
      </CCol>

      {/* Modal Cấu hình Điểm Danh */}
      <CModal visible={showSettings} onClose={() => setShowSettings(false)} alignment="center">
        <CModalHeader closeButton>
          <CModalTitle>Cấu Hình Chấm Công</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <CFormLabel className="fw-semibold">Mốc Giờ Chuẩn (Đúng Giờ)</CFormLabel>
            <CFormInput 
               type="time" 
               value={lateTime} 
               onChange={e => setLateTime(e.target.value)} 
               className="form-control-lg text-center fw-bold text-primary"
            />
            <div className="text-muted small mt-2">
               * Nếu nhân viên Check-in muộn hơn thời gian này, hệ thống sẽ tự động gán nhãn <b>"Đi Trễ"</b>.
            </div>
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="ghost" onClick={() => setShowSettings(false)}>Hủy</CButton>
          <CButton color="primary" onClick={handleSaveSettings} disabled={savingSettings}>
            {savingSettings ? 'Đang lưu...' : <><FloppyDisk size={18} className="me-1"/> Lưu Cài Đặt</>}
          </CButton>
        </CModalFooter>
      </CModal>

    </CRow>
  );
};

export default AttendanceReport;
