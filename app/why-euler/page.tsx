import type { Metadata } from 'next'
import '../landing.css'
import './why-euler.css'
import { Logo } from '../logo'
import { ThemeToggle } from '../theme-toggle'
import { EulerMark } from '../euler-mark'

export const metadata: Metadata = {
  title: 'Why Euler:',
  description:
    'Euler empowers curators to be creative.',
}

const S = [
  {
    idx: '01',
    prim: 'Euler Vault Kit',
    title: 'EVK vaults are extremely customizable.',
    node: 'evk',
    body: [
      `The Euler Github reads like an old garage full of shelved inventions, built by an architect who never bothered to share them with the market. Euler is probably the most flexible, curator-centric money market infrastructure on EVM.`,
      `The result is a resilient and liberated design system:`,
      `- Do you want single-use, Isolated vaults?`,
      `- Do you want a custom oracle for each vault?`,
      `- Do you want Gated Access to vaults based on having met underwriting criteria?`,
      `Euler has everything you need to build a private credit market.`,
    ],
  },
  {
    idx: '02',
    prim: 'Euler Earn I',
    title: 'A built-in Allocation.',
    node: 'line-account',
    body: [
      `Each Euler Earn structure can house 30 USDC supply vaults, and allocate deposits between those vaults.`,
      `In the case of Zipcode, we interpret this as:`,
      `- One USDC Reserve vault, which holds idle supply.`,
      `- One Farm vault, which is a credit line dedicated to auto-exercising oHYDX tokens.`,
      `- 28 Lines of Credit, which are single use, isolated EVK vaults.`,
      `Credit lines will only lend USDC when the underwriting & KYB gates have been fulfilled. The Allocator funds the loan from the Reserve vault. When the borrower has paid the loan off, the credit line is deregistered, to make room for a new line.`,
      `Basically condoms for Private Credit.`,
    ],
  },
  {
    idx: '03',
    prim: 'Euler Earn II',
    title: 'An Accounting Engine.',
    node: 'euler-earn',
    body: [
      `A happy discovery of the 30 slot limitation is the implicit Federation of Isolated Vaults pattern.`,
      `ZipUSD addresses depeg risk by imposing duration risk on lenders:`,
      `If $1mm in Credit Lines are in use, the Junior Tranche must have $1mm of value held in reserve.`,
      `The resulting structure is a paired Warehouse <> Junior Tranche facility, which can facilitate up to 28 active lines of credit.`,
      `A couple of questions come to mind:`,
      `- What if you need 29 lines of credit?`,
      `The limitation is a forcing function for qualification of borrowers, requiring them to have better underwriting than the other applicants.`,
      `- How can a Private Credit Conglomorate better serve lenders & borrowers?`,
      `If you end up needing to take on more than 28 credit lines, you end up with a small cluster of credit facilites. This is interesting, because different tranches of risk, and different credit products can be offered by each Warehouse. Each Warehouse Cluster contains its Risk, Utilization & Redemption rules.`,
      `In short:`,
      `If Warehouse A has a default, and both Warehouse A & Warehouse B share a Credit Dollar, then the until that default is resolved, the credit dollar lacks backing. If each Warehouse Cluster tracks its [Utilizaton]/[Total Shares], and requires that at least that much be present in NAV for the Junior Tranche -- then you can protect the credit dollar from depeg through quarantine within each warehouse.`,
      `RWA Private Credit recourse is achieved through SPVs, Repurchase Agreements, and off-chain secondary credit funds. This illiquidity requires depositors to coordinate:`,
      `- Enough deposits to attract borrowers.`,
      `- Enough isolation to diminish risk.`,
      `An honest accounting of what this looks like, is a Junior Tranche that doesn't underwrite trash, and holds until the loan is paid off (or the default clears). These Warehouse Clustes scale into a diversified set of credit products, run by what is essentially a Private Credit conglomorate.`,
    ],
  },
  {
    idx: '04',
    prim: 'Euler Price Oracles',
    title: 'An Oracle for Every Loan.',
    node: 'oracle-registry',
    body: [
      `Bespoke Private Credit agreements, with RWA assets as collateral, require custom Oracles.`,
      `To date, RWA Oracles have been of Tokenized Funds, that way each individual ACRED share tracks the underlying value of its backing. Chainlink has quietly introduced an alternative to this in the form of CRE managed datastreams, which can be fit into adapters to provide more ephemeral price feeds.`,
      `Secondary Markets for RWAs are off-chain -- tied to individual property, lien values, or offchain credit scores. Onchain settlement, and sourced capital can supply loans to these collateral types as long as there is an oracle which can report the value of that collateral. Structurally, this gets into zkProofs on underwriting qualifications, and notarized liens with repurchase agreements, but this is also where onchain finance needs to go in order to serve financial needs beyond onchains speculation.`,
      `The long tail of collateral types requires a long tail of oracles.`,
    ],
  },
  {
    idx: '05',
    prim: 'EVK Hooks',
    title: 'Access-Gating for Private Credit.',
    node: 'cre-gating-hook',
    body: [
      `EVK Vaults have a hooks feature, which can gate vault functions to specific parties:`,
      `- Vaults that are Whitelisted to KYB Entities.`,
      `- Vaults which require a certain credit score, or verified income to access capital.`,
      `- Vaults which can only be liquidated through specialized machines.`,
      `These hooks enable Institutional Lending, Private Credit, Underwriting, or bespoke structured products intended for specific large holders to deploy capital. Again, Euler lands on the side of empowering curators to build custom solutions, rather than narrowing that capacity in favor of a more unilateral risk framework. The result is a less opinionated infrastructure, which can facilitate many approaches to onchain finance -- rather than a more limited pallete. `,
    ],
  },
  {
    idx: '06',
    prim: 'ESynth',
    title: 'A minimalist, Euler-native Synthetic Asset Vault',
    node: 'eulerswap',
    body: [
      `zipUSD is not our token standard: it is Euler's ESynth, deployed with (EVC, "Zipcode USD", "zipUSD"). The deposit zap is a capacity-granted minter; the redemption queue burns from its own balance through the allowance-free seam. The senior dollar is an Euler-native object end to end.`,
      `Euler's own synth documentation holds the peg with EulerSwap JIT-liquidity pools, not a PSM. That is our liquidity plan for zipUSD and the szipUSD pair — and it is the one piece of this machine we have not shipped. If you have opinions about bootstrapping ESynth liquidity on EulerSwap, this is precisely where we want them.`,
    ],
  },
]

export default function WhyEuler() {
  return (
    <main className="zc-landing zc-why">
      <header className="site-header">
        <div className="wrap">
          <nav className="top">
            <a href="/" aria-label="Zipcode home" className="brand">
              <Logo twoTone className="brand-logo" />
            </a>
            <div className="nav-links">
              <a href="/map">Schematic</a>
              <a href="/why-euler">Why Euler?</a>
            </div>
            <div className="nav-right">
              <ThemeToggle />
              <a
                href="https://github.com/resi-labs-ai/zipcode-euler"
                className="nav-icon"
                aria-label="GitHub"
                title="GitHub"
                target="_blank"
                rel="noreferrer"
              >
                <svg width="19" height="19" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
              </a>
              <a href="/manifesto" className="pill pill--primary">
                Read the docs
              </a>
            </div>
          </nav>
        </div>
      </header>

      <section className="why-hero">
        <div className="wrap">
          <span className="eyebrow">Why Euler?</span>
          <h1 className="display">
            Curators can get creative,<span className="accent"> with Euler</span>.
          </h1>
          <p className="lead">
            DeFi is a game of whales, and Euler has the best set of Legos.
          </p>
          <div className="cta">
            <a href="/map" className="pill pill--primary">
              Look at pretty value flows →
            </a>
            <a
              href="https://github.com/resi-labs-ai/zipcode-euler"
              className="pill pill--ghost"
              target="_blank"
              rel="noreferrer"
            >
              Read the code
            </a>
          </div>
        </div>
      </section>

      <section className="why-body">
        <div className="wrap">
          {S.map((s) => (
            <article className="why-cell" key={s.idx}>
              <div className="why-meta">
                <span className="idx">{s.idx}</span>
                <span className="prim">{s.prim}</span>
              </div>
              <div className="why-text">
                <h2>{s.title}</h2>
                <div className="rule" />
                {s.body.map((p, i) => {
                  const bullet = p.startsWith('- ') // prefix a body line with "- " to green-bullet it
                  return (
                    <p key={i} className={bullet ? 'why-q' : undefined}>
                      {bullet ? p.slice(2) : p}
                    </p>
                  )
                })}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="why-close">
        <div className="wrap">
          <div className="why-close-card">
            <span className="why-euler-mark" aria-label="Euler">

            </span>
            <h4>
              Want to see how these pieces look within a larger machine?
            </h4>
            <div className="cta">
              <a href="/map" className="pill pill--primary">
                Claude made you a Schematic →
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="site">
        <div
          className="wrap"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 20,
            flexWrap: 'wrap',
          }}
        >
          <Logo twoTone style={{ height: 20, width: 'auto', display: 'block', color: 'var(--ink)' }} />
          <span className="meta">A network for real-world credit · 2026</span>
        </div>
      </footer>
    </main>
  )
}
