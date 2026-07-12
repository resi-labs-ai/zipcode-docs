# Liquidity Mining

3Jane is a credit-based money market that extends credit facilities via warehouse facilities and forward-flow programs to U.S.-based fintech lenders, powering the next generation of fintech originators with a cryptonative balance sheet. [Read more →](https://www.3jane.xyz/reports/3jane-is-evolving)

Since inception, 3Jane has executed two transactions:

* A **$10M warehouse facility** with LendSwift, a U.S. consumer-installment lender.
* An **$8.5M whole-loan purchase** of SMB line-of-credit receivables from Slope, the embedded credit infrastructure behind neobanks like Slash and Fortune 10 e-commerce platforms.

3Jane is now opening deposits to the public alongside existing liquidity providers to accelerate growth into an expanding pipeline.

## $JANE liquidity mining program

3Jane's liquidity mining program is live. In a deviation from precedent, rewards are paid in locked $JANE, the protocol's token, giving users a direct stake on day 1. JANE emissions are distributed against a variable total token supply, fixed at final mint in 2026. Transferability will be enabled alongside final mint.

Each week, 3Jane distributes JANE across several farms accretive to the protocol. Each farm's weekly emission has a floor, and that floor scales up as TVL grows. **As a result, early TVL earns an outsized share.**

<figure><img src="/files/mELad5qg8E3fUWsZ1u6x" alt="Final supply split timeline"><figcaption><p>During liquidity mining (now → final mint 2026), LPs are emitted x (JANE, 100% of emissions); at final mint the final supply (z) is fixed within 1.111B–6.667B and the rest of supply (z − x) goes to remaining protocol stakeholders, with transferability enabled — so x and (z − x) sum to z.</p></figcaption></figure>

**Key Terms:**

1. Earn JANE by growing the protocol. Locked until final mint
2. JANE final supply range: **1,111,111,111 – 6,666,666,666**
3. New JANE emissions are claimable every 7 days. 100% goes to liquidity providers until final mint
4. JANE accrued is fixed, but its % of total token supply is variable until final mint
5. Fixed JANE emission floor per epoch; the floor scales up after a farm's internal TVL goal is hit
6. Final mint occurs in 2026, issuing the remaining supply to other protocol stakeholders and enabling transferability
7. Accrued JANE is calculated from daily TWAB snapshots
8. $JANE address: 0x333333330522f64ee8d0b3039c460b41670e3404

**You are underwriting $JANE total token supply and $JANE FDV upon final mint.**

## Core Mechanics

### Convexity

<figure><img src="/files/xj4KwA2kJFxlBJW6Av3i" alt="Two-regime scaling: weekly JANE vs implied APY around a farm&#x27;s TVL goal"><figcaption><p>Illustrative: how weekly JANE and implied APY behave on either side of a farm's TVL goal — below the goal JANE is fixed and APY is high and convex; above the goal APY holds in its target band while JANE scales with TVL.</p></figcaption></figure>

Each farm has a target internal APY and a TVL goal:

1. **Below the goal**, the farm emits a fixed weekly JANE amount. The pie is fixed while TVL is still small, so JANE per $1 deposited is high: early depositors are disproportionately rewarded. This is the convex part of the curve.
2. **At and above the goal**, emissions scale with participation, holding JANE per $1 steady so APY stays in its target band as later capital arrives.

The variable flips at the goal. Early: JANE fixed, APY variable (high). Late: APY fixed, JANE variable (scales with TVL). Neither regime dilutes the other.

### Scaling Mechanism

<figure><img src="/files/XN10hd1OutXLWgTFJ6jw" alt="Cumulative JANE emitted as a percentage of total token supply"><figcaption><p>Illustrative: cumulative JANE emitted as a percentage of total token supply, drawn as a stepped band — the same running emission total divided by the low and high ends of the TTS range, producing a fixed 6× band that steps up each epoch.</p></figcaption></figure>

Realized APY is a function of (a) final total token supply and (b) FDV when transferability is enabled.

## USD3 & sUSD3

USD3 is a credit-backed yieldcoin earning from warehouse facilities, forward-flow programs, and credit lines. It is the senior tranche of the funding structure, protected by the sUSD3 junior tranche beneath it.

sUSD3 is staked USD3 and earns levered yield as a junior tranche first-loss capital of the funding structure, absorbing any credit impairment before USD3. It sits behind every external credit enhancement in each facility, including but not limited to first-loss equity and cash reserves.

USD3 initial supply cap: $50,000,000.

## What Earns $JANE

| Farm               | First epoch Min. JANE Emission | First epoch % of JANE Total Token Supply¹ | Address                                    |
| ------------------ | ------------------------------ | ----------------------------------------- | ------------------------------------------ |
| USD3               | 600,000 JANE                   | 0.009% – 0.054%                           | 0x056b269eb1f75477a8666ae8c7fe01b64dd55ecc |
| sUSD3              | 300,000 JANE                   | 0.0045% – 0.027%                          | 0xf689555121e529ff0463e191f9bd9d1e496164a7 |
| Morpho USDC Supply | 50,000 JANE                    | 0.00075% – 0.0045%                        | 0xe05fadf242331808f504661bea65972594869826 |
| YT-USD3-17DEC2026  | 200,000 JANE                   | 0.003% – 0.018%                           | 0x5cffcc9ddef0fdcf395e2ea24ca5ed5a12032706 |
| PLP-USD3-17DEC2026 | 50,000 JANE                    | 0.00075% – 0.0045%                        | 0x4a5067c3ff1abb7449244025b0e37feaf77d8e3e |
| USD3/frxUSD        | 50,000 JANE                    | 0.00075% – 0.0045%                        | 0x7ba89bc658c07569cfa6d7947adaa80181a24568 |
| 3Jane USDC Pull    | 100,000 JANE                   | 0.0015% – 0.009%                          | N/A                                        |
| PT-USD3-17DEC2026  | N/A                            | N/A                                       | 0x7f47c3e6b2c00fc4eb4d5ae50d0ab0ab6888eb4d |
| **Total**          | **1,350,000**                  | **0.0203% – 0.1215%**                     | N/A                                        |

¹ Low end = emission ÷ 6,666,666,666 (max supply); high end = emission ÷ 1,111,111,111 (min supply).

* First epoch is indicative. Floor emissions change every week with existing TVL, protocol goals, and market signals.
* As 3Jane adds farms, each epoch's JANE share may be redirected to other farms based on protocol goals at the time.
* Once a farm hits its internal target KPIs, its JANE emission scales in real time to hold the same JANE per $1 deposited (see Convexity, above).
* YT-USD3 gets both YT-specific incentives + native USD3 incentives.
* Pendle LPT incentives are based on SY in the pool but get both LPT-specific incentives + native USD3 incentives.
* USD3/frxUSD incentives are based on notional value.
* Morpho suppliers get additional USDC-denominated incentives for supplying into the 3Jane ecosystem vault, on top of native lending APY.

## YT-USD3-17DEC2026

YT holders get the sum of (a) native USD3 emissions and (b) YT bonus emissions outlined below.

For the first epoch, the YT-USD3-17DEC2026 farm has an explicit internal TVL goal of **$5,000,000**. As its TVL grows across the epoch:

| YT-USD3 TVL | Regime              | Weekly JANE | JANE emission multiple / YT |
| ----------- | ------------------- | ----------- | --------------------------- |
| $1.25M      | Fixed (below $5M)   | 200,000     | 4×                          |
| $2.5M       | Fixed (below $5M)   | 200,000     | 2×                          |
| $5M         | Inflection          | 200,000     | 1×                          |
| $10M        | Scaling (above $5M) | 400,000     | 1×                          |
| $20M        | Scaling (above $5M) | 800,000     | 1×                          |

Below the $5M goal, the weekly JANE pool is fixed at 200,000, so the less TVL there is, the more JANE each dollar earns — the earliest depositors, when TVL is lowest, get the most JANE per dollar (4× the steady rate at $1.25M, 2× at $2.5M). Once TVL passes $5M, the weekly JANE grows in step with TVL — 2× the TVL pays 2× the JANE, 4× pays 4× — so every dollar earns the same steady rate from then on. Rewards accrue from daily balance snapshots (TWAB): you earn by holding day to day, not by timing your deposit.

[Earn $JANE →](https://app.3jane.xyz/farm)

***

**Additional mechanics** — see [Credit Slasher](/backing/ccl/credit-slasher.md) and its interoperability with the $JANE token.

This will evolve into a more tightly-coupled and comprehensive tokenomics as the protocol scales and we learn what works and what doesn't — this may include governance, staking, fee accrual, slashing, and other novel mechanisms that are value accretive to both the protocol and token.
