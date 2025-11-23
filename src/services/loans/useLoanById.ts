"use client";

import { useReadContract } from "wagmi";
import { lendingMarketContract } from "@/lib/contracts/config";
import type { Loan } from "@/types/loans";
import { LoanState } from "@/types/loans";

/**
 * Hook to fetch a loan by ID
 * This is a simpler version of useLoanDetails without polling
 * 
 * @param loanId - The loan ID to fetch. If null, the hook is disabled.
 * @returns Object with loan data, loading state, error state, and refetch function
 */
export function useLoanById(loanId: bigint | null) {
  const {
    data: loanData,
    isLoading,
    isError,
    error,
    refetch,
  } = useReadContract({
    ...lendingMarketContract,
    functionName: "getLoan",
    args: loanId ? [loanId] : undefined,
    query: {
      enabled: loanId !== null,
      retry: 3,
      retryDelay: 1000,
    },
  });

  const loan: Loan | null = loanData
    ? (Array.isArray(loanData)
        ? {
            borrower: loanData[0] as Loan["borrower"],
            amountRequested: loanData[1] as bigint,
            amountFunded: loanData[2] as bigint,
            termDuration: loanData[3] as bigint,
            interestRate: loanData[4] as bigint,
            createdAt: loanData[5] as bigint,
            vouchingDeadline: loanData[6] as bigint,
            crowdfundingDeadline: loanData[7] as bigint,
            repaymentDeadline: loanData[8] as bigint,
            gracePeriodEnd: loanData[9] as bigint,
            state: loanData[10] as LoanState,
            voucherCount: loanData[11] as bigint,
          }
        : {
            borrower: (loanData as any).borrower as Loan["borrower"],
            amountRequested: (loanData as any).amountRequested as bigint,
            amountFunded: (loanData as any).amountFunded as bigint,
            termDuration: (loanData as any).termDuration as bigint,
            interestRate: (loanData as any).interestRate as bigint,
            createdAt: (loanData as any).createdAt as bigint,
            vouchingDeadline: (loanData as any).vouchingDeadline as bigint,
            crowdfundingDeadline: (loanData as any).crowdfundingDeadline as bigint,
            repaymentDeadline: (loanData as any).repaymentDeadline as bigint,
            gracePeriodEnd: (loanData as any).gracePeriodEnd as bigint,
            state: (loanData as any).state as LoanState,
            voucherCount: (loanData as any).voucherCount as bigint,
          })
    : null;

  return {
    loan,
    isLoading,
    isError,
    error: error ? (error instanceof Error ? error : new Error(String(error))) : null,
    refetch,
  };
}

