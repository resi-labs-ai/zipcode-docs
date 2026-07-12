# Crypto Credit Lines (CCL)

<figure><img src="/files/nq9NLaf0KU4TFIyMuu6a" alt=""><figcaption></figcaption></figure>

Crypto Credit Lines (CCL) are one of 3Jane's two credit sleeves: uncollateralized USDC credit lines originated **directly** to U.S.-based cryptonatives — yield farmers, traders, sole proprietors, businesses, and AI agents. Where [Fintech Credit Conduits](/backing/fcc.md) fund other lenders, the CCL sleeve has 3Jane underwrite, originate, service, and hold the receivables itself.

It is a two-sided market: suppliers deposit USDC to mint [USD3](/usd3-susd3/suppliers.md), and optionally stake for sUSD3, gaining exposure to a diversified pool of credit lines to crypto creditors. On the other side, merchants permissionlessly connect their ETH address, bank account via Plaid, and Credit Karma via zkTLS, and instantly generate a 0%-collateral, open-term, variable-rate USDC credit facility.

The core money market is an instantiation of the Morpho Blue contract, extended with credit-underwriter, credit-slashing, and interest-rate modules to push credit lines, incentivize repayment, and price address-specific credit default-risk premiums respectively.

## In this section

* [Merchants](/backing/ccl/merchants.md) — how a borrower connects and draws a credit line
* [Payments](/backing/ccl/payments.md) — repayment thresholds, monthly minimums, and syncs
* [Merchant Discount Factor Rate](/backing/ccl/merchant-discount-factor-rate.md) — early-payoff pricing on the advance
* [Credit Underwriter](/backing/ccl/credit-underwriter.md) — the 3CA algorithm, Jane Score, and assets
* [Credit Slasher](/backing/ccl/credit-slasher.md) — default deterrence, legal recourse, and write-offs
* [Proofs](/backing/ccl/proofs.md) & [Privacy & Storage](/backing/ccl/privacy-and-storage.md) — how offchain data is attested and stored
* [Examples](/backing/ccl/examples.md) — worked underwriting and pull examples
* [Pull Credit Line](/backing/ccl/pull-credit-line.md) — step-by-step guide

Pricing math for the advance lives in [Merchant Discount Factor Rate](/backing/ccl/merchant-discount-factor-rate.md); pool-level and tranche interest math lives in [Pool Interest Rates](/usd3-susd3/pool-interest-rates.md).
