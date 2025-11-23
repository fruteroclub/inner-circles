"use client";

import { useEffect, useRef } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount } from "wagmi";
import { parseEther, maxUint256 } from "viem";
import { toast } from "sonner";
import { lendingMarketContract } from "@/lib/contracts/config";
import { erc20Abi } from "viem";

interface UseApproveTokenOptions {
  tokenAddress: `0x${string}` | undefined;
  spenderAddress: `0x${string}`;
  amount?: bigint; // If undefined, approves max
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

/**
 * Hook to approve token spending
 */
export function useApproveToken({
  tokenAddress,
  spenderAddress,
  amount,
  onSuccess,
  onError,
  enabled = true,
}: UseApproveTokenOptions) {
  const {
    writeContract: writeApprove,
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

  // Check current allowance
  const { address } = useAccount();
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "allowance",
    args: address && spenderAddress && tokenAddress ? [address, spenderAddress] : undefined,
    query: {
      enabled: enabled && !!address && !!spenderAddress && !!tokenAddress,
    },
  });
  
  // Refetch allowance after approval to update needsApproval check
  useEffect(() => {
    if (isConfirmed && receipt && hash) {
      // Refetch allowance after a short delay to get updated value
      setTimeout(() => {
        refetchAllowance();
      }, 1000);
    }
  }, [isConfirmed, receipt, hash, refetchAllowance]);

  function approve() {
    if (!tokenAddress) {
      toast.error("Token address not available");
      return;
    }
    
    try {
      const approveAmount = amount ?? maxUint256;
      writeApprove({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "approve",
        args: [spenderAddress, approveAmount],
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Unknown error");
      toast.error(`Failed to approve token: ${err.message}`);
      onError?.(err);
    }
  }

  useEffect(() => {
    if (writeError) {
      const error = new Error(writeError.message);
      toast.error(`Approval failed: ${error.message}`);
      onError?.(error);
    }
  }, [writeError, onError]);

  useEffect(() => {
    if (receiptError) {
      const error = new Error(receiptError.message);
      toast.error(`Approval confirmation failed: ${error.message}`);
      onError?.(error);
    }
  }, [receiptError, onError]);

  // Track if we've already called onSuccess to prevent multiple calls
  const hasCalledSuccess = useRef(false);
  
  useEffect(() => {
    if (isConfirmed && receipt && hash && !hasCalledSuccess.current) {
      hasCalledSuccess.current = true;
      toast.success("Token approval successful!");
      // Use setTimeout to prevent rapid callbacks that could cause infinite loops
      setTimeout(() => {
        onSuccess?.();
      }, 100);
    }
  }, [isConfirmed, receipt, hash, onSuccess]);
  
  // Reset the ref when the approval transaction changes
  useEffect(() => {
    if (!hash) {
      hasCalledSuccess.current = false;
    }
  }, [hash]);

  const needsApproval = amount
    ? (allowance as bigint | undefined) !== undefined &&
      (allowance as bigint) < amount
    : false;

  function reset() {
    resetWrite();
  }

  return {
    approve,
    hash,
    isPending: isWritePending || isConfirming,
    isSuccess: isConfirmed,
    isError: !!writeError || !!receiptError,
    error: writeError || receiptError,
    allowance: allowance as bigint | undefined,
    needsApproval,
    reset,
  };
}

