import './landing.css'

const DOCS = '/manifesto'

export default function Landing() {
  return (
    <main className="zc-landing">
      <div className="wrap">
        <nav className="top">
          <span className="brand">
            zip<b>code</b>
          </span>
          <div className="nav-links">
            <a href="/supply/szipusd">Supply</a>
            <a href="/backing/collateral">Warehouse</a>
            <a href="/cre">CRE</a>
            <a href="/reference/risk">Risk</a>
          </div>
          <div className="nav-right">
            <a href="https://github.com/resi-labs-ai/zipcode-euler" className="eyebrow" style={{ letterSpacing: '.12em' }}>
              GitHub ↗
            </a>
            <a href={DOCS} className="pill pill--primary">
              Read the docs
            </a>
          </div>
        </nav>
      </div>

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
              <a href="/cre" className="pill pill--ghost">
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
              <defs>
                <marker id="ar" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
                  <path d="M0 0 L7 3.5 L0 7 z" fill="#0a0b0a" />
                </marker>
              </defs>
              <rect x="20" y="18" width="120" height="40" fill="#e7f7ec" stroke="#12a94f" />
              <text x="80" y="37" textAnchor="middle" fontFamily="ui-monospace,Menlo,monospace" fontSize="12" fill="#0d7c3a">
                szipUSD
              </text>
              <text x="80" y="50" textAnchor="middle" fontFamily="ui-monospace,Menlo,monospace" fontSize="8.5" letterSpacing="0.1em" fill="#0d7c3a">
                SUPPLY
              </text>
              <line x1="80" y1="58" x2="80" y2="96" stroke="#0a0b0a" strokeWidth="1.3" markerEnd="url(#ar)" />
              <rect x="20" y="100" width="340" height="46" fill="#fff" stroke="#0a0b0a" />
              <text x="34" y="121" fontFamily="ui-monospace,Menlo,monospace" fontSize="8.5" letterSpacing="0.14em" fill="#8a938d">
                THE RAIL · CRE GATING HOOK
              </text>
              <text x="34" y="137" fontFamily="Georgia,serif" fontSize="15" fill="#0a0b0a" letterSpacing="0.02em">
                One hook · one adapter · one venue
              </text>
              <g fontFamily="ui-monospace,Menlo,monospace" fontSize="9.5" textAnchor="middle">
                <line x1="70" y1="146" x2="70" y2="186" stroke="#0a0b0a" strokeWidth="1.3" markerEnd="url(#ar)" />
                <line x1="160" y1="146" x2="160" y2="186" stroke="#c7ccc6" strokeWidth="1.3" markerEnd="url(#ar)" />
                <line x1="250" y1="146" x2="250" y2="186" stroke="#c7ccc6" strokeWidth="1.3" markerEnd="url(#ar)" />
                <rect x="34" y="190" width="72" height="40" fill="#0a0b0a" />
                <text x="70" y="208" fill="#fff">
                  EULER
                </text>
                <text x="70" y="221" fill="#1ed361" fontSize="8">
                  ● LIVE
                </text>
                <rect x="124" y="190" width="72" height="40" fill="#fff" stroke="#c7ccc6" />
                <text x="160" y="208" fill="#55605a">
                  MORPHO
                </text>
                <text x="160" y="221" fill="#8a938d" fontSize="8">
                  NEXT
                </text>
                <rect x="214" y="190" width="72" height="40" fill="#fff" stroke="#c7ccc6" />
                <text x="250" y="208" fill="#55605a">
                  AAVE V4
                </text>
                <text x="250" y="221" fill="#8a938d" fontSize="8">
                  PLANNED
                </text>
                <text x="330" y="214" fill="#8a938d" fontSize="16">
                  ···
                </text>
              </g>
            </svg>
          </div>
        </div>
      </header>

      <section className="band">
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
          <span className="brand">
            zip<b>code</b>
          </span>
          <span className="meta">A venue-neutral credit rail · 2026</span>
        </div>
      </footer>
    </main>
  )
}
