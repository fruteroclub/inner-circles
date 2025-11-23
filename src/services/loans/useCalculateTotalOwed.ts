"use client";

import { useReadContract } from "wagmi";
import { lendingMarketContract } from "@/lib/contracts/config";

/**
 * Hook to calculate total amount owed (principal + interest) for a loan
 * This is a read-only hook that queries the contract
 */
export function useCalculateTotalOwed(loanId: bigint | null) {
  const {
    data: totalOwed,
    isLoading,
    isError,
    error,
    refetch,
  } = useReadContract({
    ...lendingMarketContract,
    functionName: "calculateTotalOwed",
    args: loanId ? [loanId] : undefined,
    query: {
      enabled: loanId !== null,
      retry: 3,
      retryDelay: 1000,
    },
  });

  return {
    totalOwed: totalOwed as bigint | undefined,
    isLoading,
    isError,
    error: error ? (error instanceof Error ? error : new Error(String(error))) : null,
    refetch,
  };
}

