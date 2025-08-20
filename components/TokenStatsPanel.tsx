import React, { useEffect, useState } from "react";
import styles from "./TokenStatsPanel.module.css";
import { fetchSimplePrice, fetchCoinMetadata } from "../utils/coingecko";

export default function TokenStatsPanel({
  name,
  symbol,
  address,
  decimals,
  coingeckoId,
}: {
  name?: string;
  symbol: string;
  address: string;
  decimals: number;
  coingeckoId: string;
}) {
  const [price, setPrice] = useState("--");
  const [marketCap, setMarketCap] = useState("--");
  const [totalSupply, setTotalSupply] = useState("--");
  const [totalTransfers, setTotalTransfers] = useState("--");
  const [volume24h, setVolume24h] = useState("--");

  useEffect(() => {
    if (!coingeckoId) return;
    (async () => {
      const priceData = await fetchSimplePrice(coingeckoId);
      if (priceData && priceData[coingeckoId]?.usd != null) {
        setPrice(priceData[coingeckoId].usd.toLocaleString());
      }
      if (priceData && priceData[coingeckoId]?.usd_market_cap != null) {
        setMarketCap(priceData[coingeckoId].usd_market_cap.toLocaleString());
      }

      const metadata = await fetchCoinMetadata(coingeckoId);
      if (metadata?.market_data.circulating_supply != null) {
        setTotalSupply(metadata.market_data.circulating_supply.toLocaleString());
      }
      if (metadata?.public_interest_stats?.number_of_transactions != null) {
        setTotalTransfers(metadata.public_interest_stats.number_of_transactions.toLocaleString());
      }
      if (priceData && priceData[coingeckoId]?.usd_24h_vol != null) {
        setVolume24h(priceData[coingeckoId].usd_24h_vol.toLocaleString());
      }
    })();
  }, [coingeckoId]);

  return (
    <div className={styles.panel}>
      <div className={styles.row}>
        {/* Overview */}
        <div className={styles.card}>
          <h3>Overview</h3>
          <div>MAX TOTAL SUPPLY <br /><br /> <span className={styles.textColor}>${totalSupply}</span></div><br /><br />
          <div>24H VOLUME <br /><br /> <span className={styles.textColor}>${volume24h}</span></div><br /><br />
            <div>
              Explorer:{" "}
              <a
                href={`https://hyperevmscan.io/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#41eb8b", textDecoration: "underline" }}
              >
                View on Explorer
              </a>
            </div><br />
        </div>
        {/* Market */}
        <div className={styles.card}>
          <h3>Market</h3>
          <div>PRICE <br /><br /><span className={styles.textColor}>{price !== "--" ? `$${price}` : "--"}</span></div><br /><br />
          <div>MARKET CAP <br /><br /> <span className={styles.textColor}>{marketCap !== "--" ? `$${marketCap}` : "--"}</span></div><br />
        </div>
        {/* Other Info */}
        <div className={styles.card}>
          <h3>Other Info</h3>
          <div>
            TOKEN CONTRACT <br></br><span className={styles.textColor} style={{ wordBreak: "break-all" }}>{address}</span>
            <button
              className={styles.copyBtn}
              onClick={() => navigator.clipboard.writeText(address)}
              title="Copy"
            >📋</button>
          </div><br />
          <div>Decimals: <span className={styles.textColor}>{decimals}</span></div>
        </div>
      </div>
    </div>
  );
}
