import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function StockDashboard() {
  const [darkMode, setDarkMode] = useState(true);
  const [stocks] = useState([
    "MURA",
    "TMC",
    "MP",
    "PLUG",
    "USAR",
    "NB",
    "ARBB",
    "OST",
  ]);
  const [data, setData] = useState({});

  const toggleTheme = () => setDarkMode(!darkMode);

  useEffect(() => {
    const fetchData = async () => {
      const responses = await Promise.all(
        stocks.map((ticker) =>
          fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=5d`
          ).then((res) => res.json())
        )
      );

      const formatted = {};
      responses.forEach((res, i) => {
        const chart = res.chart.result?.[0];
        if (chart) {
          const prices = chart.indicators.quote[0].close.map((p, idx) => ({
            time: new Date(chart.timestamp[idx] * 1000).toLocaleDateString(),
            price: p,
          }));
          formatted[stocks[i]] = prices;
        }
      });
      setData(formatted);
    };

    fetchData();
    const interval = setInterval(fetchData, 1000 * 60 * 5); // Refresh every 5 mins
    return () => clearInterval(interval);
  }, [stocks]);

  return (
    <div
      className={
        darkMode
          ? "bg-black text-white min-h-screen p-4"
          : "bg-white text-black min-h-screen p-4"
      }
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📈 Stock Tracker Dashboard</h1>
        <Button onClick={toggleTheme}>
          {darkMode ? <Sun /> : <Moon />}
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stocks.map((ticker) => (
          <Card key={ticker} className="rounded-2xl shadow-lg">
            <CardContent>
              <h2 className="text-xl font-semibold mb-2">{ticker}</h2>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data[ticker]}>
                    <XAxis dataKey="time" hide />
                    <YAxis domain={["auto", "auto"]} hide />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#8884d8"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
