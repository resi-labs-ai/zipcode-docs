# Legal Structuring

Every FCC facility is built so that the assets funding USD3 / sUSD3 are ring-fenced from the originator's corporate credit and from 3Jane's own sponsor entity.

## Bankruptcy-remote SPVs

Each facility funds a **bankruptcy-remote child SPV**. The SPV is insulated from the originator (so an originator bankruptcy does not sweep the collateral) and from 3Jane's sponsor entity. How 3Jane holds the assets depends on the structure:

* **Warehouse.** The originator contributes or pledges eligible receivables into an SPV. 3Jane holds a **perfected first-priority security interest** / senior secured lender position against that collateral, and can sit in a **Senior** or **Mezzanine** tranche within the facility. The originator retains the first-loss equity beneath 3Jane.
* **Forward-flow.** Eligible loans are **purchased** by the FCC child SPV, with beneficial ownership transferring at purchase on a **true-sale** basis, subject to the purchase documents and reps & warranties / repurchase mechanics.

{% hint style="info" %}
Two different tranche layers exist and shouldn't be confused. **Within a warehouse SPV**, 3Jane may sit in a Senior or Mezzanine tranche relative to the originator's equity. **Within the 3Jane pool**, [USD3 is senior and sUSD3 is junior](/usd3-susd3/suppliers.md) relative to each other. The first describes 3Jane's seniority inside a facility; the second describes LP seniority inside the protocol.
{% endhint %}

## Collections control

Borrower repayments land in a deposit account governed by a **Deposit Account Control Agreement (DACA)** — a tri-party agreement among the depository bank, the originator, and 3Jane that gives 3Jane control over the collection account so cash cannot be swept away from the facility. Collections are then applied through the facility **waterfall**: senior interest and principal owed to 3Jane are paid first, and residual economics flow back to the originator only after senior obligations are satisfied.

## Eligibility

Eligibility is enforced at funding / purchase on two levels:

* **Originator-level:** KYB, operating history, vintage performance, underwriting model, servicing capability, and reporting quality.
* **Asset-level:** loan size, tenor, asset class, concentration caps, delinquency status, and obligor / merchant quality (plus consumer credit bands where relevant).

## Overcollateralization tests and haircuts

Warehouse facilities run a recurring **OC / borrowing-base test** (e.g. weekly). Ineligible or delinquent collateral is **haircut** out of the borrowing base before the advance rate is applied — for example, receivables past a delinquency threshold, obligor concentration above a cap, or accounts in payment shortfall receive reduced or zero credit. If current OC falls toward the minimum, the facility moves from in-range to **watch** to **breached**, which can trap cash or trip a trigger.

## Facility lifecycle

A facility moves through phases:

1. **Deploying / revolving.** During the revolving period, eligible principal collections are recycled into new advances or purchases. Because the loans are short-duration, the same committed dollar can turn over many times across diversified receivables.
2. **Amortization / wind-down.** After the revolving period ends, new advances stop; incoming collections pay down the senior balance and return capital through the USD3 / sUSD3 waterfall on an orderly schedule.

Facility status is surfaced as **Active**, **Watch**, **Trigger Tripped**, or **Default**, with weekly surveillance. See [Facilities](/backing/fcc/facilities.md) for how this is reported.
