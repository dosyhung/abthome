import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image, PDFViewer } from '@react-pdf/renderer';

// Đăng ký Font Roboto (Để hiển thị Tiếng Việt)
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 'normal' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 'bold' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-italic-webfont.ttf', fontStyle: 'italic' },
  ]
});

const InvoicePrintTemplate = ({ orderData, settings = {} }) => {
  if (!orderData) return null;

  // Xử lý Config Settings
  const companyName = settings.print_company_name || 'NHÀ MÁY ABT - KHO NGHỆ AN ABT';
  const companyAddress = settings.print_company_address || 'KHO ĐƯỜNG TRÁNH VINH - NGHỆ AN 0396115775';
  const companyPhone = settings.print_company_phone || '0396115775';
  const invoiceTitle = settings.print_invoice_title || 'PHIẾU BÁN HÀNG';
  const showDiscount = settings.print_show_discount === 'true' || settings.print_show_discount === true;
  const showSignatures = settings.print_show_signatures === 'true' || settings.print_show_signatures === true;

  let logoUrl = settings.print_company_logo;
  if (logoUrl && logoUrl.startsWith('/public/')) {
    logoUrl = `http://localhost:5000${logoUrl}`;
  }

  const paperSize = (settings.print_paper_size || 'a4').toLowerCase();
  
  // Tỷ lệ co giãn cho Khổ A5
  const isA5 = paperSize === 'a5';
  const scale = isA5 ? 0.72 : 1; 

  // Định nghĩa CSS Vector qua StyleSheet.create
  const styles = StyleSheet.create({
    page: {
      paddingTop: 20 * scale,
      paddingBottom: 20 * scale,
      paddingHorizontal: 25 * scale,
      fontFamily: 'Roboto',
      fontSize: 10 * scale,
    },
    headerGrid: {
      flexDirection: 'row',
      marginBottom: 20 * scale,
      alignItems: 'flex-start',
    },
    logoBox: {
      width: '25%',
      backgroundColor: '#a46543',
      padding: 10 * scale,
      textAlign: 'center',
      color: '#fff',
    },
    logoText: {
      fontSize: 26 * scale,
      fontWeight: 'bold',
    },
    logoSub: {
      fontSize: 7 * scale,
      fontWeight: 'bold',
      marginTop: 3 * scale,
    },
    logoDesc: {
      fontSize: 6 * scale,
    },
    logoImageWrapper: {
      width: '25%',
      alignItems: 'center',
    },
    logoImage: {
      width: 80 * scale,
      height: 80 * scale,
      objectFit: 'contain',
    },
    headerCenter: {
      width: '45%',
      paddingHorizontal: 10 * scale,
    },
    companyName: {
      fontSize: 12 * scale,
      fontWeight: 'bold',
      marginBottom: 4 * scale,
    },
    headerRight: {
      width: '30%',
      alignItems: 'flex-end',
    },
    headerRightRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: 2 * scale,
    },
    qrImage: {
      width: 60 * scale,
      height: 60 * scale,
      marginTop: 5 * scale,
    },
    titleWrapper: {
      alignItems: 'center',
      marginVertical: 10 * scale,
    },
    invoiceTitle: {
      fontSize: 18 * scale,
      fontWeight: 'bold',
      textTransform: 'uppercase',
    },
    customerGrid: {
      flexDirection: 'row',
      marginBottom: 10 * scale,
    },
    customerLeft: {
      width: '75%',
      paddingRight: 10 * scale,
    },
    customerRight: {
      width: '25%',
    },
    dottedRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      marginBottom: 4 * scale,
    },
    dottedLabel: {
      marginRight: 5 * scale,
    },
    dottedFill: {
      flexGrow: 1,
      borderBottomWidth: 1,
      borderBottomStyle: 'dotted',
      borderBottomColor: '#000',
      minHeight: 12 * scale,
    },
    // BẢNG
    table: {
      flexDirection: 'column',
      borderWidth: 1,
      borderColor: '#000',
      marginTop: 10 * scale,
    },
    tableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#000',
    },
    tableHeader: {
      backgroundColor: '#e6e6e6',
      fontWeight: 'bold',
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#000',
    },
    tableCell: {
      borderRightWidth: 1,
      borderRightColor: '#000',
      padding: 4 * scale,
      justifyContent: 'center',
    },
    alignCenter: { textAlign: 'center' },
    alignRight: { textAlign: 'right' },
    // FOOTER CHỮ KÝ
    signatureGrid: {
      flexDirection: 'row',
      marginTop: 20 * scale,
      justifyContent: 'space-between',
    },
    signatureCol: {
      width: '25%',
      alignItems: 'center',
    },
  });
  
  // Format Functions
  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(val || 0);
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  const items = orderData.orderItems || [];
  const customer = orderData.customer || {};

  const currentDebt = Number(customer.debtBalance || 0);
  const thisOrderDebt = Number(orderData.finalAmount || 0) - Number(orderData.paidAmount || 0);
  const oldDebt = currentDebt - thisOrderDebt;

  const qrUrl = `https://img.vietqr.io/image/techcombank-19035881724013-compact2.jpg?amount=${orderData.finalAmount}&addInfo=${orderData.code}&accountName=CONG%20TY%20ABT`;

  // Thiết lập Column Width Cứng
  const colWidths = ['4%', '12%', '30%', '10%', '8%', '6%', '12%', '6%', '12%'];

  const DocumentComponent = (
    <Document>
      <Page size={isA5 ? 'A5' : 'A4'} orientation="portrait" style={styles.page}>
        
        {/* TẦNG 1: HEADER */}
        <View style={styles.headerGrid}>
          {logoUrl ? (
            <View style={styles.logoImageWrapper}>
              <Image src={logoUrl} style={styles.logoImage} />
            </View>
          ) : (
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>ABT</Text>
              <Text style={styles.logoSub}>NHÀ MÁY SẢN XUẤT ABT</Text>
              <Text style={styles.logoDesc}>Sàn nhựa - Ốp tường - Gỗ nhựa</Text>
              <Text style={[styles.logoDesc, { textDecoration: 'underline' }]}>www.abt.vn</Text>
            </View>
          )}

          <View style={styles.headerCenter}>
            <Text style={styles.companyName}>{companyName}</Text>
            <Text style={{ marginBottom: 2 * scale }}>{companyAddress}</Text>
            <Text style={{ fontWeight: 'bold' }}>Quét mã QR trên đơn thanh toán hoặc TECHCOMBANK - 19035881724013 Cty chỉ chấp nhận thanh toán 1 số TK duy nhất</Text>
          </View>

          <View style={styles.headerRight}>
            <View style={styles.headerRightRow}>
              <Text>Số phiếu:</Text>
              <Text>{orderData.code}</Text>
            </View>
            <View style={styles.headerRightRow}>
              <Text>Ngày lập phiếu:</Text>
              <Text>{formatDate(orderData.createdAt || new Date())}</Text>
            </View>
            <Image src={qrUrl} style={styles.qrImage} />
          </View>
        </View>

        {/* TẦNG 2: TIÊU ĐỀ */}
        <View style={styles.titleWrapper}>
          <Text style={styles.invoiceTitle}>{invoiceTitle}</Text>
        </View>

        {/* TẦNG 3: THÔNG TIN KHÁCH HÀNG */}
        <View style={styles.customerGrid}>
          <View style={styles.customerLeft}>
            <View style={styles.dottedRow}>
              <Text style={[styles.dottedLabel, { fontWeight: 'bold' }]}>Tên khách hàng:</Text>
              <Text style={[styles.dottedFill, { fontWeight: 'bold' }]}> {customer.name || 'Khách lẻ'}</Text>
            </View>
            <View style={styles.dottedRow}>
              <Text style={styles.dottedLabel}>Điện thoại:</Text>
              <Text style={styles.dottedFill}> {customer.phone || ''}</Text>
            </View>
            <View style={styles.dottedRow}>
              <Text style={styles.dottedLabel}>Địa chỉ:</Text>
              <Text style={styles.dottedFill}> {customer.address || ''}</Text>
            </View>
            <View style={styles.dottedRow}>
              <Text style={styles.dottedLabel}>Ghi chú:</Text>
              <Text style={styles.dottedFill}> {orderData.note || ''}</Text>
            </View>
            <View style={styles.dottedRow}>
              <Text style={styles.dottedLabel}>Tổng số đơn:</Text>
              <Text style={styles.dottedFill}> </Text>
            </View>
          </View>
          
          <View style={styles.customerRight}>
            <View style={styles.dottedRow}>
              <Text style={styles.dottedLabel}>MKH:</Text>
              <Text style={styles.dottedFill}> {customer.id || ''}</Text>
            </View>
            <View style={styles.dottedRow}>
              <Text style={styles.dottedLabel}>MST:</Text>
              <Text style={styles.dottedFill}> {customer.taxCode || ''}</Text>
            </View>
            <View style={[styles.dottedRow, { marginTop: 'auto' }]}>
              <Text style={styles.dottedLabel}>Nhóm KH:</Text>
              <Text style={styles.dottedFill}> {customer.group || 'KHÁCH PHÂN PHỐI'}</Text>
            </View>
          </View>
        </View>

        {/* TẦNG 4: BẢNG CHI TIẾT SẢN PHẨM */}
        <View style={styles.table}>
          {/* THEAD */}
          <View style={styles.tableHeader}>
            <View style={[styles.tableCell, { width: colWidths[0] }]}><Text style={styles.alignCenter}>TT</Text></View>
            <View style={[styles.tableCell, { width: colWidths[1] }]}><Text style={styles.alignCenter}>Mã</Text></View>
            <View style={[styles.tableCell, { width: colWidths[2] }]}><Text>Tên hàng</Text></View>
            <View style={[styles.tableCell, { width: colWidths[3] }]}><Text>Ghi chú</Text></View>
            <View style={[styles.tableCell, { width: colWidths[4] }]}><Text style={styles.alignCenter}>ĐVT</Text></View>
            <View style={[styles.tableCell, { width: colWidths[5] }]}><Text style={styles.alignCenter}>SL</Text></View>
            <View style={[styles.tableCell, { width: colWidths[6] }]}><Text style={styles.alignRight}>Đơn giá</Text></View>
            <View style={[styles.tableCell, { width: colWidths[7] }]}><Text style={styles.alignCenter}>CK(%)</Text></View>
            <View style={[styles.tableCell, { width: colWidths[8], borderRightWidth: 0 }]}><Text style={styles.alignRight}>Thành tiền</Text></View>
          </View>

          {/* TBODY */}
          {items.map((item, idx) => (
            <View key={idx} style={styles.tableRow} wrap={false}>
              <View style={[styles.tableCell, { width: colWidths[0] }]}><Text style={styles.alignCenter}>{idx + 1}</Text></View>
              <View style={[styles.tableCell, { width: colWidths[1] }]}><Text style={styles.alignCenter}>{item.productVariant?.sku || item.variantId}</Text></View>
              <View style={[styles.tableCell, { width: colWidths[2] }]}>
                <Text>{item.productVariant?.product?.name || 'Sản phẩm'} - {item.productVariant?.name}</Text>
                {item.note ? <Text style={{ fontStyle: 'italic', fontSize: 8 * scale }}>{item.note}</Text> : null}
              </View>
              <View style={[styles.tableCell, { width: colWidths[3] }]}><Text></Text></View>
              <View style={[styles.tableCell, { width: colWidths[4] }]}><Text style={styles.alignCenter}>Thanh</Text></View>
              <View style={[styles.tableCell, { width: colWidths[5] }]}><Text style={styles.alignCenter}>{item.quantity}</Text></View>
              <View style={[styles.tableCell, { width: colWidths[6] }]}><Text style={styles.alignRight}>{formatCurrency(item.price)}</Text></View>
              <View style={[styles.tableCell, { width: colWidths[7] }]}><Text style={styles.alignCenter}>0</Text></View>
              <View style={[styles.tableCell, { width: colWidths[8], borderRightWidth: 0 }]}><Text style={styles.alignRight}>{formatCurrency(item.quantity * item.price)}</Text></View>
            </View>
          ))}

          {/* NO DATA ROW */}
          {items.length === 0 && (
             <View style={styles.tableRow} wrap={false}>
               <View style={[styles.tableCell, { width: '100%', borderRightWidth: 0 }]}>
                 <Text style={[styles.alignCenter, { fontStyle: 'italic', paddingVertical: 10 * scale }]}>Chưa có sản phẩm</Text>
               </View>
             </View>
          )}

          {/* FOOTER TOTALS */}
          {showDiscount && (
            <View style={styles.tableRow} wrap={false}>
              <View style={[styles.tableCell, { width: '88%' }]}><Text style={[styles.alignRight, { fontWeight: 'bold' }]}>TỔNG TIỀN CHIẾT KHẤU </Text></View>
              <View style={[styles.tableCell, { width: '12%', borderRightWidth: 0 }]}><Text style={[styles.alignRight, { fontWeight: 'bold' }]}>{formatCurrency(orderData.discount)}</Text></View>
            </View>
          )}
          <View style={styles.tableRow} wrap={false}>
            <View style={[styles.tableCell, { width: '88%' }]}><Text style={[styles.alignRight, { fontWeight: 'bold' }]}>TỔNG HOÁ ĐƠN </Text></View>
            <View style={[styles.tableCell, { width: '12%', borderRightWidth: 0 }]}><Text style={[styles.alignRight, { fontWeight: 'bold' }]}>{formatCurrency(orderData.totalAmount)}</Text></View>
          </View>
          <View style={styles.tableRow} wrap={false}>
            <View style={[styles.tableCell, { width: '88%' }]}><Text style={[styles.alignRight, { fontWeight: 'bold' }]}>NỢ CŨ </Text></View>
            <View style={[styles.tableCell, { width: '12%', borderRightWidth: 0 }]}><Text style={[styles.alignRight, { fontWeight: 'bold' }]}>{formatCurrency(oldDebt)}</Text></View>
          </View>
          <View style={styles.tableRow} wrap={false}>
            <View style={[styles.tableCell, { width: '88%' }]}><Text style={[styles.alignRight, { fontWeight: 'bold' }]}>THANH TOÁN </Text></View>
            <View style={[styles.tableCell, { width: '12%', borderRightWidth: 0 }]}><Text style={[styles.alignRight, { fontWeight: 'bold' }]}>{formatCurrency(orderData.paidAmount)}</Text></View>
          </View>
          <View style={[styles.tableRow, { borderBottomWidth: 0 }]} wrap={false}>
            <View style={[styles.tableCell, { width: '88%' }]}><Text style={[styles.alignRight, { fontWeight: 'bold', fontSize: 11 * scale }]}>TỔNG TIỀN PHẢI TRẢ </Text></View>
            <View style={[styles.tableCell, { width: '12%', borderRightWidth: 0 }]}><Text style={[styles.alignRight, { fontWeight: 'bold', fontSize: 11 * scale }]}>{formatCurrency(oldDebt + Number(orderData.totalAmount) - Number(orderData.paidAmount))}</Text></View>
          </View>
        </View>

        {/* TIỀN CHỮ */}
        <View style={[styles.dottedRow, { marginTop: 10 * scale }]} wrap={false}>
          <Text style={{ fontStyle: 'italic' }}>Tổng số tiền viết bằng chữ:  </Text>
          <Text style={styles.dottedFill}> </Text>
        </View>

        {/* CHỮ KÝ */}
        {showSignatures && (
          <View style={styles.signatureGrid} wrap={false}>
            <View style={styles.signatureCol}>
              <Text style={{ fontWeight: 'bold' }}>Người lập phiếu</Text>
              <Text style={{ fontStyle: 'italic', fontSize: 8 * scale, marginBottom: 25 * scale }}>(Ký, ghi rõ họ tên)</Text>
            </View>
            <View style={styles.signatureCol}>
              <Text style={{ fontWeight: 'bold' }}>Thủ kho</Text>
              <Text style={{ fontStyle: 'italic', fontSize: 8 * scale, marginBottom: 25 * scale }}>(Ký, ghi rõ họ tên)</Text>
            </View>
            <View style={styles.signatureCol}>
              <Text style={{ fontWeight: 'bold' }}>Nhân viên giao hàng</Text>
              <Text style={{ fontStyle: 'italic', fontSize: 8 * scale, marginBottom: 25 * scale }}>(Ký, ghi rõ họ tên)</Text>
            </View>
            <View style={styles.signatureCol}>
              <Text style={{ fontWeight: 'bold' }}>Người nhận hàng</Text>
              <Text style={{ fontStyle: 'italic', fontSize: 8 * scale, marginBottom: 25 * scale }}>(Ký, ghi rõ họ tên)</Text>
            </View>
          </View>
        )}

        <View wrap={false} style={{ marginTop: 10 * scale }}>
          <Text style={{ fontStyle: 'italic', fontWeight: 'bold' }}>Hotline: {companyPhone}</Text>
        </View>

      </Page>
    </Document>
  );

  return (
    <PDFViewer width="100%" height="800" style={{ border: 'none' }}>
      {DocumentComponent}
    </PDFViewer>
  );
};

export default InvoicePrintTemplate;
