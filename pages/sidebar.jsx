import React, { useState, useEffect } from "react";
import styles from './sidebar.module.css';
import { STABLECOINS } from "../utils/tokenAddresses";
import { fetchTransfersByToken } from "../utils/graphqlClient";

const facts = [
  "Stablecoins enable instant transfers.",
  "DeFi runs 24/7.",
  "More than $100B in stablecoin volume.",
  "Try Telegram alerts for instant updates!",
  "Always keep your private keys safe.",
];

export default function Sidebar({ open, onClose, checklist, onChecklistChange }) {
  const [factIdx, setFactIdx] = useState(0);
  const [recentTxs, setRecentTxs] = useState([]);
  const [loadingTx, setLoadingTx] = useState(true);

  // Fact Rotator
  useEffect(() => {
    const interval = setInterval(() => {
      setFactIdx(i => (i + 1) % facts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch recent txs for top 3 tokens every ~12s
  useEffect(() => {
    let isMounted = true;
    async function loadTxs() {
      setLoadingTx(true);
      try {
        const tokensToFetch = STABLECOINS.slice(0, 3);
        const allTxs = await Promise.all(tokensToFetch.map(async (token) => {
          try {
            const data = await fetchTransfersByToken(token.symbol, 1, "0");
            if (data.transfers.length > 0) {
              return { ...data.transfers[0], symbol: token.symbol };
            }
          } catch { /* ignore errors */ }
          return null;
        }));
        if (isMounted) setRecentTxs(allTxs.filter(Boolean));
      } finally {
        if (isMounted) setLoadingTx(false);
      }
    }
    loadTxs();
    const intervalId = setInterval(loadTxs, 12000);
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  return (
<div className={`${styles.sidebarDrawer} ${open ? styles.open : ''}`}>
      <button
        className={styles.sidebarClose}
        onClick={onClose}
        aria-label="Close sidebar"
      >
        ×
      </button>

      <div className={styles.agentHeader}>
        <img
          src="/1.gif"  // <-- Use your gif file placed in /public folder
          alt="Agent Icon"
          className={styles.agentIcon}
        />
        <div className={styles.agentTitleBlock}>
          <div className={styles.agentTitle}>GoldBoard</div>
        </div>
      </div>
      <br />

      {/* Fact Rotator */}
      <div className={styles.sidebarFact} aria-live="polite" aria-atomic="true">
        <span role="img" aria-label="light-bulb">💡</span> {facts[factIdx]}
      </div>

      {/* Recent Transactions */}
      <div className={styles.recentTxSection}>
        <h4 className={styles.recentTxHeading}>Latest Transactions</h4>
        {loadingTx ? (
          <div className={styles.loadingText}>Loading...</div>
        ) : recentTxs.length === 0 ? (
          <div className={styles.loadingText}>No recent transactions</div>
        ) : (
          recentTxs.map(tx => (
            <div key={tx.id} className={styles.txCard}>
              <div className={styles.txMainLine}>
                <span className={styles.txSymbol}>{tx.symbol}</span>
                <span className={styles.txValue}>{(Number(tx.value) / 1e18).toFixed(4)}</span>
              </div>
              <div className={styles.txAddressRow}>
                <span className={styles.addr}>{tx.from.slice(0,6)}…</span>
                <span className={styles.txArrow}>→</span>
                <span className={styles.addr}>{tx.to.slice(0,6)}…</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Social Links */}
      <nav className={styles.sidebarSocials} aria-label="Social media links">
        <a href="https://github.com/YuvrajSHAD" target="_blank" rel="noopener noreferrer" className={styles.sidebarLink}>
          <span className={styles.icon}>📄</span> Github <span className={styles.externalArrow}>↗</span>
        </a>
        <a href="https://x.com/_Sentinels_" target="_blank" rel="noopener noreferrer" className={styles.sidebarLink}>
          <span className={styles.icon}>🐦</span> Twitter <span className={styles.externalArrow}>↗</span>
        </a>
      </nav>

      {/* Telegram Button */}
      <a
        href="https://t.me/hypeSky_bot"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.telegramCta}
        onClick={() => onChecklistChange && onChecklistChange("clickedTelegram")}
      >
        🚨 Get Alerts On Telegram
      </a>
    </div>
  );
}
