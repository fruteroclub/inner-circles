"use client";

import { useParams, useRouter } from "next/navigation";
import { LoanDetails } from "@/components/loans/loan-details";
import PageWrapper from "@/components/layout/page-wrapper";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";

export default function CreditLoanDetailsPage() {
  const params = useParams();
  const router = useRouter();

  // Extract and validate loanId from route params
  const loanIdParam = params?.loanId as string | undefined;

  if (!loanIdParam) {
    return (
      <PageWrapper>
        <Section>
          <div className="w-full max-w-2xl">
            <div className="rounded-lg border border-destructive bg-destructive/10 p-6">
              <p className="text-destructive">Invalid loan ID</p>
              <Button
                onClick={() => router.push("/credit")}
                variant="outline"
                className="mt-4"
              >
                Request a Loan
              </Button>
            </div>
          </div>
        </Section>
      </PageWrapper>
    );
  }

  // Convert string to bigint
  let loanId: bigint;
  try {
    loanId = BigInt(loanIdParam);
  } catch {
    return (
      <PageWrapper>
        <Section>
          <div className="w-full max-w-2xl">
            <div className="rounded-lg border border-destructive bg-destructive/10 p-6">
              <p className="text-destructive">Invalid loan ID format</p>
              <Button
                onClick={() => router.push("/credit")}
                variant="outline"
                className="mt-4"
              >
                Request a Loan
              </Button>
            </div>
          </div>
        </Section>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Section>
        <div className="w-full max-w-2xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold font-funnel">Loan Details</h1>
              <p className="mt-2 text-muted-foreground">
                View the current status and details of your loan request.
              </p>
            </div>
            <Button
              onClick={() => router.push("/credit")}
              variant="outline"
            >
              Request Another Loan
            </Button>
          </div>
          <LoanDetails loanId={loanId} />
        </div>
      </Section>
    </PageWrapper>
  );
}

