// src/components/WalletSection.tsx
import React from 'react';
import WalletInfo from '../../components/WalletInfo';
import Styles from './WalletSection.module.css';

interface WalletSectionProps {
  authenticated: boolean;
  login: () => void;
  logout: () => void;
  loginMethod: string | undefined;
  externalWallet: unknown;
  embeddedWallet: unknown;
  displayName: string | null;
  points: number | null;
}

export default function WalletSection({
  authenticated,
  login,
  logout,
  loginMethod,
  externalWallet,
  embeddedWallet,
  displayName,
  points,
}: WalletSectionProps) {
  return (
    <div className={Styles.walletSection}>
      <div className={`${Styles.coolContainer} ${!authenticated ? Styles.noBorder: ""} `}>
        {/* LOGIN / LOGOUT BUTTON */}
        <div className={Styles.loginLogoutBtn}>
          {!authenticated ? (
            <button
              onClick={login}
              className={Styles.loginBtn}
            >
              Login
            </button>
          ) : (
            <button
              onClick={logout}
              className={Styles.logoutBtn}
            >
              Logout
            </button>
          )}
        </div>

        {/* WALLET INFO */}
        {authenticated && (
          <div className={Styles.walletInfo}>
            {loginMethod === 'wallet' && externalWallet && (
              <WalletInfo
                wallet={externalWallet}
                label="External Wallet"
                loginMethod={loginMethod}
                displayName={null}
                points={points}
              />
            )}
            {loginMethod !== 'wallet' && embeddedWallet && (
              <WalletInfo
                wallet={embeddedWallet}
                label="Embedded Wallet"
                loginMethod={loginMethod}
                displayName={displayName}
                points={points}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
