import { NextRequest, NextResponse } from "next/server";
import { notifyLoanRequest } from "@/services/telegram/notifications";
import {
  getTelegramUserIdByAddress,
  getMemberByAddress,
} from "@/services/telegram/member-lookup";
import { formatEther } from "viem";

/**
 * API route to send Telegram notification when a loan request is created
 * Called from the frontend after successful loan creation
 * 
 * This follows the exact same pattern as the test service
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Received notification request:", body);
    
    const { loanId, borrowerAddress, amountRequested, termDuration } = body;

    if (!loanId || !borrowerAddress || !amountRequested || !termDuration) {
      console.error("Missing required fields:", { loanId, borrowerAddress, amountRequested, termDuration });
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: loanId, borrowerAddress, amountRequested, termDuration",
        },
        { status: 400 }
      );
    }

    // Look up borrower's Telegram user ID from members.json
    console.log("Looking up borrower:", borrowerAddress);
    const borrowerTelegramId = getTelegramUserIdByAddress(borrowerAddress);
    const member = getMemberByAddress(borrowerAddress);
    console.log("Lookup result:", { borrowerTelegramId, member: member ? { telegramHandle: member.telegramHandle } : null });

    // Fallback to default Telegram user ID for demo purposes if borrower not found
    const DEFAULT_TELEGRAM_USER_ID = 5629440505; // @troopdegen
    const targetTelegramId = borrowerTelegramId || DEFAULT_TELEGRAM_USER_ID;
    const requesterName = member?.telegramHandle || member?.circlesUsername || borrowerAddress.slice(0, 10) + "...";

    if (!borrowerTelegramId) {
      console.warn(`No Telegram user ID found for borrower ${borrowerAddress}, using default: ${DEFAULT_TELEGRAM_USER_ID}`);
    }

    // Format amount and term - match test service format exactly
    const amountFormatted = formatEther(BigInt(amountRequested));
    const termDays = Number(BigInt(termDuration)) / (24 * 60 * 60);
    const termFormatted = `${termDays} day${termDays !== 1 ? "s" : ""}`;

    // Call notifyLoanRequest exactly like the test service does
    console.log("Calling notifyLoanRequest with:", {
      loanId: String(loanId),
      requesterAddress: borrowerAddress,
      requesterName: requesterName,
      amount: `${amountFormatted} CRC`, // Match test service format
      term: termFormatted,
      chatId: targetTelegramId,
    });

    await notifyLoanRequest({
      loanId: String(loanId),
      requesterAddress: borrowerAddress,
      requesterName: requesterName,
      amount: `${amountFormatted} CRC`, // Match test service format exactly
      term: termFormatted,
      chatId: targetTelegramId,
    });

    console.log("✅ Notification sent successfully");

    return NextResponse.json({
      success: true,
      message: "Notification sent successfully",
      telegramUserId: targetTelegramId,
      loanId: String(loanId),
      borrowerFound: !!borrowerTelegramId,
      borrowerAddress,
    });
  } catch (error) {
    console.error("❌ Error sending loan request notification:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message, error.stack);
    }
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
