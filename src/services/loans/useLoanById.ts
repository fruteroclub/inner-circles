"use client";

import { useReadContract } from "wagmi";
import { lendingMarketContract } from "@/lib/contracts/config";
import type { Address } from "viem";
import type { Loan, ContractLoanData } from "@/types/loans";
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

  const contractLoan = loanData as ContractLoanData | null;
  const loan: Loan | null = contractLoan
    ? (Array.isArray(contractLoan)
        ? {
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

