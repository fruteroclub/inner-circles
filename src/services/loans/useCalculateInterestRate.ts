"use client";

import { useReadContract } from "wagmi";
import { lendingMarketContract } from "@/lib/contracts/config";

/**
 * Hook to calculate interest rate from the contract based on voucher count
 * This ensures the UI always matches the contract's calculation
 */
export function useCalculateInterestRate(voucherCount: bigint | undefined) {
  const { data: interestRate, isLoading, isError, error } = useReadContract({
    ...lendingMarketContract,
    functionName: "calculateInterestRate",
    args: voucherCount !== undefined ? [voucherCount] : undefined,
    query: {
      enabled: voucherCount !== undefined && voucherCount >= BigInt(3),
    },
  });

  return {
    interestRate: interestRate as bigint | undefined,
    isLoading,
    isError,
    error,
  };
}

