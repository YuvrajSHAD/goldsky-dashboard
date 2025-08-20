import React, { useState } from "react";
import { useRouter } from "next/router";
import { STABLECOINS } from "../../utils/tokenAddresses"; // Adjust path as needed

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  // Helper to map token address to token symbol
  function mapAddressToTokenSymbol(address: string): string | undefined {
    const tokenObj = STABLECOINS.find(
      (t) => t.address.toLowerCase() === address.toLowerCase()
    );
    return tokenObj ? tokenObj.symbol : undefined;
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();

    if (/^[a-zA-Z]{3,8}$/.test(q)) {
      // Token symbol
      router.push(`/coins/${q.toLowerCase()}`);
    } else if (/^0x[a-fA-F0-9]{40}$/.test(q)) {
      // Token address
      const token = mapAddressToTokenSymbol(q);
      if (token) {
        router.push(`/coins/${token.toLowerCase()}`);
      } else {
        alert("Token address not recognized.");
      }
    } else if (/^0x[a-fA-F0-9]{64}$/.test(q)) {
      // Transaction hash
      router.push(`/coins/txSearch?tx=${q}`);
    } else {
      alert(
        "Invalid input. Please enter a valid token symbol, token address, or transaction hash."
      );
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      style={{
        display: "flex",  
        gap: "10px",
        alignItems: "center",
      }}
    >
      <input
        style={{
          padding: "9px 12px",
          border: "1px solid #222",
          borderRadius: 0,
          fontSize: 16,
          width: 240,
          background: "#191b1f",
          color: "#fff",
        }}
        type="text"
        placeholder="Search coin, address, or tx hash"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button
        type="submit"
        style={{
          padding: "9px 18px",
          border: "none",
          background: "#2583f5",
          color: "#fff",
          borderRadius: 0,
          cursor: "pointer",
        }}
      >
        Search
      </button>
    </form>
  );
}
