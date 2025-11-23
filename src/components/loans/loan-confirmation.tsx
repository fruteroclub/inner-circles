"use client";

import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { LoanState, type Loan } from "@/types/loans";
import { useConfirmLoanTerms } from "@/services/loans/useConfirmLoanTerms";
import {
  calculateInterestRate,
  formatInterestRate,
} from "@/lib/utils/loan-utils";
import { useCalculateInterestRate } from "@/services/loans/useCalculateInterestRate";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LoanConfirmationProps {
  loanId: bigint;
  loan: Loan;
  className?: string;
  onActionSuccess?: () => void;
}

export function LoanConfirmation({
  loanId,
  loan,
  className,
  onActionSuccess,
}: LoanConfirmationProps) {
  const { address } = useAccount();
  const isBorrower = address?.toLowerCase() === loan.borrower.toLowerCase();

  const { confirmLoanTerms, isPending, isSuccess } = useConfirmLoanTerms({
    onSuccess: () => {
      onActionSuccess?.();
    },
    onError: (error) => {
      console.error("Failed to confirm loan terms:", error);
    },
  });

  // Get interest rate directly from contract to ensure it's always accurate
  const { interestRate: contractInterestRate } = useCalculateInterestRate(
    loan.voucherCount
  );

  // Only show for borrower and when in Vouching state
  if (!isBorrower || loan.state !== LoanState.Vouching) {
    return null;
  }

  // Check if minimum vouchers requirement is met
  const hasMinimumVouchers = loan.voucherCount >= BigInt(3);

  // Get interest rate directly from contract to ensure it's always accurate
  const { interestRate: contractInterestRate } = useCalculateInterestRate(
    loan.voucherCount
  );

  // Use contract rate if available, otherwise fall back to local calculation
  const interestRateBasisPoints =
    contractInterestRate !== undefined
      ? Number(contractInterestRate)
      : calculateInterestRate(loan.voucherCount);
  const interestRate = formatInterestRate(BigInt(interestRateBasisPoints));

  if (!hasMinimumVouchers) {
    return (
      <div
        className={cn(
          "rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:bg-yellow-950",
          className
        )}
      >
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          Waiting for more vouchers. You need at least 3 vouchers to confirm
          loan terms. Currently have {loan.voucherCount.toString()} voucher
          {loan.voucherCount !== BigInt(1) ? "s" : ""}.
        </p>
      </div>
    );
  }

  const totalOwed =
    loan.amountRequested +
    (loan.amountRequested * BigInt(interestRateBasisPoints)) / BigInt(10000);

  return (
    <div className={cn("space-y-4 rounded-lg border p-6", className)}>
      <div>
        <h3 className="text-lg font-semibold font-funnel">
          Confirm Loan Terms
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Review the loan terms and confirm to proceed to the crowdfunding
          phase.
        </p>
      </div>

      <div className="space-y-3 rounded-md border bg-card p-4">
        <div className="flex justify-between">
          <span className="text-sm text-foreground/70">Loan Amount:</span>
          <span className="font-semibold">
            {formatEther(loan.amountRequested)} CRC
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-foreground/70">Vouchers:</span>
          <span className="font-semibold">{loan.voucherCount.toString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-foreground/70">Interest Rate:</span>
          <span className="font-semibold">{interestRate}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-foreground/70">Total Interest:</span>
          <span className="font-semibold">
            {formatEther(
              (loan.amountRequested * BigInt(interestRateBasisPoints)) /
                BigInt(10000)
            )}{" "}
            CRC
          </span>
        </div>
        <div className="border-t pt-3">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Total Amount to Repay:</span>
            <span className="font-bold">{formatEther(totalOwed)} CRC</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => confirmLoanTerms(loanId)}
          disabled={isPending || isSuccess}
          className="flex-1 font-funnel font-medium"
        >
          {isPending
            ? "Confirming..."
            : isSuccess
            ? "Confirmed!"
            : "Confirm Loan Terms"}
        </Button>
      </div>

      {isSuccess && (
        <div className="rounded-md border border-green-200 bg-green-50 p-3 dark:bg-green-950">
          <p className="text-sm text-green-800 dark:text-green-200">
            Loan terms confirmed! Your loan is now open for crowdfunding.
          </p>
        </div>
      )}
    </div>
  );
}
