// src/components/StockPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { fetchAllStocks, fetchStockPrices } from '../api';
import LoadingSpinner from './LoadingSpinner';
import '../StockPage.css'; // Create this CSS file

const timeIntervals = [5, 15, 30, 60, 120]; // In minutes

const StockPage = () => {
  const [stocks, setStocks] = useState([]);
  const [selectedTicker, setSelectedTicker] = useState('');
  const [selectedInterval, setSelectedInterval] = useState(5);
  const [stockPrices, setStockPrices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [averagePrice, setAveragePrice] = useState(0);

  // Fetch all available stocks on component mount
  useEffect(() => {
    const getStocks = async () => {
      setLoading(true);
      const allStocks = await fetchAllStocks();
      setStocks(allStocks);
      if (allStocks.length > 0) {
        setSelectedTicker(allStocks[0]); // Select the first stock by default
      }
      setLoading(false);
    };
    getStocks();
  }, []);

  // Fetch stock prices whenever ticker or interval changes
  const getStockPrices = useCallback(async () => {
    if (selectedTicker && selectedInterval) {
      setLoading(true);
      const prices = await fetchStockPrices(selectedTicker, selectedInterval);
      setStockPrices(prices);

      // Calculate average price
      if (prices.length > 0) {
        const sum = prices.reduce((acc, current) => acc + current.price, 0);
        setAveragePrice(sum / prices.length);
      } else {
        setAveragePrice(0);
      }
      setLoading(false);
    }
  }, [selectedTicker, selectedInterval]);

  useEffect(() => {
    getStockPrices();
  }, [getStockPrices]);

  const handleTickerChange = (e) => {
    setSelectedTicker(e.target.value);
  };

  const handleIntervalChange = (e) => {
    setSelectedInterval(Number(e.target.value));
  };

  return (
    <div className="stock-page-container">
      <h2>Stock Price Aggregation</h2>

      <div className="controls">
        <label htmlFor="stock-select">Select Stock:</label>
        <select id="stock-select" value={selectedTicker} onChange={handleTickerChange}>
          {stocks.map((ticker) => (
            <option key={ticker} value={ticker}>
              {ticker}
            </option>
          ))}
        </select>

        <label htmlFor="interval-select">Select Interval (minutes):</label>
        <select id="interval-select" value={selectedInterval} onChange={handleIntervalChange}>
          {timeIntervals.map((interval) => (
            <option key={interval} value={interval}>
              {interval}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="stock-data">
          {stockPrices.length > 0 ? (
            <>
              <h3>{selectedTicker} Price Data (Last {selectedInterval} Minutes)</h3>
              <p className="average-price">Average Price: ${averagePrice.toFixed(2)}</p>
              <table className="price-table">
                <thead>
                  <tr>
                    <th>Price</th>
                    <th>Last Updated At</th>
                  </tr>
                </thead>
                <tbody>
                  {stockPrices.map((data, index) => (
                    <tr key={index}>
                      <td>${data.price.toFixed(5)}</td>
                      <td>{new Date(data.lastUpdatedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <p>No data available for the selected stock and interval.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default StockPage;