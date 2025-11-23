# Inner Circles Credit System - Basic User Flow

### Frutero Club Lending Loop

1. Access Verification 🧩

The user starts the interaction with the Credit System.

Back-end verifies:

- They are a member of the Frutero Club Circles Group.

  - Chain: Gnosis Chain
  - Chain Id: 100
  - Circles Group address: 0xa646fc7956376a641d30448a0473348bcc5638e5

- They hold the community ENS "membership" tag (ENS subname).

If not, prompt to apply by building enough inbound trust in the Circles trust graph.

- Get invited to the group
- Get ENS subname by getting 3 "trusts" from members of the Circles group

2. Loan Request 💸

"Alice" requests a loan through
a) Web application "Request a Loan" flow
b) Telegram bot

Inputs:

- Amount requested (in CRC from the Circles Group)
- Term duration (1 month - for MVP we need fixed 1-month term and admin option to modify the period to simulate time passing)

Back-end creates:

- A Loan Request in the InnerCirclesLendingMarket Smart Contract (call createLoanRequest, requester gets assigned a loanId)
- A vouching round is triggered for the assigned loanId

3. Vouching Phase 🫂

- Telegram bot posts Alice’s loan request to the Frutero Club Telegram group.
- Members who trust Alice react with a designated emoji to vouch (👍)
- 2-day vouching period started

Each reaction:

- Counts as a signature
- Triggers a deposit of CRC (for MVP - fixed 1 CRC) into the InnerCirclesLendingMarket contract for the respective loanId

→ This makes each voucher an early-stage lender with financial exposure ("skin in the game").

4. Interest Rate Computation 💡

Interest rate is dynamically computed based on voucher count:

- Vouchers
  - < 3: Ineligible (not enough quorum)
  - ≥ 3 <= 6: 5%
  - > = 7 <= 9: 2.5%
  - > = 10 <= 15: 1%
  - > 15: 0%

Note: Thresholds adapt based on applicant’s risk score.
Alice views the proposed loan terms and interest rate → confirms to proceed or cancels.

5. Escrow Crowdfunding 🔐

If Alice confirms:

- The Loan Request (within InnerCirclesLendingMarket) opens to additional lenders
- Lenders can choose 1 / 2 / 5 CRC amounts to contribute
- Vouchers can increase their stake, or others can join until the full loan is funded.

At deadline or quorum, Alice gives final confirmation.

6. Disbursement & Repayment Clock 💰

- The InnerCirclesLendingMarket sends funds (in CRC from the Circles Group) to Alice.
- The repayment window begins (for MVP - 30 days fixed, and admin option to modify the period to simulate time passing).

7. Repayment — Happy Path 🔄

At maturity, backend checks Alice’s CRC balance.

If sufficient, repayment + interest is auto-executed.

Results:

- Vouchers and lenders are repaid (in priority order: external lenders → vouchers)
- Alice’s trust score improves (lower thresholds next time)
- Her ENS membership remains active

8. Repayment — Unhappy Path 🔻

If CRC balance is insufficient:

- Telegram bot sends Alice a private grace period notice (7 days)
- After grace, system attempts collection again (partial if needed)

If unpaid balance remains:

- Alice loses her ENS membership
- Bot posts a “Remove Trust” recommendation in the group
- Her trust score is penalized → higher voucher quorum required in future
- Vouchers may be partially or fully unreimbursed — reinforcing their social responsibility
