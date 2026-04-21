import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'

import {
  CRow,
  CCol,
  CDropdown,
  CDropdownMenu,
  CDropdownItem,
  CDropdownToggle,
  CWidgetStatsA,
  CFormSelect
} from '@coreui/react'
import { getStyle } from '@coreui/utils'
import { CChartBar, CChartLine } from '@coreui/react-chartjs'
import {
  TrendUp,
  TrendDown,
  DotsThree,
  Receipt,
  Money,
  ChartLineUp,
  HandCoins
} from '@phosphor-icons/react'
import axiosClient from '../../api/axiosClient'

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0)
}

const WidgetsDropdown = (props) => {
  const navigate = useNavigate()
  const widgetChartRef1 = useRef(null)
  const widgetChartRef2 = useRef(null)

  const [timeFilter, setTimeFilter] = useState('TODAY')
  const [stats, setStats] = useState({
    orders: { value: 0, rate: 0 },
    revenue: { value: 0, rate: 0 },
    profit: { value: 0, rate: 0 },
    expense: { value: 0, rate: 0 },
    charts: {
      labels: [],
      orders: [],
      revenue: [],
      profit: [],
      expense: []
    }
  })

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axiosClient.get(`/dashboard/summary?timeFilter=${timeFilter}`)
        if (response) {
          setStats(response)
        }
      } catch (err) {
        console.error("Lỗi get dashboard:", err)
      }
    }
    fetchDashboard()
  }, [timeFilter])

  useEffect(() => {
    document.documentElement.addEventListener('ColorSchemeChange', () => {
      if (widgetChartRef1.current) {
        setTimeout(() => {
          widgetChartRef1.current.data.datasets[0].pointBackgroundColor = getStyle('--cui-primary')
          widgetChartRef1.current.update()
        })
      }

      if (widgetChartRef2.current) {
        setTimeout(() => {
          widgetChartRef2.current.data.datasets[0].pointBackgroundColor = getStyle('--cui-info')
          widgetChartRef2.current.update()
        })
      }
    })
  }, [widgetChartRef1, widgetChartRef2])

  const handleExportCSV = (title, dataArray) => {
    if (!stats.charts?.labels || stats.charts.labels.length === 0) return

    let csvContent = `Báo cáo: ${title}\n`
    csvContent += `Lọc theo: ${timeFilter === 'TODAY' ? 'Hôm nay' : timeFilter === 'WEEK' ? 'Tuần này' : 'Tháng này'}\n\n`
    
    // Header
    csvContent += `Thời gian,Giá trị\n`
    
    let total = 0
    stats.charts.labels.forEach((label, i) => {
      const val = dataArray && dataArray[i] ? dataArray[i] : 0;
      total += Number(val)
      csvContent += `${label},${val}\n`
    })

    csvContent += `\nTỔNG CỘNG:,${total}\n`

    // Encode to Blob, add BOM for UTF-8 in Excel
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    
    link.setAttribute("href", url)
    link.setAttribute("download", `BaoCao_${title}_${Date.now()}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <>
      <div className="d-flex justify-content-end mb-3">
        <CFormSelect 
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
          style={{ width: '180px', cursor: 'pointer' }}
          className="shadow-sm border-0"
        >
          <option value="TODAY">Hôm nay</option>
          <option value="WEEK">Tuần này</option>
          <option value="MONTH">Tháng này</option>
        </CFormSelect>
      </div>
      <CRow className={props.className} xs={{ gutter: 4 }}>
        <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsA
          color="primary"
          value={
            <>
              {stats.orders.value} Đơn{' '}
              <span className="fs-6 fw-normal">
                ({stats.orders.rate > 0 ? '+' : ''}{stats.orders.rate}% {stats.orders.rate >= 0 ? <TrendUp weight="bold" /> : <TrendDown weight="bold" />})
              </span>
            </>
          }
          title={
            <div className="d-flex align-items-center pb-2">
              <Receipt size={28} weight="duotone" className="me-2" style={{opacity: 0.9}} />
              <span className="fs-6">Tổng Hoá Đơn</span>
            </div>
          }
          action={
            <CDropdown alignment="end">
              <CDropdownToggle color="transparent" caret={false} className="text-white p-0">
                <DotsThree size={24} weight="bold" />
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem onClick={() => navigate('/orders/list')} style={{ cursor: 'pointer' }}>Xem chi tiết</CDropdownItem>
                <CDropdownItem onClick={() => handleExportCSV('Tong_Hoa_Don', stats.charts?.orders)} style={{ cursor: 'pointer' }}>Xuất báo cáo</CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          }
          chart={
            <CChartLine
              ref={widgetChartRef1}
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              data={{
                labels: stats.charts?.labels?.length ? stats.charts.labels : [],
                datasets: [
                  {
                    label: 'Số đơn',
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(255,255,255,.55)',
                    pointBackgroundColor: getStyle('--cui-primary'),
                    data: stats.charts?.orders?.length ? stats.charts.orders : [0, 0, 0, 0, 0, 0, 0],
                  },
                ],
              }}
              options={{
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                maintainAspectRatio: false,
                scales: {
                  x: {
                    border: {
                      display: false,
                    },
                    grid: {
                      display: false,
                      drawBorder: false,
                    },
                    ticks: {
                      display: false,
                    },
                  },
                  y: {
                    min: 30,
                    max: 89,
                    display: false,
                    grid: {
                      display: false,
                    },
                    ticks: {
                      display: false,
                    },
                  },
                },
                elements: {
                  line: {
                    borderWidth: 1,
                    tension: 0.4,
                  },
                  point: {
                    radius: 4,
                    hitRadius: 10,
                    hoverRadius: 4,
                  },
                },
              }}
            />
          }
        />
      </CCol>
      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsA
          color="info"
          value={
            <>
              {formatCurrency(stats.revenue.value)}{' '}
              <span className="fs-6 fw-normal">
                ({stats.revenue.rate > 0 ? '+' : ''}{stats.revenue.rate}% {stats.revenue.rate >= 0 ? <TrendUp weight="bold" /> : <TrendDown weight="bold" />})
              </span>
            </>
          }
          title={
            <div className="d-flex align-items-center pb-2">
              <Money size={28} weight="duotone" className="me-2" style={{opacity: 0.9}} />
              <span className="fs-6">Tổng doanh thu</span>
            </div>
          }
          action={
            <CDropdown alignment="end">
              <CDropdownToggle color="transparent" caret={false} className="text-white p-0">
                <DotsThree size={24} weight="bold" />
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem onClick={() => navigate('/orders/list')} style={{ cursor: 'pointer' }}>Xem chi tiết</CDropdownItem>
                <CDropdownItem onClick={() => handleExportCSV('Tong_Doanh_Thu', stats.charts?.revenue)} style={{ cursor: 'pointer' }}>Xuất báo cáo</CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          }
          chart={
            <CChartLine
              ref={widgetChartRef2}
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              data={{
                labels: stats.charts?.labels?.length ? stats.charts.labels : [],
                datasets: [
                  {
                    label: 'Doanh thu',
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(255,255,255,.55)',
                    pointBackgroundColor: getStyle('--cui-info'),
                    data: stats.charts?.revenue?.length ? stats.charts.revenue : [0, 0, 0, 0, 0, 0, 0],
                  },
                ],
              }}
              options={{
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                maintainAspectRatio: false,
                scales: {
                  x: {
                    border: {
                      display: false,
                    },
                    grid: {
                      display: false,
                      drawBorder: false,
                    },
                    ticks: {
                      display: false,
                    },
                  },
                  y: {
                    min: -9,
                    max: 39,
                    display: false,
                    grid: {
                      display: false,
                    },
                    ticks: {
                      display: false,
                    },
                  },
                },
                elements: {
                  line: {
                    borderWidth: 1,
                  },
                  point: {
                    radius: 4,
                    hitRadius: 10,
                    hoverRadius: 4,
                  },
                },
              }}
            />
          }
        />
      </CCol>
      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsA
          color="warning"
          value={
            <>
              {formatCurrency(stats.profit.value)}{' '}
              <span className="fs-6 fw-normal">
                ({stats.profit.rate > 0 ? '+' : ''}{stats.profit.rate}% {stats.profit.rate >= 0 ? <TrendUp weight="bold" /> : <TrendDown weight="bold" />})
              </span>
            </>
          }
          title={
            <div className="d-flex align-items-center pb-2">
              <ChartLineUp size={28} weight="duotone" className="me-2 text-white" style={{opacity: 0.9}} />
              <span className="fs-6 text-white">Tổng Lợi Nhuận</span>
            </div>
          }
          action={
            <CDropdown alignment="end">
              <CDropdownToggle color="transparent" caret={false} className="text-white p-0">
                <DotsThree size={24} weight="bold" />
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem onClick={() => navigate('/orders/list')} style={{ cursor: 'pointer' }}>Xem chi tiết</CDropdownItem>
                <CDropdownItem onClick={() => handleExportCSV('Tong_Loi_Nhuan', stats.charts?.profit)} style={{ cursor: 'pointer' }}>Xuất báo cáo</CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          }
          chart={
            <CChartLine
              className="mt-3"
              style={{ height: '70px' }}
              data={{
                labels: stats.charts?.labels?.length ? stats.charts.labels : [],
                datasets: [
                  {
                    label: 'Lợi nhuận',
                    backgroundColor: 'rgba(255,255,255,.2)',
                    borderColor: 'rgba(255,255,255,.55)',
                    data: stats.charts?.profit?.length ? stats.charts.profit : [0, 0, 0, 0, 0, 0, 0],
                    fill: true,
                  },
                ],
              }}
              options={{
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                maintainAspectRatio: false,
                scales: {
                  x: {
                    display: false,
                  },
                  y: {
                    display: false,
                  },
                },
                elements: {
                  line: {
                    borderWidth: 2,
                    tension: 0.4,
                  },
                  point: {
                    radius: 0,
                    hitRadius: 10,
                    hoverRadius: 4,
                  },
                },
              }}
            />
          }
        />
      </CCol>
      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsA
          color="danger"
          value={
            <>
              {formatCurrency(stats.expense.value)}{' '}
              <span className="fs-6 fw-normal">
                ({stats.expense.rate > 0 ? '+' : ''}{stats.expense.rate}% {stats.expense.rate >= 0 ? <TrendUp weight="bold" /> : <TrendDown weight="bold" />})
              </span>
            </>
          }
          title={
            <div className="d-flex align-items-center pb-2">
              <HandCoins size={28} weight="duotone" className="me-2" style={{opacity: 0.9}} />
              <span className="fs-6">Tổng Chi</span>
            </div>
          }
          action={
            <CDropdown alignment="end">
              <CDropdownToggle color="transparent" caret={false} className="text-white p-0">
                <DotsThree size={24} weight="bold" />
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem onClick={() => navigate('/cashbook')} style={{ cursor: 'pointer' }}>Xem chi tiết</CDropdownItem>
                <CDropdownItem onClick={() => handleExportCSV('Tong_Chi', stats.charts?.expense)} style={{ cursor: 'pointer' }}>Xuất báo cáo</CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          }
          chart={
            <CChartBar
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              data={{
                labels: stats.charts?.labels?.length ? stats.charts.labels : [],
                datasets: [
                  {
                    label: 'Chi phí',
                    backgroundColor: 'rgba(255,255,255,.2)',
                    borderColor: 'rgba(255,255,255,.55)',
                    data: stats.charts?.expense?.length ? stats.charts.expense : [0, 0, 0, 0, 0, 0, 0],
                    barPercentage: 0.6,
                  },
                ],
              }}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  x: {
                    grid: {
                      display: false,
                      drawTicks: false,
                    },
                    ticks: {
                      display: false,
                    },
                  },
                  y: {
                    border: {
                      display: false,
                    },
                    grid: {
                      display: false,
                      drawBorder: false,
                      drawTicks: false,
                    },
                    ticks: {
                      display: false,
                    },
                  },
                },
              }}
            />
          }
        />
      </CCol>
    </CRow>
    </>
  )
}

WidgetsDropdown.propTypes = {
  className: PropTypes.string,
  withCharts: PropTypes.bool,
}

export default WidgetsDropdown
