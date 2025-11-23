"use client";

import { useReadContract } from "wagmi";
import { lendingMarketContract } from "@/lib/contracts/config";
import type { Loan } from "@/types/loans";
import { LoanState } from "@/types/loans";

/**
 * Hook to read loan details from the contract
 * 
 * @param loanId - The loan ID to fetch. If null, the hook is disabled.
 * @returns Object with loan data, loading state, error state, and refetch function
 */
export function useLoanDetails(loanId: bigint | null) {
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
      refetchInterval: (data) => {
        // No data yet, don't poll
        if (!data) return false;

        // Determine loan state
        // Contract returns struct as tuple or object depending on ABI decoding
        let state: LoanState;
        
        if (Array.isArray(data)) {
          // Tuple format (array access)
          // State is at index 10 (11th element, 0-indexed)
          state = data[10] as LoanState;
        } else {
          // Object format (named properties)
          state = (data as any).state as LoanState;
        }

        // Active states that need polling: Vouching, Crowdfunding, Funded
        const activeStates = [
          LoanState.Vouching,
          LoanState.Crowdfunding,
          LoanState.Funded,
        ];

        // Poll every 5 seconds (5000ms) if loan is in active state
        return activeStates.includes(state) ? 5000 : false;
      },
    },
  });

  // Transform contract data to Loan type
  // Handle both tuple format (array) and object format
  const loan: Loan | null = loanData
    ? (Array.isArray(loanData)
        ? {
            // Tuple format (array access)
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
            // Object format (named properties)
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

