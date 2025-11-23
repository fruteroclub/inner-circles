"use client";

import { useEffect, useRef } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { toast } from "sonner";
import { lendingMarketContract } from "@/lib/contracts/config";

interface UseContributeToLoanOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Hook to contribute to a loan during the crowdfunding phase
 * Amount must be 1, 2, or 5 CRC
 */
export function useContributeToLoan({
  onSuccess,
  onError,
}: UseContributeToLoanOptions = {}) {
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

  function contributeToLoan(loanId: bigint, amount: "1" | "2" | "5") {
    try {
      const amountWei = parseEther(amount);
      writeContract({
        ...lendingMarketContract,
        functionName: "contributeToLoan",
        args: [loanId, amountWei],
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Unknown error");
      toast.error(`Failed to contribute to loan: ${err.message}`);
      onError?.(err);
    }
  }

  useEffect(() => {
    if (writeError) {
      const error = new Error(writeError.message);
      toast.error(`Transaction failed: ${error.message}`);
      onError?.(error);
    }
  }, [writeError, onError]);

  useEffect(() => {
    if (receiptError) {
      const error = new Error(receiptError.message);
      toast.error(`Transaction confirmation failed: ${error.message}`);
      onError?.(error);
    }
  }, [receiptError, onError]);

  // Track if we've already called onSuccess to prevent multiple calls
  const hasCalledSuccess = useRef(false);
  
  useEffect(() => {
    if (isConfirmed && receipt && hash && !hasCalledSuccess.current) {
      hasCalledSuccess.current = true;
      toast.success("Successfully contributed to loan!");
      // Use setTimeout to prevent rapid callbacks that could cause infinite loops
      setTimeout(() => {
        onSuccess?.();
      }, 100);
    }
  }, [isConfirmed, receipt, hash, onSuccess]);
  
  // Reset the ref when the transaction hash changes
  useEffect(() => {
    if (!hash) {
      hasCalledSuccess.current = false;
    }
  }, [hash]);

  function reset() {
    resetWrite();
  }

  return {
    contributeToLoan,
    hash,
    isPending: isWritePending || isConfirming,
    isSuccess: isConfirmed,
    isError: !!writeError || !!receiptError,
    error: writeError || receiptError,
    reset,
  };
}

