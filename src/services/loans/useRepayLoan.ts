"use client";

import { useEffect, useRef } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { toast } from "sonner";
import { lendingMarketContract } from "@/lib/contracts/config";

interface UseRepayLoanOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Hook to repay a loan (supports full or partial repayments)
 * Distributes repayment with priority: external lenders → vouchers
 */
export function useRepayLoan({
  onSuccess,
  onError,
}: UseRepayLoanOptions = {}) {
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

  function repayLoan(loanId: bigint, amount: string) {
    try {
      const amountWei = parseEther(amount);
      writeContract({
        ...lendingMarketContract,
        functionName: "repayLoan",
        args: [loanId, amountWei],
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Unknown error");
      toast.error(`Failed to repay loan: ${err.message}`);
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
      toast.success("Repayment successful! Funds have been distributed to lenders.");
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
    repayLoan,
    hash,
    isPending: isWritePending || isConfirming,
    isSuccess: isConfirmed,
    isError: !!writeError || !!receiptError,
    error: writeError || receiptError,
    reset,
  };
}

