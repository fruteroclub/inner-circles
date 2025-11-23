import { NextRequest, NextResponse } from "next/server";
import {
  getDefaultedLoans,
  markLoanAsDefaulted,
  sendDefaultNotifications,
} from "@/services/loans/default-detection-service";

/**
 * API route to check for defaulted loans
 * This can be called periodically (e.g., via cron job) to detect and mark defaults
 * 
 * Query parameters:
 * - action: "check" (default) or "mark" or "notify"
 * - loanId: Specific loan ID to check (optional)
 * - chatId: Telegram chat ID for notifications (optional)
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
      const { checkLoanDefault } = await import(
        "@/services/loans/default-detection-service"
      );
      const loan = await checkLoanDefault(BigInt(loanIdParam));

      if (!loan) {
        return NextResponse.json({
          success: false,
          message: "Loan not defaulted or already handled",
        });
      }

      if (action === "notify") {
        await sendDefaultNotifications(loan, chatId);
        return NextResponse.json({
          success: true,
          message: "Default notifications sent",
          loan: {
            loanId: loan.loanId.toString(),
            borrower: loan.borrower,
            remainingOwed: loan.remainingOwed.toString(),
          },
        });
      }

      if (action === "mark") {
        const result = await markLoanAsDefaulted(BigInt(loanIdParam));
        return NextResponse.json(result);
      }

      return NextResponse.json({
        success: true,
        loan: {
          loanId: loan.loanId.toString(),
          borrower: loan.borrower,
          totalOwed: loan.totalOwed.toString(),
          amountRepaid: loan.amountRepaid.toString(),
          remainingOwed: loan.remainingOwed.toString(),
          gracePeriodEnd: loan.gracePeriodEnd.toString(),
        },
      });
    }

    // Handle all loans
    const defaultedLoans = await getDefaultedLoans();

    if (action === "notify") {
      // Send notifications for all defaulted loans
      const notifications = await Promise.all(
        defaultedLoans.map((loan) =>
          sendDefaultNotifications(loan, chatId).then(() => ({
            loanId: loan.loanId.toString(),
            success: true,
          }))
        )
      );

      return NextResponse.json({
        success: true,
        message: `Sent ${notifications.length} default notification(s)`,
        notifications,
      });
    }

    return NextResponse.json({
      success: true,
      count: defaultedLoans.length,
      loans: defaultedLoans.map((loan) => ({
        loanId: loan.loanId.toString(),
        borrower: loan.borrower,
        totalOwed: loan.totalOwed.toString(),
        amountRepaid: loan.amountRepaid.toString(),
        remainingOwed: loan.remainingOwed.toString(),
        gracePeriodEnd: loan.gracePeriodEnd.toString(),
      })),
    });
  } catch (error) {
    console.error("Error checking for defaults:", error);
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
 * POST endpoint to mark a loan as defaulted
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

    const result = await markLoanAsDefaulted(BigInt(loanId));

    if (result.success && result.transactionHash) {
      // Send notifications after successful marking
      const chatIdParam = new URL(request.url).searchParams.get("chatId");
      const chatId = chatIdParam ? parseInt(chatIdParam, 10) : undefined;

      const { checkLoanDefault, sendDefaultNotifications } = await import(
        "@/services/loans/default-detection-service"
      );
      const loan = await checkLoanDefault(BigInt(loanId));
      if (loan) {
        await sendDefaultNotifications(loan, chatId);
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error marking loan as defaulted:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

