"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useCreateLoanRequestWithEvents } from "@/services/loans/useCreateLoanRequestWithEvents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { LOAN_CONSTANTS } from "@/types/loans";
import { parseEther, formatEther } from "viem";
import type { LoanRequestInput } from "@/types/loans";
import { cn } from "@/lib/utils";

interface LoanRequestFormProps {
  onSuccess?: (loanId: bigint) => void;
  className?: string;
}

export function LoanRequestForm({
  onSuccess,
  className,
}: LoanRequestFormProps) {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState("");
  const [errors, setErrors] = useState<{ amount?: string }>({});

  const { createLoanRequest, loanId, isPending, isSuccess, isError, reset } =
    useCreateLoanRequestWithEvents({
      onSuccess: (result) => {
        toast.success(`Loan request #${result.loanId.toString()} created!`);
        onSuccess?.(result.loanId);
        // Reset form
        setAmount("");
        setErrors({});
      },
      onError: (error) => {
        toast.error(`Failed to create loan request: ${error.message}`);
      },
    });

  function validateAmount(value: string): string | undefined {
    if (!value || value.trim() === "") {
      return "Amount is required";
    }

    try {
      const parsed = parseEther(value);
      if (parsed < LOAN_CONSTANTS.MIN_AMOUNT) {
        return `Minimum amount is ${formatEther(
          LOAN_CONSTANTS.MIN_AMOUNT
        )} CRC`;
      }
      if (parsed > LOAN_CONSTANTS.MAX_AMOUNT) {
        return `Maximum amount is ${formatEther(
          LOAN_CONSTANTS.MAX_AMOUNT
        )} CRC`;
      }
    } catch {
      return "Invalid amount format";
    }
  }

  function handleAmountChange(value: string) {
    setAmount(value);
    const error = validateAmount(value);
    setErrors((prev) => ({ ...prev, amount: error }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    const amountError = validateAmount(amount);
    if (amountError) {
      setErrors({ amount: amountError });
      return;
    }

    const input: LoanRequestInput = {
      amountRequested: amount,
      termDuration: LOAN_CONSTANTS.DEFAULT_TERM_DURATION_DAYS,
    };

    createLoanRequest(input);
  }

  if (isSuccess && loanId) {
    return (
      <div className={className}>
        <div className="rounded-lg border border-green-500 bg-green-50 p-6 dark:bg-green-950">
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
            Loan Request Created!
          </h3>
          <p className="mt-2 text-green-700 dark:text-green-300">
            Your loan request #{loanId.toString()} has been created
            successfully. The vouching period has started.
          </p>
          <Button onClick={reset} variant="outline" className="mt-4">
            Create Another Loan
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-6">
        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-foreground"
          >
            Loan Amount (CRC)
          </label>
          <Input
            id="amount"
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="0.00"
            disabled={isPending || !isConnected}
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

        <div>
          <label className="block text-sm font-medium text-foreground">
            Term Duration
          </label>
          <p className="mt-1 text-sm text-muted-foreground">
            {LOAN_CONSTANTS.DEFAULT_TERM_DURATION_DAYS} days (fixed for MVP)
          </p>
        </div>

        {!isConnected && (
          <div className="rounded-md border border-yellow-500 bg-yellow-50 p-4 dark:bg-yellow-950">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Please connect your wallet to create a loan request.
            </p>
          </div>
        )}

        <Button
          type="submit"
          disabled={isPending || !isConnected || !!errors.amount}
          className="w-full font-funnel font-medium"
        >
          {isPending ? "Creating Loan Request..." : "Create Loan Request"}
        </Button>
      </div>
    </form>
  );
}

