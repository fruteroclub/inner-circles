import type { Context } from 'telegraf'
import type { CommandContext, LoanStatus } from '../types'

export async function handleLoanStatus(ctx: Context) {
  const commandContext: CommandContext = {
    userId: ctx.from?.id || 0,
    username: ctx.from?.username,
    chatId: ctx.chat?.id || 0,
  }

  // TODO: Call backend service to get loan status
  // const loanService = await import('@/services/loans/loan-service')
  // const status = await loanService.getLoanStatus(commandContext.userId)

  // Placeholder response
  const placeholderStatus: LoanStatus = {
    loanId: 'LOAN-001',
    status: 'pending',
    amount: 0,
    createdAt: new Date().toISOString(),
  }

  const response = `📊 *Loan Status*\n\n` +
    `Loan ID: ${placeholderStatus.loanId}\n` +
    `Status: ${placeholderStatus.status.toUpperCase()}\n` +
    `Amount: ${placeholderStatus.amount}\n` +
    `Created: ${new Date(placeholderStatus.createdAt).toLocaleDateString()}\n\n` +
    `This is a placeholder response. The backend service will be integrated here.`

  await ctx.reply(response, { parse_mode: 'Markdown' })
}

