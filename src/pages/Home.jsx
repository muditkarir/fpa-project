import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CompanyHeader from "../components/CompanyHeader";

const Home = () => {
  // Health status state
  const [llmHealthy, setLlmHealthy] = useState(null);
  const [fredHealthy, setFredHealthy] = useState(null);
  const [edgarHealthy, setEdgarHealthy] = useState(null);

  // Snapshot data state
  const [cpiData, setCpiData] = useState({ loading: true, data: null, error: null });
  const [filingData, setFilingData] = useState({ loading: true, data: null, error: null });
  const [fxData, setFxData] = useState({ loading: true, data: null, error: null, available: false });

  // NLP Health check
  useEffect(() => {
    const checkNlpHealth = async () => {
      try {
        const response = await fetch('/api/nlp/health');
        setLlmHealthy(response.ok);
      } catch (error) {
        setLlmHealthy(false);
      }
    };
    checkNlpHealth();
  }, []);

  // FRED Health check
  useEffect(() => {
    const checkFredHealth = async () => {
      try {
        const response = await fetch('/api/fred?series_id=CPIAUCSL&limit=1');
        setFredHealthy(response.ok);
      } catch (error) {
        setFredHealthy(false);
      }
    };
    checkFredHealth();
  }, []);

  // EDGAR Health check
  useEffect(() => {
    const checkEdgarHealth = async () => {
      try {
        const response = await fetch('/api/edgar/latest-filing?cik=0000796343&form=10-Q');
        setEdgarHealthy(response.ok);
      } catch (error) {
        setEdgarHealthy(false);
      }
    };
    checkEdgarHealth();
  }, []);

  // CPI Data fetch
  useEffect(() => {
    const fetchCpiData = async () => {
      try {
        setCpiData(prev => ({ ...prev, loading: true, error: null }));
        const response = await fetch('/api/fred?series_id=CPIAUCSL&limit=1');
        
        if (response.ok) {
          const data = await response.json();
          if (data.observations && data.observations.length > 0) {
            setCpiData({
              loading: false,
              data: {
                value: data.observations[0].value,
                date: data.observations[0].date
              },
              error: null
            });
          } else {
            setCpiData({ loading: false, data: null, error: 'No data available' });
          }
        } else {
          setCpiData({ loading: false, data: null, error: 'Failed to fetch' });
        }
      } catch (error) {
        setCpiData({ loading: false, data: null, error: 'Connection error' });
      }
    };
    fetchCpiData();
  }, []);

  // Filing Data fetch
  useEffect(() => {
    const fetchFilingData = async () => {
      try {
        setFilingData(prev => ({ ...prev, loading: true, error: null }));
        const response = await fetch('/api/edgar/latest-filing?cik=0000796343&form=10-Q');
        
        if (response.ok) {
          const data = await response.json();
          setFilingData({
            loading: false,
            data: {
              form: data.form,
              filedAt: data.filedAt,
              url: data.primaryDocumentUrl
            },
            error: null
          });
        } else {
          setFilingData({ loading: false, data: null, error: 'Failed to fetch' });
        }
      } catch (error) {
        setFilingData({ loading: false, data: null, error: 'Connection error' });
      }
    };
    fetchFilingData();
  }, []);

  // FX Data fetch (with availability check)
  useEffect(() => {
    const fetchFxData = async () => {
      try {
        setFxData(prev => ({ ...prev, loading: true, error: null }));
        const response = await fetch('/api/fx/h10');
        
        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.eurUsd) {
            setFxData({
              loading: false,
              data: {
                value: data.data.eurUsd.value,
                date: data.data.eurUsd.date
              },
              error: null,
              available: true
            });
          } else {
            setFxData({ loading: false, data: null, error: 'No EUR/USD data', available: true });
          }
        } else {
          setFxData({ loading: false, data: null, error: 'Service unavailable', available: false });
        }
      } catch (error) {
        // FX endpoint might not exist, so we hide the tile
        setFxData({ loading: false, data: null, error: 'Service unavailable', available: false });
      }
    };
    fetchFxData();
  }, []);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="page-container">
      <CompanyHeader symbol="ADBE" />
      
      {/* Hero Section */}
      <div className="home-hero">
        <h1>Adobe FP&A Scenario Analysis</h1>
        <p className="hero-subtitle">
          Interactive financial planning platform combining live economic data, SEC filings, and AI-powered insights for comprehensive scenario modeling.
        </p>
        <div className="button-group">
          <Link to="/scenario" className="action-btn primary">
            📊 Build Scenarios
          </Link>
          <Link to="/insights" className="action-btn secondary">
            🤖 AI Insights
          </Link>
        </div>
      </div>

      {/* Quick Start */}
      <div className="home-section">
        <h2>🚀 Quick Start</h2>
        <ol className="quick-start-list">
          <li><strong>Explore Live Data:</strong> Visit <Link to="/sources">Data Sources</Link> to see real-time economic indicators and SEC filings</li>
          <li><strong>Build Scenarios:</strong> Use the <Link to="/scenario">Scenario Analysis</Link> tool to model different business outcomes</li>
          <li><strong>Generate Insights:</strong> Leverage <Link to="/insights">AI Analysis</Link> to extract key themes from financial disclosures</li>
        </ol>
      </div>

      {/* Live Health */}
      <div className="home-section">
        <h2>🔍 Live Health</h2>
        <div className="health-grid">
          <div className="health-item">
            <span className={`health-indicator ${llmHealthy === null ? '' : llmHealthy ? 'connected' : 'unavailable'}`}>
              {llmHealthy === null ? '⏳' : llmHealthy ? '✅' : '❌'}
            </span>
            <span className="health-name">NLP Services</span>
            <span className="health-status">
              {llmHealthy === null ? 'Checking...' : llmHealthy ? 'Connected' : 'Unavailable'}
            </span>
          </div>
          
          <div className="health-item">
            <span className={`health-indicator ${fredHealthy === null ? '' : fredHealthy ? 'connected' : 'unavailable'}`}>
              {fredHealthy === null ? '⏳' : fredHealthy ? '✅' : '❌'}
            </span>
            <span className="health-name">FRED Economic Data</span>
            <span className="health-status">
              {fredHealthy === null ? 'Checking...' : fredHealthy ? 'Connected' : 'Unavailable'}
            </span>
          </div>
          
          <div className="health-item">
            <span className={`health-indicator ${edgarHealthy === null ? '' : edgarHealthy ? 'connected' : 'unavailable'}`}>
              {edgarHealthy === null ? '⏳' : edgarHealthy ? '✅' : '❌'}
            </span>
            <span className="health-name">SEC EDGAR</span>
            <span className="health-status">
              {edgarHealthy === null ? 'Checking...' : edgarHealthy ? 'Connected' : 'Unavailable'}
            </span>
          </div>
        </div>
      </div>

      {/* Latest Snapshots */}
      <div className="home-section">
        <h2>📈 Latest Snapshots</h2>
        <div className="snapshots-grid">
          {/* CPI Snapshot */}
          <div className="snapshot-tile">
            <div className="snapshot-label">Consumer Price Index</div>
            <div className="snapshot-value">
              {cpiData.loading ? '...' : cpiData.error ? '—' : cpiData.data?.value || '—'}
            </div>
            <div className="snapshot-date">
              {cpiData.loading ? 'Loading...' : cpiData.error ? cpiData.error : formatDate(cpiData.data?.date)}
            </div>
          </div>
          
          {/* Filing Snapshot */}
          <div className="snapshot-tile">
            <div className="snapshot-label">Latest Filing</div>
            <div className="snapshot-value">
              {filingData.loading ? '...' : filingData.error ? '—' : filingData.data?.form || '—'}
            </div>
            <div className="snapshot-date">
              {filingData.loading ? 'Loading...' : filingData.error ? filingData.error : (
                filingData.data ? (
                  <>
                    {formatDate(filingData.data.filedAt)} •{' '}
                    <a href={filingData.data.url} target="_blank" rel="noopener noreferrer" className="snapshot-link">
                      View →
                    </a>
                  </>
                ) : '—'
              )}
            </div>
          </div>

          {/* FX Snapshot - only show if available */}
          {fxData.available && (
            <div className="snapshot-tile">
              <div className="snapshot-label">EUR/USD Rate</div>
              <div className="snapshot-value">
                {fxData.loading ? '...' : fxData.error ? '—' : fxData.data?.value || '—'}
              </div>
              <div className="snapshot-date">
                {fxData.loading ? 'Loading...' : fxData.error ? fxData.error : formatDate(fxData.data?.date)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* What's Inside */}
      <div className="home-section">
        <h2>🎯 What's Inside</h2>
        <div className="feature-grid">
          <Link to="/scenario" className="feature-card">
            <h3>📊 Scenario Analysis</h3>
            <p>Interactive driver-based forecasting with Base, Upside, and Downside cases for comprehensive planning.</p>
          </Link>
          
          <Link to="/sources" className="feature-card">
            <h3>📈 Data Sources</h3>
            <p>Live economic data, SEC filings, and foreign exchange rates integrated from authoritative sources.</p>
          </Link>
          
          <Link to="/insights" className="feature-card">
            <h3>🤖 AI Insights</h3>
            <p>Automated text analysis, sentiment scoring, and key insight extraction from financial disclosures.</p>
          </Link>
        </div>
      </div>

      {/* How it Works */}
      <div className="home-section">
        <h2>⚙️ How it Works</h2>
        <p>
          This platform combines real-time financial data with advanced scenario modeling capabilities. 
          Start with live market data, build comprehensive forecasts, and use AI to extract actionable insights 
          from regulatory filings—all in one integrated workflow designed for modern FP&A teams.
        </p>
        <p>
          <Link to="/about" className="insights-link">Learn more about the methodology and technical approach →</Link>
        </p>
      </div>
    </div>
  );
};

export default Home;
