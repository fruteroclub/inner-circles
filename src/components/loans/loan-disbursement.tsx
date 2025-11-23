"use client";

import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { LoanState, type Loan } from "@/types/loans";
import { useDisburseLoan } from "@/services/loans/useDisburseLoan";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LoanDisbursementProps {
  loanId: bigint;
  loan: Loan;
  className?: string;
  onActionSuccess?: () => void;
}

export function LoanDisbursement({
  loanId,
  loan,
  className,
  onActionSuccess,
}: LoanDisbursementProps) {
  const { address } = useAccount();
  const isBorrower = address?.toLowerCase() === loan.borrower.toLowerCase();

  const { disburseLoan, isPending, isSuccess } = useDisburseLoan({
    onSuccess: () => {
      onActionSuccess?.();
    },
    onError: (error) => {
      console.error("Failed to disburse loan:", error);
    },
  });

  // Only show for borrower and when in Crowdfunding state and fully funded
  if (!isBorrower || loan.state !== LoanState.Crowdfunding) {
    return null;
  }

  const isFullyFunded = loan.amountFunded >= loan.amountRequested;
  const fundingProgress = (Number(loan.amountFunded) / Number(loan.amountRequested)) * 100;

  if (!isFullyFunded) {
    return (
      <div className={cn("rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:bg-yellow-950", className)}>
        <div className="space-y-2">
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Waiting for full funding
          </p>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-yellow-700 dark:text-yellow-300">
              <span>Funded: {formatEther(loan.amountFunded)} CRC</span>
              <span>Requested: {formatEther(loan.amountRequested)} CRC</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-yellow-200 dark:bg-yellow-900">
              <div
                className="h-full bg-yellow-600 transition-all dark:bg-yellow-500"
                style={{ width: `${Math.min(fundingProgress, 100)}%` }}
              />
            </div>
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              {fundingProgress.toFixed(1)}% funded
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4 rounded-lg border p-6", className)}>
      <div>
        <h3 className="text-lg font-semibold font-funnel">Disburse Loan</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Your loan is fully funded. Disburse the funds to receive them in your wallet.
        </p>
      </div>

      <div className="space-y-3 rounded-md border bg-card p-4">
        <div className="flex justify-between">
          <span className="text-sm text-foreground/70">Amount to Receive:</span>
          <span className="font-semibold">{formatEther(loan.amountRequested)} CRC</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-foreground/70">Interest Rate:</span>
          <span className="font-semibold">
            {(Number(loan.interestRate) / 100).toFixed(2)}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-foreground/70">Total to Repay:</span>
          <span className="font-semibold">
            {formatEther(
              loan.amountRequested +
                (loan.amountRequested * loan.interestRate) / BigInt(10000)
            )}{" "}
            CRC
          </span>
        </div>
      </div>

      <div className="rounded-md border border-green-200 bg-green-50 p-3 dark:bg-green-950">
        <p className="text-sm text-green-800 dark:text-green-200">
          ✓ Loan is fully funded and ready for disbursement
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => disburseLoan(loanId)}
          disabled={isPending || isSuccess}
          className="flex-1 font-funnel font-medium"
        >
          {isPending
            ? "Disbursing..."
            : isSuccess
            ? "Disbursed!"
            : "Disburse Loan"}
        </Button>
      </div>

      {isSuccess && (
        <div className="rounded-md border border-green-200 bg-green-50 p-3 dark:bg-green-950">
          <p className="text-sm text-green-800 dark:text-green-200">
            Loan disbursed successfully! Funds have been transferred to your wallet. 
            The repayment period has started.
          </p>
        </div>
      )}
    </div>
  );
}

