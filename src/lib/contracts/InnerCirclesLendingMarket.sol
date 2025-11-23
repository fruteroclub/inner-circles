// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title Inner Circles Lending Market
 * @notice A smart contract for the Inner Circles Credit System that enables community-based lending
 *         using CRC (Circles) tokens. Implements vouching mechanism, dynamic interest rate calculation,
 *         and prioritized repayment system.
 * @dev This contract handles the complete loan lifecycle: Request → Vouching → Crowdfunding → Funded → Repaid/Default
 */
contract InnerCirclesLendingMarket {
    using SafeERC20 for IERC20;

    // ============ Constants ============
    uint256 public constant VOUCHER_AMOUNT = 1 ether; // 1 CRC (assuming 18 decimals)
    uint256 public constant MIN_VOUCHERS = 3;

    uint256 public constant DEFAULT_VOUCHING_PERIOD = 2 days;
    uint256 public constant DEFAULT_TERM_DURATION = 30 days;
    uint256 public constant DEFAULT_GRACE_PERIOD = 7 days;

    uint256 public constant CONTRIBUTION_AMOUNT_1 = 1 ether;
    uint256 public constant CONTRIBUTION_AMOUNT_2 = 2 ether;
    uint256 public constant CONTRIBUTION_AMOUNT_5 = 5 ether;

    // ============ State Variables ============
    IERC20 public immutable crcToken;

    uint256 private s_nextLoanId = 1;

    uint256 public totalLoans;

    // ============ Mappings ============

    /// @notice Maps loan ID to Loan struct
    mapping(uint256 => Loan) public loans;

    /// @notice Maps loan ID to array of voucher addresses
    mapping(uint256 => address[]) public vouchers;

    /// @notice Maps loan ID and lender address to their contribution amount
    mapping(uint256 => mapping(address => uint256)) public lenderContributions;

    /// @notice Maps loan ID and address to whether they are a voucher
    mapping(uint256 => mapping(address => bool)) public isVoucher;

    /// @notice Maps loan ID to array of all lender addresses (for iteration)
    mapping(uint256 => address[]) public lenders;

    /// @notice Maps loan ID to total amount repaid
    mapping(uint256 => uint256) public amountRepaid;

    // ============ Structs ============

    /**
     * @notice Represents a loan in the system
     * @param borrower Address of the borrower
     * @param amountRequested Original amount requested by borrower
     * @param amountFunded Total amount funded by lenders
     * @param termDuration Loan term duration in seconds
     * @param interestRate Interest rate in basis points (e.g., 500 = 5%)
     * @param createdAt Timestamp when loan was created
     * @param vouchingDeadline Timestamp when vouching period ends
     * @param crowdfundingDeadline Timestamp when crowdfunding period ends
     * @param repaymentDeadline Timestamp when repayment is due
     * @param gracePeriodEnd Timestamp when grace period ends (after repayment deadline)
     * @param state Current state of the loan
     * @param voucherCount Number of vouchers for this loan
     */
    struct Loan {
        address borrower;
        uint256 amountRequested;
        uint256 amountFunded;
        uint256 termDuration;
        uint256 interestRate; // in basis points
        uint256 createdAt;
        uint256 vouchingDeadline;
        uint256 crowdfundingDeadline;
        uint256 repaymentDeadline;
        uint256 gracePeriodEnd;
        LoanState state;
        uint256 voucherCount;
    }

    // ============ Enums ============

    /**
     * @notice Loan lifecycle states
     */
    enum LoanState {
        Requested, // Loan created, waiting for vouches
        Vouching, // Vouching period active
        Crowdfunding, // Borrower confirmed, open for additional funding
        Funded, // Fully funded and disbursed, repayment period active
        Repaid, // Fully repaid
        Defaulted // Defaulted after grace period
    }

    // ============ Events ============

    event LoanRequestCreated(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 amount,
        uint256 termDuration
    );

    event Vouched(
        uint256 indexed loanId,
        address indexed voucher,
        uint256 amount
    );

    event InterestRateCalculated(
        uint256 indexed loanId,
        uint256 voucherCount,
        uint256 interestRate
    );

    event LoanConfirmed(uint256 indexed loanId, address indexed borrower);

    event Crowdfunded(
        uint256 indexed loanId,
        address indexed lender,
        uint256 amount
    );

    event LoanFunded(uint256 indexed loanId, uint256 totalAmount);

    event RepaymentMade(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 principal,
        uint256 interest,
        uint256 totalRepaid
    );

    event LoanRepaid(uint256 indexed loanId);

    event LoanDefaulted(uint256 indexed loanId, address indexed borrower);

    event TrustRemovalRecommended(
        uint256 indexed loanId,
        address indexed borrower
    );

    /**
     * @notice Emitted when a loan defaults, signaling backend to suspend ENS membership off-chain
     * @dev Backend services listen to this event to handle ENS membership suspension
     */
    event MembershipSuspended(uint256 indexed loanId, address indexed borrower);

    // Admin function events (open to all, for demo/judging purposes)
    event VouchingDeadlineModified(
        uint256 indexed loanId,
        uint256 oldDeadline,
        uint256 newDeadline,
        address indexed modifiedBy
    );

    event RepaymentDeadlineModified(
        uint256 indexed loanId,
        uint256 oldDeadline,
        uint256 newDeadline,
        address indexed modifiedBy
    );

    event TermDurationModified(
        uint256 indexed loanId,
        uint256 oldDuration,
        uint256 newDuration,
        address indexed modifiedBy
    );

    event GracePeriodModified(
        uint256 indexed loanId,
        uint256 oldGracePeriod,
        uint256 newGracePeriod,
        address indexed modifiedBy
    );

    // ============ Errors ============

    error InnerCirclesLendingMarket__InvalidAmount();
    error InnerCirclesLendingMarket__LoanDoesNotExist();
    error InnerCirclesLendingMarket__InvalidLoanState();
    error InnerCirclesLendingMarket__InsufficientVouchers();
    error InnerCirclesLendingMarket__VouchingPeriodEnded();
    error InnerCirclesLendingMarket__CrowdfundingPeriodEnded();
    error InnerCirclesLendingMarket__LoanNotFullyFunded();
    error InnerCirclesLendingMarket__RepaymentPeriodNotReached();
    error InnerCirclesLendingMarket__InsufficientBalance();
    error InnerCirclesLendingMarket__TransferFailed();
    error InnerCirclesLendingMarket__NotBorrower();
    error InnerCirclesLendingMarket__AlreadyVouched();
    error InnerCirclesLendingMarket__InvalidContributionAmount();
    error InnerCirclesLendingMarket__LoanAlreadyRepaid();
    error InnerCirclesLendingMarket__GracePeriodNotEnded();
    error InnerCirclesLendingMarket__LoanNotInDefault();

    // ============ Constructor ============

    /**
     * @notice Initializes the contract with CRC token address
     * @param _crcToken Address of the CRC ERC20 token contract
     * @dev ENS membership management is handled off-chain by backend services listening to contract events
     */
    constructor(address _crcToken) {
        if (_crcToken == address(0)) {
            revert InnerCirclesLendingMarket__InvalidAmount();
        }
        crcToken = IERC20(_crcToken);
    }

    // ============ External Functions ============

    /**
     * @notice Creates a new loan request
     * @param amountRequested Amount of CRC tokens requested
     * @param termDuration Loan term duration in seconds (for MVP, typically 30 days)
     * @return loanId The ID of the newly created loan
     */
    function createLoanRequest(
        uint256 amountRequested,
        uint256 termDuration
    ) external returns (uint256 loanId) {
        if (amountRequested == 0 || termDuration == 0) {
            revert InnerCirclesLendingMarket__InvalidAmount();
        }

        loanId = s_nextLoanId;
        s_nextLoanId++;

        uint256 vouchingDeadline = block.timestamp + DEFAULT_VOUCHING_PERIOD;

        loans[loanId] = Loan({
            borrower: msg.sender,
            amountRequested: amountRequested,
            amountFunded: 0,
            termDuration: termDuration,
            interestRate: 0,
            createdAt: block.timestamp,
            vouchingDeadline: vouchingDeadline,
            crowdfundingDeadline: 0,
            repaymentDeadline: 0,
            gracePeriodEnd: 0,
            state: LoanState.Vouching,
            voucherCount: 0
        });

        totalLoans++;

        emit LoanRequestCreated(
            loanId,
            msg.sender,
            amountRequested,
            termDuration
        );
        return loanId;
    }

    /**
     * @notice Allows a community member to vouch for a loan by depositing 1 CRC
     * @param loanId The ID of the loan to vouch for
     * @dev Each voucher deposits exactly 1 CRC and becomes an early-stage lender
     */
    function vouchForLoan(uint256 loanId) external {
        Loan storage loan = loans[loanId];
        if (loan.borrower == address(0)) {
            revert InnerCirclesLendingMarket__LoanDoesNotExist();
        }
        if (loan.state != LoanState.Vouching) {
            revert InnerCirclesLendingMarket__InvalidLoanState();
        }
        if (block.timestamp > loan.vouchingDeadline) {
            revert InnerCirclesLendingMarket__VouchingPeriodEnded();
        }
        if (isVoucher[loanId][msg.sender]) {
            revert InnerCirclesLendingMarket__AlreadyVouched();
        }

        // Transfer 1 CRC from voucher to contract
        crcToken.safeTransferFrom(msg.sender, address(this), VOUCHER_AMOUNT);

        // Record voucher
        vouchers[loanId].push(msg.sender);
        isVoucher[loanId][msg.sender] = true;
        loan.voucherCount++;

        // Track contribution
        lenderContributions[loanId][msg.sender] = VOUCHER_AMOUNT;
        lenders[loanId].push(msg.sender);

        emit Vouched(loanId, msg.sender, VOUCHER_AMOUNT);
    }

    /**
     * @notice Borrower confirms loan terms and transitions to crowdfunding phase
     * @param loanId The ID of the loan to confirm
     * @dev Requires minimum 3 vouchers and calculates interest rate based on voucher count
     */
    function confirmLoanTerms(uint256 loanId) external {
        Loan storage loan = loans[loanId];
        if (loan.borrower == address(0)) {
            revert InnerCirclesLendingMarket__LoanDoesNotExist();
        }
        if (msg.sender != loan.borrower) {
            revert InnerCirclesLendingMarket__NotBorrower();
        }
        if (loan.state != LoanState.Vouching) {
            revert InnerCirclesLendingMarket__InvalidLoanState();
        }
        if (loan.voucherCount < MIN_VOUCHERS) {
            revert InnerCirclesLendingMarket__InsufficientVouchers();
        }

        // Calculate interest rate based on voucher count
        uint256 interestRate = calculateInterestRate(loan.voucherCount);
        loan.interestRate = interestRate;

        // Transition to crowdfunding
        loan.state = LoanState.Crowdfunding;
        loan.crowdfundingDeadline = block.timestamp + DEFAULT_VOUCHING_PERIOD; // Same period for crowdfunding

        emit InterestRateCalculated(loanId, loan.voucherCount, interestRate);
        emit LoanConfirmed(loanId, msg.sender);
    }

    /**
     * @notice Allows lenders to contribute to a loan during crowdfunding phase
     * @param loanId The ID of the loan to contribute to
     * @param amount Contribution amount (must be 1, 2, or 5 CRC)
     * @dev Vouchers can increase their stake, or new lenders can join
     */
    function contributeToLoan(uint256 loanId, uint256 amount) external {
        Loan storage loan = loans[loanId];
        if (loan.borrower == address(0)) {
            revert InnerCirclesLendingMarket__LoanDoesNotExist();
        }
        if (loan.state != LoanState.Crowdfunding) {
            revert InnerCirclesLendingMarket__InvalidLoanState();
        }
        if (block.timestamp > loan.crowdfundingDeadline) {
            revert InnerCirclesLendingMarket__CrowdfundingPeriodEnded();
        }

        // Validate contribution amount (must be 1, 2, or 5 CRC)
        if (
            amount != CONTRIBUTION_AMOUNT_1 &&
            amount != CONTRIBUTION_AMOUNT_2 &&
            amount != CONTRIBUTION_AMOUNT_5
        ) {
            revert InnerCirclesLendingMarket__InvalidContributionAmount();
        }

        // Check if loan is already fully funded
        if (loan.amountFunded >= loan.amountRequested) {
            revert InnerCirclesLendingMarket__LoanNotFullyFunded();
        }

        // Calculate how much can still be contributed
        uint256 remainingNeeded = loan.amountRequested - loan.amountFunded;
        uint256 contributionAmount = amount > remainingNeeded
            ? remainingNeeded
            : amount;

        // Transfer CRC from lender to contract
        crcToken.safeTransferFrom(
            msg.sender,
            address(this),
            contributionAmount
        );

        // Track contribution
        lenderContributions[loanId][msg.sender] += contributionAmount;
        loan.amountFunded += contributionAmount;

        // Add to lenders list if not already there
        bool isExistingLender = false;
        for (uint256 i = 0; i < lenders[loanId].length; i++) {
            if (lenders[loanId][i] == msg.sender) {
                isExistingLender = true;
                break;
            }
        }
        if (!isExistingLender) {
            lenders[loanId].push(msg.sender);
        }

        emit Crowdfunded(loanId, msg.sender, contributionAmount);

        // Check if loan is now fully funded
        if (loan.amountFunded >= loan.amountRequested) {
            emit LoanFunded(loanId, loan.amountFunded);
        }
    }

    /**
     * @notice Borrower disburses the loan after it's fully funded
     * @param loanId The ID of the loan to disburse
     * @dev Transfers loan amount to borrower and sets repayment deadline
     */
    function disburseLoan(uint256 loanId) external {
        Loan storage loan = loans[loanId];
        if (loan.borrower == address(0)) {
            revert InnerCirclesLendingMarket__LoanDoesNotExist();
        }
        if (msg.sender != loan.borrower) {
            revert InnerCirclesLendingMarket__NotBorrower();
        }
        if (loan.state != LoanState.Crowdfunding) {
            revert InnerCirclesLendingMarket__InvalidLoanState();
        }
        if (loan.amountFunded < loan.amountRequested) {
            revert InnerCirclesLendingMarket__LoanNotFullyFunded();
        }

        // Transfer loan amount to borrower
        crcToken.safeTransfer(loan.borrower, loan.amountRequested);

        // Transition to Funded state
        loan.state = LoanState.Funded;
        loan.repaymentDeadline = block.timestamp + loan.termDuration;
        loan.gracePeriodEnd = loan.repaymentDeadline + DEFAULT_GRACE_PERIOD;
    }

    /**
     * @notice Borrower makes a repayment (supports partial repayments)
     * @param loanId The ID of the loan to repay
     * @param amount Amount to repay (principal + interest)
     * @dev Distributes repayment with priority: external lenders → vouchers
     */
    function repayLoan(uint256 loanId, uint256 amount) external {
        Loan storage loan = loans[loanId];
        if (loan.borrower == address(0)) {
            revert InnerCirclesLendingMarket__LoanDoesNotExist();
        }
        if (loan.state != LoanState.Funded) {
            revert InnerCirclesLendingMarket__InvalidLoanState();
        }
        if (amount == 0) {
            revert InnerCirclesLendingMarket__InvalidAmount();
        }

        uint256 totalOwed = calculateTotalOwed(loanId);
        uint256 remainingOwed = totalOwed - amountRepaid[loanId];

        if (amount > remainingOwed) {
            amount = remainingOwed;
        }

        crcToken.safeTransferFrom(msg.sender, address(this), amount);

        _distributeRepayment(loanId, amount, totalOwed);

        amountRepaid[loanId] += amount;

        uint256 principalPortion = (amount * loan.amountFunded) / totalOwed;
        uint256 interestPortion = amount - principalPortion;

        emit RepaymentMade(
            loanId,
            msg.sender,
            principalPortion,
            interestPortion,
            amountRepaid[loanId]
        );

        if (amountRepaid[loanId] >= totalOwed) {
            loan.state = LoanState.Repaid;
            emit LoanRepaid(loanId);
        }
    }

    /**
     * @notice Internal function to distribute repayment with priority: external lenders → vouchers
     * @param loanId The ID of the loan
     * @param repaymentAmount Total amount to distribute
     * @param totalOwed Total amount owed (principal + interest)
     * @return remainingRepayment Any remaining repayment that couldn't be distributed
     */
    function _distributeRepayment(
        uint256 loanId,
        uint256 repaymentAmount,
        uint256 totalOwed
    ) internal returns (uint256 remainingRepayment) {
        Loan memory loan = loans[loanId];
        uint256 totalInterest = (loan.amountFunded * loan.interestRate) / 10000;
        remainingRepayment = repaymentAmount;

        // Calculate total contributions for external lenders
        uint256 externalLendersTotal = _getExternalLendersTotal(loanId);

        // Distribute to external lenders first
        if (externalLendersTotal > 0 && remainingRepayment > 0) {
            remainingRepayment = _distributeToExternalLenders(
                loanId,
                remainingRepayment,
                externalLendersTotal,
                totalInterest,
                totalOwed
            );
        }

        // Then distribute to vouchers
        if (remainingRepayment > 0) {
            remainingRepayment = _distributeToVouchers(
                loanId,
                remainingRepayment,
                totalInterest,
                totalOwed
            );
        }
    }

    /**
     * @notice Gets total contributions from external lenders (non-vouchers)
     */
    function _getExternalLendersTotal(
        uint256 loanId
    ) internal view returns (uint256 total) {
        for (uint256 i = 0; i < lenders[loanId].length; i++) {
            if (!isVoucher[loanId][lenders[loanId][i]]) {
                total += lenderContributions[loanId][lenders[loanId][i]];
            }
        }
    }

    /**
     * @notice Distributes repayment to external lenders
     */
    function _distributeToExternalLenders(
        uint256 loanId,
        uint256 remainingRepayment,
        uint256 externalLendersTotal,
        uint256 totalInterest,
        uint256 totalOwed
    ) internal returns (uint256) {
        Loan memory loan = loans[loanId];
        for (
            uint256 i = 0;
            i < lenders[loanId].length && remainingRepayment > 0;
            i++
        ) {
            address lender = lenders[loanId][i];
            if (isVoucher[loanId][lender]) {
                continue;
            }

            uint256 contribution = lenderContributions[loanId][lender];
            uint256 interest = (contribution * totalInterest) /
                loan.amountFunded;
            uint256 totalOwedToLender = contribution + interest;
            uint256 repaidSoFar = (totalOwedToLender * amountRepaid[loanId]) /
                totalOwed;
            uint256 remainingOwed = totalOwedToLender - repaidSoFar;

            if (remainingOwed > 0 && remainingRepayment > 0) {
                uint256 share = (contribution * remainingRepayment) /
                    externalLendersTotal;
                if (share > remainingOwed) share = remainingOwed;
                if (share > remainingRepayment) share = remainingRepayment;

                crcToken.safeTransfer(lender, share);
                remainingRepayment -= share;
            }
        }
        return remainingRepayment;
    }

    /**
     * @notice Distributes repayment to vouchers
     */
    function _distributeToVouchers(
        uint256 loanId,
        uint256 remainingRepayment,
        uint256 totalInterest,
        uint256 totalOwed
    ) internal returns (uint256) {
        Loan memory loan = loans[loanId];
        uint256 vouchersTotal = 0;
        for (uint256 i = 0; i < vouchers[loanId].length; i++) {
            vouchersTotal += lenderContributions[loanId][vouchers[loanId][i]];
        }

        if (vouchersTotal > 0) {
            for (
                uint256 i = 0;
                i < vouchers[loanId].length && remainingRepayment > 0;
                i++
            ) {
                address voucher = vouchers[loanId][i];
                uint256 contribution = lenderContributions[loanId][voucher];
                uint256 interest = (contribution * totalInterest) /
                    loan.amountFunded;
                uint256 totalOwedToVoucher = contribution + interest;
                uint256 repaidSoFar = (totalOwedToVoucher *
                    amountRepaid[loanId]) / totalOwed;
                uint256 remainingOwed = totalOwedToVoucher - repaidSoFar;

                if (remainingOwed > 0 && remainingRepayment > 0) {
                    uint256 share = (contribution * remainingRepayment) /
                        vouchersTotal;
                    if (share > remainingOwed) share = remainingOwed;
                    if (share > remainingRepayment) share = remainingRepayment;

                    crcToken.safeTransfer(voucher, share);
                    remainingRepayment -= share;
                }
            }
        }
        return remainingRepayment;
    }

    /**
     * @notice Marks a loan as defaulted after grace period ends
     * @param loanId The ID of the loan to mark as defaulted
     * @dev Can be called by anyone after grace period ends. Emits events for off-chain backend handling:
     *      - TrustRemovalRecommended: Signals backend to recommend trust removal in Circles trust graph
     *      - MembershipSuspended: Signals backend to suspend ENS membership off-chain
     */
    function markLoanAsDefaulted(uint256 loanId) external {
        Loan storage loan = loans[loanId];
        if (loan.borrower == address(0)) {
            revert InnerCirclesLendingMarket__LoanDoesNotExist();
        }
        if (loan.state != LoanState.Funded) {
            revert InnerCirclesLendingMarket__InvalidLoanState();
        }
        if (block.timestamp < loan.gracePeriodEnd) {
            revert InnerCirclesLendingMarket__GracePeriodNotEnded();
        }

        // Calculate total owed
        uint256 totalOwed = calculateTotalOwed(loanId);
        if (amountRepaid[loanId] >= totalOwed) {
            revert InnerCirclesLendingMarket__LoanAlreadyRepaid();
        }

        // Mark as defaulted
        loan.state = LoanState.Defaulted;

        // Emit events for off-chain handling (backend listens to these for ENS membership management)
        emit LoanDefaulted(loanId, loan.borrower);
        emit TrustRemovalRecommended(loanId, loan.borrower);
        emit MembershipSuspended(loanId, loan.borrower);
    }

    // ============ Admin Functions (Open to All for Demo/Judging) ============

    /**
     * @notice Modifies the vouching deadline for a loan (open to all for demo/judging purposes)
     * @param loanId The ID of the loan
     * @param newDeadline New vouching deadline timestamp
     * @dev Emits event to notify of modification
     */
    function setVouchingDeadline(uint256 loanId, uint256 newDeadline) external {
        Loan storage loan = loans[loanId];
        if (loan.borrower == address(0)) {
            revert InnerCirclesLendingMarket__LoanDoesNotExist();
        }
        if (loan.state != LoanState.Vouching) {
            revert InnerCirclesLendingMarket__InvalidLoanState();
        }

        uint256 oldDeadline = loan.vouchingDeadline;
        loan.vouchingDeadline = newDeadline;

        emit VouchingDeadlineModified(
            loanId,
            oldDeadline,
            newDeadline,
            msg.sender
        );
    }

    /**
     * @notice Modifies the repayment deadline for a loan (open to all for demo/judging purposes)
     * @param loanId The ID of the loan
     * @param newDeadline New repayment deadline timestamp
     * @dev Emits event to notify of modification
     */
    function setRepaymentDeadline(
        uint256 loanId,
        uint256 newDeadline
    ) external {
        Loan storage loan = loans[loanId];
        if (loan.borrower == address(0)) {
            revert InnerCirclesLendingMarket__LoanDoesNotExist();
        }
        if (loan.state != LoanState.Funded) {
            revert InnerCirclesLendingMarket__InvalidLoanState();
        }

        uint256 oldDeadline = loan.repaymentDeadline;
        loan.repaymentDeadline = newDeadline;
        // Update grace period end accordingly
        loan.gracePeriodEnd = newDeadline + DEFAULT_GRACE_PERIOD;

        emit RepaymentDeadlineModified(
            loanId,
            oldDeadline,
            newDeadline,
            msg.sender
        );
    }

    /**
     * @notice Modifies the term duration for a loan (open to all for demo/judging purposes)
     * @param loanId The ID of the loan
     * @param newDuration New term duration in seconds
     * @dev Emits event to notify of modification. Only works before loan is funded.
     */
    function setTermDuration(uint256 loanId, uint256 newDuration) external {
        Loan storage loan = loans[loanId];
        if (loan.borrower == address(0)) {
            revert InnerCirclesLendingMarket__LoanDoesNotExist();
        }
        if (
            loan.state == LoanState.Funded ||
            loan.state == LoanState.Repaid ||
            loan.state == LoanState.Defaulted
        ) {
            revert InnerCirclesLendingMarket__InvalidLoanState();
        }

        uint256 oldDuration = loan.termDuration;
        loan.termDuration = newDuration;

        emit TermDurationModified(loanId, oldDuration, newDuration, msg.sender);
    }

    /**
     * @notice Modifies the grace period for a loan (open to all for demo/judging purposes)
     * @param loanId The ID of the loan
     * @param newGracePeriod New grace period in seconds
     * @dev Emits event to notify of modification
     */
    function setGracePeriod(uint256 loanId, uint256 newGracePeriod) external {
        Loan storage loan = loans[loanId];
        if (loan.borrower == address(0)) {
            revert InnerCirclesLendingMarket__LoanDoesNotExist();
        }
        if (loan.state != LoanState.Funded) {
            revert InnerCirclesLendingMarket__InvalidLoanState();
        }

        uint256 oldGracePeriod = loan.gracePeriodEnd - loan.repaymentDeadline;
        loan.gracePeriodEnd = loan.repaymentDeadline + newGracePeriod;

        emit GracePeriodModified(
            loanId,
            oldGracePeriod,
            newGracePeriod,
            msg.sender
        );
    }

    // ============ View Functions ============

    /**
     * @notice Gets the complete loan information
     * @param loanId The ID of the loan
     * @return loan The Loan struct
     */
    function getLoan(uint256 loanId) external view returns (Loan memory) {
        return loans[loanId];
    }

    /**
     * @notice Gets all vouchers for a loan
     * @param loanId The ID of the loan
     * @return Array of voucher addresses
     */
    function getVouchers(
        uint256 loanId
    ) external view returns (address[] memory) {
        return vouchers[loanId];
    }

    /**
     * @notice Gets a lender's contribution to a loan
     * @param loanId The ID of the loan
     * @param lender Address of the lender
     * @return Contribution amount
     */
    function getLenderContribution(
        uint256 loanId,
        address lender
    ) external view returns (uint256) {
        return lenderContributions[loanId][lender];
    }

    /**
     * @notice Gets total contributions for a loan
     * @param loanId The ID of the loan
     * @return Total amount funded
     */
    function getTotalContributions(
        uint256 loanId
    ) external view returns (uint256) {
        return loans[loanId].amountFunded;
    }

    /**
     * @notice Calculates the total amount owed (principal + interest) for a loan
     * @param loanId The ID of the loan
     * @return Total amount owed
     */
    function calculateTotalOwed(uint256 loanId) public view returns (uint256) {
        Loan memory loan = loans[loanId];
        if (loan.borrower == address(0)) {
            revert InnerCirclesLendingMarket__LoanDoesNotExist();
        }

        uint256 principal = loan.amountFunded;
        uint256 interest = (principal * loan.interestRate) / 10000;
        return principal + interest;
    }

    /**
     * @notice Calculates interest rate based on voucher count
     * @param voucherCount Number of vouchers
     * @return Interest rate in basis points
     * @dev Interest rate tiers:
     *      - < 3 vouchers: Ineligible (reverts in confirmLoanTerms)
     *      - 3-6 vouchers: 5% (500 basis points)
     *      - 7-9 vouchers: 2.5% (250 basis points)
     *      - 10-15 vouchers: 1% (100 basis points)
     *      - > 15 vouchers: 0% (0 basis points)
     */
    function calculateInterestRate(
        uint256 voucherCount
    ) public pure returns (uint256) {
        if (voucherCount < 3) {
            return type(uint256).max; // Ineligible - will revert in confirmLoanTerms
        } else if (voucherCount >= 3 && voucherCount <= 6) {
            return 500; // 5%
        } else if (voucherCount >= 7 && voucherCount <= 9) {
            return 250; // 2.5%
        } else if (voucherCount >= 10 && voucherCount <= 15) {
            return 100; // 1%
        } else {
            return 0; // 0%
        }
    }

    /**
     * @notice Checks if a loan is in default (past grace period and not fully repaid)
     * @param loanId The ID of the loan
     * @return True if loan is in default
     */
    function isLoanInDefault(uint256 loanId) external view returns (bool) {
        Loan memory loan = loans[loanId];
        if (loan.borrower == address(0)) {
            return false;
        }
        if (loan.state != LoanState.Funded) {
            return false;
        }
        if (block.timestamp < loan.gracePeriodEnd) {
            return false;
        }

        uint256 totalOwed = calculateTotalOwed(loanId);
        return amountRepaid[loanId] < totalOwed;
    }
}
