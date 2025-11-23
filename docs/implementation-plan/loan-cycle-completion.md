# Loan Cycle Completion - Implementation Plan

## Current Progress Assessment

### ✅ Completed Components

**Smart Contract:**
- Complete loan lifecycle implementation
- All state transitions and business logic
- Event emissions for off-chain integration

**Hooks/Services:**
- `useCreateLoanRequest` - Create loan requests
- `useCreateLoanRequestWithEvents` - Event-driven loan creation
- `useLoanDetails` - Fetch loan data with polling
- `useVouchForLoan` - Vouch for loans
- `useContributeToLoan` - Contribute during crowdfunding
- `useApproveToken` - Token approval handling
- `useAllLoans` - List all loans
- `useIsVoucher` - Check voucher status
- `useLoanById` - Get loan by ID
- `useTotalLoans` - Get total loan count

**UI Components:**
- `LoanRequestForm` - Create loan requests
- `LoanDetails` - Display loan information
- `LoanActions` - Contextual actions (vouch/contribute)
- `LoansList` - List loans with filtering

**Infrastructure:**
- Telegram bot service (notification functions)
- Wagmi configuration
- Contract configuration

### ❌ Missing Components

**Core Loan Operations:**
- Confirm loan terms (borrower)
- Disburse loan (borrower)
- Repay loan (borrower)
- Check repayment eligibility
- Auto-repayment service

**Enhanced Data Display:**
- Voucher list component
- Lender list component
- Repayment history/tracking
- Interest calculation details
- Time remaining indicators

**Telegram Integration:**
- Reaction-based vouching handler
- Event listener service
- Notification triggers

**Backend Services:**
- Auto-repayment checker
- Grace period handler
- Default detection service
- ENS membership management integration

---

## Implementation Plan

### Phase 1: Core Loan Operations (Critical Path)

#### 1.1 Confirm Loan Terms Hook & Service
**Priority:** 🔴 High  
**Dependencies:** None  
**Estimated Effort:** 2-3 hours

**Files to Create:**
- `src/services/loans/useConfirmLoanTerms.ts`

**Implementation:**
```typescript
// Hook for borrower to confirm loan terms after vouching
// - Validates minimum vouchers (3)
// - Calculates interest rate
// - Transitions to Crowdfunding state
// - Emits events for Telegram notifications
```

**Acceptance Criteria:**
- ✅ Borrower can confirm loan terms
- ✅ Validates voucher count >= 3
- ✅ Calculates interest rate based on voucher count
- ✅ Transitions loan to Crowdfunding state
- ✅ Shows success/error feedback
- ✅ Triggers Telegram notification

---

#### 1.2 Disburse Loan Hook & Service
**Priority:** 🔴 High  
**Dependencies:** 1.1  
**Estimated Effort:** 2-3 hours

**Files to Create:**
- `src/services/loans/useDisburseLoan.ts`

**Implementation:**
```typescript
// Hook for borrower to disburse loan after full funding
// - Validates loan is fully funded
// - Transfers funds to borrower
// - Sets repayment deadline
// - Transitions to Funded state
```

**Acceptance Criteria:**
- ✅ Borrower can disburse fully funded loans
- ✅ Validates funding completeness
- ✅ Transfers CRC to borrower wallet
- ✅ Sets repayment deadline (30 days)
- ✅ Sets grace period deadline (37 days)
- ✅ Transitions to Funded state
- ✅ Triggers Telegram notification

---

#### 1.3 Repay Loan Hook & Service
**Priority:** 🔴 High  
**Dependencies:** 1.2  
**Estimated Effort:** 3-4 hours

**Files to Create:**
- `src/services/loans/useRepayLoan.ts`
- `src/services/loans/useCalculateTotalOwed.ts`

**Implementation:**
```typescript
// Hook for borrower to repay loan
// - Calculates total owed (principal + interest)
// - Supports partial repayments
// - Distributes repayment (external lenders → vouchers)
// - Updates repayment tracking
// - Handles full repayment → Repaid state
```

**Acceptance Criteria:**
- ✅ Borrower can repay loans (full or partial)
- ✅ Calculates total owed correctly
- ✅ Handles partial repayments
- ✅ Distributes to lenders in priority order
- ✅ Updates repayment tracking
- ✅ Transitions to Repaid on full payment
- ✅ Shows repayment progress
- ✅ Triggers Telegram notification

---

### Phase 2: Enhanced UI Components

#### 2.1 Loan Confirmation Component
**Priority:** 🟡 Medium  
**Dependencies:** 1.1  
**Estimated Effort:** 2-3 hours

**Files to Create:**
- `src/components/loans/loan-confirmation.tsx`

**Implementation:**
```typescript
// Component for borrower to review and confirm loan terms
// - Shows voucher count
// - Displays calculated interest rate
// - Shows loan amount and term
// - Confirmation button
// - Cancel option
```

**Features:**
- Interest rate calculation preview
- Voucher count display
- Loan terms summary
- Confirmation/Cancel actions

---

#### 2.2 Loan Disbursement Component
**Priority:** 🟡 Medium  
**Dependencies:** 1.2  
**Estimated Effort:** 2-3 hours

**Files to Create:**
- `src/components/loans/loan-disbursement.tsx`

**Implementation:**
```typescript
// Component for borrower to disburse loan
// - Shows funding status
// - Displays amount to be disbursed
// - Disbursement button
// - Success confirmation
```

**Features:**
- Funding progress indicator
- Amount to disburse display
- Disbursement action
- Success state

---

#### 2.3 Loan Repayment Component
**Priority:** 🟡 Medium  
**Dependencies:** 1.3  
**Estimated Effort:** 3-4 hours

**Files to Create:**
- `src/components/loans/loan-repayment.tsx`

**Implementation:**
```typescript
// Component for borrower to repay loan
// - Shows total owed
// - Displays amount repaid
// - Shows remaining balance
// - Repayment input/button
// - Partial repayment support
```

**Features:**
- Total owed calculation
- Amount repaid tracking
- Remaining balance display
- Repayment input field
- Full/partial repayment options
- Repayment history

---

#### 2.4 Voucher List Component
**Priority:** 🟢 Low  
**Dependencies:** None  
**Estimated Effort:** 2 hours

**Files to Create:**
- `src/services/loans/useVouchers.ts`
- `src/components/loans/voucher-list.tsx`

**Implementation:**
```typescript
// Hook to fetch vouchers for a loan
// Component to display voucher list
// - Voucher addresses
// - Voucher amounts (1 CRC each)
// - Voucher timestamps
```

---

#### 2.5 Lender List Component
**Priority:** 🟢 Low  
**Dependencies:** None  
**Estimated Effort:** 2-3 hours

**Files to Create:**
- `src/services/loans/useLenders.ts`
- `src/services/loans/useLenderContributions.ts`
- `src/components/loans/lender-list.tsx`

**Implementation:**
```typescript
// Hooks to fetch lenders and contributions
// Component to display lender list
// - Lender addresses
// - Contribution amounts
// - Voucher vs external lender distinction
// - Total contributions
```

---

#### 2.6 Enhanced Loan Details Component
**Priority:** 🟡 Medium  
**Dependencies:** 1.3, 2.4, 2.5  
**Estimated Effort:** 3-4 hours

**Files to Modify:**
- `src/components/loans/loan-details.tsx`

**Enhancements:**
- Add voucher list section
- Add lender list section
- Add repayment tracking section
- Add time remaining indicators
- Add interest calculation breakdown
- Add repayment deadline countdown
- Add grace period indicator

---

### Phase 3: Backend Services & Automation

#### 3.1 Auto-Repayment Service
**Priority:** 🟡 Medium  
**Dependencies:** 1.3  
**Estimated Effort:** 4-5 hours

**Files to Create:**
- `src/services/loans/auto-repayment-service.ts`
- `src/app/api/loans/check-repayments/route.ts`

**Implementation:**
```typescript
// Service to check and execute auto-repayments
// - Scans funded loans past repayment deadline
// - Checks borrower CRC balance
// - Executes repayment if sufficient funds
// - Handles partial repayments
// - Updates loan state
```

**Features:**
- Cron job or scheduled task
- Balance checking
- Automatic repayment execution
- Partial repayment handling
- Event emission for notifications

---

#### 3.2 Grace Period Handler
**Priority:** 🟡 Medium  
**Dependencies:** 3.1  
**Estimated Effort:** 2-3 hours

**Files to Create:**
- `src/services/loans/grace-period-handler.ts`
- `src/app/api/loans/grace-period/route.ts`

**Implementation:**
```typescript
// Service to handle grace period logic
// - Detects loans in grace period
// - Sends Telegram notifications
// - Attempts collection after grace period
// - Triggers default if still unpaid
```

---

#### 3.3 Default Detection Service
**Priority:** 🟡 Medium  
**Dependencies:** 3.2  
**Estimated Effort:** 3-4 hours

**Files to Create:**
- `src/services/loans/default-detection-service.ts`
- `src/app/api/loans/check-defaults/route.ts`

**Implementation:**
```typescript
// Service to detect and handle loan defaults
// - Scans loans past grace period
// - Checks repayment status
// - Marks loans as defaulted
// - Emits MembershipSuspended event
// - Triggers trust removal recommendations
```

---

### Phase 4: Telegram Integration

#### 4.1 Event Listener Service
**Priority:** 🟡 Medium  
**Dependencies:** Phase 1  
**Estimated Effort:** 4-5 hours

**Files to Create:**
- `src/services/telegram/event-listener.ts`
- `src/app/api/telegram/events/route.ts`

**Implementation:**
```typescript
// Service to listen to contract events and trigger Telegram notifications
// - LoanRequestCreated → notifyLoanRequest
// - Vouched → notifyVouchingAccepted
// - LoanConfirmed → notifyLoanAccepted
// - Crowdfunded → notifyFundingObtained
// - LoanFunded → notifyLoanAccepted
// - RepaymentMade → notifyLoanRepaid
// - LoanDefaulted → notifyLoanDefault
// - MembershipSuspended → notifyTrustCancellationRecommendation
```

**Features:**
- WebSocket or polling event listener
- Event filtering and processing
- Telegram notification triggers
- Error handling and retries

---

#### 4.2 Reaction-Based Vouching Handler
**Priority:** 🟢 Low (Nice to have)  
**Dependencies:** 4.1  
**Estimated Effort:** 5-6 hours

**Files to Create:**
- `src/services/telegram/reaction-handler.ts`
- `src/app/api/telegram/reactions/route.ts`

**Implementation:**
```typescript
// Service to handle Telegram reactions for vouching
// - Listens for 👍 reactions on loan request messages
// - Validates reactor is group member
// - Validates reactor has CRC balance
// - Executes vouchForLoan transaction
// - Handles transaction signing (user must sign)
```

**Features:**
- Telegram reaction detection
- Member validation
- Balance checking
- Transaction preparation
- User signing flow
- Error handling

---

### Phase 5: Enhanced Features

#### 5.1 Repayment Tracking Component
**Priority:** 🟢 Low  
**Dependencies:** 1.3  
**Estimated Effort:** 2-3 hours

**Files to Create:**
- `src/components/loans/repayment-tracking.tsx`

**Implementation:**
```typescript
// Component to display repayment progress
// - Total owed
// - Amount repaid
// - Remaining balance
// - Repayment deadline
// - Grace period status
// - Visual progress bar
```

---

#### 5.2 Interest Calculator Component
**Priority:** 🟢 Low  
**Dependencies:** None  
**Estimated Effort:** 1-2 hours

**Files to Create:**
- `src/components/loans/interest-calculator.tsx`

**Implementation:**
```typescript
// Component to calculate and display interest
// - Interest rate based on voucher count
// - Total interest amount
// - Total repayment amount
// - Breakdown visualization
```

---

#### 5.3 Time Remaining Indicators
**Priority:** 🟢 Low  
**Dependencies:** None  
**Estimated Effort:** 2 hours

**Files to Create:**
- `src/components/loans/time-remaining.tsx`
- `src/lib/utils/time-utils.ts`

**Implementation:**
```typescript
// Utility functions and component for time calculations
// - Vouching deadline countdown
// - Crowdfunding deadline countdown
// - Repayment deadline countdown
// - Grace period countdown
// - Visual indicators (urgent/warning/safe)
```

---

## Architecture Patterns

### Hook Pattern
All hooks follow consistent pattern:
```typescript
interface UseXxxOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

function useXxx(options: UseXxxOptions = {}) {
  // Wagmi hooks
  // Error handling
  // Success callbacks
  // Return: { action, hash, isPending, isSuccess, isError, error, reset }
}
```

### Component Pattern
All components follow consistent pattern:
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
All services follow consistent pattern:
```typescript
// Pure functions for business logic
// No React hooks
// Can be used in API routes or server components
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
- Use TanStack Query for data fetching and caching
- Use Wagmi hooks for contract interactions
- Use React state for UI-only state
- Use callbacks for parent-child communication

### Error Handling
- Toast notifications for user feedback
- Error boundaries for component-level errors
- Retry logic for network/contract errors
- Graceful degradation for missing data

---

## Testing Strategy

### Unit Tests
- Hook logic (mock Wagmi)
- Utility functions
- Service functions

### Integration Tests
- Contract interactions
- Event handling
- Telegram notifications

### E2E Tests
- Complete loan flow
- User interactions
- Error scenarios

---

## Deployment Considerations

### Environment Variables
- `NEXT_PUBLIC_LENDING_MARKET_ADDRESS`
- `NEXT_PUBLIC_CRC_TOKEN_ADDRESS`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `CIRCLES_GROUP_ADDRESS`

### API Routes
- `/api/loans/check-repayments` - Auto-repayment checker
- `/api/loans/grace-period` - Grace period handler
- `/api/loans/check-defaults` - Default detection
- `/api/telegram/events` - Event listener
- `/api/telegram/reactions` - Reaction handler

### Scheduled Tasks
- Auto-repayment checker (every hour)
- Grace period handler (every 6 hours)
- Default detection (daily)

---

## Priority Matrix

### Must Have (MVP)
1. ✅ Confirm loan terms (1.1)
2. ✅ Disburse loan (1.2)
3. ✅ Repay loan (1.3)
4. ✅ Loan confirmation component (2.1)
5. ✅ Loan disbursement component (2.2)
6. ✅ Loan repayment component (2.3)
7. ✅ Event listener service (4.1)

### Should Have
8. Auto-repayment service (3.1)
9. Grace period handler (3.2)
10. Default detection service (3.3)
11. Enhanced loan details (2.6)

### Nice to Have
12. Voucher list (2.4)
13. Lender list (2.5)
14. Reaction-based vouching (4.2)
15. Repayment tracking (5.1)
16. Interest calculator (5.2)
17. Time remaining indicators (5.3)

---

## Estimated Timeline

**Phase 1 (Core Operations):** 7-10 hours  
**Phase 2 (UI Components):** 12-17 hours  
**Phase 3 (Backend Services):** 9-12 hours  
**Phase 4 (Telegram Integration):** 4-5 hours (basic) or 9-11 hours (with reactions)  
**Phase 5 (Enhanced Features):** 5-7 hours

**Total MVP:** ~32-44 hours  
**Total Complete:** ~50-67 hours

---

## Next Steps

1. **Start with Phase 1** - Core loan operations are critical
2. **Implement in order** - Dependencies are clearly marked
3. **Test incrementally** - Test each component as it's built
4. **Integrate Telegram** - Set up event listeners early
5. **Add enhancements** - Build nice-to-haves after MVP

---

## Notes

- All hooks should use consistent error handling patterns
- All components should follow design system (Shadcn UI)
- All services should be testable (pure functions where possible)
- Consider using React Query for complex data fetching
- Use TypeScript strictly (no `any` types)
- Follow existing code patterns and conventions

