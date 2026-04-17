import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Import Font hỗ trợ Tiếng Việt
Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf'
});

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 11, fontFamily: 'Roboto' },
  header: { textAlign: 'center', marginBottom: 20 },
  title: { fontSize: 18, marginBottom: 5 },
  subTitle: { fontSize: 10, color: '#555' },
  customerInfo: { marginBottom: 15 },
  row: { flexDirection: 'row', borderBottom: '1px solid #EEE', paddingVertical: 6 },
  hRow: { flexDirection: 'row', borderBottom: '1px solid #000', paddingBottom: 5, marginBottom: 5 },
  col1: { width: '45%' },
  col2: { width: '15%', textAlign: 'center' },
  col3: { width: '20%', textAlign: 'right' },
  col4: { width: '20%', textAlign: 'right' },
  totalBox: { marginTop: 15, borderTop: '1px solid #000', paddingTop: 10 },
  totalLine: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 3 },
  totalLabel: { width: '50%', textAlign: 'right', paddingRight: 10 },
  totalValue: { width: '30%', textAlign: 'right' },
  boldTxt: { fontFamily: 'Roboto' }, // In standard mode, we skip bold if not registered separately to avoid squiggly.
  footer: { marginTop: 30, textAlign: 'center', fontSize: 10, color: '#666' }
});

const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

const ReceiptPDF = ({ orderData }) => (
  <Document>
    <Page size="A5" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>CÔNG TY TNHH APPABT</Text>
        <Text style={styles.subTitle}>HÓA ĐƠN BÁN LẺ CAO CẤP (POS)</Text>
      </View>
      
      <View style={styles.customerInfo}>
        <Text>Mã đơn: {orderData?.code}</Text>
        <Text>Ngày in: {new Date().toLocaleDateString('vi-VN')}</Text>
        <Text>Khách hàng: {orderData?.customer?.name}</Text>
        <Text>SĐT: {orderData?.customer?.phone}</Text>
      </View>

      <View style={styles.hRow}>
        <Text style={styles.col1}>Tên Hàng</Text>
        <Text style={styles.col2}>SL</Text>
        <Text style={styles.col3}>Đơn giá</Text>
        <Text style={styles.col4}>Thành tiền</Text>
      </View>

      {orderData?.items?.map((it, i) => (
        <View key={i} style={styles.row}>
          <Text style={styles.col1}>{it.variant?.product?.name} ({it.variant?.sku})</Text>
          <Text style={styles.col2}>{it.quantity}</Text>
          <Text style={styles.col3}>{formatCurrency(it.price)}</Text>
          <Text style={styles.col4}>{formatCurrency(it.quantity * it.price)}</Text>
        </View>
      ))}

      <View style={styles.totalBox}>
        <View style={styles.totalLine}>
          <Text style={styles.totalLabel}>Tổng cộng:</Text>
          <Text style={styles.totalValue}>{formatCurrency(orderData?.totalAmount)}</Text>
        </View>
        <View style={styles.totalLine}>
          <Text style={styles.totalLabel}>Chiết khấu:</Text>
          <Text style={styles.totalValue}>-{formatCurrency(orderData?.discount)}</Text>
        </View>
        <View style={styles.totalLine}>
          <Text style={styles.totalLabel}>CẦN THANH TOÁN:</Text>
          <Text style={styles.totalValue}>{formatCurrency(orderData?.finalAmount)}</Text>
        </View>
        <View style={styles.totalLine}>
          <Text style={styles.totalLabel}>Khách đưa (Đã trả):</Text>
          <Text style={styles.totalValue}>{formatCurrency(orderData?.paidAmount)}</Text>
        </View>
        <View style={styles.totalLine}>
          <Text style={styles.totalLabel}>Nợ được ghi nhận:</Text>
          <Text style={styles.totalValue}>
            {formatCurrency(Math.max(0, orderData?.finalAmount - orderData?.paidAmount))}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text>Hàng mua rồi miễn đổi trả sau 7 ngày.</Text>
        <Text>Cảm ơn Quý Khách & Hẹn gặp lại!</Text>
      </View>
    </Page>
  </Document>
);

export default ReceiptPDF;
