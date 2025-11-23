import { NextRequest, NextResponse } from "next/server";
import { notifyLoanRequest } from "@/services/telegram/notifications";

/**
 * Simple test endpoint to verify Telegram notification service works
 * 
 * This endpoint tests the notification service without any contract calls.
 * 
 * Query parameters (all optional):
 * - telegramUserId: Telegram user ID to send to (defaults to 5629440505 for @troopdegen)
 * - loanId: Loan ID for the notification (defaults to "1")
 * - amount: Loan amount (defaults to "10.0")
 * - term: Loan term (defaults to "30 days")
 * - requesterName: Requester name (defaults to "@troopdegen")
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Get parameters with defaults
    const telegramUserId = searchParams.get("telegramUserId") 
      ? parseInt(searchParams.get("telegramUserId")!, 10)
      : 5629440505; // Default to @troopdegen
    
    const loanId = searchParams.get("loanId") || "1";
    const amount = searchParams.get("amount") || "10.0";
    const term = searchParams.get("term") || "30 days";
    const requesterName = searchParams.get("requesterName") || "@troopdegen";
    const requesterAddress = searchParams.get("requesterAddress") || "0xdb79330aD7b5F38293f54862E812EF42632c0b3B";

    // Send test notification directly (no contract calls)
    await notifyLoanRequest({
      loanId,
      requesterAddress,
      requesterName,
      amount: `${amount} CRC`,
      term,
      chatId: telegramUserId,
    });

    return NextResponse.json({
      success: true,
      message: `Test notification sent to Telegram user ID: ${telegramUserId}`,
      telegramUserId,
      loanId,
      amount,
      term,
      requesterName,
    });
  } catch (error) {
    console.error("Error sending test notification:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint to send a loan request notification
 * Simple test without contract calls
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get parameters with defaults
    const telegramUserId = body.telegramUserId 
      ? parseInt(String(body.telegramUserId), 10)
      : 5629440505; // Default to @troopdegen
    
    const loanId = String(body.loanId || "1");
    const amount = body.amount || "10.0";
    const term = body.term || "30 days";
    const requesterName = body.requesterName || "@troopdegen";
    const requesterAddress = body.requesterAddress || "0xdb79330aD7b5F38293f54862E812EF42632c0b3B";

    // Send test notification directly (no contract calls)
    await notifyLoanRequest({
      loanId,
      requesterAddress,
      requesterName,
      amount: `${amount} CRC`,
      term,
      chatId: telegramUserId,
    });

    return NextResponse.json({
      success: true,
      message: "Notification sent successfully",
      telegramUserId,
      loanId,
      amount,
      term,
      requesterName,
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

