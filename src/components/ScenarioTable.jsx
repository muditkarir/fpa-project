import React, { useState, useEffect } from 'react';
import { 
  SCENARIO_DRIVERS, 
  DEFAULT_SCENARIOS, 
  calculateOutputs, 
  saveScenarios, 
  loadScenarios, 
  exportScenariosAsJson 
} from '../utils/scenarioHelpers';

const ScenarioTable = () => {
  const [scenarios, setScenarios] = useState(DEFAULT_SCENARIOS);

  // Load scenarios from localStorage on mount
  useEffect(() => {
    const savedScenarios = loadScenarios();
    setScenarios(savedScenarios);
  }, []);

  // Save scenarios to localStorage whenever they change
  useEffect(() => {
    saveScenarios(scenarios);
  }, [scenarios]);

  // Handle input changes
  const handleDriverChange = (scenarioKey, driverKey, value) => {
    const numericValue = parseFloat(value) || 0;
    setScenarios(prev => ({
      ...prev,
      [scenarioKey]: {
        ...prev[scenarioKey],
        [driverKey]: numericValue
      }
    }));
  };

  // Reset to defaults
  const handleReset = () => {
    setScenarios(DEFAULT_SCENARIOS);
    localStorage.removeItem('fpa-scenarios');
  };

  // Export scenarios
  const handleExport = () => {
    exportScenariosAsJson(scenarios);
  };

  const scenarioKeys = ['base', 'upside', 'downside'];

  return (
    <div className="scenario-table-container">
      <div className="scenario-actions">
        <button onClick={handleReset} className="btn btn-secondary">
          Reset to Defaults
        </button>
        <button onClick={handleExport} className="btn btn-primary">
          Export JSON
        </button>
      </div>

      <div className="scenario-table-wrapper">
        <table className="scenario-table">
          <thead>
            <tr>
              <th className="driver-header">Driver</th>
              {scenarioKeys.map(key => (
                <th key={key} className="scenario-header">
                  {scenarios[key].name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Input Drivers */}
            <tr className="section-header">
              <td colSpan="4">
                <strong>Input Drivers</strong>
              </td>
            </tr>
            {SCENARIO_DRIVERS.map(driver => (
              <tr key={driver.key}>
                <td className="driver-label">{driver.label}</td>
                {scenarioKeys.map(scenarioKey => (
                  <td key={`${scenarioKey}-${driver.key}`}>
                    <input
                      type="number"
                      step="0.1"
                      value={scenarios[scenarioKey][driver.key]}
                      onChange={(e) => handleDriverChange(scenarioKey, driver.key, e.target.value)}
                      className="driver-input"
                    />
                    <span className="input-suffix">%</span>
                  </td>
                ))}
              </tr>
            ))}

            {/* Calculated Outputs */}
            <tr className="section-header">
              <td colSpan="4">
                <strong>Calculated Outputs</strong>
              </td>
            </tr>
            <tr>
              <td className="driver-label">Revenue ($M)</td>
              {scenarioKeys.map(scenarioKey => {
                const outputs = calculateOutputs(scenarios[scenarioKey]);
                return (
                  <td key={`${scenarioKey}-revenue`} className="output-cell">
                    ${outputs.revenue}
                  </td>
                );
              })}
            </tr>
            <tr>
              <td className="driver-label">Costs ($M)</td>
              {scenarioKeys.map(scenarioKey => {
                const outputs = calculateOutputs(scenarios[scenarioKey]);
                return (
                  <td key={`${scenarioKey}-costs`} className="output-cell">
                    ${outputs.costs}
                  </td>
                );
              })}
            </tr>
            <tr>
              <td className="driver-label">Gross Margin ($M)</td>
              {scenarioKeys.map(scenarioKey => {
                const outputs = calculateOutputs(scenarios[scenarioKey]);
                return (
                  <td key={`${scenarioKey}-margin`} className="output-cell">
                    ${outputs.grossMargin}
                  </td>
                );
              })}
            </tr>
            <tr>
              <td className="driver-label">Margin %</td>
              {scenarioKeys.map(scenarioKey => {
                const outputs = calculateOutputs(scenarios[scenarioKey]);
                return (
                  <td key={`${scenarioKey}-margin-pct`} className="output-cell">
                    {outputs.marginPercent}%
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScenarioTable;