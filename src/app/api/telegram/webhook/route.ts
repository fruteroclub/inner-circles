import { NextRequest, NextResponse } from 'next/server'
import { bot } from '@/services/telegram/bot'

export async function POST(request: NextRequest) {
  try {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      return NextResponse.json(
        { error: 'Bot token not configured' },
        { status: 500 }
      )
    }
    const body = await request.json()
    await bot.handleUpdate(body)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error handling webhook:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Telegram webhook endpoint',
    status: 'active'
  })
}

