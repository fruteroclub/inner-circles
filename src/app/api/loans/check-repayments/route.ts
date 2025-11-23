import { NextRequest, NextResponse } from "next/server";
import {
  getLoansNeedingAutoRepayment,
  formatAutoRepaymentCheck,
  prepareRepaymentTransaction,
} from "@/services/loans/auto-repayment-service";

/**
 * API route to check for loans that need auto-repayment
 * This can be called periodically (e.g., via cron job) to check and execute repayments
 * 
 * Note: This endpoint only checks and reports. Actual repayment execution would require
 * a wallet client with the borrower's private key, which should be handled securely
 * in a separate service or by the borrower themselves.
 */
export async function GET(request: NextRequest) {
  try {
    const loansNeedingRepayment = await getLoansNeedingAutoRepayment();

    const results = loansNeedingRepayment.map((check) => ({
      loanId: check.loanId.toString(),
      borrower: check.borrower,
      totalOwed: check.totalOwed.toString(),
      amountRepaid: check.amountRepaid.toString(),
      remainingOwed: check.remainingOwed.toString(),
      borrowerBalance: check.borrowerBalance.toString(),
      canRepayFull: check.canRepayFull,
      canRepayPartial: check.canRepayPartial,
      repaymentAmount: check.repaymentAmount.toString(),
      transactionData: prepareRepaymentTransaction(check),
      formatted: formatAutoRepaymentCheck(check),
    }));

    return NextResponse.json({
      success: true,
      count: results.length,
      loans: results,
      message: `Found ${results.length} loan(s) needing auto-repayment`,
    });
  } catch (error) {
    console.error("Error checking for auto-repayments:", error);
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
 * POST endpoint to execute auto-repayment for a specific loan
 * Note: This requires a wallet client with borrower's private key
 * For security, this should be handled by the borrower or a secure service
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

    // This would require wallet client implementation
    // For now, return the transaction data that needs to be executed
    const { checkLoanForAutoRepayment, prepareRepaymentTransaction } =
      await import("@/services/loans/auto-repayment-service");

    const check = await checkLoanForAutoRepayment(BigInt(loanId));

    if (!check) {
      return NextResponse.json(
        {
          success: false,
          error: "Loan not eligible for auto-repayment",
        },
        { status: 400 }
      );
    }

    if (!check.canRepayFull && !check.canRepayPartial) {
      return NextResponse.json(
        {
          success: false,
          error: "Insufficient balance for repayment",
        },
        { status: 400 }
      );
    }

    const transactionData = prepareRepaymentTransaction(check);

    return NextResponse.json({
      success: true,
      message: "Repayment transaction prepared",
      transactionData,
      note: "This transaction needs to be executed by the borrower or a secure service with wallet access",
    });
  } catch (error) {
    console.error("Error preparing auto-repayment:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

