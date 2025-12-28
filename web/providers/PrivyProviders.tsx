'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { sepolia } from 'viem/chains';

/**
 * Privy Provider Component
 * 
 * Note: You may see hydration warnings in the console about <div> inside <p>.
 * This is a known issue in Privy's UI components and doesn't affect functionality.
 * The warnings are suppressed in development via lib/suppressPrivyWarnings.ts
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'cmjfhssx300unjp0cm360ad6l';
  
  // Validate appId is set
  if (!appId || appId === 'your-privy-app-id') {
    console.error('Privy App ID is not set. Please set NEXT_PUBLIC_PRIVY_APP_ID in your .env.local file');
  }
  
  return (
    <PrivyProvider
      appId={appId}
      config={{
        // Embedded wallet settings - Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
        },
        defaultChain: sepolia,
      }}
    >
      {children}
    </PrivyProvider>
  );
}

