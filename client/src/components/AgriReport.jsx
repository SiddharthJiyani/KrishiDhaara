import React, { useRef, useState, useEffect } from 'react';
import { usePDF } from 'react-to-pdf';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BarChart, DoughnutChart, ForecastChart } from './charts';
import axios from 'axios';

const AgriReport = ({ onReportGenerated }) => {
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [months, setMonths] = useState(6);
  
  const { toPDF, targetRef } = usePDF({
    filename: 'kisan-agricultural-report.pdf',
    page: {
      margin: 15,
      format: 'a4',
      orientation: 'portrait',
    },
    canvas: {
      mimeType: 'image/png',
      qualityRatio: 1,
    },
    pdf: {
      compress: true,
      userPassword: '',
      pdfVersion: '1.7',
    },
    overrides: {
      pdf: {
        compress: true,
      },
      canvas: {
        useCORS: true,
        scale: 3,
      },
    },
  });

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setFetchingData(true);
        // Fetch data based on selected months
        const response = await axios.get(`http://localhost:3000/report/getReport?month=${months}`);
        if (response.data.success) {
          setReportData(response.data.message);
        } else {
          throw new Error('Failed to fetch report data');
        }
      } catch (err) {
        console.error('Error fetching report data:', err);
        setError(err.message || 'An error occurred while fetching data');
      } finally {
        setFetchingData(false);
      }
    };

    fetchReportData();
  }, [months]); // Add months as a dependency to trigger API call when changed

  const handleMonthChange = (e) => {
    const newMonths = parseInt(e.target.value);
    setMonths(newMonths);
    // The useEffect will automatically trigger the API call with the new month value
  };

  if (fetchingData) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div style={{ fontSize: '24px', marginBottom: '20px' }}>Loading Kisan Agricultural Report...</div>
        <div style={{ color: '#4CAF50', fontSize: '20px' }}>🌾 Please wait 🌾</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        color: '#FF5252'
      }}>
        <div style={{ fontSize: '24px', marginBottom: '20px' }}>Error Loading Report</div>
        <div>{error}</div>
        <button
          onClick={() => window.location.reload()}
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            marginTop: '20px'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!reportData) {
    return null;
  }

  // Get the most recent month's temperature and humidity data
  const tempData = reportData.report.temperature.analytics[reportData.report.temperature.analytics.length - 1];
  const humidityData = reportData.report.humidity.analytics[reportData.report.humidity.analytics.length - 1];

  const plantHealthData = [
    {
      label: 'Healthy',
      value: (reportData.plantHealth.diseaseStats.healthy_count / reportData.plantHealth.diseaseStats.total_count) * 100,
      color: '#4CAF50',
    },
    {
      label: 'Unhealthy',
      value: (reportData.plantHealth.diseaseStats.unhealthy_count / reportData.plantHealth.diseaseStats.total_count) * 100,
      color: '#FF5252',
    },
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getIndianSeason = (dateString) => {
    const monthNum = new Date(dateString).getMonth();
    if (monthNum >= 2 && monthNum <= 5) return 'Grishma (Summer)';
    if (monthNum >= 6 && monthNum <= 9) return 'Varsha (Monsoon)';
    return 'Shishira (Winter)';
  };

  const currentSeason = getIndianSeason(reportData.report.dateRange.end);

  // Generate dummy forecast data if not provided by API
  const generateDummyForecast = () => {
    const today = new Date();
    const forecast = [];
    
    for (let i = 0; i < 6; i++) {
      const forecastTime = new Date(today);
      forecastTime.setHours(today.getHours() + (i * 4));
      
      forecast.push({
        humidity: 55 + (Math.random() * 5),
        temperature: 26 + (Math.random() * 2),
        timestamp: forecastTime.toISOString()
      });
    }
    
    return forecast;
  };

  // Use forecast data if available, otherwise use dummy data
  const forecastData = reportData.forecast?.soil || generateDummyForecast();

  const customComponents = {
    h1: ({ node, ...props }) => (
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '16px 0' }} {...props} />
    ),
    h2: ({ node, ...props }) => (
      <h2 style={{ fontSize: '20px', fontWeight: 'semibold', margin: '12px 0' }} {...props} />
    ),
    h3: ({ node, ...props }) => (
      <h3 style={{ fontSize: '18px', fontWeight: 'medium', margin: '10px 0', color: '#138808' }} {...props} />
    ),
    h4: ({ node, ...props }) => (
      <h4 style={{ fontSize: '16px', fontWeight: 'medium', margin: '8px 0' }} {...props} />
    ),
    p: ({ node, ...props }) => <p style={{ margin: '8px 0', lineHeight: '1.6' }} {...props} />,
    li: ({ node, ...props }) => <li style={{ marginLeft: '24px', listStyle: 'disc', marginBottom: '8px' }} {...props} />,
    code: ({ node, inline, className, children, ...props }) => {
      if (inline) {
        return (
          <code style={{ backgroundColor: '#f1f1f1', padding: '0 4px', borderRadius: '4px' }}>
            {children}
          </code>
        );
      }
      return (
        <pre style={{ backgroundColor: '#333', color: 'white', padding: '16px', borderRadius: '4px', overflow: 'auto', margin: '8px 0' }}>
          <code {...props}>{children}</code>
        </pre>
      );
    },
    blockquote: ({ node, ...props }) => (
      <blockquote
        style={{ borderLeft: '4px solid #ccc', paddingLeft: '16px', fontStyle: 'italic', margin: '8px 0' }}
        {...props}
      />
    ),
  };

  return (
    <div>
      {/* Controls container for both select and download button */}
      <div style={{ 
        position: 'fixed', 
        bottom: '20px', 
        right: '20px', 
        zIndex: 1000, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '10px',
        alignItems: 'flex-end'
      }}>
        {/* Months select dropdown */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          backgroundColor: 'white',
          padding: '8px 12px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.15)'
        }}>
          <label htmlFor="months" style={{ 
            fontSize: '16px', 
            marginRight: '10px', 
            fontWeight: '500',
            color: '#333'
          }}>Report Period:</label>
          <select
            id="months"
            value={months}
            onChange={handleMonthChange}
            style={{
              backgroundColor: '#4CAF50',
              color: 'white',
              padding: '8px 12px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '500',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              appearance: 'none',
              backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 10px top 50%',
              backgroundSize: '12px auto',
              paddingRight: '28px'
            }}
          >
            <option value={3}>3 Months</option>
            <option value={6}>6 Months</option>
            <option value={12}>12 Months</option>
          </select>
        </div>
        
        {/* Download button */}
        <button
          onClick={() => {
            setLoading(true);
            toPDF();
            setTimeout(() => {
              setLoading(false);
              onReportGenerated();
            }, 2000); // Simulate loading time
          }}
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            padding: '12px 20px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500',
            boxShadow: '0 4px 10px rgba(76, 175, 80, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            minWidth: '240px'
          }}
          disabled={loading}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#3e8e41'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
        >
          {loading ? 'Generating Report...' : 'Download Kisan Report (PDF)'}
        </button>
      </div>

      <div
        ref={targetRef}
        style={{
          padding: '20px',
          width: '100%',
          maxWidth: '1000px',
          margin: '0 auto',
          backgroundColor: '#fff',
          color: '#333',
          fontFamily: 'Arial, sans-serif',
          boxSizing: 'border-box',
        }}
      >
        {/* Header with Report Title */}
        <div style={{
          textAlign: 'center',
          marginBottom: '30px',
          background: 'linear-gradient(to right, #e7f5e7, #ffffff)',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(76, 175, 80, 0.2)',
          pageBreakAfter: 'avoid',
        }}>
          <div style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#000080',
            marginBottom: '10px',
          }}>
            किसान कृषि स्वास्थ्य रिपोर्ट
          </div>
          <div style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#000080',
            marginBottom: '10px',
          }}>
            Kisan Agricultural Health Report
          </div>
          <div style={{ fontSize: '16px', color: '#555' }}>
            Reporting Period: {formatDate(reportData.report.dateRange.start)} to {formatDate(reportData.report.dateRange.end)}
          </div>
          <div style={{ fontSize: '16px', color: '#555', marginTop: '5px' }}>
            Season: {currentSeason}
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '20px',
            color: '#138808',
            fontSize: '20px',
          }}>
            <span style={{ margin: '0 10px' }}>🌾</span>
            <span style={{ margin: '0 10px' }}>🍚</span>
            <span style={{ margin: '0 10px' }}>🌿</span>
            <span style={{ margin: '0 10px' }}>🌶️</span>
          </div>
        </div>

        {/* Key Metrics Section */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '40px',
          flexWrap: 'wrap',
          pageBreakAfter: 'avoid',
        }}>
          <div style={{
            flex: '1 1 30%',
            minWidth: '200px',
            margin: '10px',
            padding: '20px',
            borderRadius: '8px',
            backgroundColor: '#FFF7E0',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '16px', color: '#FF9933', fontWeight: 'bold' }}>Average Temperature</div>
            <div style={{ fontSize: '28px', marginTop: '10px', color: '#FF9933' }}>{tempData.avgTemperature.toFixed(1)}°C</div>
            <div style={{ fontSize: '14px', marginTop: '5px', color: '#555' }}>
              Range: {tempData.minTemperature.toFixed(1)}°C - {tempData.maxTemperature.toFixed(1)}°C
            </div>
          </div>

          <div style={{
            flex: '1 1 30%',
            minWidth: '200px',
            margin: '10px',
            padding: '20px',
            borderRadius: '8px',
            backgroundColor: '#E3F2FD',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '16px', color: '#2196F3', fontWeight: 'bold' }}>Average Humidity</div>
            <div style={{ fontSize: '28px', marginTop: '10px', color: '#2196F3' }}>{humidityData.avgHumidity.toFixed(1)}%</div>
            <div style={{ fontSize: '14px', marginTop: '5px', color: '#555' }}>
              Range: {humidityData.minHumidity.toFixed(1)}% - {humidityData.maxHumidity.toFixed(1)}%
            </div>
          </div>

          <div style={{
            flex: '1 1 30%',
            minWidth: '200px',
            margin: '10px',
            padding: '20px',
            borderRadius: '8px',
            backgroundColor: '#E8F5E9',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '16px', color: '#138808', fontWeight: 'bold' }}>Plant Health</div>
            <div style={{ fontSize: '28px', marginTop: '10px', color: '#138808' }}>
              {Math.round((reportData.plantHealth.diseaseStats.healthy_count / reportData.plantHealth.diseaseStats.total_count) * 100)}%
            </div>
            <div style={{ fontSize: '14px', marginTop: '5px', color: '#555' }}>
              {reportData.plantHealth.diseaseStats.healthy_count} of {reportData.plantHealth.diseaseStats.total_count} plants healthy
            </div>
          </div>
        </div>

        {/* Temperature and Humidity Tables Section */}
        <div style={{
          marginBottom: '40px',
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          pageBreakAfter: 'avoid',
        }}>
          <h2 style={{
            fontSize: '20px',
            color: '#000080',
            marginBottom: '20px',
            borderBottom: '2px solid #e0e0e0',
            paddingBottom: '10px',
          }}>
            Temperature & Humidity Data
          </h2>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ flex: '1 1 45%', minWidth: '280px' }}>
              <h3 style={{ fontSize: '18px', color: '#FF9933', marginBottom: '10px' }}>Temperature Analysis</h3>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                marginBottom: '20px',
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#FFF7E0' }}>
                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Metric</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Value (°C)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>Average Temperature</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{tempData.avgTemperature.toFixed(1)}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>Minimum Temperature</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{tempData.minTemperature.toFixed(1)}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>Maximum Temperature</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{tempData.maxTemperature.toFixed(1)}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>Temperature Range</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{(tempData.maxTemperature - tempData.minTemperature).toFixed(1)}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>Number of Readings</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{tempData.totalDocuments}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ flex: '1 1 45%', minWidth: '280px' }}>
              <h3 style={{ fontSize: '18px', color: '#2196F3', marginBottom: '10px' }}>Humidity Analysis</h3>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#E3F2FD' }}>
                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Metric</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Value (%)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>Average Humidity</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{humidityData.avgHumidity.toFixed(1)}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>Minimum Humidity</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{humidityData.minHumidity.toFixed(1)}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>Maximum Humidity</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{humidityData.maxHumidity.toFixed(1)}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>Humidity Range</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{(humidityData.maxHumidity - humidityData.minHumidity).toFixed(1)}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>Number of Readings</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{humidityData.totalDocuments}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Water Usage Section */}
        <div style={{
          marginBottom: '40px',
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          pageBreakAfter: 'avoid',
        }}>
          <h2 style={{
            fontSize: '20px',
            color: '#000080',
            marginBottom: '20px',
            borderBottom: '2px solid #e0e0e0',
            paddingBottom: '10px',
          }}>
            Monthly Water Usage (Liters per Hectare)
          </h2>

          <div style={{ marginBottom: '20px', overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'center',
              marginBottom: '20px',
              tableLayout: 'fixed',
            }}>
              <thead>
                <tr style={{ backgroundColor: '#E3F2FD' }}>
                  {reportData.waterUsage.slice(0, 11).map((item) => (
                    <th key={item.month} style={{ padding: '10px', border: '1px solid #ddd', width: '16.66%' }}>{item.month}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {reportData.waterUsage.slice(0, 11).map((item) => (
                    <td key={item.month} style={{ padding: '10px', border: '1px solid #ddd' }}>
                      {Math.round(item.value)} L
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ height: '300px' }}>
            <BarChart data={reportData.waterUsage.slice(0, 11).map((item) => ({
              month: item.month,
              value: Math.round(item.value),
            }))} />
          </div>
        </div>

        {/* Plant Health Section */}
        <div style={{
          marginBottom: '40px',
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          pageBreakAfter: 'avoid',
        }}>
          <h2 style={{
            fontSize: '20px',
            color: '#000080',
            marginBottom: '20px',
            borderBottom: '2px solid #e0e0e0',
            paddingBottom: '10px',
          }}>
            Plant Health Analysis
          </h2>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ flex: '1 1 45%', minWidth: '280px' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                marginBottom: '20px',
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#E8F5E9' }}>
                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Plant Status</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Count</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>Healthy Plants</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{reportData.plantHealth.diseaseStats.healthy_count}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                      {Math.round((reportData.plantHealth.diseaseStats.healthy_count / reportData.plantHealth.diseaseStats.total_count) * 100)}%
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>Unhealthy Plants</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{reportData.plantHealth.diseaseStats.unhealthy_count}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                      {Math.round((reportData.plantHealth.diseaseStats.unhealthy_count / reportData.plantHealth.diseaseStats.total_count) * 100)}%
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' }}>Total Plants</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' }}>{reportData.plantHealth.diseaseStats.total_count}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' }}>100%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ flex: '1 1 45%', minWidth: '280px' }}>
              <div style={{ height: '300px' }}>
                <DoughnutChart data={plantHealthData} />
              </div>
            </div>
          </div>
        </div>

        {/* Soil Forecast Section */}
        <div style={{
          marginBottom: '40px',
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          pageBreakAfter: 'avoid',
        }}>
          <h2 style={{
            fontSize: '20px',
            color: '#000080',
            marginBottom: '20px',
            borderBottom: '2px solid #e0e0e0',
            paddingBottom: '10px',
          }}>
            24-Hour Soil Forecast
          </h2>

          <div style={{ marginBottom: '20px' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              marginBottom: '20px',
            }}>
              <thead>
                <tr style={{ backgroundColor: '#FFF7E0' }}>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Date</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Time</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Temperature (°C)</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Humidity (%)</th>
                </tr>
              </thead>
              <tbody>
                {forecastData.map((reading, index) => (
                  <tr key={index}>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{formatDate(reading.timestamp)}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{formatTime(reading.timestamp)}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{reading.temperature.toFixed(1)}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{reading.humidity.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ height: '300px' }}>
            <ForecastChart data={forecastData} />
          </div>
        </div>

        {/* Insights Section */}
        <div style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '40px',
          pageBreakBefore: 'always',
        }}>
          <h2 style={{
            fontSize: '20px',
            color: '#000080',
            marginBottom: '20px',
            borderBottom: '2px solid #e0e0e0',
            paddingBottom: '10px',
          }}>
            Agricultural Insights for Indian Conditions
          </h2>

          <div style={{ fontSize: '16px', overflowWrap: 'break-word' }}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={customComponents}
            >
              {reportData.insights}
            </ReactMarkdown>

            <h3 style={{ fontSize: '18px', color: '#138808', marginTop: '20px' }}>Crop-Specific Recommendations</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                marginTop: '15px',
                marginBottom: '20px',
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#E8F5E9' }}>
                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Crop Type</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Irrigation Recommendation</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Heat Management</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>Rice (Paddy)</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>Maintain 5cm standing water during critical growth stages</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>Consider SRI method to reduce water usage while managing temperature</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>Wheat</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>5-6 irrigations at critical stages, especially during grain filling</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>Early sowing to avoid terminal heat stress</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>Vegetables</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>Drip irrigation with mulching</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>Use shade nets during peak heat hours</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>Pulses (Dal)</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>Light but frequent irrigation</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>Intercropping with taller crops for partial shade</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Seasonal Recommendations Section */}
        <div style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '40px',
        }}>
          <h2 style={{
            fontSize: '20px',
            color: '#000080',
            marginBottom: '20px',
            borderBottom: '2px solid #e0e0e0',
            paddingBottom: '10px',
          }}>
            Seasonal Patterns & Recommendations for Indian Agriculture
          </h2>

          <div style={{ fontSize: '16px', overflowWrap: 'break-word' }}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={customComponents}
            >
              {`
${currentSeason === 'Grishma (Summer)'
  ? 'Summer (Grishma) is typically characterized by high temperatures and low rainfall across most of India. While this presents challenges for water management, it\'s ideal for crops like cotton, maize, and some vegetables with proper irrigation.'
  : currentSeason === 'Varsha (Monsoon)'
  ? 'The monsoon (Varsha) season is critical for Indian agriculture with about 70% of annual rainfall occurring during this period. This is the primary growing season for kharif crops like rice, millets, maize, cotton, and various pulses.'
  : 'Winter (Shishira) provides excellent growing conditions for rabi crops like wheat, barley, mustard, and various pulses and vegetables. The moderate temperatures support robust plant growth with less water requirements.'}

### Recommendations for ${currentSeason}
`}
            </ReactMarkdown>

            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                marginTop: '15px',
                marginBottom: '20px',
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#E8F5E9' }}>
                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Practice</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Recommendation</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSeason === 'Grishma (Summer)' ? (
                    <>
                      <tr>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>Water Conservation</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>Implement micro-irrigation techniques like drip and sprinkler systems</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>Soil Management</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>Use organic mulch to reduce soil temperature and water evaporation</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>Crop Selection</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>Opt for heat-tolerant varieties like indigenous cotton, okra, and cluster beans</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>Shade Management</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>Consider temporary shade structures for sensitive vegetables</td>
                      </tr>
                    </>
                  ) : currentSeason === 'Varsha (Monsoon)' ? (
                    <>
                      <tr>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>Water Management</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>Implement proper drainage systems to prevent waterlogging</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>Disease Prevention</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>Apply preventive measures against fungal diseases common during high humidity</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>Soil Conservation</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>Use contour farming techniques to prevent soil erosion during heavy rains</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>Crop Selection</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>Focus on traditional kharif crops like paddy, jowar, bajra, and turmeric</td>
                      </tr>
                    </>
                  ) : (
                    <>
                      <tr>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>Irrigation Schedule</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>Schedule irrigation based on critical growth stages of rabi crops</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>Frost Protection</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>Prepare for possible frost protection for sensitive crops in northern regions</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>Nutrient Management</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>Apply balanced fertilizers according to soil test recommendations</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>Crop Selection</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>Ideal for wheat, mustard, chickpea, and winter vegetables</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>

            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={customComponents}
            >
              {`
### Government Scheme Connections

Indian farmers can leverage various government initiatives to improve farm performance:

* **PM Kisan Samman Nidhi:** Direct income support can help invest in quality seeds and irrigation equipment
* **Pradhan Mantri Krishi Sinchayee Yojana (PMKSY):** Support for micro-irrigation systems like drip and sprinkler
* **Soil Health Card Scheme:** Regular soil testing for optimized fertilizer application
* **Kisan Credit Card:** Access to timely credit for seasonal agricultural operations
`}
            </ReactMarkdown>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          borderTop: '1px solid #e0e0e0',
          paddingTop: '20px',
          fontSize: '14px',
          color: '#777',
        }}>
          <p>Report generated on {new Date().toLocaleDateString('en-IN')}</p>
          <p>Report period: {reportData.meta.reportPeriod}</p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '10px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              color: '#138808',
            }}>
              <span style={{ margin: '0 5px' }}>🌾</span>
              <span>जय किसान - Jai Kisan</span>
              <span style={{ margin: '0 5px' }}>🌾</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgriReport;