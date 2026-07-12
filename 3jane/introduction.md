# Introduction

3Jane is a peer-to-pool, credit-based money market on Ethereum. Suppliers deposit USDC into a single tranched capital stack — **USD3** (senior) and **sUSD3** (junior, first-loss) — and that capital funds two credit sleeves in parallel:

1. **Crypto Credit Lines (CCL).** Uncollateralized USDC credit lines underwritten directly to U.S.-based cryptonatives against verifiable proofs of DeFi, CEX, and bank assets, future cash flows, and credit scores. 3Jane underwrites, originates, services, and holds these receivables itself.
2. **Fintech Credit Conduits (FCC).** Standing, tranched funding rails — warehouse loans, participations, and forward-flow agreements — that finance short-duration SMB and consumer receivables originated by other U.S. fintech lenders, through bankruptcy-remote SPVs.

[USD3 and sUSD3](/usd3-susd3/suppliers.md) sit on the other end of both sleeves: USD3 earns a variable senior share of pool yield and is credit-enhanced, while sUSD3 earns the levered junior share and absorbs first losses, net recoveries. Both tranche rates float with what the backing generates. Running the two sleeves together diversifies the pool across duration, asset class, and counterparty.

<figure><img src="/files/zamfAHDiuIUzOU5RqSFB" alt="One USD3/sUSD3 capital stack funding two credit sleeves"><figcaption><p>One tranched capital stack — USD3 senior, sUSD3 junior — funds two credit sleeves: crypto credit lines and fintech credit conduits.</p></figcaption></figure>

Together, the two sleeves open up a three-dimensional collateral space in crypto financial markets — adding future-backed and cash-flow-backed credit alongside the asset-backed loans DeFi already knows. Underwriting blends onchain credit scoring from Cred Protocol and Blockchain Bureau with offchain VantageScore 3.0 scores attested via zkTLS, so credit risk can be priced at scale. Solvency is enforced onchain: non-performing debt is sold through auctions where licensed U.S. collections agencies bid for the right to recover it. The result is a single, capital-efficient credit primitive that reaches both cryptonative borrowers — sole proprietors, businesses, and AI agents — and the fintech lenders serving millions of American consumers and small businesses.

## Crypto Credit Lines

The CCL sleeve extends instant capital across two cryptonative borrower segments:

1. greater capital-efficiency for asset-rich yield farmers and traders by leveraging their entire financial profile across DeFi assets, centralized exchanges, brokerage, and bank assets;
2. capital access for high-productivity, asset-light businesses and AI agents for working capital and growth financing, underwritten against their future cash flows.

It runs on three protocol primitives:

1. [**Core money market**](/backing/ccl.md)**:** a two-sided market where suppliers deposit USDC to mint USD3 (and optionally stake for sUSD3), and merchants permissionlessly connect their ETH address, bank account via Plaid, and Credit Karma via zkTLS to generate a 0%-collateral, open-term, variable-rate USDC credit facility.
2. [**Credit underwriter**](/backing/ccl/credit-underwriter.md)**:** the 3Jane-operated offchain algorithm (3CA) that underwrites credit lines against verifiable DeFi, offchain, and future assets and on/offchain credit scores, deriving the credit-line amount, the default-risk-premium rate, and the repayment rate.
3. [**Credit slasher**](/backing/ccl/credit-slasher.md)**:** the solvency mechanism that deters defaults via Jane-score slashing, a pooled-upside model, and a non-performing-loan (NPL) auction that engages licensed U.S. collections agencies.

## Fintech Credit Conduits

The FCC sleeve funds other fintech lenders rather than holding loans directly. Fintechs made loan origination software-native; 3Jane makes structured credit programmable — compressing the bank-warehouse → forward-flow → unrated-ABS path into one programmable conduit funded by USD3 / sUSD3. See [Fintech Credit Conduits](/backing/fcc.md) for mechanics, yield, credit enhancement, and legal structuring.
