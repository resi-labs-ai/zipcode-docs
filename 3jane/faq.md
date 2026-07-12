# FAQ

**What can funds be used for?**

* Trading, yield farming, working capital
* Use for personal expenses is expressly NOT allowed

**Who can get a credit line?**

* U.S.-based mass affluent / high-net worth market-neutral yield farmers with onchain history, a credit karma account, and a bank account.

**How long might offchain recoveries take?**

* Recoveries from UCC-1 via CEX can take 2-3 months.
* Recoveries from a default judgment averages 6 months. Contested and litigated can average \~2yrs.

**Why did my credit line get rejected?**

* You are not U.S.-based
* Your onchain balance is below $25K. This is to ensure collections efforts are economically viable.
* Your onchain address is too fresh
* The assets you hold / strategies you engage in are outside our credit box
* Your credit score is too low
* We believe you are engaging in first/second/third party fraud

**Does 3Jane furnish to defaults to credit bureaus?**

* Although possible, 3Jane does \*not\* currently furnish to credit bureaus given that direct litigation is an often more effective approach to recoveries for our expected ticket sizes and user profile. Court judgments however, should 3Jane be awarded one, do find their way to credit reports.

**Does 3Jane need any state lending licences in the United States?**

* No, 3Jane is not a lender. 3Jane extends merchant cash advances which is a purchase on future receivables.

**What is "total value verified"?**

* Total Value Verified (TVV) is the real-time USD value of every verifiable dollar that stands behind the pool's deployed credit, across both sleeves. It spans idle USDC parked in Aave, the backing of FCC facilities (eligible receivables plus originator first-loss equity, or purchased-loan principal and interest), the verified onchain, CEX, and bank assets that size CCL credit limits, and capital staged through Erebor. It rebalances automatically as utilization changes and capital moves between sleeves. See [Backing](/backing/backing.md).

**What are the credit lines underwritten against?**

* Against the user's Jane Score + a risk-adjusted LTV of their verified assets—stablecoins, majors, altcoins, staked tokens, LP shares, CEX cash, and bank balances

**What are the max LTVs?**

* Per-asset LTVs range between 5%-95%. Subject to change.

**What is the redemption process for USD3?**

* No fee. USD3 can be redeemed up to the tranche ratio.

**What is the redemption process for sUSD3?**

* sUSD3 has a 1-month lock. After that, you start a cooldown and withdraw within a withdrawal window.

**What is the difference between USD3 and sUSD3?**

* Both are yield-bearing ERC-4626 tokens that represent 3Jane deposits. **USD3** is the senior tranche: it earns a variable share of pool yield, is credit-enhanced, and is the last to be impaired in the waterfall. **sUSD3** is the junior, first-loss tranche: it earns the levered junior share of pool yield, absorbs losses (net recoveries) before USD3, and carries a 1-month lock.
* Both tranches take a fixed *proportion* of whatever the backing generates, so both rates float with pool yield — the senior is not paid a fixed coupon. See [Pool Interest Rates](/usd3-susd3/pool-interest-rates.md).
* $JANE emissions are layered on top of native yield for both tranches — see [Liquidity Mining](/jane/liquidity-mining.md).

**What are the legal recourse mechanisms in case a borrower defaults?**

* 3Jane reserves all rights and remedies to pursue the customer for the advance balance owed, including, but not limited to, pursuing rights in arbitration, pursuing rights in court, if a judgment were awarded, pursuing all rights available by law to enforce such judgment to get paid in full, including the recoupment of attorneys' fees, court costs and post-judgment interest.
* Funds may be recovered from stablecoin issuers, CEXs, and, if necessary, through a court order compelling the wallet holder to disclose or use the private key to repay.

**What legal recourse do suppliers have?**

* Individual supppliers do not pursue merchants directly
* Their claim is enforced collectively through the protocol. Defaults trigger the NPL auction, which assigns the debt to licensed U.S. collection agencies and routes any recovered principal and interest back to the pool, thereby safeguarding lender funds without requiring them to litigate.

**Will you have an insurance fund?**

* For the **Crypto Credit Lines** sleeve, yes. An insurance fund (equity tranche) sits ahead of the junior tranche as first-loss capital, so the order of loss absorption is insurance fund → sUSD3 (junior) → USD3 (senior). 3Jane has deployed $1m of equity capital here, and as the amount on credit scales the implied leverage scales up.
* This insurance fund backstops the crypto credit lines only — it does **not** apply to the Fintech Credit Conduits. Each FCC facility carries its own credit enhancement (originator first-loss equity, overcollateralization, reserves, and performance triggers), with sUSD3 subordination protecting USD3 across both sleeves at the capital-stack level.

### Fintech Credit Conduits

**What are 3Jane's two credit sleeves?**

* **Crypto Credit Lines (CCL):** uncollateralized USDC credit lines 3Jane originates directly to cryptonatives.
* **Fintech Credit Conduits (FCC):** funding 3Jane provides to other U.S. fintech lenders via warehouse loans, participations, and forward-flow purchases. Both sleeves are funded by the same USD3 / sUSD3 stack.

**What is the difference between a warehouse loan and a forward-flow?**

* A **warehouse** is a revolving credit line advanced against a lender's pooled receivables held in an SPV; 3Jane is the senior secured lender and the originator keeps a first-loss equity slice.
* A **forward-flow** is an outright whole-loan purchase of eligible receivables into a buyer SPV on a true-sale basis. See [Warehouse Loans & Forward-Flows](/backing/fcc/warehouse-and-forward-flows.md).

**Are USD3 / sUSD3 holders exposed to the fintech lenders themselves?**

* No. Each facility funds a bankruptcy-remote SPV, so exposure is to thousands of the underlying obligors (consumers and small businesses), not to the originator's corporate credit. An originator bankruptcy does not sweep the collateral.

**Where does FCC yield come from?**

* FCCs are contractual-cash-flow lending: the position is paid from thousands of specific obligations between named end-borrowers — small businesses and consumers — ring-fenced inside an SPV. Yield is the spread between what those borrowers pay on short-duration credit and what it costs to fund them through structured liabilities, net of the originator's servicing economics and expected losses. That residual spread flows into the facility and splits across USD3 (senior) and sUSD3 (junior). See [Credit Enhancement & Loss Distribution](/backing/fcc/credit-enhancement-and-loss-distribution.md).

**What protects USD3 in an FCC facility?**

* Layered credit enhancement: pool excess spread, originator first-loss equity, overcollateralization, reserves, performance triggers, and sUSD3 subordination. See [Credit Enhancement & Loss Distribution](/backing/fcc/credit-enhancement-and-loss-distribution.md).

**Who handles the dollars?**

* 3Jane runs the USD leg — offramp, disbursement, collection, onramp — through [Erebor](/backing/fcc/banking-rail-erebor.md), a nationally chartered U.S. bank.

**What personally identifiable information is stored?**

* Read [Privacy & Storage](/backing/ccl/privacy-and-storage.md).

**Do any 3rd parties have access to personally identifiable information?**

* Only collections agencies have access to personally identifiable information in the case of a default. No other party has visibility into the data, including the Ethereum ledger, Reclaim, Cred protocol, Blockchain Bureau, and others.

**Do I need to install anything on my phone for Reclaim to work?**

* No, we use IOS appclips.

**Connecting to Credit Karma does not work.**

* Go off vpn.
