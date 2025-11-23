"use client";

import { useReadContract } from "wagmi";
import { lendingMarketContract } from "@/lib/contracts/config";

/**
 * Hook to get the total number of loans in the contract
 * 
 * @returns Object with totalLoans count, loading state, error state, and refetch function
 */
export function useTotalLoans() {
  const {
    data: totalLoans,
    isLoading,
    isError,
    error,
    refetch,
  } = useReadContract({
    ...lendingMarketContract,
    functionName: "totalLoans",
  });

  return {
    totalLoans: totalLoans ? BigInt(totalLoans.toString()) : BigInt(0),
    isLoading,
    isError,
    error: error ? (error instanceof Error ? error : new Error(String(error))) : null,
    refetch,
  };
}

