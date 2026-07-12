# Suppliers

Suppliers can permissionlessly deposit USDC to mint either **USD3** or **sUSD3**, and can also stake USD3 for sUSD3 (ERC-4626).

The pool is risk-on: deposited capital is deployed into the two credit sleeves that [back](/backing/backing.md) it — [Fintech Credit Conduits](/backing/fcc.md) and [Crypto Credit Lines](/backing/ccl.md) — with idle cash held in Aave. USD3 and sUSD3 sit on the liability side as a senior / junior tranche pair over that backing.

## USD3 — senior tranche

USD3 is the senior tranche. It earns native pool yield and sits ahead of sUSD3 in the waterfall: it is paid first and is the last to be impaired. USD3 is credit-enhanced — it sits behind originator first-loss equity, overcollateralization, reserves, performance triggers, and the sUSD3 junior tranche beneath it.

USD3 yield is a **variable** share of pool interest that floats with what the backing generates (see [Pool Interest Rates](/usd3-susd3/pool-interest-rates.md)). USD3 can be redeemed up to the tranche ratio.

## sUSD3 — junior tranche

sUSD3 is the junior, first-loss tranche. Staking USD3 for sUSD3 gives holders levered yield on the pool of credit while absorbing first losses (net recoveries) ahead of USD3. sUSD3:

* earns the junior share of pool interest — higher yield, first to absorb losses;
* has a **1-month lock** (still earning yield), then redeems via a cooldown and withdrawal window;
* supply is capped by the tranche ratio (e.g. 15% of debt).

## Tranche ratio & waterfall

The **tranche ratio** (`TRANCHE_RATIO`) caps subordination — the maximum share of debt that can be junior (sUSD3), e.g. 15%. The **tranche share variant** (`TRANCHE_SHARE_VARIANT`) sets how pool interest is split between the two tranches. Losses always hit sUSD3 before USD3. For the interest math across both sleeves, see [Pool Interest Rates](/usd3-susd3/pool-interest-rates.md).
