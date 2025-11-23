/**
 * Grace Period Handler Service
 * 
 * Handles grace period logic for loans past repayment deadline.
 * Sends notifications and attempts collection after grace period ends.
 */

import { createPublicClient, http, type Address, type PublicClient } from "viem";
import { gnosis } from "viem/chains";
import { lendingMarketContract } from "@/lib/contracts/config";
import { notifyLoanDefault } from "@/services/telegram/notifications";
import { formatEther } from "viem";

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
 * Get CRC token address from contract
 */
async function getCrcTokenAddress(): Promise<Address> {
  const publicClient = createClient();
  const tokenAddress = await publicClient.readContract({
    ...lendingMarketContract,
    functionName: "crcToken",
  });
  return tokenAddress as Address;
}

/**
 * Get borrower's CRC balance
 */
async function getBorrowerBalance(borrower: Address): Promise<bigint> {
  const publicClient = createClient();
  const tokenAddress = await getCrcTokenAddress();

  const balance = await publicClient.readContract({
    address: tokenAddress,
    abi: [
      {
        inputs: [{ name: "account", type: "address" }],
        name: "balanceOf",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "balanceOf",
    args: [borrower],
  });

  return balance as bigint;
}

/**
 * Loan in grace period information
 */
export interface GracePeriodLoan {
  loanId: bigint;
  borrower: Address;
  repaymentDeadline: bigint;
  gracePeriodEnd: bigint;
  totalOwed: bigint;
  amountRepaid: bigint;
  remainingOwed: bigint;
  borrowerBalance: bigint;
  isInGracePeriod: boolean;
  gracePeriodRemaining: bigint; // seconds
}

/**
 * Check if a loan is in grace period
 */
export async function checkLoanGracePeriod(
  loanId: bigint
): Promise<GracePeriodLoan | null> {
  const publicClient = createClient();

  try {
    const loan = await publicClient.readContract({
      ...lendingMarketContract,
      functionName: "getLoan",
      args: [loanId],
    });

    const loanData = Array.isArray(loan)
      ? {
          borrower: loan[0],
          state: loan[10],
          repaymentDeadline: loan[8],
          gracePeriodEnd: loan[9],
        }
      : {
          borrower: (loan as any).borrower,
          state: (loan as any).state,
          repaymentDeadline: (loan as any).repaymentDeadline,
          gracePeriodEnd: (loan as any).gracePeriodEnd,
        };

    // Only check funded loans (state = 3)
    if (loanData.state !== 3) {
      return null;
    }

    const currentBlock = await publicClient.getBlockNumber();
    const currentTimestamp = (await publicClient.getBlock({ blockNumber: currentBlock })).timestamp;

    // Check if past repayment deadline
    if (currentTimestamp < loanData.repaymentDeadline) {
      return null; // Not yet past deadline
    }

    // Check if past grace period
    if (currentTimestamp >= loanData.gracePeriodEnd) {
      return null; // Past grace period, should be handled by default detection
    }

    // Get total owed and amount repaid
    const totalOwed = await publicClient.readContract({
      ...lendingMarketContract,
      functionName: "calculateTotalOwed",
      args: [loanId],
    });

    const amountRepaid = await publicClient.readContract({
      ...lendingMarketContract,
      functionName: "amountRepaid",
      args: [loanId],
    });

    const remainingOwed = (totalOwed as bigint) - (amountRepaid as bigint);

    if (remainingOwed <= BigInt(0)) {
      return null; // Already fully repaid
    }

    // Get borrower balance
    const borrowerBalance = await getBorrowerBalance(loanData.borrower);

    const gracePeriodRemaining = loanData.gracePeriodEnd - currentTimestamp;

    return {
      loanId,
      borrower: loanData.borrower,
      repaymentDeadline: loanData.repaymentDeadline,
      gracePeriodEnd: loanData.gracePeriodEnd,
      totalOwed: totalOwed as bigint,
      amountRepaid: amountRepaid as bigint,
      remainingOwed,
      borrowerBalance,
      isInGracePeriod: true,
      gracePeriodRemaining,
    };
  } catch (error) {
    console.error(`Error checking loan ${loanId} grace period:`, error);
    return null;
  }
}

/**
 * Get all loans in grace period
 */
export async function getLoansInGracePeriod(): Promise<GracePeriodLoan[]> {
  const publicClient = createClient();

  try {
    const totalLoans = await publicClient.readContract({
      ...lendingMarketContract,
      functionName: "totalLoans",
    });

    const gracePeriodLoans: GracePeriodLoan[] = [];

    for (let i = 1; i <= Number(totalLoans); i++) {
      const check = await checkLoanGracePeriod(BigInt(i));
      if (check) {
        gracePeriodLoans.push(check);
      }
    }

    return gracePeriodLoans;
  } catch (error) {
    console.error("Error getting loans in grace period:", error);
    return [];
  }
}

/**
 * Send grace period notification to borrower
 * This would typically be sent via Telegram
 */
export async function sendGracePeriodNotification(
  loan: GracePeriodLoan,
  chatId?: number
): Promise<void> {
  try {
    // Calculate days remaining
    const daysRemaining = Number(loan.gracePeriodRemaining) / (24 * 60 * 60);

    // Send notification (this would integrate with Telegram service)
    // For now, just log it
    console.log(
      `Grace period notification for loan ${loan.loanId.toString()}: ` +
        `${daysRemaining.toFixed(1)} days remaining. ` +
        `Remaining balance: ${formatEther(loan.remainingOwed)} CRC`
    );

    // TODO: Integrate with Telegram notification service
    // await notifyGracePeriodWarning({ ... });
  } catch (error) {
    console.error("Error sending grace period notification:", error);
  }
}

/**
 * Attempt collection after grace period ends
 * This would check balance again and attempt repayment
 */
export async function attemptCollectionAfterGracePeriod(
  loanId: bigint
): Promise<{
  success: boolean;
  message: string;
  canRepay: boolean;
  repaymentAmount?: bigint;
}> {
  const check = await checkLoanGracePeriod(loanId);

  if (!check) {
    return {
      success: false,
      message: "Loan not in grace period or already handled",
      canRepay: false,
    };
  }

  // Check if borrower now has sufficient balance
  if (check.borrowerBalance >= check.remainingOwed) {
    return {
      success: true,
      message: "Borrower has sufficient balance for full repayment",
      canRepay: true,
      repaymentAmount: check.remainingOwed,
    };
  } else if (check.borrowerBalance > BigInt(0)) {
    return {
      success: true,
      message: "Borrower has partial balance available",
      canRepay: true,
      repaymentAmount: check.borrowerBalance,
    };
  } else {
    return {
      success: false,
      message: "Borrower has insufficient balance",
      canRepay: false,
    };
  }
}

