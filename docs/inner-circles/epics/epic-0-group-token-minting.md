# Epic 0: Group Token Minting & Member Management

## Description

Establish the foundational member management system and enable CRC group token minting functionality. This epic creates the data structure for group members and implements token conversion from personal CRC tokens to group CRC tokens using the Circles SDK. This must be completed before Epic 1 as it provides the member data structure that other epics depend on.

## Acceptance Criteria

- [ ] Group member data structure is defined and implemented
- [ ] Member storage system can store and retrieve member data
- [ ] Circles SDK is integrated for group token operations
- [ ] Users can convert personal CRC to group CRC tokens via Telegram bot
- [ ] Member list is maintained and synchronized
- [ ] All member data fields are properly stored and validated

## Tickets

### T0.1: Design Group Member Data Structure

**Description:** Design and define the TypeScript interfaces for group member data.

**Tasks:**

- Create `src/services/storage/types.ts` or `src/types/member.ts`
- Define `GroupMember` interface with fields:
  - `telegramUserId: number` - Telegram user ID
  - `telegramHandle: string` - Telegram username/handle
  - `circlesAddress: string` - Circles protocol address (Safe wallet)
  - `circlesUsername?: string` - Circles username (optional)
  - `ensSubname?: string` - Assigned ENS subname (optional)
  - `eoaWallet?: string` - EOA wallet address (optional)
  - `joinedAt: Date` - Timestamp when member joined
  - `lastUpdated: Date` - Last update timestamp
- Add validation functions for each field
- Document data structure in code comments

**Acceptance Criteria:**

- TypeScript interface is defined with all required fields
- Optional fields are properly marked
- Validation functions exist for data integrity
- Documentation is clear and complete

**Dependencies:** None

**Estimated Effort:** 2 hours

**Technical Notes:**

- Use TypeScript interfaces (not types) per project conventions
- Circles address is the Safe wallet address (not EOA)
- EOA wallet is separate and optional (for signing transactions)
- Consider adding indexes for fast lookups (telegramUserId, circlesAddress)

---

### T0.2: Create Member Storage Service

**Description:** Implement storage service for group member data with CRUD operations.

**Tasks:**

- Create `src/services/storage/member-storage.ts`
- Implement functions:
  - `addMember(member: GroupMember): Promise<void>`
  - `getMember(telegramUserId: number): Promise<GroupMember | null>`
  - `getMemberByCirclesAddress(address: string): Promise<GroupMember | null>`
  - `updateMember(telegramUserId: number, updates: Partial<GroupMember>): Promise<void>`
  - `listMembers(): Promise<GroupMember[]>`
  - `removeMember(telegramUserId: number): Promise<void>`
- Add data persistence (JSON file or database)
- Implement data validation before storage
- Add error handling for storage operations

**Acceptance Criteria:**

- Can add, retrieve, update, and remove members
- Data persists across bot restarts
- Validation prevents invalid data
- Error handling is comprehensive
- Can query by Telegram ID or Circles address

**Dependencies:** T0.1 (Data Structure)

**Estimated Effort:** 4 hours

**Technical Notes:**

- For MVP: Use JSON file storage in `data/members.json`
- Consider SQLite for production
- Validate Circles address format (checksum)
- Validate Telegram user ID is positive number
- Store timestamps as ISO strings for JSON compatibility

---

### T0.3: Integrate Circles SDK

**Description:** Install and configure Circles SDK for group token operations.

**Tasks:**

- Research and identify Circles SDK package (or API)
- Install Circles SDK dependency
- Create `src/services/circles/circles-service.ts`
- Configure SDK with:
  - Gnosis Chain RPC URL
  - Group address (0xa646fc7956376a641d30448a0473348bcc5638e5)
  - Network configuration
- Add environment variables:
  - `CIRCLES_GROUP_ADDRESS` (already exists)
  - `CIRCLES_API_URL` (if using API instead of SDK)
  - `GNOSIS_RPC_URL` (for Circles operations)
- Create base service structure for Circles operations

**Acceptance Criteria:**

- Circles SDK is installed and configured
- Service can connect to Circles protocol
- Environment variables are documented
- Base service structure is ready for token operations

**Dependencies:** None

**Estimated Effort:** 3 hours

**Technical Notes:**

- Circles protocol may use GraphQL API or direct contract calls
- May need to use viem for direct contract interactions
- Group address: 0xa646fc7956376a641d30448a0473348bcc5638e5 (Frutero Club)
- Check Circles documentation for SDK/API approach

---

### T0.4: Implement Group Token Minting Service

**Description:** Create service to handle conversion of personal CRC tokens to group CRC tokens.

**Tasks:**

- Create `src/services/circles/token-minting-service.ts`
- Implement `mintGroupTokens(personalCrcAddress: string, amount: bigint): Promise<string>` function
- Use Circles SDK/API to:
  - Check if user is group member (verify membership)
  - Get user's personal CRC balance
  - Transfer personal CRC to group vault (1:1 conversion)
  - Mint equivalent group CRC tokens to user
- Handle transaction signing (user signs via wallet)
- Return transaction hash
- Add error handling:
  - User not a group member
  - Insufficient personal CRC balance
  - Transaction failures
  - Network errors

**Acceptance Criteria:**

- Can convert personal CRC to group CRC
- Verifies user is group member before minting
- Handles all error cases gracefully
- Returns transaction hash for tracking
- Conversion rate is 1:1 (personal CRC → group CRC)

**Dependencies:** T0.3 (Circles SDK Integration), T0.2 (Member Storage)

**Estimated Effort:** 6 hours

**Technical Notes:**

- Conversion requires:
  1. User approves personal CRC spending (if needed)
  2. Transfer personal CRC to group vault
  3. Mint group tokens to user's address
- User must sign transaction (bot prepares, user signs)
- Group tokens are ERC20 tokens minted by group contract
- May need to interact with group's Safe wallet contract

---

### T0.5: Create Mint Group Tokens Command

**Description:** Add Telegram bot command for users to mint group tokens.

**Tasks:**

- Create `src/services/telegram/commands/mint-group-tokens.ts`
- Implement command handler for `/mint_tokens <amount>`
- Validate user is in member storage
- Get user's Circles address from member data
- Call token minting service
- Show transaction preparation instructions
- Display transaction hash after completion
- Handle errors with clear messages

**Acceptance Criteria:**

- Users can call `/mint_tokens <amount>` command
- Command validates user is a member
- Transaction is prepared and user can sign
- Clear success/error messages
- Transaction hash is displayed

**Dependencies:** T0.4 (Token Minting Service), T0.2 (Member Storage)

**Estimated Effort:** 3 hours

**Technical Notes:**

- Amount should be in CRC (with 18 decimals)
- User needs to sign transaction (wallet integration or manual)
- Consider adding balance check before minting
- Show user's current personal CRC balance

---

### T0.6: Create Member Registration Command

**Description:** Add command for users to register as group members with their Circles information.

**Tasks:**

- Create `src/services/telegram/commands/register-member.ts`
- Implement command handler for `/register_member`
- Create interactive flow to collect:
  - Circles address (required)
  - Circles username (optional)
  - EOA wallet (optional)
- Validate Circles address format
- Verify user is actually a member of the Circles group (on-chain check)
- Store member data in member storage
- Link Telegram user ID to Circles address
- Show confirmation message

**Acceptance Criteria:**

- Users can register via `/register_member` command
- All required fields are collected
- Circles address is validated
- Group membership is verified on-chain
- Member data is stored correctly
- Duplicate registrations are handled

**Dependencies:** T0.2 (Member Storage), T0.3 (Circles SDK)

**Estimated Effort:** 4 hours

**Technical Notes:**

- Verify group membership by checking Circles trust graph
- May need Circles API to check if address is group member
- Store Telegram handle from `ctx.from.username`
- Prevent duplicate registrations (check if already exists)

---

### T0.7: Create Member Profile Command

**Description:** Add command to display user's member profile and token balances.

**Tasks:**

- Create `src/services/telegram/commands/member-profile.ts`
- Implement command handler for `/profile` or `/member_profile`
- Display:
  - Telegram handle and ID
  - Circles address and username
  - ENS subname (if assigned)
  - EOA wallet (if linked)
  - Personal CRC balance
  - Group CRC balance
  - Member since date
- Format output clearly with emojis
- Handle users not registered as members

**Acceptance Criteria:**

- Users can view their profile
- All member data is displayed
- Token balances are shown
- Format is clear and readable
- Non-members get helpful message

**Dependencies:** T0.2 (Member Storage), T0.3 (Circles SDK)

**Estimated Effort:** 3 hours

---

### T0.8: Implement Member List Management

**Description:** Create admin commands and utilities to manage member list.

**Tasks:**

- Create `src/services/telegram/commands/admin/list-members.ts`
- Create `src/services/telegram/commands/admin/update-member.ts`
- Add admin commands:
  - `/admin_list_members` - List all registered members
  - `/admin_update_member <telegram_id> <field> <value>` - Update member data
  - `/admin_remove_member <telegram_id>` - Remove member
- Add admin authentication
- Implement member synchronization (sync with on-chain group members)
- Add member validation utilities

**Acceptance Criteria:**

- Admins can list all members
- Admins can update member data
- Admins can remove members
- Member list can be synchronized with on-chain data
- Admin commands are protected

**Dependencies:** T0.2 (Member Storage), T0.3 (Circles SDK)

**Estimated Effort:** 4 hours

**Technical Notes:**

- Store admin Telegram user IDs in environment/config
- Sync with Circles group members periodically
- Consider background job to sync member list

---

### T0.9: Integrate Member Data with Existing Services

**Description:** Update existing user storage to use new member data structure.

**Tasks:**

- Review Epic 1 user storage design
- Integrate member storage with user storage (or merge)
- Update wallet linking to use member data structure
- Ensure Circles address is primary identifier
- Update all services that reference user data
- Maintain backward compatibility if needed

**Acceptance Criteria:**

- Member data structure is integrated
- Existing services use member data
- No breaking changes to existing functionality
- Data migration path exists (if needed)

**Dependencies:** T0.2 (Member Storage), Epic 1 (User Storage - future)

**Estimated Effort:** 3 hours

**Technical Notes:**

- May need to merge member storage with user storage from Epic 1
- Consider migration strategy for existing data
- Ensure Circles address is used consistently

---

## Dependencies

- None (Epic 0 is foundational and must be completed first)

## Blockers

- None

## Technical Decisions

- Member data structure includes all required fields for Circles integration
- Circles address (Safe wallet) is primary identifier
- EOA wallet is separate and optional (for transaction signing)
- Token conversion is 1:1 (personal CRC → group CRC)
- Member storage uses JSON file for MVP (can upgrade to database)
- Circles SDK integration depends on available SDK/API

## Testing Strategy

- Unit tests for member data structure validation
- Unit tests for member storage operations
- Integration tests for Circles SDK/API calls (testnet)
- Manual testing of minting flow
- Test member registration and profile commands
- Test error scenarios (invalid addresses, non-members, etc.)

## Notes

- This epic must be completed before Epic 1
- Member data structure will be used by all subsequent epics
- Circles SDK/API integration may require research into available tools
- Token minting requires user to sign transactions (wallet integration needed)
- Group membership verification is critical for security
