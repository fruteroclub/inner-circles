"use client";

import { useState, useRef, useEffect } from "react";
import { useAccount } from "wagmi";
import { parseEther } from "viem";
import { LoanState, type Loan } from "@/types/loans";
import { useVouchForLoan } from "@/services/loans/useVouchForLoan";
import { useContributeToLoan } from "@/services/loans/useContributeToLoan";
import { useIsVoucher } from "@/services/loans/useIsVoucher";
import { useApproveToken } from "@/services/loans/useApproveToken";
import { useCrcTokenAddress } from "@/services/loans/useCrcTokenAddress";
import { lendingMarketContract } from "@/lib/contracts/config";
import { Button } from "@/components/ui/button";

interface LoanActionsProps {
  loan: Loan;
  loanId: bigint | null;
  onActionSuccess?: () => void;
}

export function LoanActions({ loan, loanId, onActionSuccess }: LoanActionsProps) {
  const { address, isConnected } = useAccount();
  const isBorrower = address?.toLowerCase() === loan.borrower.toLowerCase();
  const { isVoucher, isLoading: isLoadingVoucher } = useIsVoucher(loanId);
  const [showContributeOptions, setShowContributeOptions] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<"1" | "2" | "5" | null>(null);
  const { tokenAddress } = useCrcTokenAddress();
  
  // Refs to prevent multiple calls
  const hasTriggeredVouchAfterApproval = useRef(false);
  const hasTriggeredContributeAfterApproval = useRef(false);
  
  // Approval for vouching (1 CRC)
  const vouchAmount = parseEther("1");
  const {
    approve: approveVouch,
    needsApproval: needsVouchApproval,
    isPending: isApprovingVouch,
    isSuccess: isVouchApproved,
  } = useApproveToken({
    tokenAddress: tokenAddress,
    spenderAddress: lendingMarketContract.address,
    amount: vouchAmount,
    onSuccess: () => {
      // Prevent multiple calls
      if (hasTriggeredVouchAfterApproval.current) {
        return;
      }
      hasTriggeredVouchAfterApproval.current = true;
      
      // After approval, automatically trigger vouch
      // Use setTimeout to prevent rapid state updates
      setTimeout(() => {
        if (loanId) {
          vouchForLoan(loanId);
        }
      }, 500);
    },
    enabled: !!tokenAddress && (loan.state === LoanState.Vouching || loan.state === LoanState.Requested),
  });
  
  // Reset ref when loanId changes or when approval is no longer needed
  useEffect(() => {
    if (!needsVouchApproval || !isVouchApproved) {
      hasTriggeredVouchAfterApproval.current = false;
    }
  }, [needsVouchApproval, isVouchApproved, loanId]);

  const {
    vouchForLoan,
    isPending: isVouchingPending,
    isSuccess: isVouchingSuccess,
  } = useVouchForLoan({
    onSuccess: () => {
      onActionSuccess?.();
    },
  });

  const {
    contributeToLoan,
    isPending: isContributingPending,
    isSuccess: isContributingSuccess,
  } = useContributeToLoan({
    onSuccess: () => {
      setShowContributeOptions(false);
      setSelectedAmount(null);
      onActionSuccess?.();
    },
  });

  // Don't show actions for borrower
  if (isBorrower) {
    return null;
  }

  // Don't show actions if not connected
  if (!isConnected) {
    return (
      <p className="text-sm text-muted-foreground">Connect wallet to interact</p>
    );
  }

  // Vouching phase - show vouch button
  if (loan.state === LoanState.Vouching || loan.state === LoanState.Requested) {
    if (isLoadingVoucher || !tokenAddress) {
      return <p className="text-sm text-muted-foreground">Checking...</p>;
    }

    if (isVoucher) {
      return (
        <span className="text-sm text-green-600 dark:text-green-400">
          ✓ You vouched
        </span>
      );
    }

    // Check if approval is needed
    if (needsVouchApproval && !isVouchApproved) {
      return (
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            approveVouch();
          }}
          disabled={isApprovingVouch}
        >
          {isApprovingVouch ? "Approving..." : "Approve & Vouch (1 CRC)"}
        </Button>
      );
    }

    return (
      <Button
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          if (loanId) {
            vouchForLoan(loanId);
          }
        }}
        disabled={isVouchingPending || isVouchingSuccess}
      >
        {isVouchingPending
          ? "Vouching..."
          : isVouchingSuccess
          ? "Vouched!"
          : "Vouch (1 CRC)"}
      </Button>
    );
  }

  // Approval for contributing (check for max amount needed: 5 CRC)
  const maxContributionAmount = parseEther("5");
  const {
    approve: approveContribute,
    needsApproval: needsContributeApproval,
    isPending: isApprovingContribute,
    isSuccess: isContributeApproved,
  } = useApproveToken({
    tokenAddress: tokenAddress,
    spenderAddress: lendingMarketContract.address,
    amount: maxContributionAmount,
    onSuccess: () => {
      // Prevent multiple calls
      if (hasTriggeredContributeAfterApproval.current) {
        return;
      }
      hasTriggeredContributeAfterApproval.current = true;
      
      // After approval, automatically trigger contribution if amount was selected
      // Use setTimeout to prevent rapid state updates
      setTimeout(() => {
        if (loanId && selectedAmount) {
          contributeToLoan(loanId, selectedAmount);
          setSelectedAmount(null);
        }
      }, 500);
    },
    enabled: !!tokenAddress && loan.state === LoanState.Crowdfunding && !!selectedAmount,
  });
  
  // Reset ref when selectedAmount changes or when approval is no longer needed
  useEffect(() => {
    if (!selectedAmount || !needsContributeApproval || !isContributeApproved) {
      hasTriggeredContributeAfterApproval.current = false;
    }
  }, [selectedAmount, needsContributeApproval, isContributeApproved, loanId]);

  // Crowdfunding phase - show contribute button
  if (loan.state === LoanState.Crowdfunding) {

    if (showContributeOptions) {
      const handleContribute = (amount: "1" | "2" | "5") => {
        if (!loanId || !tokenAddress) return;
        
        // Check if approval is needed for this amount
        const amountWei = parseEther(amount);
        // We check if approval is needed (for max 5 CRC, which covers all amounts)
        if (needsContributeApproval) {
          setSelectedAmount(amount);
          approveContribute();
        } else {
          contributeToLoan(loanId, amount);
        }
      };

      return (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground">Choose amount:</p>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleContribute("1");
              }}
              disabled={isContributingPending || isApprovingContribute}
            >
              1 CRC
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleContribute("2");
              }}
              disabled={isContributingPending || isApprovingContribute}
            >
              2 CRC
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleContribute("5");
              }}
              disabled={isContributingPending || isApprovingContribute}
            >
              5 CRC
            </Button>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              setShowContributeOptions(false);
              setSelectedAmount(null);
            }}
          >
            Cancel
          </Button>
        </div>
      );
    }

    return (
      <Button
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          setShowContributeOptions(true);
        }}
        disabled={isContributingPending || isContributingSuccess}
      >
        {isContributingPending || isApprovingContribute
          ? "Processing..."
          : isContributingSuccess
          ? "Contributed!"
          : "Fund Loan"}
      </Button>
    );
  }

  // Other states - no actions available
  return null;
}

