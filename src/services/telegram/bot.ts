import { Telegraf } from 'telegraf'

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

if (!TELEGRAM_BOT_TOKEN) {
  console.warn('TELEGRAM_BOT_TOKEN environment variable is not set. Bot will not function properly.')
}

export const bot = TELEGRAM_BOT_TOKEN 
  ? new Telegraf(TELEGRAM_BOT_TOKEN)
  : (null as unknown as Telegraf) // Type assertion for webhook route compatibility

// Error handling
bot.catch((err, ctx) => {
  console.error('Error in bot:', err)
  if (ctx && 'reply' in ctx) {
    ctx.reply('An error occurred. Please try again later.')
  }
})

// Start command - informational only
bot.command('start', (ctx) => {
  const welcomeMessage = `👋 Welcome to Circles Credit Bot!\n\n` +
    `This bot sends notifications about loan activities:\n` +
    `• Loan requests\n` +
    `• Vouching accepted\n` +
    `• Funding obtained\n` +
    `• Loan acceptance/start\n` +
    `• Repaid/default status\n` +
    `• Trust cancellation recommendations\n\n` +
    `You will receive notifications automatically when relevant events occur.`
  
  ctx.reply(welcomeMessage)
})

// Help command
bot.command('help', (ctx) => {
  const helpMessage = `📚 *Circles Credit Bot*\n\n` +
    `This is an informative bot that sends notifications about loan activities.\n\n` +
    `You will receive automatic notifications for:\n` +
    `• Loan requests\n` +
    `• Vouching accepted\n` +
    `• Funding obtained\n` +
    `• Loan acceptance/start\n` +
    `• Repaid/default status\n` +
    `• Trust cancellation recommendations\n\n` +
    `No commands are required - notifications are sent automatically.`
  
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

