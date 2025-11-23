# Loan Cycle Architecture Diagram

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Components  │  │    Hooks     │  │   Services    │         │
│  │               │  │              │  │               │         │
│  │ LoanRequest   │→ │ useCreate    │→ │ Contract      │         │
│  │ Form          │  │ LoanRequest  │  │ Interactions   │         │
│  │               │  │              │  │               │         │
│  │ LoanDetails   │→ │ useLoan      │→ │ Wagmi/Viem    │         │
│  │               │  │ Details      │  │               │         │
│  │ LoanActions   │→ │ useVouch     │→ │               │         │
│  │               │  │ useContribute│  │               │         │
│  │ LoanRepayment │→ │ useRepay     │→ │               │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│         │                  │                   │                 │
│         └──────────────────┼───────────────────┘                 │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Smart Contract (Gnosis)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  InnerCirclesLendingMarket                                       │
│  ├── createLoanRequest()                                         │
│  ├── vouchForLoan()                                              │
│  ├── confirmLoanTerms()                                          │
│  ├── contributeToLoan()                                          │
│  ├── disburseLoan()                                              │
│  ├── repayLoan()                                                  │
│  └── Events:                                                     │
│      ├── LoanRequestCreated                                      │
│      ├── Vouched                                                 │
│      ├── LoanConfirmed                                           │
│      ├── Crowdfunded                                             │
│      ├── LoanFunded                                              │
│      ├── RepaymentMade                                           │
│      ├── LoanRepaid                                              │
│      └── LoanDefaulted                                           │
│                                                                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Events
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend Services                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────┐  ┌──────────────────────┐            │
│  │  Event Listener      │  │  Auto-Repayment      │            │
│  │  Service             │  │  Service             │            │
│  │                      │  │                      │            │
│  │  - Listen to events  │  │  - Check balances   │            │
│  │  - Filter events     │  │  - Execute repayments│            │
│  │  - Trigger actions   │  │  - Update states     │            │
│  └──────────────────────┘  └──────────────────────┘            │
│           │                            │                          │
│           │                            │                          │
│  ┌──────────────────────┐  ┌──────────────────────┐            │
│  │  Grace Period        │  │  Default Detection   │            │
│  │  Handler              │  │  Service             │            │
│  │                      │  │                      │            │
│  │  - Monitor deadlines │  │  - Detect defaults  │            │
│  │  - Send notifications │  │  - Mark as defaulted  │            │
│  │  - Handle grace      │  │  - Trigger actions   │            │
│  └──────────────────────┘  └──────────────────────┘            │
│                                                                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Notifications
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Telegram Bot Service                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────┐  ┌──────────────────────┐            │
│  │  Notification        │  │  Reaction Handler     │            │
│  │  Functions           │  │  (Optional)           │            │
│  │                      │  │                      │            │
│  │  - notifyLoanRequest │  │  - Listen reactions  │            │
│  │  - notifyVouching    │  │  - Validate members   │            │
│  │  - notifyFunding     │  │  - Execute vouching   │            │
│  │  - notifyRepayment   │  │  - Handle signing     │            │
│  │  - notifyDefault     │  │                      │            │
│  └──────────────────────┘  └──────────────────────┘            │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Loan Request → Repayment

```
1. CREATE LOAN REQUEST
   User → LoanRequestForm → useCreateLoanRequest → Contract
   Contract → LoanRequestCreated Event → Event Listener → Telegram Bot

2. VOUCHING PHASE
   User → LoanActions → useVouchForLoan → Contract
   Contract → Vouched Event → Event Listener → Telegram Bot

3. CONFIRM LOAN TERMS
   Borrower → LoanConfirmation → useConfirmLoanTerms → Contract
   Contract → LoanConfirmed Event → Event Listener → Telegram Bot

4. CROWDFUNDING PHASE
   Lender → LoanActions → useContributeToLoan → Contract
   Contract → Crowdfunded Event → Event Listener → Telegram Bot

5. DISBURSE LOAN
   Borrower → LoanDisbursement → useDisburseLoan → Contract
   Contract → State: Funded

6. REPAYMENT PHASE
   Option A: Manual
     Borrower → LoanRepayment → useRepayLoan → Contract
     Contract → RepaymentMade Event → Event Listener → Telegram Bot
   
   Option B: Automatic
     Auto-Repayment Service → Check Balance → useRepayLoan → Contract
     Contract → RepaymentMade Event → Event Listener → Telegram Bot

7. COMPLETION
   Contract → LoanRepaid Event → Event Listener → Telegram Bot
   OR
   Contract → LoanDefaulted Event → Default Detection → Telegram Bot
```

---

## Component Hierarchy

```
App
├── CreditPage
│   ├── LoanRequestForm
│   │   └── useCreateLoanRequestWithEvents
│   │
│   └── LoansList
│       └── LoanCard
│           ├── LoanActions
│           │   ├── useVouchForLoan
│           │   ├── useContributeToLoan
│           │   └── useApproveToken
│           │
│           └── Link → LoanDetailPage
│
└── LoanDetailPage
    └── LoanDetails
        ├── LoanConfirmation (if Vouching)
        │   └── useConfirmLoanTerms
        │
        ├── LoanDisbursement (if Crowdfunding & Funded)
        │   └── useDisburseLoan
        │
        ├── LoanRepayment (if Funded)
        │   ├── useRepayLoan
        │   ├── useCalculateTotalOwed
        │   └── RepaymentTracking
        │
        ├── VoucherList
        │   └── useVouchers
        │
        ├── LenderList
        │   ├── useLenders
        │   └── useLenderContributions
        │
        └── LoanActions
            ├── useVouchForLoan
            └── useContributeToLoan
```

---

## Hook Dependencies

```
useCreateLoanRequest
  └── useApproveToken (if needed)

useVouchForLoan
  └── useApproveToken (1 CRC)

useContributeToLoan
  └── useApproveToken (1-5 CRC)

useConfirmLoanTerms
  └── useLoanDetails (validate state)

useDisburseLoan
  └── useLoanDetails (validate state)

useRepayLoan
  ├── useLoanDetails (get loan data)
  └── useCalculateTotalOwed (calculate amount)

useLoanDetails
  └── useReadContract (Wagmi)

useVouchers
  └── useReadContract (Wagmi)

useLenders
  └── useReadContract (Wagmi)
```

---

## Service Dependencies

```
Event Listener Service
  ├── Telegram Bot (notifications)
  └── Contract Event Watcher

Auto-Repayment Service
  ├── useLoanDetails (get funded loans)
  ├── useReadContract (check balance)
  └── useRepayLoan (execute repayment)

Grace Period Handler
  ├── useLoanDetails (get funded loans)
  └── Telegram Bot (send notifications)

Default Detection Service
  ├── useLoanDetails (get funded loans)
  └── Contract (markLoanAsDefaulted)
```

---

## State Management Flow

```
┌─────────────────┐
│  User Action    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  React Hook     │
│  (useXxx)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Wagmi Hook     │
│  (useWrite      │
│   Contract)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Contract       │
│  Transaction    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Contract       │
│  Event          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Event Listener │
│  Service        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Telegram Bot   │
│  Notification   │
└─────────────────┘
```

---

## Error Handling Flow

```
┌─────────────────┐
│  Error Occurs   │
└────────┬────────┘
         │
         ├── Contract Error
         │   └──→ Toast Notification
         │
         ├── Network Error
         │   └──→ Retry Logic
         │
         ├── Validation Error
         │   └──→ Form Error Display
         │
         └── Unknown Error
             └──→ Error Boundary
```

---

## Testing Architecture

```
Unit Tests
├── Hooks (mock Wagmi)
├── Components (mock hooks)
├── Services (pure functions)
└── Utilities

Integration Tests
├── Contract Interactions
├── Event Handling
└── Telegram Notifications

E2E Tests
├── Complete Loan Flow
├── User Interactions
└── Error Scenarios
```

---

## Deployment Architecture

```
Production
├── Frontend (Vercel/Netlify)
│   └── Next.js App
│
├── Backend Services
│   ├── API Routes (Next.js)
│   ├── Scheduled Tasks (Cron)
│   └── Event Listeners
│
├── Smart Contract
│   └── Gnosis Chain
│
└── Telegram Bot
    └── Webhook/Polling
```

---

## Security Considerations

```
┌─────────────────┐
│  User Wallet    │
│  (Privy)        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Transaction    │
│  Signing        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Contract       │
│  Validation     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  State Update   │
└─────────────────┘
```

**Security Layers:**
1. Wallet connection (Privy)
2. Transaction signing (user approval)
3. Contract validation (on-chain)
4. State verification (read-only checks)

---

## Performance Optimizations

```
Data Fetching
├── TanStack Query (caching)
├── Polling (active loans only)
└── Refetch on action success

Component Optimization
├── React.memo (prevent re-renders)
├── useCallback (stable callbacks)
└── useMemo (expensive calculations)

Network Optimization
├── Batch contract reads
├── Event-based updates
└── Lazy loading components
```

---

## Monitoring & Observability

```
Metrics to Track
├── Loan creation rate
├── Vouching success rate
├── Funding completion rate
├── Repayment success rate
├── Default rate
└── Average loan duration

Logging
├── Contract events
├── User actions
├── Errors
└── Performance metrics

Alerts
├── High default rate
├── Service failures
├── Contract errors
└── Telegram bot issues
```

