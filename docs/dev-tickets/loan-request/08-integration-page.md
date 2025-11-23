# Ticket 08: Integrate Loan Request Flow into Page

## Priority
🟡 **Medium** - User-facing integration

## Status
📋 **Todo**

## Description
Create a page or integrate the loan request form and details components into the application.

## Dependencies
- Ticket 06 (LoanRequestForm Component)
- Ticket 07 (LoanDetails Component)

## Implementation Tasks

### 1. Create Loan Request Page (`src/app/loans/request/page.tsx`)
- [ ] Create new page route
- [ ] Import `LoanRequestForm` component
- [ ] Set up page layout:
  - Page header/title
  - Form section
  - Success state handling
- [ ] Implement `onSuccess` callback:
  - Store loan ID (localStorage or state)
  - Optionally redirect to loan details page
  - Show success message

### 2. Create Loan Details Page (`src/app/loans/[loanId]/page.tsx`)
- [ ] Create dynamic route for loan details
- [ ] Extract `loanId` from route params
- [ ] Convert string loanId to bigint
- [ ] Import `LoanDetails` component
- [ ] Handle invalid loanId
- [ ] Add page header with loan ID

### 3. Navigation Integration
- [ ] Add navigation link to loan request page
- [ ] Add navigation from form success to loan details
- [ ] Consider adding to main navigation menu

### 4. Layout and Styling
- [ ] Use existing `PageWrapper` and `Section` components
- [ ] Ensure consistent page layout
- [ ] Add proper page titles
- [ ] Add breadcrumbs if applicable

## Acceptance Criteria
- [ ] Loan request page is accessible via route
- [ ] Form works correctly on the page
- [ ] Success state navigates or shows loan details
- [ ] Loan details page displays correctly
- [ ] Invalid loan IDs are handled gracefully
- [ ] Navigation flows work correctly
- [ ] Page layout matches app design
- [ ] Responsive design works

## Testing
- [ ] Test page routing
- [ ] Test form submission from page
- [ ] Test navigation to loan details
- [ ] Test with valid loan ID
- [ ] Test with invalid loan ID
- [ ] Test responsive layout
- [ ] Test navigation links

## Notes
- Consider adding a loans list page in the future
- May want to add protected route wrapper if authentication is required
- Consider adding page metadata for SEO

## Estimated Effort
**2-3 hours**

