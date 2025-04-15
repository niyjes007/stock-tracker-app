import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function App() {
  const [stocks] = useState(["MURA", "TMC", "MP", "PLUG", "USAR", "NB", "ARBB", "OST"]);
  const [prices, setPrices] = useState({});
  const [buyPrices, setBuyPrices] = useState({});
  const [alerts, setAlerts] = useState({});
  const [chartData, setChartData] = useState({});
  const [darkMode, setDarkMode] = useState(true);

  const toggleTheme = () => setDarkMode(!darkMode);

  useEffect(() => {
    const fetchData = async () => {
      const updatedPrices = {};
      const updatedCharts = {};

      for (const symbol of stocks) {
        try {
          const response = await fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1d&interval=5m`
          );
          const data = await response.json();
          const chart = data?.chart?.result?.[0];
          const price = chart?.meta?.regularMarketPrice;
          if (price) {
            updatedPrices[symbol] = price;
          }

          const closes = chart?.indicators?.quote?.[0]?.close;
          const timestamps = chart?.timestamp;
          if (closes && timestamps) {
            const formatted = closes.map((price, i) => ({
              time: new Date(timestamps[i] * 1000).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              price: price,
            }));
            updatedCharts[symbol] = formatted;
          }
        } catch (err) {
          console.error(`Error fetching ${symbol}:`, err);
        }
      }

      setPrices(updatedPrices);
      setChartData(updatedCharts);
    };

    fetchData();
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, [stocks]);

  const handleBuyPriceChange = (symbol, value) => {
    setBuyPrices({ ...buyPrices, [symbol]: parseFloat(value) });
  };

  const handleAlertChange = (symbol, value) => {
    setAlerts({ ...alerts, [symbol]: parseFloat(value) });
  };

  const getGainLoss = (symbol) => {
    const buy = buyPrices[symbol];
    const current = prices[symbol];
    if (!buy || !current) return null;
    const change = ((current - buy) / buy) * 100;
    return change.toFixed(2);
  };

  return (
    <div
      style={{
        backgroundColor: darkMode ? "#0d1117" : "#ffffff",
        color: darkMode ? "#f0f6fc" : "#000000",
        fontFamily: "Inter, sans-serif",
        minHeight: "100vh",
        padding: "2rem",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>📈 Stock Tracker</h1>
        <button
          onClick={toggleTheme}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: darkMode ? "#161b22" : "#e0e0e0",
            border: "none",
            borderRadius: "8px",
            color: darkMode ? "#f0f6fc" : "#000",
          }}
        >
          Toggle {darkMode ? "Light" : "Dark"} Mode
        </button>
      </div>

      <div
        style={{
          marginTop: "2rem",
          display: "grid",
          gap: "1.5rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        }}
      >
        {stocks.map((symbol) => {
          const price = prices[symbol];
          const gainLoss = getGainLoss(symbol);
          const alertPrice = alerts[symbol];
          const shouldAlert = alertPrice && price >= alertPrice;

          return (
            <div
              key={symbol}
              style={{
                backgroundColor: darkMode ? "#161b22" : "#f9f9f9",
                padding: "1.5rem",
                borderRadius: "16px",
                boxShadow: darkMode
                  ? "0 4px 12px rgba(255, 255, 255, 0.05)"
                  : "0 4px 12px rgba(0, 0, 0, 0.08)",
              }}
            >
              <h2 style={{ fontSize: "20px", marginBottom: "0.5rem" }}>{symbol}</h2>
              <p style={{ fontSize: "18px", fontWeight: "bold" }}>
                {price ? `$${price.toFixed(2)}` : "Loading..."}
              </p>
              {gainLoss !== null && (
                <p
                  style={{
                    color: gainLoss >= 0 ? "#00c853" : "#ff5252",
                    fontWeight: "bold",
                  }}
                >
                  {gainLoss}% {gainLoss >= 0 ? "↑" : "↓"}
                </p>
              )}

              {chartData[symbol] && (
                <div style={{ height: "150px", marginTop: "1rem" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData[symbol]}>
                      <XAxis dataKey="time" hide />
                      <YAxis domain={["auto", "auto"]} hide />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="#42a5f5"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div style={{ marginTop: "1rem" }}>
                <label style={{ fontSize: "14px" }}>Buy Price:</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 2.75"
                  value={buyPrices[symbol] || ""}
                  onChange={(e) => handleBuyPriceChange(symbol, e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    marginTop: "0.25rem",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>

              <div style={{ marginTop: "1rem" }}>
                <label style={{ fontSize: "14px" }}>Alert if above:</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 3.50"
                  value={alerts[symbol] || ""}
                  onChange={(e) => handleAlertChange(symbol, e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    marginTop: "0.25rem",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                  }}
                />
                {shouldAlert && (
                  <p style={{ marginTop: "0.5rem", color: "#ffc107", fontWeight: "bold" }}>
                    🔔 {symbol} is above ${alertPrice}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
