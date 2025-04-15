import React, { useEffect, useState } from "react";

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [stocks] = useState(["MURA", "TMC", "MP", "PLUG", "USAR", "NB", "ARBB", "OST"]);
  const [prices, setPrices] = useState({});

  const toggleTheme = () => setDarkMode(!darkMode);

  useEffect(() => {
    const fetchPrices = async () => {
      const updatedPrices = {};
      for (const symbol of stocks) {
        const response = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`
        );
        const data = await response.json();
        const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
        updatedPrices[symbol] = price;
      }
      setPrices(updatedPrices);
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 1000 * 60 * 5);
    return () => clearInterval(interval);
  }, [stocks]);

  return (
    <div style={{
      backgroundColor: darkMode ? "#000" : "#fff",
      color: darkMode ? "#fff" : "#000",
      minHeight: "100vh",
      padding: "2rem"
    }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>📈 Stock Tracker</h1>
      <button
        onClick={toggleTheme}
        style={{
          padding: "0.5rem 1rem",
          margin: "1rem 0",
          backgroundColor: darkMode ? "#444" : "#ddd",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        Toggle {darkMode ? "Light" : "Dark"} Mode
      </button>
      <ul>
        {stocks.map((symbol) => (
          <li key={symbol} style={{ marginBottom: "10px", fontSize: "18px" }}>
            {symbol}: ${prices[symbol] ? prices[symbol].toFixed(2) : "Loading..."}
          </li>
        ))}
      </ul>
    </div>
  );
}
