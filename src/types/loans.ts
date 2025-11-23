import type { Address } from "viem";

/**
 * Loan state enum matching contract LoanState
 */
export enum LoanState {
  Requested = 0,
  Vouching = 1,
  Crowdfunding = 2,
  Funded = 3,
  Repaid = 4,
  Defaulted = 5,
}

/**
 * Loan data structure matching contract Loan struct
 */
export interface Loan {
  borrower: Address;
  amountRequested: bigint;
  amountFunded: bigint;
  termDuration: bigint;
  interestRate: bigint; // in basis points
  createdAt: bigint;
  vouchingDeadline: bigint;
  crowdfundingDeadline: bigint;
  repaymentDeadline: bigint;
  gracePeriodEnd: bigint;
  state: LoanState;
  voucherCount: bigint;
}

/**
 * Loan request form input
 */
export interface LoanRequestInput {
  amountRequested: string; // User input as string (will be converted to bigint)
  termDuration: number; // Duration in days (will be converted to seconds)
}

/**
 * Loan request result
 */
export interface LoanRequestResult {
  loanId: bigint;
  transactionHash: `0x${string}`;
  borrower: Address;
  amountRequested: bigint;
  termDuration: bigint;
}

/**
 * Contract constants
 */
export const LOAN_CONSTANTS = {
  DEFAULT_TERM_DURATION_DAYS: 30,
  DEFAULT_TERM_DURATION_SECONDS: 30 * 24 * 60 * 60, // 30 days in seconds
  MIN_AMOUNT: BigInt(1), // Minimum 1 CRC (1 ether in 18 decimals)
  MAX_AMOUNT: BigInt(1000000) * BigInt(10) ** BigInt(18), // Max 1M CRC (reasonable limit)
} as const;

