import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './StablecoinDashboard.module.css'; // Adjust the path as needed
import MarketCapChart from './MarketCapChart';
import StablecoinTokenList from "../pages/protocols/StablecoinProtocolsDashboard";
import { getCached, setCached } from "../utils/cache";



type TokenData = {
  id: string;
  symbol: string;
  rSymbol?: string; // optional, for rendering purposes
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_30d_in_currency?: number;
};

// For Defi Lama Stablecoins Supported

// exact casing & desired order
const tokenIds = [
  { id: 'last-usd',                         symbol: 'USDXL',  rSymbol: 'USDXL' },
  { id: 'felix-feusd',                      symbol: 'feUSD',  rSymbol: 'feUSD' },
  { id: 'kei-stablecoin',                   symbol: 'KEI',    rSymbol: 'KEI' },
  { id: 'hyperstable',                      symbol: 'USH',    rSymbol: 'USH' },
  { id: 'hyperevm-bridged-usr-hyperevm',    symbol: 'USR',    rSymbol: 'USR' },
  { id: 'hyperevm-bridged-usde-hyperevm',   symbol: 'USDe',   rSymbol: 'USDe' },
  { id: 'hyper-usd',                        symbol: 'USDHL',  rSymbol: 'USDHL' },
  { id: 'hyperbeat-usdt',                   symbol: 'hbUSDT', rSymbol: 'hbUSDT' }
];

export default function StablecoinDashboard() {
  const [tokenData, setTokenData] = useState<TokenData[]>([]);

useEffect(() => {
  const idsParam = tokenIds.map(t => t.id).join(',');
  const cacheKey = `cg_dashboard_markets_${idsParam}`;
  const cached = getCached(cacheKey, 60 * 1000); // 60 seconds
  if (cached) {
    setTokenData(cached);
    return;
  }
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${idsParam}&price_change_percentage=30d`;
  fetch(url)
    .then(res => res.json())
    .then((data) => {
      const ordered = tokenIds
        .map(t => {
          const coin = data.find(c => c.id === t.id);
          return coin ? { ...coin, symbol: t.symbol, rSymbol: t.rSymbol } : null;
        })
        .filter(Boolean);
      setTokenData(ordered);
      setCached(cacheKey, ordered);
    })
    .catch(err => console.error('Failed to fetch CoinGecko data:', err));
}, []);

  return (
    <div className={styles.dashboardContainer}>
      <StablecoinTokenList />
      <div className={styles.placeholder}><MarketCapChart/></div>

      {/* === Token Grid === */}
      <div className={styles.gridContainer}>
        {tokenData.map(token => {
          const routeSymbol = token.rSymbol ? token.rSymbol.toLowerCase() : token.symbol.toLowerCase();
          const pct30d = token.price_change_percentage_30d_in_currency;
          const pctText =
            typeof pct30d === 'number'
              ? `${pct30d.toFixed(2)}%`
              : '—';

          const pctClass =
            typeof pct30d === 'number'
              ? pct30d >= 0
                ? { color: '#0a8f5a' }
                : { color: '#c62828' }
              : {};
          return (
            <Link
              href={`/coins/${routeSymbol}`}
              key={token.id}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className={styles.tokenCard}>
                <Image src={token.image} alt={token.name} width={40} height={40} className={styles.tokenImage} />
                <div>
                  <h3 className={styles.tokenSymbol}>{token.symbol}</h3>
                  <p className={styles.tokenPrice}>Price: ${token.current_price.toFixed(3)}</p>
                  <p className={styles.tokenMarketCap}>Market Cap: {formatMarketCap(token.market_cap)}</p>
                  <p style={{ margin: '4px 0' }}>30d Change: <span style={pctClass as any}>{pctText}</span></p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1_000_000_000) return `$${(marketCap / 1_000_000_000).toFixed(2)}B`;
  if (marketCap >= 1_000_000)     return `$${(marketCap / 1_000_000).toFixed(2)}M`;
  if (marketCap >= 1_000)         return `$${(marketCap / 1_000).toFixed(2)}K`;
  return `$${marketCap.toFixed(2)}`;
}