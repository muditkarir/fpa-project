import React from "react";
import ScenarioTable from "../components/ScenarioTable";
import AssumptionsCard from "../components/AssumptionsCard";

const ScenarioAnalysis = () => (
  <div className="page-container">
    <h1>Scenario Analysis</h1>
    <p>Analyze Base, Upside, and Downside scenarios with driver-based modeling.</p>
    
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
