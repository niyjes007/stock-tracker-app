import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function App() {
  const [symbol, setSymbol] = useState("TSLA");
  const [input, setInput] = useState("TSLA");
  const [data, setData] = useState([]);
  const [trend, setTrend] = useState("Loading...");

  const fetchStockData = async () => {
    try {
      const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1d&interval=5m`
      );
      const result = await response.json();
      const chart = result.chart.result[0];
      const timestamps = chart.timestamp;
      const prices = chart.indicators.quote[0];
      const formattedData = timestamps.map((time, i) => ({
        time: new Date(time * 1000).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        close: prices.close[i],
        volume: prices.volume[i],
      }));
      setData(formattedData);
      detectTrend(formattedData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setTrend("Error loading data");
    }
  };

  const detectTrend = (data) => {
    if (!data.length) return setTrend("No data available");

    const closes = data.map((d) => d.close);
    const avg20 = closes.slice(-20).reduce((a, b) => a + b, 0) / 20;
    const avg50 = closes.slice(-50).reduce((a, b) => a + b, 0) / 50;

    let rsi;
    let gains = 0;
    let losses = 0;
    for (let i = 1; i < 15; i++) {
      const diff = closes[closes.length - i] - closes[closes.length - i - 1];
      if (diff >= 0) gains += diff;
      else losses -= diff;
    }
    const rs = gains / (losses || 1);
    rsi = 100 - 100 / (1 + rs);

    const latest = closes[closes.length - 1];
    let result = "Neutral";
    if (rsi > 60 && latest > avg20 && avg20 > avg50) result = "Bullish";
    else if (rsi < 40 && latest < avg20 && avg20 < avg50) result = "Bearish";

    setTrend(`${result} (RSI: ${rsi.toFixed(2)})`);
  };

  useEffect(() => {
    fetchStockData();
  }, [symbol]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSymbol(input.toUpperCase());
  };

  return (
    <div
      style={{
        backgroundColor: "#0d1117",
        color: "#f0f6fc",
        minHeight: "100vh",
        padding: "2rem",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>📊 Trend Detector</h1>
      <form onSubmit={handleSearch} style={{ marginTop: "1rem", marginBottom: "2rem" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter stock symbol (e.g., TSLA)"
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            border: "1px solid #444",
            marginRight: "1rem",
            width: "200px",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#238636",
            border: "none",
            color: "white",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Analyze
        </button>
      </form>

      <h2 style={{ fontSize: "18px", marginBottom: "1rem" }}>Current Trend: {trend}</h2>

      <div style={{ height: "300px", background: "#161b22", padding: "1rem", borderRadius: "12px" }}>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="time" hide />
              <YAxis domain={["auto", "auto"]} hide />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="close"
                stroke="#42a5f5"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p>Loading chart...</p>
        )}
      </div>
    </div>
  );
}
