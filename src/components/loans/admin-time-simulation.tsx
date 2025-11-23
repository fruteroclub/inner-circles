"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { LoanState, type Loan } from "@/types/loans";
import { useAdminTimeSimulation } from "@/services/loans/useAdminTimeSimulation";
import { useConfirmLoanTerms } from "@/services/loans/useConfirmLoanTerms";
import { useDisburseLoan } from "@/services/loans/useDisburseLoan";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminTimeSimulationProps {
  loanId: bigint;
  loan: Loan;
  className?: string;
  onActionSuccess?: () => void;
}

export function AdminTimeSimulation({
  loanId,
  loan,
  className,
  onActionSuccess,
}: AdminTimeSimulationProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { address } = useAccount();
  const isBorrower = address?.toLowerCase() === loan.borrower.toLowerCase();

  const {
    confirmLoanTerms,
    isPending: isConfirmPending,
  } = useConfirmLoanTerms({
    onSuccess: () => {
      onActionSuccess?.();
    },
  });

  const {
    disburseLoan,
    isPending: isDisbursePending,
  } = useDisburseLoan({
    onSuccess: () => {
      onActionSuccess?.();
    },
  });

  const {
    fastForwardVouching,
    fastForwardRepayment,
    fastForwardGracePeriod,
    isPending: isTimeSimPending,
  } = useAdminTimeSimulation({
    onSuccess: () => {
      onActionSuccess?.();
    },
  });

  // Handle fast forward from Vouching to Crowdfunding
  async function handleFastForwardVouching() {
    await fastForwardVouching(loanId);
    // After deadline is fast-forwarded, if conditions are met, automatically move to Crowdfunding
    if (loan.voucherCount >= BigInt(3) && isBorrower) {
      setTimeout(() => {
        confirmLoanTerms(loanId);
      }, 1500); // Wait for deadline update to be confirmed
    }
  }

  // Handle fast forward from Crowdfunding to Funded
  async function handleFastForwardCrowdfunding() {
    // Directly disburse to move to Funded (borrower evaluates terms and confirms)
    if (loan.amountFunded >= loan.amountRequested && isBorrower) {
      disburseLoan(loanId);
    }
  }

  // Determine which actions are available based on loan state
  const canFastForwardVouching = loan.state === LoanState.Vouching || loan.state === LoanState.Requested;
  const canFastForwardCrowdfunding = loan.state === LoanState.Crowdfunding;
  const canFastForwardRepayment = loan.state === LoanState.Funded;
  const canFastForwardGracePeriod = loan.state === LoanState.Funded;

  const isPending = isTimeSimPending || isConfirmPending || isDisbursePending;

  if (!canFastForwardVouching && !canFastForwardCrowdfunding && !canFastForwardRepayment && !canFastForwardGracePeriod) {
    return null; // No admin actions available for this loan state
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="gap-2"
        disabled={isPending}
      >
        <Clock className="h-4 w-4" />
        {isExpanded ? "Hide" : "Fast Forward Time"}
      </Button>

      {isExpanded && (
        <div className="rounded-lg border bg-card p-3 space-y-2">
          <p className="text-xs font-medium text-foreground mb-2">
            Admin: Simulate Time Passing
          </p>
          
          {canFastForwardVouching && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleFastForwardVouching}
              disabled={isPending}
              className="w-full justify-start gap-2"
            >
              <Clock className="h-3 w-3" />
              {loan.voucherCount >= BigInt(3) && isBorrower
                ? "Move to Crowdfunding"
                : "End Vouching Period"}
              {loan.voucherCount < BigInt(3) && (
                <span className="text-xs text-muted-foreground ml-auto">
                  (Need 3+ vouchers to auto-advance)
                </span>
              )}
              {loan.voucherCount >= BigInt(3) && !isBorrower && (
                <span className="text-xs text-muted-foreground ml-auto">
                  (Borrower must sign)
                </span>
              )}
            </Button>
          )}

          {canFastForwardCrowdfunding && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleFastForwardCrowdfunding}
              disabled={isPending || loan.amountFunded < loan.amountRequested || !isBorrower}
              className="w-full justify-start gap-2"
            >
              <Clock className="h-3 w-3" />
              Move to Funded
              {loan.amountFunded < loan.amountRequested && (
                <span className="text-xs text-muted-foreground ml-auto">
                  (Need full funding)
                </span>
              )}
              {!isBorrower && (
                <span className="text-xs text-muted-foreground ml-auto">
                  (Borrower only)
                </span>
              )}
            </Button>
          )}

          {canFastForwardRepayment && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => fastForwardRepayment(loanId)}
              disabled={isPending}
              className="w-full justify-start gap-2"
            >
              <Clock className="h-3 w-3" />
              Fast Forward to Repayment Due
            </Button>
          )}

          {canFastForwardGracePeriod && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => fastForwardGracePeriod(loanId)}
              disabled={isPending}
              className="w-full justify-start gap-2"
            >
              <Clock className="h-3 w-3" />
              End Grace Period (Trigger Default)
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

