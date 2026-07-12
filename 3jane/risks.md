# Risks

## Risks to Suppliers (USD3 / sUSD3)

Suppliers are exposed to both credit sleeves through the shared capital stack. sUSD3 absorbs first losses (net recoveries) ahead of USD3.

1. **Smart-contract risk.** Bugs, oracle failures, or economic exploits. Mitigations: third-party audits, formal verification of rate math, circuit breakers.
2. **Credit default risk — Crypto Credit Lines.** A merchant fails to repay due to unwillingness, an asset shortfall from price risk, or idiosyncratic events (lost keys, hack). Mitigations: 3CA underwriting, dynamic default-risk-premium pricing, monthly model refresh, the sUSD3 junior tranche and insurance fund, and external collections via the [Credit Slasher](/backing/ccl/credit-slasher.md).
3. **Fraud risk — Crypto Credit Lines.** First-, second-, or third-party fraud (no intent to repay; colluding to connect a bank account not owned by the key holder; use of a compromised or synthetic identity). Mitigations: zkTLS-attested proofs, identity and bank verification, conservative limits, and collections.
4. **Counterparty & servicing risk — Fintech Credit Conduits.** An originator underperforms, mis-services, or fails. Mitigations: bankruptcy-remote SPVs that insulate collateral from the originator, DACA control over collection accounts, backup-servicer arrangements, originator first-loss equity, and weekly surveillance. LP exposure is to thousands of underlying obligors, not to the fintech itself.
5. **Structural & collateral-performance risk — Fintech Credit Conduits.** Underlying receivables default above expectations, or correlated stress hits a pool. On structured facilities **USD3 sits as the senior tranche** — behind originator first-loss equity, overcollateralization, reserves, performance triggers, and the sUSD3 junior tranche — so it is structured to be impaired only in a **great-financial-crisis-equivalent correlated-stress scenario**, beyond historically observed SMB / consumer loss. Mitigations: overcollateralization and advance-rate haircuts, performance triggers, and diversification across thousands of obligors. See [Credit Enhancement & Loss Distribution](/backing/fcc/credit-enhancement-and-loss-distribution.md) and the [USD3 / sUSD3 ABF risk analysis](https://www.3jane.xyz/reports/usd3-susd3-abf-risks).
6. **Settlement & banking risk.** The dollar leg — offramp, wires, collection, onramp — runs through [Erebor](/backing/fcc/banking-rail-erebor.md). Mitigations: a nationally chartered U.S. bank, controlled collection accounts, and auditable on-chain ↔ bank reconciliation.
7. **Liquidity & duration risk.** Redemption requests exceed available cash, against credit assets that are longer-dated than instant redemption. Mitigations: a cash buffer, short-duration self-liquidating receivables, secondary markets, and committed liquidity facilities (roadmap) — see [Liquidity](/usd3-susd3/liquidity.md).
8. **Oracle & rate-feed risk.** Manipulated price or SOFR feeds distort LTVs and rates. Mitigations: redundant Chainlink feeds, internal TWAP guards, emergency "pause & price-lock" switch.
9. **Governance / upgrade risk.** Malicious or negligent parameter changes. Mitigations: multisig with time-lock, published upgrade roadmap, veto window for USD3 governance token holders (roadmap).

## Risks to Merchants (Crypto Credit Lines)

1. **Privacy & data-leak risk.** Exposure of KYC, bank, or bureau data. Mitigations: minimal viable data stored, off-chain encrypted storage, hashed proofs on-chain.
2. **Collateral-valuation drift.** Haircuts may tighten, lowering a credit limit or raising implied rates. Mitigations: monthly re-scoring, merchant dashboard alerts for material changes.
