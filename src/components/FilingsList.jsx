import React, { useState } from 'react';
import { fetchEDGARSubmissions, formatFilings, getCompanyName } from '../utils/edgarClient';

const FilingsList = () => {
  const [cik, setCik] = useState('796343'); // Default to Adobe's CIK
  const [filings, setFilings] = useState([]);
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!cik.trim()) {
      setError('Please enter a CIK number');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);
      
      const data = await fetchEDGARSubmissions(cik);
      const formattedFilings = formatFilings(data, 5);
      const company = getCompanyName(data);
      
      setFilings(formattedFilings);
      setCompanyName(company);
      
      if (formattedFilings.length === 0) {
        setError('No recent major filings (10-K, 10-Q, 8-K, DEF 14A) found for this CIK.');
      }
    } catch (err) {
      setError(err.message);
      setFilings([]);
      setCompanyName('');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="filings-list-container">
      <h4>Recent SEC Filings</h4>
      
      <div className="cik-input-section">
        <div className="input-group">
          <input
            type="text"
            value={cik}
            onChange={(e) => setCik(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter CIK (e.g., 796343 for Adobe)"
            className="cik-input"
            disabled={loading}
          />
          <button 
            onClick={handleSearch} 
            disabled={loading}
            className="search-button"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
        <p className="input-help">
          Enter a company's CIK number to view recent SEC filings. 
          <br />
          <small>Example: 796343 (Adobe), 789019 (Microsoft), 1018724 (Amazon)</small>
        </p>
      </div>

      {loading && (
        <div className="loading-state">
          <p>Fetching filings from SEC EDGAR...</p>
        </div>
      )}

      {error && (
        <div className="error-state">
          <p>⚠️ {error}</p>
        </div>
      )}

      {hasSearched && !loading && !error && filings.length > 0 && (
        <div className="filings-results">
          <div className="company-header">
            <h5>{companyName}</h5>
            <p className="cik-display">CIK: {cik.padStart(10, '0')}</p>
          </div>
          
          <div className="filings-table">
            <div className="table-header">
              <span>Form</span>
              <span>Filing Date</span>
              <span>Document</span>
            </div>
            
            {filings.map((filing, index) => (
              <div key={`${filing.accessionNumber}-${index}`} className="filing-row">
                <span className="form-type">{filing.form}</span>
                <span className="filing-date">{filing.formattedDate}</span>
                <span className="filing-link">
                  <a 
                    href={filing.documentUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="document-link"
                  >
                    View Filing →
                  </a>
                </span>
              </div>
            ))}
          </div>
          
          <div className="filing-note">
            <p><small>
              Showing recent major filings (10-K, 10-Q, 8-K, DEF 14A). 
              Data sourced from SEC EDGAR database.
            </small></p>
          </div>
        </div>
      )}

      {hasSearched && !loading && !error && filings.length === 0 && (
        <div className="no-results">
          <p>No recent major filings found for CIK: {cik}</p>
        </div>
      )}
    </div>
  );
};

export default FilingsList;