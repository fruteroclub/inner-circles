# Epic 4: Loan Management

## Description
Implement loan management features including enhanced loan status display, loan confirmation flow, repayment functionality, and grace period notification system. This epic enables borrowers to track their loans, confirm loan terms, repay loans, and receive timely notifications.

## Acceptance Criteria
- [ ] `/loan_status` command shows real loan data from contract
- [ ] Borrowers can confirm loan terms after vouching period
- [ ] Repayment functionality works via contract interaction
- [ ] Grace period notifications are sent to borrowers
- [ ] Loan state transitions are tracked and displayed
- [ ] All loan management commands provide clear, formatted output

## Tickets

### T4.1: Enhance Loan Status Command
**Description:** Update `/loan_status` command to fetch and display real loan data from contract.

**Tasks:**
- Update `src/services/telegram/commands/loan-status.ts`
- Fetch loan data from contract using loanId or user's wallet address
- Display comprehensive loan information:
  - Loan ID
  - Current state (Vouching, Crowdfunding, Funded, Repaid, Defaulted)
  - Amount requested and funded
  - Voucher count
  - Interest rate
  - Important deadlines (vouching, crowdfunding, repayment)
  - Amount repaid (if applicable)
- Format output clearly with emojis and sections
- Handle cases where user has multiple loans
- Show active loans if no loanId provided

**Acceptance Criteria:**
- Displays real loan data from contract
- Shows all relevant loan information
- Format is clear and easy to read
- Handles multiple loans per user
- Error messages for invalid loanIds

**Dependencies:** T1.2 (Contract Service), T2.3 (Loan Storage), T1.3 (User Storage)

**Estimated Effort:** 4 hours

**Technical Notes:**
- Use contract's `loans(loanId)` function to get loan data
- Parse loan state enum to human-readable format
- Calculate time remaining for deadlines
- Format amounts in CRC with proper decimals

---

### T4.2: Implement Loan Confirmation Flow
**Description:** Allow borrowers to confirm loan terms after vouching period ends, triggering crowdfunding phase.

**Tasks:**
- Create confirmation command or add to loan status flow
- Check loan state is in "Vouching" and period has ended
- Verify minimum vouchers requirement (≥3)
- Display loan terms: amount, interest rate, term duration
- Prompt borrower to confirm or cancel
- Call `confirmLoanTerms(loanId)` on contract
- Update loan state to "Crowdfunding"
- Set crowdfunding deadline
- Notify borrower of confirmation and next steps

**Acceptance Criteria:**
- Borrowers can confirm loan terms after vouching
- Loan transitions to crowdfunding state
- Clear display of loan terms before confirmation
- Cancellation option is available
- Contract state is updated correctly

**Dependencies:** T1.2 (Contract Service), T2.3 (Loan Storage), T3.3 (Interest Rate Calculator)

**Estimated Effort:** 4 hours

**Technical Notes:**
- Contract function: `confirmLoanTerms(uint256 loanId)`
- Sets `crowdfundingDeadline` in loan struct
- Borrower must sign transaction to confirm
- Consider adding confirmation timeout

---

### T4.3: Implement Repayment Functionality
**Description:** Enable borrowers to repay loans via `/repay_loan` command with contract interaction.

**Tasks:**
- Update `src/services/telegram/commands/repay-loan.ts`
- List user's active loans (Funded state)
- Allow selection of loan to repay
- Calculate repayment amount (principal + interest)
- Check borrower's CRC balance
- Call `repayLoan(loanId)` on contract
- Handle transaction signing
- Update loan state after repayment
- Show confirmation with repayment details
- Handle partial repayments if needed

**Acceptance Criteria:**
- Users can see their active loans
- Repayment amount is calculated correctly
- Contract repayment function is called
- Loan state updates after repayment
- Clear confirmation messages
- Handles insufficient balance errors

**Dependencies:** T1.2 (Contract Service), T2.3 (Loan Storage), T1.3 (User Storage)

**Estimated Effort:** 5 hours

**Technical Notes:**
- Contract function: `repayLoan(uint256 loanId)`
- Repayment amount = principal + (principal * interestRate / 10000)
- Check `repaymentDeadline` before allowing repayment
- Contract handles repayment distribution to lenders

---

### T4.4: Create Grace Period Notification System
**Description:** Implement system to send notifications to borrowers during grace period when repayment is overdue.

**Tasks:**
- Create/update `src/services/telegram/notifications.ts`
- Implement `sendGracePeriodNotice(loanId, daysRemaining)` function
- Send private message when repayment deadline passes:
  - Loan ID and amount due
  - Grace period start notification (7 days)
  - Remaining days in grace period
  - Consequences of default
- Schedule reminders (daily or every 2 days)
- Send final notice before grace period ends
- Track which notifications have been sent

**Acceptance Criteria:**
- Borrowers receive grace period notifications
- Notifications are sent at appropriate times
- Messages are clear about consequences
- Notification tracking prevents spam
- Handles notification errors gracefully

**Dependencies:** T2.3 (Loan Storage), T1.2 (Contract Service)

**Estimated Effort:** 4 hours

**Technical Notes:**
- Grace period is 7 days (DEFAULT_GRACE_PERIOD from contract)
- Check `repaymentDeadline` and `gracePeriodEnd` from contract
- Consider using cron job or scheduled task for notifications
- Store notification timestamps to avoid duplicates

---

### T4.5: Implement Loan State Monitoring
**Description:** Create background service to monitor loan states and trigger appropriate actions.

**Tasks:**
- Create `src/services/loans/loan-monitor.ts`
- Implement periodic check of active loans
- Detect state transitions:
  - Vouching period ended → prompt confirmation
  - Repayment deadline passed → send grace period notice
  - Grace period ended → trigger default handling
- Update loan storage with current states
- Trigger appropriate notifications
- Handle errors and retries

**Acceptance Criteria:**
- Loan states are monitored periodically
- State transitions trigger appropriate actions
- Notifications are sent at correct times
- System handles errors and continues monitoring

**Dependencies:** T1.2 (Contract Service), T2.3 (Loan Storage), T4.4 (Notifications)

**Estimated Effort:** 5 hours

**Technical Notes:**
- Run monitoring every 5-10 minutes (configurable)
- Use Node.js `setInterval` or cron job
- Batch contract calls for efficiency
- Log state transitions for debugging

---

### T4.6: Enhance Vouch Status Command
**Description:** Update `/vouch_status` command to show user's real vouching history and reputation.

**Tasks:**
- Update `src/services/telegram/commands/vouch-status.ts`
- Query contract for loans user has vouched for
- Display:
  - Total number of vouches given
  - List of loans vouched (with status)
  - Total CRC committed as voucher
  - Reputation score (placeholder for future)
- Format output clearly
- Show active vouches vs completed vouches

**Acceptance Criteria:**
- Shows real vouching data from contract
- Displays vouching history clearly
- Includes relevant statistics
- Handles users with no vouches

**Dependencies:** T1.2 (Contract Service), T1.3 (User Storage)

**Estimated Effort:** 3 hours

---

## Dependencies
- Epic 1: Foundation
- Epic 2: Loan Request Flow
- Epic 3: Vouching System

## Blockers
- None

## Technical Decisions
- Loan confirmation is required before crowdfunding phase
- Repayment can be done anytime after loan is funded (before deadline)
- Grace period notifications sent daily during 7-day period
- Loan monitoring runs as background service

## Testing Strategy
- Unit tests for repayment calculations
- Integration tests for loan confirmation (testnet)
- Integration tests for repayment (testnet)
- Manual testing of notification system
- Test loan state monitoring
- Test error scenarios (insufficient balance, invalid states)

