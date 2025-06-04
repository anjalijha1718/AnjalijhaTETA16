// src/api.js
const BASE_URL = 'http://20.244.56.144/evaluation-service';

export const fetchAllStocks = async () => {
    try {
        const response = await fetch(${BASE_URL}/stocks);
        if (!response.ok) {
            throw new Error(HTTP error! status: ${response.status});
        }
        const data = await response.json();
        return data.stocks;
    } catch (error) {
        console.error("Error fetching all stocks:", error);
        return [];
    }
};

export const fetchStockPrices = async (ticker, minutes) => {
    try {
        const response = await fetch(${BASE_URL}/stocks/${ticker}?minutes=${minutes});
        if (!response.ok) {
            throw new Error(HTTP error! status: ${response.status});
        }
        const data = await response.json();
        return data; // This will be an array of objects: [{ price, lastUpdatedAt }]
    } catch (error) {
        console.error(Error fetching prices for ${ticker}:, error);
        return [];
    }
};