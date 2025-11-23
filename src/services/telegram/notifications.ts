/**
 * Telegram Notification Service
 *
 * Sends informative notifications to participants about loan events.
 * This service provides functions to send notifications via Telegram bot.
 */

import { Telegraf } from "telegraf";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Initialize bot if token is available
const bot = TELEGRAM_BOT_TOKEN ? new Telegraf(TELEGRAM_BOT_TOKEN) : null;

/**
 * Escape special characters for Telegram MarkdownV2 format
 */
function escapeMarkdown(text: string): string {
  const specialChars = [
    "_",
    "*",
    "[",
    "]",
    "(",
    ")",
    "~",
    "`",
    ">",
    "#",
    "+",
    "-",
    "=",
    "|",
    "{",
    "}",
    ".",
    "!",
  ];
  let escaped = text;
  for (const char of specialChars) {
    escaped = escaped.replace(new RegExp(`\\${char}`, "g"), `\\${char}`);
  }
  return escaped;
}

/**
 * Escape special characters for Telegram HTML format
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export interface LoanRequestNotification {
  loanId: string;
  requesterAddress: string;
  requesterName?: string;
  amount: string;
  term: string;
  chatId?: number;
}

export interface VouchingAcceptedNotification {
  loanId: string;
  voucherAddress: string;
  voucherName?: string;
  requesterAddress: string;
  requesterName?: string;
  chatId?: number;
}

export interface FundingObtainedNotification {
  loanId: string;
  requesterAddress: string;
  requesterName?: string;
  amount: string;
  fundedAmount: string;
  chatId?: number;
}

export interface LoanAcceptedNotification {
  loanId: string;
  requesterAddress: string;
  requesterName?: string;
  amount: string;
  interestRate: string;
  term: string;
  chatId?: number;
}

export interface LoanRepaidNotification {
  loanId: string;
  requesterAddress: string;
  requesterName?: string;
  amount: string;
  chatId?: number;
}

export interface LoanDefaultNotification {
  loanId: string;
  requesterAddress: string;
  requesterName?: string;
  amount: string;
  unpaidAmount: string;
  chatId?: number;
}

export interface TrustCancellationRecommendation {
  loanId: string;
  requesterAddress: string;
  requesterName?: string;
  reason: string;
  chatId?: number;
}

/**
 * Get the chat ID to send notifications to
 */
function getChatId(customChatId?: number): number | null {
  if (customChatId) return customChatId;
  if (TELEGRAM_CHAT_ID) return parseInt(TELEGRAM_CHAT_ID, 10);
  return null;
}

/**
 * Get the base URL for the application
 */
function getBaseUrl(): string {
  // Try environment variable first
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  // Fallback to localhost for development
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }

  // For production, you should set NEXT_PUBLIC_APP_URL
  // This is a fallback that might not work in all cases
  return "https://your-domain.com";
}

/**
 * Send notification about a new loan request
 */
export async function notifyLoanRequest(
  data: LoanRequestNotification
): Promise<void> {
  if (!bot) {
    console.warn("Bot not initialized, cannot send notification");
    return;
  }

  const chatId = getChatId(data.chatId);
  if (!chatId) {
    console.warn("No chat ID available for notification");
    return;
  }

  const baseUrl = getBaseUrl();
  const loanDetailsUrl = `${baseUrl}/credit/${data.loanId}`;

  // Check if URL is HTTPS (Telegram requires HTTPS for inline keyboard buttons and clickable links)
  const isHttps = loanDetailsUrl.startsWith("https://");

  // Escape user-provided content to prevent injection
  const safeLoanId = escapeMarkdown(data.loanId);
  const safeRequesterName = escapeMarkdown(
    data.requesterName || data.requesterAddress
  );
  const safeAmount = escapeMarkdown(data.amount);
  const safeTerm = escapeMarkdown(data.term);

  const messageText =
    `📋 *New Loan Request*\n\n` +
    `Loan ID: \`${safeLoanId}\`\n` +
    `Requester: ${safeRequesterName}\n` +
    `Amount: ${safeAmount} CRC\n` +
    `Term: ${safeTerm}\n\n` +
    `The vouching phase has started\\.`;

  try {
    if (isHttps) {
      // Send message with inline keyboard button (requires HTTPS)
      await bot.telegram.sendMessage(chatId, messageText, {
        parse_mode: "MarkdownV2",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "👆 Vouch for this loan",
                url: loanDetailsUrl,
              },
            ],
          ],
        },
      });
    } else {
      // For HTTP/localhost, use HTML format with properly encoded URL
      const safeLoanIdHtml = escapeHtml(data.loanId);
      const safeRequesterNameHtml = escapeHtml(
        data.requesterName || data.requesterAddress
      );
      const safeAmountHtml = escapeHtml(data.amount);
      const safeTermHtml = escapeHtml(data.term);

      const messageHtml =
        `📋 <b>New Loan Request</b>\n\n` +
        `Loan ID: <code>${safeLoanIdHtml}</code>\n` +
        `Requester: ${safeRequesterNameHtml}\n` +
        `Amount: ${safeAmountHtml} CRC\n` +
        `Term: ${safeTermHtml}\n\n` +
        `The vouching phase has started\\.\n\n` +
        `👆 Vouch for this loan:\n` +
        `<code>${escapeHtml(loanDetailsUrl)}</code>`;

      await bot.telegram.sendMessage(chatId, messageHtml, {
        parse_mode: "HTML",
      });
    }
  } catch (error) {
    console.error("Error sending loan request notification:", error);
    // Fallback: try with HTML format
    try {
      const safeLoanIdHtml = escapeHtml(data.loanId);
      const safeRequesterNameHtml = escapeHtml(
        data.requesterName || data.requesterAddress
      );
      const safeAmountHtml = escapeHtml(data.amount);
      const safeTermHtml = escapeHtml(data.term);

      const messageHtml =
        `📋 <b>New Loan Request</b>\n\n` +
        `Loan ID: <code>${safeLoanIdHtml}</code>\n` +
        `Requester: ${safeRequesterNameHtml}\n` +
        `Amount: ${safeAmountHtml} CRC\n` +
        `Term: ${safeTermHtml}\n\n` +
        `The vouching phase has started\\.\n\n` +
        `👆 Vouch for this loan:\n` +
        `<code>${escapeHtml(loanDetailsUrl)}</code>`;

      await bot.telegram.sendMessage(chatId, messageHtml, {
        parse_mode: "HTML",
      });
    } catch (fallbackError) {
      console.error("Error sending fallback notification:", fallbackError);
      // Last resort: send plain text (no formatting)
      try {
        const plainMessage =
          `📋 New Loan Request\n\n` +
          `Loan ID: ${data.loanId}\n` +
          `Requester: ${data.requesterName || data.requesterAddress}\n` +
          `Amount: ${data.amount} CRC\n` +
          `Term: ${data.term}\n\n` +
          `The vouching phase has started.\n\n` +
          `👆 Vouch for this loan:\n${loanDetailsUrl}`;

        await bot.telegram.sendMessage(chatId, plainMessage);
      } catch (finalError) {
        console.error("Error sending final fallback notification:", finalError);
      }
    }
  }
}

/**
 * Send notification when vouching is accepted
 */
export async function notifyVouchingAccepted(
  data: VouchingAcceptedNotification
): Promise<void> {
  if (!bot) {
    console.warn("Bot not initialized, cannot send notification");
    return;
  }

  const chatId = getChatId(data.chatId);
  if (!chatId) {
    console.warn("No chat ID available for notification");
    return;
  }

  const message =
    `✅ *Vouching Accepted*\n\n` +
    `Loan ID: \`${data.loanId}\`\n` +
    `Voucher: ${data.voucherName || data.voucherAddress}\n` +
    `Has vouched for: ${data.requesterName || data.requesterAddress}\n\n` +
    `Thank you for your support!`;

  try {
    await bot.telegram.sendMessage(chatId, message, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("Error sending vouching accepted notification:", error);
  }
}

/**
 * Send notification when funding is obtained
 */
export async function notifyFundingObtained(
  data: FundingObtainedNotification
): Promise<void> {
  if (!bot) {
    console.warn("Bot not initialized, cannot send notification");
    return;
  }

  const chatId = getChatId(data.chatId);
  if (!chatId) {
    console.warn("No chat ID available for notification");
    return;
  }

  const message =
    `💰 *Funding Obtained*\n\n` +
    `Loan ID: \`${data.loanId}\`\n` +
    `Requester: ${data.requesterName || data.requesterAddress}\n` +
    `Requested: ${data.amount} CRC\n` +
    `Funded: ${data.fundedAmount} CRC\n\n` +
    `The loan is now fully funded and ready for disbursement.`;

  try {
    await bot.telegram.sendMessage(chatId, message, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("Error sending funding obtained notification:", error);
  }
}

/**
 * Send notification when loan is accepted/started
 */
export async function notifyLoanAccepted(
  data: LoanAcceptedNotification
): Promise<void> {
  if (!bot) {
    console.warn("Bot not initialized, cannot send notification");
    return;
  }

  const chatId = getChatId(data.chatId);
  if (!chatId) {
    console.warn("No chat ID available for notification");
    return;
  }

  const message =
    `🚀 *Loan Accepted & Started*\n\n` +
    `Loan ID: \`${data.loanId}\`\n` +
    `Borrower: ${data.requesterName || data.requesterAddress}\n` +
    `Amount: ${data.amount} CRC\n` +
    `Interest Rate: ${data.interestRate}\n` +
    `Term: ${data.term}\n\n` +
    `Funds have been disbursed. Repayment window has started.`;

  try {
    await bot.telegram.sendMessage(chatId, message, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("Error sending loan accepted notification:", error);
  }
}

/**
 * Send notification when loan is repaid
 */
export async function notifyLoanRepaid(
  data: LoanRepaidNotification
): Promise<void> {
  if (!bot) {
    console.warn("Bot not initialized, cannot send notification");
    return;
  }

  const chatId = getChatId(data.chatId);
  if (!chatId) {
    console.warn("No chat ID available for notification");
    return;
  }

  const message =
    `✅ *Loan Repaid*\n\n` +
    `Loan ID: \`${data.loanId}\`\n` +
    `Borrower: ${data.requesterName || data.requesterAddress}\n` +
    `Amount: ${data.amount} CRC\n\n` +
    `The loan has been successfully repaid. Thank you!`;

  try {
    await bot.telegram.sendMessage(chatId, message, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("Error sending loan repaid notification:", error);
  }
}

/**
 * Send notification when loan defaults
 */
export async function notifyLoanDefault(
  data: LoanDefaultNotification
): Promise<void> {
  if (!bot) {
    console.warn("Bot not initialized, cannot send notification");
    return;
  }

  const chatId = getChatId(data.chatId);
  if (!chatId) {
    console.warn("No chat ID available for notification");
    return;
  }

  const message =
    `⚠️ *Loan Default*\n\n` +
    `Loan ID: \`${data.loanId}\`\n` +
    `Borrower: ${data.requesterName || data.requesterAddress}\n` +
    `Original Amount: ${data.amount} CRC\n` +
    `Unpaid Amount: ${data.unpaidAmount} CRC\n\n` +
    `The borrower has failed to repay the loan.`;

  try {
    await bot.telegram.sendMessage(chatId, message, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("Error sending loan default notification:", error);
  }
}

/**
 * Send recommendation to cancel trust
 */
export async function notifyTrustCancellationRecommendation(
  data: TrustCancellationRecommendation
): Promise<void> {
  if (!bot) {
    console.warn("Bot not initialized, cannot send notification");
    return;
  }

  const chatId = getChatId(data.chatId);
  if (!chatId) {
    console.warn("No chat ID available for notification");
    return;
  }

  const message =
    `🔻 *Trust Cancellation Recommendation*\n\n` +
    `Loan ID: \`${data.loanId}\`\n` +
    `User: ${data.requesterName || data.requesterAddress}\n` +
    `Reason: ${data.reason}\n\n` +
    `The system recommends removing trust from this user due to loan default.`;

  try {
    await bot.telegram.sendMessage(chatId, message, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("Error sending trust cancellation recommendation:", error);
  }
}
