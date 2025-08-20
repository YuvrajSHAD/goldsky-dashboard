import { useEffect, useState } from "react";
import { formatUnits, getAddress } from "ethers";
import { protocolAddresses } from "./protocolAddresses";
import { fetchTokenBalance } from "./tokenUtils";

// Concurrency limiter
async function withConcurrencyLimit(limit, tasks) {
  const results: any[] = [];
  const executing: Promise<any>[] = [];

  for (const task of tasks) {
    const p = task().then((res) => results.push(res));
    executing.push(p);

    if (executing.length >= limit) {
      await Promise.race(executing);
      // remove finished
      for (let i = executing.length - 1; i >= 0; i--) {
        if (executing[i].catch(() => null)) {
          executing.splice(i, 1);
        }
      }
    }
  }

  await Promise.allSettled(executing);
  return results;
}

export function useProtocolBalances(stablecoin) {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!stablecoin?.address) return;

    setLoading(true);

    async function fetchAllBalances() {
      const entries = Object.entries(protocolAddresses);

      // Wrap tasks
      const tasks = entries.map(([address, label]) => async () => {
        let checksummedAddress;
        try {
          checksummedAddress = getAddress(address);
        } catch {
          console.warn("Invalid checksum:", address);
          return null;
        }

        try {
          const balanceBN = await fetchTokenBalance(stablecoin.address, checksummedAddress);
          const balance = parseFloat(formatUnits(balanceBN, stablecoin.decimals || 18));
          if (balance > 0) {
            return { protocol: label, address: checksummedAddress, balance };
          }
        } catch (err) {
          console.warn("Fetch failed for", address, err);
        }
        return null;
      });

      // Run with concurrency 5 (adjust if RPC can handle more)
      const results = await withConcurrencyLimit(5, tasks);

      const filtered = results.filter((r) => r !== null);
      filtered.sort((a, b) => b.balance - a.balance);

      setBalances(filtered);
      setLoading(false);
    }

    fetchAllBalances();
  }, [stablecoin]);

  return { balances, loading };
}
