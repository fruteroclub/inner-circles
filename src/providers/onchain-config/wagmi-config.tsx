import { createConfig } from '@privy-io/wagmi'
import { http } from 'wagmi'
import { arbitrum, base, mainnet, optimism, polygon, scroll } from 'viem/chains'

const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY

// Fallback to public RPCs if Alchemy key is not available
const getTransports = () => {
  if (alchemyApiKey) {
    return {
      [arbitrum.id]: http(
        `https://arb-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
      ),
      [base.id]: http(`https://base-mainnet.g.alchemy.com/v2/${alchemyApiKey}`),
      [mainnet.id]: http(
        `https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
      ),
      [optimism.id]: http(
        `https://opt-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
      ),
      [polygon.id]: http(
        `https://polygon-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
      ),
      [scroll.id]: http(
        `https://scroll-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
      ),
    }
  } else {
    // Public RPC endpoints as fallback
    console.warn(
      'NEXT_PUBLIC_ALCHEMY_API_KEY not set, using public RPC endpoints',
    )
    return {
      [arbitrum.id]: http('https://arb1.arbitrum.io/rpc'),
      [base.id]: http('https://mainnet.base.org'),
      [mainnet.id]: http('https://cloudflare-eth.com'),
      [polygon.id]: http('https://polygon-rpc.com'),
      [optimism.id]: http('https://mainnet.optimism.io'),
      [scroll.id]: http('https://scroll.public-rpc.com'),
    }
  }
}

const wagmiConfig = createConfig({
  chains: [arbitrum, base, mainnet, polygon, optimism, scroll],
  multiInjectedProviderDiscovery: false,
  transports: getTransports(),
  // Enable account detection for embedded wallets
  ssr: false,
})

export default wagmiConfig
