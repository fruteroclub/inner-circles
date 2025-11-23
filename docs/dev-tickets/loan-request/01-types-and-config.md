# Ticket 01: Type Definitions and Contract Configuration

## Priority
🔴 **High** - Foundation for all other tickets

## Status
📋 **Todo**

## Description
Create TypeScript type definitions matching the contract structure and set up contract configuration for Wagmi integration.

## Dependencies
- None (Foundation ticket)

## Implementation Tasks

### 1. Create Type Definitions (`src/types/loans.ts`)
- [ ] Create `LoanState` enum matching contract `LoanState` enum
  - Requested = 0
  - Vouching = 1
  - Crowdfunding = 2
  - Funded = 3
  - Repaid = 4
  - Defaulted = 5
- [ ] Create `Loan` interface matching contract `Loan` struct
  - All fields with correct types (Address, bigint, etc.)
- [ ] Create `LoanRequestInput` interface for form inputs
- [ ] Create `LoanRequestResult` interface for hook return values
- [ ] Create `LOAN_CONSTANTS` object with:
  - DEFAULT_TERM_DURATION_DAYS: 30
  - DEFAULT_TERM_DURATION_SECONDS: 30 * 24 * 60 * 60
  - MIN_AMOUNT: 1n
  - MAX_AMOUNT: 1000000n * 10n ** 18n

### 2. Create Contract Configuration (`src/lib/contracts/config.ts`)
- [ ] Import `gnosis` chain from `viem/chains`
- [ ] Import `InnerCirclesLendingMarketABI`
- [ ] Create `LENDING_MARKET_CONTRACT_ADDRESS` from env var
- [ ] Add validation to throw error if address is missing
- [ ] Create `lendingMarketContract` config object for Wagmi
  - address
  - abi
  - chainId (gnosis.id)

### 3. Environment Setup
- [ ] Add `NEXT_PUBLIC_LENDING_MARKET_ADDRESS` to `.env.example`
- [ ] Document environment variable in README or env docs

## Acceptance Criteria
- [ ] All types are properly exported from `src/types/loans.ts`
- [ ] Contract configuration is properly typed and exported
- [ ] Environment variable validation works at build/runtime
- [ ] TypeScript compilation passes without errors
- [ ] All types match the contract structure exactly

## Testing
- [ ] Verify types compile correctly
- [ ] Verify contract config is properly typed
- [ ] Test environment variable validation

## Notes
- This is a foundation ticket - all other tickets depend on this
- Contract address can be a placeholder for now (will be updated when contract is deployed)
- Ensure all bigint types are used correctly (not number)

## Estimated Effort
**1-2 hours**

