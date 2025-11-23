# Ticket 04: Create useCreateLoanRequestWithEvents Hook

## Priority
🔴 **High** - Required for loan ID retrieval

## Status
📋 **Todo**

## Description
Create an enhanced hook that listens for `LoanRequestCreated` events to automatically retrieve the loan ID after transaction confirmation.

## Dependencies
- Ticket 03 (useCreateLoanRequest Hook)

## Implementation Tasks

### 1. Create Hook File (`src/services/loans/useCreateLoanRequestWithEvents.ts`)
- [ ] Add "use client" directive
- [ ] Import required dependencies:
  - `useState`, `useEffect` from `react`
  - `useAccount`, `useWatchContractEvent` from `wagmi`
  - `lendingMarketContract` from config
  - `useCreateLoanRequest` from previous ticket
  - Types from `@/types/loans`
- [ ] Create `useCreateLoanRequestWithEvents` hook function
  - Accept `onSuccess` and `onError` callbacks
  - Use `useAccount` to get current address
  - Use `useCreateLoanRequest` hook internally
  - Manage `pendingLoanId` state
- [ ] Implement event listener using `useWatchContractEvent`:
  - Listen for `LoanRequestCreated` event
  - Filter logs by borrower address matching current user
  - Extract `loanId` from event args
  - Build `LoanRequestResult` object
  - Call `onSuccess` callback with result
  - Show success toast with loan ID
- [ ] Handle edge cases:
  - Event not received (timeout scenario)
  - Multiple events (filter correctly)
  - Address mismatch

### 2. Event Parsing
- [ ] Correctly parse event logs
- [ ] Extract indexed parameters (loanId, borrower)
- [ ] Extract non-indexed parameters (amount, termDuration)
- [ ] Handle type conversions (bigint, Address)

### 3. Integration
- [ ] Return enhanced hook interface:
  - `createLoanRequest` function
  - `hash` (transaction hash)
  - `loanId` (extracted from event)
  - `isPending`, `isSuccess`, `isError` states
  - `error` object
  - `reset` function

## Acceptance Criteria
- [ ] Hook listens for `LoanRequestCreated` events correctly
- [ ] Loan ID is extracted from events
- [ ] Events are filtered by borrower address
- [ ] `LoanRequestResult` is properly constructed
- [ ] `onSuccess` callback is called with correct data
- [ ] Success toast shows loan ID
- [ ] Hook resets correctly
- [ ] No memory leaks (event listeners cleaned up)

## Testing
- [ ] Test event listening after transaction
- [ ] Test event filtering (only user's loans)
- [ ] Test with multiple concurrent transactions
- [ ] Test event parsing with correct data types
- [ ] Test timeout scenario (event not received)
- [ ] Verify loan ID matches contract state

## Notes
- Event listening is critical for getting the loan ID
- Consider adding a fallback mechanism if events are delayed
- Ensure event listener doesn't cause memory leaks
- May need to handle event decoding if ABI doesn't match exactly

## Estimated Effort
**3-4 hours**

