import React from "react";

const About = () => (
  <div className="page-container">
    <div className="about-content">
      <h1>Reflection & Learnings</h1>
      <p className="intro-text">
        A comprehensive financial planning and analysis project demonstrating technical skills, 
        financial acumen, and data integration capabilities.
      </p>

      <section className="about-section">
        <h2>Objective</h2>
        <p>
          This FP&A project was built to demonstrate proficiency in financial modeling, 
          scenario analysis, and modern web development. The goal was to create a practical 
          tool that finance teams could use for driver-based forecasting while showcasing 
          technical abilities in data integration and user experience design.
        </p>
        <ul className="key-points">
          <li><strong>Business Context:</strong> Enable dynamic scenario modeling for financial planning</li>
          <li><strong>Technical Challenge:</strong> Integrate real-time macro data with interactive forecasts</li>
          <li><strong>Career Development:</strong> Bridge finance expertise with modern web technologies</li>
        </ul>
      </section>

      <section className="about-section">
        <h2>What I Built</h2>
        
        <div className="feature-grid">
          <div className="feature-item">
            <h3>Driver-Based Forecasting</h3>
            <p>Interactive scenario table with Base, Upside, and Downside cases featuring:</p>
            <ul>
              <li>Real-time revenue and margin calculations</li>
              <li>Editable financial drivers and assumptions</li>
              <li>LocalStorage persistence across sessions</li>
              <li>Export functionality for further analysis</li>
            </ul>
          </div>

          <div className="feature-item">
            <h3>Macro & Market Context</h3>
            <p>Live data integration providing economic context:</p>
            <ul>
              <li>FRED API integration for CPI and inflation data</li>
              <li>SEC EDGAR filings for company fundamentals</li>
              <li>Secure serverless functions for API key management</li>
              <li>Development proxy for seamless local testing</li>
            </ul>
          </div>

          <div className="feature-item">
            <h3>Modern Web Architecture</h3>
            <p>Production-ready application with professional UX:</p>
            <ul>
              <li>React.js with responsive design</li>
              <li>Vercel deployment with environment variables</li>
              <li>Error handling and loading states</li>
              <li>Mobile-optimized interface</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="about-section">
        <h2>What I Learned</h2>
        
        <div className="learning-categories">
          <div className="learning-item">
            <h3>Financial Fundamentals</h3>
            <ul>
              <li><strong>Driver-based modeling:</strong> Building flexible forecast models tied to key business metrics</li>
              <li><strong>Scenario analysis:</strong> Creating meaningful upside/downside cases with proper assumptions</li>
              <li><strong>Data validation:</strong> Ensuring model integrity through consistent calculations and checks</li>
            </ul>
          </div>

          <div className="learning-item">
            <h3>Market Sentiment & Context</h3>
            <ul>
              <li><strong>Macro integration:</strong> Understanding how economic indicators impact financial planning</li>
              <li><strong>SEC filings analysis:</strong> Extracting relevant financial data from regulatory documents</li>
              <li><strong>Real-time data:</strong> Incorporating live market data into static financial models</li>
            </ul>
          </div>

          <div className="learning-item">
            <h3>Data Integration & APIs</h3>
            <ul>
              <li><strong>FRED API:</strong> Working with Federal Reserve economic data and rate limits</li>
              <li><strong>SEC EDGAR API:</strong> Navigating SEC data formats and CIK identification systems</li>
              <li><strong>CORS handling:</strong> Implementing proxies and serverless functions for secure API access</li>
            </ul>
          </div>

          <div className="learning-item">
            <h3>Communication & Presentation</h3>
            <ul>
              <li><strong>Data visualization:</strong> Presenting financial data in clear, actionable formats</li>
              <li><strong>User experience:</strong> Designing intuitive interfaces for complex financial data</li>
              <li><strong>Documentation:</strong> Creating comprehensive data source provenance and methodology</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="about-section">
        <h2>Limitations & Next Steps</h2>
        
        <div className="future-enhancements">
          <div className="enhancement-category">
            <h3>Enhanced Analytics</h3>
            <ul>
              <li><strong>Peer benchmarking:</strong> Integrate industry comparables and sector analysis</li>
              <li><strong>Sensitivity analysis:</strong> Monte Carlo simulations and tornado charts</li>
              <li><strong>Historical backtesting:</strong> Compare forecast accuracy against actual results</li>
            </ul>
          </div>

          <div className="enhancement-category">
            <h3>Advanced Data Integration</h3>
            <ul>
              <li><strong>FX sensitivity modeling:</strong> Multi-currency revenue impact analysis</li>
              <li><strong>EDGAR segment roll-ups:</strong> Automated parsing of 10-K/10-Q segment data</li>
              <li><strong>Real-time market data:</strong> Stock prices, volatility, and analyst estimates</li>
            </ul>
          </div>

          <div className="enhancement-category">
            <h3>Collaboration Features</h3>
            <ul>
              <li><strong>User authentication:</strong> Multi-user scenario sharing and version control</li>
              <li><strong>Commenting system:</strong> Assumption documentation and review workflows</li>
              <li><strong>Export enhancements:</strong> PowerBI/Tableau connectors and API endpoints</li>
            </ul>
          </div>
        </div>

        <div className="technical-notes">
          <h3>Technical Architecture Notes</h3>
          <p>
            This project demonstrates practical understanding of modern finance technology stacks, 
            including secure API integration, responsive web design, and scalable deployment patterns. 
            The codebase is structured for maintainability and future enhancement.
          </p>
        </div>
      </section>
    </div>
  </div>
);

export default About;
