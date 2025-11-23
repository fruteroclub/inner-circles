"use client";

import { useEffect, useRef } from "react";
import { useWriteContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import { toast } from "sonner";
import { lendingMarketContract } from "@/lib/contracts/config";
import { LoanState } from "@/types/loans";

interface UseAdminTimeSimulationOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for admin time simulation functions
 * Allows fast-forwarding time and moving loans between stages
 */
export function useAdminTimeSimulation({
  onSuccess,
  onError,
}: UseAdminTimeSimulationOptions = {}) {
  const {
    writeContract,
    data: hash,
    error: writeError,
    isPending: isWritePending,
    reset: resetWrite,
  } = useWriteContract();

  const publicClient = usePublicClient();

  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  /**
   * Fast forward vouching deadline to now (moves to crowdfunding if 3+ vouchers)
   */
  async function fastForwardVouching(loanId: bigint) {
    try {
      if (!publicClient) {
        throw new Error("Public client not available");
      }

      const currentBlock = await publicClient.getBlockNumber();
      const currentTimestamp = (await publicClient.getBlock({ blockNumber: currentBlock })).timestamp;

      writeContract({
        ...lendingMarketContract,
        functionName: "setVouchingDeadline",
        args: [loanId, currentTimestamp],
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Unknown error");
      toast.error(`Failed to fast forward vouching: ${err.message}`);
      onError?.(err);
    }
  }


  /**
   * Fast forward repayment deadline to now (moves closer to default)
   */
  async function fastForwardRepayment(loanId: bigint) {
    try {
      if (!publicClient) {
        throw new Error("Public client not available");
      }

      const currentBlock = await publicClient.getBlockNumber();
      const currentTimestamp = (await publicClient.getBlock({ blockNumber: currentBlock })).timestamp;

      writeContract({
        ...lendingMarketContract,
        functionName: "setRepaymentDeadline",
        args: [loanId, currentTimestamp],
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Unknown error");
      toast.error(`Failed to fast forward repayment: ${err.message}`);
      onError?.(err);
    }
  }

  /**
   * Fast forward grace period to now (triggers default)
   */
  async function fastForwardGracePeriod(loanId: bigint) {
    try {
      if (!publicClient) {
        throw new Error("Public client not available");
      }

      const currentBlock = await publicClient.getBlockNumber();
      const currentTimestamp = (await publicClient.getBlock({ blockNumber: currentBlock })).timestamp;

      // Set grace period to 0 (ends immediately)
      writeContract({
        ...lendingMarketContract,
        functionName: "setGracePeriod",
        args: [loanId, BigInt(0)],
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Unknown error");
      toast.error(`Failed to fast forward grace period: ${err.message}`);
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

  const hasCalledSuccess = useRef(false);
  
  useEffect(() => {
    if (isConfirmed && receipt && hash && !hasCalledSuccess.current) {
      hasCalledSuccess.current = true;
      toast.success("Time fast-forwarded successfully!");
      setTimeout(() => {
        onSuccess?.();
      }, 100);
    }
  }, [isConfirmed, receipt, hash, onSuccess]);
  
  useEffect(() => {
    if (!hash) {
      hasCalledSuccess.current = false;
    }
  }, [hash]);

  function reset() {
    resetWrite();
  }

  return {
    fastForwardVouching,
    fastForwardRepayment,
    fastForwardGracePeriod,
    hash,
    isPending: isWritePending || isConfirming,
    isSuccess: isConfirmed,
    isError: !!writeError || !!receiptError,
    error: writeError || receiptError,
    reset,
  };
}

