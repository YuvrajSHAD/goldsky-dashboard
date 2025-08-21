import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type InteractionMode,
  type ChartOptions,
  type TimeUnit,
} from 'chart.js';
import { format } from 'date-fns';
import 'chartjs-adapter-date-fns';

ChartJS.register(LinearScale, TimeScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function MarketCapChart() {
  const [marketData, setMarketData] = useState<{ x: Date; y: number }[]>([]);
  const [totalMarketCap, setTotalMarketCap] = useState(0);
  const [change7d, setChange7d] = useState(0);
  const [percentChange7d, setPercentChange7d] = useState(0);
  const [usdcDominance, setUsdcDominance] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchMarketData = async () => {
      try {
        const response = await fetch('https://stablecoins.llama.fi/stablecoincharts/hyperliquid-l1');
        if (!response.ok) throw new Error(`Failed to fetch data: ${response.status}`);
        const historicalData = await response.json();

        // Safely access USDC dominance
        setUsdcDominance(historicalData[0]?.dominance?.usdc || 0);

        const formattedData = historicalData.map(
          (item: { date: number; totalCirculating: { peggedUSD: any } }) => ({
            x: new Date(item.date * 1000),
            y: item.totalCirculating?.peggedUSD || 0,
          })
        );

        if (!isMounted) return;

        setMarketData(formattedData);
        if (formattedData.length === 0) {
          setTotalMarketCap(0);
          setChange7d(0);
          setPercentChange7d(0);
          return;
        }

        const latestData = formattedData[formattedData.length - 1];
        setTotalMarketCap(latestData.y);

        const sevenDaysPrior = new Date(latestData.x);
        sevenDaysPrior.setDate(sevenDaysPrior.getDate() - 7);
        const dayMillis = 24 * 60 * 60 * 1000;

        const data7d =
          formattedData.find(
            (d: { x: { getTime: () => number } }) =>
              Math.abs(d.x.getTime() - sevenDaysPrior.getTime()) < dayMillis
          ) || latestData;

        const cap7d = data7d.y;
        const changeVal = latestData.y - cap7d;
        setChange7d(changeVal);
        const pctChange = cap7d === 0 ? 0 : (changeVal / cap7d) * 100;
        setPercentChange7d(pctChange);
        setError(null);
      } catch (err: any) {
        if (!isMounted) return;
        setError(err?.message || String(err));
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 60000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const chartData = {
    datasets: [
      {
        // label: 'Total Hyperliquid L1 Stablecoins Market Cap (USD)',
        data: marketData,
        borderColor: '#2c6fc2ff',
        backgroundColor: 'rgba(73, 153, 246, 0.10)',
        tension: 0.35,
        pointRadius: 0,
        borderWidth: 3,
        fill: true,
      },
    ],
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index' as InteractionMode,
        intersect: false,
        backgroundColor: '#23272F',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#39424E',
        borderWidth: 1,
        callbacks: {
          title: (context) => {
            const date = context[0].parsed.x;
            return format(new Date(date), 'dd MMM yyyy');
          },
          label: (context) => {
            const value = context.parsed.y;
            if (value >= 1_000_000_000) return `Mcap  $${(value / 1_000_000_000).toFixed(3)}b`;
            if (value >= 1_000_000) return `Mcap  $${(value / 1_000_000).toFixed(3)}m`;
            if (value >= 1_000) return `Mcap  $${(value / 1_000).toFixed(3)}k`;
            return `Mcap  $${value}`;
          },
        },
      },
    },
    layout: { padding: 24 },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'month' as TimeUnit,
          displayFormats: { month: 'MMM' },
          tooltipFormat: 'dd MMM yyyy',
        },
        ticks: {
          color: '#D4D8E8',
          font: { size: 14, weight: 500 },
          maxTicksLimit: 12,
          autoSkip: true,
        },
        grid: {
          color: '#23272F',
        },
        border: {
        color: '#39424E',
        display: true
       }
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#D4D8E8',
          font: { size: 14, weight: 500 },
          callback: (value) => {
            if (typeof value !== 'number') return value;
            if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(0)}b`;
            if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}m`;
            if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}k`;
            return `$${value}`;
},
        },
        grid: {
          color: '#23272F',
          borderColor: '#39424E',
          drawTicks: false,
          drawBorder: false,
        },
      },
    },
  };

  return (
    <div className="mView"
      style={{
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        color: '#151515',
        alignItems: 'stretch',
        background: '#15171D',
        border: '1px solid #151515',
        boxShadow: '0 0 2px rgba(48, 147, 108, 0.7)',
      }}
    >
      {/* Info Section (Left 30%) */}
      <div
        style={{
          flex: '0 0 30%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '32px',
          color: '#fff',
        }}
      >
        <div style={{ color: '#ffffffff', marginBottom: 4, fontSize: 18, fontWeight: 500 }}>
          Total Hyperliquid L1 Stablecoins Market Cap
        </div>
        <div
          style={{ fontSize: 28, fontWeight: 700, color: '#4999F6', lineHeight: 1.2, marginBottom: 16 }}
        >
          $
          {totalMarketCap >= 1_000_000_000
            ? (totalMarketCap / 1_000_000_000).toFixed(2) + 'b'
            : totalMarketCap >= 1_000_000
            ? (totalMarketCap / 1_000_000).toFixed(2) + 'm'
            : totalMarketCap.toFixed(2)}
        </div>
        <div style={{ color: '#ffffffff', marginBottom: 4, fontSize: 18, fontWeight: 500 }}>
          Change (7d)
        </div>
        <div
          style={{
            color: change7d >= 0 ? '#0a8f5a' : '#c62828',
            fontWeight: 700,
            fontSize: 15,
            marginBottom: 12,
          }}
        >
          {change7d >= 0 ? '+' : ''}
          {change7d.toLocaleString(undefined, { maximumFractionDigits: 0 })}{' '}
          ({percentChange7d.toFixed(1)}%) (7d)
        </div>
        {error && (
          <div style={{ color: '#c62828', marginTop: 16, fontWeight: 600 }}>
            Error: {error}
          </div>
        )}
      </div>
      {/* Chart Section (Right 70%) */}
      <div style={{ flex: '1 1 70%', padding: '24px 24px 24px 0' }}>
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
