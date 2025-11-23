"use client";

import { useEffect, useState, useRef } from "react";
import { useAccount, useWatchContractEvent, usePublicClient } from "wagmi";
import { toast } from "sonner";
import { lendingMarketContract } from "@/lib/contracts/config";
import { useCreateLoanRequest } from "./useCreateLoanRequest";
import type { LoanRequestResult } from "@/types/loans";

interface UseCreateLoanRequestWithEventsOptions {
  onSuccess?: (result: LoanRequestResult) => void;
  onError?: (error: Error) => void;
}

/**
 * Enhanced hook that listens for LoanRequestCreated events
 * to automatically retrieve the loan ID
 */
export function useCreateLoanRequestWithEvents({
  onSuccess,
  onError,
}: UseCreateLoanRequestWithEventsOptions = {}) {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [pendingLoanId, setPendingLoanId] = useState<bigint | null>(null);
  const transactionHashRef = useRef<`0x${string}` | null>(null);
  const hasProcessedEventRef = useRef(false);

  const {
    createLoanRequest,
    hash,
    isPending,
    isSuccess: isBaseSuccess,
    isError,
    error,
    reset: resetBase,
  } = useCreateLoanRequest({
    onError,
  });

  // Track transaction hash when it's available
  useEffect(() => {
    if (hash) {
      transactionHashRef.current = hash;
      hasProcessedEventRef.current = false;
    }
  }, [hash]);

  // Reset pending loan ID when transaction hash changes or is reset
  useEffect(() => {
    if (!hash) {
      setPendingLoanId(null);
      transactionHashRef.current = null;
      hasProcessedEventRef.current = false;
    }
  }, [hash]);

  // Listen for LoanRequestCreated events
  useWatchContractEvent({
    ...lendingMarketContract,
    eventName: "LoanRequestCreated",
    onLogs(logs) {
      if (!address || hasProcessedEventRef.current) {
        return;
      }

      // Find the log for our transaction
      // Filter by borrower address matching current user
      // Type assertion needed because Wagmi types the logs generically
      // The event structure: LoanRequestCreated(uint256 indexed loanId, address indexed borrower, uint256 amount, uint256 termDuration)
      type LoanRequestCreatedLog = {
        args: {
          loanId: bigint;
          borrower: `0x${string}`;
          amount: bigint;
          termDuration: bigint;
        };
      };

      const relevantLog = logs.find((log) => {
        const typedLog = log as unknown as LoanRequestCreatedLog;
        const borrower = typedLog.args?.borrower;
        return (
          borrower?.toLowerCase() === address.toLowerCase() &&
          !hasProcessedEventRef.current
        );
      }) as unknown as LoanRequestCreatedLog | undefined;

      if (relevantLog?.args?.loanId) {
        const args = relevantLog.args;
        const loanId = args.loanId;
        const amount = args.amount;
        const termDuration = args.termDuration;

        // Mark as processed to prevent duplicate processing
        hasProcessedEventRef.current = true;
        setPendingLoanId(loanId);

        // Build LoanRequestResult
        const result: LoanRequestResult = {
          loanId,
          transactionHash:
            transactionHashRef.current || hash || ("0x" as `0x${string}`),
          borrower: address,
          amountRequested: amount,
          termDuration,
        };

        toast.success(`Loan request #${loanId.toString()} created!`);
        onSuccess?.(result);
      }
    },
  });

  // Fallback: If transaction is confirmed but no event received, fetch loan ID manually
  useEffect(() => {
    if (
      isBaseSuccess &&
      !pendingLoanId &&
      transactionHashRef.current &&
      publicClient &&
      address
    ) {
      const timeoutId = setTimeout(async () => {
        if (!pendingLoanId && !hasProcessedEventRef.current) {
          try {
            // Get current total loans - the new loan ID should be totalLoans
            const totalLoansResult = (await publicClient.readContract({
              ...lendingMarketContract,
              functionName: "totalLoans",
            })) as bigint;

            const newLoanId = BigInt(totalLoansResult.toString());

            // Verify this loan belongs to the current user
            const loanData = (await publicClient.readContract({
              ...lendingMarketContract,
              functionName: "getLoan",
              args: [newLoanId],
            })) as
              | [
                  `0x${string}`,
                  bigint,
                  bigint,
                  bigint,
                  bigint,
                  bigint,
                  bigint,
                  bigint,
                  bigint,
                  bigint,
                  number,
                  bigint
                ]
              | {
                  borrower: `0x${string}`;
                  amountRequested: bigint;
                  amountFunded: bigint;
                  termDuration: bigint;
                  interestRate: bigint;
                  createdAt: bigint;
                  vouchingDeadline: bigint;
                  crowdfundingDeadline: bigint;
                  repaymentDeadline: bigint;
                  gracePeriodEnd: bigint;
                  state: number;
                  voucherCount: bigint;
                };

            const borrower = Array.isArray(loanData)
              ? loanData[0]
              : loanData.borrower;

            if (borrower?.toLowerCase() === address.toLowerCase()) {
              hasProcessedEventRef.current = true;
              setPendingLoanId(newLoanId);
              const result: LoanRequestResult = {
                loanId: newLoanId,
                transactionHash:
                  transactionHashRef.current || hash || ("0x" as `0x${string}`),
                borrower: address,
                amountRequested: Array.isArray(loanData)
                  ? loanData[1]
                  : loanData.amountRequested,
                termDuration: Array.isArray(loanData)
                  ? loanData[3]
                  : loanData.termDuration,
              };
              toast.success(`Loan request #${newLoanId.toString()} created!`);
              onSuccess?.(result);
            }
          } catch (error) {
            console.error("Failed to fetch loan ID manually:", error);
            toast.error(
              "Loan request created but couldn't retrieve loan ID. Please check your loans manually."
            );
          }
        }
      }, 5000); // 5 second timeout before fallback

      return () => clearTimeout(timeoutId);
    }
  }, [isBaseSuccess, pendingLoanId, address, hash, onSuccess, publicClient]);

  function reset() {
    setPendingLoanId(null);
    transactionHashRef.current = null;
    hasProcessedEventRef.current = false;
    resetBase();
  }

  return {
    createLoanRequest,
    hash,
    loanId: pendingLoanId,
    isPending,
    isSuccess: isBaseSuccess && pendingLoanId !== null,
    isError,
    error,
    reset,
  };
}
