# Loan Cycle Completion - Implementation Workflow

## Executive Summary

This document provides a structured implementation plan for completing the Inner Circles loan cycle. The plan is organized by architectural layers, showing clear dependencies, design patterns, and integration points.

**Current Status:** ~60% Complete  
**Remaining Work:** Core borrower operations, automation services, and enhanced UI components  
**Estimated Timeline:** 28-39 hours for complete implementation

---

## Architecture Overview

### System Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  (React Components - UI/UX)                                 │
│  - LoanRequestForm ✅                                         │
│  - LoanDetails ✅                                            │
│  - LoanActions ✅                                            │
│  - LoansList ✅                                              │
│  - LoanConfirmation ❌                                       │
│  - LoanDisbursement ❌                                       │
│  - LoanRepayment ❌                                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
│  (React Hooks - Business Logic)                             │
│  - useCreateLoanRequest ✅                                   │
│  - useVouchForLoan ✅                                        │
│  - useContributeToLoan ✅                                    │
│  - useLoanDetails ✅                                         │
│  - useConfirmLoanTerms ❌                                    │
│  - useDisburseLoan ❌                                        │
│  - useRepayLoan ❌                                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer                            │
│  (Pure Functions - Domain Logic)                             │
│  - Auto-Repayment Service ❌                                 │
│  - Grace Period Handler ❌                                   │
│  - Default Detection Service ❌                             │
│  - Event Listener Service ❌                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Integration Layer                         │
│  (External Services)                                        │
│  - Telegram Bot ✅ (notifications only)                     │
│  - Telegram Event Listener ❌                                │
│  - Circles SDK ✅ (partial)                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Infrastructure Layer                     │
│  (Smart Contract)                                            │
│  - InnerCirclesLendingMarket ✅ (complete)                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Current Implementation Status

### ✅ Completed Components

#### Smart Contract (100%)
- Complete loan lifecycle implementation
- All state transitions and business logic
- Event emissions for off-chain integration
- Interest rate calculation
- Repayment distribution logic

#### Hooks/Services (60%)
- `useCreateLoanRequest` - Create loan requests ✅
- `useCreateLoanRequestWithEvents` - Event-driven creation ✅
- `useLoanDetails` - Fetch loan data with polling ✅
- `useVouchForLoan` - Vouch for loans ✅
- `useContributeToLoan` - Contribute during crowdfunding ✅
- `useApproveToken` - Token approval handling ✅
- `useAllLoans` - List all loans ✅
- `useIsVoucher` - Check voucher status ✅
- `useLoanById` - Get loan by ID ✅
- `useTotalLoans` - Get total loan count ✅

#### UI Components (50%)
- `LoanRequestForm` - Create loan requests ✅
- `LoanDetails` - Display loan information ✅
- `LoanActions` - Contextual actions (vouch/contribute) ✅
- `LoansList` - List loans with filtering ✅

#### Infrastructure (70%)
- Telegram bot service (notification functions) ✅
- Wagmi configuration ✅
- Contract configuration ✅
- Circles SDK integration (partial) ✅

### ❌ Missing Components

#### Critical Path (Must Have for MVP)
1. **Borrower Operations**
   - `useConfirmLoanTerms` - Confirm loan after vouching
   - `useDisburseLoan` - Disburse fully funded loan
   - `useRepayLoan` - Repay loan (full/partial)
   - `useCalculateTotalOwed` - Calculate repayment amount

2. **Borrower UI Components**
   - `LoanConfirmation` - Review and confirm loan terms
   - `LoanDisbursement` - Disburse loan UI
   - `LoanRepayment` - Repay loan UI

3. **Event Integration**
   - Event listener service - Contract events → Telegram notifications

#### Important (Should Have)
4. **Automation Services**
   - Auto-repayment service - Check and execute repayments
   - Grace period handler - Handle grace period logic
   - Default detection service - Detect and mark defaults

5. **Enhanced UI**
   - Enhanced `LoanDetails` - Add voucher/lender lists, repayment tracking
   - Voucher list component
   - Lender list component
   - Repayment tracking component

#### Nice to Have
6. **Advanced Features**
   - Interest calculator component
   - Time remaining indicators
   - Telegram reaction-based vouching
   - Repayment history visualization

---

## Implementation Phases

### Phase 1: Core Borrower Operations (Critical Path)
**Priority:** 🔴 Critical  
**Estimated Effort:** 7-10 hours  
**Dependencies:** None (can start immediately)

#### 1.1 Confirm Loan Terms
**Files:**
- `src/services/loans/useConfirmLoanTerms.ts` (NEW)
- `src/components/loans/loan-confirmation.tsx` (NEW)

**Implementation Steps:**
1. Create `useConfirmLoanTerms` hook following existing hook pattern
2. Add validation: minimum 3 vouchers required
3. Integrate with contract `confirmLoanTerms` function
4. Create `LoanConfirmation` component
5. Add to `LoanDetails` component (show when state = Vouching and borrower)
6. Add success/error handling with toast notifications

**Acceptance Criteria:**
- ✅ Borrower can confirm loan terms after 3+ vouchers
- ✅ Interest rate is calculated and displayed
- ✅ Loan transitions to Crowdfunding state
- ✅ UI shows confirmation dialog with terms
- ✅ Success/error feedback provided

**Design Pattern:**
```typescript
// Hook follows existing pattern
useConfirmLoanTerms({
  onSuccess: () => refetch(),
  onError: (error) => toast.error(error.message)
})

// Component integrates with LoanDetails
{loan.state === LoanState.Vouching && isBorrower && (
  <LoanConfirmation loanId={loanId} loan={loan} />
)}
```

---

#### 1.2 Disburse Loan
**Files:**
- `src/services/loans/useDisburseLoan.ts` (NEW)
- `src/components/loans/loan-disbursement.tsx` (NEW)

**Implementation Steps:**
1. Create `useDisburseLoan` hook
2. Add validation: loan must be fully funded
3. Integrate with contract `disburseLoan` function
4. Create `LoanDisbursement` component
5. Add to `LoanDetails` component (show when state = Crowdfunding and fully funded)
6. Add success/error handling

**Acceptance Criteria:**
- ✅ Borrower can disburse fully funded loans
- ✅ Validates funding completeness
- ✅ Transfers CRC to borrower wallet
- ✅ Sets repayment deadlines
- ✅ Loan transitions to Funded state
- ✅ Success/error feedback provided

**Design Pattern:**
```typescript
// Hook pattern
useDisburseLoan({
  onSuccess: () => {
    refetch();
    router.push(`/credit/${loanId}`);
  }
})

// Component shows when ready
{loan.state === LoanState.Crowdfunding && 
 isFullyFunded && 
 isBorrower && (
  <LoanDisbursement loanId={loanId} loan={loan} />
)}
```

---

#### 1.3 Repay Loan
**Files:**
- `src/services/loans/useRepayLoan.ts` (NEW)
- `src/services/loans/useCalculateTotalOwed.ts` (NEW)
- `src/components/loans/loan-repayment.tsx` (NEW)

**Implementation Steps:**
1. Create `useCalculateTotalOwed` hook (read-only)
2. Create `useRepayLoan` hook
3. Add support for partial repayments
4. Integrate with contract `repayLoan` function
5. Create `LoanRepayment` component with:
   - Total owed display
   - Amount repaid tracking
   - Remaining balance
   - Repayment input field
6. Add to `LoanDetails` component (show when state = Funded)
7. Add success/error handling

**Acceptance Criteria:**
- ✅ Borrower can repay loans (full or partial)
- ✅ Calculates total owed correctly (principal + interest)
- ✅ Handles partial repayments
- ✅ Distributes to lenders in priority order
- ✅ Updates repayment tracking
- ✅ Transitions to Repaid on full payment
- ✅ Shows repayment progress

**Design Pattern:**
```typescript
// Calculate total owed
const { totalOwed, isLoading: isLoadingOwed } = useCalculateTotalOwed(loanId);

// Repay loan
const { repayLoan, isPending } = useRepayLoan({
  onSuccess: () => refetch()
});

// Component with repayment UI
<LoanRepayment 
  loanId={loanId}
  loan={loan}
  totalOwed={totalOwed}
  onRepaymentSuccess={() => refetch()}
/>
```

---

### Phase 2: Event Integration & Automation
**Priority:** 🟡 Important  
**Estimated Effort:** 9-12 hours  
**Dependencies:** Phase 1 (for event triggers)

#### 2.1 Event Listener Service
**Files:**
- `src/services/telegram/event-listener.ts` (NEW)
- `src/app/api/telegram/events/route.ts` (NEW)

**Implementation Steps:**
1. Create event listener service using Wagmi's `useWatchContractEvent`
2. Map contract events to Telegram notifications:
   - `LoanRequestCreated` → `notifyLoanRequest`
   - `Vouched` → `notifyVouchingAccepted`
   - `LoanConfirmed` → `notifyLoanAccepted`
   - `Crowdfunded` → `notifyFundingObtained`
   - `LoanFunded` → `notifyLoanAccepted`
   - `RepaymentMade` → `notifyLoanRepaid`
   - `LoanDefaulted` → `notifyLoanDefault`
   - `MembershipSuspended` → `notifyTrustCancellationRecommendation`
3. Create API route for server-side event listening
4. Add error handling and retry logic
5. Add event deduplication (prevent duplicate notifications)

**Acceptance Criteria:**
- ✅ All contract events trigger Telegram notifications
- ✅ Events are deduplicated
- ✅ Error handling and retries implemented
- ✅ Can run as background service

**Design Pattern:**
```typescript
// Service pattern (pure function)
export async function listenToLoanEvents(
  contractAddress: Address,
  onEvent: (event: ContractEvent) => void
) {
  // Event listening logic
  // Call onEvent for each event
}

// API route
export async function POST(request: Request) {
  await listenToLoanEvents(contractAddress, async (event) => {
    await handleEvent(event);
  });
}
```

---

#### 2.2 Auto-Repayment Service
**Files:**
- `src/services/loans/auto-repayment-service.ts` (NEW)
- `src/app/api/loans/check-repayments/route.ts` (NEW)

**Implementation Steps:**
1. Create service to scan funded loans past repayment deadline
2. Check borrower CRC balance using public client
3. If sufficient balance, execute repayment using `useRepayLoan` logic
4. Handle partial repayments if balance is insufficient
5. Create API route for scheduled execution (cron job)
6. Add logging and error handling

**Acceptance Criteria:**
- ✅ Scans loans past repayment deadline
- ✅ Checks borrower balances
- ✅ Executes repayments automatically
- ✅ Handles partial repayments
- ✅ Can be scheduled (cron job)
- ✅ Logs all actions

**Design Pattern:**
```typescript
// Service (pure function, no React hooks)
export async function checkAndExecuteRepayments(
  publicClient: PublicClient,
  walletClient: WalletClient,
  contractAddress: Address
) {
  // 1. Get all funded loans
  // 2. Filter loans past repayment deadline
  // 3. For each loan:
  //    - Check borrower balance
  //    - If sufficient, execute repayment
  //    - If partial, execute partial repayment
  // 4. Return results
}

// API route (scheduled)
export async function GET() {
  const results = await checkAndExecuteRepayments(...);
  return Response.json(results);
}
```

---

#### 2.3 Grace Period Handler
**Files:**
- `src/services/loans/grace-period-handler.ts` (NEW)
- `src/app/api/loans/grace-period/route.ts` (NEW)

**Implementation Steps:**
1. Create service to detect loans in grace period
2. Send Telegram notifications to borrowers
3. Attempt collection after grace period ends
4. Trigger default if still unpaid
5. Create API route for scheduled execution

**Acceptance Criteria:**
- ✅ Detects loans in grace period
- ✅ Sends Telegram notifications
- ✅ Attempts collection after grace period
- ✅ Triggers default if unpaid

---

#### 2.4 Default Detection Service
**Files:**
- `src/services/loans/default-detection-service.ts` (NEW)
- `src/app/api/loans/check-defaults/route.ts` (NEW)

**Implementation Steps:**
1. Create service to scan loans past grace period
2. Check if loans are still unpaid
3. Call contract `markLoanAsDefaulted` function
4. Trigger Telegram notifications
5. Create API route for scheduled execution

**Acceptance Criteria:**
- ✅ Scans loans past grace period
- ✅ Marks loans as defaulted
- ✅ Triggers notifications
- ✅ Can be scheduled

---

### Phase 3: Enhanced UI Components
**Priority:** 🟡 Important  
**Estimated Effort:** 12-17 hours  
**Dependencies:** Phase 1 (for data display)

#### 3.1 Enhanced Loan Details
**Files:**
- `src/components/loans/loan-details.tsx` (UPDATE)

**Enhancements:**
1. Add voucher list section
2. Add lender list section
3. Add repayment tracking section
4. Add time remaining indicators
5. Add interest calculation breakdown
6. Add repayment deadline countdown
7. Add grace period indicator

**Design Pattern:**
```typescript
// Enhanced component structure
<LoanDetails>
  <LoanHeader />
  <LoanSummary />
  <VoucherList loanId={loanId} />
  <LenderList loanId={loanId} />
  <RepaymentTracking loanId={loanId} />
  <TimeRemaining loan={loan} />
  <LoanActions />
</LoanDetails>
```

---

#### 3.2 Voucher List Component
**Files:**
- `src/services/loans/useVouchers.ts` (NEW)
- `src/components/loans/voucher-list.tsx` (NEW)

**Implementation:**
- Hook to fetch vouchers from contract
- Component to display voucher addresses and amounts
- Show voucher timestamps

---

#### 3.3 Lender List Component
**Files:**
- `src/services/loans/useLenders.ts` (NEW)
- `src/services/loans/useLenderContributions.ts` (NEW)
- `src/components/loans/lender-list.tsx` (NEW)

**Implementation:**
- Hooks to fetch lenders and contributions
- Component to display lender addresses, amounts
- Distinguish vouchers vs external lenders

---

#### 3.4 Repayment Tracking Component
**Files:**
- `src/components/loans/repayment-tracking.tsx` (NEW)

**Implementation:**
- Display total owed
- Display amount repaid
- Display remaining balance
- Visual progress bar
- Repayment deadline countdown

---

## Implementation Order & Dependencies

### Critical Path (Sequential)
```
Phase 1.1 (Confirm Loan Terms)
    ↓
Phase 1.2 (Disburse Loan)
    ↓
Phase 1.3 (Repay Loan)
    ↓
Phase 2.1 (Event Listener)
    ↓
Phase 2.2 (Auto-Repayment)
    ↓
Phase 2.3 (Grace Period)
    ↓
Phase 2.4 (Default Detection)
```

### Parallel Work Opportunities
- Phase 3 components can be built in parallel after Phase 1
- Enhanced UI components are independent of each other
- Telegram reaction handler (optional) can be done anytime

---

## Design Patterns & Conventions

### Hook Pattern
All hooks follow this consistent pattern:
```typescript
interface UseXxxOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

function useXxx(options: UseXxxOptions = {}) {
  // Wagmi hooks
  // Error handling with toast
  // Success callbacks
  // Return: { action, hash, isPending, isSuccess, isError, error, reset }
}
```

### Component Pattern
All components follow this structure:
```typescript
interface XxxProps {
  loanId: bigint;
  loan?: Loan;
  className?: string;
  onActionSuccess?: () => void;
}

export function Xxx({ loanId, loan, className, onActionSuccess }: XxxProps) {
  // Hooks
  // Loading states
  // Error states
  // Success states
  // Render
}
```

### Service Pattern
All services are pure functions (no React hooks):
```typescript
export async function xxxService(params: XxxParams): Promise<XxxResult> {
  // Validation
  // Business logic
  // Error handling
  // Return result
}
```

---

## Integration Points

### Contract Events → Telegram Notifications
```
LoanRequestCreated → notifyLoanRequest
Vouched → notifyVouchingAccepted
LoanConfirmed → notifyLoanAccepted
Crowdfunded → notifyFundingObtained
LoanFunded → notifyLoanAccepted
RepaymentMade → notifyLoanRepaid
LoanDefaulted → notifyLoanDefault
MembershipSuspended → notifyTrustCancellationRecommendation
```

### UI State Management
- **TanStack Query**: Data fetching and caching
- **Wagmi Hooks**: Contract interactions
- **React State**: UI-only state
- **Callbacks**: Parent-child communication

### Error Handling Strategy
- **Toast Notifications**: User feedback
- **Error Boundaries**: Component-level errors
- **Retry Logic**: Network/contract errors
- **Graceful Degradation**: Missing data

---

## Testing Strategy

### Unit Tests
- Hook logic (mock Wagmi)
- Utility functions
- Service functions
- Component rendering

### Integration Tests
- Contract interactions
- Event handling
- Telegram notifications
- State transitions

### E2E Tests
- Complete loan flow
- Borrower actions
- Lender actions
- Error scenarios

---

## Deployment Considerations

### Environment Variables
```env
NEXT_PUBLIC_LENDING_MARKET_ADDRESS=0x...
NEXT_PUBLIC_CRC_TOKEN_ADDRESS=0x...
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
CIRCLES_GROUP_ADDRESS=0xa646fc7956376a641d30448a0473348bcc5638e5
```

### API Routes
- `/api/loans/check-repayments` - Auto-repayment checker
- `/api/loans/grace-period` - Grace period handler
- `/api/loans/check-defaults` - Default detection
- `/api/telegram/events` - Event listener

### Scheduled Tasks
- Auto-repayment checker: Every hour
- Grace period handler: Every 6 hours
- Default detection: Daily

---

## Timeline & Milestones

### Week 1: Core Operations (MVP)
- ✅ Phase 1.1: Confirm Loan Terms (2-3 hours)
- ✅ Phase 1.2: Disburse Loan (2-3 hours)
- ✅ Phase 1.3: Repay Loan (3-4 hours)
- **Total: 7-10 hours**

### Week 2: Integration & Automation
- ✅ Phase 2.1: Event Listener (4-5 hours)
- ✅ Phase 2.2: Auto-Repayment (4-5 hours)
- ✅ Phase 2.3: Grace Period (2-3 hours)
- ✅ Phase 2.4: Default Detection (3-4 hours)
- **Total: 13-17 hours**

### Week 3: Enhanced Features
- ✅ Phase 3.1: Enhanced Loan Details (3-4 hours)
- ✅ Phase 3.2: Voucher List (2 hours)
- ✅ Phase 3.3: Lender List (2-3 hours)
- ✅ Phase 3.4: Repayment Tracking (2-3 hours)
- **Total: 9-12 hours**

**Total Estimated Effort: 29-39 hours**

---

## Next Steps

1. **Start with Phase 1.1** - Confirm Loan Terms (critical path)
2. **Follow sequential order** - Dependencies are clearly marked
3. **Test incrementally** - Test each component as it's built
4. **Use existing patterns** - Follow established code conventions
5. **Document deviations** - Note any changes from this plan

---

## Notes

- All implementations should follow existing code patterns
- Use TypeScript strictly (no `any` types)
- Follow the design system (Shadcn UI)
- Test incrementally as you build
- Document any deviations from the plan
- Consider using React Query for complex data fetching
- Use Wagmi hooks for all contract interactions
- Keep services pure (no React hooks in services)

