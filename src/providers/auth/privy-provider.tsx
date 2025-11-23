"use client";

import { type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider } from "@privy-io/wagmi";
import { gnosis } from "viem/chains";
import wagmiConfig from "../onchain-config/wagmi-config";

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "";
const PRIVY_CLIENT_ID = process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID ?? "";

function PrivyProviderComponent({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient();

  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      clientId={PRIVY_CLIENT_ID}
      config={{
        defaultChain: gnosis,
        supportedChains: [gnosis],
        appearance: {
          // Wallet display preferences
          showWalletLoginFirst: true,
          walletList: [
            "metamask",
            "coinbase_wallet",
            "rainbow",
            "wallet_connect",
          ],
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}

export default PrivyProviderComponent;
