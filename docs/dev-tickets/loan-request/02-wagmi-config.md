# Ticket 02: Update Wagmi Configuration for Gnosis Chain

## Priority
🔴 **High** - Required for contract interactions

## Status
📋 **Todo**

## Description
Update Wagmi configuration to include Gnosis Chain support for the lending market contract interactions.

## Dependencies
- Ticket 01 (Types and Config)

## Implementation Tasks

### 1. Update Wagmi Config (`src/providers/onchain-config/wagmi-config.tsx`)
- [ ] Import `gnosis` from `viem/chains`
- [ ] Add `gnosis` to the `chains` array
- [ ] Add Gnosis Chain transport to `getTransports()` function
  - Use public RPC: `https://rpc.gnosischain.com` or `https://rpc.aboutcircles.com`
  - Add Alchemy endpoint if API key is available (optional)
- [ ] Ensure Gnosis is the default chain or prominently supported

### 2. Verify Chain Support
- [ ] Test that wallet can connect to Gnosis Chain
- [ ] Verify RPC endpoint is accessible
- [ ] Test chain switching functionality

## Acceptance Criteria
- [ ] Gnosis Chain (ID: 100) is in the chains array
- [ ] Transport is configured for Gnosis Chain
- [ ] Wallet can successfully connect to Gnosis Chain
- [ ] Contract interactions can be made on Gnosis Chain
- [ ] No TypeScript errors

## Testing
- [ ] Connect wallet and verify Gnosis Chain is available
- [ ] Test switching to Gnosis Chain
- [ ] Verify RPC calls work correctly
- [ ] Test with both public RPC and Alchemy (if configured)

## Notes
- Gnosis Chain is required for Circles protocol
- Use Circles RPC endpoint if available: `https://rpc.aboutcircles.com`
- Fallback to public Gnosis RPC if Circles RPC is unavailable

## Estimated Effort
**1 hour**

