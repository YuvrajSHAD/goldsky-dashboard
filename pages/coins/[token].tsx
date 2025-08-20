import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { fetchTransfersByToken, fetchAllTransfersByToken } from "../../utils/graphqlClient";
import { STABLECOINS } from "../../utils/tokenAddresses";
import TokenStatsPanel from "../../components/TokenStatsPanel";
import TokenActivityChart from "../../components/TokenActivityChart";
import styles from "./token.module.css"; // Make sure your styles exist

export default function TokenPage() {
  const router = useRouter();
  const { token } = router.query;

  const [tokenMeta, setTokenMeta] = useState(null);
  const [decimals, setDecimals] = useState(18);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [holders, setHolders] = useState("--"); // Fill if you have a holders fetch!

  // Filters
  const [minValue, setMinValue] = useState(0);
  const [showCount, setShowCount] = useState(10);

  useEffect(() => {
    if (!token) return;
    const tmeta = STABLECOINS.find(
      (t) => t.symbol && t.symbol.toLowerCase() === (token as string).toLowerCase()
    );
    setTokenMeta(tmeta);
    if (tmeta) setDecimals(tmeta.decimals);

    // Fetch transfers
    if (!tmeta) return;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchTransfersByToken(tmeta.symbol, 1000, "0");
        setTransfers(data.transfers || []);
        // Fetch holders count from your subgraph, if available, and setHolders(value)
      } catch (err) {
        setError(err.message || "Failed to fetch transfers");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const totalTransfers = transfers.length;
  const filteredTransfers = transfers.filter(
    t => Number(t.value) / 10 ** decimals >= minValue
  );

  // Title/Meta fallback
  if (!tokenMeta) {
    return <div style={{ color: "red", padding: 24 }}>Unknown token</div>;
  }

  return (
    
    <div className={styles.sCool}>
      {/* Top Row: Stats Panel */}
       <div
        className={styles.backArrow}
        onClick={() => router.push("/")}
        >
        &#8592;
      </div>
      {/* <h2 className={styles.tokenTitle}>{tokenMeta.symbol}</h2> */}
      <TokenStatsPanel
        symbol={tokenMeta.symbol}
        address={tokenMeta.address}
        decimals={tokenMeta.decimals}
        coingeckoId={tokenMeta.coingeckoId}
        totalTransfers={totalTransfers}
        holders={holders}
      />
      {/* Right */}
      <div className={styles.mainContainer}>
        <div className={styles.childContainer}>
          <div className={styles.tableContainer}>
            <h2 className={styles.tableTitle}>
              {tokenMeta.symbol} Recent Transactions
            </h2>
            <div style={{ display: "flex", gap: 24, margin: "18px 0" }}>
              <label>
                Min Value:{" "}
                <input
                  type="number"
                  min="0"
                  style={{ fontSize: 15, width: 80 }}
                  value={minValue}
                  onChange={e => setMinValue(Number(e.target.value))}
                />
              </label>
              <label>
                Transactions Shown:{" "}
                <input
                  type="number"
                  min={1}
                  max={filteredTransfers.length}
                  style={{ fontSize: 15, width: 62 }}
                  value={showCount}
                  onChange={e => setShowCount(Number(e.target.value))}
                />
              </label>
            </div>
            {loading ? (
              <p style={{ color: "#aaa" }}>Loading...</p>
            ) : error ? (
              <p style={{ color: "red" }}>{error}</p>
            ) : filteredTransfers.length === 0 ? (
              <p>No transactions found</p>
            ) : (
              <>
                <div className={styles.tableScroll}>
                  <table className={styles.recentTransactionsTable} style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 14,
                    color: "#fff"
                  }}>
                    <thead>
                      <tr style={{ background: "#23272f", color: "#B0B9CC" }}>
                        <th style={{ padding: 8, textAlign: "left" }}>From</th>
                        <th style={{ padding: 8, textAlign: "left" }}>To</th>
                        <th style={{ padding: 8, textAlign: "right" }}>Value</th>
                        <th style={{ padding: 8, textAlign: "left" }}>Time</th>
                        <th style={{ padding: 8, textAlign: "left" }}>Tx Hash</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransfers.slice(0, showCount).map((t) => (
                        <tr key={t.id || t.transactionHash_} style={{ borderBottom: "1px solid #2A2E39" }}>
                          <td style={{ padding: 8, wordBreak: "break-all" }}>{t.from}</td>
                          <td style={{ padding: 8, wordBreak: "break-all" }}>{t.to}</td>
                          <td style={{ padding: 8, textAlign: "right" }}>
                            {(Number(t.value) / 10 ** decimals).toFixed(4)}
                          </td>
                          <td style={{ padding: 8 }}>
                            {new Date(t.timestamp_ * 1000).toLocaleString()}
                          </td>
                          <td style={{ padding: 8, wordBreak: "break-all" }}>
                            {t.transactionHash_}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredTransfers.length > showCount && (
                  <button className={styles.showAllButton}
                    onClick={() => setShowCount(filteredTransfers.length)}
                  >
                    Show all
                  </button>
                )}
              </>
            )}
          </div>
          {/* Right: Chart or analytics */}
          <div className={styles.chartContainer}>
            {filteredTransfers.length > 0 && (
              <TokenActivityChart
                transfers={filteredTransfers}
                symbol={tokenMeta.symbol} // <-- Make sure this is passed!
                decimals={decimals}
                address={tokenMeta.address}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
