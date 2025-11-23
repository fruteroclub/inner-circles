/**
 * Telegram Notification Service
 * 
 * Sends informative notifications to participants about loan events.
 * This bot is read-only and only sends notifications - no interactive commands.
 */

import { bot } from './bot'

export interface LoanRequestNotification {
  loanId: string
  requesterAddress: string
  requesterName?: string
  amount: string
  term: string
  chatId: number
}

export interface VouchingAcceptedNotification {
  loanId: string
  voucherAddress: string
  voucherName?: string
  requesterAddress: string
  requesterName?: string
  chatId: number
}

export interface FundingObtainedNotification {
  loanId: string
  requesterAddress: string
  requesterName?: string
  amount: string
  fundedAmount: string
  chatId: number
}

export interface LoanAcceptedNotification {
  loanId: string
  requesterAddress: string
  requesterName?: string
  amount: string
  interestRate: string
  term: string
  chatId: number
}

export interface LoanRepaidNotification {
  loanId: string
  requesterAddress: string
  requesterName?: string
  amount: string
  chatId: number
}

export interface LoanDefaultNotification {
  loanId: string
  requesterAddress: string
  requesterName?: string
  amount: string
  unpaidAmount: string
  chatId: number
}

export interface TrustCancellationRecommendation {
  loanId: string
  requesterAddress: string
  requesterName?: string
  reason: string
  chatId: number
}

/**
 * Send notification about a new loan request
 */
export async function notifyLoanRequest(data: LoanRequestNotification): Promise<void> {
  if (!bot) {
    console.warn('Bot not initialized, cannot send notification')
    return
  }

  const message = `📋 *New Loan Request*\n\n` +
    `Loan ID: \`${data.loanId}\`\n` +
    `Requester: ${data.requesterName || data.requesterAddress}\n` +
    `Amount: ${data.amount}\n` +
    `Term: ${data.term}\n\n` +
    `The vouching phase has started.`

  try {
    await bot.telegram.sendMessage(data.chatId, message, { parse_mode: 'Markdown' })
  } catch (error) {
    console.error('Error sending loan request notification:', error)
  }
}

/**
 * Send notification when vouching is accepted
 */
export async function notifyVouchingAccepted(data: VouchingAcceptedNotification): Promise<void> {
  if (!bot) {
    console.warn('Bot not initialized, cannot send notification')
    return
  }

  const message = `✅ *Vouching Accepted*\n\n` +
    `Loan ID: \`${data.loanId}\`\n` +
    `Voucher: ${data.voucherName || data.voucherAddress}\n` +
    `Has vouched for: ${data.requesterName || data.requesterAddress}\n\n` +
    `Thank you for your support!`

  try {
    await bot.telegram.sendMessage(data.chatId, message, { parse_mode: 'Markdown' })
  } catch (error) {
    console.error('Error sending vouching accepted notification:', error)
  }
}

/**
 * Send notification when funding is obtained
 */
export async function notifyFundingObtained(data: FundingObtainedNotification): Promise<void> {
  if (!bot) {
    console.warn('Bot not initialized, cannot send notification')
    return
  }

  const message = `💰 *Funding Obtained*\n\n` +
    `Loan ID: \`${data.loanId}\`\n` +
    `Requester: ${data.requesterName || data.requesterAddress}\n` +
    `Requested: ${data.amount}\n` +
    `Funded: ${data.fundedAmount}\n\n` +
    `The loan is now fully funded and ready for disbursement.`

  try {
    await bot.telegram.sendMessage(data.chatId, message, { parse_mode: 'Markdown' })
  } catch (error) {
    console.error('Error sending funding obtained notification:', error)
  }
}

/**
 * Send notification when loan is accepted/started
 */
export async function notifyLoanAccepted(data: LoanAcceptedNotification): Promise<void> {
  if (!bot) {
    console.warn('Bot not initialized, cannot send notification')
    return
  }

  const message = `🚀 *Loan Accepted & Started*\n\n` +
    `Loan ID: \`${data.loanId}\`\n` +
    `Borrower: ${data.requesterName || data.requesterAddress}\n` +
    `Amount: ${data.amount}\n` +
    `Interest Rate: ${data.interestRate}\n` +
    `Term: ${data.term}\n\n` +
    `Funds have been disbursed. Repayment window has started.`

  try {
    await bot.telegram.sendMessage(data.chatId, message, { parse_mode: 'Markdown' })
  } catch (error) {
    console.error('Error sending loan accepted notification:', error)
  }
}

/**
 * Send notification when loan is repaid
 */
export async function notifyLoanRepaid(data: LoanRepaidNotification): Promise<void> {
  if (!bot) {
    console.warn('Bot not initialized, cannot send notification')
    return
  }

  const message = `✅ *Loan Repaid*\n\n` +
    `Loan ID: \`${data.loanId}\`\n` +
    `Borrower: ${data.requesterName || data.requesterAddress}\n` +
    `Amount: ${data.amount}\n\n` +
    `The loan has been successfully repaid. Thank you!`

  try {
    await bot.telegram.sendMessage(data.chatId, message, { parse_mode: 'Markdown' })
  } catch (error) {
    console.error('Error sending loan repaid notification:', error)
  }
}

/**
 * Send notification when loan defaults
 */
export async function notifyLoanDefault(data: LoanDefaultNotification): Promise<void> {
  if (!bot) {
    console.warn('Bot not initialized, cannot send notification')
    return
  }

  const message = `⚠️ *Loan Default*\n\n` +
    `Loan ID: \`${data.loanId}\`\n` +
    `Borrower: ${data.requesterName || data.requesterAddress}\n` +
    `Original Amount: ${data.amount}\n` +
    `Unpaid Amount: ${data.unpaidAmount}\n\n` +
    `The borrower has failed to repay the loan.`

  try {
    await bot.telegram.sendMessage(data.chatId, message, { parse_mode: 'Markdown' })
  } catch (error) {
    console.error('Error sending loan default notification:', error)
  }
}

/**
 * Send recommendation to cancel trust
 */
export async function notifyTrustCancellationRecommendation(
  data: TrustCancellationRecommendation
): Promise<void> {
  if (!bot) {
    console.warn('Bot not initialized, cannot send notification')
    return
  }

  const message = `🔻 *Trust Cancellation Recommendation*\n\n` +
    `Loan ID: \`${data.loanId}\`\n` +
    `User: ${data.requesterName || data.requesterAddress}\n` +
    `Reason: ${data.reason}\n\n` +
    `The system recommends removing trust from this user due to loan default.`

  try {
    await bot.telegram.sendMessage(data.chatId, message, { parse_mode: 'Markdown' })
  } catch (error) {
    console.error('Error sending trust cancellation recommendation:', error)
  }
}

