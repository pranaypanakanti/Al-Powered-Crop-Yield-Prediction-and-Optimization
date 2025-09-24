// src/App.jsx

import { Routes, Route } from 'react-router-dom';
import AppLayout from './pages/AppLayout';
import LanguageSelectionPage from './pages/LanguageSelectionPage';
import LocationSetupPage from './pages/LocationSetupPage';
import DashboardPage from './pages/DashboardPage';
import YieldResultPage from './pages/YieldResultPage';
import RecommendationResultPage from './pages/RecommendationResultPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<LanguageSelectionPage />} />
        <Route path="setup" element={<LocationSetupPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="yield-prediction" element={<YieldResultPage />} />
        <Route path="recommendation" element={<RecommendationResultPage />} />
      </Route>
    </Routes>
  );
}

export default App;