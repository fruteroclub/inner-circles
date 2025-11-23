"use client";

import { useLoanDetails } from "@/services/loans/useLoanDetails";
import { LoanState } from "@/types/loans";
import { formatEther } from "viem";
import { cn } from "@/lib/utils";
import { LoanActions } from "./loan-actions";

interface LoanDetailsProps {
  loanId: bigint;
  className?: string;
}

const stateLabels: Record<LoanState, string> = {
  [LoanState.Requested]: "Requested",
  [LoanState.Vouching]: "Vouching",
  [LoanState.Crowdfunding]: "Crowdfunding",
  [LoanState.Funded]: "Funded",
  [LoanState.Repaid]: "Repaid",
  [LoanState.Defaulted]: "Defaulted",
};

function formatTimestamp(timestamp: bigint): string {
  const date = new Date(Number(timestamp) * 1000);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (Math.abs(diffDays) > 7) {
    return date.toLocaleDateString();
  }

  if (Math.abs(diffDays) > 0) {
    const days = Math.abs(diffDays);
    return diffDays > 0 ? `in ${days} day${days > 1 ? "s" : ""}` : `${days} day${days > 1 ? "s" : ""} ago`;
  }

  if (Math.abs(diffHours) > 0) {
    const hours = Math.abs(diffHours);
    return diffHours > 0 ? `in ${hours} hour${hours > 1 ? "s" : ""}` : `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }

  if (Math.abs(diffMinutes) > 0) {
    const minutes = Math.abs(diffMinutes);
    return diffMinutes > 0 ? `in ${minutes} minute${minutes > 1 ? "s" : ""}` : `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  }

  return diffSeconds > 0 ? "in a few seconds" : "a few seconds ago";
}

export function LoanDetails({ loanId, className }: LoanDetailsProps) {
  const { loan, isLoading, isError, error, refetch } = useLoanDetails(loanId);

  if (isLoading) {
    return (
      <div className={className}>
        <div className="rounded-lg border p-6">
          <p className="text-muted-foreground">Loading loan details...</p>
        </div>
      </div>
    );
  }

  if (isError || !loan) {
    return (
      <div className={className}>
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6">
          <p className="text-destructive">
            {error?.message || "Failed to load loan details"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-4 rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold font-funnel">
            Loan #{loanId.toString()}
          </h3>
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium",
              loan.state === LoanState.Vouching
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                : loan.state === LoanState.Crowdfunding
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                : loan.state === LoanState.Funded
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
            )}
          >
            {stateLabels[loan.state]}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Amount Requested</p>
            <p className="text-lg font-semibold">
              {formatEther(loan.amountRequested)} CRC
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Amount Funded</p>
            <p className="text-lg font-semibold">
              {formatEther(loan.amountFunded)} CRC
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Vouchers</p>
            <p className="text-lg font-semibold">
              {loan.voucherCount.toString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Interest Rate</p>
            <p className="text-lg font-semibold">
              {(Number(loan.interestRate) / 100).toFixed(2)}%
            </p>
          </div>
        </div>

        {loan.state === LoanState.Vouching && (
          <div className="rounded-md border border-blue-200 bg-blue-50 p-4 dark:bg-blue-950">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Vouching deadline: {formatTimestamp(loan.vouchingDeadline)}
            </p>
          </div>
        )}

        {loan.state === LoanState.Crowdfunding && (
          <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4 dark:bg-yellow-950">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Crowdfunding deadline: {formatTimestamp(loan.crowdfundingDeadline)}
            </p>
          </div>
        )}

        <div className="mt-6 pt-6 border-t">
          <LoanActions 
            loan={loan} 
            loanId={loanId}
            onActionSuccess={() => {
              // Use setTimeout to debounce refetch and prevent rapid successive calls
              setTimeout(() => {
                refetch();
              }, 1000);
            }}
          />
        </div>
      </div>
    </div>
  );
}

