# Ticket 03: Create useCreateLoanRequest Hook

## Priority
🔴 **High** - Core functionality

## Status
📋 **Todo**

## Description
Implement the base Wagmi hook for creating loan requests. This hook handles contract write operations, transaction state management, and error handling.

## Dependencies
- Ticket 01 (Types and Config)
- Ticket 02 (Wagmi Config)

## Implementation Tasks

### 1. Create Hook File (`src/services/loans/useCreateLoanRequest.ts`)
- [ ] Add "use client" directive
- [ ] Import required dependencies:
  - `useWriteContract`, `useWaitForTransactionReceipt` from `wagmi`
  - `parseEther` from `viem`
  - `toast` from `sonner`
  - `lendingMarketContract` from config
  - Types from `@/types/loans`
- [ ] Create `useCreateLoanRequest` hook function
  - Accept `onSuccess` and `onError` callbacks
  - Use `useWriteContract` hook
  - Use `useWaitForTransactionReceipt` hook
- [ ] Implement `createLoanRequest` function:
  - Validate input (amount > 0, termDuration > 0)
  - Convert amount string to bigint using `parseEther`
  - Convert term duration days to seconds (BigInt)
  - Call `writeContract` with contract config
- [ ] Handle errors:
  - Write errors (transaction rejection)
  - Receipt errors (confirmation failures)
  - Display toast notifications for errors
- [ ] Handle success:
  - Show success toast when transaction is confirmed
  - Note: Loan ID extraction will be handled in next ticket

### 2. Error Handling
- [ ] Handle wallet not connected
- [ ] Handle transaction rejection
- [ ] Handle network errors
- [ ] Handle invalid input validation
- [ ] Provide user-friendly error messages

## Acceptance Criteria
- [ ] Hook is properly typed with TypeScript
- [ ] Can successfully write to contract
- [ ] Transaction state is properly managed (pending, success, error)
- [ ] Error handling works for all error scenarios
- [ ] Toast notifications display correctly
- [ ] Input validation prevents invalid submissions
- [ ] Amount conversion (string → bigint) works correctly
- [ ] Term duration conversion (days → seconds) works correctly

## Testing
- [ ] Test with valid inputs
- [ ] Test with invalid amounts (0, negative, too large)
- [ ] Test with invalid term duration
- [ ] Test wallet rejection scenario
- [ ] Test network error scenario
- [ ] Verify transaction hash is returned
- [ ] Verify transaction receipt is received

## Notes
- This is the base hook - event listening for loan ID will be added in next ticket
- Focus on robust error handling
- Ensure all user-facing errors are clear and actionable

## Estimated Effort
**2-3 hours**

