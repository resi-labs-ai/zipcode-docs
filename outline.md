# Zipcode docs — spine & source-of-truth map

The spine mirrors 3jane's **idea structure** (thesis → liability side → asset side → loss waterfall → reference); every page below is Zipcode's own content, and each is grounded in the actual repo files listed under it. Paths are repo-relative to `/Users/root1/zipcode-euler`.

**Source tiers, most-to-least authoritative:** `contracts/src/**.sol` (code = truth) → `docs/wires/*` (code-derived wiring maps) → `docs/*` (ELI20 summaries) → `cre/*` (off-chain workflows) → `build/pending-docs/*` (narrative) → `build/claude-zipcode.md` = `SPEC(intent)` (design intent, not truth). `x-ray/` dirs carry per-contract security verdicts.

**Naming (fix the earlier error): `zipUSD` is the SENIOR $1 utility dollar (exit hatch + composable). `szipUSD` is the JUNIOR first-loss share — the headline yield product.**

**Gaps flagged inline as `GAP:`** — topics 3jane documents that Zipcode has not written yet or has spec-only.

---

## Overview

### Manifesto — *(3jane: Manifesto)*
The "why": home-equity credit on-chain; warehouse-style lines to KYB'd HELOC originators already feeding secondary takeout; gain-on-sale; venue-neutral rail, not a fund.
- `SPEC(intent)` `build/claude-zipcode.md` §0 header (lines 3–12), §14 business context (lines 1400–1411), §5 gain-on-sale (line 248)
- `docs/venue.md` (lines 6–7, 16–20) — venue-neutral rail, senior sees only residual after junior
- `docs/README.md` (lines 3, 24–26) — ELI20 restatement of the thesis
- `GAP:` no standalone manifesto/thesis file exists — thesis lives in spec + the two docs above.

### Introduction / system overview — *(3jane: Introduction)*
One senior dollar (zipUSD) + junior first-loss (szipUSD) over isolated credit lines; the component map; venue-neutrality.
- `docs/README.md` (whole file) — canonical ELI20 system map / front door
- `docs/wires/SYSTEM-SEAM-MAP.md` — code-derived cross-contract seam graph
- `docs/venue.md`, `docs/wires/README.md`, `docs/wires/COVERAGE.md`
- Implementation anchors: `contracts/src/ZipcodeController.sol`, `contracts/src/venue/IZipcodeVenue.sol`, `contracts/src/supply/ZipDepositModule.sol`, `contracts/src/supply/szipUSD/SzipUSD.sol` + `ExitGate.sol`, `contracts/src/supply/ZipRedemptionQueue.sol`, `contracts/src/SiloRegistry.sol` + `SeniorNavAggregator.sol`, `contracts/src/supply/SzipNavOracle.sol`
- `SPEC(intent)` §0 (lines 19–23), §1 component map (lines 27–85)

---

## Supply — the liability side

### zipUSD & szipUSD — the tranches — *(3jane: Suppliers)*
Senior $1 utility dollar vs junior first-loss share; who earns/loses what.
- `contracts/src/interfaces/euler/IZipUSD.sol` — senior token interface (ESynth mint/burn)
- `contracts/src/supply/szipUSD/SzipUSD.sol` (+ `docs/supply/szipUSD/SzipUSD.md`, x-ray) — junior share token
- `contracts/src/SeniorNavAggregator.sol` (+ `docs/SeniorNavAggregator.md`, `docs/wires/CTR-05-SeniorNavAggregator.md`) — senior claim/NAV
- `contracts/src/loss/DefaultCoordinator.sol`, `docs/loss.md` — junior-first-loss ordering
- `SPEC(intent)` §§ lines 9, 34–38, 93–95, 100–115, 151–152

### Deposit & redeem — *(3jane: Supply USDC + Liquidity)*
The zap in; senior par exit; junior CoW buy-and-burn exit.
- `contracts/src/supply/ZipDepositModule.sol` (+ `docs/supply/ZipDepositModule.md`, `docs/wires/WOOF-06.md`) — USDC→supply zap
- `contracts/src/supply/ZipRedemptionQueue.sol` (+ `docs/supply/ZipRedemptionQueue.md`, `docs/wires/9-ZipRedemptionQueue.md`) — senior par-burn exit
- `contracts/src/supply/szipUSD/ExitGate.sol` (+ `docs/supply/szipUSD/ExitGate.md`, `docs/wires/ExitGate-szipUSD.md`) — junior custody/mint/burn gate
- `contracts/src/supply/szipUSD/SzipBuyBurnModule.sol` (+ `docs/wires/8-B14-SzipBuyBurnModule.md`) — CoW buy-and-burn exit
- `cre/buyburn-bid/` (workflow.go, README.md) — off-chain bid producer
- `docs/wires/interfaces-cow.md`

### Rates & yield — *(3jane: Pool Interest Rates)*
Senior yield (real lending APR/fees → warehouse over-collateralizes zipUSD); junior return = NAV accretion from the options-yield flywheel + xALPHA.
- Senior: `contracts/src/supply/CreditWarehouse/WarehouseAdminModule.sol` (+ `docs/wires/8-Bw-CreditWarehouse.md`), `contracts/src/venue/EulerVenueAdapter.sol`, `cre/warehouse/`
- Junior flywheel: `contracts/src/supply/szipUSD/{FarmUtilityLoopModule,LpStrategyModule,HarvestVoteModule,ExerciseModule,SellModule,RecycleModule}.sol` (+ `docs/wires/8-B5..8-B10`)
- `contracts/src/supply/SzipNavOracle.sol` — NAV = the return primitive
- `contracts/src/bridge/SzAlphaRateOracle.sol` (+ `cre/szalpha-rate/`) — xALPHA rate leg
- `SPEC(intent)` §§ lines 93–95, 210, 232, 253–255

### Liquidity — *(3jane: Liquidity)*
Redemption/exit profile + the coverage floor that locks junior equity.
- `contracts/src/supply/szipUSD/DurationFreezeModule.sol` (+ `docs/supply/szipUSD/DurationFreezeModule.md`, `docs/wires/DurationFreezeModule.md`) — debt-pinned coverage floor
- `contracts/src/supply/szipUSD/OffRampModule.sol` (+ `docs/wires/OffRampModule.md`)
- `contracts/src/supply/ZipRedemptionQueue.sol`
- `docs/wires/COVERAGE.md`, `docs/wires/SYSTEM-SEAM-MAP.md`
- `SPEC(intent)` §§ lines 153–158, 261–265, 302–358

---

## Backing — the asset side

### What backs zipUSD — *(3jane: Backing / TVV)*
Donation-immune senior-backing sum across silos; solvency telemetry.
- `contracts/src/SeniorNavAggregator.sol` (+ `docs/SeniorNavAggregator.md`, `docs/wires/CTR-05-SeniorNavAggregator.md`, `contracts/src/x-ray/SeniorNavAggregator.md`)
- `contracts/src/interfaces/supply/ISeniorPool.sol` — venue-neutral senior read
- `contracts/src/SiloRegistry.sol` + `docs/SiloRegistry.md`
- `SPEC(intent)` §4.5 / §8.5

### Credit structures: repo (structure 1) & revolving (structure 2) — *(3jane: Warehouse & Forward-Flows)*
Two line structures carried as opaque `lineRef`s; repo = default, revolving = open-once borrow→repay→redraw.
- `contracts/src/ZipcodeController.sol` (+ `docs/ZipcodeController.md`, `contracts/src/x-ray/ZipcodeController.md`) — orchestrator; `_draw` primitive
- `docs/wires/CTR-08-structure-2-revolving.md` — the definitive structure-1 vs structure-2 contrast
- `docs/venue.md` — built-today list (CTR-08 revolving, CTR-09 fee, CTR-13 rate, CTR-04 reclaim)
- `SPEC(intent)` §4 structures, §8.9 report types

### Ring-fencing & custody: the warehouse — *(3jane: Legal Structuring)*
The Safe custodying EulerEarn shares that back all zipUSD, Zodiac Roles-scoped to four ops.
- `contracts/src/supply/CreditWarehouse/WarehouseAdminModule.sol` (+ `docs/supply/CreditWarehouse/WarehouseAdminModule.md`, `docs/wires/8-Bw-CreditWarehouse.md`, x-ray set)
- `contracts/src/interfaces/zodiac/IRoles.sol` + `docs/interfaces/interfaces-zodiac.md`; `docs/interfaces/interfaces-safe.md`; `docs/roles.md`
- `cre/warehouse/` (workflow.go, funding.go, solver.go)
- `SPEC(intent)` §8.5, §11 two-Safe freeze model

### Isolation: per-line vault, gate, token — *(3jane: Legal Structuring)*
On-chain ring-fence per line.
- `contracts/src/CREGatingHook.sol` (+ `docs/CREGatingHook.md`, x-ray) — per-line borrow gate
- `contracts/src/LienCollateralToken.sol` (+ `docs/LienCollateralToken.md`, x-ray) — 1/1 line identity + collateral
- `contracts/src/LienTokenFactory.sol` (+ `docs/LienTokenFactory.md`, x-ray) — squat-proof CREATE2 minter
- `contracts/src/venue/LineAccount.sol` (+ x-ray) — per-line borrower-of-record
- `contracts/src/ZipcodeOracleRegistry.sol` (+ `docs/ZipcodeOracleRegistry.md`) — per-line frozen price key
- `docs/wires/WOOF-01.md`, `WOOF-02.md`, `WOOF-05.md`

### The venue seam — *(Zipcode-specific; no 3jane analog)*
Venue-neutral adapter; Euler is adapter one.
- `contracts/src/venue/IZipcodeVenue.sol` (+ x-ray) — the interface (plain values only)
- `contracts/src/venue/EulerVenueAdapter.sol` (+ x-ray) — the built adapter
- `docs/venue.md`, `docs/wires/WOOF-04.md`, `docs/wires/SYSTEM-SEAM-MAP.md`
- `contracts/src/interfaces/euler/IEulerEarn.sol` + `docs/interfaces/interfaces-euler.md`
- `SPEC(intent)` §4.7

### SPV custody & Proof attestation — *(3jane: Legal Structuring + Proofs)*
Off-chain SPV custody of the perfected lien; Proof-notarized lien/value/insurance/title/income surfaced by the CRE.
- `GAP:` `spv-lien-proof.md` referenced by the spec (lines 22, 84, 923, 948, 1376, 1467, 1722) but **does not exist**; SPV custody partner + feeds are mocked in build.
- Grounded operationally by: `cre/controller/` (README.md, workflow.go) — the six fail-closed Proof gates (`lienPerfected`, `insured`, `identityOk`, `creditOk`, `incomeOk`, `titleClean`)
- `cre/revaluation/` — Proof-of-Value re-appraisal → on-chain marks
- `docs/bridge.md` + `contracts/src/bridge/*` — Bittensor(964)↔Base szALPHA bridge surfacing validator data
- `SPEC(intent)` §8.9 Proof gate, §8.10 notarized-facts consensus, §4/§11

### The junior engine — szipUSD auto-compounder — *(Zipcode-specific; loosely 3jane "where yield comes from")*
Keeper-driven options-yield flywheel: harvest → exercise → sell → LP → recycle, financed by a leverage loop.
- `contracts/src/supply/szipUSD/{HarvestVoteModule,ExerciseModule,SellModule,LpStrategyModule,RecycleModule,FarmUtilityLoopModule,FarmUtilityBorrowGuard,OffRampModule}.sol` (+ matching `docs/supply/szipUSD/*.md`, `docs/wires/8-B5..8-B10`, and the `x-ray/portfolio-map.md`)
- `cre/keeper/internal/job/` — `strike_loop_job.go`, `winddown_lp_job.go`, `redemption_job.go`, `burn_job.go`
- `build/pending-docs/auto-compounder.md` — canonical flywheel narrative

### Pricing & NAV — *(3jane: Pool Interest Rates math)*
The NAV keystone + trustless LP pricing.
- `contracts/src/supply/SzipNavOracle.sol` (+ `docs/supply/SzipNavOracle.md`, `docs/wires/8-B4-SzipNavOracle.md`, x-ray)
- `contracts/src/supply/AlgebraIchiFairLpOracle.sol`, `SzipFarmUtilityLpOracle.sol` (+ docs, `docs/wires/FairLpOracle.md`)
- `contracts/src/supply/lib/IchiAlgebraFairReserves.sol`, `contracts/src/libraries/ConcentratedLiquidity.sol`
- `cre/keeper/internal/quote/` (quote.go, tickmath.go)

### xALPHA / HYDX / Hydrex — *(3jane: Assets-ish)*
What xALPHA/HYDX are and how the flywheel uses Hydrex/Algebra/ICHI.
- `contracts/src/bridge/*` (`SzAlpha.sol`, `SzAlphaRateOracle.sol`, `SzAlpha{LockReleasePool,Mirror,TokenPool}.sol`) + x-ray
- `contracts/src/loss/LienXAlphaEscrow.sol` (+ `docs/wires/8-Bx-LienXAlphaEscrow.md`)
- `contracts/src/interfaces/hydrex/IOptionToken.sol`, `contracts/src/interfaces/algebra/ISwapRouter.sol`
- `docs/interfaces/{interfaces-hydrex,interfaces-algebra,interfaces-ichi}.md`, `docs/wires/8x-01-szALPHA-bridge.md`, `8x-02-SzAlphaRateOracle.md`
- `build/pending-docs/hydrex.md`, `docs/hydrex-demo-fork.md`

---

## Solvency & loss

### The loss waterfall — *(3jane: Credit Enhancement & Loss Distribution)*
Junior first-loss before senior; provision-that-recovers; single loss orchestrator.
- `contracts/src/loss/DefaultCoordinator.sol` (+ `docs/wires/DefaultCoordinator.md`, x-ray set incl. `invariants.md`) — sole provision writer + bond router
- `contracts/src/loss/LienXAlphaEscrow.sol` — per-line xALPHA first-loss bond
- `contracts/src/interfaces/loss/{ISzipNavOracle,ILienXAlphaEscrow}.sol` + `docs/wires/interfaces-loss.md`
- `docs/loss.md`, `docs/SiloRegistry.md` (waterfall ordering statement)
- `contracts/src/supply/szipUSD/DurationFreezeModule.sol` — coverage-floor freeze
- `SPEC(intent)` §11

### Wind-down / global unwind — *(Zipcode-specific)*
Ragequit NOT wired; unwind = orchestrated CoW drain.
- `docs/interfaces/interfaces-baal.md` (+ `docs/wires/interfaces-baal.md`) — canonical "ragequit unwired; full unwind = CoW drain scaled up"
- `contracts/src/supply/szipUSD/SzipBuyBurnModule.sol` (+ `docs/wires/8-B14-SzipBuyBurnModule.md`) — the only exit primitive
- `contracts/src/supply/szipUSD/ExitGate.sol`; `contracts/src/interfaces/cow/IGPv2Settlement.sol` + `docs/wires/interfaces-cow.md`
- `contracts/src/interfaces/baal/*` — Baal interfaces (ragequit present, unwired)

### Silos & scaling — *(3jane: Facilities / federation)*
Many pools under one senior dollar; admission gate; concurrent-line ceiling.
- `contracts/src/SiloRegistry.sol` (+ `docs/SiloRegistry.md`, `docs/wires/CTR-02-SiloRegistry.md`, x-ray) — `MAX_LINES_PER_SILO = 28`, admission topology asserts
- `contracts/src/SeniorNavAggregator.sol` (+ `docs/wires/CTR-05-SeniorNavAggregator.md`)
- `docs/wires/CTR-06c-SiloDeployer.md`, `CTR-06b-JuniorTrancheDeployer.md` (deployer sources under `contracts/script/`)

---

## Reference

### The CRE / oracle layer — *(3jane: Credit Underwriter + Proofs)*
The off-chain workflow that fetches + zk-verifies every credit fact and drives every sensitive op.
- `cre/zipreport/` — shared §8.0 report-encoding library (encode table = decode source of truth)
- `cre/controller/` (CRE-01b) — underwriting/lifecycle + the six Proof gates → `ZipcodeController`
- `cre/revaluation/` (CRE-01a) — Proof-of-Value sweep → `ZipcodeOracleRegistry`
- `cre/coordinator/` (CRE-01c) — loss/default-recovery → `DefaultCoordinator`
- `cre/warehouse/` (CRE-04), `cre/buyburn-bid/` (CRE-05a), `cre/szalpha-rate/` (8x-02, the only cross-chain pull)
- `cre/keeper/` — the read→compute→submit spine (single immutable operator identity)
- `cre/scaffold/`, `cre/sharefeeds/`
- `contracts/src/supply/szipUSD/CloneReportReceiver.sol` — fail-closed clone report intake
- `contracts/src/interfaces/bridge/{ISubtensorPrecompiles,ICctRegistry,IXAlphaRate}.sol`, `docs/wires/interfaces-bridge.md`, `docs/bridge.md`

### Protocol config — *(3jane: Protocol Global Config)*
- `GAP:` no dedicated `ProtocolConfig` contract. Config is distributed:
- `contracts/src/ZipcodeController.sol` (Timelock-settable wiring setters ~lines 138–168) + `docs/ZipcodeController.md`
- `contracts/src/SiloRegistry.sol` — `SiloConfig` struct + `addSilo`
- `SPEC(intent)` §17 locked decisions, §4.7

### Roles & control — *(Zipcode-specific; part of 3jane Developers)*
Safe identities, Zodiac Roles, the trusted controller, deploy-time key handoff.
- `docs/roles.md`, `docs/safe-identities.md`
- `contracts/src/interfaces/safe/*`, `contracts/src/interfaces/zodiac/*` + `docs/interfaces/{interfaces-safe,interfaces-zodiac}.md`
- `contracts/src/ZipcodeDeployAsserts.sol` (+ `docs/ZipcodeDeployAsserts.md`, x-ray) — S11 seal assertion before `transferOwnership(timelock)`
- `contracts/script/DeployZipcode.s.sol` + `docs/wires/DeployZipcode.md`

### Risk — *(3jane: Risks)*
- `GAP:` no standalone `risk.md`. Risk surface is distributed:
- `build/pending-docs/monitoring.md` — the four things that can end the product (the race, the whale, the backing, the floor)
- `contracts/src/**/x-ray/invariants.md` (loss, bridge, warehouse, supply/lib, hydrex-demo-fork)
- `docs/loss.md` + `SPEC(intent)` §11

### Contracts & addresses — *(3jane: Developers/Addresses)*
- `docs/wires/COVERAGE.md` — every `.sol` → its doc (provable completeness)
- `contracts/script/BaseAddresses.sol` — address manifest
- `contracts/script/{DeployZipcode,DeployLocal,DeployMainnet,SiloDeployer,JuniorTrancheDeployer,CreditWarehouseDeployer}.s.sol`, `RUNBOOK-mainnet-deploy.md`

### Audits / security — *(3jane: Resources/Audits)*
- `contracts/src/**/x-ray/` — per-contract Verdicts (HARDENED/ADEQUATE), invariants, entry-points
- `contracts/src/interfaces/x-ray/dependency-surface.md` — external dependency attack surface
- No external audit yet (every verdict is capped below a clean bill by its absence).

### Resources — FAQ · Glossary — *(3jane: Resources)*
- `GAP:` to author fresh from the material above (no source file).

---

## Structural gaps vs 3jane (author fresh or mark as roadmap)

- **Manifesto** — no file; write from spec §0/§14 + `docs/venue.md`.
- **SPV custody & Proof** — `spv-lien-proof.md` absent; SPV partner mocked. Document as designed-but-pending; ground in `cre/controller` + `cre/revaluation`.
- **Protocol config** — no `ProtocolConfig` contract; assemble from controller setters + `SiloRegistry` + spec §17.
- **Risk** — no `risk.md`; assemble from `build/pending-docs/monitoring.md` + x-ray invariants.
- **FAQ / Glossary** — author fresh.
