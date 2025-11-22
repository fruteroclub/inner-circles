import { Telegraf } from 'telegraf'
import { handleRequestLoan } from './commands/request-loan'
import { handleLoanStatus } from './commands/loan-status'
import { handleVouchStatus } from './commands/vouch-status'
import { handleRepayLoan } from './commands/repay-loan'

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

if (!TELEGRAM_BOT_TOKEN) {
  console.warn('TELEGRAM_BOT_TOKEN environment variable is not set. Bot will not function properly.')
}

export const bot = TELEGRAM_BOT_TOKEN 
  ? new Telegraf(TELEGRAM_BOT_TOKEN)
  : (null as unknown as Telegraf) // Type assertion for webhook route compatibility

// Register commands (using underscores as Telegram doesn't support hyphens)
bot.command('request_loan', handleRequestLoan)
bot.command('loan_status', handleLoanStatus)
bot.command('vouch_status', handleVouchStatus)
bot.command('repay_loan', handleRepayLoan)

// Error handling
bot.catch((err, ctx) => {
  console.error('Error in bot:', err)
  ctx.reply('An error occurred. Please try again later.')
})

// Start command
bot.command('start', (ctx) => {
  const welcomeMessage = `👋 Welcome to Circles Credit Bot!\n\n` +
    `Available commands:\n` +
    `/request_loan - Request a new loan\n` +
    `/loan_status - Check your loan status\n` +
    `/vouch_status - Check your vouch status\n` +
    `/repay_loan - Repay an existing loan\n\n` +
    `Use /help for more information.`
  
  ctx.reply(welcomeMessage)
})

// Help command
bot.command('help', (ctx) => {
  const helpMessage = `📚 *Circles Credit Bot Commands*\n\n` +
    `*/request_loan* - Request a new loan from the community\n` +
    `*/loan_status* - Check the status of your active loans\n` +
    `*/vouch_status* - View your vouch count and reputation score\n` +
    `*/repay_loan* - Repay an existing loan\n\n` +
    `All commands are currently using placeholder responses. Backend services will be integrated soon.`
  
  ctx.reply(helpMessage, { parse_mode: 'Markdown' })
})

export function startBot() {
  if (!TELEGRAM_BOT_TOKEN) {
    throw new Error('TELEGRAM_BOT_TOKEN environment variable is required to start the bot')
  }
  bot.launch()
  console.log('Telegram bot started successfully')
  
  // Graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'))
  process.once('SIGTERM', () => bot.stop('SIGTERM'))
}

export function stopBot() {
  bot.stop()
  console.log('Telegram bot stopped')
}

