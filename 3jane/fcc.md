# Fintech Credit Conduits (FCC)

Fintech Credit Conduits (FCCs) are one of the two credit sleeves that [back](/backing/backing.md) USD3 / sUSD3. They are standing, revolving, tranched funding rails — **warehouse loans, participations, and forward-flow agreements** — that finance short-duration SMB and consumer credit originated by other U.S. fintech lenders, routed through bankruptcy-remote SPVs that insulate the collateral from the originator and from 3Jane's sponsor entity.

Fintechs made loan *origination* software-native. 3Jane is making *structured credit* programmable.

## The opportunity

Fintech lenders scale on outside capital. They underwrite and originate loans, finance or sell them to outside investors, retain the origination economics, and repeat. As the book grows, lenders qualify for progressively cheaper funding channels:

* **Bank warehouse** — a revolving credit line advanced against receivables, with the originator retaining a first-loss equity slice.
* **Forward-flow** — whole-loan purchase agreements with asset managers and credit funds, subject to eligibility criteria.
* **Unrated ABS** — a private term takeout with tranched liabilities.
* **Rated ABS** — an agency-rated public securitization placed with institutional buyers.

<figure><img src="/files/4vETxPh4nnDBZH3rnA8i" alt="The originate-to-distribute funding ladder"><figcaption><p>As a lender scales it converges on the originate-to-distribute (OTD) model — moving from balance-sheet-heavy growth to capital-light platform economics.</p></figcaption></figure>

Many originators reach a warehouse, far fewer reach durable forward-flow, and almost no SMB fintech / specialty lenders reach ABS. This is a **structural bottleneck**: originators are too small, too bespoke, or too short-duration to build the full securitization stack — not because the assets fail. The result is a permanent middle market of good credit businesses capped by bilateral facilities, trapped equity, renewal risk, and capital-markets infrastructure that does not compound.

<figure><img src="/files/aakKYBk3D1rbkZilWanI" alt="U.S. asset-based finance and alternative lending market size"><figcaption><p>Within the $5T+ ABF category, the U.S. alternative lending market — fintech-originated consumer and SMB receivables — is projected at $71.6B of annual loan disbursements in 2026, growing to $105.3B by 2029, fragmented across hundreds of originators. <em>(Research and Markets, 2026; figure excludes credit cards, mortgages, and hard-asset lending.)</em></p></figcaption></figure>

## What 3Jane bundles

3Jane packages the parts of private securitization that originators are too small to build and that incumbent credit funds have no incentive to productize:

* **Financial-engineering advantage.** Tranching, standardization, and a standing conduit spread fixed securitization overhead across a platform rather than a single lender. Originators get private-ABS-style economics earlier.
* **Capital-base advantage.** USD3 / sUSD3 is a repeatable senior / junior liability stack backed by diversified stablecoin capital — not one warehouse lender or forward-flow buyer with one mandate, one balance sheet, and one renewal cycle.
* **Market-rails advantage.** Onchain liabilities make issuance, settlement, transfer, and distribution more flexible than bespoke private notes locked inside bilateral credit relationships. Over time USD3 / sUSD3 can plug into the rest of DeFi — collateral markets, vaults, liquidity venues, and settlement rails.

{% hint style="info" %}
FCCs are **not** corporate direct lending underwritten on a borrower's EBITDA. LP exposure is to thousands of the originator's underlying obligors rather than to the fintech itself. That diversification mitigates tail risk and makes losses far more modellable. See [Credit Enhancement & Loss Distribution](/backing/fcc/credit-enhancement-and-loss-distribution.md).
{% endhint %}

## Who 3Jane funds

The initial FCC cohort targets fintech lenders with:

* Pre-seed to Series C VC-backed, PE-backed, or bootstrapped balance sheets
* $5m – $200m outstanding loan portfolio
* Sub-12-month-duration assets
* Asset classes: SMB term, lines of credit, merchant cash advance (MCA), BNPL, revenue-based finance (RBF), factoring, and select short-duration consumer installment loans and lines of credit

## In this section

* [Warehouse Loans & Forward-Flows](/backing/fcc/warehouse-and-forward-flows.md) — the two facility structures, explained simply
* [Credit Enhancement & Loss Distribution](/backing/fcc/credit-enhancement-and-loss-distribution.md) — the protection layers and the risk we are paid for
* [Legal Structuring](/backing/fcc/legal-structuring.md) — bankruptcy-remote SPVs, true-sale, DACA, and the waterfall
* [Banking Rail (Erebor)](/backing/fcc/banking-rail-erebor.md) — the dollar leg of the protocol
* [Facilities](/backing/fcc/facilities.md) — live facilities and how they are reported
