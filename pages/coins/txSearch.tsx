import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { STABLECOINS } from "../../utils/tokenAddresses";
import { fetchTransfersByToken } from "../../utils/graphqlClient";
import styles from '../coins/txSearch.module.css'; // Ensure you have this CSS file


export default function TxSearchPage() {
  const router = useRouter();
  const { tx } = router.query;
  const [searching, setSearching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!tx || typeof tx !== "string") return;

    const findTokenForTx = async () => {
      try {
        for (const t of STABLECOINS) {
          // Only loop if token has a symbol
          if (!t.symbol) continue;
          // Query each token's transfers (feel free to fetch less for speed)
          const data = await fetchTransfersByToken(t.symbol, 300, "0");
          const found = data.transfers?.find(
            (tr) =>
              tr.transactionHash_ &&
              tr.transactionHash_.toLowerCase() === tx.toLowerCase()
          );
          if (found) {
            // FOUND! Redirect to token page, passing tx param for highlight
            router.replace(`/coins/${t.symbol.toLowerCase()}?tx=${tx}`);
            return;
          }
        }
        setError("Transaction not found in any token.");
      } catch (err) {
        setError("Error searching for transaction.");
      } finally {
        setSearching(false);
      }
    };

    findTokenForTx();
  }, [tx, router]);

    return (
    <div style={{ padding: 32, textAlign: 'center' }}>
        {searching ? (
        <div className={styles.spinner} aria-label="Loading"></div>
        ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
        ) : null}
    </div>
    );
}
