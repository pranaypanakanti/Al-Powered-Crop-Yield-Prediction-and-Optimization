// src/pages/LanguageSelectionPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LanguageSelectionPage.css';

const LanguageSelectionPage = () => {
    const [selectedLang, setSelectedLang] = useState(''); 
    const navigate = useNavigate();

    const handleConfirm = () => {
        if (selectedLang === 'English') navigate('/setup');
        else if (selectedLang) alert(`The ${selectedLang} language journey is not yet available...`);
        else alert('Please select a language before confirming.');
    };

    const languages = [ { name: 'English', native: 'English' }, { name: 'Hindi', native: 'हिंदी' }, { name: 'Odia', native: 'Odia' }, { name: 'Telugu', native: 'తెలుగు' } ];

    return (
        <main className="main-content">
            <h2>Select your language</h2>
            <div className="language-grid">
                {languages.map((lang) => (
                    <button key={lang.name} className={`lang-button ${selectedLang === lang.name ? 'selected' : ''}`} onClick={() => setSelectedLang(lang.name)}>
                        <span className="lang-en">{lang.name}</span>
                        <span className="lang-native">{lang.native}</span>
                    </button>
                ))}
            </div>
            <button className="confirm-button" onClick={handleConfirm}>Confirm Selection</button>
        </main>
    );
};

export default LanguageSelectionPage;