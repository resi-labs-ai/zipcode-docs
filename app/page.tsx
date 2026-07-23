import './landing.css'
import { ThemeToggle } from './theme-toggle'
import { Logo } from './logo'
import { ChainlinkMark } from './chainlink-mark'
import { EulerMark } from './euler-mark'
import { ZodiacBadge } from './zodiac-badge'
import { BittensorMark } from './bittensor-mark'

const DOCS = '/manifesto'

export default function Landing() {
  return (
    <main className="zc-landing">
      <header className="site-header">
        <div className="wrap">
          <nav className="top">
          <a href="/" aria-label="Zipcode home" className="brand">
            <Logo twoTone className="brand-logo" />
          </a>
          <div className="nav-links">
            <a href="/map">Schematic</a>
            <a href="/why-euler">Why Euler</a>
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
            <a href={DOCS} className="pill pill--primary">
              Read the docs
            </a>
          </div>
          </nav>
        </div>
      </header>

      <header className="hero">
        <div className="wrap hero-grid">
          <div>
            <span className="eyebrow">The Zipcode Network · 2026</span>
            <h1 className="display">
              Real-world credit,
              <br />
              <span className="accent">done better</span>.
            </h1>
            <ul className="lead-list">
              <li>A Bittensor zk-Credit Oracle.</li>
              <li>An Euler Credit Warehouse, built on EVM.</li>
              <li>Vault Infrastructure by Gnosis Safe Zodiac &amp; Chainlink CRE.</li>
            </ul>
            <p className="lead">
              Bringing capital to HELOC originators &amp; Increasing qualified flow to secondary
              markets.
            </p>
            <div className="cta">
              <a href={DOCS} className="pill pill--primary">
                Read the docs →
              </a>
              <a href="#model" className="pill pill--ghost">
                How it works
              </a>
            </div>
          </div>

          <div className="figure">
            <div className="cap">
              <span>Fig. 01 — The network</span>
              <span>Zipcode</span>
            </div>
            <svg
              viewBox="0 0 380 320"
              role="img"
              aria-label="Schematic: a Bittensor zk-Credit Oracle feeds Chainlink CRE, which drives two paired systems — the Euler credit warehouse and the Gnosis Zodiac / Moloch v3 vaults"
            >
              {/* Colors reference the .zc-landing CSS tokens via inline `style`
                  (SVG presentation attributes don't resolve var()), so the whole
                  schematic re-themes in dark mode with the rest of the page. */}
              <defs>
                <marker id="ar" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
                  <path d="M0 0 L7 3.5 L0 7 z" style={{ fill: 'var(--ink)' }} />
                </marker>
                {/* Bael seal (public domain — Mathers & Crowley's Goetia, via Wikimedia).
                    Pre-processed to a luminance mask: ink → white, paper → black. */}
                <mask id="baal" maskUnits="userSpaceOnUse" x="286" y="241" width="46" height="46">
                  <image href="/baal-mask.png" x="286" y="241" width="46" height="46" />
                </mask>
                {/* Soft mint halo behind the partner marks. floodColor rides the
                    theme token (mint flips light↔dark), and the region is padded
                    generously so the blur never clips on wide, thin wordmarks. */}
                <filter id="logo-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow
                    dx="0"
                    dy="0"
                    stdDeviation="2.5"
                    floodOpacity="0.55"
                    style={{ floodColor: 'var(--mint)' }}
                  />
                </filter>
                {/* Hover variant — CSS swaps a .mark group onto this (see landing.css). */}
                <filter id="logo-glow-hover" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow
                    dx="0"
                    dy="0"
                    stdDeviation="4"
                    floodOpacity="0.9"
                    style={{ floodColor: 'var(--mint-bright)' }}
                  />
                </filter>
              </defs>
              {/* PAD = 14 is the grid unit. Every box keeps 14 clear on all four sides,
                  the gap under each label is 14, and the gap between the two sigils is
                  14. Box heights are derived from content + 2·PAD rather than picked by
                  eye, which is why the four boxes are 70 / 64 / 112 / 112. */}
              <g fontFamily="ui-monospace,Menlo,monospace" textAnchor="middle">
                {/* 01 — the oracle. Mint: it's the signature layer. The double-tau mark
                    replaces the "BITTENSOR" wordline; 20 tall + 2·PAD + the title sets
                    the box at 70. */}
                <rect x="90" y="10" width="200" height="70" style={{ fill: 'var(--mint-wash)', stroke: 'var(--mint)' }} />
                {/* Each .mark group carries a transparent hit rect (padded past the
                    logo bounds) so the hover catches the whole footprint, not just
                    the painted strokes. */}
                {/* Each .mark group carries a transparent hit rect (padded past the
                    logo bounds) so the hover catches the whole footprint, not just
                    the painted strokes. The sigils additionally get a .mark-name
                    hover label — CSS fades it in via `.mark:hover + .mark-name`, so
                    each label must stay its group's immediate next sibling. The
                    wordmarks spell their own names, so only the sigils are labelled. */}
                <g className="mark" filter="url(#logo-glow)">
                  <rect x="168" y="18" width="44" height="32" fill="transparent" stroke="none" />
                  <BittensorMark x={176} y={24} width={28} height={20} />
                </g>
                <text x="190" y="63" fontSize="13" style={{ fill: 'var(--mint-ink)' }}>
                  zk-Credit Oracle
                </text>
                <line x1="190" y1="80" x2="190" y2="98" strokeWidth="1.3" markerEnd="url(#ar)" style={{ stroke: 'var(--ink)' }} />

                {/* 02 — CRE sits between the oracle and execution. Logo-only, so the box
                    is exactly the 36-tall mark plus 2·PAD. */}
                <rect x="90" y="100" width="200" height="64" style={{ fill: 'var(--panel)', stroke: 'var(--ink)' }} />
                <g className="mark" filter="url(#logo-glow)">
                  <rect x="129" y="112" width="122" height="40" fill="transparent" stroke="none" />
                  <ChainlinkMark x={135} y={118} width={110} height={28} />
                </g>

                {/* fan-out bus into the two execution siblings */}
                <line x1="190" y1="164" x2="190" y2="178" strokeWidth="1.3" style={{ stroke: 'var(--ink)' }} />
                <line x1="101" y1="178" x2="279" y2="178" strokeWidth="1.3" style={{ stroke: 'var(--ink)' }} />
                <line x1="101" y1="178" x2="101" y2="194" strokeWidth="1.3" markerEnd="url(#ar)" style={{ stroke: 'var(--ink)' }} />
                <line x1="279" y1="178" x2="279" y2="194" strokeWidth="1.3" markerEnd="url(#ar)" style={{ stroke: 'var(--ink)' }} />

                {/* 03 — Euler and the vaults are siblings, joined. Both boxes are 112
                    tall and both reserve the same 234–294 band for their mark. */}
                <rect x="20" y="196" width="162" height="112" style={{ fill: 'var(--panel)', stroke: 'var(--ink)' }} />
                <text x="101" y="218" fontSize="8.5" letterSpacing="0.14em" style={{ fill: 'var(--faint)' }}>
                  CREDIT WAREHOUSE
                </text>
                {/* Marks sit at ~60% of the inner width rather than flush to PAD, so
                    the boxes keep air around their logos. Euler: 100 wide → 24.6 tall,
                    centred on the same y-264 midline as the sigils. */}
                <g className="mark" filter="url(#logo-glow)">
                  <rect x="45" y="245" width="112" height="38" fill="transparent" stroke="none" />
                  <EulerMark x={51} y={251.7} width={100} height={24.6} />
                </g>

                <line x1="182" y1="252" x2="198" y2="252" strokeWidth="1.3" style={{ stroke: 'var(--ink)' }} />

                <rect x="198" y="196" width="162" height="112" style={{ fill: 'var(--panel)', stroke: 'var(--ink)' }} />
                <text x="279" y="218" fontSize="8.5" letterSpacing="0.14em" style={{ fill: 'var(--faint)' }}>
                  ZODIAC VAULTS
                </text>
                {/* Zodiac badge + the Bael seal (Moloch v3's contract is "Baal"): two
                    46s + a 14 gap = 106, centred in the 162 box. The seal is a raster
                    and can't take a fill, so it's punched through a luminance mask with
                    the ink painted behind it — which keeps it theme-aware. */}
                <g className="mark" filter="url(#logo-glow)">
                  <rect x="222" y="237" width="54" height="54" fill="transparent" stroke="none" />
                  <ZodiacBadge x={226} y={241} size={46} />
                </g>
                <text className="mark-name" x="249" y="300" fontSize="8" letterSpacing="0.12em">
                  GNOSIS ZODIAC
                </text>
                <g className="mark" filter="url(#logo-glow)">
                  <rect x="282" y="237" width="54" height="54" fill="transparent" stroke="none" />
                  <rect x="286" y="241" width="46" height="46" mask="url(#baal)" style={{ fill: 'var(--ink)' }} />
                </g>
                <text className="mark-name" x="309" y="300" fontSize="8" letterSpacing="0.12em">
                  MOLOCH V3
                </text>
              </g>
            </svg>
          </div>
        </div>
      </header>

      <section className="band" id="model">
        <div className="wrap">
          <div className="band-head">
            <div>
              <span className="eyebrow">Section 01 — The model</span>
              <h2>Asset-Backed Credit</h2>
            </div>
          </div>
          <div className="stack">
            <div className="cell">
              <div className="idx">01 / Supply</div>
              <h3>Credit Equity Vault</h3>
              <div className="rule" />
              <p>
                USDC depositors earn yield, and assume credit duration risk by depositing within
                the <code>szipUSD</code> Vault.
              </p>
            </div>
            <div className="cell">
              <div className="idx">02 / Borrow</div>
              <h3>Line of Credit</h3>
              <div className="rule" />
              <p>
                HELOC originators must sign a repurchase agreement, and their lien must meet the
                qualification standards of secondary market partners.
              </p>
            </div>
            <div className="cell">
              <div className="idx">03 / Repay</div>
              <h3>Solvency</h3>
              <div className="rule" />
              <p>
                HELOC originators must fulfill their repurchase agreement by the end of term, or
                their lien is sold to protect depositors.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="site">
        <div
          className="wrap"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}
        >
          <Logo twoTone style={{ height: 20, width: 'auto', display: 'block', color: 'var(--ink)' }} />
          <span className="meta">A network for real-world credit · 2026</span>
        </div>
      </footer>
    </main>
  )
}
