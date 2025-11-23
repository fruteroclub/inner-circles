const InnerCirclesLendingMarketABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_crcToken",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "target",
        type: "address",
      },
    ],
    name: "AddressEmptyCode",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "AddressInsufficientBalance",
    type: "error",
  },
  {
    inputs: [],
    name: "FailedInnerCall",
    type: "error",
  },
  {
    inputs: [],
    name: "InnerCirclesLendingMarket__AlreadyVouched",
    type: "error",
  },
  {
    inputs: [],
    name: "InnerCirclesLendingMarket__CrowdfundingPeriodEnded",
    type: "error",
  },
  {
    inputs: [],
    name: "InnerCirclesLendingMarket__GracePeriodNotEnded",
    type: "error",
  },
  {
    inputs: [],
    name: "InnerCirclesLendingMarket__InsufficientBalance",
    type: "error",
  },
  {
    inputs: [],
    name: "InnerCirclesLendingMarket__InsufficientVouchers",
    type: "error",
  },
  {
    inputs: [],
    name: "InnerCirclesLendingMarket__InvalidAmount",
    type: "error",
  },
  {
    inputs: [],
    name: "InnerCirclesLendingMarket__InvalidContributionAmount",
    type: "error",
  },
  {
    inputs: [],
    name: "InnerCirclesLendingMarket__InvalidLoanState",
    type: "error",
  },
  {
    inputs: [],
    name: "InnerCirclesLendingMarket__LoanAlreadyRepaid",
    type: "error",
  },
  {
    inputs: [],
    name: "InnerCirclesLendingMarket__LoanDoesNotExist",
    type: "error",
  },
  {
    inputs: [],
    name: "InnerCirclesLendingMarket__LoanNotFullyFunded",
    type: "error",
  },
  {
    inputs: [],
    name: "InnerCirclesLendingMarket__LoanNotInDefault",
    type: "error",
  },
  {
    inputs: [],
    name: "InnerCirclesLendingMarket__NotBorrower",
    type: "error",
  },
  {
    inputs: [],
    name: "InnerCirclesLendingMarket__RepaymentPeriodNotReached",
    type: "error",
  },
  {
    inputs: [],
    name: "InnerCirclesLendingMarket__TransferFailed",
    type: "error",
  },
  {
    inputs: [],
    name: "InnerCirclesLendingMarket__VouchingPeriodEnded",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "SafeERC20FailedOperation",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "loanId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "lender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Crowdfunded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "loanId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "oldGracePeriod",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newGracePeriod",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "modifiedBy",
        type: "address",
      },
    ],
    name: "GracePeriodModified",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "loanId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "voucherCount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "interestRate",
        type: "uint256",
      },
    ],
    name: "InterestRateCalculated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "loanId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "borrower",
        type: "address",
      },
    ],
    name: "LoanConfirmed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "loanId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "borrower",
        type: "address",
      },
    ],
    name: "LoanDefaulted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "loanId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "totalAmount",
        type: "uint256",
      },
    ],
    name: "LoanFunded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "loanId",
        type: "uint256",
      },
    ],
    name: "LoanRepaid",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "loanId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "borrower",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "termDuration",
        type: "uint256",
      },
    ],
    name: "LoanRequestCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "loanId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "borrower",
        type: "address",
      },
    ],
    name: "MembershipSuspended",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "loanId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "oldDeadline",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newDeadline",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "modifiedBy",
        type: "address",
      },
    ],
    name: "RepaymentDeadlineModified",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "loanId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "borrower",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "principal",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "interest",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "totalRepaid",
        type: "uint256",
      },
    ],
    name: "RepaymentMade",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "loanId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "oldDuration",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newDuration",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "modifiedBy",
        type: "address",
      },
    ],
    name: "TermDurationModified",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "loanId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "borrower",
        type: "address",
      },
    ],
    name: "TrustRemovalRecommended",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "loanId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "voucher",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Vouched",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "loanId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "oldDeadline",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newDeadline",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "modifiedBy",
        type: "address",
      },
    ],
    name: "VouchingDeadlineModified",
    type: "event",
  },
  {
    inputs: [],
    name: "CONTRIBUTION_AMOUNT_1",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "CONTRIBUTION_AMOUNT_2",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "CONTRIBUTION_AMOUNT_5",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "DEFAULT_GRACE_PERIOD",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "DEFAULT_TERM_DURATION",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "DEFAULT_VOUCHING_PERIOD",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MIN_VOUCHERS",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "VOUCHER_AMOUNT",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "amountRepaid",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "voucherCount",
        type: "uint256",
      },
    ],
    name: "calculateInterestRate",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "loanId",
        type: "uint256",
      },
    ],
    name: "calculateTotalOwed",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "loanId",
        type: "uint256",
      },
    ],
    name: "confirmLoanTerms",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "loanId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "contributeToLoan",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "crcToken",
    outputs: [
      {
        internalType: "contract IERC20",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amountRequested",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "termDuration",
        type: "uint256",
      },
    ],
    name: "createLoanRequest",
    outputs: [
      {
        internalType: "uint256",
        name: "loanId",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "loanId",
        type: "uint256",
      },
    ],
    name: "disburseLoan",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "loanId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "lender",
        type: "address",
      },
    ],
    name: "getLenderContribution",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "loanId",
        type: "uint256",
      },
    ],
    name: "getLoan",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "borrower",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "amountRequested",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amountFunded",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "termDuration",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "interestRate",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "createdAt",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "vouchingDeadline",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "crowdfundingDeadline",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "repaymentDeadline",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "gracePeriodEnd",
            type: "uint256",
          },
          {
            internalType: "enum InnerCirclesLendingMarket.LoanState",
            name: "state",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "voucherCount",
            type: "uint256",
          },
        ],
        internalType: "struct InnerCirclesLendingMarket.Loan",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "loanId",
        type: "uint256",
      },
    ],
    name: "getTotalContributions",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "loanId",
        type: "uint256",
      },
    ],
    name: "getVouchers",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "loanId",
        type: "uint256",
      },
    ],
    name: "isLoanInDefault",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "isVoucher",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "lenderContributions",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "lenders",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "loans",
    outputs: [
      {
        internalType: "address",
        name: "borrower",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amountRequested",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amountFunded",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "termDuration",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "interestRate",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "createdAt",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "vouchingDeadline",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "crowdfundingDeadline",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "repaymentDeadline",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "gracePeriodEnd",
        type: "uint256",
      },
      {
        internalType: "enum InnerCirclesLendingMarket.LoanState",
        name: "state",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "voucherCount",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "loanId",
        type: "uint256",
      },
    ],
    name: "markLoanAsDefaulted",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "loanId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "repayLoan",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "loanId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "newGracePeriod",
        type: "uint256",
      },
    ],
    name: "setGracePeriod",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "loanId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "newDeadline",
        type: "uint256",
      },
    ],
    name: "setRepaymentDeadline",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "loanId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "newDuration",
        type: "uint256",
      },
    ],
    name: "setTermDuration",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "loanId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "newDeadline",
        type: "uint256",
      },
    ],
    name: "setVouchingDeadline",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "totalLoans",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "loanId",
        type: "uint256",
      },
    ],
    name: "vouchForLoan",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "vouchers",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export default InnerCirclesLendingMarketABI;
