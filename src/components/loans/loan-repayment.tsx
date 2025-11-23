"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { formatEther, parseEther } from "viem";
import { LoanState, type Loan } from "@/types/loans";
import { useRepayLoan } from "@/services/loans/useRepayLoan";
import { useCalculateTotalOwed } from "@/services/loans/useCalculateTotalOwed";
import { useAmountRepaid } from "@/services/loans/useAmountRepaid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface LoanRepaymentProps {
  loanId: bigint;
  loan: Loan;
  className?: string;
  onActionSuccess?: () => void;
}

export function LoanRepayment({
  loanId,
  loan,
  className,
  onActionSuccess,
}: LoanRepaymentProps) {
  const { address } = useAccount();
  const isBorrower = address?.toLowerCase() === loan.borrower.toLowerCase();
  const [repaymentAmount, setRepaymentAmount] = useState("");
  const [errors, setErrors] = useState<{ amount?: string }>({});

  const { totalOwed, isLoading: isLoadingOwed } = useCalculateTotalOwed(loanId);
  const { amountRepaid, isLoading: isLoadingRepaid } = useAmountRepaid(loanId);

  const { repayLoan, isPending, isSuccess } = useRepayLoan({
    onSuccess: () => {
      setRepaymentAmount("");
      setErrors({});
      onActionSuccess?.();
    },
    onError: (error) => {
      console.error("Failed to repay loan:", error);
    },
  });

  // Only show for borrower and when in Funded state
  if (!isBorrower || loan.state !== LoanState.Funded) {
    return null;
  }

  if (isLoadingOwed || isLoadingRepaid || !totalOwed || amountRepaid === undefined) {
    return (
      <div className={cn("rounded-lg border p-6", className)}>
        <p className="text-muted-foreground">Loading repayment information...</p>
      </div>
    );
  }

  const remainingOwed = totalOwed - amountRepaid;
  const isFullyRepaid = remainingOwed <= BigInt(0);

  function validateAmount(value: string): string | undefined {
    if (!value || value.trim() === "") {
      return "Amount is required";
    }

    try {
      const parsed = parseEther(value);
      if (parsed <= BigInt(0)) {
        return "Amount must be greater than 0";
      }
      if (parsed > remainingOwed) {
        return `Amount cannot exceed remaining balance of ${formatEther(remainingOwed)} CRC`;
      }
    } catch {
      return "Invalid amount format";
    }
  }

  function handleAmountChange(value: string) {
    setRepaymentAmount(value);
    const error = validateAmount(value);
    setErrors((prev) => ({ ...prev, amount: error }));
  }

  function handleRepayFull() {
    const fullAmount = formatEther(remainingOwed);
    setRepaymentAmount(fullAmount);
    setErrors({});
    repayLoan(loanId, fullAmount);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const amountError = validateAmount(repaymentAmount);
    if (amountError) {
      setErrors({ amount: amountError });
      return;
    }

    repayLoan(loanId, repaymentAmount);
  }

  if (isFullyRepaid) {
    return (
      <div className={cn("rounded-lg border border-green-200 bg-green-50 p-6 dark:bg-green-950", className)}>
        <p className="text-green-800 dark:text-green-200">
          ✓ Loan fully repaid! Thank you for your payment.
        </p>
      </div>
    );
  }

  const repaymentProgress = (Number(amountRepaid) / Number(totalOwed)) * 100;

  return (
    <div className={cn("space-y-4 rounded-lg border p-6", className)}>
      <div>
        <h3 className="text-lg font-semibold font-funnel">Repay Loan</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Make a repayment to reduce your loan balance. Partial repayments are supported.
        </p>
      </div>

      <div className="space-y-3 rounded-md border bg-card p-4">
        <div className="flex justify-between">
          <span className="text-sm text-foreground/70">Total Owed:</span>
          <span className="font-semibold">{formatEther(totalOwed)} CRC</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-foreground/70">Amount Repaid:</span>
          <span className="font-semibold">{formatEther(amountRepaid)} CRC</span>
        </div>
        <div className="border-t pt-3">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Remaining Balance:</span>
            <span className="font-bold text-destructive">
              {formatEther(remainingOwed)} CRC
            </span>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-foreground/60">
            <span>Repayment Progress</span>
            <span>{repaymentProgress.toFixed(1)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${repaymentProgress}%` }}
            />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="repayment-amount"
            className="block text-sm font-medium text-foreground"
          >
            Repayment Amount (CRC)
          </label>
          <Input
            id="repayment-amount"
            type="text"
            inputMode="decimal"
            value={repaymentAmount}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="0.00"
            disabled={isPending || isSuccess}
            aria-invalid={!!errors.amount}
            aria-describedby={errors.amount ? "amount-error" : undefined}
            className={cn(
              "mt-1",
              errors.amount && "border-destructive focus-visible:ring-destructive"
            )}
          />
          {errors.amount && (
            <p
              id="amount-error"
              className="mt-1 text-sm text-destructive"
              role="alert"
            >
              {errors.amount}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleRepayFull}
            disabled={isPending || isSuccess}
            className="flex-1"
          >
            Repay Full Amount
          </Button>
          <Button
            type="submit"
            disabled={isPending || isSuccess || !!errors.amount || !repaymentAmount}
            className="flex-1 font-funnel font-medium"
          >
            {isPending
              ? "Processing..."
              : isSuccess
              ? "Repaid!"
              : "Repay Loan"}
          </Button>
        </div>
      </form>

      {isSuccess && (
        <div className="rounded-md border border-green-200 bg-green-50 p-3 dark:bg-green-950">
          <p className="text-sm text-green-800 dark:text-green-200">
            Repayment successful! Funds have been distributed to lenders.
          </p>
        </div>
      )}
    </div>
  );
}

