import React from "react";
import { Link } from "react-router-dom";
import ScenarioTable from "../components/ScenarioTable";
import AssumptionsCard from "../components/AssumptionsCard";

const ScenarioAnalysis = () => (
  <div className="page-container">
    <h1>Scenario Analysis</h1>
    <p>Analyze Base, Upside, and Downside scenarios with driver-based modeling.</p>
    
    {/* AI Assist Callout */}
    <div className="ai-assist-callout">
      <div className="ai-callout-content">
        <div className="ai-callout-text">
          <strong>🤖 Draft management summary with AI</strong>
          <p>Generate outlook bullets and sentiment analysis from your scenario narratives</p>
        </div>
        <Link to="/insights" className="ai-callout-btn">
          Try Insights →
        </Link>
      </div>
    </div>
    
    <div className="scenario-layout">
      <div className="scenario-main">
        <ScenarioTable />
      </div>
      <div className="scenario-sidebar">
        <AssumptionsCard />
      </div>
    </div>
  </div>
);

export default ScenarioAnalysis;
