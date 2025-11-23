# Loan Request Flow - System Design

## Overview

This document outlines the complete design for the **Loan Request** flow (Step 2) of the Inner Circles Credit System. The design includes UI components, service layer architecture, data flow, and integration patterns using Wagmi v3 hooks.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         LoanRequestForm Component                    │  │
│  │  - Amount Input (CRC)                                 │  │
│  │  - Term Duration Selector (Fixed: 30 days for MVP)  │  │
│  │  - Validation & Error Display                         │  │
│  │  - Submit Button                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                   │
│                          ▼                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │      LoanRequestConfirmation Component               │  │
│  │  - Loan ID Display                                   │  │
│  │  - Transaction Status                                │  │
│  │  - Success/Error States                              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │     useCreateLoanRequest Hook (Wagmi)                │  │
│  │  - Contract write hook                               │  │
│  │  - Transaction state management                      │  │
│  │  - Error handling                                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                   │
│                          ▼                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │     useLoanRequestEvents Hook (Wagmi)               │  │
│  │  - Event listener for LoanRequestCreated            │  │
│  │  - Real-time loan ID retrieval                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                   │
│                          ▼                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │     useLoanDetails Hook (Wagmi)                     │  │
│  │  - Read loan data from contract                      │  │
│  │  - Polling for state updates                         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              InnerCirclesLendingMarket Contract            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  createLoanRequest(amountRequested, termDuration)     │  │
│  │  → Returns: uint256 loanId                           │  │
│  │  → Emits: LoanRequestCreated event                    │  │
│  │  → Sets state: LoanState.Vouching                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 1. Type Definitions

### Contract Types

```typescript
// src/types/loans.ts

import type { Address } from "viem";

/**
 * Loan state enum matching contract LoanState
 */
export enum LoanState {
  Requested = 0,
  Vouching = 1,
  Crowdfunding = 2,
  Funded = 3,
  Repaid = 4,
  Defaulted = 5,
}

/**
 * Loan data structure matching contract Loan struct
 */
export interface Loan {
  borrower: Address;
  amountRequested: bigint;
  amountFunded: bigint;
  termDuration: bigint;
  interestRate: bigint; // in basis points
  createdAt: bigint;
  vouchingDeadline: bigint;
  crowdfundingDeadline: bigint;
  repaymentDeadline: bigint;
  gracePeriodEnd: bigint;
  state: LoanState;
  voucherCount: bigint;
}

/**
 * Loan request form input
 */
export interface LoanRequestInput {
  amountRequested: string; // User input as string (will be converted to bigint)
  termDuration: number; // Duration in days (will be converted to seconds)
}

/**
 * Loan request result
 */
export interface LoanRequestResult {
  loanId: bigint;
  transactionHash: `0x${string}`;
  borrower: Address;
  amountRequested: bigint;
  termDuration: bigint;
}

/**
 * Contract constants
 */
export const LOAN_CONSTANTS = {
  DEFAULT_TERM_DURATION_DAYS: 30,
  DEFAULT_TERM_DURATION_SECONDS: 30 * 24 * 60 * 60, // 30 days in seconds
  MIN_AMOUNT: 1n, // Minimum 1 CRC (1 ether in 18 decimals)
  MAX_AMOUNT: 1000000n * 10n ** 18n, // Max 1M CRC (reasonable limit)
} as const;
```

## 2. Service Layer

### Contract Configuration

```typescript
// src/lib/contracts/config.ts

import { gnosis } from "viem/chains";
import InnerCirclesLendingMarketABI from "./InnerCirclesLendingMarketABI";

/**
 * Contract address on Gnosis Chain
 * TODO: Replace with actual deployed contract address
 */
export const LENDING_MARKET_CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_LENDING_MARKET_ADDRESS as `0x${string}`;

if (!LENDING_MARKET_CONTRACT_ADDRESS) {
  throw new Error(
    "NEXT_PUBLIC_LENDING_MARKET_ADDRESS environment variable is required"
  );
}

/**
 * Contract configuration for Wagmi
 */
export const lendingMarketContract = {
  address: LENDING_MARKET_CONTRACT_ADDRESS,
  abi: InnerCirclesLendingMarketABI,
  chainId: gnosis.id,
} as const;
```

### Wagmi Hooks

```typescript
// src/services/loans/useCreateLoanRequest.ts

"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { toast } from "sonner";
import { lendingMarketContract } from "@/lib/contracts/config";
import type { LoanRequestInput, LoanRequestResult } from "@/types/loans";

/**
 * Hook for creating a loan request
 *
 * @param onSuccess - Callback when loan request is successfully created
 * @param onError - Callback when an error occurs
 * @returns Object with write function, transaction state, and loan data
 */
export function useCreateLoanRequest({
  onSuccess,
  onError,
}: {
  onSuccess?: (result: LoanRequestResult) => void;
  onError?: (error: Error) => void;
} = {}) {
  const {
    writeContract,
    data: hash,
    error: writeError,
    isPending: isWritePending,
    reset,
  } = useWriteContract();

  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  /**
   * Create a loan request
   */
  async function createLoanRequest(input: LoanRequestInput) {
    try {
      // Validate input
      const amountRequested = parseEther(input.amountRequested);
      const termDuration = BigInt(input.termDuration * 24 * 60 * 60); // Convert days to seconds

      if (amountRequested <= 0n) {
        throw new Error("Loan amount must be greater than 0");
      }

      if (termDuration <= 0n) {
        throw new Error("Term duration must be greater than 0");
      }

      // Write to contract
      writeContract({
        ...lendingMarketContract,
        functionName: "createLoanRequest",
        args: [amountRequested, termDuration],
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Unknown error");
      toast.error(`Failed to create loan request: ${err.message}`);
      onError?.(err);
    }
  }

  // Handle write errors
  if (writeError) {
    const error = new Error(writeError.message);
    toast.error(`Transaction failed: ${error.message}`);
    onError?.(error);
  }

  // Handle receipt errors
  if (receiptError) {
    const error = new Error(receiptError.message);
    toast.error(`Transaction confirmation failed: ${error.message}`);
    onError?.(error);
  }

  // Handle success
  if (isConfirmed && receipt) {
    // Extract loan ID from event logs
    const loanRequestCreatedEvent = receipt.logs.find((log) => {
      // Parse event from logs
      // Event: LoanRequestCreated(uint256 indexed loanId, address indexed borrower, uint256 amount, uint256 termDuration)
      return true; // Simplified - actual implementation needs to decode event
    });

    // For MVP, we'll need to read the loan ID from the contract
    // This is a limitation - we'll need to either:
    // 1. Read totalLoans before and after to get the new loan ID
    // 2. Use event logs to extract the loan ID
    // 3. Poll the contract for the new loan

    toast.success("Loan request created successfully!");
  }

  return {
    createLoanRequest,
    hash,
    isPending: isWritePending || isConfirming,
    isSuccess: isConfirmed,
    isError: !!writeError || !!receiptError,
    error: writeError || receiptError,
    reset,
  };
}
```

### Enhanced Hook with Event Listening

```typescript
// src/services/loans/useCreateLoanRequestWithEvents.ts

"use client";

import { useEffect, useState } from "react";
import { useAccount, useWatchContractEvent } from "wagmi";
import { parseEther } from "viem";
import { toast } from "sonner";
import { lendingMarketContract } from "@/lib/contracts/config";
import { useCreateLoanRequest } from "./useCreateLoanRequest";
import type { LoanRequestInput, LoanRequestResult } from "@/types/loans";

/**
 * Enhanced hook that listens for LoanRequestCreated events
 * to automatically retrieve the loan ID
 */
export function useCreateLoanRequestWithEvents({
  onSuccess,
  onError,
}: {
  onSuccess?: (result: LoanRequestResult) => void;
  onError?: (error: Error) => void;
} = {}) {
  const { address } = useAccount();
  const [pendingLoanId, setPendingLoanId] = useState<bigint | null>(null);

  const {
    createLoanRequest,
    hash,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  } = useCreateLoanRequest({
    onSuccess: (result) => {
      // Will be called after event is received
    },
    onError,
  });

  // Listen for LoanRequestCreated events
  useWatchContractEvent({
    ...lendingMarketContract,
    eventName: "LoanRequestCreated",
    onLogs(logs) {
      // Find the log for our transaction
      const relevantLog = logs.find((log) => {
        // Check if this log is from our transaction
        // and the borrower matches our address
        return log.args.borrower?.toLowerCase() === address?.toLowerCase();
      });

      if (relevantLog && relevantLog.args.loanId) {
        const loanId = relevantLog.args.loanId as bigint;
        setPendingLoanId(loanId);

        // Get full loan details
        const result: LoanRequestResult = {
          loanId,
          transactionHash: hash!,
          borrower: address!,
          amountRequested: relevantLog.args.amount as bigint,
          termDuration: relevantLog.args.termDuration as bigint,
        };

        toast.success(`Loan request #${loanId.toString()} created!`);
        onSuccess?.(result);
      }
    },
  });

  return {
    createLoanRequest,
    hash,
    loanId: pendingLoanId,
    isPending,
    isSuccess: isSuccess && pendingLoanId !== null,
    isError,
    error,
    reset: () => {
      setPendingLoanId(null);
      reset();
    },
  };
}
```

### Loan Details Hook

```typescript
// src/services/loans/useLoanDetails.ts

"use client";

import { useReadContract } from "wagmi";
import { lendingMarketContract } from "@/lib/contracts/config";
import type { Loan, LoanState } from "@/types/loans";

/**
 * Hook to read loan details from the contract
 */
export function useLoanDetails(loanId: bigint | null) {
  const {
    data: loanData,
    isLoading,
    isError,
    error,
    refetch,
  } = useReadContract({
    ...lendingMarketContract,
    functionName: "getLoan",
    args: loanId ? [loanId] : undefined,
    query: {
      enabled: loanId !== null,
      refetchInterval: (data) => {
        // Poll every 5 seconds if loan is in active state
        if (!data) return false;
        const state = data[9] as LoanState; // state is at index 9
        const activeStates = [
          LoanState.Vouching,
          LoanState.Crowdfunding,
          LoanState.Funded,
        ];
        return activeStates.includes(state) ? 5000 : false;
      },
    },
  });

  // Transform contract data to Loan type
  const loan: Loan | null = loanData
    ? {
        borrower: loanData[0],
        amountRequested: loanData[1],
        amountFunded: loanData[2],
        termDuration: loanData[3],
        interestRate: loanData[4],
        createdAt: loanData[5],
        vouchingDeadline: loanData[6],
        crowdfundingDeadline: loanData[7],
        repaymentDeadline: loanData[8],
        gracePeriodEnd: loanData[9],
        state: loanData[10] as LoanState,
        voucherCount: loanData[11],
      }
    : null;

  return {
    loan,
    isLoading,
    isError,
    error,
    refetch,
  };
}
```

## 3. UI Components

### Loan Request Form Component

```typescript
// src/components/loans/loan-request-form.tsx

"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useCreateLoanRequestWithEvents } from "@/services/loans/useCreateLoanRequestWithEvents";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LOAN_CONSTANTS } from "@/types/loans";
import { parseEther, formatEther } from "viem";
import type { LoanRequestInput } from "@/types/loans";

interface LoanRequestFormProps {
  onSuccess?: (loanId: bigint) => void;
  className?: string;
}

export function LoanRequestForm({
  onSuccess,
  className,
}: LoanRequestFormProps) {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState("");
  const [errors, setErrors] = useState<{ amount?: string }>({});

  const { createLoanRequest, loanId, isPending, isSuccess, isError, reset } =
    useCreateLoanRequestWithEvents({
      onSuccess: (result) => {
        toast.success(`Loan request #${result.loanId.toString()} created!`);
        onSuccess?.(result.loanId);
        // Reset form
        setAmount("");
        setErrors({});
      },
      onError: (error) => {
        toast.error(`Failed to create loan request: ${error.message}`);
      },
    });

  function validateAmount(value: string): string | undefined {
    if (!value || value.trim() === "") {
      return "Amount is required";
    }

    try {
      const parsed = parseEther(value);
      if (parsed < LOAN_CONSTANTS.MIN_AMOUNT) {
        return `Minimum amount is ${formatEther(
          LOAN_CONSTANTS.MIN_AMOUNT
        )} CRC`;
      }
      if (parsed > LOAN_CONSTANTS.MAX_AMOUNT) {
        return `Maximum amount is ${formatEther(
          LOAN_CONSTANTS.MAX_AMOUNT
        )} CRC`;
      }
    } catch {
      return "Invalid amount format";
    }
  }

  function handleAmountChange(value: string) {
    setAmount(value);
    const error = validateAmount(value);
    setErrors((prev) => ({ ...prev, amount: error }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    const amountError = validateAmount(amount);
    if (amountError) {
      setErrors({ amount: amountError });
      return;
    }

    const input: LoanRequestInput = {
      amountRequested: amount,
      termDuration: LOAN_CONSTANTS.DEFAULT_TERM_DURATION_DAYS,
    };

    createLoanRequest(input);
  }

  if (isSuccess && loanId) {
    return (
      <div className={className}>
        <div className="rounded-lg border border-green-500 bg-green-50 p-6 dark:bg-green-950">
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
            Loan Request Created!
          </h3>
          <p className="mt-2 text-green-700 dark:text-green-300">
            Your loan request #{loanId.toString()} has been created
            successfully. The vouching period has started.
          </p>
          <Button onClick={reset} variant="outline" className="mt-4">
            Create Another Loan
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-6">
        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-foreground"
          >
            Loan Amount (CRC)
          </label>
          <input
            id="amount"
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="0.00"
            disabled={isPending || !isConnected}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-destructive">{errors.amount}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground">
            Term Duration
          </label>
          <p className="mt-1 text-sm text-muted-foreground">
            {LOAN_CONSTANTS.DEFAULT_TERM_DURATION_DAYS} days (fixed for MVP)
          </p>
        </div>

        {!isConnected && (
          <div className="rounded-md border border-yellow-500 bg-yellow-50 p-4 dark:bg-yellow-950">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Please connect your wallet to create a loan request.
            </p>
          </div>
        )}

        <Button
          type="submit"
          disabled={isPending || !isConnected || !!errors.amount}
          className="w-full"
        >
          {isPending ? "Creating Loan Request..." : "Create Loan Request"}
        </Button>
      </div>
    </form>
  );
}
```

### Loan Details Display Component

```typescript
// src/components/loans/loan-details.tsx

"use client";

import { useLoanDetails } from "@/services/loans/useLoanDetails";
import { LoanState } from "@/types/loans";
import { formatEther } from "viem";
import { formatDistanceToNow } from "date-fns";

interface LoanDetailsProps {
  loanId: bigint;
  className?: string;
}

export function LoanDetails({ loanId, className }: LoanDetailsProps) {
  const { loan, isLoading, isError, error } = useLoanDetails(loanId);

  if (isLoading) {
    return (
      <div className={className}>
        <p>Loading loan details...</p>
      </div>
    );
  }

  if (isError || !loan) {
    return (
      <div className={className}>
        <p className="text-destructive">
          {error?.message || "Failed to load loan details"}
        </p>
      </div>
    );
  }

  const stateLabels: Record<LoanState, string> = {
    [LoanState.Requested]: "Requested",
    [LoanState.Vouching]: "Vouching",
    [LoanState.Crowdfunding]: "Crowdfunding",
    [LoanState.Funded]: "Funded",
    [LoanState.Repaid]: "Repaid",
    [LoanState.Defaulted]: "Defaulted",
  };

  return (
    <div className={className}>
      <div className="space-y-4 rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Loan #{loanId.toString()}</h3>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              loan.state === LoanState.Vouching
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                : loan.state === LoanState.Crowdfunding
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                : loan.state === LoanState.Funded
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
            }`}
          >
            {stateLabels[loan.state]}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Amount Requested</p>
            <p className="text-lg font-semibold">
              {formatEther(loan.amountRequested)} CRC
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Amount Funded</p>
            <p className="text-lg font-semibold">
              {formatEther(loan.amountFunded)} CRC
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Vouchers</p>
            <p className="text-lg font-semibold">
              {loan.voucherCount.toString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Interest Rate</p>
            <p className="text-lg font-semibold">
              {(Number(loan.interestRate) / 100).toFixed(2)}%
            </p>
          </div>
        </div>

        {loan.state === LoanState.Vouching && (
          <div className="rounded-md border border-blue-200 bg-blue-50 p-4 dark:bg-blue-950">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Vouching deadline:{" "}
              {formatDistanceToNow(
                new Date(Number(loan.vouchingDeadline) * 1000),
                {
                  addSuffix: true,
                }
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
```

## 4. Data Flow

### Complete Flow Diagram

```
1. User Input
   │
   ├─> User enters loan amount in form
   ├─> Form validates input (client-side)
   └─> User clicks "Create Loan Request"

2. Service Layer
   │
   ├─> useCreateLoanRequestWithEvents hook called
   ├─> Input converted: string → parseEther → bigint
   ├─> Term duration: days → seconds (BigInt)
   └─> writeContract called with wagmi

3. Blockchain Transaction
   │
   ├─> Transaction sent to Gnosis Chain
   ├─> User approves transaction in wallet
   ├─> Transaction pending (isPending = true)
   └─> Transaction confirmed (receipt received)

4. Event Listening
   │
   ├─> useWatchContractEvent listens for LoanRequestCreated
   ├─> Event received with loanId, borrower, amount, termDuration
   ├─> Loan ID extracted and stored
   └─> onSuccess callback triggered

5. UI Update
   │
   ├─> Success state displayed
   ├─> Loan ID shown to user
   ├─> Form reset (optional)
   └─> Navigation to loan details (optional)

6. Loan Details Polling
   │
   ├─> useLoanDetails hook called with loanId
   ├─> Contract read: getLoan(loanId)
   ├─> Loan data transformed to Loan type
   ├─> UI displays loan information
   └─> Auto-refresh every 5s if loan is active
```

### Error Handling Flow

```
Error Scenarios:
├─> Validation Error (client-side)
│   └─> Display error message in form, prevent submission
│
├─> Wallet Not Connected
│   └─> Show message, prompt to connect wallet
│
├─> Transaction Rejected
│   └─> Show toast error, allow retry
│
├─> Transaction Failed (on-chain)
│   └─> Show error toast with reason, allow retry
│
├─> Event Not Received (timeout)
│   └─> Fallback: Poll contract for new loan ID
│       (Compare totalLoans before/after transaction)
│
└─> Network Error
    └─> Show error toast, allow retry
```

## 5. Integration Points

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_LENDING_MARKET_ADDRESS=0x... # Contract address on Gnosis
```

### Contract Address Configuration

The contract address should be:

- Deployed on Gnosis Chain (Chain ID: 100)
- Configured in environment variables
- Validated at build/runtime

### Wagmi Configuration

Ensure Gnosis Chain is configured in `wagmi-config.tsx`:

```typescript
import { gnosis } from "viem/chains";

// Add gnosis to chains array
chains: [gnosis, ...otherChains],

// Add transport for gnosis
transports: {
  [gnosis.id]: http("https://rpc.gnosischain.com"),
  ...otherTransports,
}
```

## 6. Testing Considerations

### Unit Tests

- Form validation logic
- Amount conversion (string → bigint)
- Term duration conversion (days → seconds)
- Error handling

### Integration Tests

- Contract interaction flow
- Event listening
- State management
- Error scenarios

### E2E Tests

- Complete loan request flow
- Wallet connection
- Transaction approval
- Success state display

## 7. Future Enhancements

1. **Loan ID Extraction**: Improve event parsing to reliably extract loan ID
2. **Transaction History**: Store loan requests in local storage or backend
3. **Loan List View**: Display all user's loans
4. **Real-time Updates**: WebSocket connection for instant updates
5. **Advanced Validation**: Check user's CRC balance before submission
6. **Gas Estimation**: Show estimated gas cost before transaction
7. **Transaction History**: Link to block explorer for transaction details

## 8. File Structure

```
src/
├── components/
│   └── loans/
│       ├── loan-request-form.tsx
│       └── loan-details.tsx
├── services/
│   └── loans/
│       ├── useCreateLoanRequest.ts
│       ├── useCreateLoanRequestWithEvents.ts
│       └── useLoanDetails.ts
├── lib/
│   └── contracts/
│       ├── config.ts
│       ├── InnerCirclesLendingMarketABI.ts
│       └── InnerCirclesLendingMarket.sol
└── types/
    └── loans.ts
```

## Summary

This design provides:

- ✅ Complete UI components for loan request flow
- ✅ Type-safe service layer using Wagmi v3 hooks
- ✅ Event-driven architecture for real-time updates
- ✅ Comprehensive error handling
- ✅ Polling mechanism for active loans
- ✅ Clear data flow documentation
- ✅ Integration patterns following project conventions

The implementation follows Next.js 15 App Router patterns, uses Wagmi v3 for contract interactions, and maintains type safety throughout the stack.
