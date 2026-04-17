import React, { useState, useEffect } from 'react'
// Nếu dự án có react-router-dom, chúng ta lấy ID từ useParams
// import { useParams } from 'react-router-dom'
import {
  CRow,
  CCol,
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
  CFormSelect,
  CProgress,
  CProgressBar,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilMoney, cilTruck, cilNotes, cilUser, cilCheckCircle } from '@coreui/icons'

// ===============================================
// MOCK API FUNCTION (Prisma includes format)
// ===============================================
const mockGetOrderById = (id) => {
  return new Promise(resolve => {
    setTimeout(() => {
       const mockOrder = {
          id: id || 1,
          code: 'ORD-20240401-01',
          totalAmount: 18500000,
          discount: 500000,
          finalAmount: 18000000,
          status: 'SHIPPED', // PROCESSING, SHIPPED, DELIVERED, CANCELLED
          createdAt: '2024-04-01T08:30:00Z',
          customer: { name: 'Công ty TNHH Kiến Trúc Xanh', phone: '0901234567', address: '123 Đường XYZ, TP.HCM' },
          user: { fullName: 'Nguyễn Văn Bán Hàng' },
          items: [
            {
               id: 1, quantity: 20, price: 300000,
               variant: { sku: 'MDF-X-15', product: { name: 'Ván MDF cốt xanh 15mm' } },
               batch: { batchNumber: 'LOT-Jan24' }
            },
            {
               id: 2, quantity: 25, price: 500000,
               variant: { sku: 'PUR-TRANG-2KG', product: { name: 'Keo PUR Trắng 2kg' } },
               batch: null // Không quản lý lô
            }
          ],
          shipping: {
             id: 1, 
             carrierName: 'Giao Hàng Nhanh (GHN)', 
             trackingNumber: 'GHN-123456789VN', 
             shippingFee: 150000, 
             status: 'IN_TRANSIT', // PENDING, IN_TRANSIT, DELIVERED, RETURNED
             expectedDate: '2024-04-05T00:00:00Z'
          },
          payments: [
             { id: 1, code: 'PAY-111', type: 'INCOME', amount: 5000000, method: 'Tiền mặt', createdAt: '2024-04-01T08:35:00Z' },
             { id: 2, code: 'PAY-112', type: 'INCOME', amount: 13000000, method: 'Chuyển khoản', createdAt: '2024-04-02T10:00:00Z' }
          ]
       };
       resolve({ data: mockOrder })
    }, 500)
  })
}

// ===============================================
// HELPER FUNCTIONS
// ===============================================
const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0)
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('vi-VN', { 
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute:'2-digit'
  }).format(date)
}

// ===============================================
// MAIN COMPONENT
// ===============================================
const OrderDetail = () => {
  // const { id } = useParams() // Lấy ID từ URL nếu có router config thật
  const id = 1; // Fake ID
  
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  // State cập nhật tạm trạng thái shipping
  const [shipStatusEnum, setShipStatusEnum] = useState('')

  useEffect(() => {
    fetchOrderDetail()
  }, [id])

  const fetchOrderDetail = async () => {
    try {
      setLoading(true)
      const res = await mockGetOrderById(id)
      setOrder(res.data)
      setShipStatusEnum(res.data.shipping?.status || '')
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateShipping = () => {
    if (confirm(`Bạn có chắc muốn cập nhật trạng thái vận đơn thành: ${shipStatusEnum}?`)) {
      // Giả lập lưu API
      setOrder(prev => ({
        ...prev,
        shipping: {
          ...prev.shipping,
          status: shipStatusEnum
        }
      }))
      alert("Cập nhật trạng thái giao hàng thành công!");
    }
  }

  if (loading || !order) return <div className="text-center mt-5">Đang tải chi tiết đơn hàng...</div>

  // Logic Progress Bar (Chờ xử lý -> Đang giao -> Đã giao)
  let progressVal = 0
  if (order.status === 'PROCESSING') progressVal = 25
  if (order.status === 'SHIPPED') progressVal = 60
  if (order.status === 'DELIVERED') progressVal = 100
  if (order.status === 'CANCELLED') progressVal = 100

  // Total Payment Calculation
  const totalPaid = order.payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  const debt = order.finalAmount - totalPaid;

  return (
    <div className="order-detail-page">
      {/* 1. PROGRESS BAR / STATUS WIDGET */}
      <CCard className="mb-4">
        <CCardBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
             <h4 className="mb-0 text-primary fw-bold">
               <CIcon icon={cilNotes} size="xl" className="me-2" />
               Mã Đơn: {order.code}
             </h4>
             {order.status === 'CANCELLED' ? (
                <CBadge color="danger" className="fs-5 px-4 py-2">ĐÃ HỦY ĐƠN VÀO CHUỖI CUNG ỨNG</CBadge>
             ) : (
               <div className="text-end">
                 <div className="text-muted small">Khách Hàng</div>
                 <strong className="fs-5">{order.customer?.name} - {order.customer?.phone}</strong>
               </div>
             )}
          </div>
          
          {order.status !== 'CANCELLED' && (
            <div className="mt-4 px-2">
              <CProgress height={20} className="mb-2">
                {/* 
                  Visual Progress bar
                */}
                <CProgressBar color={progressVal === 100 ? "success" : "info"} value={progressVal} />
              </CProgress>
              <div className="d-flex justify-content-between text-muted fw-bold small">
                <span>[Khởi tạo] Chờ xử lý</span>
                <span>[Xuất kho] Đang giao</span>
                <span>[Thành công] Đã nhận hàng</span>
              </div>
            </div>
          )}
        </CCardBody>
      </CCard>

      <CRow>
        {/* ======================================= */}
        {/* CỘT TRÁI (8/12): Hàng hóa & Thanh toán   */}
        {/* ======================================= */}
        <CCol md={8}>
          
          {/* A. BẢNG MẶT HÀNG (OrderItem) */}
          <CCard className="mb-4 shadow-sm">
            <CCardHeader className="bg-light fw-bold">
              Danh sách Sản phẩm Đã bán
            </CCardHeader>
            <CCardBody>
              <div className="table-responsive">
                <CTable bordered align="middle">
                  <CTableHead color="light">
                    <CTableRow>
                      <CTableHeaderCell>Sản phẩm</CTableHeaderCell>
                      <CTableHeaderCell>Mã (SKU)</CTableHeaderCell>
                      <CTableHeaderCell>Mã Lô</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Số lượng</CTableHeaderCell>
                      <CTableHeaderCell className="text-end">Đơn giá</CTableHeaderCell>
                      <CTableHeaderCell className="text-end">Thành tiền</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {order.items?.map((item) => (
                      <CTableRow key={item.id}>
                        <CTableDataCell><strong>{item.variant?.product?.name}</strong></CTableDataCell>
                        <CTableDataCell>{item.variant?.sku}</CTableDataCell>
                        <CTableDataCell>
                          {item.batch ? <CBadge color="secondary">{item.batch.batchNumber}</CBadge> : <em>--</em>}
                        </CTableDataCell>
                        <CTableDataCell className="text-center">{item.quantity}</CTableDataCell>
                        <CTableDataCell className="text-end">{formatCurrency(item.price)}</CTableDataCell>
                        <CTableDataCell className="text-end fw-semibold text-primary">
                          {formatCurrency(item.quantity * item.price)}
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </div>

              {/* Tóm tắt tiền */}
              <div className="d-flex flex-column align-items-end mt-3 fw-bold">
                <div className="mb-1 text-muted">Tổng tiền hàng: {formatCurrency(order.totalAmount)}</div>
                <div className="mb-1 text-danger">Giảm giá: - {formatCurrency(order.discount)}</div>
                <h5 className="mt-2 text-primary">Thành tiền Hóa Đơn: {formatCurrency(order.finalAmount)}</h5>
              </div>
            </CCardBody>
          </CCard>

          {/* B. LỊCH SỬ THANH TOÁN (Payment) */}
          <CCard className="mb-4 border-info">
            <CCardHeader className="bg-info bg-opacity-10 fw-bold border-bottom-info">
               <CIcon icon={cilMoney} className="me-2" />
               Chi tiết Dòng tiền (Thanh toán)
            </CCardHeader>
            <CCardBody>
               <CTable hover align="middle" size="sm">
                 <CTableHead>
                   <CTableRow>
                     <CTableHeaderCell>Mã Phiếu Thu</CTableHeaderCell>
                     <CTableHeaderCell>Thời gian</CTableHeaderCell>
                     <CTableHeaderCell>Phương thức</CTableHeaderCell>
                     <CTableHeaderCell className="text-end">Số tiền nộp</CTableHeaderCell>
                   </CTableRow>
                 </CTableHead>
                 <CTableBody>
                   {order.payments && order.payments.length > 0 ? (
                     order.payments.map((p) => (
                       <CTableRow key={p.id}>
                         <CTableDataCell>
                            <CBadge color="success" shape="rounded-pill">INCOME</CBadge> {p.code}
                         </CTableDataCell>
                         <CTableDataCell>{formatDate(p.createdAt)}</CTableDataCell>
                         <CTableDataCell>{p.method}</CTableDataCell>
                         <CTableDataCell className="text-end fw-bold text-success">
                            {formatCurrency(p.amount)}
                         </CTableDataCell>
                       </CTableRow>
                     ))
                   ) : (
                      <CTableRow>
                        <CTableDataCell colSpan={4} className="text-center text-muted">Chưa có giao dịch thanh toán</CTableDataCell>
                      </CTableRow>
                   )}
                 </CTableBody>
               </CTable>
               <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                  <span className="fw-semibold">CÔNG NỢ ĐƠN HÀNG:</span>
                  <span className={`fs-5 fw-bold ${debt > 0 ? 'text-danger' : 'text-success'}`}>
                     {debt > 0 ? `Còn nợ: ${formatCurrency(debt)}` : <><CIcon icon={cilCheckCircle}/> Đã thanh toán đủ</>}
                  </span>
               </div>
            </CCardBody>
          </CCard>

        </CCol>


        {/* ======================================= */}
        {/* CỘT PHẢI (4/12): Giao vận & Trạng thái    */}
        {/* ======================================= */}
        <CCol md={4}>

           {/* A. THÔNG TIN KHÁCH KÈM USER */}
           <CCard className="mb-4 bg-light text-dark">
             <CCardBody>
               <div className="d-flex align-items-center mb-3">
                  <div className="p-2 bg-secondary bg-opacity-25 rounded-circle me-3">
                    <CIcon icon={cilUser} size="xl" />
                  </div>
                  <div>
                    <h6 className="mb-0">Thông tin giao hàng</h6>
                    <small className="text-muted">Nhân viên chốt: {order.user?.fullName}</small>
                  </div>
               </div>
               <p className="mb-1"><strong>Khách:</strong> {order.customer?.name}</p>
               <p className="mb-1"><strong>Thuê bao:</strong> {order.customer?.phone}</p>
               <p className="mb-0"><strong>Địa chỉ:</strong> {order.customer?.address}</p>
             </CCardBody>
           </CCard>

           {/* B. VẬN CHUYỂN (Shipping) */}
           <CCard className="mb-4">
            <CCardHeader className="bg-dark text-white fw-bold">
               <CIcon icon={cilTruck} className="me-2" />
               Vận chuyển
            </CCardHeader>
            <CCardBody>
              {order.shipping ? (
                 <>
                   <ul className="list-unstyled">
                      <li className="mb-2">
                        Đơn vị: <strong>{order.shipping.carrierName}</strong>
                      </li>
                      <li className="mb-2">
                        Mã Bill (Mã Vận): <span className="text-primary fw-bold">{order.shipping.trackingNumber}</span>
                      </li>
                      <li className="mb-2">
                        Phí Ship tính khách: <strong>{formatCurrency(order.shipping.shippingFee)}</strong>
                      </li>
                   </ul>
                   
                   <hr/>
                   <div className="mt-3">
                     <label className="fw-bold mb-2">Cập nhật lộ trình (Status):</label>
                     <div className="d-flex gap-2">
                       <CFormSelect value={shipStatusEnum} onChange={(e) => setShipStatusEnum(e.target.value)}>
                         <option value="PENDING">Kho đang soạn hàng (PENDING)</option>
                         <option value="IN_TRANSIT">Bưu cục Đang phát (IN_TRANSIT)</option>
                         <option value="DELIVERED">Phát Thành Công (DELIVERED)</option>
                         <option value="RETURNED">Đã Hoàn Hàng (RETURNED)</option>
                       </CFormSelect>
                       <CButton 
                         color="warning" 
                         className="text-white"
                         onClick={handleUpdateShipping}
                         disabled={shipStatusEnum === order.shipping.status} // Disabled nếu chưa đổi giá trị
                       >Lưu</CButton>
                     </div>
                   </div>
                 </>
              ) : (
                <div className="text-center text-muted">
                  Đơn hàng tự vận chuyển hoặc chưa tạo mã vận đơn.
                </div>
              )}
            </CCardBody>
           </CCard>

        </CCol>
      </CRow>
    </div>
  )
}

export default OrderDetail
