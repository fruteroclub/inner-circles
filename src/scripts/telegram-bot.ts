#!/usr/bin/env bun

/**
 * Standalone script to run the Telegram bot in polling mode
 * Useful for local development
 * 
 * Usage: bun run src/scripts/telegram-bot.ts
 */

import { startBot } from '../services/telegram/bot'

// Load environment variables
if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.error('Error: TELEGRAM_BOT_TOKEN environment variable is required')
  console.error('Please add it to your .env file')
  process.exit(1)
}

console.log('Starting Telegram bot in polling mode...')
startBot()

