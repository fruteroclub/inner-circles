# Inner Circles Loan System

A **no-collateral, trust-based lending protocol** built on top of [Circles](https://aboutcircles.com/), designed to provide fair access to credit for community members based on **social trust, not assets**.

## Live Pilot: [Inner Circles](https://inner-circles.vercel.app)

Frutero Club is a talent accelerator for LatAm builders, where members build reputation through contributions to real-world projects. We’re piloting this protocol in Mexico to offer **community-backed liquidity for builders and operators** in need of short-term financial support.

---

## How It Works

1. **Member applies for a loan** in CRC from the Circles Group treasury.
2. **Vouching phase**: At least 3 trusted community members vouch via Telegram bot, each depositing a fixed amount of CRC into escrow.
3. **Dynamic interest rate** is calculated based on number of vouchers:
   - `<3 vouchers`: ineligible
   - `3`: 5%
   - `10`: 1%
   - `>15`: 0%
4. **Additional lenders** can contribute until escrow is filled.
5. **Funds are disbursed** to the borrower. Repayment cycle begins (default: 30 days).
6. At maturity, **Telegram bot checks wallet balance** and attempts automated repayment.
7. If loan is repaid:
   - Lenders are paid back (in priority)
   - Trust score improves
8. If unpaid:
   - Grace period is triggered
   - On failure, borrower's **ENS tag is revoked**
   - Telegram alerts group to adjust trust graph
   - Future loan access becomes harder (higher quorum required)

---

## Smart Contracts

The Inner Circles Lending Market smart contract is **deployed and verified on Gnosis Chain (mainnet)**.

### Contract Information

- **Network**: Gnosis Chain (Chain ID: 100)
- **Contract Address**: 0xD8912DF919BAf91169EdfEa33D828dca1cc686E4
- **Status**: Deployed and verified
- **Block Explorer**: [GnosisScan](https://gnosisscan.io/address/0xD8912DF919BAf91169EdfEa33D828dca1cc686E4)
- **Contracts Repository**: [Github](https://github.com/troopdegen/inner-circles-contracts)

### Environment Variables

The contract address is configured in your `.env` file:

```bash
# .env (lines 10-11)
NEXT_PUBLIC_LENDING_MARKET_ADDRESS=0x... # Deployed contract address on Gnosis Chain
```

### Contract Details

- **Contract Name**: InnerCirclesLendingMarket
- **Network**: Gnosis Chain Mainnet
- **Verification**: Verified on GnosisScan
- **ABI**: Available in `src/lib/contracts/InnerCirclesLendingMarketABI.ts`

For contract interaction, the address is automatically loaded from the environment variable `NEXT_PUBLIC_LENDING_MARKET_ADDRESS` at runtime.

---

## Stack

- **Circles SDK** for token and group logic
- **Relative Trust Score API** to assess borrower reputation
- **Smart contracts** for CRC escrow and repayment logic
- **Telegram Bot** to handle vouching, alerts, and automated triggers
- **ENS integration** for community membership and penalties
- **Backend Scheduler** for wallet monitoring and repayment flows

---

## Use Cases

- Talent accelerators
- DAO-native job boards
- Mutual aid systems
- Neighborhood lending circles
- Reputation-based gig platforms

---

## Run Locally

```bash
# Clone the repo
git clone https://github.com/fruteroclub/inner-circles-loan.git

# Install dependencies
cd inner-circles
bun install

# Start local dev server
bun dev
```
