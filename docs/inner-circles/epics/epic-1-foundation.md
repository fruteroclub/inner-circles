# Epic 1: Foundation

## Description
Establish the foundational infrastructure for the Telegram bot workflow, including backend service structure, contract interaction capabilities, user storage, and basic verification services. This epic sets up the core architecture that all subsequent features will build upon.

## Acceptance Criteria
- [ ] Backend service structure is created and organized
- [ ] Contract service can interact with InnerCirclesLendingMarket contract using viem
- [ ] User storage system can map Telegram IDs to wallet addresses
- [ ] User verification service can check Circles group membership
- [ ] All services follow TypeScript best practices and error handling
- [ ] Environment variables are properly configured

## Tickets

### T1.1: Create Backend Service Structure
**Description:** Set up the directory structure and base files for backend services.

**Tasks:**
- Create `src/services/verification/` directory
- Create `src/services/loans/` directory
- Create `src/services/contracts/` directory
- Create `src/services/vouching/` directory
- Create `src/services/storage/` directory
- Add index files for each service module

**Acceptance Criteria:**
- All service directories exist with proper structure
- Index files export main service functions

**Dependencies:** None

**Estimated Effort:** 1 hour

---

### T1.2: Set Up Contract Interaction Service
**Description:** Create a service to interact with the InnerCirclesLendingMarket smart contract using viem.

**Tasks:**
- Install/verify viem is available
- Create `src/services/contracts/contract-service.ts`
- Configure viem client for contract deployment chain
- Import InnerCirclesLendingMarket ABI from `src/lib/contracts/InnerCirclesLendingMarketABI.ts`
- Implement contract read functions (getLoan, getVouchers, etc.)
- Add error handling for contract calls
- Add environment variables: `CHAIN_RPC_URL`, `CHAIN_ID`, `INNER_CIRCLES_LENDING_MARKET_ADDRESS`

**Acceptance Criteria:**
- Contract service can read loan data from contract
- Contract service can read voucher information
- Proper error handling for network/contract errors
- Environment variables are documented

**Dependencies:** None

**Estimated Effort:** 4 hours

**Technical Notes:**
- Use viem's `createPublicClient` for read operations
- Contract address and chain config should be environment-based
- Handle both testnet and mainnet scenarios

---

### T1.3: Create User Storage System
**Description:** Implement storage system to map Telegram user IDs to wallet addresses and store user data.

**Tasks:**
- Create `src/services/storage/user-storage.ts`
- Implement in-memory storage (MVP) or file-based persistence
- Add functions: `linkWallet(telegramId, walletAddress)`, `getWallet(telegramId)`, `getUser(telegramId)`
- Add wallet address validation
- Store user metadata (username, first_name, etc.)
- Add data persistence (JSON file or database)

**Acceptance Criteria:**
- Users can link their wallet address via Telegram ID
- Wallet addresses are validated (checksum format)
- User data persists across bot restarts
- Can retrieve user by Telegram ID

**Dependencies:** None

**Estimated Effort:** 3 hours

**Technical Notes:**
- For MVP: Use JSON file storage in `data/` directory
- Consider SQLite for production
- Validate addresses using viem's `isAddress` utility

---

### T1.4: Implement User Verification Service
**Description:** Create service to verify user eligibility (Circles group membership only - ENS deferred to Phase 6).

**Tasks:**
- Create `src/services/verification/user-verification.ts`
- Implement Circles group membership verification
- Add function: `verifyUser(walletAddress)` returns verification status
- Check if wallet is member of Circles group (address: 0xa646fc7956376a641d30448a0473348bcc5638e5)
- Return helpful error messages if not verified
- Cache verification results

**Acceptance Criteria:**
- Can verify if wallet belongs to Frutero Club Circles Group
- Returns clear verification status with error messages
- Verification results are cached to reduce on-chain calls
- Handles network errors gracefully

**Dependencies:** T1.2 (Contract Service)

**Estimated Effort:** 4 hours

**Technical Notes:**
- Circles group membership check requires on-chain query
- Use Circles protocol API or direct contract calls
- Cache results for 1 hour to reduce API calls
- Note: ENS verification will be added in Phase 6

---

### T1.5: Create Wallet Linking Command
**Description:** Add `/link_wallet` command to Telegram bot for users to link their wallet addresses.

**Tasks:**
- Create `src/services/telegram/commands/link-wallet.ts`
- Implement command handler
- Validate wallet address format
- Store mapping using user storage service
- Add success/error messages
- Register command in `src/services/telegram/bot.ts`

**Acceptance Criteria:**
- Users can link wallet via `/link_wallet <address>` command
- Invalid addresses are rejected with clear error
- Success message confirms wallet linking
- Wallet address is stored and retrievable

**Dependencies:** T1.3 (User Storage)

**Estimated Effort:** 2 hours

---

### T1.6: Environment Configuration
**Description:** Set up all required environment variables and configuration.

**Tasks:**
- Document all required environment variables
- Create `.env.example` file (if not exists)
- Add variables:
  - `TELEGRAM_BOT_TOKEN` (existing)
  - `TELEGRAM_GROUP_ID`
  - `CHAIN_RPC_URL`
  - `CHAIN_ID`
  - `INNER_CIRCLES_LENDING_MARKET_ADDRESS`
  - `CRC_TOKEN_ADDRESS`
  - `CIRCLES_GROUP_ADDRESS`
- Add validation script to check required env vars

**Acceptance Criteria:**
- All environment variables are documented
- `.env.example` file exists with all variables
- Validation script checks for required variables on startup

**Dependencies:** None

**Estimated Effort:** 1 hour

---

## Dependencies
- None (Foundation epic)

## Blockers
- None

## Technical Decisions
- Use in-memory/file-based storage for MVP (can upgrade to database later)
- viem for all contract interactions
- TypeScript strict mode for type safety
- ENS verification deferred to Phase 6 (backend service only)

## Testing Strategy
- Unit tests for storage functions
- Integration tests for contract service (testnet)
- Manual testing of wallet linking command

