# Epic 6: ENS Integration (Final Phase)

## Description
Implement ENS membership verification and management as a backend service managed entirely by the Telegram bot. This includes ENS membership assignment, verification, revocation, and integration into the loan request verification flow. Note: This is backend-only (no on-chain ENS contract) since the contract deployment chain doesn't support ENS.

## Acceptance Criteria
- [ ] ENS membership can be assigned via Telegram bot
- [ ] ENS membership is verified during loan request flow
- [ ] ENS membership can be revoked (already implemented in Epic 5, enhance here)
- [ ] ENS subname mappings are stored in user storage
- [ ] Admin commands exist for ENS management
- [ ] ENS checks are integrated into user verification

## Tickets

### T6.1: Create ENS Service
**Description:** Create backend service to manage ENS membership (no on-chain contract).

**Tasks:**
- Create `src/services/verification/ens-service.ts`
- Implement functions:
  - `assignMembership(telegramUserId, ensSubname, assignedBy)`
  - `revokeMembership(telegramUserId, reason)` (enhance from Epic 5)
  - `verifyMembership(telegramUserId)` returns boolean
  - `getMembership(telegramUserId)` returns ENS subname
- Store ENS mappings in user storage
- Track assignment history (who assigned, when, why)
- Add validation for ENS subname format

**Acceptance Criteria:**
- ENS service can assign and revoke memberships
- Membership data is stored in user storage
- Can verify if user has ENS membership
- Assignment history is tracked

**Dependencies:** T1.3 (User Storage)

**Estimated Effort:** 4 hours

**Technical Notes:**
- ENS subname format: `username.community.eth` or similar
- Store as string in user storage
- No on-chain verification needed (backend-managed)

---

### T6.2: Create ENS Admin Commands
**Description:** Add Telegram bot commands for admins to manage ENS memberships.

**Tasks:**
- Create `src/services/telegram/commands/admin/assign-ens.ts`
- Create `src/services/telegram/commands/admin/revoke-ens.ts`
- Create `src/services/telegram/commands/admin/list-ens.ts`
- Implement admin authentication/authorization
- Add commands:
  - `/admin_assign_ens <telegram_user_id> <ens_subname>`
  - `/admin_revoke_ens <telegram_user_id> <reason>`
  - `/admin_list_ens` (list all ENS memberships)
- Register commands in bot
- Add admin user list in environment/config

**Acceptance Criteria:**
- Admins can assign ENS memberships
- Admins can revoke ENS memberships
- Admins can list all ENS memberships
- Non-admins cannot use admin commands
- Commands validate inputs

**Dependencies:** T6.1 (ENS Service), T1.6 (Environment Config)

**Estimated Effort:** 4 hours

**Technical Notes:**
- Store admin Telegram user IDs in environment or config file
- Check admin status before processing commands
- Log all admin actions for audit trail

---

### T6.3: Integrate ENS into User Verification
**Description:** Add ENS membership check to user verification service.

**Tasks:**
- Update `src/services/verification/user-verification.ts`
- Add ENS membership check to `verifyUser(walletAddress)` function
- Verification now requires:
  1. Circles group membership (on-chain)
  2. ENS membership (backend service)
- Return detailed verification status with both checks
- Update error messages to indicate which check failed
- Cache ENS verification results

**Acceptance Criteria:**
- User verification checks both Circles group and ENS
- Clear error messages indicate which requirement is missing
- Verification results are cached
- Loan requests require both verifications

**Dependencies:** T6.1 (ENS Service), T1.4 (User Verification)

**Estimated Effort:** 3 hours

---

### T6.4: Update Loan Request Flow with ENS Check
**Description:** Ensure loan request flow includes ENS verification.

**Tasks:**
- Update `src/services/telegram/commands/request-loan.ts`
- Verify ENS membership is checked before loan creation
- Show helpful message if ENS membership is missing
- Provide instructions on how to get ENS membership
- Update error handling for ENS verification failures

**Acceptance Criteria:**
- Loan requests check ENS membership
- Users are informed if ENS membership is missing
- Clear instructions are provided
- Flow is updated and tested

**Dependencies:** T6.3 (ENS Verification Integration), T2.1 (Request Loan Command)

**Estimated Effort:** 2 hours

---

### T6.5: Enhance ENS Membership Display
**Description:** Show ENS membership status in user profile and status commands.

**Tasks:**
- Update `/vouch_status` or create `/profile` command
- Display ENS subname if user has membership
- Show membership status (active, revoked)
- Display assignment date
- Format output clearly

**Acceptance Criteria:**
- Users can see their ENS membership status
- Information is displayed clearly
- Status is accurate

**Dependencies:** T6.1 (ENS Service)

**Estimated Effort:** 2 hours

---

### T6.6: Implement ENS Membership Application Flow
**Description:** Create flow for users to apply for ENS membership (requires 3 trusts from group members).

**Tasks:**
- Create `/apply_ens` command
- Check if user is Circles group member
- Check if user already has ENS membership
- Explain requirements (3 trusts from group members)
- Provide instructions on getting trusts
- Store application status
- Notify admins of new applications (optional)

**Acceptance Criteria:**
- Users can apply for ENS membership
- Requirements are clearly explained
- Application status is tracked
- Prevents duplicate applications

**Dependencies:** T6.1 (ENS Service), T1.4 (User Verification)

**Estimated Effort:** 3 hours

**Technical Notes:**
- Trust verification requires checking Circles trust graph
- May need Circles protocol API integration
- Admin approval process for applications

---

### T6.7: Add ENS Membership Restoration
**Description:** Allow admins to restore ENS membership after revocation.

**Tasks:**
- Update admin commands
- Add `/admin_restore_ens <telegram_user_id>` command
- Restore membership in user storage
- Clear revocation status
- Update user verification status
- Log restoration action

**Acceptance Criteria:**
- Admins can restore revoked memberships
- Membership status is updated correctly
- User can request loans again after restoration
- Restoration is logged

**Dependencies:** T6.2 (Admin Commands), T6.1 (ENS Service)

**Estimated Effort:** 2 hours

---

### T6.8: Integrate Complete ENS System
**Description:** Final integration and testing of complete ENS system.

**Tasks:**
- Test complete ENS workflow:
  - Application → Assignment → Verification → Revocation → Restoration
- Integrate ENS checks into all relevant flows
- Update documentation
- Add error handling
- Test admin commands
- Verify integration with loan request flow

**Acceptance Criteria:**
- Complete ENS system works end-to-end
- All components are integrated
- Documentation is updated
- System is tested and verified

**Dependencies:** All T6 tickets

**Estimated Effort:** 3 hours

---

## Dependencies
- Epic 1: Foundation
- Epic 2: Loan Request Flow
- Epic 3: Vouching System
- Epic 4: Loan Management
- Epic 5: Default Handling (for revocation foundation)

## Blockers
- None

## Technical Decisions
- ENS is completely backend-managed (no on-chain contract)
- Admin-only commands for membership management
- Membership requires 3 trusts from Circles group members
- Trust verification may require Circles protocol API integration

## Testing Strategy
- Unit tests for ENS service functions
- Manual testing of admin commands
- Test ENS verification in loan request flow
- Test membership application flow
- Test revocation and restoration
- Test integration with user verification

