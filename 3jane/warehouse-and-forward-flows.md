# Warehouse Loans & Forward-Flows

3Jane offers two facility structures. Both are the predominant forms of non-dilutive financing that banks and credit funds use to help fintech lenders scale their loan portfolios. Both have had little to no prior history in DeFi.

<figure><img src="/files/ScZHVqzH5S6Xi64C2HgK" alt="Warehouse loans and forward-flow programs"><figcaption><p>Two facility structures: warehouse loans (revolving credit against a pledged portfolio) and forward-flow programs (whole-loan purchases on a forward calendar).</p></figcaption></figure>

* **Warehouse loans** — a revolving credit line advanced against the fintech lender's own pooled portfolio of loans, segregated in an SPV. 3Jane holds a senior secured position; the originator keeps the first-loss equity beneath it.
* **Forward-flow programs** — whole-loan purchases of receivables that meet predefined eligibility criteria. 3Jane buys the loans outright into a purchaser SPV on a true-sale basis.

## ELI5: a warehouse loan

A warehouse loan is the lowest-lift way for a fintech lender to scale its book without raising more equity.

<figure><img src="/files/RTPCEV8yZzG7mbhGbDxA" alt="Warehouse loan mechanic"><figcaption></figcaption></figure>

Using a Klarna-style "burrito" example:

1. Klarna wants to fund a $4 burrito order on DoorDash. It has $1 of equity from a VC.
2. A lender (3Jane) advances Klarna $3 against the receivable, at a 75% advance rate.
3. Klarna funds the $4 order, pledges the receivable as collateral, and keeps the first-loss slice (the bottom $1).
4. The consumer repays Klarna in installments. Klarna repays the lender, who earns interest. Klarna earns the economics on $4 of loans while tying up only $1 of equity.
5. The same dollar of equity now funds 4x the loans. Repeat across millions of receivables.

## ELI5: a forward-flow

A forward-flow is the next funding rail an originator graduates into once a warehouse can't scale fast enough.

<figure><img src="/files/DDfswY6ZIX5UPP1vYd3f" alt="Forward-flow mechanic"><figcaption></figcaption></figure>

Continuing the burrito example:

1. Klarna has originated $4 of burrito loans, proved performance, and wants to scale to $10 of orders.
2. Doing that through a warehouse would require Klarna to raise more equity to fund the next first-loss slice — extremely dilutive.
3. A credit fund (3Jane) offers to buy the next $10 of receivables outright for $9.85 — a 1.5% purchase discount, whole-loan sale. The buyer earns a double-digit IRR off the embedded yield; Klarna gets capital that never touches its balance sheet.
4. Klarna originates the next batch, sells it on a forward calendar (e.g. weekly takedown), keeps the origination + servicing fee, and recycles all of its capital.

## It's the obligors paying, not the originator

In both structures, the cash flows reaching the senior position are **contractual obligations from named end-borrowers** — the consumers and small businesses behind the receivables — not the operating cash flows of the originator itself. Cash flows are ring-fenced through SPV-level collateral mechanics: a warehouse is secured against eligible receivables held in an originator SPV, while a forward-flow purchases eligible receivables into the buyer SPV on a true-sale basis. See [Legal Structuring](/backing/fcc/legal-structuring.md).

|                                 | Warehouse loan                                                                | Forward-flow                                                                |
| ------------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| **3Jane's position**            | Senior secured lender / noteholder                                            | Owner of the purchased loans                                                |
| **Loan ownership**              | Originator SPV holds receivables; 3Jane holds a perfected first-priority lien | Beneficial ownership transfers to the purchaser SPV at purchase (true-sale) |
| **Key sizing metric**           | Advance rate against the eligible borrowing base                              | Purchase discount / commitment                                              |
| **Originator skin-in-the-game** | First-loss equity beneath 3Jane                                               | Origination & servicing fee; reps & warranties / repurchase                 |
| **Capital recycling**           | Revolving period, then amortization                                           | Forward-calendar takedowns                                                  |

Continue to [Credit Enhancement & Loss Distribution](/backing/fcc/credit-enhancement-and-loss-distribution.md).
