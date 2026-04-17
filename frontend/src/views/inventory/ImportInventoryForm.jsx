import React, { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosClient from '../../api/axiosClient'
import {
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CFormSelect,
  CFormTextarea,
  CFormInput,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CToaster,
  CToast,
  CToastHeader,
  CToastBody
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilPlus, cilSave } from '@coreui/icons'


// ===============================================
// HÀM FORMAT TIỀN TỆ
// ===============================================
const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0)
}

// ===============================================
// MAIN COMPONENT
// ===============================================
const ImportInventoryForm = () => {
  const navigate = useNavigate()

  // --- STATE DỮ LIỆU TỪ SERVER ---
  const [suppliers, setSuppliers] = useState([])
  const [variants, setVariants] = useState([])

  // --- STATE CHI TIẾT PHIẾU ---
  const [partnerId, setPartnerId] = useState('')
  const [note, setNote] = useState('')

  // --- STATE TOAST ---
  const toaster = useRef()
  const [toast, addToast] = useState(0)

  const showSuccessToast = (message) => (
    <CToast color="success" className="text-white align-items-center">
      <div className="d-flex">
        <CToastBody>{message}</CToastBody>
      </div>
    </CToast>
  )

  // --- STATE MẢNG MẶT HÀNG (Dynamic Field Array) ---
  const [items, setItems] = useState([
    { id: Date.now(), variantId: '', quantity: 1, unitPrice: 0, batchNumber: '', expiryDate: '' }
  ])

  // Fetch master data on component mount
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [supRes, varRes] = await Promise.all([
          axiosClient.get('/partners?type=SUPPLIER'),
          axiosClient.get('/products/all-variants')
        ])
        setSuppliers(supRes)
        setVariants(varRes)
      } catch (error) {
        console.error('Error fetching master data', error)
      }
    }
    fetchMasterData()
  }, [])

  // --- LOGIC QUẢN LÝ DÒNG MẶT HÀNG ---
  const handleAddItem = () => {
    setItems([
      ...items,
      { id: Date.now(), variantId: '', quantity: 1, unitPrice: 0, batchNumber: '', expiryDate: '' }
    ])
  }

  const handleRemoveItem = (id) => {
    if (items.length === 1) return // Giữ tối thiểu 1 dòng
    setItems(items.filter(item => item.id !== id))
  }

  const handleItemChange = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value }
        
        // Auto điền Giá nhập gợi ý khi chọn Mặt hàng (nếu chưa nhập giá trị thủ công)
        if (field === 'variantId') {
           const selectedVariant = variants.find(v => v.id.toString() === value)
           if (selectedVariant) {
             updatedItem.unitPrice = selectedVariant.importPrice || 0
           } else {
             updatedItem.unitPrice = 0
           }
        }
        return updatedItem
      }
      return item
    }))
  }

  // --- LOGIC TÍNH TOÁN ---
  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => {
      const lineTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)
      return sum + lineTotal
    }, 0)
  }, [items])

  // --- SUBMIT ---
  const handleSubmit = async () => {
    if (!partnerId) {
      alert('Vui lòng chọn Nhà cung cấp!');
      return;
    }
    const hasEmptyItems = items.some(i => !i.variantId || Number(i.quantity) <= 0);
    if (hasEmptyItems) {
      alert('Vui lòng chọn mặt hàng và điền số lượng > 0 cho tất cả các dòng!');
      return;
    }

    try {
      // Payload sẵn sàng gửi lên Backend
      const payload = {
        partnerId: parseInt(partnerId),
        note: note,
        details: items.map(i => ({
          variantId: parseInt(i.variantId),
          quantity: parseInt(i.quantity),
          unitPrice: parseFloat(i.unitPrice),
          batchNumber: i.batchNumber || null,
          expiryDate: i.expiryDate ? new Date(i.expiryDate).toISOString() : null,
        }))
      }

      const response = await axiosClient.post('/inventory/import', payload)
      addToast(showSuccessToast(`Tạo phiếu nhập thành công! Mã: ${response.data?.code || ''}`));
      
      // Reset Form
      setPartnerId('');
      setNote('');
      setItems([{ id: Date.now(), variantId: '', quantity: 1, unitPrice: 0, batchNumber: '', expiryDate: '' }]);
      
    } catch (error) {
      console.error('Lưu phiếu thất bại:', error);
      alert('Có lỗi xảy ra khi tạo phiếu nhập!');
    }
  }

  return (
    <CRow>
      {/* 4/12: THÔNG TIN PHIẾU NHẬP */}
      <CCol md={4}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Thông tin phiếu nhập kho</strong>
          </CCardHeader>
          <CCardBody>
            <div className="mb-3">
              <label className="form-label fw-bold">Nhà cung cấp <span className="text-danger">*</span></label>
              <CFormSelect 
                value={partnerId} 
                onChange={(e) => setPartnerId(e.target.value)}
              >
                <option value="">-- Chọn Nhà cung cấp --</option>
                {suppliers.map(sup => (
                  <option key={sup.id} value={sup.id}>{sup.name}</option>
                ))}
              </CFormSelect>
            </div>
            
            <div className="mb-3">
              <label className="form-label fw-bold">Ghi chú</label>
              <CFormTextarea 
                rows={5} 
                placeholder="Ví dụ: Nhập hàng đợt 1 tháng 4..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              ></CFormTextarea>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      {/* 8/12: DANH SÁCH MẶT HÀNG NHẬP */}
      <CCol md={8}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Danh sách mặt hàng nhập (Chi tiết)</strong>
            <CButton color="primary" size="sm" variant="outline" onClick={handleAddItem} className="d-flex align-items-center gap-1">
              <CIcon icon={cilPlus} /> Thêm dòng
            </CButton>
          </CCardHeader>
          <CCardBody>
            <div className="table-responsive">
              <CTable bordered hover size="sm" className="align-middle text-nowrap">
                <CTableHead color="light">
                  <CTableRow>
                    <CTableHeaderCell style={{minWidth: '200px'}}>Mặt hàng (SKU)</CTableHeaderCell>
                    <CTableHeaderCell style={{width: '90px'}}>SL</CTableHeaderCell>
                    <CTableHeaderCell style={{width: '130px'}}>Đơn giá</CTableHeaderCell>
                    <CTableHeaderCell style={{width: '120px'}}>Mã Lô (Batch)</CTableHeaderCell>
                    <CTableHeaderCell style={{width: '150px'}}>Hạn dùng</CTableHeaderCell>
                    <CTableHeaderCell style={{width: '50px'}}></CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {items.map((item) => (
                    <CTableRow key={item.id}>
                      <CTableDataCell>
                        <CFormSelect
                          size="sm"
                          value={item.variantId}
                          onChange={(e) => handleItemChange(item.id, 'variantId', e.target.value)}
                        >
                          <option value="">-- Chọn mặt hàng --</option>
                          {variants.map(v => (
                            <option key={v.id} value={v.id}>{v.sku} - {v.name}</option>
                          ))}
                        </CFormSelect>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CFormInput
                          type="number"
                          size="sm"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                        />
                      </CTableDataCell>
                      <CTableDataCell>
                        <CFormInput
                          type="number"
                          size="sm"
                          min="0"
                          step="1000"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(item.id, 'unitPrice', e.target.value)}
                        />
                      </CTableDataCell>
                      <CTableDataCell>
                        <CFormInput
                          type="text"
                          size="sm"
                          placeholder="Mã lô..."
                          value={item.batchNumber}
                          onChange={(e) => handleItemChange(item.id, 'batchNumber', e.target.value)}
                        />
                      </CTableDataCell>
                      <CTableDataCell>
                        <CFormInput
                          type="date"
                          size="sm"
                          value={item.expiryDate}
                          onChange={(e) => handleItemChange(item.id, 'expiryDate', e.target.value)}
                        />
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        <CButton
                          color="danger"
                          variant="ghost"
                          size="sm"
                          className="p-1"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={items.length === 1}
                        >
                          <CIcon icon={cilTrash} />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
              <h4 className="mb-0 text-primary">
                Tổng tiền nhập: {formatCurrency(totalAmount)}
              </h4>
              <CButton color="success" size="lg" className="text-white d-flex align-items-center gap-2" onClick={handleSubmit}>
                <CIcon icon={cilSave} />
                Tạo phiếu nhập
              </CButton>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <CToaster ref={toaster} push={toast} placement="top-end" />
    </CRow>
  )
}

export default ImportInventoryForm
