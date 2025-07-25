import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';

// Modern Performance Chart using ApexCharts
export const ModernPerformanceChart = ({ 
  data, 
  type = 'line', 
  color = '#3b82f6',
  title = '',
  yAxisLabel = '',
  height = 300,
  showGrid = true,
  showPoints = true,
  gradient = true
}) => {
  const chartOptions = useMemo(() => {
    const baseOptions = {
      chart: {
        type: type,
        height: height,
        toolbar: {
          show: false
        },
        background: 'transparent',
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
          animateGradually: {
            enabled: true,
            delay: 150
          },
          dynamicAnimation: {
            enabled: true,
            speed: 350
          }
        },
        zoom: {
          enabled: false
        },
        selection: {
          enabled: false
        }
      },
      colors: [color],
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth',
        width: 3,
        lineCap: 'round'
      },
      grid: {
        show: showGrid,
        borderColor: '#f1f5f9',
        strokeDashArray: 3,
        position: 'back',
        xaxis: {
          lines: {
            show: false
          }
        },
        yaxis: {
          lines: {
            show: true
          }
        },
        row: {
          colors: undefined,
          opacity: 0.5
        },
        column: {
          colors: undefined,
          opacity: 0.5
        },
        padding: {
          top: 10,
          right: 10,
          bottom: 10,
          left: 10
        }
      },
      xaxis: {
        type: 'datetime',
        labels: {
          style: {
            colors: '#64748b',
            fontSize: '12px',
            fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
            fontWeight: 500
          },
          format: 'MMM dd'
        },
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        },
        tooltip: {
          enabled: false
        }
      },
      yaxis: {
        title: {
          text: yAxisLabel,
          style: {
            color: '#64748b',
            fontSize: '12px',
            fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
            fontWeight: 600
          }
        },
        labels: {
          style: {
            colors: '#64748b',
            fontSize: '12px',
            fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
            fontWeight: 500
          },
          formatter: (value) => {
            if (yAxisLabel.toLowerCase().includes('response')) {
              return `${Math.round(value)}ms`;
            } else if (yAxisLabel.toLowerCase().includes('rate')) {
              return `${value.toFixed(1)}%`;
            }
            return Math.round(value).toLocaleString();
          }
        }
      },
      markers: {
        show: showPoints,
        size: 4,
        colors: [color],
        strokeColors: '#ffffff',
        strokeWidth: 2,
        fillOpacity: 1,
        strokeOpacity: 0.9,
        hover: {
          size: 6,
          sizeOffset: 2
        }
      },
      tooltip: {
        enabled: true,
        shared: true,
        intersect: false,
        style: {
          fontSize: '12px',
          fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif'
        },
        custom: function({ series, seriesIndex, dataPointIndex, w }) {
          // Get the timestamp from the data point
          const timestamp = w.globals.seriesX[seriesIndex][dataPointIndex];
          const date = new Date(timestamp);
          const formattedDate = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
          });
          const value = series[seriesIndex][dataPointIndex];
          
          let formattedValue = value;
          if (yAxisLabel.toLowerCase().includes('response')) {
            formattedValue = `${Math.round(value)}ms`;
          } else if (yAxisLabel.toLowerCase().includes('rate')) {
            formattedValue = `${value.toFixed(1)}%`;
          } else {
            formattedValue = Math.round(value).toLocaleString();
          }
          
          return `
            <div class="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
              <div class="text-xs text-gray-500 mb-1">${formattedDate}</div>
              <div class="text-sm font-semibold text-gray-900">${formattedValue}</div>
            </div>
          `;
        }
      },
      theme: {
        mode: 'light'
      },
      responsive: [{
        breakpoint: 640,
        options: {
          chart: {
            height: 250
          },
          xaxis: {
            labels: {
              style: {
                fontSize: '10px'
              }
            }
          },
          yaxis: {
            labels: {
              style: {
                fontSize: '10px'
              }
            }
          }
        }
      }]
    };

    // Add gradient fill if enabled
    if (gradient) {
      baseOptions.fill = {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'vertical',
          shadeIntensity: 0.25,
          gradientToColors: [color + '20'],
          inverseColors: false,
          opacityFrom: 0.7,
          opacityTo: 0.1,
          stops: [0, 100]
        }
      };
    }

    return baseOptions;
  }, [color, height, showGrid, showPoints, gradient, yAxisLabel, type]);

  const series = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return [{
      name: title,
      data: data.map(item => ({
        x: new Date(item.label).getTime(),
        y: item.value
      }))
    }];
  }, [data, title]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3 mx-auto">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-900 mb-1">No data available</p>
          <p className="text-xs text-gray-500">Chart data will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <Chart
        options={chartOptions}
        series={series}
        type={type}
        height={height}
      />
    </div>
  );
};

export default ModernPerformanceChart; 