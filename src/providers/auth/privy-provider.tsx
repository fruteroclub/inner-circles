'use client'

import { type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { PrivyProvider } from '@privy-io/react-auth'
import { WagmiProvider } from '@privy-io/wagmi'
import { arbitrum, base, mainnet, optimism, polygon, scroll } from 'viem/chains'
import wagmiConfig from '../onchain-config/wagmi-config'

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? ''
const PRIVY_CLIENT_ID = process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID ?? ''

function PrivyProviderComponent({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient()

  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      clientId={PRIVY_CLIENT_ID}
      config={{
        defaultChain: arbitrum,
        supportedChains: [arbitrum, base, mainnet, optimism, polygon, scroll],
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'all-users',
          },
        },
        appearance: {
          // Wallet display preferences
          showWalletLoginFirst: false,
          walletList: ['metamask', 'coinbase_wallet', 'rainbow', 'wallet_connect'],
        },
        legal: {
          // Simplify legal text to avoid complex HTML nesting
          termsAndConditionsUrl: 'https://frutero.club/terms',
          privacyPolicyUrl: 'https://frutero.club/privacy',
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  )
}

export default PrivyProviderComponent
