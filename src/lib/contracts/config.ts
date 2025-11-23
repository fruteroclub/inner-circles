import { gnosis } from "viem/chains";
import InnerCirclesLendingMarketABI from "./InnerCirclesLendingMarketABI";

/**
 * Contract address on Gnosis Chain
 * TODO: Replace with actual deployed contract address
 */
export const LENDING_MARKET_CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_LENDING_MARKET_ADDRESS as `0x${string}`;

if (!LENDING_MARKET_CONTRACT_ADDRESS) {
  throw new Error(
    "NEXT_PUBLIC_LENDING_MARKET_ADDRESS environment variable is required"
  );
}

/**
 * Contract configuration for Wagmi
 */
export const lendingMarketContract = {
  address: LENDING_MARKET_CONTRACT_ADDRESS,
  abi: InnerCirclesLendingMarketABI,
  chainId: gnosis.id,
} as const;

