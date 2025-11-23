"use client";

import { useReadContract } from "wagmi";
import { lendingMarketContract } from "@/lib/contracts/config";
import type { Address } from "viem";
import type { Loan, ContractLoanData } from "@/types/loans";
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
        
        const contractLoan = data as unknown as ContractLoanData;
        if (Array.isArray(contractLoan)) {
          // Tuple format (array access)
          // State is at index 10 (11th element, 0-indexed)
          state = contractLoan[10] as LoanState;
        } else {
          // Object format (named properties)
          const loanObj = contractLoan as Extract<ContractLoanData, { state: LoanState }>;
          state = loanObj.state as LoanState;
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
  const contractLoan = loanData as ContractLoanData | null;
  const loan: Loan | null = contractLoan
    ? (Array.isArray(contractLoan)
        ? {
            // Tuple format (array access)
            borrower: contractLoan[0] as Loan["borrower"],
            amountRequested: contractLoan[1] as bigint,
            amountFunded: contractLoan[2] as bigint,
            termDuration: contractLoan[3] as bigint,
            interestRate: contractLoan[4] as bigint,
            createdAt: contractLoan[5] as bigint,
            vouchingDeadline: contractLoan[6] as bigint,
            crowdfundingDeadline: contractLoan[7] as bigint,
            repaymentDeadline: contractLoan[8] as bigint,
            gracePeriodEnd: contractLoan[9] as bigint,
            state: contractLoan[10] as LoanState,
            voucherCount: contractLoan[11] as bigint,
          }
        : (() => {
            const loanObj = contractLoan as Extract<ContractLoanData, { borrower: Address }>;
            return {
              // Object format (named properties)
              borrower: loanObj.borrower as Loan["borrower"],
              amountRequested: loanObj.amountRequested as bigint,
              amountFunded: loanObj.amountFunded as bigint,
              termDuration: loanObj.termDuration as bigint,
              interestRate: loanObj.interestRate as bigint,
              createdAt: loanObj.createdAt as bigint,
              vouchingDeadline: loanObj.vouchingDeadline as bigint,
              crowdfundingDeadline: loanObj.crowdfundingDeadline as bigint,
              repaymentDeadline: loanObj.repaymentDeadline as bigint,
              gracePeriodEnd: loanObj.gracePeriodEnd as bigint,
              state: loanObj.state as LoanState,
              voucherCount: loanObj.voucherCount as bigint,
            };
          })())
    : null;

  return {
    loan,
    isLoading,
    isError,
    error: error ? (error instanceof Error ? error : new Error(String(error))) : null,
    refetch,
  };
}

