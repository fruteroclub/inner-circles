# Telegram Bot Service

This service implements a Telegram bot using Telegraf.js for the Circles Credit application.

## Commands

The bot supports the following commands:

- `/request_loan` - Request a new loan from the community
- `/loan_status` - Check the status of your active loans
- `/vouch_status` - View your vouch count and reputation score
- `/repay_loan` - Repay an existing loan

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
├── bot.ts              # Bot initialization and command registration
├── types.ts            # TypeScript types and interfaces
├── commands/           # Command handlers
│   ├── request-loan.ts
│   ├── loan-status.ts
│   ├── vouch-status.ts
│   └── repay-loan.ts
└── index.ts            # Public exports
```

## Backend Integration

Each command handler is structured to easily integrate with backend services:

```typescript
// Example: In request-loan.ts
// TODO: Call backend service to request loan
// const loanService = await import('@/services/loans/loan-service')
// const result = await loanService.requestLoan(commandContext, { amount, currency })
```

When backend services are ready, simply uncomment and implement the service calls in each command handler.

## Error Handling

The bot includes error handling that:
- Catches and logs errors
- Sends user-friendly error messages
- Prevents the bot from crashing on unexpected errors

