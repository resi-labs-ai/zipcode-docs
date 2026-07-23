import type { Metadata } from 'next'
import type { ReactNode } from 'react'
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
    title: 'Creative Authority for Risk Curators.',
    node: 'evk',
    body: [
      `The [Euler Github](https://github.com/euler-xyz) reads like an old garage full of shelved inventions, built by an architect who assumed that the app layer would take care of itself.`,
      `The result is a the most curator-centric, money market stack on EVM:`,
      `- Do you want single-use, Isolated vaults?`,
      `- Do you want a custom oracle for each line of credit?`,
      `- Do you want Gated Access to vaults based on underwriting criteria?`,
      `Euler built a composable toolkit around isolated credit vaults, and just left the code in a repo for you to discover. Kind of incredible.`,
    ],
  },
  {
    idx: '02',
    prim: 'Euler Earn I',
    title: 'Built-in Allocator.',
    node: 'line-account',
    body: [
      `Euler Earn allows for allocation amongst a portfolio of 30 supply vaults.`,
      `Zipcode Credit Warehouses construct that porftolio like this:`,
      `- One USDC Reserve vault, which holds idle supply.`,
      `- One Farm vault, which is a credit line dedicated to auto-exercising oHYDX tokens.`,
      `- 28 Lines of Credit, which are single use, isolated EVK vaults.`,
      `When a line has been approved, funds are transferred from the USDC Reserve, and then made available to the borrower through the Coinbase SDK or bridged out through Erebor. When the loan has been paid off, the credit line is retired, making room for a new line.`,
      `Euler Earn moves capital where it needs to be, within the within a Credit Warehouse.`,
    ],
  },
  {
    idx: '03',
    prim: 'Euler Earn II',
    title: 'Built-in Accounting Engine.',
    node: 'euler-earn',
    body: [
      `A happy discovery that grew out of discovering the 30 slot limitation of Euler Earn is the implicit pattern of Warehouse Clusters.`,
      `The MVP Private Credit structure is a Credit Warehouse <> Junior Tranche Pairing. If there are only 28 lines available, then you need to either launch multiple warehouses, or diversify your risk into multiple credit products / curators.`,
      `- Underwriting quality is more competitive, because of fewer lines.`,
      `- Diversification of risk is forced, due to the coded limitation.`,
      `Protocols with a shared credit dollar also benefit from this structure:`,
      `If Warehouse A has a default, and Warehouse B does not, underlying Junior for the Warehouse A Cluster, can be frozen into extended duration, proportionate to the amount of current utilization. == Protecting the shared credit dollar from depeg, and isolating the impact to the Warehouse B Cluster.`,
      `Private Credit recourse is achieved through SPVs, Repurchase Agreements, & off-chain secondary credit funds, rather than onchain liquidity pools. Onchain depositors can benefit from offchain yields, provided these recourse structures are in place to protect depositors -- but only if you cannot lend your dollars, and sell them too.:`,
      `A tension must be maintained:`,
      `- Enough deposits to attract borrowers.`,
      `- Enough isolation to diminish risk.`,
      `In this way, if a Junior Tranche wants to underwrite trash, their risk can be quarantined from other clusters. Scaled out, this grows into a type of onchain Credit Union, or Private Credit Conglomorate.`,
    ],
  },
  {
    idx: '04',
    prim: 'Euler Price Oracles',
    title: 'An Oracle for Every Loan.',
    node: 'oracle-registry',
    body: [
      `Bespoke Private Credit collateral, requires custom Oracles.`,
      `Oracles for Tokenized RWA funds are meant to be reflective of the underlying assets, to mark the value per share. It's expensive to launch oracles, and the tokenized fund approach seems like it relies on a periodic third party assessment to vault the underlying, and reflect that value in the feed.`,
      `Chainlink has quietly introduced an alternative to this in the form of CRE managed datastreams, which can pull information from multiple sources, and digest that information into a price feed. Chainlink Oracle Adapters can plug this feed directly into Euler, decreasing the cost of an ephemeral oracle.`,
      `Lenders can underwrite risk however they want:`,
      `- zkProofs validating Plaid KYB, Credit Check and Income requirements`,
      `- Notarized liens with repurchase agreements from secondary markets with a history of purchases`,
      `- Cross-chain LSTs, representing Bittensor Subnet Validator yield.`,
      `As an asset class, RWAs & Private Credit are out on the risk curve, and the long tail of collateral types requires a long tail of oracles.`,
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
      `- Vaults which can only be liquidated through specialized processes.`,
      `These hooks enable Institutional Lending, Private Credit, Underwriting, or bespoke structured products intended for specific large holders to deploy capital. Euler empowers curators to build custom solutions, rather than narrowing that capacity in favor of a more unilateral risk framework. The result is a less opinionated infrastructure, which can facilitate more diverse approaches to onchain finance.`,
    ],
  },
  {
    idx: '06',
    prim: 'ESynth',
    title: 'A Minimalist, Euler-Native Synthetic Asset Vault',
    node: 'eulerswap',
    body: [
      `Do you need a trust-minimized, synthetic asset, which is built directly into the Euler Stack?`,
      `ESynth works great with Chainlink CRE & Zodiac Roles to build permissionless vault strategies:`,
      `- Zodiac Roles narrow the scope of operations.`,
      `- Zodiac Modules physically define the onchain operations which can be executed.`,
      `- Chainlink CRE evaulates conditions, and runs operations according to set workflows.`,
      `- Esynth is the Entrance & Exit Gate which determines which assets are utilzied in the strategy.`,
      `The stack above is a structural response to the re-occuring issue of discretionary operation in vault strategies. Onchain finance enables the articulation of opinionated structures, without intermediaries or operators. These structures then allow onchain capital to coordinate around these opinions.`,
      `Euler just happens to integrate cleanly with the whole stack.`,
    ],
  },
]

// Render a body line, turning markdown-style [text](url) into real links.
function renderText(text: string) {
  const parts: ReactNode[] = []
  const re = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index))
    parts.push(
      <a
        key={m.index}
        href={m[2]}
        target="_blank"
        rel="noopener noreferrer"
      >
        {m[1]}
      </a>,
    )
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}

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
            Building Private Credit,<span className="accent"> on Euler</span>.
          </h1>
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
                      {renderText(bullet ? p.slice(2) : p)}
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
              Want to see how we used Euler to build Zipcode Finance?
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
