# Overview

The [USD3 / sUSD3](/usd3-susd3/suppliers.md) capital stack is backed by two credit sleeves running in parallel, plus an idle reserve:

* [**Fintech Credit Conduits (FCC)**](/backing/fcc.md) — standing, tranched funding rails (warehouse loans, participations, and forward-flow agreements) that finance short-duration SMB and consumer receivables originated by other U.S. fintech lenders, through bankruptcy-remote SPVs. This is the pool's primary backing.
* [**Crypto Credit Lines (CCL)**](/backing/ccl.md) — uncollateralized USDC credit lines 3Jane underwrites, originates, services, and holds directly for U.S.-based cryptonatives, against verifiable proofs of assets, cash flows, and credit scores.

Running the two sleeves together diversifies the pool across duration, asset class, and counterparty.

## Total Value Verified (TVV)

**Total Value Verified (TVV)** measures every verifiable dollar that stands behind the pool's deployed credit. It rebalances automatically as utilization changes and as capital moves between the two sleeves. At any moment, pool capital sits in one of the following states:

1. **Crypto money markets (idle).** Idle USDC is supplied to the Aave V3 USDC market, streaming a base yield and remaining instantly available. When a [merchant](/backing/ccl/merchants.md) draws a credit line or an [FCC facility](/backing/fcc/facilities.md) is funded, the required amount is withdrawn from Aave and deployed — then refilled as repayments arrive.
   1. Yield source: Aave's USDC supply rate (≈ SOFR).
   2. Backing: Aave's multi-asset collateral set (ETH, stETH, major stables, etc.).
2. **Fintech facilities.** Capital deployed into [FCC](/backing/fcc.md) warehouse loans and forward-flow programs through bankruptcy-remote SPVs.
   1. Yield source: the net spread on the underlying receivables after originator economics and expected losses.
   2. Backing: for warehouse facilities, the net (post-haircut) value of eligible receivables securing 3Jane's senior position, plus originator first-loss equity; for forward-flow programs, the purchased loans' principal and accrued interest. See [Credit Enhancement & Loss Distribution](/backing/fcc/credit-enhancement-and-loss-distribution.md).
3. **Crypto credit lines (on credit).** Capital deployed into direct [CCL](/backing/ccl.md) credit lines, priced by 3CA. Credit limits rely on asset proofs across DeFi wallets, CEX balances, bank accounts, and brokerages.
   1. Yield source: Aave base rate + utilization spread + the 3CA default-risk premium.
   2. Backing: verifiable on-chain and off-chain assets and cash-flows tied to each merchant, enforced by the credit-slashing and collections infrastructure.
4. **Staging.** Capital raised and off-ramped through [Erebor](/backing/fcc/banking-rail-erebor.md) but not yet wired into a facility — committed, transitional, and held 1:1 in cash. Once a wire clears and the servicer report updates, staged capital moves into deployed facility principal.

Live pool composition, backing percentage, and per-sleeve breakdowns are published on the [backing page](https://app.3jane.xyz/info/backing).
