// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import StockPage from './components/StockPage';
import CorrelationHeatmap from './components/CorrelationHeatmap';
import Navbar from './components/Navbar';
import './App.css'; // Global CSS for the app

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/stock" replace />} /> {/* Redirect to stock page */}
            <Route path="/stock" element={<StockPage />} />
            <Route path="/heatmap" element={<CorrelationHeatmap />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;