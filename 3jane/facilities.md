# Facilities

3Jane funds each originator through a discrete **facility** — either a warehouse loan or a forward-flow program. This page covers the first live facility and how facilities are reported.

## Live facility: LendSwift $10M senior warehouse

<figure><img src="/files/oCe3n0FoZqWPvswEXkH8" alt="3Jane x LendSwift senior warehouse facility"><figcaption></figcaption></figure>

3Jane executed a **$10M senior warehouse facility** with LendSwift, a U.S. fintech lender focused on short-duration consumer-installment loans. USD3 and sUSD3 fund the facility, which carries a 15% coupon and is backed by a diversified pool of \~15,000 consumer receivables with a \~4-month weighted-average term.

| Term                          | Value                                                                                        |
| ----------------------------- | -------------------------------------------------------------------------------------------- |
| Facility type                 | Senior warehouse                                                                             |
| Facility size                 | $10,000,000                                                                                  |
| Advance rate                  | 75%                                                                                          |
| Coupon (rate to facility)     | 15%                                                                                          |
| Net APY to lenders            | \~16%                                                                                        |
| Term                          | 12-month revolving + 6-month amortization                                                    |
| Revolving period end          | May 26, 2027                                                                                 |
| Final maturity                | November 26, 2027                                                                            |
| Minimum overcollateralization | 33%                                                                                          |
| Underlying WAL                | \~124-day weighted-average term                                                              |
| Collateral                    | \~15,215 short-duration consumer-installment loans pledged to a bankruptcy-remote SPV        |
| Underlyer                     | Short-term installment / debt-consolidation loans up to $1,500 to underserved U.S. consumers |
| Credit enhancement            | LendSwift retains 25% first-loss equity beneath 3Jane (1.33x OC)                             |
| Collections control           | Deposit Account Control Agreement (DACA); tri-party                                          |
| Surveillance                  | Weekly                                                                                       |

### Cash flow structure

<figure><img src="/files/9KmF6u7HgmTVaO1x7n6v" alt="LendSwift facility cash flow structure"><figcaption><p>The facility contributes a blended ~16% net APY. USD3 sits senior (~13.1% APY, ~64% of the stack); sUSD3 sits junior (~32% APY, ~11%); LendSwift funds a 25% first-loss layer beneath both, so defaults erode the originator's equity before either 3Jane tranche is touched.</p></figcaption></figure>

### How it works

<figure><img src="/files/dBxvONgGovOOE17ZDFmr" alt="LendSwift flow of funds"><figcaption></figcaption></figure>

1. **Lenders → 3Jane.** Depositors mint **USD3** (senior) or stake into **sUSD3** (junior). 3Jane allocates a portion of pooled capital to the LendSwift line.
2. **3Jane → SPV → LendSwift.** Capital is committed through a bankruptcy-remote SPV. 3Jane holds the senior secured position; LendSwift retains first-loss equity. As LendSwift contributes eligible loans, it draws against the $10M commitment at up to a 75% advance rate.
3. **LendSwift → borrowers.** LendSwift runs the lending business — acquisition, underwriting, origination, servicing. 3Jane provides the balance sheet and monitors the collateral pool.
4. **Borrowers → collection waterfall.** Repayments land in a DACA-controlled account; senior interest and principal to 3Jane are paid first, residual to LendSwift.
5. **Revolving period.** During the 12-month revolving phase, eligible principal collections recycle into new advances. With a \~124-day WAL, the same committed dollar turns over multiple times.
6. **Amortization & wind-down.** After the revolving period, advances stop and collections pay down the senior balance through the USD3 / sUSD3 waterfall.

This opens mainstream consumer credit as a new, uncorrelated asset class for cryptonative capital — backed by diversified consumer loans rather than only cryptonative leverage demand. Across thousands of obligors, no single default moves the pool.

## How facilities are reported

Every facility is surfaced with live performance data at [app.3jane.xyz/info/pulls/fcc](https://app.3jane.xyz/info/pulls/fcc). Reporting includes:

* **Aggregate KPIs** — live facilities, committed capital, deployed capital, average utilization, average net APY, average credit enhancement (warehouse OC), weighted-average remaining term, and total underlying loans.
* **Warehouse table** — fintech, asset class, tranche, limit, drawn (+ utilization), APY, loan count, advance rate, maturity, and status.
* **Forward-flow table** — fintech, asset class, commitment, deployed (+ utilization), gross APY, loan count, net loss, servicer, term, and status.
* **Per-facility detail** — overview (OC snapshot, coupon, maturity, phase), composition (obligor concentration, geography, customer type, vintages), performance (delinquency buckets, vintage curves, roll rates, charge-off / first-payment-default / prepayment trends), liquidity (obligations due, collateral, collections, deploy runway), and terms (test parameters, haircut rulebook, triggers, servicers).
* **Loan tape** — where a facility publishes it, an anonymized loan-level tape (loan ID, origination, industry, principal, APR, days-past-due, state, revenue band) with per-loan payment schedules. Borrower identities are never disclosed.

Surveillance runs weekly; facility status reads **Active**, **Watch**, **Trigger Tripped**, or **Default**.

{% hint style="info" %}
This is the first of several facilities. 3Jane is building standing funding rails for short-duration SMB and consumer credit originated by U.S. fintechs — warehouse, forward-flow, and unrated ABS compressed into one programmable conduit.
{% endhint %}
