"use client";

import { useAccount } from "wagmi";
import { useCallback } from "react";
import { useAllLoans } from "@/services/loans/useAllLoans";
import { LoanState, type Loan } from "@/types/loans";
import { formatEther } from "viem";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LoanActions } from "./loan-actions";
import { AdminTimeSimulation } from "./admin-time-simulation";
import {
  calculateInterestRate,
  formatInterestRate,
} from "@/lib/utils/loan-utils";
import { useCalculateInterestRate } from "@/services/loans/useCalculateInterestRate";

interface LoansListProps {
  className?: string;
  showAll?: boolean; // If true, show all loans; if false, show only user's loans
  showRepaid?: boolean; // If true, include repaid loans; if false, show only active loans
}

const stateLabels: Record<LoanState, string> = {
  [LoanState.Requested]: "Requested",
  [LoanState.Vouching]: "Vouching",
  [LoanState.Crowdfunding]: "Crowdfunding",
  [LoanState.Funded]: "Funded",
  [LoanState.Repaid]: "Repaid",
  [LoanState.Defaulted]: "Defaulted",
};

const stateColors: Record<LoanState, string> = {
  [LoanState.Requested]:
    "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  [LoanState.Vouching]:
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  [LoanState.Crowdfunding]:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  [LoanState.Funded]:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  [LoanState.Repaid]:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  [LoanState.Defaulted]:
    "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export function LoansList({
  className,
  showAll = false,
  showRepaid = false,
}: LoansListProps) {
  const { address } = useAccount();
  const router = useRouter();
  const { loans, isLoading, isError, error, refetch } = useAllLoans();

  // Stable callback to prevent infinite loops
  const handleActionSuccess = useCallback(() => {
    // Use setTimeout to debounce refetch and prevent rapid successive calls
    setTimeout(() => {
      refetch();
    }, 1000); // Wait 1 second before refetching to allow transaction to be mined
  }, [refetch]);

  // Filter loans by user address if not showing all
  let filteredLoans = showAll
    ? loans
    : loans.filter(
        (loan) => loan.borrower.toLowerCase() === address?.toLowerCase()
      );

  // Filter out repaid loans if showRepaid is false
  if (!showRepaid) {
    filteredLoans = filteredLoans.filter(
      (loan) => loan.state !== LoanState.Repaid
    );
  }

  // Sort loans by creation date (newest first)
  const sortedLoans = [...filteredLoans].sort((a, b) => {
    const aTime = Number(a.createdAt);
    const bTime = Number(b.createdAt);
    return bTime - aTime;
  });

  if (isLoading) {
    return (
      <div className={className}>
        <div className="rounded-lg border p-6">
          <p className="text-muted-foreground">Loading loans...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={className}>
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6">
          <p className="text-destructive">
            {error?.message || "Failed to load loans"}
          </p>
          <Button onClick={() => refetch()} variant="outline" className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (sortedLoans.length === 0) {
    return (
      <div className={className}>
        <div className="rounded-lg border p-6 text-center">
          <p className="text-muted-foreground">
            {showAll
              ? showRepaid
                ? "No loans found"
                : "No active loans found in the system"
              : showRepaid
              ? "You haven't created any loan requests yet."
              : "You don't have any active loans."}
          </p>
          {!showAll && (
            <Button
              onClick={() => {
                // Switch to create loan request tab
                const event = new CustomEvent("switchToCreate");
                window.dispatchEvent(event);
                router.push("/credit");
              }}
              variant="outline"
              className="mt-4"
            >
              Create Your First Loan Request
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Create a map of loans with their IDs for easier lookup
  // We'll match loans by finding their position in the original loans array
  const getLoanId = (loan: Loan): bigint | null => {
    // Find the loan in the original array and return its index + 1 as the ID
    const index = loans.findIndex(
      (l) =>
        l.borrower.toLowerCase() === loan.borrower.toLowerCase() &&
        l.createdAt === loan.createdAt &&
        l.amountRequested === loan.amountRequested
    );
    return index !== -1 ? BigInt(index + 1) : null;
  };

  return (
    <div className={className}>
      <div className="space-y-4">
        {sortedLoans.map((loan, index) => {
          const loanId = getLoanId(loan);

          return (
            <div
              key={index}
              className="rounded-lg border p-6 hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => {
                if (loanId) {
                  router.push(`/credit/${loanId.toString()}`);
                }
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold font-funnel">
                        {loanId
                          ? `Loan #${loanId.toString()}`
                          : `Loan #${index + 1}`}
                      </h3>
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-medium",
                          stateColors[loan.state]
                        )}
                      >
                        {stateLabels[loan.state]}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {loan.state === LoanState.Requested && "Awaiting vouches"}
                      {loan.state === LoanState.Vouching &&
                        "Vouching period active"}
                      {loan.state === LoanState.Crowdfunding &&
                        "Open for funding"}
                      {loan.state === LoanState.Funded && "Loan active"}
                      {loan.state === LoanState.Repaid && "Loan completed"}
                      {loan.state === LoanState.Defaulted && "Loan defaulted"}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Amount Requested
                      </p>
                      <p className="text-lg font-semibold">
                        {formatEther(loan.amountRequested)} CRC
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Amount Funded
                      </p>
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
                      <p className="text-sm text-muted-foreground">
                        Interest Rate
                      </p>
                      <p className="text-lg font-semibold">
                        {loan.state === LoanState.Vouching ||
                        loan.state === LoanState.Requested
                          ? loan.voucherCount >= BigInt(3)
                            ? formatInterestRate(
                                BigInt(calculateInterestRate(loan.voucherCount))
                              )
                            : "—"
                          : formatInterestRate(loan.interestRate)}
                      </p>
                      {(loan.state === LoanState.Vouching ||
                        loan.state === LoanState.Requested) &&
                        loan.voucherCount < BigInt(3) && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Need {Number(BigInt(3) - loan.voucherCount)} more
                            voucher
                            {Number(BigInt(3) - loan.voucherCount) > 1
                              ? "s"
                              : ""}
                          </p>
                        )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <LoanActions
                    loan={loan}
                    loanId={loanId}
                    onActionSuccess={handleActionSuccess}
                  />
                  {loanId && (
                    <AdminTimeSimulation
                      loanId={loanId}
                      loan={loan}
                      onActionSuccess={handleActionSuccess}
                    />
                  )}
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (loanId) {
                        router.push(`/credit/${loanId.toString()}`);
                      }
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
