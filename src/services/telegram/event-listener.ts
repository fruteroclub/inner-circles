/**
 * Event Listener Service
 * 
 * Listens to contract events and triggers Telegram notifications.
 * This service can be used in API routes or background workers.
 */

import { createPublicClient, http, decodeEventLog, type Address, type PublicClient } from "viem";
import { gnosis } from "viem/chains";
import { lendingMarketContract } from "@/lib/contracts/config";
import {
  notifyLoanRequest,
  notifyVouchingAccepted,
  notifyFundingObtained,
  notifyLoanAccepted,
  notifyLoanRepaid,
  notifyLoanDefault,
  notifyTrustCancellationRecommendation,
} from "./notifications";
import { formatEther } from "viem";
import { getTelegramUserIdByAddress, getMemberByAddress } from "./member-lookup";
import type { ContractLoanData } from "@/types/loans";

/**
 * Create a public client for reading contract data
 */
function createClient(): PublicClient {
  const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
  const rpcUrl = alchemyApiKey
    ? `https://gnosis-mainnet.g.alchemy.com/v2/${alchemyApiKey}`
    : "https://rpc.gnosischain.com";

  return createPublicClient({
    chain: gnosis,
    transport: http(rpcUrl),
  });
}

/**
 * Process LoanRequestCreated event
 */
async function handleLoanRequestCreated(
  args: {
    loanId: bigint;
    borrower: Address;
    amount: bigint;
    termDuration: bigint;
  },
  chatId?: number
): Promise<void> {
  try {
    // Look up borrower's Telegram user ID from members.json
    const borrowerTelegramId = getTelegramUserIdByAddress(args.borrower);
    const member = getMemberByAddress(args.borrower);
    
    // Use provided chatId, or borrower's Telegram user ID, or fallback to env var
    const targetChatId = chatId || borrowerTelegramId || undefined;

    await notifyLoanRequest({
      loanId: args.loanId.toString(),
      requesterAddress: args.borrower,
      requesterName: member?.telegramHandle || member?.circlesUsername,
      amount: formatEther(args.amount),
      term: `${Number(args.termDuration) / (24 * 60 * 60)} days`,
      chatId: targetChatId || undefined,
    });
  } catch (error) {
    console.error("Error handling LoanRequestCreated event:", error);
  }
}

/**
 * Process Vouched event
 */
async function handleVouched(
  args: {
    loanId: bigint;
    voucher: Address;
    amount: bigint;
  },
  chatId?: number
): Promise<void> {
  try {
    // Get borrower address from loan
    const publicClient = createClient();
    const loan = (await publicClient.readContract({
      ...lendingMarketContract,
      functionName: "getLoan",
      args: [args.loanId],
    })) as ContractLoanData;

    const borrower = Array.isArray(loan) ? loan[0] : (loan as { borrower: Address }).borrower;

    await notifyVouchingAccepted({
      loanId: args.loanId.toString(),
      voucherAddress: args.voucher,
      requesterAddress: borrower,
      chatId,
    });
  } catch (error) {
    console.error("Error handling Vouched event:", error);
  }
}

/**
 * Process LoanConfirmed event
 */
async function handleLoanConfirmed(
  args: {
    loanId: bigint;
    borrower: Address;
  },
  chatId?: number
): Promise<void> {
  try {
    const publicClient = createClient();
    const loan = (await publicClient.readContract({
      ...lendingMarketContract,
      functionName: "getLoan",
      args: [args.loanId],
    })) as ContractLoanData;

    const loanData = Array.isArray(loan)
      ? {
          amountRequested: loan[1],
          interestRate: loan[4],
          termDuration: loan[3],
        }
      : {
          amountRequested: (loan as { amountRequested: bigint }).amountRequested,
          interestRate: (loan as { interestRate: bigint }).interestRate,
          termDuration: (loan as { termDuration: bigint }).termDuration,
        };

    await notifyLoanAccepted({
      loanId: args.loanId.toString(),
      requesterAddress: args.borrower,
      amount: formatEther(loanData.amountRequested),
      interestRate: `${Number(loanData.interestRate) / 100}%`,
      term: `${Number(loanData.termDuration) / (24 * 60 * 60)} days`,
      chatId,
    });
  } catch (error) {
    console.error("Error handling LoanConfirmed event:", error);
  }
}

/**
 * Process Crowdfunded event
 */
async function handleCrowdfunded(
  args: {
    loanId: bigint;
    lender: Address;
    amount: bigint;
  },
  chatId?: number
): Promise<void> {
  try {
    const publicClient = createClient();
    const loan = (await publicClient.readContract({
      ...lendingMarketContract,
      functionName: "getLoan",
      args: [args.loanId],
    })) as ContractLoanData;

    const loanData = Array.isArray(loan)
      ? {
          borrower: loan[0],
          amountRequested: loan[1],
          amountFunded: loan[2],
        }
      : {
          borrower: (loan as { borrower: Address }).borrower,
          amountRequested: (loan as { amountRequested: bigint }).amountRequested,
          amountFunded: (loan as { amountFunded: bigint }).amountFunded,
        };

    // Check if fully funded
    if (loanData.amountFunded >= loanData.amountRequested) {
      await notifyFundingObtained({
        loanId: args.loanId.toString(),
        requesterAddress: loanData.borrower,
        amount: formatEther(loanData.amountRequested),
        fundedAmount: formatEther(loanData.amountFunded),
        chatId,
      });
    }
  } catch (error) {
    console.error("Error handling Crowdfunded event:", error);
  }
}

/**
 * Process LoanFunded event
 */
async function handleLoanFunded(
  args: {
    loanId: bigint;
    totalAmount: bigint;
  },
  chatId?: number
): Promise<void> {
  try {
    const publicClient = createClient();
    const loan = (await publicClient.readContract({
      ...lendingMarketContract,
      functionName: "getLoan",
      args: [args.loanId],
    })) as ContractLoanData;

    const loanData = Array.isArray(loan)
      ? {
          borrower: loan[0],
          amountRequested: loan[1],
          interestRate: loan[4],
          termDuration: loan[3],
        }
      : {
          borrower: (loan as { borrower: Address }).borrower,
          amountRequested: (loan as { amountRequested: bigint }).amountRequested,
          interestRate: (loan as { interestRate: bigint }).interestRate,
          termDuration: (loan as { termDuration: bigint }).termDuration,
        };

    await notifyLoanAccepted({
      loanId: args.loanId.toString(),
      requesterAddress: loanData.borrower,
      amount: formatEther(loanData.amountRequested),
      interestRate: `${Number(loanData.interestRate) / 100}%`,
      term: `${Number(loanData.termDuration) / (24 * 60 * 60)} days`,
      chatId,
    });
  } catch (error) {
    console.error("Error handling LoanFunded event:", error);
  }
}

/**
 * Process RepaymentMade event
 */
async function handleRepaymentMade(
  args: {
    loanId: bigint;
    borrower: Address;
    principal: bigint;
    interest: bigint;
    totalRepaid: bigint;
  },
  chatId?: number
): Promise<void> {
  try {
    const publicClient = createClient();
    const loan = (await publicClient.readContract({
      ...lendingMarketContract,
      functionName: "getLoan",
      args: [args.loanId],
    })) as ContractLoanData;

    const loanData = Array.isArray(loan)
      ? {
          state: loan[10],
        }
      : {
          state: (loan as { state: number }).state,
        };

    // Only notify on full repayment (state = Repaid = 4)
    if (loanData.state === 4) {
      await notifyLoanRepaid({
        loanId: args.loanId.toString(),
        requesterAddress: args.borrower,
        amount: formatEther(args.totalRepaid),
        chatId,
      });
    }
  } catch (error) {
    console.error("Error handling RepaymentMade event:", error);
  }
}

/**
 * Process LoanDefaulted event
 */
async function handleLoanDefaulted(
  args: {
    loanId: bigint;
    borrower: Address;
  },
  chatId?: number
): Promise<void> {
  try {
    const publicClient = createClient();
    const loan = (await publicClient.readContract({
      ...lendingMarketContract,
      functionName: "getLoan",
      args: [args.loanId],
    })) as ContractLoanData;

    const totalOwed = await publicClient.readContract({
      ...lendingMarketContract,
      functionName: "calculateTotalOwed",
      args: [args.loanId],
    });

    const amountRepaid = await publicClient.readContract({
      ...lendingMarketContract,
      functionName: "amountRepaid",
      args: [args.loanId],
    });

    const loanData = Array.isArray(loan)
      ? {
          amountRequested: loan[1],
        }
      : {
          amountRequested: (loan as { amountRequested: bigint }).amountRequested,
        };

    const unpaidAmount = (totalOwed as bigint) - (amountRepaid as bigint);

    await notifyLoanDefault({
      loanId: args.loanId.toString(),
      requesterAddress: args.borrower,
      amount: formatEther(loanData.amountRequested),
      unpaidAmount: formatEther(unpaidAmount),
      chatId,
    });
  } catch (error) {
    console.error("Error handling LoanDefaulted event:", error);
  }
}

/**
 * Process MembershipSuspended event
 */
async function handleMembershipSuspended(
  args: {
    loanId: bigint;
    borrower: Address;
  },
  chatId?: number
): Promise<void> {
  try {
    await notifyTrustCancellationRecommendation({
      loanId: args.loanId.toString(),
      requesterAddress: args.borrower,
      reason: "Loan default - membership suspended",
      chatId,
    });
  } catch (error) {
    console.error("Error handling MembershipSuspended event:", error);
  }
}

/**
 * Process a contract event log
 */
export async function processEvent(
  eventName: string,
  args: Record<string, unknown>,
  chatId?: number
): Promise<void> {
  switch (eventName) {
    case "LoanRequestCreated":
      await handleLoanRequestCreated(args as { loanId: bigint; borrower: Address; amount: bigint; termDuration: bigint }, chatId);
      break;
    case "Vouched":
      await handleVouched(args as { loanId: bigint; voucher: Address; amount: bigint }, chatId);
      break;
    case "LoanConfirmed":
      await handleLoanConfirmed(args as { loanId: bigint; borrower: Address }, chatId);
      break;
    case "Crowdfunded":
      await handleCrowdfunded(args as { loanId: bigint; lender: Address; amount: bigint }, chatId);
      break;
    case "LoanFunded":
      await handleLoanFunded(args as { loanId: bigint; totalAmount: bigint }, chatId);
      break;
    case "RepaymentMade":
      await handleRepaymentMade(args as { loanId: bigint; borrower: Address; principal: bigint; interest: bigint; totalRepaid: bigint }, chatId);
      break;
    case "LoanDefaulted":
      await handleLoanDefaulted(args as { loanId: bigint; borrower: Address }, chatId);
      break;
    case "MembershipSuspended":
      await handleMembershipSuspended(args as { loanId: bigint; borrower: Address }, chatId);
      break;
    default:
      console.warn(`Unknown event: ${eventName}`);
  }
}

/**
 * Listen to contract events from a specific block
 * This function can be called periodically to check for new events
 */
export async function listenToEvents(
  fromBlock: bigint,
  toBlock: "latest" | bigint = "latest",
  chatId?: number
): Promise<void> {
  const publicClient = createClient();

  try {
    // Get all events from the contract
    const logs = await publicClient.getLogs({
      address: lendingMarketContract.address,
      fromBlock,
      toBlock,
    });

    // Process each log
    for (const log of logs) {
      try {
        // Decode the log using the contract ABI
        const decoded = decodeEventLog({
          abi: lendingMarketContract.abi,
          data: log.data,
          topics: log.topics,
        });

        // For LoanRequestCreated, automatically look up borrower's Telegram ID
        let targetChatId = chatId;
        if (decoded.eventName === "LoanRequestCreated" && decoded.args && typeof decoded.args === 'object' && 'borrower' in decoded.args) {
          const borrowerTelegramId = getTelegramUserIdByAddress(decoded.args.borrower as Address);
          if (borrowerTelegramId) {
            targetChatId = borrowerTelegramId;
            console.log(`Mapped borrower ${decoded.args.borrower} to Telegram ID: ${borrowerTelegramId}`);
          }
        }

        await processEvent(decoded.eventName || '', decoded.args as unknown as Record<string, unknown>, targetChatId);
      } catch (error) {
        // Skip logs that can't be decoded (might be from other contracts)
        console.warn("Could not decode log:", error);
      }
    }
  } catch (error) {
    console.error("Error listening to events:", error);
    throw error;
  }
}

