"use client";

import { useState, useEffect, useCallback } from "react";
import { usePublicClient } from "wagmi";
import type { Address } from "viem";
import { lendingMarketContract } from "@/lib/contracts/config";
import type { Loan, ContractLoanData } from "@/types/loans";
import { LoanState } from "@/types/loans";

/**
 * Hook to fetch all loans from the contract
 * 
 * This hook:
 * 1. Fetches the total number of loans
 * 2. Iterates through all loan IDs (1 to totalLoans)
 * 3. Fetches each loan's details using the public client
 * 
 * @returns Object with all loans, loading state, error state, and refetch function
 */
export function useAllLoans() {
  const publicClient = usePublicClient();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [totalLoans, setTotalLoans] = useState<bigint>(BigInt(0));
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAllLoans = useCallback(async () => {
    if (!publicClient) {
      setError(new Error("Public client not available"));
      setIsError(true);
      return;
    }

    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      // First, get total loans
      const totalLoansResult = (await publicClient.readContract({
        ...lendingMarketContract,
        functionName: "totalLoans",
      })) as bigint;

      const total = BigInt(totalLoansResult.toString());
      setTotalLoans(total);

      if (total === BigInt(0)) {
        setLoans([]);
        setIsLoading(false);
        return;
      }

      // Fetch all loans in parallel
      const loanPromises: Promise<Loan | null>[] = [];
      for (let i = BigInt(1); i <= total; i++) {
        loanPromises.push(
          publicClient
            .readContract({
              ...lendingMarketContract,
              functionName: "getLoan",
              args: [i],
            })
            .then((loanData) => {
              const contractLoan = loanData as ContractLoanData;
              // Transform contract data to Loan type
              if (Array.isArray(contractLoan)) {
                return {
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
                };
              } else {
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
              }
            })
            .catch(() => null) // Ignore errors for individual loans (might not exist)
        );
      }

      const fetchedLoans = await Promise.all(loanPromises);
      const validLoans = fetchedLoans
        .map((loan, index) => {
          // Add loanId to each loan for easier tracking
          if (loan) {
            return { ...loan, loanId: BigInt(index + 1) };
          }
          return null;
        })
        .filter((loan): loan is Loan & { loanId: bigint } => loan !== null);
      setLoans(validLoans as Loan[]);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [publicClient]);

  useEffect(() => {
    fetchAllLoans();
  }, [fetchAllLoans]);

  return {
    loans,
    totalLoans,
    isLoading,
    isError,
    error,
    refetch: fetchAllLoans,
  };
}

