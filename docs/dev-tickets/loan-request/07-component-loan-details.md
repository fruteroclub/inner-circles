# Ticket 07: Create LoanDetails Component

## Priority
🟡 **Medium** - Display component

## Status
📋 **Todo**

## Description
Create a component to display loan details with real-time updates via polling.

## Dependencies
- Ticket 05 (useLoanDetails Hook)
- Ticket 01 (Types and Config)

## Implementation Tasks

### 1. Create Component File (`src/components/loans/loan-details.tsx`)
- [ ] Add "use client" directive
- [ ] Import required dependencies:
  - `useLoanDetails` hook
  - `LoanState` enum
  - `formatEther` from `viem`
  - `formatDistanceToNow` from `date-fns`
- [ ] Create component interface:
  - `loanId: bigint` (required)
  - `className?: string`
- [ ] Use `useLoanDetails` hook with loanId

### 2. State Labels
- [ ] Create `stateLabels` mapping:
  - Requested → "Requested"
  - Vouching → "Vouching"
  - Crowdfunding → "Crowdfunding"
  - Funded → "Funded"
  - Repaid → "Repaid"
  - Defaulted → "Defaulted"

### 3. UI Implementation
- [ ] Loading state:
  - Show "Loading loan details..." message
- [ ] Error state:
  - Show error message with destructive styling
- [ ] Success state:
  - Loan header with ID and state badge
  - State badge with color coding:
    - Vouching: blue
    - Crowdfunding: yellow
    - Funded: green
    - Others: gray
  - Grid layout with loan information:
    - Amount Requested (formatted CRC)
    - Amount Funded (formatted CRC)
    - Vouchers (count)
    - Interest Rate (percentage)
  - Vouching deadline info (if in Vouching state):
    - Show relative time until deadline
    - Blue info box styling

### 4. Styling
- [ ] Use Tailwind classes matching design system
- [ ] Ensure responsive grid layout
- [ ] Support dark mode
- [ ] Color-coded state badges
- [ ] Consistent spacing and typography

### 5. Date Formatting
- [ ] Install `date-fns` if not already installed
- [ ] Format timestamps correctly
- [ ] Show relative time (e.g., "in 2 days")
- [ ] Handle timezone correctly

## Acceptance Criteria
- [ ] Component displays loan details correctly
- [ ] Loading state shows while fetching
- [ ] Error state handles errors gracefully
- [ ] All loan fields are displayed correctly
- [ ] Amounts are formatted with CRC suffix
- [ ] Interest rate shows as percentage
- [ ] State badges have correct colors
- [ ] Vouching deadline shows relative time
- [ ] Component updates automatically (polling)
- [ ] Responsive design works
- [ ] Dark mode support works

## Testing
- [ ] Test with valid loan ID
- [ ] Test loading state
- [ ] Test error state (invalid loan ID)
- [ ] Test with different loan states
- [ ] Test date formatting
- [ ] Test polling updates
- [ ] Test responsive layout
- [ ] Test dark mode

## Notes
- Component should handle all loan states gracefully
- Consider adding more detailed information for each state
- May want to add links to block explorer for transaction details
- Consider adding action buttons based on loan state (future enhancement)

## Estimated Effort
**3-4 hours**

