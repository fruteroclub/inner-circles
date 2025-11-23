import { NextRequest, NextResponse } from "next/server";
import {
  getLoansInGracePeriod,
  sendGracePeriodNotification,
  attemptCollectionAfterGracePeriod,
} from "@/services/loans/grace-period-handler";

/**
 * API route to handle grace period logic
 * This can be called periodically (e.g., via cron job) to check loans in grace period
 * 
 * Query parameters:
 * - action: "check" (default) or "notify" or "collect"
 * - loanId: Specific loan ID to check (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get("action") || "check";
    const loanIdParam = searchParams.get("loanId");
    const chatIdParam = searchParams.get("chatId");

    const chatId = chatIdParam ? parseInt(chatIdParam, 10) : undefined;

    if (loanIdParam) {
      // Handle specific loan
      const { checkLoanGracePeriod } = await import(
        "@/services/loans/grace-period-handler"
      );
      const loan = await checkLoanGracePeriod(BigInt(loanIdParam));

      if (!loan) {
        return NextResponse.json({
          success: false,
          message: "Loan not in grace period",
        });
      }

      if (action === "notify") {
        await sendGracePeriodNotification(loan, chatId);
        return NextResponse.json({
          success: true,
          message: "Grace period notification sent",
          loan: {
            loanId: loan.loanId.toString(),
            borrower: loan.borrower,
            gracePeriodRemaining: loan.gracePeriodRemaining.toString(),
            remainingOwed: loan.remainingOwed.toString(),
          },
        });
      }

      return NextResponse.json({
        success: true,
        loan: {
          loanId: loan.loanId.toString(),
          borrower: loan.borrower,
          repaymentDeadline: loan.repaymentDeadline.toString(),
          gracePeriodEnd: loan.gracePeriodEnd.toString(),
          gracePeriodRemaining: loan.gracePeriodRemaining.toString(),
          remainingOwed: loan.remainingOwed.toString(),
          borrowerBalance: loan.borrowerBalance.toString(),
        },
      });
    }

    // Handle all loans
    const loansInGracePeriod = await getLoansInGracePeriod();

    if (action === "notify") {
      // Send notifications for all loans in grace period
      const notifications = await Promise.all(
        loansInGracePeriod.map((loan) =>
          sendGracePeriodNotification(loan, chatId).then(() => ({
            loanId: loan.loanId.toString(),
            success: true,
          }))
        )
      );

      return NextResponse.json({
        success: true,
        message: `Sent ${notifications.length} grace period notification(s)`,
        notifications,
      });
    }

    return NextResponse.json({
      success: true,
      count: loansInGracePeriod.length,
      loans: loansInGracePeriod.map((loan) => ({
        loanId: loan.loanId.toString(),
        borrower: loan.borrower,
        repaymentDeadline: loan.repaymentDeadline.toString(),
        gracePeriodEnd: loan.gracePeriodEnd.toString(),
        gracePeriodRemaining: loan.gracePeriodRemaining.toString(),
        remainingOwed: loan.remainingOwed.toString(),
        borrowerBalance: loan.borrowerBalance.toString(),
      })),
    });
  } catch (error) {
    console.error("Error handling grace period:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint to attempt collection after grace period
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { loanId } = body;

    if (!loanId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required field: loanId",
        },
        { status: 400 }
      );
    }

    const result = await attemptCollectionAfterGracePeriod(BigInt(loanId));

    return NextResponse.json({
      success: result.success,
      message: result.message,
      canRepay: result.canRepay,
      repaymentAmount: result.repaymentAmount?.toString(),
    });
  } catch (error) {
    console.error("Error attempting collection:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

