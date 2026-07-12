# Credit Enhancement & Loss Distribution

This page maps the protection layers beneath USD3 and the loss distribution they sit on. Warehouse and forward-flow programs have had little prior history in DeFi, so their risks have rarely been mapped out in this context — this is that map.

## Layers of credit enhancement

Cash flowing to USD3 sits behind a stack of protection that absorbs losses in order:

1. **Pool excess spread** — the net yield each vintage generates over its life, before any principal is impaired.
2. **Originator first-loss equity** — the originator's own capital beneath 3Jane (e.g. a 25% first-loss slice → 1.33x overcollateralization).
3. **Overcollateralization (OC)** — the eligible borrowing base exceeds the drawn balance; tested on a schedule (e.g. weekly).
4. **Reserves & performance triggers** — cash reserves and covenant triggers that trap cash or accelerate amortization if performance deteriorates.
5. **sUSD3 subordination** — the junior tranche absorbs losses before USD3 at the 3Jane capital-stack level.

## Why granularity matters

<figure><img src="/files/icKPeLpo2mFd5RcRgHrK" alt="Loss distribution: single-name vs granular pool"><figcaption></figcaption></figure>

* Single-name corporate credit is **bimodal**: most loans pay at par, but a default jumps to restructuring-level loss severity.
* A granular SMB / consumer pool of \~3,000 obligors is **tight around expected loss**, because each obligor can fail independently.
* Expected loss can be similar across the two; the *shape* — and therefore the risk we are paid for — is completely different.

<figure><img src="/files/yYVIw6tkkL9olxye4AY3" alt="N=30 vs N=3,000 loss distributions"><figcaption><p>Same expected loss, very different distributions. With 30 obligors, unexpected loss is wide and fat-tailed; with 3,000 obligors the distribution collapses to a tight spike and standard deviation falls by roughly two orders of magnitude.</p></figcaption></figure>

At a 5% annual default probability and 50% LGD, expected pool loss is 2.5%. But the standard deviation of pool loss falls from \~2 percentage points at N=30 to \~0.2 percentage points at N=3,000. Diversification compresses idiosyncratic risk first; correlation risk is then handled at the structuring level.

<figure><img src="/files/UXxpDrGYKJgzHO0wiAPY" alt="OnDeck and Affirm ABS comparables"><figcaption><p>This is how the public ABS market routinely rates granular SMB and consumer receivables pools to investment grade. <em>Sources: OnDeck Asset Securitization Trust IV, Series 2023-1 (KBRA, July 2023); Affirm Asset Securitization Trust 2024-B (DBRS Morningstar, September 2024).</em></p></figcaption></figure>

## How structuring compresses the tail

<figure><img src="/files/oCsCkhStiK45JbfrI9y6" alt="Per-vintage capital stack"><figcaption><p>Capital stack on a per-vintage basis. Each cohort's net yield absorbs losses before any principal is impaired; the junior tranche absorbs anything beyond that; the senior takes losses only after both layers are exhausted. Markers show realised pool loss, the worst vintage in the book, and the senior break point.</p></figcaption></figure>

On the receivables book 3Jane underwrites, cumulative charge-offs sit around **1%** of disbursed principal. The worst single vintage came in around **4.5%**, and seasoned vintages collectively run under 2%. A facility example with \~4% of yield cushion and a 15% junior tranche puts USD3 / senior first-dollar principal loss at roughly **19% cumulative pool loss per vintage**.

## Correlation: borrowers failing together

<figure><img src="/files/5vZgT9OwXMGBVIcJiwMe" alt="Correlation stress test"><figcaption></figcaption></figure>

To model correlation risk, the structure was pressure-tested with a single-factor t-copula (ν = 10, fatter-tailed than Basel's standard Gaussian framework) at three intra-pool correlation regimes: ρ = 5% (benign), ρ = 15% (Basel's SMB base case), and ρ = 30% (GFC-equivalent correlated stress).

The senior tranche holds up across the relevant range. The 99th-percentile pool loss — a once-a-century outcome — sits at **11.0%** (benign) and **14.5%** (moderate), well within the junior tranche. Even at GFC-equivalent correlation it reaches just **19.9%**, right at the senior break. The senior takes meaningful losses only in the 1-in-1,000 tail combined with GFC-equivalent correlated stress.

<figure><img src="/files/eTiyrSm0AAjzh0Og5GGK" alt="Pool loss to tranche P&#x26;L"><figcaption><p>Propagation from pool loss to tranche P&#x26;L, scenario by scenario. The senior is untouched until pool losses on a vintage cross ~19%; the junior is paid for absorbing everything in between.</p></figcaption></figure>

{% hint style="warning" %}
Target yields and loss figures are illustrative and based on the historically observed performance of the receivables book 3Jane underwrites. They are not guarantees — realised losses, correlation, and recoveries can differ. See [Risks](/risks.md) for protocol-wide risk factors.
{% endhint %}
