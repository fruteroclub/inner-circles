import { NextRequest, NextResponse } from "next/server";
import { listenToEvents } from "@/services/telegram/event-listener";

/**
 * API route to listen to contract events and send Telegram notifications
 * This can be called periodically (e.g., via cron job) to check for new events
 * 
 * Query parameters:
 * - fromBlock: Block number to start from (optional, defaults to latest - 1000)
 * - toBlock: Block number to end at (optional, defaults to "latest")
 * - chatId: Telegram chat ID to send notifications to (optional, uses env var if not provided)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fromBlockParam = searchParams.get("fromBlock");
    const toBlockParam = searchParams.get("toBlock");
    const chatIdParam = searchParams.get("chatId");

    // Get current block number
    const { createPublicClient, http } = await import("viem");
    const { gnosis } = await import("viem/chains");
    
    const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
    const rpcUrl = alchemyApiKey
      ? `https://gnosis-mainnet.g.alchemy.com/v2/${alchemyApiKey}`
      : "https://rpc.gnosischain.com";

    const publicClient = createPublicClient({
      chain: gnosis,
      transport: http(rpcUrl),
    });

    const currentBlock = await publicClient.getBlockNumber();

    // Default to last 1000 blocks if not specified
    const fromBlock = fromBlockParam
      ? BigInt(fromBlockParam)
      : currentBlock - BigInt(1000);

    const toBlock = toBlockParam === "latest" || !toBlockParam
      ? "latest"
      : BigInt(toBlockParam);

    const chatId = chatIdParam ? parseInt(chatIdParam, 10) : undefined;

    // Listen to events
    await listenToEvents(fromBlock, toBlock, chatId);

    return NextResponse.json({
      success: true,
      message: "Events processed successfully",
      fromBlock: fromBlock.toString(),
      toBlock: toBlock === "latest" ? "latest" : toBlock.toString(),
    });
  } catch (error) {
    console.error("Error processing events:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint for webhook-based event processing
 * Can be called by external services when events are detected
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventName, args, chatId } = body;

    if (!eventName || !args) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: eventName, args",
        },
        { status: 400 }
      );
    }

    const { processEvent } = await import("@/services/telegram/event-listener");
    await processEvent(eventName, args, chatId);

    return NextResponse.json({
      success: true,
      message: "Event processed successfully",
    });
  } catch (error) {
    console.error("Error processing event:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

