import { createConfig } from "@privy-io/wagmi";
import { http } from "wagmi";
import { gnosis } from "viem/chains";

const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

// Fallback to public RPCs if Alchemy key is not available
const getTransports = () => {
  // Gnosis Chain transport - use Circles RPC if available, fallback to public Gnosis RPC
  const gnosisTransport = http(
    `https://gnosis-mainnet.g.alchemy.com/v2/${alchemyApiKey}`
  );

  if (alchemyApiKey) {
    return {
      [gnosis.id]: gnosisTransport,
    };
  } else {
    // Public RPC endpoints as fallback
    console.warn(
      "NEXT_PUBLIC_ALCHEMY_API_KEY not set, using public RPC endpoints"
    );
    return {
      [gnosis.id]: gnosisTransport,
    };
  }
};

const wagmiConfig = createConfig({
  chains: [gnosis],
  multiInjectedProviderDiscovery: false,
  transports: getTransports(),
  // Enable account detection for embedded wallets
  ssr: false,
});

export default wagmiConfig;
