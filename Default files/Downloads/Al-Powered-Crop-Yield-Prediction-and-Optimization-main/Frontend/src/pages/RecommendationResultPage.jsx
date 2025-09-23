// src/pages/RecommendationResultPage.jsx

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './RecommendationResultPage.css';

const RecommendationResultPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const results = location.state?.results;
  const area = location.state?.area;

  if (!results || results.length === 0) {
    return (
      <main className="main-content recommendation-content">
        <div className="recommendation-card">
          <h1>No Recommendations Available</h1>
          <p>We couldn't generate recommendations for the provided location and area.</p>
          <button className="back-button" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="main-content recommendation-content">
      <div className="recommendation-card">
        <h1 className="recommendation-title">Top Crop Recommendations</h1>
        <div className="recommendation-list">
          {results.map((crop, index) => {
            const yieldInTonsPerHectare = parseFloat(crop.predicted_yield);
            const mspValue = parseFloat(crop.msp);
            const yieldInTonsPerAcre = yieldInTonsPerHectare / 2.47105;
            const totalProfit = yieldInTonsPerAcre * area * mspValue;

            return (
              <div className="crop-item" key={index}>
                {/* THIS IS THE FIX:
                  Changed from crop.cropName to crop.crop, which is the more
                  likely key name being sent from your backend.
                */}
                <h2 className="crop-name">{crop.crop}</h2>
                <div className="crop-details-grid">
                  <div className="detail-item">
                    <span className="detail-value">{yieldInTonsPerAcre.toFixed(3)} tons</span>
                    <span className="detail-label">Yield / acre</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-value">₹ {mspValue.toLocaleString('en-IN')}</span>
                    <span className="detail-label">MSP / ton</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-value profit-value">₹ {totalProfit.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                    <span className="detail-label">Est. Profit</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <button className="back-button" onClick={() => navigate(-1)}>
          Back to Dashboard
        </button>
      </div>
    </main>
  );
};

export default RecommendationResultPage;