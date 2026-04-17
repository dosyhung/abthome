import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'

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
  const widgetChartRef1 = useRef(null)
  const widgetChartRef2 = useRef(null)

  const [timeFilter, setTimeFilter] = useState('TODAY')
  const [stats, setStats] = useState({
    orders: { value: 0, rate: 0 },
    revenue: { value: 0, rate: 0 },
    profit: { value: 0, rate: 0 },
    expense: { value: 0, rate: 0 }
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
                <CDropdownItem>Xem chi tiết</CDropdownItem>
                <CDropdownItem>Xuất báo cáo</CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          }
          chart={
            <CChartLine
              ref={widgetChartRef1}
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              data={{
                labels: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'],
                datasets: [
                  {
                    label: 'Số đơn',
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(255,255,255,.55)',
                    pointBackgroundColor: getStyle('--cui-primary'),
                    data: [65, 59, 84, 84, 51, 55, 40],
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
                <CDropdownItem>Xem chi tiết</CDropdownItem>
                <CDropdownItem>Xuất báo cáo</CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          }
          chart={
            <CChartLine
              ref={widgetChartRef2}
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              data={{
                labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7'],
                datasets: [
                  {
                    label: 'Doanh thu',
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(255,255,255,.55)',
                    pointBackgroundColor: getStyle('--cui-info'),
                    data: [1, 18, 9, 17, 34, 22, 11],
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
                <CDropdownItem>Xem chi tiết</CDropdownItem>
                <CDropdownItem>Xuất báo cáo</CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          }
          chart={
            <CChartLine
              className="mt-3"
              style={{ height: '70px' }}
              data={{
                labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7'],
                datasets: [
                  {
                    label: 'Lợi nhuận',
                    backgroundColor: 'rgba(255,255,255,.2)',
                    borderColor: 'rgba(255,255,255,.55)',
                    data: [78, 81, 80, 45, 34, 12, 40],
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
                <CDropdownItem>Xem chi tiết</CDropdownItem>
                <CDropdownItem>Xuất báo cáo</CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          }
          chart={
            <CChartBar
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              data={{
                labels: [
                  'T1',
                  'T2',
                  'T3',
                  'T4',
                  'T5',
                  'T6',
                  'T7',
                  'T8',
                  'T9',
                  'T10',
                  'T11',
                  'T12',
                  'T1 năm sau',
                  'T2 năm sau',
                  'T3 năm sau',
                  'T4 năm sau',
                ],
                datasets: [
                  {
                    label: 'Chi phí',
                    backgroundColor: 'rgba(255,255,255,.2)',
                    borderColor: 'rgba(255,255,255,.55)',
                    data: [78, 81, 80, 45, 34, 12, 40, 85, 65, 23, 12, 98, 34, 84, 67, 82],
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
