import React, { useState, useEffect } from 'react'
import classNames from 'classnames'
import axiosClient from '../../api/axiosClient'

import {
  CAvatar,
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CProgress,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CBadge
} from '@coreui/react'
import { DownloadSimple } from '@phosphor-icons/react'

import avatar1 from 'src/assets/images/avatars/1.jpg'
import avatar2 from 'src/assets/images/avatars/2.jpg'
import avatar3 from 'src/assets/images/avatars/3.jpg'
import avatar4 from 'src/assets/images/avatars/4.jpg'
import avatar5 from 'src/assets/images/avatars/5.jpg'
import avatar6 from 'src/assets/images/avatars/6.jpg'

import WidgetsDropdown from '../widgets/WidgetsDropdown'
import MainChart from './MainChart'

const Dashboard = () => {
  const [chartTimeFilter, setChartTimeFilter] = useState('Month')

  const progressExample = [
    { title: 'Visits', value: '29.703 Users', percent: 40, color: 'success' },
    { title: 'Unique', value: '24.093 Users', percent: 20, color: 'info' },
    { title: 'Pageviews', value: '78.706 Views', percent: 60, color: 'warning' },
    { title: 'New Users', value: '22.123 Users', percent: 80, color: 'danger' },
    { title: 'Bounce Rate', value: 'Average Rate', percent: 40.15, color: 'primary' },
  ]

  const [weeklySalesData, setWeeklySalesData] = useState([])
  const [maxWeeklyRevenue, setMaxWeeklyRevenue] = useState(0)
  const [maxWeeklyOrders, setMaxWeeklyOrders] = useState(0)
  const [agentStats, setAgentStats] = useState({ new: 0, returning: 0 })
  const [topProducts, setTopProducts] = useState([])
  const [periodTotalOrders, setPeriodTotalOrders] = useState(0)
  const [periodConversionRate, setPeriodConversionRate] = useState(0)

  useEffect(() => {
    const fetchWeeklySales = async () => {
      try {
        const payload = await axiosClient.get('/dashboard/weekly-sales')
        if (payload && payload.days && Array.isArray(payload.days)) {
          setWeeklySalesData(payload.days)
          const maxRev = Math.max(...payload.days.map(d => d.revenue), 1) 
          const maxOrd = Math.max(...payload.days.map(d => d.orders), 1)
          setMaxWeeklyRevenue(maxRev)
          setMaxWeeklyOrders(maxOrd)
          
          setAgentStats({ new: payload.newAgents, returning: payload.returningAgents })
          setPeriodTotalOrders(payload.totalOrdersCount || 0)
          setPeriodConversionRate(payload.conversionRate || 0)
          setTopProducts(payload.topProducts || [])
        }
      } catch (e) {
        console.error("Failed to load weekly sales", e)
      }
    }
    fetchWeeklySales()
  }, [])

  const rawSalesData = [
    { id: 1, avatar: avatar1, name: 'Trần Văn An', orderCount: 185, totalRevenue: 650000000 },
    { id: 2, avatar: avatar2, name: 'Lê Diệu Linh', orderCount: 125, totalRevenue: 450000000 },
    { id: 3, avatar: avatar3, name: 'Phạm Tuấn Hải', orderCount: 98, totalRevenue: 210000000 },
    { id: 4, avatar: avatar4, name: 'Nguyễn Hữu Tài', orderCount: 35, totalRevenue: 80000000 },
    { id: 5, avatar: avatar5, name: 'Đào Duy Anh', orderCount: 143, totalRevenue: 520000000 },
  ]
  const salesData = [...rawSalesData].sort((a, b) => b.totalRevenue - a.totalRevenue)

  return (
    <>
      <WidgetsDropdown className="mb-4" />
      <CCard className="mb-4">
        <CCardBody>
          <CRow>
            <CCol sm={5}>
              <h4 id="traffic" className="card-title mb-0">
                Biểu Đồ Theo Dõi
              </h4>
              <div className="small text-body-secondary mb-3">Báo cáo đa chiều theo: {chartTimeFilter === 'Day' ? 'Hôm nay' : (chartTimeFilter === 'Month' ? 'Tháng này' : 'Năm nay')}</div>
              <div className="d-flex flex-wrap gap-4 small fw-bold">
                <div className="text-info d-flex align-items-center">
                  <span className="d-inline-block bg-info rounded-circle me-2" style={{ width: '10px', height: '10px' }}></span> 
                  Doanh thu
                </div>
                <div className="text-success d-flex align-items-center">
                  <span className="d-inline-block bg-success rounded-circle me-2" style={{ width: '10px', height: '10px' }}></span> 
                  Lãi gộp
                </div>
                <div className="text-danger d-flex align-items-center">
                  <span className="d-inline-block border-danger border-bottom border-2 me-2" style={{ width: '15px', borderBottomStyle: 'dashed' }}></span> 
                  Số lượng đơn xuất
                </div>
              </div>
            </CCol>
            <CCol sm={7} className="d-none d-md-block">
              <CButton color="primary" className="float-end">
                <DownloadSimple size={20} weight="bold" />
              </CButton>
              <CButtonGroup className="float-end me-3">
                {[
                  { value: 'Day', label: 'Ngày' },
                  { value: 'Month', label: 'Tháng' },
                  { value: 'Year', label: 'Năm' }
                ].map((item) => (
                  <CButton
                    color="outline-secondary"
                    key={item.value}
                    className="mx-0"
                    active={item.value === chartTimeFilter}
                    onClick={() => setChartTimeFilter(item.value)}
                  >
                    {item.label}
                  </CButton>
                ))}
              </CButtonGroup>
            </CCol>
          </CRow>
          <MainChart timeFilter={chartTimeFilter} />
        </CCardBody>
      </CCard>
      <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardHeader>Phân Tích Bán Hàng</CCardHeader>
            <CCardBody>
              <CRow>
                <CCol xs={12} md={6} xl={6}>
                  <div className="fs-5 fw-semibold mb-4">Doanh thu & Sản lượng theo ngày</div>
                  <CRow>
                    <CCol xs={6}>
                      <div className="border-start border-start-4 border-start-info py-1 px-3">
                        <div className="text-body-secondary text-truncate small">Đại lý mới</div>
                        <div className="fs-5 fw-semibold">{agentStats.new}</div>
                      </div>
                    </CCol>
                    <CCol xs={6}>
                      <div className="border-start border-start-4 border-start-danger py-1 px-3 mb-3">
                        <div className="text-body-secondary text-truncate small">
                          Đại lý quay lại
                        </div>
                        <div className="fs-5 fw-semibold">{agentStats.returning}</div>
                      </div>
                    </CCol>
                  </CRow>
                  <hr className="mt-0" />

                  <div className="d-flex justify-content-between mb-4 small">
                    <div className="text-body-secondary">
                      <span className="d-inline-block bg-info rounded-circle me-2" style={{ width: '10px', height: '10px' }}></span>
                      Doanh thu 
                      <span className="d-inline-block bg-success rounded-circle ms-3 me-2" style={{ width: '10px', height: '10px' }}></span>
                      Lãi gộp
                    </div>
                    <div className="text-body-secondary">
                      <span className="d-inline-block bg-danger rounded-circle me-2" style={{ width: '10px', height: '10px' }}></span>
                      SL hóa đơn
                    </div>
                  </div>

                  {weeklySalesData && weeklySalesData.length > 0 ? weeklySalesData.map((item, index) => {
                    const revPercent = (item.revenue / maxWeeklyRevenue) * 100
                    const proPercent = Math.max((item.profit / maxWeeklyRevenue) * 100, 0) // Ngăn thanh xanh âm
                    const ordPercent = (item.orders / maxWeeklyOrders) * 100
                    return (
                      <div className="progress-group mb-4" key={index}>
                        <div className="progress-group-prepend">
                          <span className="text-body-secondary small fw-bold">{item.title}</span>
                          <span className="text-success small fw-bold mt-1 d-block" style={{fontSize: '0.74rem'}}>
                            {item.profit >= 0 ? '+' : ''}{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(item.profit)}
                          </span>
                        </div>
                        <div className="progress-group-bars d-flex flex-column justify-content-center">
                          <div className="d-flex justify-content-between small text-body-secondary mb-1">
                            <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(item.revenue)}</span>
                            <span>{item.orders} Đơn</span>
                          </div>
                          <CProgress thin color="info" value={revPercent} />
                          <CProgress thin color="success" value={proPercent} className="mt-1" />
                          <CProgress thin color="danger" value={ordPercent} className="mt-1" />
                        </div>
                      </div>
                    )
                  }) : (
                    <div className="text-center text-muted small mt-4 pb-4">Đang tải dữ liệu thực tế 7 ngày gần nhất...</div>
                  )}
                </CCol>
                <CCol xs={12} md={6} xl={6}>
                  <div className="fs-5 fw-semibold mb-4">Top 5 Sản Phẩm Bán Chạy Nhất</div>
                  <CRow>
                    <CCol xs={6}>
                      <div className="border-start border-start-4 border-start-warning py-1 px-3 mb-3">
                        <div className="text-body-secondary text-truncate small">Tổng đơn hàng</div>
                        <div className="fs-5 fw-semibold">{periodTotalOrders}</div>
                      </div>
                    </CCol>
                    <CCol xs={6}>
                      <div className="border-start border-start-4 border-start-success py-1 px-3 mb-3">
                        <div className="text-body-secondary text-truncate small">Tỷ lệ chốt</div>
                        <div className="fs-5 fw-semibold">{periodConversionRate}%</div>
                      </div>
                    </CCol>
                  </CRow>

                  <hr className="mt-0" />

                  {topProducts.length > 0 ? topProducts.map((item, index) => (
                    <div className="progress-group mb-4" key={index}>
                      <div className="progress-group-header">
                        <span className="title fw-semibold">{item.title}</span>
                        <span className="ms-auto fw-semibold">{item.percent}% <span className="text-body-secondary small fw-normal">doanh số</span></span>
                      </div>
                      <div className="progress-group-bars">
                        <CProgress thin color={item.color} value={item.percent} />
                      </div>
                    </div>
                  )) : (
                    <div className="text-center text-muted small mt-4 pb-4">Đang tải dữ liệu sản phẩm...</div>
                  )}
                </CCol>
              </CRow>

              <br />

              <div className="fs-5 fw-semibold mb-4 text-center">Bảng Vinh Danh Nhân Viên Bán Hàng</div>
              <CTable align="middle" className="mb-0 border text-nowrap" hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell className="bg-body-tertiary text-center w-25">Xếp hạng</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">Nhân viên</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary text-center">Số đơn bán ra</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary text-end">Tổng doanh thu</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary text-center">Xếp loại</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {salesData.map((item, index) => {
                    const rank = index + 1;
                    let rankDisplay = rank;
                    if (rank === 1) rankDisplay = '🥇 1';
                    if (rank === 2) rankDisplay = '🥈 2';
                    if (rank === 3) rankDisplay = '🥉 3';

                    let badgeColor = 'warning';
                    let badgeLabel = 'Cố gắng';
                    if (item.totalRevenue >= 400000000) {
                      badgeColor = 'success';
                      badgeLabel = 'Xuất Sắc';
                    } else if (item.totalRevenue >= 200000000) {
                      badgeColor = 'primary';
                      badgeLabel = 'Đạt';
                    }

                    return (
                      <CTableRow key={item.id}>
                        <CTableDataCell className="text-center">
                          <span className={`fs-5 fw-bold ${rank <= 3 ? 'text-warning' : 'text-body-secondary'}`}>
                            {rankDisplay}
                          </span>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div className="d-flex align-items-center">
                            <CAvatar size="md" src={item.avatar} className="me-3" />
                            <div className="fw-semibold">{item.name}</div>
                          </div>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <span className="fw-bold">{item.orderCount} Đơn</span>
                        </CTableDataCell>
                        <CTableDataCell className="text-end">
                          <span className="fs-6 fw-bold text-success pe-3">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(item.totalRevenue)}
                          </span>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CBadge color={badgeColor} shape="rounded-pill" className="px-3 py-2">
                            {badgeLabel}
                          </CBadge>
                        </CTableDataCell>
                      </CTableRow>
                    )
                  })}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default Dashboard
