import React from "react";
import { Link } from "react-router-dom";
import MacroDataSection from "../components/MacroDataSection";
import FilingsList from "../components/FilingsList";
import FinnhubSection from "../components/FinnhubSection";
import FXSection from "../components/FXSection";
import FinancialTrendsPanel from "../components/FinancialTrendsPanel";

const DataSources = () => (
  <div className="page-container">
    <h1>Data Sources</h1>
    <p>Financial, macroeconomic, and FX context for scenario analysis.</p>
    
    <div className="data-sources-info">
      <div className="data-source-section">
        <h3>📈 FRED (Federal Reserve) - Macroeconomic Data</h3>
        <div className="source-description">
          <p>Federal Reserve Economic Data from the St. Louis Fed provides authoritative U.S. and international economic indicators.</p>
        </div>
        <div className="source-details">
          <h4>What We Use:</h4>
          <ul>
            <li><strong>Consumer Price Index (CPI-U):</strong> All Urban Consumers index measuring inflation trends that impact subscription pricing power</li>
            <li><strong>Unemployment Rate:</strong> Labor market conditions affecting enterprise software demand and customer budget constraints</li>
            <li><strong>GDP Growth:</strong> Overall economic health indicators influencing B2B software spending and expansion rates</li>
            <li><strong>Interest Rates:</strong> Federal funds rate and treasury yields affecting discount rates and capital allocation decisions</li>
          </ul>
          <h4>How It Supports Scenarios:</h4>
          <ul>
            <li>Inflation data informs price increase assumptions</li>
            <li>Employment trends guide customer acquisition forecasts</li>
            <li>Economic growth correlates with enterprise expansion scenarios</li>
          </ul>
        </div>
        <div className="source-access">
          <p><em>Access: Secure API proxy with cached responses - FRED API key managed server-side</em></p>
        </div>
      </div>
    </div>
    
    <MacroDataSection />
    
    <div className="data-sources-info">
      <div className="data-source-section">
        <h3>📊 EDGAR (SEC) - Financial Statements</h3>
        <div className="source-description">
          <p>Securities and Exchange Commission's Electronic Data Gathering, Analysis, and Retrieval system provides comprehensive company financial data.</p>
        </div>
        <div className="source-details">
          <h4>What We Use:</h4>
          <ul>
            <li><strong>Audited Financial Statements:</strong> 10-K annual reports and 10-Q quarterly filings for revenue, expenses, and cash flow trends</li>
            <li><strong>XBRL "Company Facts":</strong> Machine-readable financial data points enabling consistent historical analysis across reporting periods</li>
            <li><strong>Subscription Metrics:</strong> ARR (Annual Recurring Revenue), customer counts, and retention rates disclosed in earnings materials</li>
            <li><strong>Geographic Revenue:</strong> Regional breakdowns for foreign exchange impact assessment in scenario modeling</li>
          </ul>
          <h4>How It Supports Scenarios:</h4>
          <ul>
            <li>Historical growth rates inform base case assumptions</li>
            <li>Seasonal patterns help model quarterly variations</li>
            <li>Margin trends validate cost structure assumptions</li>
          </ul>
        </div>
        <div className="source-access">
          <p><em>Access: Public data via SEC.gov APIs - no authentication required</em></p>
        </div>
        
        <FilingsList />
        
        <FinancialTrendsPanel cik="0000796343" />
        
        <div className="insights-hint">
          <p>💡 <strong>Pro tip:</strong> Paste MD&A sections into <Link to="/insights" className="insights-link">Insights</Link> to generate outlook bullets and tone analysis.</p>
        </div>
      </div>

      <div className="data-source-section">
        <h3> FX (Federal Reserve H.10) - Foreign Exchange</h3>
        <div className="source-description">
          <p>Federal Reserve's H.10 release provides official foreign exchange rates for major trading partners.</p>
        </div>
        <div className="source-details">
          <h4>What We Use:</h4>
          <ul>
            <li><strong>EUR/USD Exchange Rate:</strong> European market revenue translation for companies with significant EU presence</li>
            <li><strong>GBP/USD Exchange Rate:</strong> UK market impact assessment for British Isles operations and contracts</li>
            <li><strong>Trade-Weighted Dollar Index:</strong> Broad-based currency strength measure affecting international competitiveness</li>
            <li><strong>Volatility Patterns:</strong> Historical FX fluctuation ranges for hedging strategy evaluation</li>
          </ul>
          <h4>How It Supports Scenarios:</h4>
          <ul>
            <li>Currency headwinds/tailwinds in revenue translation</li>
            <li>Hedging costs and effectiveness in margin calculations</li>
            <li>Regional pricing strategy validation across markets</li>
          </ul>
        </div>
        <div className="source-access">
          <p><em>Access: Public Federal Reserve data feeds - direct API access available without authentication</em></p>
        </div>
        
        <FXSection />
      </div>

      <div className="data-source-section">
        <h3>💼 Finnhub - Company Fundamentals</h3>
        <div className="source-description">
          <p>Real-time financial data and market insights providing company fundamentals, peer analysis, and key financial metrics.</p>
        </div>
        <div className="source-details">
          <h4>What We Use:</h4>
          <ul>
            <li><strong>Company Profile:</strong> Basic company information including market capitalization, exchange listing, and website</li>
            <li><strong>Financial Metrics:</strong> Key ratios including P/E, margins, ROE, and debt-to-equity for valuation context</li>
            <li><strong>Peer Analysis:</strong> Comparable companies for benchmarking and industry context in scenario development</li>
            <li><strong>Market Data:</strong> Current trading multiples and financial health indicators</li>
          </ul>
          <h4>How It Supports Scenarios:</h4>
          <ul>
            <li>Peer benchmarking validates assumption ranges</li>
            <li>Historical metrics inform margin and growth expectations</li>
            <li>Valuation multiples provide sanity checks for forecast outputs</li>
          </ul>
        </div>
        <div className="source-access">
          <p><em>Access: Finnhub free tier via secure serverless proxy - API keys remain server-side</em></p>
        </div>
        
        <FinnhubSection symbol="ADBE" />
      </div>
    </div>
  </div>
);

export default DataSources;
