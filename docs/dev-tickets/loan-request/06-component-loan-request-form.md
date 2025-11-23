# Ticket 06: Create LoanRequestForm Component

## Priority
🔴 **High** - Primary user interface

## Status
📋 **Todo**

## Description
Create the loan request form component with validation, error handling, and success states.

## Dependencies
- Ticket 04 (useCreateLoanRequestWithEvents Hook)
- Ticket 01 (Types and Config)

## Implementation Tasks

### 1. Create Component File (`src/components/loans/loan-request-form.tsx`)
- [ ] Add "use client" directive
- [ ] Import required dependencies:
  - `useState` from `react`
  - `useAccount` from `wagmi`
  - `useCreateLoanRequestWithEvents` hook
  - `Button` component
  - `toast` from `sonner`
  - `parseEther`, `formatEther` from `viem`
  - Types and constants from `@/types/loans`
- [ ] Create component interface:
  - `onSuccess?: (loanId: bigint) => void`
  - `className?: string`
- [ ] Implement form state:
  - `amount` state (string)
  - `errors` state (object with amount field)

### 2. Form Validation
- [ ] Implement `validateAmount` function:
  - Check for empty value
  - Try parsing with `parseEther`
  - Check minimum amount
  - Check maximum amount
  - Return error message or undefined
- [ ] Implement `handleAmountChange`:
  - Update amount state
  - Validate and update errors
- [ ] Implement `handleSubmit`:
  - Prevent default form submission
  - Check wallet connection
  - Validate amount
  - Call `createLoanRequest` with input

### 3. UI Implementation
- [ ] Create form JSX:
  - Amount input field
    - Type: text, inputMode: decimal
    - Placeholder: "0.00"
    - Disabled when pending or wallet not connected
    - Error display below input
  - Term duration display (read-only, shows 30 days)
  - Wallet connection warning (if not connected)
  - Submit button
    - Disabled when pending, not connected, or has errors
    - Shows loading state text
- [ ] Create success state UI:
  - Green success card
  - Display loan ID
  - Success message
  - "Create Another Loan" button (calls reset)

### 4. Styling
- [ ] Use Tailwind classes matching design system
- [ ] Ensure responsive design
- [ ] Support dark mode
- [ ] Match existing button and input styles
- [ ] Error states styled with destructive colors

## Acceptance Criteria
- [ ] Form renders correctly
- [ ] Amount input accepts decimal values
- [ ] Validation works for all edge cases
- [ ] Error messages display correctly
- [ ] Form submission works
- [ ] Success state displays correctly
- [ ] Wallet connection check works
- [ ] Loading states are clear
- [ ] Component is accessible (labels, ARIA)
- [ ] Responsive on mobile devices
- [ ] Dark mode support works

## Testing
- [ ] Test form validation (empty, invalid, too small, too large)
- [ ] Test form submission with valid input
- [ ] Test wallet not connected scenario
- [ ] Test transaction pending state
- [ ] Test success state display
- [ ] Test error handling
- [ ] Test "Create Another Loan" reset functionality
- [ ] Test responsive design
- [ ] Test accessibility

## Notes
- Follow existing form patterns in codebase
- Use shadcn/ui components if available
- Ensure consistent styling with rest of app
- Consider adding input formatting (thousand separators, etc.)

## Estimated Effort
**4-5 hours**

