# Epic 3: Vouching System

## Description
Implement the vouching system where Telegram group members can vouch for loan requests by reacting with an emoji, which triggers on-chain contract interactions. This includes reaction handling, contract integration for vouching, interest rate calculation, and notifications to borrowers.

## Acceptance Criteria
- [ ] Bot listens for 👍 reactions on loan request messages
- [ ] Reactions trigger `vouchForLoan` contract calls
- [ ] Interest rates are calculated based on voucher count
- [ ] Borrowers are notified when new vouchers are added
- [ ] Vouching period deadline is tracked and enforced
- [ ] Voucher information is stored and retrievable

## Tickets

### T3.1: Implement Reaction Handler
**Description:** Create service to listen for and handle emoji reactions on loan request messages.

**Tasks:**
- Create `src/services/telegram/reaction-handler.ts`
- Register reaction listener in `src/services/telegram/bot.ts`
- Filter reactions to only 👍 emoji on loan request messages
- Verify reactor is a member of the Telegram group
- Get reactor's wallet address from user storage
- Check if reactor has already vouched for this loan
- Call vouching service to process the vouch

**Acceptance Criteria:**
- Bot listens for reactions on loan request messages
- Only 👍 reactions are processed
- Duplicate vouches from same user are prevented
- Reactor must be group member and have linked wallet
- Errors are handled gracefully

**Dependencies:** T2.3 (Loan Storage), T1.3 (User Storage), T2.4 (Group Operations)

**Estimated Effort:** 4 hours

**Technical Notes:**
- Use Telegraf's `bot.on('message_reaction')` or `bot.on('callback_query')` for reactions
- Store reaction data to prevent duplicate processing
- Verify user is in group using Telegram API

---

### T3.2: Create Vouching Service
**Description:** Implement service to handle vouching logic and contract interactions.

**Tasks:**
- Create `src/services/vouching/vouching-service.ts`
- Implement `vouchForLoan(loanId, voucherAddress)` function
- Call `vouchForLoan` on InnerCirclesLendingMarket contract
- Handle transaction signing (voucher signs transaction)
- Update loan storage with new voucher information
- Get updated voucher count from contract
- Calculate new interest rate based on voucher count
- Update loan interest rate in contract (if needed)
- Return voucher count and interest rate

**Acceptance Criteria:**
- Can process vouches via contract interaction
- Voucher count is updated correctly
- Interest rate is recalculated after each vouch
- Contract errors are handled (already vouched, period ended, etc.)
- Voucher data is stored

**Dependencies:** T1.2 (Contract Service), T2.3 (Loan Storage), T3.3 (Interest Rate Calculator)

**Estimated Effort:** 5 hours

**Technical Notes:**
- Contract requires 1 CRC deposit per vouch (VOUCHER_AMOUNT)
- Voucher must approve CRC token spending before vouching
- Check vouching deadline before processing
- Interest rate update may require separate contract call

---

### T3.3: Implement Interest Rate Calculator
**Description:** Create service to calculate interest rates based on voucher count and thresholds.

**Tasks:**
- Create `src/services/loans/interest-calculator.ts`
- Implement `calculateInterestRate(voucherCount, riskScore?)` function
- Apply threshold-based calculation:
  - < 3 vouchers: Ineligible (return null or error)
  - 3-6 vouchers: 5% (500 basis points)
  - 7-9 vouchers: 2.5% (250 basis points)
  - 10-15 vouchers: 1% (100 basis points)
  - > 15 vouchers: 0% (0 basis points)
- Add risk score adjustment logic (placeholder for future)
- Return interest rate in basis points format

**Acceptance Criteria:**
- Correctly calculates interest rate based on voucher count
- Returns interest rate in basis points (for contract)
- Handles edge cases (0 vouchers, very high counts)
- Risk score adjustment structure is in place (even if not used yet)

**Dependencies:** None

**Estimated Effort:** 2 hours

**Technical Notes:**
- Interest rate stored in contract as basis points (1% = 100 basis points)
- Risk score adjustment will modify thresholds (future enhancement)
- Consider caching calculations for performance

---

### T3.4: Add Voucher Notifications
**Description:** Notify borrowers when new vouchers are added to their loan requests.

**Tasks:**
- Update `src/services/telegram/notifications.ts` (create if needed)
- Implement `notifyNewVoucher(loanId, voucherInfo, voucherCount, interestRate)` function
- Send private message to borrower with:
  - New voucher information
  - Updated voucher count
  - Updated interest rate
  - Remaining time in vouching period
- Format message clearly with emojis
- Handle notification errors (user blocked bot, etc.)

**Acceptance Criteria:**
- Borrowers receive notifications for new vouches
- Notification includes all relevant information
- Messages are formatted clearly
- Errors don't break the vouching flow

**Dependencies:** T3.2 (Vouching Service), T2.3 (Loan Storage)

**Estimated Effort:** 2 hours

---

### T3.5: Track Vouching Period Deadlines
**Description:** Implement deadline tracking and enforcement for vouching periods.

**Tasks:**
- Add deadline checking in vouching service
- Verify vouching period hasn't ended before processing reactions
- Get vouching deadline from contract (stored in loan struct)
- Add validation: `isVouchingPeriodActive(loanId)` function
- Update loan state when vouching period ends
- Notify borrower when vouching period ends with results

**Acceptance Criteria:**
- Vouching period deadline is checked before processing vouches
- Reactions after deadline are rejected with clear message
- Loan state is updated when period ends
- Borrowers are notified of vouching period completion

**Dependencies:** T3.2 (Vouching Service), T1.2 (Contract Service)

**Estimated Effort:** 3 hours

**Technical Notes:**
- Vouching period is 2 days (DEFAULT_VOUCHING_PERIOD from contract)
- Deadline is stored in loan struct on-chain
- Consider background job to check and update expired periods

---

### T3.6: Integrate Vouching System
**Description:** Connect all vouching components and register handlers in bot.

**Tasks:**
- Register reaction handler in `src/services/telegram/bot.ts`
- Connect reaction handler to vouching service
- Integrate interest rate calculator
- Add voucher notifications to flow
- Test complete vouching flow end-to-end
- Add error handling at each step

**Acceptance Criteria:**
- Complete vouching flow works end-to-end
- Reactions trigger contract calls
- Interest rates update correctly
- Notifications are sent
- All error cases are handled

**Dependencies:** T3.1, T3.2, T3.3, T3.4, T3.5

**Estimated Effort:** 3 hours

---

## Dependencies
- Epic 1: Foundation
- Epic 2: Loan Request Flow

## Blockers
- None

## Technical Decisions
- Only 👍 emoji is used for vouching (can be configurable later)
- Vouchers must have 1 CRC approved for contract spending
- Interest rate is recalculated after each vouch
- Minimum 3 vouchers required for loan to proceed (enforced by contract)

## Testing Strategy
- Unit tests for interest rate calculator
- Integration tests for vouching contract calls (testnet)
- Manual testing of reaction handling
- Test voucher notifications
- Test deadline enforcement
- Test error scenarios (insufficient balance, period ended, duplicate vouches)

