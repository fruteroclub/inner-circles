"use client";

import { useReadContract } from "wagmi";
import { lendingMarketContract } from "@/lib/contracts/config";

/**
 * Hook to get the amount repaid for a loan
 * Reads from the amountRepaid mapping in the contract
 */
export function useAmountRepaid(loanId: bigint | null) {
  const {
    data: amountRepaid,
    isLoading,
    isError,
    error,
    refetch,
  } = useReadContract({
    ...lendingMarketContract,
    functionName: "amountRepaid",
    args: loanId ? [loanId] : undefined,
    query: {
      enabled: loanId !== null,
      retry: 3,
      retryDelay: 1000,
    },
  });

  return {
    amountRepaid: amountRepaid as bigint | undefined,
    isLoading,
    isError,
    error: error ? (error instanceof Error ? error : new Error(String(error))) : null,
    refetch,
  };
}

