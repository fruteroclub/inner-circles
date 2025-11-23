# Ticket 05: Create useLoanDetails Hook

## Priority
🟡 **Medium** - Required for displaying loan information

## Status
📋 **Todo**

## Description
Create a hook to read loan details from the contract with automatic polling for active loans.

## Dependencies
- Ticket 01 (Types and Config)
- Ticket 02 (Wagmi Config)

## Implementation Tasks

### 1. Create Hook File (`src/services/loans/useLoanDetails.ts`)
- [ ] Add "use client" directive
- [ ] Import required dependencies:
  - `useReadContract` from `wagmi`
  - `lendingMarketContract` from config
  - Types from `@/types/loans`
- [ ] Create `useLoanDetails` hook function
  - Accept `loanId` parameter (bigint | null)
  - Use `useReadContract` hook
  - Call `getLoan` function on contract
- [ ] Implement data transformation:
  - Map contract return array to `Loan` interface
  - Handle all 12 fields correctly
  - Convert state enum correctly
- [ ] Implement polling logic:
  - Poll every 5 seconds for active loans
  - Active states: Vouching, Crowdfunding, Funded
  - Disable polling for inactive states
- [ ] Handle edge cases:
  - Loan doesn't exist (null loanId)
  - Contract read errors
  - Network errors

### 2. Data Transformation
- [ ] Correctly map contract struct to TypeScript interface
- [ ] Handle bigint conversions
- [ ] Handle Address type conversions
- [ ] Handle LoanState enum conversion
- [ ] Ensure all fields are properly typed

### 3. Polling Configuration
- [ ] Configure `refetchInterval` based on loan state
- [ ] Only poll when loan is in active state
- [ ] Stop polling when loan is Repaid or Defaulted
- [ ] Handle polling errors gracefully

## Acceptance Criteria
- [ ] Hook reads loan data correctly from contract
- [ ] Data transformation matches `Loan` interface exactly
- [ ] Polling works for active loans only
- [ ] Polling stops for inactive loans
- [ ] Error states are handled correctly
- [ ] Loading states are properly managed
- [ ] Hook can be refetched manually
- [ ] All TypeScript types are correct

## Testing
- [ ] Test reading existing loan
- [ ] Test with null loanId
- [ ] Test polling for active loan
- [ ] Test polling stops for inactive loan
- [ ] Test error handling (non-existent loan)
- [ ] Test data transformation accuracy
- [ ] Test manual refetch

## Notes
- Polling interval (5 seconds) can be adjusted based on UX needs
- Consider adding configurable polling interval
- Ensure polling doesn't cause performance issues
- May want to add caching for inactive loans

## Estimated Effort
**2-3 hours**

