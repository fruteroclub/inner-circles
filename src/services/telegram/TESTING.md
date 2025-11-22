# Testing the Telegram Bot

## Quick Start Testing Guide

### Step 1: Get a Bot Token

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Start a chat and send `/newbot`
3. Follow the prompts to create your bot:
   - Choose a name for your bot
   - Choose a username (must end in `bot`, e.g., `my_circles_bot`)
4. BotFather will give you a token like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`
5. Copy this token

### Step 2: Set Up Environment Variable

Create a `.env` file in the root of your project (if it doesn't exist):

```bash
# In the project root
touch .env
```

Add your bot token:

```env
TELEGRAM_BOT_TOKEN=your_actual_token_here
```

**Important:** Never commit your `.env` file to git (it's already in `.gitignore`)

### Step 3: Run the Bot

In a terminal, run:

```bash
bun run telegram-bot
```

You should see:

```
Starting Telegram bot in polling mode...
Telegram bot started successfully
```

### Step 4: Test the Commands

1. Open Telegram and search for your bot (using the username you created)
2. Click "Start" or send `/start` to begin
3. Test each command:

```
/start          - See welcome message
/help           - See help message
/request_loan   - Test loan request
/loan_status    - Test loan status check
/vouch_status   - Test vouch status check
/repay_loan     - Test loan repayment
```

## Testing Checklist

- [ ] Bot responds to `/start`
- [ ] Bot responds to `/help`
- [ ] Bot responds to `/request_loan` with placeholder message
- [ ] Bot responds to `/loan_status` with placeholder message
- [ ] Bot responds to `/vouch_status` with placeholder message
- [ ] Bot responds to `/repay_loan` with placeholder message
- [ ] Bot handles invalid commands gracefully
- [ ] Bot shows error messages appropriately

## Troubleshooting

### "TELEGRAM_BOT_TOKEN environment variable is required"

- Make sure you created a `.env` file in the project root
- Verify the token is correct (no extra spaces)
- Restart the bot after adding the token

### "Bot not responding"

- Check that the bot is running (you should see "Telegram bot started successfully")
- Make sure you're messaging the correct bot (check the username)
- Verify your internet connection
- Check the terminal for error messages

### "Error handling webhook"

- If using webhook mode, make sure your webhook URL is publicly accessible
- Verify the webhook is set correctly with Telegram's API

## Testing Webhook Mode (Production)

For production testing with webhooks:

1. Deploy your application to a public URL
2. Set the webhook:
   ```bash
   curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-domain.com/api/telegram/webhook"
   ```
3. Test by sending messages to your bot
4. Check webhook logs in your deployment platform

## Next Steps

Once basic testing is complete, you can:

1. Integrate backend services (replace placeholder responses)
2. Add input validation for commands
3. Add command arguments (e.g., `/request_loan 100`)
4. Implement error handling for backend service calls
5. Add logging and monitoring
