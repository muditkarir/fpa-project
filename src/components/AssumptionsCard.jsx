import React from 'react';

const AssumptionsCard = () => {
  return (
    <div className="assumptions-card">
      <h3>Model Assumptions</h3>
      
      <div className="assumptions-section">
        <h4>Key Assumptions</h4>
        <ul>
          <li><strong>Price Uplift:</strong> Applied uniformly across subscription tiers with minimal churn impact</li>
          <li><strong>Net-New ARR Growth:</strong> Organic growth from new customer acquisition and expansion</li>
          <li><strong>FX Impact:</strong> USD-based model; excludes foreign exchange rate fluctuations</li>
          <li><strong>GM Base:</strong> 40% gross margin baseline with operational leverage assumptions</li>
          <li><strong>OpEx Structure:</strong> R&D ~20%, S&M ~30%, G&A ~10% of revenue as baseline</li>
        </ul>
      </div>

      <div className="limitations-section">
        <h4>Model Limitations</h4>
        <ul>
          <li><strong>Illustrative Only:</strong> This data is for modeling purposes and not official guidance</li>
          <li><strong>Simplified Model:</strong> Real scenarios involve complex interdependencies not captured here</li>
          <li><strong>Static Assumptions:</strong> Does not account for market dynamics, competition, or external shocks</li>
          <li><strong>Future Enhancements:</strong> Next steps include Monte Carlo analysis, sensitivity testing, and market scenarios</li>
        </ul>
      </div>

      <div className="methodology-note">
        <p><em>This driver-based model provides directional insights for strategic planning. For detailed financial projections, consult comprehensive financial models and market research.</em></p>
      </div>
    </div>
  );
};

export default AssumptionsCard;