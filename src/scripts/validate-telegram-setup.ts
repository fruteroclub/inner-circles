#!/usr/bin/env bun

/**
 * Validation script to check if Telegram bot is properly configured
 * 
 * Usage: bun run src/scripts/validate-telegram-setup.ts
 */

async function validateSetup() {
  console.log('🔍 Validating Telegram Bot Setup...\n')

  // Check for bot token
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) {
    console.error('❌ TELEGRAM_BOT_TOKEN is not set')
    console.log('\n📝 To fix this:')
    console.log('   1. Create a .env file in the project root')
    console.log('   2. Add: TELEGRAM_BOT_TOKEN=your_token_here')
    console.log('   3. Get your token from @BotFather on Telegram\n')
    return false
  }

  // Validate token format (basic check)
  const tokenPattern = /^\d+:[A-Za-z0-9_-]+$/
  if (!tokenPattern.test(token)) {
    console.warn('⚠️  Token format looks incorrect')
    console.log('   Expected format: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz')
    console.log('   Your token should be from @BotFather\n')
    return false
  }

  console.log('✅ TELEGRAM_BOT_TOKEN is set')
  console.log(`   Token preview: ${token.substring(0, 10)}...`)

  // Check if bot files exist
  const { existsSync } = await import('fs')
  const { join } = await import('path')

  const requiredFiles = [
    'src/services/telegram/bot.ts',
    'src/services/telegram/commands/request-loan.ts',
    'src/services/telegram/commands/loan-status.ts',
    'src/services/telegram/commands/vouch-status.ts',
    'src/services/telegram/commands/repay-loan.ts',
  ]

  console.log('\n📁 Checking required files...')
  let allFilesExist = true
  for (const file of requiredFiles) {
    const filePath = join(process.cwd(), file)
    if (existsSync(filePath)) {
      console.log(`   ✅ ${file}`)
    } else {
      console.log(`   ❌ ${file} (missing)`)
      allFilesExist = false
    }
  }

  if (!allFilesExist) {
    return false
  }

  console.log('\n✅ All setup checks passed!')
  console.log('\n🚀 You can now run the bot with:')
  console.log('   bun run telegram-bot\n')
  
  return true
}

// Run validation
validateSetup().then((isValid) => {
  process.exit(isValid ? 0 : 1)
})

