/**
 * Utility functions for loan calculations and formatting
 */

/**
 * Calculates interest rate based on voucher count
 * This function mirrors the contract's calculateInterestRate function exactly
 * @param voucherCount Number of vouchers
 * @returns Interest rate in basis points (e.g., 500 = 5%)
 * 
 * Interest rate tiers (matches contract):
 * - < 3 vouchers: Ineligible (returns max value)
 * - 3-6 vouchers: 5% (500 basis points)
 * - 7-9 vouchers: 2.5% (250 basis points)
 * - 10-15 vouchers: 1% (100 basis points)
 * - > 15 vouchers: 0% (0 basis points)
 */
export function calculateInterestRate(voucherCount: bigint): number {
  const count = Number(voucherCount);
  
  // Match contract logic exactly: if (voucherCount < 3) return type(uint256).max
  if (count < 3) {
    return Number.MAX_SAFE_INTEGER; // Ineligible
  } 
  // Match contract: else if (voucherCount >= 3 && voucherCount <= 6) return 500
  else if (count >= 3 && count <= 6) {
    return 500; // 5%
  } 
  // Match contract: else if (voucherCount >= 7 && voucherCount <= 9) return 250
  else if (count >= 7 && count <= 9) {
    return 250; // 2.5%
  } 
  // Match contract: else if (voucherCount >= 10 && voucherCount <= 15) return 100
  else if (count >= 10 && count <= 15) {
    return 100; // 1%
  } 
  // Match contract: else return 0
  else {
    return 0; // 0%
  }
}

/**
 * Formats interest rate from basis points to percentage
 * @param basisPoints Interest rate in basis points
 * @returns Formatted percentage string (e.g., "5.00%")
 */
export function formatInterestRate(basisPoints: bigint): string {
  const rate = Number(basisPoints) / 100;
  return `${rate.toFixed(2)}%`;
}

/**
 * Calculates total interest amount
 * @param principal Principal amount
 * @param interestRate Interest rate in basis points
 * @returns Total interest amount
 */
export function calculateInterestAmount(
  principal: bigint,
  interestRate: bigint
): bigint {
  return (principal * interestRate) / BigInt(10000);
}

/**
 * Calculates total owed (principal + interest)
 * @param principal Principal amount
 * @param interestRate Interest rate in basis points
 * @returns Total amount owed
 */
export function calculateTotalOwed(
  principal: bigint,
  interestRate: bigint
): bigint {
  const interest = calculateInterestAmount(principal, interestRate);
  return principal + interest;
}

