# 3CA Algorithm

<figure><img src="/files/rDIAbCRxip17ka4F25eW" alt=""><figcaption></figcaption></figure>

The 3CA V1 algorithm is a composition of four discrete sequential engines (Fraud Risk Engine -> Asset Risk Engine -> Credit Risk Engine -> Portfolio Risk Engine) which outputs (1) Credit Line Size, (2) Default Credit Risk Premium %, and (3) Repayment Rate. The 3CA algorithm will evolve over time.

> *NOTE 3CA will iterate—each engine’s logic, weights, and data inputs are upgradeable.*

## Fraud Risk Engine

The fraud risk engine is responsible for assessing whether the prospective user is engaging in some form of fraud or is too risky for us to engage with. This includes but is not limited to:

1. **Wallet History:** fresh wallet, stale transaction history, OFAC sanctions list, tagged as stolen funds, ransomware, etc.
2. **Browser:** IP address offshore of USA, IP address far from IRL city/state, etc
3. **Bank:** new bank account, limited transaction history, identity associated with a breach, first & second-party fraud, balance stuffing etc.
4. **Credit Karma:** hashed name mismatch with Bank.

**Output:** Binary 0/1. Any critical flag ⇒ application rejected. No partial approval.

## Asset Risk Engine

The asset risk engine is responsible for assessing the credit line to provide for the prospective user.

This engine stress‑tests DeFi portfolios with realistic market dynamics (volatility, correlations, liquidity). We simulate tens of thousands of market paths, apply position‑specific payoffs (lending, LP, yield, vaults, etc.), haircut for liquidity/locks/utilisation, and read the 1% tail (VaR & Expected Shortfall). That tail drives the Loan‑to‑Value (LTV).

This engine is specifically designed to measure the following risks of a DeFi portfolio:

* **Protocol risk**: smart‑contract, design & counterparty risks (whitelisting gate) ⇒ We only consider assets/protocols that pass our scored whitelisting review. The latter, run with our partner Block Analitica, covers smart-contract risk, protocol design and governance, oracle/design dependencies, and counterparty/operational risk; assets are assigned to risk tiers with associated collateralization limits.

  If an asset or protocol is not on the list of whitelisted assets, it does not count for collateral. We continuously whitelist new protocols and assets.
* **Volatility risk**: how violently each asset can move next epoch ⇒ We look to capture asset volatility dynamics by fitting different GARCH-like models. While we privilege student-t and skew-student-t distributions as opposed to normal distribution to model the standardized errors in our GARCH models, we add another component to model extreme events. Drawn from Extreme Value Theory, we fit the q% most extreme residual values using a Generalized Pareto Distribution. For stablecoins and liquid re/staking assets, we fit a mean reverting process with jumps on top of the GARCH-like model to capture depeg/liquidity discount risk as well as slashing risk. We also add a drift with perturbations to model rates for yield-bearing assets.

  This framework provides a model to assess the distribution of returns over the next epoch for one asset.
* **Correlation risk**: how assets co‑crash in stress ⇒ We model correlation using proprietary models to generate a correlation matrix with heavy tails which is dynamic as a function of recent shocks. This allows us to realistically simulate joint moves in different market scenarios, extreme market behaviours and ultimately returns of correlated assets.
* **Liquidity risk**: how costly it is to unwind (or how illiquid/locked a position is) ⇒ We apply a final haircut to the portfolio values based on the liquidity of the position itself. For a spot position, we combine historical orderbook and on-chain liquidity data with slippage models to assess the cost of unwinding in different scenarios. We penalise the terminal values of the portfolio by this estimated cost.

  For locked positions, we apply a penalty based on the lock time, amount and liquidity (if any) of the locked token.

**Outputs:**

1. Value-at-Risk at 1%: the loss level exceeded in 1% of cases over the epoch for a given portfolio.
2. Expected Shortfall at 1%: the average loss if you’re in that worst 1% tail for a given portfolio.
3. Gross Credit Line. Returns \[0, MAX\_SIZE]. After computing the VaR and the ES, we then apply a proprietary, policy-based mapping from tail risk to LTV that also considers liquidity class and protocol risk tier. While we don’t disclose the formula, the policy is designed to be monotonic (larger tails → lower LTV), bounded (floors/caps), and stable (limits on rate-of-change to avoid pro-cyclicality). We continuously monitor realized outcomes versus model predictions and adjust policy ranges when warranted.

## Credit Risk Engine

The credit risk engine is responsible for assessing the creditworthiness of a prospective user.

**Outputs:**

1. Jane Score. Returns \[300-1000]. See [Jane Score](/backing/ccl/credit-underwriter/jane-score.md) section for more.
2. Default Credit Risk Premium %. Returns \[MIN\_DRP-MAX\_DRP]. A fixed credit default risk premium applied per-user (risk-adjusted APR quote for an unsecured credit line), based on their Jane score, probability of default (PD) buckets, base pool rate, loss given default (LGD), capital ratio, capital cost, profit floor, profit slope, and max APR.
   1. Lookup: Drops the Jane score into a table of default-rate bands derived from U.S. consumer-credit data.
   2. Buffer: Inflates those historical default rates with safety cushions (bigger cushion for riskier bands) because 3Jane is a new product.
   3. Prices: *Expected loss (PD × LGD) + small profit load + optional capital charge* is added to a base funding rate.
   4. Guard-rails: Clips the result at a hard APR ceiling so quotes never exceed policy limits.
3. Repayment Rate. Returns \[MIN\_RR-MAX\_RR]. The minimum repayment rate to maintain good standing on your credit line per month, expressed as a % of your outstanding principal.

## Portfolio Risk Engine

The portfolio risk engine is responsible for adjusting the gross credit line based on the overall risk exposure and correlation risk across all the outstanding credit lines. We use proprietary correlation models to stress-test the collateral of pool and compute tail risk metrics.

We set caps on:

* Max credit line per user
* Overall market exposure of the pool
* Overall protocol exposure of the pool

**Outputs:**

1. Credit Line. Returns \[0, MAX\_SIZE]

### Appendix

<figure><img src="/files/aM5K7nmzHto7Hhdw7dpD" alt=""><figcaption></figcaption></figure>
