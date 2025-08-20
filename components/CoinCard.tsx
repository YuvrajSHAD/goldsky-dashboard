import { useEffect, useState } from 'react';
import { fetchSimplePrice, fetchCoinMetadata } from '../utils/coingecko';

interface Props {
  symbol: string;
  coingeckoId: string;
  onClick?: () => void;
}

export default function CoinCard({ symbol, coingeckoId, onClick }: Props) {
  const [priceInfo, setPriceInfo] = useState<{ usd?: number; usd_market_cap?: number } | null>(null);
  const [metadata, setMetadata] = useState<{ circulating_supply?: number } | null>(null);

  useEffect(() => {
    async function loadData() {
      const price = await fetchSimplePrice(coingeckoId);
      const meta = await fetchCoinMetadata(coingeckoId);
      setPriceInfo(price?.[coingeckoId] || null);
      setMetadata(meta?.market_data || null);
    }
    loadData();
  }, [coingeckoId]);

  return (
    <div onClick={onClick} className="...">
      <h2 className="...">{symbol}</h2>
      {priceInfo ? (
        <div>
          <p><strong>Price:</strong> ${priceInfo.usd?.toFixed(4)}</p>
          <p><strong>Market Cap:</strong> ${priceInfo.usd_market_cap?.toLocaleString()}</p>
          <p><strong>Circulating Supply:</strong> {metadata?.circulating_supply?.toLocaleString() || 'N/A'}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
      {!metadata && <p className="text-yellow-500 text-xs">Holders data requires Pro plan</p>}
    </div>
  );
}
