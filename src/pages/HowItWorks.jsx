import React from "react";
import { Link } from "react-router-dom";

const HowItWorks = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>⚙️ How it Works</h1>
        <p className="page-subtitle">
          Project Walkthrough: End-to-End Narrative
        </p>
      </div>

      <div className="how-it-works-content">
        {/* Overview Section */}
        <section className="workflow-section">
          <h2>🎯 Overview</h2>
          <p>
            This project is a comprehensive FP&A scenario analysis tool for Adobe, combining live financial, 
            macroeconomic, and FX data with interactive modeling, historical trends, and AI-powered insights. 
            It's designed to help finance teams—and anyone interested—build, test, and explain driver-based 
            forecasts using real-world data and modern web technologies.
          </p>
        </section>

        {/* Data Sources */}
        <section className="workflow-section">
          <h2>📊 1. Data Sources</h2>
          
          <div className="data-source-section">
            <h3>📈 Macroeconomic Context</h3>
            <p>
              Live CPI and inflation data are pulled from the <strong>FRED API</strong> (Federal Reserve Economic Data), 
              providing up-to-date economic indicators that inform pricing and cost assumptions.
            </p>
          </div>

          <div className="data-source-section">
            <h3>📋 EDGAR (SEC) Financial Statements</h3>
            <p>
              The app fetches and displays recent SEC filings for Adobe using <strong>EDGAR</strong> 
              (Electronic Data Gathering, Analysis, and Retrieval system), including 10-K, 10-Q, and 8-K reports.
            </p>
          </div>

          <div className="data-source-section">
            <h3>📊 Trends from Filings</h3>
            <p>
              Using the SEC's Company Facts API, the tool extracts and visualizes quarterly and annual trends 
              for revenue, operating expenses, and operating cash flow.
            </p>
            
            <div className="finance-perspective">
              <h4>Finance Perspective:</h4>
              <ul className="finance-list">
                <li>
                  <strong>Revenue Trends:</strong> Track quarterly and annual revenue to see growth rates, 
                  seasonality, and major shifts. Metrics like year-over-year (YoY) growth and trailing 
                  twelve months (TTM) revenue help understand both short-term and long-term performance.
                </li>
                <li>
                  <strong>Expense Trends:</strong> Monitor operating expenses and, when available, break out 
                  R&D and SG&A. This helps spot cost control efforts, investments, and changes in strategy. 
                  Comparing expense growth to revenue growth reveals operational efficiency.
                </li>
                <li>
                  <strong>Cash Flow Trends:</strong> Use net cash from operating activities to evaluate the 
                  company's ability to generate cash from its core business, fund growth, and manage liquidity.
                </li>
                <li>
                  <strong>Margin Analysis:</strong> Calculate profit margins for each period to understand 
                  pricing power, cost structure, and macro impacts.
                </li>
                <li>
                  <strong>Scenario Support:</strong> These historical trends provide a reality check for 
                  scenario analysis, helping set reasonable growth rates, model margin pressure, and 
                  highlight risks or opportunities.
                </li>
              </ul>
            </div>
          </div>

          <div className="data-source-section">
            <h3>💱 FX (Federal Reserve H.10)</h3>
            <p>
              The FX section documents how currency rates and indexes are used in scenario modeling. 
              (If live rates are enabled, the latest values are displayed.)
            </p>
          </div>
        </section>

        {/* Scenario Analysis */}
        <section className="workflow-section">
          <h2>🎯 2. Scenario Analysis (For Non-Finance Users)</h2>
          
          <div className="scenario-explanation">
            <h3>What is Scenario Analysis?</h3>
            <p>
              Scenario analysis is a way to model "what if" situations for a company's financial future. 
              Instead of guessing one outcome, you build several cases—like a Base case (expected), 
              Upside (better than expected), and Downside (worse than expected)—by adjusting key business drivers.
            </p>

            <h3>How does it work in this project?</h3>
            <ul className="scenario-list">
              <li>
                On the Scenario Analysis page, you see a table with editable numbers for things like 
                price increases, subscription growth, currency impacts, and costs.
              </li>
              <li>
                When you change these numbers, the tool instantly recalculates things like revenue, 
                profit margins, and cash flow for each scenario.
              </li>
              <li>
                This helps you see how different business decisions or market changes could affect 
                the company's financial results.
              </li>
            </ul>

            <h3>How is it connected to the data sources?</h3>
            <p>The numbers you adjust aren't just guesses—they're informed by real data:</p>
            <ul className="connection-list">
              <li>
                <strong>Macroeconomic data</strong> (like inflation from FRED - Federal Reserve Economic Data) helps you decide if 
                price increases are realistic.
              </li>
              <li>
                <strong>SEC filings</strong> (like revenue and expenses from EDGAR - Electronic Data Gathering, Analysis, and Retrieval system) show historical trends, 
                so you can set reasonable growth rates or cost assumptions.
              </li>
              <li>
                <strong>FX rates</strong> (from the Federal Reserve) help you model the impact of 
                currency changes on international revenue.
              </li>
            </ul>
            <p>
              By combining live data with interactive modeling, you can build scenarios that are 
              grounded in reality—not just theory.
            </p>
          </div>
        </section>

        {/* Financial Text Insights */}
        <section className="workflow-section">
          <h2>🤖 3. Financial Text Insights (LLM/NLP Assist)</h2>
          
          <div className="nlp-explanation">
            <h3>What is it?</h3>
            <p>
              Financial Text Insights uses advanced AI models (large language models, or LLMs) to help users 
              interpret and summarize management commentary, press releases, and financial disclosures—especially 
              the "Outlook" or MD&A sections from SEC filings.
            </p>

            <h3>How does it work?</h3>
            <ul className="nlp-features">
              <li>
                <strong>Auto-Fetch:</strong> The tool can automatically pull the latest "Outlook" or MD&A 
                section from Adobe's most recent 10-Q filing using the SEC EDGAR API (Electronic Data Gathering, Analysis, and Retrieval system).
              </li>
              <li>
                <strong>Summarization:</strong> Using a Hugging Face summarization model (BART), the tool 
                generates concise, easy-to-read management outlook bullets. This helps users quickly grasp 
                the key points and strategic direction communicated by company leadership.
              </li>
              <li>
                <strong>Tone Classification:</strong> With a finance-specific sentiment model (FinBERT), 
                the tool analyzes each sentence to classify the tone as positive, neutral, or negative. 
                This provides a quick snapshot of management's confidence, caution, or concern in their guidance.
              </li>
              <li>
                <strong>Q&A Extraction:</strong> Users can ask targeted questions about the text 
                (e.g., "What did management say about FX headwinds?"), and the tool extracts relevant 
                answers using an AI question-answering model (RoBERTa-SQuAD2).
              </li>
            </ul>

            <h3>Why does this matter?</h3>
            <ul className="matter-list">
              <li>
                <strong>Bridges qualitative and quantitative analysis:</strong> Financial planning isn't 
                just about numbers—understanding management's narrative, risk disclosures, and strategic 
                priorities is crucial for building realistic scenarios.
              </li>
              <li>
                <strong>Saves time and reduces bias:</strong> Instead of manually reading and interpreting 
                lengthy filings, users get instant, AI-powered summaries and sentiment analysis, making 
                it easier to spot key themes and risks.
              </li>
              <li>
                <strong>Supports better decision-making:</strong> By combining management's own words with 
                quantitative scenario modeling, users can make more informed, balanced decisions.
              </li>
            </ul>
          </div>
        </section>

        {/* End-to-End Workflow */}
        <section className="workflow-section">
          <h2>🔄 4. End-to-End Workflow</h2>
          <div className="workflow-steps">
            <div className="workflow-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Start with Data</h4>
                <p>Review live macro, financial, and FX data to inform scenario assumptions.</p>
              </div>
            </div>
            
            <div className="workflow-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Model Scenarios</h4>
                <p>Adjust drivers in the Scenario Analysis page and see instant impact on financial outputs.</p>
              </div>
            </div>
            
            <div className="workflow-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Validate with Trends</h4>
                <p>Use historical trends from SEC filings to ground your assumptions in real company performance.</p>
              </div>
            </div>
            
            <div className="workflow-step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h4>Add Narrative Context</h4>
                <p>Summarize and analyze management commentary to connect numbers with qualitative insights.</p>
              </div>
            </div>
            
            <div className="workflow-step">
              <div className="step-number">5</div>
              <div className="step-content">
                <h4>Document & Share</h4>
                <p>Export scenarios, document your reasoning, and share results with stakeholders.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Why This Matters */}
        <section className="workflow-section cta-section">
          <h2>🎯 Why This Matters</h2>
          <p>
            This project demonstrates how modern finance teams can combine real-time data, regulatory filings, 
            and AI-powered analysis to build robust, explainable forecasts. It bridges technical skills, 
            financial acumen, and user experience—making scenario planning transparent, actionable, and 
            credible for both finance professionals and non-experts.
          </p>
          
          <div className="cta-buttons">
            <Link to="/sources" className="cta-btn primary">
              📈 Explore Data Sources
            </Link>
            <Link to="/scenario" className="cta-btn secondary">
              📊 Build Scenarios
            </Link>
            <Link to="/insights" className="cta-btn secondary">
              🤖 Try AI Insights
            </Link>
          </div>
        </section>

        {/* Technical Details */}
        <section className="workflow-section">
          <div className="tech-note">
            <p>
              <strong>For Technical Implementation Details:</strong> Visit our <Link to="/about" className="insights-link">About page</Link> for 
              comprehensive technical specifications, model configurations, and implementation details.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HowItWorks;