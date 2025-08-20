const contractNameCache = {};

export async function fetchContractName(address) {
  if (contractNameCache[address]) return contractNameCache[address];
  try {
    // Replace this endpoint with your explorer/Blockscout API if needed
    const resp = await fetch(
      `https://explorer.hyperliquid.xyz/api?module=contract&action=getsourcecode&address=${address}`
    );
    const data = await resp.json();
    const name = data.result?.[0]?.ContractName || "";
    contractNameCache[address] = name;
    return name;
  } catch (e) {
    contractNameCache[address] = "";
    return "";
  }
}
