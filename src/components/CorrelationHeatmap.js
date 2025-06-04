
// src/components/CorrelationHeatmap.js
import React, { useState, useEffect, useCallback } from 'react';
import { fetchAllStocks, fetchStockPrices } from '../api';
import LoadingSpinner from './LoadingSpinner';
import '../CorrelationHeatmap.css'; // Create this CSS file

const timeIntervals = [5, 15, 30, 60, 120]; // In minutes

// Helper function to calculate mean
const calculateMean = (arr) => arr.reduce((sum, val) => sum + val, 0) / arr.length;

// Helper function to calculate standard deviation
const calculateStandardDeviation = (arr, mean) => {
  const n = arr.length;
  if (n <= 1) return 0; // Standard deviation is undefined for n <= 1
  const sumOfSquares = arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0);
  return Math.sqrt(sumOfSquares / (n - 1));
};

// Helper function to calculate covariance
const calculateCovariance = (arr1, mean1, arr2, mean2) => {
  const n = arr1.length;
  if (n === 0) return 0;
  let sumOfProducts = 0;
  for (let i = 0; i < n; i++) {
    sumOfProducts += (arr1[i] - mean1) * (arr2[i] - mean2);
  }
  return sumOfProducts / (n - 1);
};

// Helper function to calculate Pearson's Correlation Coefficient
const calculatePearsonCorrelation = (prices1, prices2) => {
  if (prices1.length === 0 || prices2.length === 0) return 0;

  // Assume prices are aligned by time; take the minimum length if not
  const n = Math.min(prices1.length, prices2.length);
  const vals1 = prices1.slice(0, n).map(p => p.price);
  const vals2 = prices2.slice(0, n).map(p => p.price);

  const mean1 = calculateMean(vals1);
  const mean2 = calculateMean(vals2);

  const stdDev1 = calculateStandardDeviation(vals1, mean1);
  const stdDev2 = calculateStandardDeviation(vals2, mean2);

  if (stdDev1 === 0 || stdDev2 === 0) return 0; // Avoid division by zero if no variance

  const covariance = calculateCovariance(vals1, mean1, vals2, mean2);

  return covariance / (stdDev1 * stdDev2);
};

const CorrelationHeatmap = () => {
  const [stocks, setStocks] = useState([]);
  const [selectedStock1, setSelectedStock1] = useState('');
  const [selectedStock2, setSelectedStock2] = useState('');
  const [selectedInterval, setSelectedInterval] = useState(5);
  const [correlation, setCorrelation] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getStocks = async () => {
      setLoading(true);
      const allStocks = await fetchAllStocks();
      setStocks(allStocks);
      if (allStocks.length >= 2) {
        setSelectedStock1(allStocks[0]);
        setSelectedStock2(allStocks[1]);
      } else if (allStocks.length === 1) {
        setSelectedStock1(allStocks[0]);
      }
      setLoading(false);
    };
    getStocks();
  }, []);

  const calculateAndDisplayCorrelation = useCallback(async () => {
    if (selectedStock1 && selectedStock2 && selectedInterval && selectedStock1 !== selectedStock2) {
      setLoading(true);
      const prices1 = await fetchStockPrices(selectedStock1, selectedInterval);
      const prices2 = await fetchStockPrices(selectedStock2, selectedInterval);

      const correlationValue = calculatePearsonCorrelation(prices1, prices2);
      setCorrelation(correlationValue);
      setLoading(false);
    } else {
      setCorrelation(null); // Reset if selection is invalid
    }
  }, [selectedStock1, selectedStock2, selectedInterval]);

  useEffect(() => {
    calculateAndDisplayCorrelation();
  }, [calculateAndDisplayCorrelation]);

  const getCorrelationColor = (value) => {
    if (value === null) return '#ccc'; // Grey for no data
    if (value >= 0.7) return '#28a745'; // Strong positive: Green
    if (value >= 0.3) return '#ffc107'; // Moderate positive: Yellow
    if (value >= -0.3) return '#ADD8E6'; // Weak/No correlation: Light Blue
    if (value >= -0.7) return '#fd7e14'; // Moderate negative: Orange
    return '#dc3545'; // Strong negative: Red
  };

  const getCorrelationLabel = (value) => {
    if (value === null) return 'N/A';
    if (value >= 0.7) return 'Strong Positive';
    if (value >= 0.3) return 'Moderate Positive';
    if (value >= -0.3) return 'Weak/No Correlation';
    if (value >= -0.7) return 'Moderate Negative';
    return 'Strong Negative';
  };


  return (
    <div className="heatmap-container">
      <h2>Stock Correlation Heatmap (Simplified)</h2>
      <p>This section calculates the Pearson Correlation Coefficient between two selected stocks. A full heatmap visualization would involve more complex charting libraries.</p>

      <div className="controls">
        <label htmlFor="stock1-select">Select Stock 1:</label>
        <select id="stock1-select" value={selectedStock1} onChange={(e) => setSelectedStock1(e.target.value)}>
          {stocks.map((ticker) => (
            <option key={stock1-${ticker}} value={ticker}>
              {ticker}
            </option>
          ))}
        </select>

        <label htmlFor="stock2-select">Select Stock 2:</label>
        <select id="stock2-select" value={selectedStock2} onChange={(e) => setSelectedStock2(e.target.value)}>
          {stocks.map((ticker) => (
            <option key={stock2-${ticker}} value={ticker}>
              {ticker}
            </option>
          ))}
        </select>

        <label htmlFor="interval-select-heatmap">Select Interval (minutes):</label>
        <select id="interval-select-heatmap" value={selectedInterval} onChange={(e) => setSelectedInterval(Number(e.target.value))}>
          {timeIntervals.map((interval) => (
            <option key={interval-heatmap-${interval}} value={interval}>
              {interval}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="correlation-results">
          {selectedStock1 && selectedStock2 && selectedStock1 === selectedStock2 ? (
            <p className="error-message">Please select two different stocks for correlation.</p>
          ) : (
            <>
              {correlation !== null ? (
                <div className="correlation-display">
                  <h3>Correlation between {selectedStock1} and {selectedStock2}</h3>
                  <div className="correlation-value-box" style={{ backgroundColor: getCorrelationColor(correlation) }}>
                    <p className="correlation-value">{correlation.toFixed(4)}</p>
                    <p className="correlation-label">{getCorrelationLabel(correlation)}</p>
                  </div>
                </div>
              ) : (
                <p>Select two stocks and an interval to see their correlation.</p>
              )}

              <div className="correlation-legend">
                <h4>Correlation Strength Legend:</h4>
                <ul>
                  <li style={{ backgroundColor: getCorrelationColor(0.8) }}>Strong Positive (0.7 to 1)</li>
                  <li style={{ backgroundColor: getCorrelationColor(0.5) }}>Moderate Positive (0.3 to 0.7)</li>
                  <li style={{ backgroundColor: getCorrelationColor(0) }}>Weak/No Correlation (-0.3 to 0.3)</li>
                  <li style={{ backgroundColor: getCorrelationColor(-0.5) }}>Moderate Negative (-0.7 to -0.3)</li>
                  <li style={{ backgroundColor: getCorrelationColor(-0.8) }}>Strong Negative (-1 to -0.7)</li>
                </ul>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CorrelationHeatmap;