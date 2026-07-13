# Zipcode docs — build & handoff notes

Investor/partner-facing docs site. Self-hosted so the whole stack (site + a future
RAG chat agent) is owned — explicitly NOT hosted Mintlify, whose platform rails would
limit a custom agent. This file is the working memory for anyone (human or agent)
picking the project up. Read it first.

## Run

```bash
pnpm install            # zod is pinned — see GOTCHA below
pnpm dev                # http://localhost:3000 (usually already running in a session)
pnpm build              # static production build
```

Verify after any change: `curl -s -o /dev/null -w '%{http_code}' http://localhost:3000<route>`
should be 200; grep the dev log for `⨯` to catch MDX/compile errors. A dev server is
typically left running on :3000; restart it (`pkill -f "next dev"`, `rm -rf .next`,
re-run) after editing `next.config.mjs` or restructuring `content/`.

## GOTCHA — zod is pinned, do not unpin

`nextra-theme-docs@4.6.1`'s `<Layout>` strips `children` before validating props against
a schema that still marks `children` required; zod ≥ 4.4 rejects the missing field →
**every route 500s** with `"expected nonoptional, received undefined → at children"`.
Fixed by `pnpm.overrides` → `"zod": "4.1.12"` in `package.json`. Keep it pinned; retest
if you ever bump it.

## Stack

Nextra 4.6 (App Router) · Next 15.5 · React 19 · pnpm. **Light mode only** — dark mode
was removed (forced light via `darkMode={false}` + `forcedTheme: 'light'` in
`app/(docs)/layout.tsx`; the `.dark` tokens are stripped from `app/globals.css`).

## Architecture

- **`app/page.tsx`** — the custom marketing **landing** at `/`. All styles scoped under
  `.zc-landing` in **`app/landing.css`** so they never fight the docs theme. Institutional-
  finance editorial: hero + a bespoke "the rail" SVG figure + stack panels + roadmap rail.
- **`app/(docs)/layout.tsx`** — the Nextra `<Layout>` (sidebar/navbar/footer) wraps ONLY the
  docs, via a route group. **`app/(docs)/[...mdxPath]/page.tsx`** is a **required** catch-all
  (`[...]`, not `[[...]]`) so it never collides with `/`. Docs live at root paths
  (`/manifesto`, `/backing/collateral`, …).
- **`app/layout.tsx`** — root: html/body + fonts + `<Head/>` + global CSS. No docs chrome.
- **`content/`** — the docs, as `.mdx` + `_meta.ts` (sidebar order/labels). This is where you write.
- **`app/globals.css`** — the Zipcode brand skin over the Nextra theme (unlayered CSS beats
  Nextra's layered `x:` Tailwind utilities, so no specificity fights).
- **Fonts** via `next/font`: Platypi (serif display, caps, wt 300) / Geist Sans (body) /
  Geist Mono (eyebrows + code). Ported from `zip-code-portal/src/app/(frontend)/globals.css`.

## CRITICAL NAMING — do not swap

**`zipUSD` = the SENIOR $1 utility dollar** (exit hatch + composable lending asset).
**`szipUSD` = the JUNIOR first-loss share** — the headline yield product; earns the return
and takes loss before the senior. (This was gotten backwards once early on and had to be
corrected everywhere. Check every page.)

## Content conventions

Every page:
```mdx
---
title: Page Title
---

<p className="zc-eyebrow">Group Name</p>

# Headline

...prose with ### sections...
```
- **No bare `{ }` in prose** — MDX reads `{...}` as a JSX expression and the parse error
  (`Could not parse expression with acorn`) breaks the shared page-map and 500s EVERY route.
  Reword or backtick anything with braces. (Grep after writing: `grep -rn '[{}]' content --include='*.mdx' | grep -v className`.)
- **No tables, no emojis** in the docs prose (user preference / docs-authoring pattern).
  Use `###` sections + lists. `code` for contract/param names.
- Ground every claim in a repo source. Do not invent numbers or mechanics.

## Content status

**Real, written from cited sources and verified against them:**
- `content/manifesto.mdx`
- `content/backing/collateral.mdx` (SPV custody framed as designed-but-mocked; "bankruptcy-remote" removed — not in sources)
- `content/cre/index.mdx` (the "Chainlink CRE" folder overview; child stubs per producer: controller, revaluation, coordinator, warehouse, buyburn-bid, szalpha-rate, keeper, zipreport)
- `content/reference/control.mdx`
- `content/reference/risk.mdx`

**Everything else is an honest `_Stub._`** pointing at its grounded sources. Build order +
per-page source map is in **`outline.md`** (the most important file here after this one).

## How to continue (the workflow that worked)

1. Pick the next stub page(s) from `outline.md`.
2. Fan out subagents to draft: `general-purpose` agent per page, told to (a) READ the
   cited source files fully, (b) hold the naming convention, (c) return MDX-ready markdown
   + a `## SOURCES` block mapping claims→files, (d) flag anything ungrounded with `«CHECK: …»`,
   (e) create no files.
3. **VERIFY the draft yourself** — read the actual source lines behind the load-bearing
   claims before trusting them. (Do not skip this. Trust was lost once by asserting
   unverified structural claims.)
4. Fix flagged items, strip the SOURCES block, apply naming, integrate as `.mdx`.
5. Rebuild + curl-check routes 200 + grep the log for `⨯`.

`outline.md` was itself built by fanning out read-only `Explore` agents over the four
grounding roots. Re-run that pattern if the spine changes.

## Sources of truth (in the main repo, ../)

Search roots the grounding is restricted to: **`docs/`**, **`build/pending-docs/`**,
**`contracts/src/`**, **`cre/`**. Authority order: `contracts/src/**.sol` (code = truth) →
`docs/wires/*` (code-derived maps) → `docs/*` (ELI20) → `cre/*` (off-chain workflows) →
`build/pending-docs/*` → `build/claude-zipcode.md` = **SPEC(intent)** (design intent, cite as such).

## Known gaps (do not fabricate around these)

- `spv-lien-proof.md` is referenced 7× by the spec but **does not exist**; the SPV custody
  partner + real feeds are **mocked** in the build. Document as designed-but-pending.
- **No `ProtocolConfig` contract** — config is distributed across `ZipcodeController` setters
  + `SiloRegistry` + spec §17. (Folded into `reference/control.mdx`.)
- **No `risk.md`** — Risk was assembled from `build/pending-docs/monitoring.md` + x-ray
  `invariants.md` + `docs/loss.md`.
- **No live-address table** yet — production addresses TBD.

## Phase 2 — the RAG agent (not built)

Inert seams only: `lib/rag/` (README + `retrieve.ts` stub), `scripts/build-index.mjs`
(stub), `app/api/chat/route.ts` (returns 501). Plan B when turned on: build-time static
JSON index (chunk+embed `content/`) + in-memory cosine retrieval + Claude (Haiku), all
Anthropic, ~$0 infra. Needs the docs written first. See `lib/rag/README.md`.

## Working style (learned)

Terse; lead with the claim then support it. Do NOT inject unsolicited "honest framing
notes" that contradict a direction already given — follow the instruction, flag concerns
only after pressure-testing them. Find sources yourself; don't ask to be pointed at files.
Verify before asserting anything about how the protocol works.
