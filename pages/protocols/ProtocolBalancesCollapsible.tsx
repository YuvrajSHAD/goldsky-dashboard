import React, { useEffect, useState } from "react";
import { useProtocolBalances } from "./useProtocolBalances";
import styles from "./ProtocolBalancesCollapsible.module.css";

type Stablecoin = { symbol: string; address: string; decimals?: number };
type ProtocolBalance = { protocol: string; address: string; balance: number };
type GroupedProtocols = { [type: string]: ProtocolBalance[] };

const DEFAULT_VISIBLE = 2;

function groupByProtocolType(balances: ProtocolBalance[]): GroupedProtocols {
  return balances.reduce((acc, item) => {
    if (!acc[item.protocol]) acc[item.protocol] = [];
    acc[item.protocol].push(item);
    return acc;
  }, {} as GroupedProtocols);
}

export default function ProtocolBalancesCollapsible({
  stablecoin,
  cachedData = null,
  onFetched = null,
}: {
  stablecoin: Stablecoin;
  cachedData?: ProtocolBalance[] | null;
  onFetched?: (balances: ProtocolBalance[]) => void;
}) {
  const { balances, loading } = useProtocolBalances(stablecoin);

  // All hooks at top-level
  const [localData, setLocalData] = useState<ProtocolBalance[]>(cachedData || []);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const displayData = localData.length ? localData : balances;
  const grouped = groupByProtocolType(displayData);

  // Effect to cache fetched data
  useEffect(() => {
    if (!loading && balances.length && !localData.length) {
      setLocalData(balances);
      if (onFetched) onFetched(balances);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, balances, localData.length]);

  // UI logic AFTER hooks!
  if (loading && !localData.length)
    return <div className={styles.loading}>Loading protocol balances for {stablecoin.symbol}...</div>;
  if (!displayData.length)
    return <div className={styles.noData}>No protocol balances found for {stablecoin.symbol}.</div>;

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>{stablecoin.symbol} — Top Protocol Holders</h2>
      {Object.entries(grouped).map(([protocolType, items]) => {
        const isExpanded = !!expandedGroups[protocolType];
        const visibleItems = isExpanded ? items : items.slice(0, DEFAULT_VISIBLE);
        return (
          <section key={protocolType} className={styles.groupSection}>
            <div className={styles.groupHeader} onClick={() => toggleGroup(protocolType)}>
              <span className={styles.groupTitle}>{protocolType} ({items.length})</span>
              <button className={styles.toggleButton}>{isExpanded ? "Show Less ▲" : "Show More ▼"}</button>
            </div>
            <div className={styles.cardsGrid}>
              {visibleItems.map(({ address, balance }, i) => (
                <div className={styles.card} key={address}>
                  <div className={styles.cardLabel}>{protocolType}</div>
                  <div className={styles.cardItem}>
                    <b>Address:</b>
                    <span className={styles.address}>{address}</span>
                  </div>
                  <div className={styles.cardItem}>
                    <b>Balance:</b>
                    <span className={styles.balance}>{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
