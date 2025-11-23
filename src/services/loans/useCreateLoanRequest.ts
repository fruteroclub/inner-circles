"use client";

import { useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { toast } from "sonner";
import { lendingMarketContract } from "@/lib/contracts/config";
import type { LoanRequestInput, LoanRequestResult } from "@/types/loans";

interface UseCreateLoanRequestOptions {
  onSuccess?: (result: LoanRequestResult) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for creating a loan request
 *
 * @param onSuccess - Callback when loan request is successfully created
 * @param onError - Callback when an error occurs
 * @returns Object with write function, transaction state, and loan data
 */
export function useCreateLoanRequest({
  onSuccess,
  onError,
}: UseCreateLoanRequestOptions = {}) {
  const {
    writeContract,
    data: hash,
    error: writeError,
    isPending: isWritePending,
    reset: resetWrite,
  } = useWriteContract();

  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  /**
   * Create a loan request
   */
  function createLoanRequest(input: LoanRequestInput) {
    try {
      // Validate input
      const amountRequested = parseEther(input.amountRequested);
      const termDuration = BigInt(input.termDuration * 24 * 60 * 60); // Convert days to seconds

      if (amountRequested <= BigInt(0)) {
        const error = new Error("Loan amount must be greater than 0");
        toast.error(`Failed to create loan request: ${error.message}`);
        onError?.(error);
        return;
      }

      if (termDuration <= BigInt(0)) {
        const error = new Error("Term duration must be greater than 0");
        toast.error(`Failed to create loan request: ${error.message}`);
        onError?.(error);
        return;
      }

      // Write to contract
      writeContract({
        ...lendingMarketContract,
        functionName: "createLoanRequest",
        args: [amountRequested, termDuration],
      });
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error("Unknown error");
      toast.error(`Failed to create loan request: ${err.message}`);
      onError?.(err);
    }
  }

  // Handle write errors
  useEffect(() => {
    if (writeError) {
      const error = new Error(writeError.message);
      toast.error(`Transaction failed: ${error.message}`);
      onError?.(error);
    }
  }, [writeError, onError]);

  // Handle receipt errors
  useEffect(() => {
    if (receiptError) {
      const error = new Error(receiptError.message);
      toast.error(`Transaction confirmation failed: ${error.message}`);
      onError?.(error);
    }
  }, [receiptError, onError]);

  // Handle success
  useEffect(() => {
    if (isConfirmed && receipt && hash) {
      toast.success("Loan request transaction confirmed!");
      // Note: Loan ID extraction will be handled in next ticket (useCreateLoanRequestWithEvents)
      // For now, we just confirm the transaction was successful
    }
  }, [isConfirmed, receipt, hash]);

  function reset() {
    resetWrite();
  }

  return {
    createLoanRequest,
    hash,
    isPending: isWritePending || isConfirming,
    isSuccess: isConfirmed,
    isError: !!writeError || !!receiptError,
    error: writeError || receiptError,
    reset,
  };
}

