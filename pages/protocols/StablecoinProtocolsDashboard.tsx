import React, { useState } from "react";
import { TOKENS } from "../../scripts/tokenAddresses";
import styles from "./StablecoinProtocolsDashboard.module.css";
import ProtocolBalancesCollapsible from "./ProtocolBalancesCollapsible";
import Modal from "./Modal";
import HyperEVMTransactionHistoryPanel from "../protocols/HyperEVMTransactionHistoryPanel";

export default function StablecoinProtocolsDashboard() {
  const [selectedToken, setSelectedToken] = useState(null);
  const [cache, setCache] = useState({});
  const [showModal, setShowModal] = useState(false);

  function handleFetched(symbol, result) {
    setCache(prev => ({ ...prev, [symbol]: result }));
  }

  function handleTokenClick(token) {
    setSelectedToken(token);
    setShowModal(true);
  }

  return (
    <div className={styles.dashboardGrid}>
      <div className={styles.leftPanel}>
        <h2 className={styles.header}>Stablecoin Protocols</h2>
        <div className={styles.tokenList}>
          {TOKENS.map((token) => (
            <div
              className={`${styles.tokenRow} ${selectedToken && token.symbol === selectedToken.symbol ? styles.active : ""}`}
              key={token.symbol}
              onClick={() => handleTokenClick(token)}
              style={{ cursor: "pointer" }}
            >
              {token.symbol}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.rightPanel}>
        <HyperEVMTransactionHistoryPanel />
      </div>
      {showModal && selectedToken && (
        <Modal onClose={() => setShowModal(false)}>
          <ProtocolBalancesCollapsible
            stablecoin={selectedToken}
            cachedData={cache[selectedToken.symbol]}
            onFetched={data => handleFetched(selectedToken.symbol, data)}
          />
        </Modal>
      )}
    </div>
  );
}
