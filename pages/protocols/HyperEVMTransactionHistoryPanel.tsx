import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import { getCached, setCached } from "../../utils/cache";

// List of tokens to show in dropdown
const tokenOptions = [
  { id: 'last-usd',                         name: 'USDXL' },
  { id: 'felix-feusd',                      name: 'feUSD' },
  { id: 'kei-stablecoin',                   name: 'KEI'},
  { id: 'hyperstable',                      name: 'USH'},
  { id: 'hyperevm-bridged-usr-hyperevm',    name: 'USR'},
  { id: 'hyperevm-bridged-usde-hyperevm',   name: 'USDe' },
  { id: 'hyper-usd',                        name: 'USDHL' },
  { id: 'hyperbeat-usdt',                   name: 'hbUSDT'}
];


// const seriesColor = "#38c8ff";

async function fetchVolumeHistoryFromGecko(id, days = 30) {
  const cacheKey = `cg_volume_${id}_${days}`;
  const cached = getCached(cacheKey, 30 * 60 * 1000); // 30 minutes
  if (cached) return cached;

  const url = `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}`;
  try {
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const data = await resp.json();
    if (!data || !Array.isArray(data.total_volumes) || !data.total_volumes.length) return null;
    const result = data.total_volumes.map(([ts, volume]) => ({
      date: new Date(ts).toISOString().slice(0, 10),
      volume: volume || 0,
    }));
    setCached(cacheKey, result);
    return result;
  } catch (err) {
    console.error(`Failed to fetch CoinGecko volume for ${id}:`, err);
    return null;
  }
}

export default function SelectableStablecoinVolumeChart() {
  const [selectedToken, setSelectedToken] = useState(tokenOptions[0].id);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      setChartData(null);
      const arr = await fetchVolumeHistoryFromGecko(selectedToken, 30); // 30 days or as you wish
      if (!arr || arr.every(x => x.volume == null)) {
        setError("No volume data available for this token from CoinGecko.");
        setChartData(null);
      } else {
        setChartData({
          labels: arr.map(x => x.date),
          datasets: [
            {
              label: "Daily Volume (USD)",
              data: arr.map(x => x.volume),
              borderColor: "#38c8ff",
              backgroundColor: "rgba(56,200,255,0.07)",
              tension: 0.01,       // Smoother line!
              pointRadius: 0,     // No dots
              borderWidth: 3
            },
          ],
        });
      }
      setLoading(false);
    }
    fetchData();
  }, [selectedToken]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, labels: { color: "#38c8ff" } },
      tooltip: {
        callbacks: {
          label: ctx => `Volume: $${ctx.parsed.y?.toLocaleString("en-US",{maximumFractionDigits:0})}`,
        },
      },
    },
    scales: {
      x: { ticks: { color: "#b8e7ff" } },
      y: {
        title: { display: true, text: "Trading Volume (USD)", color: "#b8e7ff" },
        ticks: {
          color: "#b8e7ff",
          callback: val => val >= 1_000_000 ? `$${Math.round(val/1_000_000)}M` : `$${Math.round(val/1_000) || 0}K`,
        },
        grid: { color: "#213041" }
      }
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: 600, margin: "auto", alignItems: "center", display: "flex", flexDirection: "column" }}>
      <h2 style={{ color: "#38c8ff", marginBottom: "12px" }}>
        Stablecoin Volume History ({tokenOptions.find(t => t.id === selectedToken).name})
      </h2>
      <div style={{ marginBottom: 16 }}>
        {tokenOptions.map(t =>
          <button key={t.id}
            onClick={() => setSelectedToken(t.id)}
            style={{
              margin: 4,
              padding: '6px 14px',
              borderRadius: 4,
              background: t.id === selectedToken ? "#263b48" : "#16232a",
              color: t.id === selectedToken ? "#38c8ff" : "#b8e7ff",
              cursor: 'pointer', border: 'none'
            }}>
            {t.name}
          </button>
        )}
      </div>
      {loading ? (
        <div style={{
          color: "#aaa",
          textAlign: "center",
          marginTop: 32,
          fontSize: 18
        }}>Loading chart...</div>
      ) : error ? (
        <div style={{ color: 'red', marginTop: 24 }}>{error}</div>
      ) : chartData ? (
        <Line data={chartData} options={chartOptions} height={320} />
      ) : (
        <div style={{ color: 'red' }}>No chart data available</div>
      )}
    </div>
  );
}
