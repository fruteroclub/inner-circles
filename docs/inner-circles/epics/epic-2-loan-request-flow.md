# Epic 2: Loan Request Flow

## Description
Implement the complete loan request flow through the Telegram bot, including user verification, loan creation via smart contract, posting to Telegram group, and tracking loan-to-message mappings. This epic enables users to request loans and triggers the vouching phase.

## Acceptance Criteria
- [ ] Users can request loans via `/request_loan` command
- [ ] User verification (Circles group membership) is checked before loan creation
- [ ] Loan requests are created on-chain via InnerCirclesLendingMarket contract
- [ ] Loan requests are posted to Telegram group with proper formatting
- [ ] Loan-to-message mapping is stored for reaction tracking
- [ ] Users receive confirmation with loanId and vouching period information

## Tickets

### T2.1: Enhance Request Loan Command
**Description:** Update `/request_loan` command to include interactive flow with amount input and verification.

**Tasks:**
- Update `src/services/telegram/commands/request-loan.ts`
- Add interactive conversation flow for loan amount input
- Parse amount from command arguments or prompt user
- Validate amount (must be positive, reasonable limits)
- Integrate user verification service
- Show helpful error messages if verification fails

**Acceptance Criteria:**
- Command accepts amount as argument: `/request_loan <amount>`
- If no amount provided, prompts user interactively
- Validates amount format and range
- Checks user verification before proceeding
- Clear error messages for invalid inputs

**Dependencies:** T1.4 (User Verification Service), T1.3 (User Storage)

**Estimated Effort:** 3 hours

---

### T2.2: Implement Loan Creation Service
**Description:** Create service to handle loan request creation via smart contract interaction.

**Tasks:**
- Create `src/services/loans/loan-service.ts`
- Implement `createLoanRequest(walletAddress, amount, termDuration)` function
- Use contract service to call `createLoanRequest` on InnerCirclesLendingMarket
- Handle transaction signing (users sign via wallet - bot prepares transaction)
- Parse and return loanId from contract response
- Handle contract errors and revert reasons
- Store loan metadata in loan storage

**Acceptance Criteria:**
- Can create loan requests on-chain via contract
- Returns loanId after successful creation
- Handles contract errors gracefully
- Loan data is stored locally for tracking

**Dependencies:** T1.2 (Contract Service), T2.3 (Loan Storage)

**Estimated Effort:** 5 hours

**Technical Notes:**
- For MVP: Fixed 30-day term duration (DEFAULT_TERM_DURATION from contract)
- Transaction signing will be handled by user's wallet (web3 integration or manual signing)
- Consider using viem's `prepareTransactionRequest` for transaction preparation

---

### T2.3: Create Loan Storage System
**Description:** Implement storage system to track loans and their associated Telegram messages.

**Tasks:**
- Create `src/services/storage/loan-storage.ts`
- Implement functions: `storeLoan(loanId, telegramUserId, loanData)`, `getLoan(loanId)`, `getUserLoans(telegramUserId)`
- Store loan-to-message mapping: `linkLoanMessage(loanId, messageId, chatId)`
- Store loan state transitions
- Add data persistence (JSON file or database)

**Acceptance Criteria:**
- Can store and retrieve loan data by loanId
- Can retrieve all loans for a user
- Loan-to-message mapping is stored and retrievable
- Data persists across bot restarts

**Dependencies:** T1.3 (User Storage - for reference)

**Estimated Effort:** 2 hours

**Technical Notes:**
- Store loan state: Vouching, Crowdfunding, Funded, Repaid, Defaulted
- Track Telegram message ID and chat ID for group posts

---

### T2.4: Implement Group Posting Functionality
**Description:** Create service to post loan requests to the Frutero Club Telegram group.

**Tasks:**
- Create `src/services/telegram/group-operations.ts`
- Implement `postLoanRequest(loanId, borrowerInfo, amount, deadline)` function
- Format loan request message with:
  - Loan ID
  - Borrower information (username or wallet address)
  - Amount requested (in CRC)
  - Vouching deadline (2 days from creation)
  - Instructions to react with 👍 emoji
- Post message to group using Telegram group ID from environment
- Store message ID in loan storage
- Handle posting errors (bot not in group, permissions, etc.)

**Acceptance Criteria:**
- Loan requests are posted to Telegram group
- Message format is clear and informative
- Message ID is stored for reaction tracking
- Handles errors gracefully (permissions, group not found)

**Dependencies:** T2.3 (Loan Storage), T1.6 (Environment Config)

**Estimated Effort:** 3 hours

**Technical Notes:**
- Use `bot.telegram.sendMessage` with group chat ID
- Format message with Markdown for readability
- Include emoji for visual appeal (📋 for loan request)

---

### T2.5: Integrate Loan Request Flow
**Description:** Connect all components to create complete loan request flow.

**Tasks:**
- Update `request-loan.ts` command handler to use loan service
- Integrate verification check before loan creation
- Call group posting after successful loan creation
- Store loan data and message mapping
- Return confirmation message to user with loanId and vouching period
- Handle errors at each step with appropriate user messages

**Acceptance Criteria:**
- Complete flow works end-to-end
- User receives confirmation with loanId
- Loan is posted to group
- All data is stored correctly
- Error handling provides clear feedback

**Dependencies:** T2.1, T2.2, T2.3, T2.4

**Estimated Effort:** 3 hours

---

## Dependencies
- Epic 1: Foundation (all tickets)

## Blockers
- None

## Technical Decisions
- Fixed 30-day term duration for MVP (configurable later)
- Loan amount validation: minimum 1 CRC, maximum to be determined
- Transaction signing: Users will need to sign transactions (wallet integration or manual process)
- Group posting: Bot must be added to group and have permission to post

## Testing Strategy
- Unit tests for loan service functions
- Integration tests for contract interaction (testnet)
- Manual testing of complete loan request flow
- Test group posting with test group
- Test error scenarios (invalid amounts, verification failures, contract errors)

