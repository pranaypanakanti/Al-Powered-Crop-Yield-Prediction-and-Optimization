// src/pages/LocationSetupPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LocationSetupPage.css';

const LocationSetupPage = () => {
    // State for the text in the input box
    const [locationInput, setLocationInput] = useState('');
    // State for the results from the API
    const [searchResults, setSearchResults] = useState([]);
    // State for the exact acre size
    const [farmSize, setFarmSize] = useState('');
    // State for any API errors
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // This function runs every time the user types in the location box
    const handleLocationChange = async (e) => {
        const value = e.target.value;
        setLocationInput(value);
        setError('');

        if (value.length > 0) {
            try {
                // Fetching location suggestions from the backend
                const response = await axios.get(`http://localhost:8080/api/state/search?keyword=${value}`);
                // Ensure we handle cases where the backend might wrap results
                const data = response.data.results || response.data; 
                setSearchResults(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Error fetching locations:", err);
                setError('Could not fetch locations. Is the server running?');
                setSearchResults([]);
            }
        } else {
            setSearchResults([]);
        }
    };

    // This function runs when a user clicks on a search result
    const handleResultClick = (locationName) => {
        setLocationInput(locationName);
        setSearchResults([]); // Hide the results list after selection
    };

    const handleContinue = () => {
        // Simple validation to ensure both fields are filled
        if (!locationInput.trim() || !farmSize) {
            alert('Please fill in both your location and farm size.');
            return;
        }

        // Navigate to the dashboard and pass the data in the 'state' object
        navigate('/dashboard', {
            state: {
                location: locationInput,
                farmSize: parseFloat(farmSize) // Ensure farmSize is a number
            }
        });
    };

    return (
        <main className="main-content setup-content">
            <div className="input-section">
                <h2>What's your location?</h2>
                <div className="search-wrapper">
                    <input
                        type="text"
                        className="styled-input"
                        placeholder="Start typing your city or district..."
                        value={locationInput}
                        onChange={handleLocationChange}
                        autoComplete="off"
                    />
                    {searchResults.length > 0 && (
                        <ul className="search-results-list">
                            {/* Assuming the backend returns an array of strings */}
                            {searchResults.map((location, index) => (
                                <li
                                    key={index}
                                    onClick={() => handleResultClick(location)}
                                >
                                    {location}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <p>Select your current state or union territory</p>
                {error && <p className="error-message">{error}</p>}
            </div>

            <div className="input-section">
                <h2>What's the area of your land?</h2>
                <input
                    type="number"
                    className="styled-input"
                    placeholder="e.g., 7.5"
                    value={farmSize}
                    onChange={(e) => setFarmSize(e.target.value)}
                    step="0.1"
                    min="0"
                />
                <p>Enter the exact area of your land in acres</p>
            </div>

            {/* The button now calls handleContinue, which just navigates */}
            <button className="continue-button" onClick={handleContinue}>
                Continue
            </button>
        </main>
    );
};

export default LocationSetupPage;