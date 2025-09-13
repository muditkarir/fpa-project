// Default scenario data and calculations for Adobe FP&A analysis

export const SCENARIO_DRIVERS = [
  { key: 'subscriptionGrowth', label: 'Subscription Growth %', format: 'percent' },
  { key: 'priceIncrease', label: 'Price Increase %', format: 'percent' },
  { key: 'churnReduction', label: 'Churn Reduction %', format: 'percent' },
  { key: 'salesEfficiency', label: 'Sales Efficiency %', format: 'percent' },
  { key: 'marketingSpend', label: 'Marketing Spend Change %', format: 'percent' }
];

export const DEFAULT_SCENARIOS = {
  base: {
    name: 'Base Case',
    subscriptionGrowth: 12,
    priceIncrease: 5,
    churnReduction: 0,
    salesEfficiency: 0,
    marketingSpend: 0
  },
  upside: {
    name: 'Upside Case',
    subscriptionGrowth: 18,
    priceIncrease: 8,
    churnReduction: 15,
    salesEfficiency: 20,
    marketingSpend: -10
  },
  downside: {
    name: 'Downside Case',
    subscriptionGrowth: 6,
    priceIncrease: 2,
    churnReduction: -5,
    salesEfficiency: -15,
    marketingSpend: 15
  }
};

// Simple calculation functions for outputs
export const calculateOutputs = (scenario) => {
  const baseRevenue = 1000; // Base revenue in millions
  const baseCosts = 600; // Base costs in millions

  // Revenue impact calculations
  const subscriptionImpact = scenario.subscriptionGrowth / 100;
  const priceImpact = scenario.priceIncrease / 100;
  const churnImpact = scenario.churnReduction / 100 * 0.3; // Churn reduction affects 30% of revenue

  const totalRevenue = baseRevenue * (1 + subscriptionImpact + priceImpact + churnImpact);

  // Cost impact calculations
  const marketingCostChange = scenario.marketingSpend / 100;
  const salesEfficiencyImpact = scenario.salesEfficiency / 100 * 0.2; // 20% of costs affected by sales efficiency

  const totalCosts = baseCosts * (1 + marketingCostChange - salesEfficiencyImpact);

  // Calculated outputs
  const grossMargin = totalRevenue - totalCosts;
  const marginPercent = (grossMargin / totalRevenue) * 100;

  return {
    revenue: Math.round(totalRevenue),
    costs: Math.round(totalCosts),
    grossMargin: Math.round(grossMargin),
    marginPercent: Math.round(marginPercent * 10) / 10
  };
};

// localStorage helpers
export const saveScenarios = (scenarios) => {
  try {
    localStorage.setItem('fpa-scenarios', JSON.stringify(scenarios));
  } catch (error) {
    console.error('Failed to save scenarios to localStorage:', error);
  }
};

export const loadScenarios = () => {
  try {
    const saved = localStorage.getItem('fpa-scenarios');
    return saved ? JSON.parse(saved) : DEFAULT_SCENARIOS;
  } catch (error) {
    console.error('Failed to load scenarios from localStorage:', error);
    return DEFAULT_SCENARIOS;
  }
};

// Export functionality
export const exportScenariosAsJson = (scenarios) => {
  const dataStr = JSON.stringify(scenarios, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `adobe-fpa-scenarios-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};