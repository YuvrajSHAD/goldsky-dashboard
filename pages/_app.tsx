import { PrivyProvider } from '@privy-io/react-auth';
import type { AppProps } from 'next/app';
import '../styles/globals.css'; // Ensure global styles are imported
import { useEffect } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
        loginMethods: ['email', 'google', 'twitter', 'wallet', 'discord', 'github'],
        appearance: {
          theme: 'dark',
        },
      }}
    >
      <Component {...pageProps} />
    </PrivyProvider>
  );
}
