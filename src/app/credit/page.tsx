"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoanRequestForm } from "@/components/loans/loan-request-form";
import { LoansList } from "@/components/loans/loans-list";
import PageWrapper from "@/components/layout/page-wrapper";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ViewMode = "active" | "my-loans" | "create";

export default function CreditPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("active");

  function handleSuccess(loanId: bigint) {
    // Navigate to loan details page
    router.push(`/credit/${loanId.toString()}`);
  }

  return (
    <PageWrapper>
      <Section>
        <div className="w-full max-w-4xl space-y-6">
          <div>
            <h1 className="text-4xl font-bold font-funnel">Credit System</h1>
            <p className="mt-2 text-muted-foreground">
              Manage your active loans, view your loan history, and create new
              loan requests in the Inner Circles Credit System.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 border-b">
            <button
              onClick={() => setViewMode("active")}
              className={cn(
                "px-4 py-2 font-medium transition-colors border-b-2 -mb-px",
                viewMode === "active"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Active Loans
            </button>
            <button
              onClick={() => setViewMode("my-loans")}
              className={cn(
                "px-4 py-2 font-medium transition-colors border-b-2 -mb-px",
                viewMode === "my-loans"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              My Loans
            </button>
            <button
              onClick={() => setViewMode("create")}
              className={cn(
                "px-4 py-2 font-medium transition-colors border-b-2 -mb-px",
                viewMode === "create"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Create Loan Request
            </button>
          </div>

          {/* Content based on view mode */}
          {viewMode === "active" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold font-funnel">
                  Active Loans
                </h2>
                <p className="mt-2 text-muted-foreground">
                  View all active loan requests in the system that are currently
                  in progress (Requested, Vouching, Crowdfunding, or Funded
                  status).
                </p>
              </div>
              <LoansList showAll={true} showRepaid={false} />
            </div>
          )}

          {viewMode === "my-loans" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold font-funnel">
                  My Loans
                </h2>
                <p className="mt-2 text-muted-foreground">
                  View all your loan requests including requested, funded, and
                  completed loans.
                </p>
              </div>
              <LoansList showAll={false} showRepaid={true} />
            </div>
          )}

          {viewMode === "create" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold font-funnel">
                  Create Loan Request
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Create a new loan request to get started. Your request will
                  enter the vouching phase where community members can vouch for
                  you.
                </p>
              </div>
              <LoanRequestForm onSuccess={handleSuccess} />
            </div>
          )}
        </div>
      </Section>
    </PageWrapper>
  );
}

