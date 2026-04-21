import React, { useState, useEffect } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CFormInput,
  CAlert,
  CSpinner,
  CBadge,
  CPagination,
  CPaginationItem,
  CFormSelect
} from '@coreui/react';
import { FloppyDisk, CheckCircle, WarningCircle, ClockCounterClockwise, ArrowsClockwise } from '@phosphor-icons/react';
import axiosClient from '../../api/axiosClient';

const CostAdjustment = () => {
  const [activeKey, setActiveKey] = useState(1);
  const [variants, setVariants] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  // Edited values state { variantId: { newImportPrice, newSellPrice } }
  const [edits, setEdits] = useState({});
  const [successAlert, setSuccessAlert] = useState('');
  const [errorAlert, setErrorAlert] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (activeKey === 1) {
      fetchVariants();
      setCurrentPage(1);
    }
    if (activeKey === 2) fetchHistory();
  }, [activeKey]);

  const fetchCategories = async () => {
    try {
      const data = await axiosClient.get('/categories');
      setCategories(data || []);
    } catch (e) {
      console.error('Không tải được danh mục', e);
    }
  };

  const fetchVariants = async () => {
    try {
      setLoading(true);
      const data = await axiosClient.get('/products/all-variants');
      setVariants(data || []);
      setEdits({}); // Reset edits when refreshing
    } catch (error) {
      console.error('Lỗi khi tải danh sách biến thể', error);
      setErrorAlert('Lỗi tải dữ liệu sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await axiosClient.get('/products/variants/price-history');
      setHistory(data || []);
    } catch (error) {
      console.error('Lỗi khi tải lịch sử', error);
      setErrorAlert('Lỗi tải dữ liệu lịch sử');
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (variantId, field, value) => {
    const numValue = value === '' ? '' : Number(value);
    setEdits(prev => ({
      ...prev,
      [variantId]: {
        ...prev[variantId],
        [field]: numValue
      }
    }));
  };

  const handleClearEdits = () => {
    setEdits({});
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  const handleSaveAll = async () => {
    const adjustments = Object.keys(edits).map(vid => {
      const variantId = parseInt(vid);
      const original = variants.find(v => v.id === variantId);
      const edit = edits[vid];

      const newImp = edit.newImportPrice !== undefined && edit.newImportPrice !== '' ? edit.newImportPrice : original.importPrice;
      const newSel = edit.newSellPrice !== undefined && edit.newSellPrice !== '' ? edit.newSellPrice : original.sellPrice;

      // Only include if actual change exists
      if (parseFloat(newImp) !== parseFloat(original.importPrice) || parseFloat(newSel) !== parseFloat(original.sellPrice)) {
        return {
          variantId,
          importPrice: newImp,
          sellPrice: newSel
        };
      }
      return null;
    }).filter(Boolean);

    if (adjustments.length === 0) {
      setSuccessAlert('Không có thay đổi nào để lưu.');
      return;
    }

    try {
      setSaving(true);
      await axiosClient.put('/products/variants/adjust-price', {
        adjustments,
        reason: 'Điều chỉnh giá hàng loạt'
      });
      setSuccessAlert('Cập nhật bảng giá thành công!');
      fetchVariants();
    } catch (error) {
      console.error('Lỗi lưu giá', error);
      setErrorAlert('Có lỗi xảy ra khi lưu bảng giá.');
    } finally {
      setSaving(false);
    }
  };

  const filteredVariants = variants.filter(v => {
    const matchSearch = v.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.name && v.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchCategory = selectedCategory ? (v.product?.categoryId === parseInt(selectedCategory)) : true;
    return matchSearch && matchCategory;
  });

  const totalPages = Math.ceil(filteredVariants.length / itemsPerPage) || 1;
  const currentVariants = filteredVariants.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <CRow>
      <CCol xs={12}>
        {successAlert && (
          <CAlert color="success" dismissible onClose={() => setSuccessAlert('')}>
            <CheckCircle size={20} className="me-2" /> {successAlert}
          </CAlert>
        )}
        {errorAlert && (
          <CAlert color="danger" dismissible onClose={() => setErrorAlert('')}>
            <WarningCircle size={20} className="me-2" /> {errorAlert}
          </CAlert>
        )}

        <CCard className="mb-4">
          <CCardHeader>
            <CNav variant="tabs" className="card-header-tabs">
              <CNavItem>
                <CNavLink
                  active={activeKey === 1}
                  onClick={() => setActiveKey(1)}
                  style={{ cursor: 'pointer' }}
                >
                  <strong>Cập nhật Giá Bán / Giá Vốn</strong>
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink
                  active={activeKey === 2}
                  onClick={() => setActiveKey(2)}
                  style={{ cursor: 'pointer' }}
                >
                  <ClockCounterClockwise size={18} className="me-1" />
                  <strong>Lịch sử chỉnh giá</strong>
                </CNavLink>
              </CNavItem>
            </CNav>
          </CCardHeader>
          <CCardBody>
            <CTabContent>
              {/* TAB 1: DANH SÁCH CHỈNH SỬA */}
              <CTabPane visible={activeKey === 1}>
                <CRow className="mb-3 align-items-center">
                  <CCol md={3}>
                    <CFormInput
                      placeholder="Tìm Mã hoặc Tên sản phẩm..."
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    />
                  </CCol>
                  <CCol md={3}>
                    <CFormSelect value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}>
                      <option value="">Tất cả Danh mục</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </CFormSelect>
                  </CCol>
                  <CCol md={2}>
                    <CFormSelect value={itemsPerPage} onChange={(e) => { setItemsPerPage(parseInt(e.target.value)); setCurrentPage(1); }}>
                      <option value="10">10 dòng / trang</option>
                      <option value="25">25 dòng / trang</option>
                      <option value="50">50 dòng / trang</option>
                      <option value="100">100 dòng / trang</option>
                    </CFormSelect>
                  </CCol>
                  <CCol md={4} className="text-end">
                    <div className="d-flex justify-content-end gap-2">
                      <CButton 
                        color="info" 
                        variant="outline" 
                        onClick={handleClearEdits} 
                        disabled={Object.keys(edits).length === 0}
                        className="fw-semibold d-flex align-items-center"
                      >
                        <ArrowsClockwise size={20} className="me-2" />
                        Làm mới
                      </CButton>
                      <CButton color="primary" onClick={handleSaveAll} disabled={saving || Object.keys(edits).length === 0}>
                        {saving ? <CSpinner size="sm" className="me-2" /> : <FloppyDisk size={20} className="me-2" />}
                        Cập Nhật Giá
                      </CButton>
                    </div>
                  </CCol>
                </CRow>

                {loading ? <div className="text-center my-4">Đang tải...</div> : (
                  <CTable hover responsive bordered align="middle">
                    <CTableHead color="light">
                      <CTableRow>
                        <CTableHeaderCell>Mã Sản Phẩm</CTableHeaderCell>
                        <CTableHeaderCell>Sản phẩm & Quy cách</CTableHeaderCell>
                        <CTableHeaderCell className="text-end">Giá vốn cũ</CTableHeaderCell>
                        <CTableHeaderCell style={{ width: '180px' }} className="text-center bg-warning bg-opacity-10 text-dark">Giá vốn Mới</CTableHeaderCell>
                        <CTableHeaderCell className="text-end">Giá bán cũ</CTableHeaderCell>
                        <CTableHeaderCell style={{ width: '180px' }} className="text-center bg-info bg-opacity-10 text-dark">Giá bán Mới</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {currentVariants.map(v => {
                        const edit = edits[v.id] || {};
                        const newImp = edit.newImportPrice !== undefined ? edit.newImportPrice : v.importPrice;
                        const newSel = edit.newSellPrice !== undefined ? edit.newSellPrice : v.sellPrice;

                        const isImpChanged = parseFloat(newImp) !== parseFloat(v.importPrice);
                        const isSelChanged = parseFloat(newSel) !== parseFloat(v.sellPrice);

                        return (
                          <CTableRow key={v.id}>
                            <CTableDataCell className="fw-semibold">{v.sku}</CTableDataCell>
                            <CTableDataCell>
                              <div className="fw-bold text-primary">{v.name}</div>
                              {v.attributes && Object.entries(v.attributes).map(([k, val]) => (
                                <CBadge key={k} color="secondary" className="me-1 fw-normal">{k === 'details' ? val : `${k}: ${val}`}</CBadge>
                              ))}
                            </CTableDataCell>
                            <CTableDataCell className="text-end text-muted text-decoration-line-through">
                              {isImpChanged ? formatCurrency(v.importPrice) : formatCurrency(v.importPrice)}
                            </CTableDataCell>
                            <CTableDataCell className={isImpChanged ? "bg-warning bg-opacity-10" : ""}>
                              <CFormInput
                                type="number"
                                min="0"
                                value={edit.newImportPrice !== undefined ? edit.newImportPrice : v.importPrice}
                                onChange={(e) => handleEditChange(v.id, 'newImportPrice', e.target.value)}
                                className={isImpChanged ? "border-warning fw-bold text-warning-emphasis" : ""}
                              />
                            </CTableDataCell>
                            <CTableDataCell className="text-end text-muted">
                              <span className={isSelChanged ? "text-decoration-line-through" : ""}>{formatCurrency(v.sellPrice)}</span>
                            </CTableDataCell>
                            <CTableDataCell className={isSelChanged ? "bg-info bg-opacity-10" : ""}>
                              <CFormInput
                                type="number"
                                min="0"
                                value={edit.newSellPrice !== undefined ? edit.newSellPrice : v.sellPrice}
                                onChange={(e) => handleEditChange(v.id, 'newSellPrice', e.target.value)}
                                className={isSelChanged ? "border-info fw-bold text-info-emphasis" : ""}
                              />
                            </CTableDataCell>
                          </CTableRow>
                        );
                      })}
                      {filteredVariants.length === 0 && (
                        <CTableRow>
                          <CTableDataCell colSpan="6" className="text-center py-4 text-muted">Không tìm thấy biến thể nào.</CTableDataCell>
                        </CTableRow>
                      )}
                    </CTableBody>
                  </CTable>
                )}

                {/* Thanh Phân Trang */}
                {!loading && filteredVariants.length > 0 && (
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <span className="text-muted small">
                      Đang hiển thị {Math.min((currentPage - 1) * itemsPerPage + 1, filteredVariants.length)} - {Math.min(currentPage * itemsPerPage, filteredVariants.length)} của {filteredVariants.length} sản phẩm
                    </span>
                    <CPagination align="end" className="mb-0 overflow-auto">
                      <CPaginationItem disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>
                        Trước
                      </CPaginationItem>

                      {/* Hiển thị giới hạn thẻ Pagination nếu quá nhiều */}
                      {[...Array(totalPages)].map((_, i) => {
                        const page = i + 1;
                        if (page === 1 || page === totalPages || (page >= currentPage - 2 && page <= currentPage + 2)) {
                          return (
                            <CPaginationItem key={page} active={currentPage === page} onClick={() => setCurrentPage(page)}>
                              {page}
                            </CPaginationItem>
                          );
                        } else if (page === currentPage - 3 || page === currentPage + 3) {
                          return <CPaginationItem key={page} disabled>...</CPaginationItem>;
                        }
                        return null;
                      })}

                      <CPaginationItem disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>
                        Sau
                      </CPaginationItem>
                    </CPagination>
                  </div>
                )}
              </CTabPane>

              {/* TAB 2: LỊCH SỬ */}
              <CTabPane visible={activeKey === 2}>
                {loading ? <div className="text-center my-4">Đang tải...</div> : (
                  <CTable hover responsive bordered align="middle">
                    <CTableHead color="light">
                      <CTableRow>
                        <CTableHeaderCell>Thời gian</CTableHeaderCell>
                        <CTableHeaderCell>Nhân viên</CTableHeaderCell>
                        <CTableHeaderCell>Sản phẩm</CTableHeaderCell>
                        <CTableHeaderCell className="text-end">Biến động Giá Vốn</CTableHeaderCell>
                        <CTableHeaderCell className="text-end">Biến động Giá Bán</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {history.map(h => (
                        <CTableRow key={h.id}>
                          <CTableDataCell>{new Date(h.createdAt).toLocaleString('vi-VN')}</CTableDataCell>
                          <CTableDataCell>{h.user?.fullName || 'Hệ thống'}</CTableDataCell>
                          <CTableDataCell>
                            <div className="fw-bold">{h.variant?.sku}</div>
                            <small className="text-muted">{h.variant?.product?.name}</small>
                          </CTableDataCell>
                          <CTableDataCell className="text-end">
                            <div className="text-muted text-decoration-line-through small">{formatCurrency(h.oldImportPrice)}</div>
                            <div className="fw-bold text-danger">{formatCurrency(h.newImportPrice)}</div>
                          </CTableDataCell>
                          <CTableDataCell className="text-end">
                            <div className="text-muted text-decoration-line-through small">{formatCurrency(h.oldSellPrice)}</div>
                            <div className="fw-bold text-primary">{formatCurrency(h.newSellPrice)}</div>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                      {history.length === 0 && (
                        <CTableRow>
                          <CTableDataCell colSpan="5" className="text-center py-4 text-muted">Chưa có lịch sử điều chỉnh nào.</CTableDataCell>
                        </CTableRow>
                      )}
                    </CTableBody>
                  </CTable>
                )}
              </CTabPane>

            </CTabContent>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default CostAdjustment;
