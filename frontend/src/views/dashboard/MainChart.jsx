import React, { useEffect, useRef, useState } from 'react'

import { CChartLine } from '@coreui/react-chartjs'
import { getStyle } from '@coreui/utils'
import axiosClient from '../../api/axiosClient'

const MainChart = ({ timeFilter = 'Month' }) => {
  const chartRef = useRef(null)
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: { revenues: [], profits: [], ordersCount: [] }
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosClient.get(`/dashboard/chart?timeFilter=${timeFilter}`)
        if (res && res.labels) {
          setChartData(res)
        }
      } catch (e) {
        console.error("Lỗi get biểu đồ", e)
      }
    }
    fetchData()
  }, [timeFilter])

  useEffect(() => {
    const handleColorSchemeChange = () => {
      if (chartRef.current) {
        setTimeout(() => {
          chartRef.current.options.scales.x.grid.borderColor = getStyle(
            '--cui-border-color-translucent',
          )
          chartRef.current.options.scales.x.grid.color = getStyle('--cui-border-color-translucent')
          chartRef.current.options.scales.x.ticks.color = getStyle('--cui-body-color')
          chartRef.current.options.scales.y.grid.borderColor = getStyle(
            '--cui-border-color-translucent',
          )
          chartRef.current.options.scales.y.grid.color = getStyle('--cui-border-color-translucent')
          chartRef.current.options.scales.y.ticks.color = getStyle('--cui-body-color')
          chartRef.current.update()
        })
      }
    }

    document.documentElement.addEventListener('ColorSchemeChange', handleColorSchemeChange)
    return () =>
      document.documentElement.removeEventListener('ColorSchemeChange', handleColorSchemeChange)
  }, [chartRef])

  const random = (min = 0, max = 100) => Math.floor(Math.random() * (max - min + 1)) + min

  return (
    <>
      <CChartLine
        ref={chartRef}
        style={{ height: '300px', marginTop: '40px' }}
        data={{
          labels: chartData.labels,
          datasets: [
            {
              label: 'Doanh thu (VNĐ)',
              backgroundColor: `rgba(${getStyle('--cui-info-rgb')}, .1)`,
              borderColor: getStyle('--cui-info'),
              pointHoverBackgroundColor: getStyle('--cui-info'),
              borderWidth: 2,
              data: chartData.datasets.revenues,
              fill: true,
              yAxisID: 'y',
            },
            {
              label: 'Lợi nhuận (VNĐ)',
              backgroundColor: 'transparent',
              borderColor: getStyle('--cui-success'),
              pointHoverBackgroundColor: getStyle('--cui-success'),
              borderWidth: 2,
              data: chartData.datasets.profits,
              yAxisID: 'y',
            },
            {
              label: 'Lượng đơn',
              backgroundColor: 'transparent',
              borderColor: getStyle('--cui-danger'),
              pointHoverBackgroundColor: getStyle('--cui-danger'),
              borderWidth: 2,
              borderDash: [8, 5],
              data: chartData.datasets.ordersCount,
              yAxisID: 'y1',
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
                color: getStyle('--cui-border-color-translucent'),
                drawOnChartArea: false,
              },
              ticks: {
                color: getStyle('--cui-body-color'),
              },
            },
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              beginAtZero: true,
              border: {
                color: getStyle('--cui-border-color-translucent'),
              },
              grid: {
                color: getStyle('--cui-border-color-translucent'),
              },
              ticks: {
                color: getStyle('--cui-body-color'),
                callback: function(value) {
                  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);
                }
              },
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              beginAtZero: true,
              grid: {
                drawOnChartArea: false, // Không vẽ đè lưới lên y1 để tránh rối mắt
              },
              ticks: {
                color: getStyle('--cui-danger'),
                stepSize: 1,
                callback: function(value) {
                  if (Math.floor(value) === value) {
                    return value + ' Đơn';
                  }
                }
              },
            },
          },
          elements: {
            line: {
              tension: 0.4,
            },
            point: {
              radius: 0,
              hitRadius: 10,
              hoverRadius: 4,
              hoverBorderWidth: 3,
            },
          },
        }}
      />
    </>
  )
}

export default MainChart
