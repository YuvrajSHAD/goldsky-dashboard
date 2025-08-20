// utils/getTokenHoldersCount.js

/**
 * Get the holders count for an ERC-20 token from Blockscout.
 * @param {string} address - The ERC-20 token contract address.
 * @returns {Promise<number>} Number of holders or 0 if unavailable.
 */
export async function getTokenHoldersCount(address) {
  // Replace polygon/mainnet with YOUR chain as needed!
  const url = `https://blockscout.com/polygon/mainnet/api?module=token&action=getTokenInfo&contractaddress=${address}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    // Blockscout returns holders as a number under "result"
    // Example: {"status":"1","result":{"holders":"1234"}, ...}
    const holders = data?.result?.holders;
    if (holders !== undefined && !isNaN(holders)) {
      return Number(holders);
    }
    return 0;
  } catch (err) {
    console.error("Failed to fetch holders count for", address, err);
    return 0;
  }
}
