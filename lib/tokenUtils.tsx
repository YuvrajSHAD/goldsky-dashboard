import { JsonRpcProvider, Contract } from "ethers";

const ERC20_ABI = ["function balanceOf(address owner) view returns (uint256)"];
const provider = new JsonRpcProvider("https://rpc.hyperliquid.xyz/evm");

// Main fetch with retry logic
export async function fetchTokenBalance(tokenAddress, userAddress, retries = 1) {
  try {
    const tokenContract = new Contract(tokenAddress, ERC20_ABI, provider);
    const balance = await tokenContract.balanceOf(userAddress);
    return balance; // ethers v6: BigInt
  } catch (error) {
    if (retries > 0) {
      // Basic exponential backoff
      await new Promise(res => setTimeout(res, 500));
      return await fetchTokenBalance(tokenAddress, userAddress, retries - 1);
    }
    console.error("Error fetching token balance for", userAddress, ":", error);
    return 0n;
  }
}
