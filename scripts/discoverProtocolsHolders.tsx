import fetch from 'node-fetch';
import { TOKENS } from './tokenAddresses';

const API_URL = 'https://www.hyperscan.com/api';

async function getTopHolders(token) {
  const holdersUrl = `${API_URL}?module=token&action=getTokenHolders&contractaddress=${token.address}&page=1&offset=20`;
  const res = await fetch(holdersUrl);
  const data = await res.json();

  if (!data.result) {
    console.log(`No holders found for ${token.symbol}.`);
    return [];
  }

  let protocolCandidates = [];
  for (const holder of data.result) {
    const addr = holder.address;
    const rawBalance = holder.balance;

    // Convert balance using token.decimals
    const formattedBalance = Number(rawBalance) / 10 ** token.decimals;

    // Check if this address is a contract
    const contractUrl = `${API_URL}?module=contract&action=getsourcecode&address=${addr}`;
    const cres = await fetch(contractUrl);
    const cdata = await cres.json();

    if (
      cdata.result &&
      cdata.result[0] &&
      cdata.result[0].ABI !== "Contract source code not verified"
    ) {
      protocolCandidates.push({
        address: addr,
        balance: formattedBalance
      });
    }
  }
  return protocolCandidates;
}

async function main() {
  for (const token of TOKENS) {
    console.log(`==== ${token.symbol} ====`);
    const protocols = await getTopHolders(token);
    protocols.forEach(({ address, balance }) =>
      console.log(`Protocol: ${address}, Balance: ${balance} ${token.symbol}`)
    );
    console.log();
  }
}

main().catch(console.error);
