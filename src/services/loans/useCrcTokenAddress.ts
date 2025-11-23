"use client";

import { useReadContract } from "wagmi";
import { lendingMarketContract } from "@/lib/contracts/config";

/**
 * Hook to get the CRC token address from the lending market contract
 */
export function useCrcTokenAddress() {
  const {
    data: tokenAddress,
    isLoading,
    isError,
    error,
    refetch,
  } = useReadContract({
    ...lendingMarketContract,
    functionName: "crcToken",
  });

  return {
    tokenAddress: tokenAddress as `0x${string}` | undefined,
    isLoading,
    isError,
    error: error ? (error instanceof Error ? error : new Error(String(error))) : null,
    refetch,
  };
}

