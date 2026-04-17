import React, { forwardRef } from 'react';

// Nhận thêm props settings từ component cha
const InvoicePrintTemplate = forwardRef(({ orderData, settings = {} }, ref) => {
  if (!orderData) return null;

  // Lấy giá trị fallback nếu không có settings
  const companyName = settings.print_company_name || 'NHÀ MÁY SẢN XUẤT ABT';
  const companyAddress = settings.print_company_address || 'Số 123, Đường Công Nghiệp, KCN ABC, TP. HCM';
  const companyPhone = settings.print_company_phone || '0123.456.789 - MST: 0312345678';
  const invoiceTitle = settings.print_invoice_title || 'PHIẾU XUẤT KHO KIÊM BÁN HÀNG';
  const paperSize = (settings.print_paper_size || 'a4').toLowerCase();
  const showDiscount = settings.print_show_discount === 'true';
  const showSignatures = settings.print_show_signatures === 'true';
  let logoUrl = settings.print_company_logo;
  if (logoUrl && logoUrl.startsWith('/public/')) {
    logoUrl = `http://localhost:5000${logoUrl}`;
  }

  // Render format
  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  const items = orderData.orderItems || [];
  const customer = orderData.customer || {};

  return (
    <div 
      ref={ref} 
      className="bg-white text-dark" 
      style={{ 
        fontSize: paperSize === 'a5' ? '13px' : '15px', 
        fontFamily: '"Times New Roman", Times, serif',
        padding: paperSize === 'a5' ? '20px' : '40px',
        width: '100%',
        margin: '0 auto',
        maxWidth: paperSize === 'a5' ? '148mm' : '210mm' // approximate sizing if viewed outside print
      }}
    >
      {/* CSS đặc trị cho bản in */}
      <style type="text/css" media="print">
        {`
          @page { size: ${paperSize === 'a5' ? 'A5 landscape' : 'A4 portrait'}; margin: 10mm; }
          body { 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
            margin: 0;
            padding: 0;
          }
          table { page-break-inside: auto; width: 100%; border-collapse: collapse; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          .table-bordered, .table-bordered th, .table-bordered td { 
             border: 1px solid #000 !important; 
             padding: 4px;
          }
        `}
      </style>

      {/* Phần Header */}
      <div className="d-flex justify-content-between align-items-start border-bottom pb-3 mb-3" style={{ borderColor: '#000' }}>
        <div className="d-flex align-items-center gap-3">
          {logoUrl && (
            <img src={logoUrl} alt="Logo" style={{ maxHeight: '70px', maxWidth: '100px', objectFit: 'contain' }} />
          )}
          <div>
            <h5 className="mb-1 fw-bold text-uppercase" style={{ fontSize: paperSize === 'a5' ? '16px' : '18px' }}>
              {companyName}
            </h5>
            <p className="mb-1"><strong>Địa chỉ:</strong> {companyAddress}</p>
            <p className="mb-0"><strong>Liên hệ:</strong> {companyPhone}</p>
          </div>
        </div>
        <div className="text-end">
          <p className="mb-1 fw-bold">Số phiếu: {orderData.code}</p>
          <p className="mb-0">Ngày: {formatDate(orderData.createdAt || new Date())}</p>
        </div>
      </div>

      {/* Phần Tiêu đề */}
      <div className="text-center mb-4">
        <h2 className="fw-bold mb-1 text-uppercase" style={{ fontSize: paperSize === 'a5' ? '20px' : '26px' }}>{invoiceTitle}</h2>
      </div>

      {/* Phần Thông tin Khách Hàng */}
      <div className="mb-3">
        <p className="mb-1"><strong>Khách hàng:</strong> {customer.name || 'Khách lẻ'}</p>
        <p className="mb-1"><strong>Điện thoại:</strong> {customer.phone || '........................................................'}</p>
        <p className="mb-0"><strong>Địa chỉ giao hàng:</strong> {customer.address || '................................................................'}</p>
      </div>

      {/* Phần Bảng Sản Phẩm / Vật Tư */}
      <table className="table-bordered border-dark mb-4 text-dark w-100" style={{ borderColor: '#000' }}>
        <thead className="text-center align-middle">
          <tr>
            <th style={{ width: '50px' }}>STT</th>
            <th>Tên hàng hóa / Sản phẩm</th>
            <th style={{ width: '70px' }}>ĐVT</th>
            <th style={{ width: '60px' }}>SL</th>
            <th style={{ width: '110px' }}>Đơn giá</th>
            <th style={{ width: '130px' }}>Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td className="text-center">{index + 1}</td>
              <td className="px-2">{item.productVariant?.name || item.name}</td>
              <td className="text-center">{item.unit || 'Cái'}</td>
              <td className="text-center">{item.quantity}</td>
              <td className="text-end px-2">{formatCurrency(item.price)}</td>
              <td className="text-end px-2 fw-semibold">{formatCurrency(item.quantity * item.price)}</td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan="6" className="text-center fst-italic py-3">Không có chi tiết sản phẩm.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Phần Tổng Tiền */}
      <div className="row justify-content-end mb-4 text-dark">
        <div className="col-6 col-md-5">
          <div className="d-flex justify-content-between mb-1">
            <strong>Tổng tiền hàng:</strong>
            <span>{formatCurrency(orderData.totalAmount || orderData.finalAmount)}</span>
          </div>
          {showDiscount && (
            <div className="d-flex justify-content-between mb-1 text-danger">
              <strong>Chiết khấu:</strong>
              <span>- {formatCurrency(orderData.discount || 0)}</span>
            </div>
          )}
          <div className="d-flex justify-content-between mt-2 pt-2" style={{ borderTop: '2px solid #000' }}>
            <strong className="fs-6">Khách cần trả:</strong>
            <span className="fw-bold fs-5">{formatCurrency(orderData.finalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Phần Chữ Ký */}
      {showSignatures && (
        <div className="row text-center mt-5 text-dark" style={{ pageBreakInside: 'avoid' }}>
          <div className="col-4">
            <p className="fw-bold mb-5">Người mua hàng</p>
            <p className="fst-italic mt-5 pt-3 mb-0">(Ký, họ tên)</p>
          </div>
          <div className="col-4">
            <p className="fw-bold mb-5">Người giao hàng</p>
            <p className="fst-italic mt-5 pt-3 mb-0">(Ký, họ tên)</p>
          </div>
          <div className="col-4">
            <p className="fw-bold mb-5">Người lập phiếu</p>
            <p className="fst-italic mt-5 pt-3 mb-0">(Ký, họ tên)</p>
          </div>
        </div>
      )}
    </div>
  );
});

InvoicePrintTemplate.displayName = 'InvoicePrintTemplate';
export default InvoicePrintTemplate;
