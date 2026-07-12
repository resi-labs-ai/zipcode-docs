# Glossary

Terms used across 3Jane's two credit sleeves and the USD3 / sUSD3 capital stack.

## Capital stack

* **USD3** — the senior tranche; a credit-enhanced, yield-bearing ERC-4626 token minted by depositing USDC. Earns a variable senior share of pool yield and is protected by sUSD3 subordination and other credit enhancement.
* **sUSD3** — the junior tranche; staked from USD3. Earns the levered junior share of pool yield and absorbs first losses (net recoveries) ahead of USD3. Subject to a lock period.
* **Tranche** — a layer of the capital structure with a defined claim priority. Senior is paid first and takes losses last; junior is paid last and takes losses first.
* **Tranche ratio** (`TRANCHE_RATIO`) — the maximum share of debt that can be subordinated to sUSD3 (e.g. 15% junior cap; the senior is the remainder). Also caps sUSD3 supply.
* **Tranche share variant** (`TRANCHE_SHARE_VARIANT`) — the fixed fraction of pool interest paid to the junior tranche; the senior receives the remainder. Both tranche rates float with pool yield (see [Pool Interest Rates](/usd3-susd3/pool-interest-rates.md)).
* **Waterfall** — the order in which losses are absorbed (junior first, senior last) and principal is repaid; interest is split between the tranches by the tranche share variant.
* **Excess spread** — net yield a pool generates over its life before any principal is impaired; the first layer of loss absorption.
* **TVV (Total Value Verified)** — every verifiable dollar standing behind the pool's deployed credit.

## Sleeves

* **CCL (Crypto Credit Lines)** — 3Jane's direct sleeve: uncollateralized USDC credit lines underwritten to cryptonatives and held by 3Jane.
* **FCC (Fintech Credit Conduits)** — 3Jane's conduit sleeve: funding provided to other fintech lenders via warehouse loans, participations, and forward-flows.

## Crypto Credit Lines

* **3CA (3Jane Credit Algorithm)** — the offchain underwriting algorithm that sets a credit line's size, default-risk premium, and repayment rate.
* **Jane Score** — a composite of onchain and offchain creditworthiness (Cred Protocol, Blockchain Bureau, VantageScore 3.0).
* **DRP (Default-Risk Premium)** — the per-borrower rate added on top of the base money-market rate.
* **MCA (Merchant Cash Advance)** — the legal structure for a CCL credit line: a purchase of future receivables that establishes recourse under U.S. law.
* **Merchant** — a CCL borrower.

## Fintech Credit Conduits

* **Originator** — the fintech lender 3Jane funds; it acquires, underwrites, and services the end-borrowers.
* **Warehouse loan** — a revolving credit line advanced against a pledged pool of receivables in an SPV; 3Jane is the senior secured lender.
* **Forward-flow** — an outright whole-loan purchase of eligible receivables on a forward calendar (true-sale).
* **Participation** — a purchased interest in a pool of receivables or a facility.
* **SPV (Special Purpose Vehicle)** — a bankruptcy-remote entity that holds the receivables, insulated from the originator and from 3Jane's sponsor.
* **Bankruptcy-remote** — structured so a counterparty's bankruptcy cannot sweep the collateral.
* **Advance rate** — the percentage of the eligible borrowing base 3Jane lends against (e.g. 75%).
* **Overcollateralization (OC)** — the cushion by which eligible collateral exceeds the drawn balance; tested on a schedule.
* **First-loss equity** — the originator's own capital that absorbs losses before 3Jane's position.
* **DACA (Deposit Account Control Agreement)** — a tri-party agreement giving 3Jane control of the collection account.
* **True-sale** — a transfer where beneficial ownership of the loans passes to the buyer SPV.
* **Servicer / backup servicer** — the party that collects payments; a backup stands ready if the primary fails.
* **Coupon** — the interest rate paid to the facility / noteholder.
* **WAL (Weighted-Average Life)** — the average time to receive principal across the pool.
* **DPD (Days Past Due)** — delinquency measured in days since a missed payment.
* **Charge-off** — principal written off as uncollectible; cumulative charge-offs measure realized loss.
* **Vintage** — a cohort of loans grouped by origination period, tracked for performance.
* **Revolving period** — the phase during which principal collections are recycled into new advances or purchases.
* **Amortization** — the wind-down phase: advances stop and collections pay down the senior balance.
* **Staging** — capital off-ramped to cash but not yet wired into a facility.
* **Complexity premium** — the portion of a borrower's rate that compensates for speed and access rather than credit risk.
