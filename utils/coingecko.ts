const BASE_URL = 'https://api.coingecko.com/api/v3';
const API_KEY = process.env.NEXT_PUBLIC_COINGECKO_API_KEY;
import { setCached, getCached } from "./cache";

export interface SimplePriceResponse {
  [id: string]: {
    usd: number;
    usd_market_cap?: number;
    usd_24hr_vol?: number;
  };
}

export async function fetchSimplePrice(coingeckoId) {
  const cacheKey = `cg_simpleprice_${coingeckoId}`;
  const cached = getCached(cacheKey, 60 * 1000); // 60s
  if (cached) return cached;

  const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoId}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true`);
  const data = await res.json();
  setCached(cacheKey, data);
  return data;
}

export interface CoinData {
  market_data: {
    circulating_supply?: number;
  };
    public_interest_stats?: {
    number_of_transactions?: number;
  };
}

export async function fetchCoinMetadata(coingeckoId) {
  const cacheKey = `cg_metadata_${coingeckoId}`;
  const cached = getCached(cacheKey, 10 * 60 * 1000); // 10min
  if (cached) return cached;

  const res = await fetch(`https://api.coingecko.com/api/v3/coins/${coingeckoId}`);
  const data = await res.json();
  setCached(cacheKey, data);
  return data;
}
