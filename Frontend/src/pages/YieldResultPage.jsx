// src/pages/YieldResultPage.jsx

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './YieldResultPage.css';

const YieldResultPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const results = location.state?.results;
  const area = location.state?.area;
  const cropName = location.state?.cropName;

  // --- CALCULATIONS ---
  let yieldInTonsPerAcre = 0;
  let totalProfit = 0;

  // MODIFIED: This check now correctly handles a predicted_yield of 0
  if (results && results.predicted_yield != null && area != null) {
    const yieldInTonsPerHectare = parseFloat(results.predicted_yield);
    const mspValue = parseFloat(results.msp);

    // 1. Calculate with numbers only
    yieldInTonsPerAcre = yieldInTonsPerHectare / 2.47105;
    totalProfit = yieldInTonsPerAcre * area * mspValue;
  }

  if (!results) {
    return (
      <main className="main-content results-content">
        <div className="results-card">
          <h1 className="results-title">No Data Available</h1>
          <p>Please go back to the dashboard.</p>
          <button className="back-button" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="main-content results-content">
      <div className="results-card">
        <h1 className="results-title">
          Yield Prediction for <span className="crop-name">{cropName}</span>
        </h1>

        <div className="results-grid">
          <div className="result-item">
            <span className="result-icon">🌾</span>
            <p className="result-value">{yieldInTonsPerAcre.toFixed(3)} tons</p>
            <p className="result-label">Predicted Yield per acre</p>
          </div>

          <div className="result-item">
            <span className="result-icon">💰</span>
            <p className="result-value">₹ {parseFloat(results.msp).toLocaleString('en-IN')}</p>
            <p className="result-label">Current MSP per ton</p>
          </div>
          
          <div className="result-item">
            <span className="result-icon">📈</span>
            <p className="result-value">₹ {totalProfit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="result-label">Estimated Profit</p>
          </div>
        </div>

        <button className="back-button" onClick={() => navigate(-1)}>
          Recalculate
        </button>
      </div>
    </main>
  );
};

export default YieldResultPage;