import { useEffect, useState } from "react";
import { formatUnits, getAddress } from "ethers";
import { protocolAddresses } from "./protocolAddresses";
import { fetchTokenBalance } from "./tokenUtils";

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function useProtocolBalances(stablecoin) {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!stablecoin?.address) return;

    setLoading(true);

    async function fetchAllBalances() {
      const entries = Object.entries(protocolAddresses);
      const results = [];

      for (const [address, label] of entries) {
        let checksummedAddress;
        try {
          checksummedAddress = getAddress(address);
        } catch (err) {
          console.warn("Invalid address checksum for", address, "skipping");
          continue;
        }

        let balanceBN = 0n;
        try {
          balanceBN = await fetchTokenBalance(stablecoin.address, checksummedAddress, 1); // single retry
        } catch (err) {
          console.warn("Fetch failed for", checksummedAddress, err);
        }

        const balance = parseFloat(formatUnits(balanceBN, stablecoin.decimals || 18));
        if (balance > 0) {
          results.push({ protocol: label, address: checksummedAddress, balance });
        }

        // Delay: adjust MS as needed (100-500ms)
        await sleep(200);
      }

      results.sort((a, b) => b.balance - a.balance);
      setBalances(results);
      setLoading(false);
    }

    fetchAllBalances();

  }, [stablecoin]);

  return { balances, loading };
}
