# Loan Cycle Implementation - Quick Reference

## Implementation Order

### Week 1: Core Operations (MVP)
1. **Confirm Loan Terms** (`useConfirmLoanTerms.ts`)
2. **Disburse Loan** (`useDisburseLoan.ts`)
3. **Repay Loan** (`useRepayLoan.ts`)
4. **Loan Confirmation UI** (`loan-confirmation.tsx`)
5. **Loan Disbursement UI** (`loan-disbursement.tsx`)
6. **Loan Repayment UI** (`loan-repayment.tsx`)

### Week 2: Integration & Automation
7. **Event Listener Service** (`event-listener.ts`)
8. **Auto-Repayment Service** (`auto-repayment-service.ts`)
9. **Grace Period Handler** (`grace-period-handler.ts`)
10. **Default Detection Service** (`default-detection-service.ts`)

### Week 3: Enhancements
11. **Enhanced Loan Details** (update existing)
12. **Voucher List Component** (`voucher-list.tsx`)
13. **Lender List Component** (`lender-list.tsx`)
14. **Repayment Tracking** (`repayment-tracking.tsx`)

---

## File Structure

```
src/
├── services/
│   ├── loans/
│   │   ├── useConfirmLoanTerms.ts          [NEW]
│   │   ├── useDisburseLoan.ts              [NEW]
│   │   ├── useRepayLoan.ts                 [NEW]
│   │   ├── useCalculateTotalOwed.ts        [NEW]
│   │   ├── useVouchers.ts                  [NEW]
│   │   ├── useLenders.ts                   [NEW]
│   │   ├── useLenderContributions.ts       [NEW]
│   │   ├── auto-repayment-service.ts       [NEW]
│   │   ├── grace-period-handler.ts         [NEW]
│   │   └── default-detection-service.ts    [NEW]
│   └── telegram/
│       ├── event-listener.ts               [NEW]
│       └── reaction-handler.ts             [NEW - Optional]
├── components/
│   └── loans/
│       ├── loan-confirmation.tsx           [NEW]
│       ├── loan-disbursement.tsx           [NEW]
│       ├── loan-repayment.tsx              [NEW]
│       ├── voucher-list.tsx                [NEW]
│       ├── lender-list.tsx                 [NEW]
│       ├── repayment-tracking.tsx          [NEW]
│       ├── interest-calculator.tsx         [NEW]
│       ├── time-remaining.tsx              [NEW]
│       └── loan-details.tsx                [UPDATE]
└── app/
    └── api/
        ├── loans/
        │   ├── check-repayments/route.ts   [NEW]
        │   ├── grace-period/route.ts      [NEW]
        │   └── check-defaults/route.ts    [NEW]
        └── telegram/
            ├── events/route.ts             [NEW]
            └── reactions/route.ts          [NEW - Optional]
```

---

## Hook Template

```typescript
"use client";

import { useEffect, useRef } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { toast } from "sonner";
import { lendingMarketContract } from "@/lib/contracts/config";

interface UseXxxOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useXxx({
  onSuccess,
  onError,
}: UseXxxOptions = {}) {
  const {
    writeContract,
    data: hash,
    error: writeError,
    isPending: isWritePending,
    reset: resetWrite,
  } = useWriteContract();

  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  function xxx(loanId: bigint, ...args: any[]) {
    try {
      writeContract({
        ...lendingMarketContract,
        functionName: "xxx",
        args: [loanId, ...args],
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Unknown error");
      toast.error(`Failed to xxx: ${err.message}`);
      onError?.(err);
    }
  }

  useEffect(() => {
    if (writeError) {
      const error = new Error(writeError.message);
      toast.error(`Transaction failed: ${error.message}`);
      onError?.(error);
    }
  }, [writeError, onError]);

  useEffect(() => {
    if (receiptError) {
      const error = new Error(receiptError.message);
      toast.error(`Transaction confirmation failed: ${error.message}`);
      onError?.(error);
    }
  }, [receiptError, onError]);

  const hasCalledSuccess = useRef(false);
  
  useEffect(() => {
    if (isConfirmed && receipt && hash && !hasCalledSuccess.current) {
      hasCalledSuccess.current = true;
      toast.success("Successfully xxx!");
      setTimeout(() => {
        onSuccess?.();
      }, 100);
    }
  }, [isConfirmed, receipt, hash, onSuccess]);
  
  useEffect(() => {
    if (!hash) {
      hasCalledSuccess.current = false;
    }
  }, [hash]);

  function reset() {
    resetWrite();
  }

  return {
    xxx,
    hash,
    isPending: isWritePending || isConfirming,
    isSuccess: isConfirmed,
    isError: !!writeError || !!receiptError,
    error: writeError || receiptError,
    reset,
  };
}
```

---

## Component Template

```typescript
"use client";

import { useXxx } from "@/services/loans/useXxx";
import { useLoanDetails } from "@/services/loans/useLoanDetails";
import { Button } from "@/components/ui/button";

interface XxxProps {
  loanId: bigint;
  className?: string;
  onActionSuccess?: () => void;
}

export function Xxx({ loanId, className, onActionSuccess }: XxxProps) {
  const { loan, isLoading } = useLoanDetails(loanId);
  const { xxx, isPending, isSuccess } = useXxx({
    onSuccess: () => {
      onActionSuccess?.();
    },
  });

  if (isLoading || !loan) {
    return <div>Loading...</div>;
  }

  return (
    <div className={className}>
      {/* Component content */}
      <Button
        onClick={() => xxx(loanId)}
        disabled={isPending || isSuccess}
      >
        {isPending ? "Processing..." : "Action"}
      </Button>
    </div>
  );
}
```

---

## Contract Function Reference

### Confirm Loan Terms
```solidity
function confirmLoanTerms(uint256 loanId) external
```
- Requires: Borrower, state = Vouching, voucherCount >= 3
- Effects: Calculates interest, transitions to Crowdfunding
- Events: `InterestRateCalculated`, `LoanConfirmed`

### Disburse Loan
```solidity
function disburseLoan(uint256 loanId) external
```
- Requires: Borrower, state = Crowdfunding, fully funded
- Effects: Transfers funds, sets deadlines, transitions to Funded
- Events: None (but state change)

### Repay Loan
```solidity
function repayLoan(uint256 loanId, uint256 amount) external
```
- Requires: Borrower, state = Funded, amount > 0
- Effects: Distributes repayment, updates tracking
- Events: `RepaymentMade`, `LoanRepaid` (if fully repaid)

### Calculate Total Owed
```solidity
function calculateTotalOwed(uint256 loanId) public view returns (uint256)
```
- Returns: Principal + Interest

---

## State Transitions

```
Requested → Vouching → Crowdfunding → Funded → Repaid
                                    ↓
                                 Defaulted
```

**Triggers:**
- `createLoanRequest` → Requested/Vouching
- `vouchForLoan` → (stays in Vouching)
- `confirmLoanTerms` → Crowdfunding
- `contributeToLoan` → (stays in Crowdfunding)
- `disburseLoan` → Funded
- `repayLoan` → (stays in Funded) or Repaid
- `markLoanAsDefaulted` → Defaulted

---

## Event → Notification Mapping

| Contract Event | Telegram Notification | Hook/Service |
|---------------|----------------------|--------------|
| `LoanRequestCreated` | `notifyLoanRequest` | Event Listener |
| `Vouched` | `notifyVouchingAccepted` | Event Listener |
| `LoanConfirmed` | `notifyLoanAccepted` | Event Listener |
| `Crowdfunded` | `notifyFundingObtained` | Event Listener |
| `LoanFunded` | `notifyLoanAccepted` | Event Listener |
| `RepaymentMade` | `notifyLoanRepaid` | Event Listener |
| `LoanDefaulted` | `notifyLoanDefault` | Event Listener |
| `MembershipSuspended` | `notifyTrustCancellationRecommendation` | Event Listener |

---

## Testing Checklist

### Unit Tests
- [ ] Hook logic (mock Wagmi)
- [ ] Utility functions
- [ ] Service functions
- [ ] Component rendering

### Integration Tests
- [ ] Contract interactions
- [ ] Event handling
- [ ] Telegram notifications
- [ ] State transitions

### E2E Tests
- [ ] Complete loan flow
- [ ] Borrower actions
- [ ] Lender actions
- [ ] Error scenarios
- [ ] Edge cases

---

## Common Patterns

### Error Handling
```typescript
try {
  // Action
} catch (error) {
  const err = error instanceof Error ? error : new Error("Unknown error");
  toast.error(`Failed: ${err.message}`);
  onError?.(err);
}
```

### Success Callbacks
```typescript
const hasCalledSuccess = useRef(false);

useEffect(() => {
  if (isConfirmed && !hasCalledSuccess.current) {
    hasCalledSuccess.current = true;
    toast.success("Success!");
    setTimeout(() => {
      onSuccess?.();
    }, 100);
  }
}, [isConfirmed, onSuccess]);
```

### Loading States
```typescript
if (isLoading) {
  return <div>Loading...</div>;
}

if (isError || !data) {
  return <div>Error: {error?.message}</div>;
}
```

---

## Environment Variables

```env
# Contract Addresses
NEXT_PUBLIC_LENDING_MARKET_ADDRESS=0x...
NEXT_PUBLIC_CRC_TOKEN_ADDRESS=0x...

# Telegram
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...

# Circles
CIRCLES_GROUP_ADDRESS=0xa646fc7956376a641d30448a0473348bcc5638e5

# RPC
NEXT_PUBLIC_ALCHEMY_API_KEY=...
```

---

## Key Dependencies

- `wagmi` - Contract interactions
- `viem` - Ethereum utilities
- `@tanstack/react-query` - Data fetching
- `sonner` - Toast notifications
- `telegraf` - Telegram bot
- `@aboutcircles/sdk` - Circles integration

---

## Quick Commands

```bash
# Create new hook
touch src/services/loans/useXxx.ts

# Create new component
touch src/components/loans/xxx.tsx

# Create new API route
mkdir -p src/app/api/xxx
touch src/app/api/xxx/route.ts

# Run tests
bun test

# Type check
bun run type-check

# Lint
bun run lint
```

