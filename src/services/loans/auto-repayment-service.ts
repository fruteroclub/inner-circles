/**
 * Auto-Repayment Service
 * 
 * Checks funded loans past repayment deadline and executes repayments
 * if borrower has sufficient CRC balance.
 */

import { createPublicClient, http, type Address, type PublicClient } from "viem";
import { gnosis } from "viem/chains";
import { lendingMarketContract } from "@/lib/contracts/config";
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

  // Read ERC20 balance
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
 * Check if a loan is eligible for auto-repayment
 */
export interface AutoRepaymentCheck {
  loanId: bigint;
  borrower: Address;
  totalOwed: bigint;
  amountRepaid: bigint;
  remainingOwed: bigint;
  borrowerBalance: bigint;
  canRepayFull: boolean;
  canRepayPartial: boolean;
  repaymentAmount: bigint;
}

/**
 * Check a single loan for auto-repayment eligibility
 */
export async function checkLoanForAutoRepayment(
  loanId: bigint
): Promise<AutoRepaymentCheck | null> {
  const publicClient = createClient();

  try {
    // Get loan data
    const loan = (await publicClient.readContract({
      ...lendingMarketContract,
      functionName: "getLoan",
      args: [loanId],
    })) as ContractLoanData;

    const loanData = Array.isArray(loan)
      ? {
          borrower: loan[0],
          state: loan[10],
          repaymentDeadline: loan[8],
        }
      : {
          borrower: (loan as { borrower: Address }).borrower,
          state: (loan as { state: number }).state,
          repaymentDeadline: (loan as { repaymentDeadline: bigint }).repaymentDeadline,
        };

    // Only check funded loans (state = 3)
    if (loanData.state !== 3) {
      return null;
    }

    // Check if past repayment deadline
    const currentBlock = await publicClient.getBlockNumber();
    const currentTimestamp = (await publicClient.getBlock({ blockNumber: currentBlock })).timestamp;

    if (currentTimestamp < loanData.repaymentDeadline) {
      return null; // Not yet past deadline
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

    const canRepayFull = borrowerBalance >= remainingOwed;
    const canRepayPartial = borrowerBalance > BigInt(0);
    const repaymentAmount = canRepayFull ? remainingOwed : borrowerBalance;

    return {
      loanId,
      borrower: loanData.borrower,
      totalOwed: totalOwed as bigint,
      amountRepaid: amountRepaid as bigint,
      remainingOwed,
      borrowerBalance,
      canRepayFull,
      canRepayPartial,
      repaymentAmount,
    };
  } catch (error) {
    console.error(`Error checking loan ${loanId} for auto-repayment:`, error);
    return null;
  }
}

/**
 * Get all loans that need auto-repayment checking
 */
export async function getLoansNeedingAutoRepayment(): Promise<
  AutoRepaymentCheck[]
> {
  const publicClient = createClient();

  try {
    // Get total number of loans
    const totalLoans = await publicClient.readContract({
      ...lendingMarketContract,
      functionName: "totalLoans",
    });

    const loanChecks: AutoRepaymentCheck[] = [];

    // Check each loan (starting from 1, as loan IDs are 1-indexed)
    for (let i = 1; i <= Number(totalLoans); i++) {
      const check = await checkLoanForAutoRepayment(BigInt(i));
      if (check && (check.canRepayFull || check.canRepayPartial)) {
        loanChecks.push(check);
      }
    }

    return loanChecks;
  } catch (error) {
    console.error("Error getting loans needing auto-repayment:", error);
    return [];
  }
}

/**
 * Prepare repayment transaction data
 * Note: Actual execution requires a wallet client with borrower's private key
 * This function returns the transaction data that can be executed
 */
export function prepareRepaymentTransaction(
  check: AutoRepaymentCheck
): {
  loanId: bigint;
  amount: bigint;
  borrower: Address;
} {
  return {
    loanId: check.loanId,
    amount: check.repaymentAmount,
    borrower: check.borrower,
  };
}

/**
 * Format auto-repayment check for logging
 */
export function formatAutoRepaymentCheck(
  check: AutoRepaymentCheck
): string {
  return `
Loan ID: ${check.loanId.toString()}
Borrower: ${check.borrower}
Total Owed: ${formatEther(check.totalOwed)} CRC
Amount Repaid: ${formatEther(check.amountRepaid)} CRC
Remaining Owed: ${formatEther(check.remainingOwed)} CRC
Borrower Balance: ${formatEther(check.borrowerBalance)} CRC
Can Repay Full: ${check.canRepayFull}
Can Repay Partial: ${check.canRepayPartial}
Repayment Amount: ${formatEther(check.repaymentAmount)} CRC
  `.trim();
}

