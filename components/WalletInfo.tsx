import { Wallet } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { JsonRpcProvider, formatUnits } from 'ethers';
import Styles from '../pages/wallet/WalletInfo.module.css';

interface Props {
  wallet: Wallet;
  label?: string;
  loginMethod?: string;
  displayName?: string | null;
  points?: number | null;
}

const RPC_URL = 'https://rpc.hyperliquid.xyz/evm';

export default function WalletInfo({ wallet, label, loginMethod, displayName, points }: Props) {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('Loading...');

  useEffect(() => {
    const loadWalletData = async () => {
      try {
        const addr = wallet.address;
        setAddress(addr);

        const provider = new JsonRpcProvider(RPC_URL);
        const rawBalance = await provider.getBalance(addr);
        const formatted = formatUnits(rawBalance, 18);

        setBalance(formatted);
      } catch (err) {
        console.error('Error loading native HYPE balance:', err);
        setBalance('Error');
      }
    };

    loadWalletData();
  }, [wallet]);

  function getReadableLoginMethod(loginMethod?: string, walletClientType?: string): string {
    const socialMap: Record<string, string> = {
      'google_oauth': 'Google',
      'twitter_oauth': 'Twitter',
      'discord_oauth': 'Discord',
      'github_oauth': 'GitHub',
      'email': 'Email',
    };

    if (loginMethod === 'wallet') {
      // External wallet — show actual wallet name
      return walletClientType?.replace(/_/g, ' ') || 'External Wallet';
    }

    if (walletClientType === 'privy') {
      // Embedded wallet — show provider name or generic "Embedded Wallet"
      return socialMap[loginMethod || ''] || 'Embedded Wallet';
    }

    // Fallback
    return loginMethod || 'Unknown';
  }

  return (
    <div className={Styles.walletInfoContainer}>
      <div className={`${Styles.walletCard} ${Styles.profileCard}`}>
        <div className={Styles.profileIconInner}>
          <img src="../2.gif"/>
        </div>
        {/* Profile Icon Here */}
      </div>
      <div className={Styles.walletCard}>
      <h2 className={Styles.walletInfoTitle}>{label || 'Wallet'}</h2>
      <p><strong>Address <br /><br /></strong> {address}</p>
      </div>
      <div className={Styles.walletCard}>
        <p><strong>Login Method:</strong> {getReadableLoginMethod(loginMethod, wallet.walletClientType)}</p>
        {displayName && <p><strong>User:</strong> {displayName}</p>}
        <p><strong>HYPE Balance:</strong> {balance}</p>
        {points !== null && <p>Points: {points}</p>}
      </div>
    </div>
  );
}
