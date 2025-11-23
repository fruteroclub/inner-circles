# Loan Request Flow - Development Tickets

This directory contains all development tickets for implementing the Loan Request flow (Step 2) of the Inner Circles Credit System.

## Ticket Overview

| Ticket | Title | Priority | Status | Dependencies |
|--------|-------|----------|--------|--------------|
| [01](./01-types-and-config.md) | Type Definitions and Contract Configuration | 🔴 High | 📋 Todo | None |
| [02](./02-wagmi-config.md) | Update Wagmi Configuration for Gnosis Chain | 🔴 High | 📋 Todo | 01 |
| [03](./03-hook-create-loan-request.md) | Create useCreateLoanRequest Hook | 🔴 High | 📋 Todo | 01, 02 |
| [04](./04-hook-event-listening.md) | Create useCreateLoanRequestWithEvents Hook | 🔴 High | 📋 Todo | 03 |
| [05](./05-hook-loan-details.md) | Create useLoanDetails Hook | 🟡 Medium | 📋 Todo | 01, 02 |
| [06](./06-component-loan-request-form.md) | Create LoanRequestForm Component | 🔴 High | 📋 Todo | 04, 01 |
| [07](./07-component-loan-details.md) | Create LoanDetails Component | 🟡 Medium | 📋 Todo | 05, 01 |
| [08](./08-integration-page.md) | Integrate Loan Request Flow into Page | 🟡 Medium | 📋 Todo | 06, 07 |
| [09](./09-error-handling-improvements.md) | Enhanced Error Handling and Edge Cases | 🟢 Low | 📋 Todo | 03, 04, 06 |
| [10](./10-testing.md) | Testing and Quality Assurance | 🟡 Medium | 📋 Todo | All |

## Implementation Order

### Phase 1: Foundation (Critical Path)
1. **Ticket 01** - Types and Config (Foundation)
2. **Ticket 02** - Wagmi Config (Required for contract interactions)
3. **Ticket 03** - Base Hook (Core functionality)

### Phase 2: Core Features
4. **Ticket 04** - Event Listening Hook (Loan ID retrieval)
5. **Ticket 05** - Loan Details Hook (Can be done in parallel with 04)
6. **Ticket 06** - Form Component (User interface)

### Phase 3: Integration
7. **Ticket 07** - Loan Details Component (Can be done in parallel with 06)
8. **Ticket 08** - Page Integration (Brings everything together)

### Phase 4: Polish
9. **Ticket 09** - Error Handling (Enhancements)
10. **Ticket 10** - Testing (Quality assurance)

## Parallel Work Opportunities

- **Tickets 04 & 05** can be worked on in parallel (different hooks)
- **Tickets 06 & 07** can be worked on in parallel (different components)
- **Ticket 09** can be started after Ticket 03 is complete

## Estimated Total Effort

- **Phase 1**: ~4-6 hours
- **Phase 2**: ~9-12 hours
- **Phase 3**: ~5-7 hours
- **Phase 4**: ~9-12 hours

**Total**: ~27-37 hours

## Quick Start

1. Start with **Ticket 01** - This is the foundation for everything
2. Complete **Tickets 02-03** in sequence
3. Work on **Tickets 04-05** (can be parallel)
4. Build **Tickets 06-07** (can be parallel)
5. Integrate with **Ticket 08**
6. Polish with **Tickets 09-10**

## Design Reference

See the complete design document: [`../inner-circles/loan-request-design.md`](../inner-circles/loan-request-design.md)

## Status Legend

- 🔴 **High Priority** - Critical for MVP
- 🟡 **Medium Priority** - Important but not blocking
- 🟢 **Low Priority** - Nice to have, can be done later
- 📋 **Todo** - Not started
- 🚧 **In Progress** - Currently being worked on
- ✅ **Done** - Completed and verified
- ❌ **Blocked** - Cannot proceed due to dependency

## Notes

- All tickets follow the same structure for consistency
- Each ticket includes acceptance criteria and testing requirements
- Dependencies are clearly marked to prevent blocking
- Estimated effort is provided for planning purposes
- Tickets can be broken down further if needed for smaller PRs

