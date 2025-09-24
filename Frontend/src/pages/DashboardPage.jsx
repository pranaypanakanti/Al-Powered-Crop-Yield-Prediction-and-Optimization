// src/pages/DashboardPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './DashboardPage.css';

const DashboardPage = () => {
    const [cropInput, setCropInput] = useState('');
    const [cropResults, setCropResults] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRecommending, setIsRecommending] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const setupData = location.state;

    useEffect(() => {
        if (!setupData || !setupData.location || !setupData.farmSize) {
            console.log("Redirecting: Missing setup data.");
            navigate('/setup');
        }
    }, [setupData, navigate]);

    const handleCropSearch = async (e) => {
        const value = e.target.value;
        setCropInput(value);

        if (value.length > 0) {
            try {
                const response = await axios.get(`http://localhost:8080/api/crop/search?keyword=${value}`);
                // Assuming the backend returns an array of strings directly
                const data = response.data.crops || response.data;
                setCropResults(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Crop search failed:", error);
                setCropResults([]);
            }
        } else {
            setCropResults([]);
        }
    };

    const handleCropResultClick = (cropName) => {
        setCropInput(cropName);
        setCropResults([]); // Hide the results list after selection
    };

    // src/pages/DashboardPage.jsx

// src/pages/DashboardPage.jsx

// src/pages/DashboardPage.jsx

// src/pages/DashboardPage.jsx

const handleYieldSubmit = async () => {
    if (!cropInput.trim()) {
        alert('Please select a crop before submitting.');
        return;
    }
    setIsSubmitting(true);

    // CORRECTED: Using the correct variable names from your component's state
    const paramsToSend = {
        state: setupData.location, // Was setupData.state
        area: setupData.farmSize,   // Was setupData.area
        crop: cropInput             // Was crop
    };

    try {
        const response = await axios.post('http://localhost:8080/api/predict', null, {
            params: paramsToSend
        });
        
        // CORRECTED: Passing the correct variables to the results page
        navigate('/yield-prediction', { 
            state: { 
                results: response.data, 
                area: setupData.farmSize,   // Was setupData.area
                cropName: cropInput         // Was crop
            } 
        });
    } catch (error) {
        console.error("Error submitting for prediction:", error);
        alert("There was an error submitting your request. Please try again.");
    } finally {
        setIsSubmitting(false);
    }
};

    // src/pages/DashboardPage.jsx

// src/pages/DashboardPage.jsx

const handleRecommendation = async () => {
    setIsRecommending(true);
    // CORRECTED: Using the correct variable names from your component's state
    const paramsToSend = {
        state: setupData.location, // Was setupData.state
        area: setupData.farmSize,   // Was setupData.area
    };

    try {
        const response = await axios.post('http://localhost:8080/api/recommend', null, {
            params: paramsToSend
        });
        
        navigate('/recommendation', { 
            state: { 
                results: response.data,
                area: setupData.farmSize 
            } 
        });
    } catch (error) {
        console.error("Error fetching recommendation:", error);
        alert("Could not fetch a recommendation at this time.");
    } finally {
        setIsRecommending(false);
    }
};

    return (
        <main className="main-content dashboard-content">
            <div className="option-box yield-box">
                <h2>Yield Prediction</h2>
                <div className="search-wrapper">
                    <input
                        type="text"
                        className="styled-select"
                        placeholder="Search and select your crop..."
                        value={cropInput}
                        onChange={handleCropSearch}
                        autoComplete="off"
                    />
                    {cropResults.length > 0 && (
                        <ul className="search-results-list">
                            {cropResults.map((crop, index) => (
                                <li
                                    key={index}
                                    onClick={() => handleCropResultClick(crop)}
                                >
                                    {crop}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <p>Select your desired crop to predict the quality of yield</p>
                <button className="submit-button" onClick={handleYieldSubmit} disabled={isSubmitting}>
                    {isSubmitting ? 'Predicting...' : 'Predict Yield'}
                </button>
            </div>

            <button
                className="option-box recommend-box"
                onClick={handleRecommendation}
                disabled={isRecommending}
            >
                <h2>Crop Recommendation</h2>
                <p>For AI based crop recommendation based on your location and area of land</p>
                {isRecommending && <p>Getting recommendation...</p>}
            </button>
        </main>
    );
};

export default DashboardPage;