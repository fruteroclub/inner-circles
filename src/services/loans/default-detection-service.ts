/**
 * Default Detection Service
 *
 * Detects loans that have defaulted (past grace period and not fully repaid)
 * and marks them as defaulted in the contract.
 */

import {
  createPublicClient,
  http,
  type Address,
  type PublicClient,
  type WalletClient,
} from "viem";
import { gnosis } from "viem/chains";
import { lendingMarketContract } from "@/lib/contracts/config";
import {
  notifyLoanDefault,
  notifyTrustCancellationRecommendation,
} from "@/services/telegram/notifications";
import { formatEther } from "viem";
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
 * Create a wallet client for executing transactions
 * Note: This requires a private key or wallet connection
 */
function createWallet(): WalletClient | null {
  // In a server environment, you'd need a service account private key
  // For now, return null - transactions would need to be executed by borrower or admin
  const privateKey = process.env.SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!privateKey) {
    return null;
  }

  // This would create a wallet client from private key
  // Implementation depends on your wallet setup
  return null;
}

/**
 * Defaulted loan information
 */
export interface DefaultedLoan {
  loanId: bigint;
  borrower: Address;
  totalOwed: bigint;
  amountRepaid: bigint;
  remainingOwed: bigint;
  gracePeriodEnd: bigint;
  isPastGracePeriod: boolean;
}

/**
 * Check if a loan has defaulted
 */
export async function checkLoanDefault(
  loanId: bigint
): Promise<DefaultedLoan | null> {
  const publicClient = createClient();

  try {
    const loan = (await publicClient.readContract({
      ...lendingMarketContract,
      functionName: "getLoan",
      args: [loanId],
    })) as ContractLoanData;

    const loanData = Array.isArray(loan)
      ? {
          borrower: loan[0],
          state: loan[10],
          gracePeriodEnd: loan[9],
        }
      : {
          borrower: (loan as { borrower: Address }).borrower,
          state: (loan as { state: number }).state,
          gracePeriodEnd: (loan as { gracePeriodEnd: bigint }).gracePeriodEnd,
        };

    // Only check funded loans (state = 3)
    if (loanData.state !== 3) {
      return null;
    }

    const currentBlock = await publicClient.getBlockNumber();
    const currentTimestamp = (
      await publicClient.getBlock({ blockNumber: currentBlock })
    ).timestamp;

    // Check if past grace period
    if (currentTimestamp < loanData.gracePeriodEnd) {
      return null; // Still in grace period
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

    return {
      loanId,
      borrower: loanData.borrower,
      totalOwed: totalOwed as bigint,
      amountRepaid: amountRepaid as bigint,
      remainingOwed,
      gracePeriodEnd: loanData.gracePeriodEnd,
      isPastGracePeriod: true,
    };
  } catch (error) {
    console.error(`Error checking loan ${loanId} for default:`, error);
    return null;
  }
}

/**
 * Get all defaulted loans
 */
export async function getDefaultedLoans(): Promise<DefaultedLoan[]> {
  const publicClient = createClient();

  try {
    const totalLoans = await publicClient.readContract({
      ...lendingMarketContract,
      functionName: "totalLoans",
    });

    const defaultedLoans: DefaultedLoan[] = [];

    for (let i = 1; i <= Number(totalLoans); i++) {
      const check = await checkLoanDefault(BigInt(i));
      if (check) {
        defaultedLoans.push(check);
      }
    }

    return defaultedLoans;
  } catch (error) {
    console.error("Error getting defaulted loans:", error);
    return [];
  }
}

/**
 * Mark a loan as defaulted in the contract
 * This requires a wallet client with appropriate permissions
 */
export async function markLoanAsDefaulted(
  loanId: bigint,
  walletClient?: WalletClient
): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
  const publicClient = createClient();
  const client = walletClient || createWallet();

  if (!client) {
    return {
      success: false,
      error:
        "Wallet client not available. Loan must be marked as defaulted manually or via admin.",
    };
  }

  try {
    // Check if loan is actually defaulted
    const defaultedLoan = await checkLoanDefault(loanId);
    if (!defaultedLoan) {
      return {
        success: false,
        error: "Loan is not eligible to be marked as defaulted",
      };
    }

    // Execute markLoanAsDefaulted transaction
    // Note: This requires a wallet client with an account configured
    // For now, this is a placeholder - actual implementation would need proper wallet setup
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hash = await (client as any).writeContract({
      ...lendingMarketContract,
      chain: gnosis,
      functionName: "markLoanAsDefaulted",
      args: [loanId],
    });

    // Wait for transaction receipt
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    return {
      success: true,
      transactionHash: receipt.transactionHash,
    };
  } catch (error) {
    console.error(`Error marking loan ${loanId} as defaulted:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send default notifications
 */
export async function sendDefaultNotifications(
  loan: DefaultedLoan,
  chatId?: number
): Promise<void> {
  try {
    await notifyLoanDefault({
      loanId: loan.loanId.toString(),
      requesterAddress: loan.borrower,
      amount: formatEther(loan.totalOwed),
      unpaidAmount: formatEther(loan.remainingOwed),
      chatId,
    });

    await notifyTrustCancellationRecommendation({
      loanId: loan.loanId.toString(),
      requesterAddress: loan.borrower,
      reason: "Loan default - membership suspended",
      chatId,
    });
  } catch (error) {
    console.error("Error sending default notifications:", error);
  }
}
