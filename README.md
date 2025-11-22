# Inner Circles Loan System

A **no-collateral, trust-based lending protocol** built on top of [Circles](https://aboutcircles.com/), designed to provide fair access to credit for community members based on **social trust, not assets**.

## Live Pilot: [Frutero.Club](https://frutero.club)

Frutero.Club is a talent accelerator for LatAm builders, where members build reputation through contributions to real-world projects. We’re piloting this protocol in Mexico to offer **community-backed liquidity for builders and operators** in need of short-term financial support.

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
git clone https://github.com/your-org/inner-circles-loan.git

# Install dependencies
cd inner-circles-loan
npm install

# Start local dev server
npm run dev
```
