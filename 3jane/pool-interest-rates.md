# Pool Interest Rates

## Pool-Level APY Dynamics

The aggregate variable rate earned by the pool is:

$$
\text{IR}*{\text{Pool}}
\= W*{\text{Aave}};\text{IR}\_{\text{SOFR}}

* \sum\_{n=1}^{N} W\_{n},\text{IR}\_{n}
  $$

where

$$
\begin{aligned}
W\_{\text{Aave}} &: \text{ idle liquidity in Aave (earns }\text{IR}*{\text{SOFR}}\text{)} \\\[2pt]
W*{n}           &: \text{ weight of position }n \text{ (a credit line or facility)} \\
&: \bigl(\sum\_{n} W\_{n}=1-W\_{\text{Aave}}\bigr)
\end{aligned}
$$

Whatever the pool earns is then split between the senior (USD3) and junior (sUSD3) tranches.

## USD3 and sUSD3 APY

In traditional tranching, the senior earns a **fixed** coupon and the junior takes the residual — the junior absorbs all the variance to keep the senior's rate constant. 3Jane works differently. A single **tranche share variant** (`TRANCHE_SHARE_VARIANT`), denoted `s`, splits pool interest in fixed proportions, so **both** tranches earn a variable rate that floats with what the backing generates:

$$
\text{IR}*{\text{USD3}}
\= \frac{(1-s),\text{IR}*{\text{Pool}}}{W\_{\text{USD3}}},
\qquad
\text{IR}*{\text{sUSD3}}
\= \frac{s,\text{IR}*{\text{Pool}}}{W\_{\text{sUSD3}}}
$$

$$
\begin{aligned}
s              &: \text{tranche share variant — the junior's fixed fraction of pool interest} \\\[2pt]
W\_{\text{USD3}}, W\_{\text{sUSD3}} &: \text{capital weights of each tranche } (W\_{\text{USD3}}+W\_{\text{sUSD3}}=1) \\\[2pt]
\end{aligned}
$$

The junior receives the fraction `s` of pool interest; the senior receives the remaining `1 − s`. Two consequences follow:

* **The senior (USD3) coupon is variable.** Because USD3 takes a fixed *proportion* rather than a fixed *rate*, its APY rises and falls with pool yield. There is no promised fixed rate to defend.
* **The junior (sUSD3) is more compelling.** The junior never has to give up part of its share to top a fixed senior coupon back up to target. It keeps its full slice of upside when the pool earns more — and, as first-loss capital, bears the downside when the pool earns less or takes losses.

USD3 can be redeemed up to the tranche ratio, and remains senior in the waterfall: losses hit sUSD3 before USD3.

### Example

Take a pool generating **13%**, with capital weights **85% USD3 / 15% sUSD3** and a tranche share variant of **`s = 0.30`** (30% of pool interest to the junior, 70% to the senior):

| Pool yield | → sUSD3 (junior, s = 0.30)                  | → USD3 (senior, 1 − s = 0.70)               |
| ---------- | ------------------------------------------- | ------------------------------------------- |
| 13%        | 30% × 13% over 15% of capital → ≈ **26.0%** | 70% × 13% over 85% of capital → ≈ **10.7%** |
| 15%        | 30% × 15% over 15% of capital → ≈ **30.0%** | 70% × 15% over 85% of capital → ≈ **12.4%** |

The split percentages are fixed; the resulting APYs move with the pool. 3Jane is not promising the senior any particular rate — when the backing generates more, both tranches earn more, and when it generates less, both earn less.

*Figures are illustrative; the tranche share variant and pool yield are parameters that change over time.*
