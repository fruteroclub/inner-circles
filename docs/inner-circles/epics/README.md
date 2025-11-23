# Inner Circles Telegram Bot - Implementation Epics

This directory contains the epic documentation for implementing the complete Telegram bot workflow for the Inner Circles Credit System. Each epic represents a major phase of development with detailed tickets for project management.

## Epic Overview

### [Epic 0: Group Token Minting & Member Management](./epic-0-group-token-minting.md)
**Status:** Ready for implementation  
**Dependencies:** None  
**Estimated Total Effort:** ~32 hours

Establishes the foundational member management system and enables CRC group token minting functionality. This epic must be completed before Epic 1 as it provides the member data structure that other epics depend on.

**Key Deliverables:**
- Group member data structure
- Member storage service
- Circles SDK integration
- Group token minting service
- Member registration and profile commands
- Admin member management

---

### [Epic 1: Foundation](./epic-1-foundation.md)
**Status:** Ready for implementation  
**Dependencies:** None  
**Estimated Total Effort:** ~15 hours

Establishes the foundational infrastructure including backend service structure, contract interaction capabilities, user storage, and basic verification services.

**Key Deliverables:**
- Backend service architecture
- Contract interaction service (viem)
- User storage system
- Circles group membership verification
- Wallet linking command

---

### [Epic 2: Loan Request Flow](./epic-2-loan-request-flow.md)
**Status:** Ready for implementation  
**Dependencies:** Epic 1  
**Estimated Total Effort:** ~16 hours

Implements the complete loan request flow through the Telegram bot, including user verification, loan creation via smart contract, posting to Telegram group, and tracking.

**Key Deliverables:**
- Enhanced `/request_loan` command
- Loan creation service
- Loan storage system
- Group posting functionality
- Complete loan request workflow

---

### [Epic 3: Vouching System](./epic-3-vouching-system.md)
**Status:** Ready for implementation  
**Dependencies:** Epic 1, Epic 2  
**Estimated Total Effort:** ~19 hours

Implements the vouching system where Telegram group members can vouch for loan requests by reacting with an emoji, triggering on-chain contract interactions.

**Key Deliverables:**
- Reaction handler for 👍 emoji
- Vouching service with contract integration
- Interest rate calculator
- Voucher notifications
- Vouching period deadline tracking

---

### [Epic 4: Loan Management](./epic-4-loan-management.md)
**Status:** Ready for implementation  
**Dependencies:** Epic 1, Epic 2, Epic 3  
**Estimated Total Effort:** ~23 hours

Implements loan management features including enhanced loan status display, loan confirmation flow, repayment functionality, and grace period notification system.

**Key Deliverables:**
- Enhanced `/loan_status` command
- Loan confirmation flow
- Repayment functionality
- Grace period notifications
- Loan state monitoring
- Enhanced `/vouch_status` command

---

### [Epic 5: Default Handling](./epic-5-default-handling.md)
**Status:** Ready for implementation  
**Dependencies:** Epic 1, Epic 2, Epic 3, Epic 4  
**Estimated Total Effort:** ~20 hours

Implements default detection and handling for loans that are not repaid within the grace period, including trust revocation and notifications.

**Key Deliverables:**
- Default detection system
- Remove Trust recommendation posting
- ENS membership revocation (backend)
- Trust score penalization
- Voucher notifications for defaults

---

### [Epic 6: ENS Integration](./epic-6-ens-integration.md)
**Status:** Ready for implementation  
**Dependencies:** Epic 1, Epic 2, Epic 3, Epic 4, Epic 5  
**Estimated Total Effort:** ~23 hours

Implements ENS membership verification and management as a backend service managed entirely by the Telegram bot (no on-chain contract).

**Key Deliverables:**
- ENS service (backend-only)
- Admin commands for ENS management
- ENS integration into user verification
- ENS membership application flow
- Membership restoration functionality

---

## Implementation Order

Epics should be implemented sequentially:

1. **Epic 0: Group Token Minting & Member Management** - Must be completed first (foundational)
2. **Epic 1: Foundation** - Depends on Epic 0
3. **Epic 2: Loan Request Flow** - Depends on Epic 0 and 1
4. **Epic 3: Vouching System** - Depends on Epic 0, 1, and 2
5. **Epic 4: Loan Management** - Depends on Epic 0, 1, 2, and 3
6. **Epic 5: Default Handling** - Depends on Epic 0, 1, 2, 3, and 4
7. **Epic 6: ENS Integration** - Depends on all previous epics

## Total Estimated Effort

**Total:** ~148 hours across all 7 epics

## Epic Structure

Each epic document follows this structure:
- **Description:** Overview of the epic
- **Acceptance Criteria:** High-level requirements
- **Tickets:** Detailed tickets with:
  - Description
  - Tasks
  - Acceptance Criteria
  - Dependencies
  - Estimated Effort
  - Technical Notes
- **Dependencies:** Other epics this depends on
- **Blockers:** Known blockers
- **Technical Decisions:** Important architectural decisions
- **Testing Strategy:** How to test the epic

## Getting Started

1. Review the [Basic User Flow](../basic-user-flow.md) to understand the system
2. Start with **Epic 0: Group Token Minting & Member Management** (foundational)
3. Then proceed to Epic 1: Foundation
4. Work through epics sequentially
5. Update epic status as you progress
6. Track ticket completion within each epic

## Notes

- **Epic 0 must be completed first** - provides member data structure used by all other epics
- ENS integration is handled as a backend service only (no on-chain contract)
- Contract deployment chain may not be Gnosis Chain (check environment variables)
- MVP uses in-memory/file-based storage (can upgrade to database later)
- All contract interactions use viem
- Circles SDK integration required for group token operations
- TypeScript strict mode for type safety

