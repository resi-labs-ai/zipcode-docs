import './landing.css'
import { ThemeToggle } from './theme-toggle'
import { Logo } from './logo'

const DOCS = '/manifesto'

export default function Landing() {
  return (
    <main className="zc-landing">
      <header className="site-header">
        <div className="wrap">
          <nav className="top">
          <a href="/" aria-label="Zipcode home" className="brand">
            <Logo twoTone style={{ height: 26, width: 'auto', display: 'block', color: 'var(--ink)' }} />
          </a>
          <div className="nav-links">
            <a href="/supply/szipusd">Supply</a>
            <span className="soon" aria-disabled="true">
              Warehouse<i>Soon</i>
            </span>
            <span className="soon" aria-disabled="true">
              CRE<i>Soon</i>
            </span>
            <a href="/reference/risk">Risk</a>
          </div>
          <div className="nav-right">
            <ThemeToggle />
            <a
              href="https://github.com/resi-labs-ai/zipcode-docs"
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
            <span className="eyebrow">Credit infrastructure · 2026</span>
            <h1 className="display">
              A venue-neutral
              <br />
              credit <span className="accent">rail</span>.
            </h1>
            <p className="lead">
              Zipcode routes stablecoin capital into on-chain credit lines behind one fixed
              seam. <b>Not a fund that picks positions</b> — infrastructure that moves from
              Euler to Morpho to Aave v4 as a configuration, not a rewrite.
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
              <span>Fig. 01 — The rail</span>
              <span>IZipcodeVenue</span>
            </div>
            <svg
              viewBox="0 0 380 250"
              role="img"
              aria-label="Schematic: capital enters as szipUSD, routes through the Zipcode rail into gated credit lines across venues"
            >
              {/* Colors reference the .zc-landing CSS tokens via inline `style`
                  (SVG presentation attributes don't resolve var()), so the whole
                  schematic re-themes in dark mode with the rest of the page. */}
              <defs>
                <marker id="ar" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
                  <path d="M0 0 L7 3.5 L0 7 z" style={{ fill: 'var(--ink)' }} />
                </marker>
              </defs>
              <rect x="20" y="18" width="120" height="40" style={{ fill: 'var(--mint-wash)', stroke: 'var(--mint)' }} />
              <text x="80" y="37" textAnchor="middle" fontFamily="ui-monospace,Menlo,monospace" fontSize="12" style={{ fill: 'var(--mint-ink)' }}>
                szipUSD
              </text>
              <text x="80" y="50" textAnchor="middle" fontFamily="ui-monospace,Menlo,monospace" fontSize="8.5" letterSpacing="0.1em" style={{ fill: 'var(--mint-ink)' }}>
                SUPPLY
              </text>
              <line x1="80" y1="58" x2="80" y2="96" strokeWidth="1.3" markerEnd="url(#ar)" style={{ stroke: 'var(--ink)' }} />
              <rect x="20" y="100" width="340" height="46" style={{ fill: 'var(--panel)', stroke: 'var(--ink)' }} />
              <text x="34" y="121" fontFamily="ui-monospace,Menlo,monospace" fontSize="8.5" letterSpacing="0.14em" style={{ fill: 'var(--faint)' }}>
                THE RAIL · CRE GATING HOOK
              </text>
              <text x="34" y="136" fontFamily="ui-monospace,Menlo,monospace" fontSize="13" style={{ fill: 'var(--ink)' }}>
                One hook · one adapter · one venue
              </text>
              <g fontFamily="ui-monospace,Menlo,monospace" fontSize="9.5" textAnchor="middle">
                <line x1="70" y1="146" x2="70" y2="186" strokeWidth="1.3" markerEnd="url(#ar)" style={{ stroke: 'var(--ink)' }} />
                <line x1="160" y1="146" x2="160" y2="186" strokeWidth="1.3" markerEnd="url(#ar)" style={{ stroke: 'var(--hair-soft)' }} />
                <line x1="250" y1="146" x2="250" y2="186" strokeWidth="1.3" markerEnd="url(#ar)" style={{ stroke: 'var(--hair-soft)' }} />
                <rect x="34" y="190" width="72" height="40" style={{ fill: 'var(--ink)' }} />
                <text x="70" y="208" style={{ fill: 'var(--panel)' }}>
                  EULER
                </text>
                <text x="70" y="221" fontSize="8" style={{ fill: 'var(--live)' }}>
                  ● LIVE
                </text>
                <rect x="124" y="190" width="72" height="40" style={{ fill: 'var(--panel)', stroke: 'var(--hair-soft)' }} />
                <text x="160" y="208" style={{ fill: 'var(--muted)' }}>
                  MORPHO
                </text>
                <text x="160" y="221" fontSize="8" style={{ fill: 'var(--faint)' }}>
                  NEXT
                </text>
                <rect x="214" y="190" width="72" height="40" style={{ fill: 'var(--panel)', stroke: 'var(--hair-soft)' }} />
                <text x="250" y="208" style={{ fill: 'var(--muted)' }}>
                  AAVE V4
                </text>
                <text x="250" y="221" fontSize="8" style={{ fill: 'var(--faint)' }}>
                  PLANNED
                </text>
                <text x="330" y="214" fontSize="16" style={{ fill: 'var(--faint)' }}>
                  ···
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
              <h2>Two sides, one book</h2>
            </div>
            <p>
              Capital supplies the senior claim; credit draws against it. The rail sits between,
              taking no discretionary position.
            </p>
          </div>
          <div className="stack">
            <div className="cell">
              <div className="idx">01 / Supply</div>
              <h3>szipUSD</h3>
              <div className="rule" />
              <p>
                Deposit USDC and zap into <code>szipUSD</code> — the junior share that earns the
                yield and takes first loss. <code>zipUSD</code> is the senior $1 dollar it shields.
              </p>
            </div>
            <div className="cell">
              <div className="idx">02 / Credit</div>
              <h3>Gated lines</h3>
              <div className="rule" />
              <p>
                Every credit line is blessed by the <code>CRE</code> gating hook. One hook, one
                adapter, one venue — no shared trust surface.
              </p>
            </div>
            <div className="cell">
              <div className="idx">03 / Seam</div>
              <h3>The venue</h3>
              <div className="rule" />
              <p>
                Venues plug in behind <code>IZipcodeVenue</code>. Swapping the lending market is a
                config change, never a rewrite.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <div className="band-head">
            <div>
              <span className="eyebrow">Section 02 — Roadmap</span>
              <h2>One rail, many venues</h2>
            </div>
            <p>Each venue is the same rail re-pointed — a repeatable build-and-pitch flywheel.</p>
          </div>
          <div className="rail">
            <div className="node live">
              <div className="dot" />
              <div className="name">Euler</div>
              <div className="tag">Live</div>
            </div>
            <div className="node">
              <div className="dot" />
              <div className="name">Morpho</div>
              <div className="tag">Next</div>
            </div>
            <div className="node">
              <div className="dot" />
              <div className="name">Aave v4</div>
              <div className="tag">Planned</div>
            </div>
            <div className="node">
              <div className="dot" />
              <div className="name">Intents</div>
              <div className="tag">Horizon</div>
            </div>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap close">
          <span className="eyebrow">Start here</span>
          <h2>Read how the rail works.</h2>
          <div className="cta">
            <a href={DOCS} className="pill pill--primary">
              Enter the docs →
            </a>
            <a href="/reference/audits" className="pill pill--ghost">
              Audit posture
            </a>
          </div>
        </div>
      </section>

      <footer className="site">
        <div
          className="wrap"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}
        >
          <Logo twoTone style={{ height: 20, width: 'auto', display: 'block', color: 'var(--ink)' }} />
          <span className="meta">A venue-neutral credit rail · 2026</span>
        </div>
      </footer>
    </main>
  )
}
