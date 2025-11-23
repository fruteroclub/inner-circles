"use client";

import { useState, useEffect, useCallback } from "react";
import { usePublicClient } from "wagmi";
import { lendingMarketContract } from "@/lib/contracts/config";
import type { Loan } from "@/types/loans";
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
              // Transform contract data to Loan type
              if (Array.isArray(loanData)) {
                return {
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
                };
              } else {
                return {
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

