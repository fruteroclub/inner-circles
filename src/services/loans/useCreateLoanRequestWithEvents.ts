"use client";

import { useEffect, useState, useRef } from "react";
import { useAccount, useWatchContractEvent } from "wagmi";
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

  // Fallback: If transaction is confirmed but no event received after delay
  useEffect(() => {
    if (isBaseSuccess && !pendingLoanId && transactionHashRef.current) {
      const timeoutId = setTimeout(() => {
        if (!pendingLoanId) {
          console.warn(
            "LoanRequestCreated event not received. Loan ID may need to be retrieved manually."
          );
          // Note: In a production app, you might want to read totalLoans
          // before/after to calculate the loan ID as a fallback
        }
      }, 10000); // 10 second timeout

      return () => clearTimeout(timeoutId);
    }
  }, [isBaseSuccess, pendingLoanId]);

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
