import React, { useMemo } from "react";
import { subDays, getUnixTime } from "date-fns";

// For type safety, but you can ignore or adjust as per your TS/JS use
type Tx = {
  from: string;
  to: string;
  value: string;
  timestamp_: number;
};

export default function TokenAnalytics({
  transfers = [],
  symbol = "USDXL",
  decimals = 18,
  address,  // <-- Add this!
}: {
  transfers: Tx[];
  symbol?: string;
  decimals?: number;
  address: string;  // <-- Add this!
}) {
  const sevenDaysAgo = getUnixTime(subDays(new Date(), 7));

  const {
    biggestTx,
    mostActiveWallet,
    currVolume,
    prevVolume,
    growthPercent,
  } = useMemo(() => {
    const recentTxs = transfers.filter(
      (tx) => Number(tx.timestamp_) >= sevenDaysAgo
    );
    // Biggest transaction
    let maxTx = null;
    for (const tx of recentTxs) {
      if (!maxTx || Number(tx.value) > Number(maxTx.value)) maxTx = tx;
    }
    // Most active wallet (sent+received count)
    const walletMap: Record<string, number> = {};
    for (const tx of recentTxs) {
      walletMap[tx.from] = (walletMap[tx.from] || 0) + 1;
      walletMap[tx.to] = (walletMap[tx.to] || 0) + 1;
    }
    let aktv = Object.entries(walletMap).sort((a, b) => b[1] - a[1])[0];

    // Volume growth vs. previous week
    const prevWindowStart = getUnixTime(subDays(new Date(), 14));
    const prev7dTxs = transfers.filter(
      (tx) => Number(tx.timestamp_) >= prevWindowStart && Number(tx.timestamp_) < sevenDaysAgo
    );
    const sum = (arr: any[]) =>
      arr.reduce((tot, t) => tot + Number(t.value) / 10 ** decimals, 0);

    const currVolume = sum(recentTxs);
    const prevVolume = sum(prev7dTxs);
    const growthPercent =
      prevVolume === 0
        ? (currVolume > 0 ? 100 : 0)
        : ((currVolume - prevVolume) / prevVolume) * 100;
    return { biggestTx: maxTx, mostActiveWallet: aktv, currVolume, prevVolume, growthPercent };
  }, [transfers, symbol, decimals]);

  return (
    <div
      style={{
        color: "#fff",
        padding: "18px 14px",
        marginTop: 0,
        maxWidth: 400,
        width: "100%",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div style={{ fontWeight: 700, fontSize: "1.08em", color: "#9c36df", marginBottom: 16 }}>
        Analytics (last 7 days)
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Biggest Tx */}
        <div
          style={{
            minHeight: 90,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: "#23272f",
            border: "1.4px solid #a96df33d",
            padding: "13px 14px",
          }}
        >
          <div style={{ color: "#c47fff", fontWeight: 600, fontSize: 14, marginBottom: 2 }}>
            Biggest Transaction
          </div>  
          {biggestTx ? (
            <>
              <div style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>
                {(Number(biggestTx.value) / 10 ** decimals).toLocaleString(undefined, { maximumFractionDigits: 4 })}{" "}
                <span style={{ fontSize: '13px', color: '#d8a5ff' }}>{symbol}</span>
              </div>
              <div style={{ fontSize: 12.5, color: "#b6d8ef", margin: "3px 0" }}>
                From: <span style={{ color: "#fff" }}>{biggestTx.from}</span>
                <br />
                To:&nbsp;&nbsp;&nbsp;&nbsp;
                <span style={{ color: "#fff" }}>{biggestTx.to}</span>
              </div>
              <div style={{ fontSize: 11, color: "#ccdada", marginTop: 2 }}>
                {new Date(biggestTx.timestamp_ * 1000).toLocaleString()}
              </div>
            </>
          ) : (
            <span style={{ color: "#bbb", fontSize: 13 }}>No Data</span>
          )}
        </div>

        {/* Most Active Wallet */}
        <div
          style={{
            minHeight: 70,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: "#23272f",
            border: "1.4px solid #36edcf3d",
            padding: "13px 14px",
          }}
        >
          <div style={{ color: "#51eeea", fontWeight: 600, fontSize: 14, marginBottom: 1 }}>
            Most Active Wallet
          </div>
          {mostActiveWallet ? (
            <>
              <div style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>
                Address: {mostActiveWallet[0]}
              </div>
              <div style={{ fontSize: 12, color: "#c6ecf3" }}>
                {mostActiveWallet[1]} transaction{mostActiveWallet[1] > 1 ? "s" : ""}
              </div>
            </>
          ) : (
            <span style={{ color: "#bbb", fontSize: 13 }}>No Data</span>
          )}
        </div>

        {/* Volume Growth */}
        <div
          style={{
            minHeight: 60,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: "#23272f",
            border: growthPercent >= 0 ? "1.4px solid #41eb8b6a" : "1.4px solid #ff627975",
            padding: "13px 14px",
          }}
        >
          <div
            style={{
              color: "#6fedaa",
              fontWeight: 600,
              fontSize: 14,
              marginBottom: 16,
            }}
          >
            7-day Volume Growth
          </div>
          <div style={{ fontWeight: 700, color: growthPercent >= 0 ? "#41eb8b" : "#ff6279", fontSize: 16 }}>
            {growthPercent >= 0 ? "+" : ""}
            {isFinite(growthPercent) ? growthPercent.toFixed(2) : "0.00"}%
          </div>
          <div style={{ fontSize: 11.5, color: "#bfe5cf", marginTop: 3 }}>
            ({currVolume.toLocaleString(undefined, { maximumFractionDigits: 2 })} {symbol})
          </div>
        </div>
      </div>
    </div>
  );
}
