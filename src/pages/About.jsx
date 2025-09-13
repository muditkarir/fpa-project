import React from "react";

const About = () => (
  <div className="page-container">
    <div className="about-content">
      <h1>Reflection & Learnings</h1>
      <p className="intro-text">
        A comprehensive financial planning and analysis project demonstrating technical skills, 
        financial acumen, and advanced data integration.
      </p>

      <section className="about-section">
        <h2>Objective</h2>
        <p>
          This FP&A project showcases proficiency in financial modeling, 
          scenario analysis, and modern web development. The goal was to create a practical, 
          interactive tool for driver-based forecasting, enriched with real-time macro data 
          and automated management commentary analysis.
        </p>
        <ul className="key-points">
          <li><strong>Business Context:</strong> Enable dynamic scenario modeling and actionable insights for financial planning</li>
          <li><strong>Technical Challenge:</strong> Integrate live macroeconomic data, SEC filings, and AI-powered text analysis into a seamless, user-friendly web application</li>
          <li><strong>Career Development:</strong> Bridge finance expertise with modern web technologies and natural language processing</li>
        </ul>
      </section>

      <section className="about-section">
        <h2>What I Built</h2>
        
        <div className="feature-grid">
          <div className="feature-item">
            <h3>Driver-Based Forecasting</h3>
            <ul>
              <li>Interactive scenario table with Base, Upside, and Downside cases</li>
              <li>Real-time revenue and margin calculations</li>
              <li>Editable financial drivers and assumptions</li>
              <li>LocalStorage persistence and export functionality</li>
            </ul>
          </div>

          <div className="feature-item">
            <h3>Macro & Market Context</h3>
            <ul>
              <li>FRED API integration for CPI and inflation data</li>
              <li>SEC EDGAR filings for company fundamentals, with auto-fetch of latest 10-Q and MD&A/Outlook sections</li>
              <li>Secure serverless functions for API key management and local development proxy</li>
            </ul>
          </div>

          <div className="feature-item">
            <h3>LLM-Powered Insights</h3>
            <ul>
              <li>Automated extraction and summarization of management commentary from SEC filings using Hugging Face models</li>
              <li>Sentiment analysis (FinBERT) to classify tone of guidance and risk paragraphs</li>
              <li>Abstractive summarization (BART) for concise management outlook bullets</li>
              <li>Q&A extraction (RoBERTa-SQuAD2) for targeted insights from filings</li>
            </ul>
          </div>

          <div className="feature-item">
            <h3>Modern Web Architecture</h3>
            <ul>
              <li>Production-ready React.js application with responsive design</li>
              <li>Vercel deployment with environment variables and SPA routing</li>
              <li>Error handling, loading states, and mobile optimization</li>
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
              <li><strong>Building flexible, driver-based forecast models:</strong> tied to key business metrics</li>
              <li><strong>Creating meaningful scenario analysis:</strong> with well-structured assumptions</li>
              <li><strong>Validating model integrity:</strong> through consistent calculations and checks</li>
            </ul>
          </div>

          <div className="learning-item">
            <h3>Market Sentiment & Context</h3>
            <ul>
              <li><strong>Integrating macroeconomic indicators:</strong> and understanding their impact on planning</li>
              <li><strong>Extracting and interpreting relevant financial data:</strong> from regulatory documents</li>
              <li><strong>Using LLMs to automate and enhance:</strong> management commentary analysis</li>
            </ul>
          </div>

          <div className="learning-item">
            <h3>Data Integration & APIs</h3>
            <ul>
              <li><strong>Working with FRED and SEC EDGAR APIs:</strong> including secure key management and CORS handling</li>
              <li><strong>Implementing serverless proxies:</strong> for secure, scalable data access</li>
              <li><strong>Navigating data formats:</strong> rate limits, and error handling</li>
            </ul>
          </div>

          <div className="learning-item">
            <h3>Communication & Presentation</h3>
            <ul>
              <li><strong>Presenting financial data and insights:</strong> in clear, actionable formats</li>
              <li><strong>Designing intuitive interfaces:</strong> for complex financial analysis</li>
              <li><strong>Documenting data sources:</strong> methodology, and limitations</li>
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
              <li><strong>Peer benchmarking and sector analysis</strong></li>
              <li><strong>Sensitivity analysis and historical backtesting</strong></li>
              <li><strong>Advanced FX sensitivity modeling and segment roll-ups</strong></li>
            </ul>
          </div>

          <div className="enhancement-category">
            <h3>Collaboration Features</h3>
            <ul>
              <li><strong>Multi-user scenario sharing and version control</strong></li>
              <li><strong>Commenting system for assumption documentation and review</strong></li>
            </ul>
          </div>
        </div>

        <div className="technical-notes">
          <h3>Technical Architecture Notes</h3>
          <p>
            This project demonstrates practical understanding of modern finance technology stacks, 
            secure API integration, LLM-powered insights, and scalable web deployment. 
            The codebase is structured for maintainability and future enhancement.
          </p>
        </div>
      </section>
    </div>
  </div>
);

export default About;
