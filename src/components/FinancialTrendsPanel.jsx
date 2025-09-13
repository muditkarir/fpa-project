import React, { useState, useEffect } from 'react';

const FinancialTrendsPanel = ({ cik = '0000796343' }) => {
  const [financialData, setFinancialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/edgar/financials?cik=${cik}&freq=quarterly`);
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch financial data');
        }
        
        setFinancialData(result);
      } catch (err) {
        console.error('Financial data fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialData();
  }, [cik]);

  const formatCurrency = (value, compact = true) => {
    if (!value) return 'N/A';
    const absValue = Math.abs(value);
    
    if (compact) {
      if (absValue >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
      if (absValue >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
      if (absValue >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: '2-digit', month: 'short' });
    } catch {
      return dateString;
    }
  };

  const formatPercent = (value) => {
    if (value == null) return 'N/A';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  // Simple SVG mini-chart component
  const MiniChart = ({ data, title, color = '#ff6f3c', height = 60, width = 200, showTTM = false }) => {
    if (!data || data.length < 2) {
      return (
        <div className="mini-chart">
          <h5>{title}</h5>
          <div className="chart-placeholder">Insufficient data</div>
        </div>
      );
    }

    // Take last 8 quarters and reverse for chronological order
    const chartData = data.slice(0, 8).reverse();
    const values = chartData.map(d => d.value || 0);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;

    // Generate SVG path
    const points = chartData.map((d, i) => {
      const x = (i / (chartData.length - 1)) * width;
      const y = height - ((d.value - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    const currentValue = data[0]?.value || 0;
    const ttmValue = financialData?.data?.calculations?.cashFromOperations?.ttm?.[0]?.ttmValue;

    return (
      <div className="mini-chart">
        <div className="chart-header">
          <h5>{title}</h5>
          <span className="current-value">{formatCurrency(currentValue)}</span>
          {showTTM && ttmValue && (
            <span className="ttm-chip">TTM: {formatCurrency(ttmValue)}</span>
          )}
        </div>
        <svg width={width} height={height} className="chart-svg">
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* Data points */}
          {chartData.map((d, i) => {
            const x = (i / (chartData.length - 1)) * width;
            const y = height - ((d.value - min) / range) * height;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="2"
                fill={color}
              />
            );
          })}
        </svg>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="financial-trends-panel">
        <h4>📈 Trends from Filings</h4>
        <div className="trends-loading">
          <p>Loading financial data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="financial-trends-panel">
        <h4>📈 Trends from Filings</h4>
        <div className="trends-error">
          <p>⚠️ Unable to load financial trends: {error}</p>
          <p><em>Please check back later for updated data.</em></p>
        </div>
      </div>
    );
  }

  if (!financialData?.data) {
    return (
      <div className="financial-trends-panel">
        <h4>📈 Trends from Filings</h4>
        <div className="trends-error">
          <p>No financial data available for this company.</p>
        </div>
      </div>
    );
  }

  const { revenue, operatingExpenses, rd, sga, cashFromOperations, calculations } = financialData.data;
  const entityName = financialData.entityName;

  // Prepare table data (last 8 quarters)
  const tableData = [];
  const maxLength = Math.max(revenue.length, operatingExpenses.length, cashFromOperations.length);
  
  for (let i = 0; i < Math.min(8, maxLength); i++) {
    const revenueItem = revenue[i];
    const expenseItem = operatingExpenses[i];
    const cashItem = cashFromOperations[i];
    const yoyItem = calculations?.revenue?.yoy?.find(y => y.endDate === revenueItem?.endDate);
    
    if (revenueItem) {
      tableData.push({
        endDate: revenueItem.endDate,
        revenue: revenueItem.value,
        opex: expenseItem?.value,
        opcf: cashItem?.value,
        yoy: yoyItem?.yoyGrowthPercent
      });
    }
  }

  return (
    <div className="financial-trends-panel">
      <h4>📈 Trends from Filings</h4>
      <p className="entity-name">{entityName} - Quarterly Data</p>
      
      {/* Mini Charts */}
      <div className="mini-charts-grid">
        <MiniChart 
          data={revenue} 
          title="Revenue (Quarterly)" 
          color="#ff6f3c" 
        />
        <div className="expenses-chart-wrapper">
          <MiniChart 
            data={operatingExpenses} 
            title="Operating Expenses" 
            color="#dc3545" 
          />
          {(rd.length > 0 || sga.length > 0) && (
            <div className="expense-badges">
              {rd.length > 0 && (
                <span className="expense-badge rd">
                  R&D: {formatCurrency(rd[0]?.value)}
                </span>
              )}
              {sga.length > 0 && (
                <span className="expense-badge sga">
                  SG&A: {formatCurrency(sga[0]?.value)}
                </span>
              )}
            </div>
          )}
        </div>
        <MiniChart 
          data={cashFromOperations} 
          title="Operating Cash Flow" 
          color="#28a745"
          showTTM={true}
        />
      </div>

      {/* Compact Table */}
      <div className="financial-table-wrapper">
        <table className="financial-table">
          <thead>
            <tr>
              <th>End Date</th>
              <th>Revenue</th>
              <th>OpEx</th>
              <th>OpCF</th>
              <th>YoY</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr key={index}>
                <td>{formatDate(row.endDate)}</td>
                <td>{formatCurrency(row.revenue)}</td>
                <td>{formatCurrency(row.opex)}</td>
                <td className={row.opcf >= 0 ? 'positive' : 'negative'}>
                  {formatCurrency(row.opcf)}
                </td>
                <td className={row.yoy >= 0 ? 'positive' : 'negative'}>
                  {formatPercent(row.yoy)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinancialTrendsPanel;