import React, { useState, useEffect } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CForm,
  CFormInput,
  CFormSelect,
  CButton,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CFormTextarea,
  CBadge
} from '@coreui/react';
import { Trash, Plus, CheckCircle, FloppyDisk } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

const StocktakeCreate = () => {
  const [variants, setVariants] = useState([]);
  const [selectedVariantId, setSelectedVariantId] = useState('');

  const [details, setDetails] = useState([]); // List of selected products to stocktake
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchVariants();
  }, []);

  const fetchVariants = async () => {
    try {
      const data = await axiosClient.get('/products/all-variants');
      setVariants(data || []);
    } catch (error) {
      console.error('Failed to load variants', error);
    }
  };

  const handleAddItem = () => {
    if (!selectedVariantId) return;

    const variant = variants.find(v => v.id === parseInt(selectedVariantId));
    if (!variant) return;

    // Check if already added
    if (details.find(d => d.variantId === variant.id)) {
      alert('Sản phẩm này đã được thêm vào danh sách kiểm kê!');
      return;
    }

    setDetails([...details, {
      variantId: variant.id,
      sku: variant.sku,
      name: variant.name,
      systemQty: variant.stockCount || 0,
      actualQty: variant.stockCount || 0 // Default set to current system qty
    }]);

    setSelectedVariantId(''); // reset dropdown
  };

  const handleRemoveItem = (variantId) => {
    setDetails(details.filter(d => d.variantId !== variantId));
  };

  const handleChangeActualQty = (variantId, value) => {
    const qty = parseInt(value);
    if (isNaN(qty) || qty < 0) return;

    setDetails(details.map(d => {
      if (d.variantId === variantId) {
        return { ...d, actualQty: qty };
      }
      return d;
    }));
  };

  const handleSaveDraft = async () => {
    if (details.length === 0) {
      alert('Vui lòng thêm ít nhất 1 sản phẩm vào phiếu kiểm kê');
      return;
    }

    try {
      setLoading(true);
      await axiosClient.post('/stocktakes', {
        note,
        details: details.map(d => ({
          variantId: d.variantId,
          systemQty: d.systemQty,
          actualQty: d.actualQty
        }))
      });
      navigate('/inventory/stocktakes', { state: { successMessage: 'Kiểm kho thành công!' } });
    } catch (error) {
      console.error('Failed to save stocktake', error);
      alert('Lỗi khi lưu phiếu báo cáo');
    } finally {
      setLoading(false);
    }
  };

  const getAdjustmentBadge = (systemQty, actualQty) => {
    const diff = actualQty - systemQty;
    if (diff === 0) return <CBadge color="secondary">Khớp (0)</CBadge>;
    if (diff > 0) return <CBadge color="success">Thừa (+{diff})</CBadge>;
    return <CBadge color="danger">Thiếu ({diff})</CBadge>;
  };

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Tạo Phiếu Kiểm Kê (Đếm Kho)</strong>
          </CCardHeader>
          <CCardBody>
            <CRow className="mb-4 align-items-end">
              <CCol md={6}>
                <label className="form-label fw-semibold">Tìm / Chọn sản phẩm cần đếm</label>
                <CFormSelect
                  value={selectedVariantId}
                  onChange={(e) => setSelectedVariantId(e.target.value)}
                >
                  <option value="">-- Chọn sản phẩm / gõ từ khóa --</option>
                  {variants.map(v => (
                    <option key={v.id} value={v.id}>
                      [{v.sku}] {v.name} (Tồn: {v.stockCount})
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={2}>
                <CButton color="primary" onClick={handleAddItem} disabled={!selectedVariantId}>
                  <Plus size={20} className="me-1" />
                  Đưa vào ds
                </CButton>
              </CCol>
            </CRow>

            <CTable hover responsive bordered align="middle" className="mt-4">
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell style={{ width: '60px' }} className="text-center">STT</CTableHeaderCell>
                  <CTableHeaderCell>Mã / SKU</CTableHeaderCell>
                  <CTableHeaderCell>Tên Sản Phẩm (Quy cách)</CTableHeaderCell>
                  <CTableHeaderCell className="text-center" style={{ width: '120px' }}>Tồn Sổ Sách</CTableHeaderCell>
                  <CTableHeaderCell className="text-center bg-warning bg-opacity-25" style={{ width: '150px' }}>Kiểm Thực Tế</CTableHeaderCell>
                  <CTableHeaderCell className="text-center" style={{ width: '120px' }}>Chênh Lệch</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: '60px' }} className="text-center">Xóa</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {details.length > 0 ? details.map((item, index) => (
                  <CTableRow key={item.variantId}>
                    <CTableDataCell className="text-center">{index + 1}</CTableDataCell>
                    <CTableDataCell className="fw-semibold font-monospace">{item.sku}</CTableDataCell>
                    <CTableDataCell>{item.name}</CTableDataCell>
                    <CTableDataCell className="text-center text-body-secondary fw-semibold bg-body-tertiary">
                      {item.systemQty}
                    </CTableDataCell>
                    <CTableDataCell className="p-2">
                      <CFormInput
                        type="number"
                        min="0"
                        value={item.actualQty}
                        onChange={(e) => handleChangeActualQty(item.variantId, e.target.value)}
                        className="text-center fw-bold text-primary"
                        style={{ borderColor: 'var(--cui-primary)' }}
                      />
                    </CTableDataCell>
                    <CTableDataCell className="text-center">
                      {getAdjustmentBadge(item.systemQty, item.actualQty)}
                    </CTableDataCell>
                    <CTableDataCell className="text-center">
                      <CButton
                        color="danger"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.variantId)}
                      >
                        <Trash size={20} />
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                )) : (
                  <CTableRow>
                    <CTableDataCell colSpan="7" className="text-center text-muted py-5 border-dashed">
                      Chưa có sản phẩm nào được đưa vào danh sách kiểm kê hôm nay.
                    </CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
            </CTable>

            <CRow className="mt-4">
              <CCol md={12}>
                <label className="form-label fw-semibold">Ghi chú (Lý do kiểm kê, hỏng hóc...)</label>
                <CFormTextarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: Kiểm kê định kỳ tháng 4, phát hiện rách bao bì..."
                />
              </CCol>
            </CRow>

            <div className="d-flex justify-content-end mt-4 pt-3 border-top gap-3">
              <CButton color="secondary" variant="outline" onClick={() => navigate('/inventory/stocktakes')}>
                Hủy Dọn
              </CButton>
              <CButton color="warning" className="text-dark" onClick={handleSaveDraft} disabled={loading}>
                <FloppyDisk size={20} className="me-2" />
                Lưu Nháp
              </CButton>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default StocktakeCreate;
