"use client";

import { useReadContract } from "wagmi";
import { useAccount } from "wagmi";
import { lendingMarketContract } from "@/lib/contracts/config";

/**
 * Hook to check if the current user has vouched for a loan
 */
export function useIsVoucher(loanId: bigint | null) {
  const { address } = useAccount();

  const {
    data: isVoucher,
    isLoading,
    isError,
    error,
    refetch,
  } = useReadContract({
    ...lendingMarketContract,
    functionName: "isVoucher",
    args: loanId && address ? [loanId, address] : undefined,
    query: {
      enabled: loanId !== null && address !== undefined,
      retry: 3,
      retryDelay: 1000,
    },
  });

  return {
    isVoucher: isVoucher as boolean | undefined,
    isLoading,
    isError,
    error: error ? (error instanceof Error ? error : new Error(String(error))) : null,
    refetch,
  };
}

