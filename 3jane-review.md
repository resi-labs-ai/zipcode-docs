# 3jane comparison — what to take, what we already do better

Read against all 40 pages of `docs-site/3jane/` after finishing the Zipcode content pass. Advice only — nothing here is executed. Ranked by value-per-effort.

## What 3jane does better (ranked)

**1. Worked examples with real numbers.** 3jane's `pull-example-trader-1.md` is their most persuasive page: two options, side by side, with actual dollar amounts and rates ("19.9K LINK → 10K USDC @ 5.33%" vs "68K USDC line @ 8.73%"). Zipcode has all the ingredients for an even better one — a worked originator page: draw $1mm at ~7.5% APR + 0.5% fee, sell the seasoned loan into secondary takeout, show the gain-on-sale math and why the line beats a bank warehouse at SOFR+2.25–3.25%. A depositor-side twin ($100k → zap → szipUSD → NAV path over a quarter) would do the same for suppliers. This is the single highest-value addition and it needs no new protocol facts, just arithmetic on numbers already in the docs.

**2. Diagrams.** 3jane leads its Introduction and Backing pages with a capital-stack figure and a flow-of-funds figure. The Zipcode site currently has zero images, and its three hardest ideas are all diagram-shaped: the two-token stack over isolated credit lines, the credit-line lifecycle (originate → draw → season → secondary sale → repay), and the oracle pipeline (subnet verify → DON sign → Forwarder → gates). Three figures would carry more load than any additional prose.

**3. Live artifacts: addresses, audits, links.** 3jane's addresses page is a table of deployed contracts with Etherscan links, its audits page is five dated report PDFs, and it has a plain Links page (whitepaper, socials, legal docs). Zipcode's equivalents are honestly "TBD" today — correct, and the pages say so plainly — but the standard to hit at mainnet is clear: a broadcast-derived address table with explorer links plus the repo link, published audit PDFs as engagements complete, and a Resources/Links page (currently absent from the nav entirely — worth adding as a section when there are links to put on it). 3jane also links a live backing dashboard from its docs; Zipcode's donation-immune `SeniorNavAggregator` read exists precisely to feed such a page, and linking live solvency telemetry from the zipUSD page would be a stronger trust signal than any prose.

**4. Legal structuring as a first-class page.** 3jane devotes pages to the MCA legal structure, licensing posture, recovery timelines, and supplier recourse — the questions an allocator's counsel asks first. Zipcode's legal story (SPV custody, the repurchase agreement, the insurance product) is genuinely pending, and the docs say so; but when the partners are pinned, this deserves a dedicated page rather than paragraphs scattered across collateral/notary/liquidity.

**5. Market sizing in the manifesto.** 3jane opens with "$1.6T unsecured consumer credit, $5T+ asset-based finance." Zipcode's manifesto argues the mechanism but never sizes the HELOC market or the origination-funding gap. One or two credible figures (user-supplied — not invented) would materially strengthen the pitch page.

**6. FAQ segmentation.** 3jane's FAQ answers operational borrower questions (why was I rejected, how long do recoveries take) alongside supplier questions. Zipcode's FAQ is supplier/investor-only — right for today's audience; add an originator-facing section when the borrower funnel is real.

## What Zipcode already does better — keep it

* **Per-page live-vs-pending candor.** No 3jane page distinguishes built from designed; every load-bearing Zipcode page now carries a status statement. For a pre-launch protocol this is a differentiator with sophisticated readers — do not sand it off.
* **Security transparency.** 3jane points at audit PDFs; Zipcode documents its internal X-Ray program, the verdict ladder, the enumerated 32-interface trust surface, and the explicit "every verdict is capped by the missing external audit" discipline. Post-audit, the combination (internal program + external reports) beats either alone.
* **Fail-closed mechanics as narrative.** 3jane describes what components do; Zipcode's pages consistently explain what happens when things fail (inert receivers, silent no-op gates, floors checked after the move). That framing is worth keeping as the house voice.
* **Persona-based CRE section.** The four "desk" pages (underwriter, treasury, workout, strategist) are more navigable than 3jane's flat algorithm pages.

## Not worth copying

* **Tables everywhere.** 3jane leans on tables (addresses, audits, TVV states). House style here is prose+bullets; the one place a table will genuinely earn its keep is the eventual deployed-address page.
* **Deep vendor mechanics up front.** 3jane's proofs page front-loads zkTLS/EigenLayer/Lagrange specifics. Zipcode's split — plain-language pipeline on the oracle pages, vendor names as one-liners — reads better for the investor/partner audience and avoids over-promising unpinned vendors.
