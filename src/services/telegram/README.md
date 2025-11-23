# Telegram Bot Service

This service implements an informative Telegram bot using Telegraf.js for the Circles Credit application.

## Overview

This is a **read-only, informative bot** that sends notifications to participants about loan-related events. The bot does not support interactive commands - it only sends automatic notifications.

## Notifications

The bot sends notifications for the following events:

- **Loan Requests** - When a new loan request is created
- **Vouching Accepted** - When someone vouches for a loan requester
- **Funding Obtained** - When a loan reaches full funding
- **Loan Accepted/Started** - When a loan is accepted and funds are disbursed
- **Loan Repaid** - When a loan is successfully repaid
- **Loan Default** - When a loan defaults
- **Trust Cancellation Recommendation** - When the system recommends removing trust from a user

## Setup

1. Create a Telegram bot by talking to [@BotFather](https://t.me/botfather) on Telegram
2. Get your bot token
3. Add the token to your `.env` file:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
```

## Running the Bot

### Option 1: Webhook Mode (Production)

The bot can be run via webhook using the API route at `/api/telegram/webhook`.

To set up the webhook:
1. Deploy your application
2. Set the webhook URL using Telegram's API:
   ```bash
   curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-domain.com/api/telegram/webhook"
   ```

### Option 2: Polling Mode (Development)

For local development, you can run the bot in polling mode using the standalone script:

```bash
bun run src/scripts/telegram-bot.ts
```

## Architecture

```
src/services/telegram/
├── bot.ts              # Bot initialization (informative only)
├── notifications.ts    # Notification functions for loan events
├── types.ts            # TypeScript types and interfaces
└── index.ts            # Public exports
```

## Usage

The bot is used programmatically by calling notification functions from your backend services:

```typescript
import { notifyLoanRequest, notifyLoanRepaid } from '@/services/telegram'

// Send a loan request notification
await notifyLoanRequest({
  loanId: 'LOAN-001',
  requesterAddress: '0x...',
  requesterName: 'Alice',
  amount: '100 CRC',
  term: '30 days',
  chatId: 123456789
})

// Send a loan repaid notification
await notifyLoanRepaid({
  loanId: 'LOAN-001',
  requesterAddress: '0x...',
  requesterName: 'Alice',
  amount: '100 CRC',
  chatId: 123456789
})
```

## Available Notification Functions

- `notifyLoanRequest()` - Notify about new loan requests
- `notifyVouchingAccepted()` - Notify when vouching is accepted
- `notifyFundingObtained()` - Notify when funding is complete
- `notifyLoanAccepted()` - Notify when loan starts
- `notifyLoanRepaid()` - Notify when loan is repaid
- `notifyLoanDefault()` - Notify when loan defaults
- `notifyTrustCancellationRecommendation()` - Recommend trust cancellation

## Error Handling

The bot includes error handling that:
- Catches and logs errors silently
- Prevents the bot from crashing on unexpected errors
- Continues operating even if individual notifications fail

