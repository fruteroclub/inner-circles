# Epic 5: Default Handling

## Description
Implement default detection and handling for loans that are not repaid within the grace period. This includes detecting defaults, posting "Remove Trust" recommendations to the Telegram group, handling ENS membership revocation (backend-managed), and updating user trust scores.

## Acceptance Criteria
- [ ] Default detection works after grace period ends
- [ ] "Remove Trust" recommendations are posted to Telegram group
- [ ] ENS membership revocation is handled (backend service)
- [ ] User trust scores are penalized
- [ ] Vouchers are notified of default
- [ ] Default information is stored and tracked

## Tickets

### T5.1: Implement Default Detection
**Description:** Create service to detect when loans enter default state after grace period ends.

**Tasks:**
- Update loan monitoring service (from Epic 4)
- Check for loans where `gracePeriodEnd` has passed and loan is not repaid
- Verify loan state is "Funded" (not yet marked as defaulted)
- Call contract's default handling function (if exists) or mark as defaulted
- Update loan state to "Defaulted" in storage
- Trigger default handling workflow

**Acceptance Criteria:**
- Defaults are detected after grace period ends
- Loan state is updated to "Defaulted"
- Default handling workflow is triggered
- Handles edge cases (partial repayments, etc.)

**Dependencies:** T4.5 (Loan State Monitoring), T1.2 (Contract Service)

**Estimated Effort:** 3 hours

**Technical Notes:**
- Contract may have `markAsDefaulted(loanId)` function
- Check `amountRepaid` vs total amount due
- Consider partial defaults (if some repayment occurred)

---

### T5.2: Create Remove Trust Recommendation Posting
**Description:** Post "Remove Trust" recommendation to Telegram group when loan defaults.

**Tasks:**
- Update `src/services/telegram/group-operations.ts`
- Implement `postRemoveTrustRecommendation(loanId, borrowerInfo)` function
- Format message with:
  - Loan ID and default information
  - Borrower wallet address and Telegram info
  - Amount defaulted
  - Recommendation to remove trust in Circles protocol
  - Link to borrower's Circles profile (if applicable)
- Post to Telegram group
- Handle posting errors gracefully

**Acceptance Criteria:**
- Default notifications are posted to group
- Message format is clear and professional
- Includes all relevant default information
- Handles posting errors

**Dependencies:** T5.1 (Default Detection), T2.4 (Group Operations)

**Estimated Effort:** 2 hours

**Technical Notes:**
- Message should be factual and not inflammatory
- Include loan details for transparency
- Consider privacy concerns (how much info to share)

---

### T5.3: Implement ENS Membership Revocation (Backend)
**Description:** Handle ENS membership revocation as backend service (no on-chain contract).

**Tasks:**
- Create `src/services/verification/ens-service.ts` (preparation for Phase 6)
- Implement `revokeMembership(telegramUserId, reason)` function
- Update user storage to mark ENS membership as revoked
- Store revocation reason and timestamp
- Update user verification status
- Prevent user from requesting new loans until membership restored

**Acceptance Criteria:**
- ENS membership is revoked in backend storage
- User verification reflects revoked status
- Users cannot request loans after revocation
- Revocation data is stored with reason

**Dependencies:** T1.3 (User Storage), T1.4 (User Verification)

**Estimated Effort:** 3 hours

**Technical Notes:**
- This is backend-only (no on-chain ENS contract)
- Store revocation in user storage
- Consider restoration process (manual admin action)

---

### T5.4: Implement Trust Score Penalization
**Description:** Update user trust scores when loans default, affecting future loan requirements.

**Tasks:**
- Create trust score system in user storage
- Implement `penalizeTrustScore(telegramUserId, loanId)` function
- Reduce trust score based on default severity
- Store default history per user
- Update voucher quorum requirements based on trust score
- Display trust score in user profile commands

**Acceptance Criteria:**
- Trust scores are penalized on default
- Default history is tracked
- Future loan requirements reflect lower trust score
- Trust score is visible to users

**Dependencies:** T1.3 (User Storage), T3.3 (Interest Rate Calculator)

**Estimated Effort:** 4 hours

**Technical Notes:**
- Trust score affects voucher quorum requirements
- Higher default count = higher quorum needed
- Consider score recovery over time (future enhancement)

---

### T5.5: Notify Vouchers of Default
**Description:** Send notifications to vouchers when a loan they vouched for defaults.

**Tasks:**
- Update `src/services/telegram/notifications.ts`
- Implement `notifyVouchersOfDefault(loanId)` function
- Get list of vouchers from contract
- Get vouchers' Telegram IDs from user storage
- Send private message to each voucher:
  - Loan ID and borrower info
  - Amount they vouched (1 CRC)
  - Default status
  - Impact on their funds (may be unreimbursed)
- Handle notification errors (blocked users, etc.)

**Acceptance Criteria:**
- Vouchers receive default notifications
- Messages include relevant information
- All vouchers are notified
- Errors don't break the flow

**Dependencies:** T5.1 (Default Detection), T1.2 (Contract Service), T1.3 (User Storage)

**Estimated Effort:** 3 hours

---

### T5.6: Store Default Information
**Description:** Track and store default information for reporting and analysis.

**Tasks:**
- Update loan storage to include default information
- Store:
  - Default timestamp
  - Amount defaulted
  - Amount repaid (if partial)
  - Voucher count at default
  - Revocation status
- Create functions to query defaults
- Add default statistics (for admin/reporting)

**Acceptance Criteria:**
- Default information is stored
- Can query defaults by user or loan
- Statistics are available
- Data persists correctly

**Dependencies:** T2.3 (Loan Storage), T1.3 (User Storage)

**Estimated Effort:** 2 hours

---

### T5.7: Integrate Default Handling Flow
**Description:** Connect all default handling components into complete workflow.

**Tasks:**
- Integrate default detection with monitoring service
- Connect default detection to trust revocation
- Connect to group posting
- Connect to voucher notifications
- Add error handling at each step
- Test complete default handling flow

**Acceptance Criteria:**
- Complete default handling flow works end-to-end
- All components are integrated
- Error handling is comprehensive
- Flow is tested and verified

**Dependencies:** T5.1, T5.2, T5.3, T5.4, T5.5, T5.6

**Estimated Effort:** 3 hours

---

## Dependencies
- Epic 1: Foundation
- Epic 2: Loan Request Flow
- Epic 3: Vouching System
- Epic 4: Loan Management

## Blockers
- None

## Technical Decisions
- Default detection runs as part of loan monitoring service
- ENS revocation is backend-only (no on-chain contract)
- Trust score affects future loan requirements
- Vouchers are notified but may not be fully reimbursed (social responsibility)

## Testing Strategy
- Unit tests for default detection logic
- Integration tests for default handling (testnet)
- Manual testing of default workflow
- Test trust score penalization
- Test voucher notifications
- Test error scenarios

