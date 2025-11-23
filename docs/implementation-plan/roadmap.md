# Loan Cycle Implementation Roadmap

## Quick Overview

```
Current Progress: ████████████░░░░░░░░ 60%

Remaining Work:
- Phase 1 (Core Operations): ████████░░ 7-10 hours
- Phase 2 (Automation): ████████████░░ 9-12 hours  
- Phase 3 (Enhanced UI): ████████████░░ 12-17 hours

Total Remaining: 28-39 hours
```

---

## Implementation Roadmap

### ✅ Phase 0: Foundation (COMPLETE)
- [x] Smart Contract
- [x] Basic Hooks (Create, Vouch, Contribute)
- [x] Basic UI Components
- [x] Telegram Notification Service

### 🔴 Phase 1: Core Borrower Operations (CRITICAL)
**Status:** Not Started  
**Priority:** Must Have for MVP  
**Estimated:** 7-10 hours

#### 1.1 Confirm Loan Terms
- [ ] `useConfirmLoanTerms.ts` hook
- [ ] `loan-confirmation.tsx` component
- [ ] Integration with `LoanDetails`
- **Dependencies:** None
- **Effort:** 2-3 hours

#### 1.2 Disburse Loan
- [ ] `useDisburseLoan.ts` hook
- [ ] `loan-disbursement.tsx` component
- [ ] Integration with `LoanDetails`
- **Dependencies:** 1.1
- **Effort:** 2-3 hours

#### 1.3 Repay Loan
- [ ] `useRepayLoan.ts` hook
- [ ] `useCalculateTotalOwed.ts` hook
- [ ] `loan-repayment.tsx` component
- [ ] Integration with `LoanDetails`
- **Dependencies:** 1.2
- **Effort:** 3-4 hours

---

### 🟡 Phase 2: Integration & Automation (IMPORTANT)
**Status:** Not Started  
**Priority:** Should Have  
**Estimated:** 9-12 hours

#### 2.1 Event Listener Service
- [ ] `event-listener.ts` service
- [ ] `/api/telegram/events/route.ts` API route
- [ ] Event → Notification mapping
- **Dependencies:** Phase 1
- **Effort:** 4-5 hours

#### 2.2 Auto-Repayment Service
- [ ] `auto-repayment-service.ts` service
- [ ] `/api/loans/check-repayments/route.ts` API route
- [ ] Balance checking logic
- [ ] Scheduled execution setup
- **Dependencies:** 1.3
- **Effort:** 4-5 hours

#### 2.3 Grace Period Handler
- [ ] `grace-period-handler.ts` service
- [ ] `/api/loans/grace-period/route.ts` API route
- [ ] Notification triggers
- **Dependencies:** 2.2
- **Effort:** 2-3 hours

#### 2.4 Default Detection Service
- [ ] `default-detection-service.ts` service
- [ ] `/api/loans/check-defaults/route.ts` API route
- [ ] Default marking logic
- **Dependencies:** 2.3
- **Effort:** 3-4 hours

---

### 🟢 Phase 3: Enhanced UI Components (NICE TO HAVE)
**Status:** Not Started  
**Priority:** Nice to Have  
**Estimated:** 12-17 hours

#### 3.1 Enhanced Loan Details
- [ ] Add voucher list section
- [ ] Add lender list section
- [ ] Add repayment tracking
- [ ] Add time indicators
- **Dependencies:** Phase 1
- **Effort:** 3-4 hours

#### 3.2 Voucher List Component
- [ ] `useVouchers.ts` hook
- [ ] `voucher-list.tsx` component
- **Dependencies:** None
- **Effort:** 2 hours

#### 3.3 Lender List Component
- [ ] `useLenders.ts` hook
- [ ] `useLenderContributions.ts` hook
- [ ] `lender-list.tsx` component
- **Dependencies:** None
- **Effort:** 2-3 hours

#### 3.4 Repayment Tracking Component
- [ ] `repayment-tracking.tsx` component
- [ ] Progress visualization
- **Dependencies:** 1.3
- **Effort:** 2-3 hours

#### 3.5 Additional Enhancements
- [ ] Interest calculator component
- [ ] Time remaining indicators
- [ ] Repayment history visualization
- **Dependencies:** Phase 1
- **Effort:** 3-5 hours

---

## Dependency Graph

```
Phase 1.1 (Confirm Loan Terms)
    ↓
Phase 1.2 (Disburse Loan)
    ↓
Phase 1.3 (Repay Loan)
    ↓
    ├─→ Phase 2.1 (Event Listener)
    ├─→ Phase 2.2 (Auto-Repayment)
    │       ↓
    │   Phase 2.3 (Grace Period)
    │       ↓
    │   Phase 2.4 (Default Detection)
    │
    └─→ Phase 3.1 (Enhanced UI)
            ├─→ Phase 3.2 (Voucher List)
            ├─→ Phase 3.3 (Lender List)
            └─→ Phase 3.4 (Repayment Tracking)
```

---

## Quick Start Guide

### Step 1: Review Current State
```bash
# Check existing hooks
ls src/services/loans/

# Check existing components
ls src/components/loans/

# Review contract
cat src/lib/contracts/InnerCirclesLendingMarket.sol
```

### Step 2: Start with Phase 1.1
Begin with `useConfirmLoanTerms.ts` - it's the first missing piece in the borrower journey.

### Step 3: Follow Sequential Order
- Phase 1.1 → Phase 1.2 → Phase 1.3 (sequential)
- Phase 2 can start after Phase 1.3
- Phase 3 can be done in parallel after Phase 1

### Step 4: Use Templates
Reference [quick-reference.md](./quick-reference.md) for:
- Hook templates
- Component templates
- Service patterns
- Testing checklists

---

## Priority Matrix

### Must Have (MVP) - Week 1
1. ✅ Confirm Loan Terms (1.1)
2. ✅ Disburse Loan (1.2)
3. ✅ Repay Loan (1.3)
4. ✅ Event Listener (2.1)

### Should Have - Week 2
5. Auto-Repayment Service (2.2)
6. Grace Period Handler (2.3)
7. Default Detection (2.4)
8. Enhanced Loan Details (3.1)

### Nice to Have - Week 3
9. Voucher List (3.2)
10. Lender List (3.3)
11. Repayment Tracking (3.4)
12. Additional Enhancements (3.5)

---

## Estimated Timeline

| Phase | Components | Effort | Priority |
|-------|-----------|--------|----------|
| Phase 1 | 3 hooks + 3 components | 7-10 hours | 🔴 Critical |
| Phase 2 | 4 services + 4 API routes | 9-12 hours | 🟡 Important |
| Phase 3 | 5+ components + hooks | 12-17 hours | 🟢 Nice to Have |
| **Total** | **12+ components** | **28-39 hours** | |

---

## Success Criteria

### MVP Complete When:
- [x] Borrower can create loan request ✅
- [x] Lenders can vouch and contribute ✅
- [ ] Borrower can confirm loan terms
- [ ] Borrower can disburse loan
- [ ] Borrower can repay loan
- [ ] Events trigger Telegram notifications

### Full Implementation When:
- [ ] All MVP features complete
- [ ] Auto-repayment working
- [ ] Grace period handling
- [ ] Default detection
- [ ] Enhanced UI components
- [ ] All tests passing

---

## Notes

- **Start with Phase 1.1** - It's the critical path
- **Test incrementally** - Test each component as you build
- **Follow patterns** - Use existing code as reference
- **Document changes** - Note any deviations from plan
- **Ask questions** - Review existing implementations for patterns

---

## Resources

- **Workflow Document:** [workflow.md](./workflow.md) - Detailed implementation plan
- **Quick Reference:** [quick-reference.md](./quick-reference.md) - Templates and patterns
- **Architecture:** [architecture-diagram.md](./architecture-diagram.md) - System design
- **Detailed Plan:** [loan-cycle-completion.md](./loan-cycle-completion.md) - Component specs

