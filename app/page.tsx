import './landing.css'
import { ThemeToggle } from './theme-toggle'
import { Logo } from './logo'
import { Rack } from './rack'
import { VaultExplorer } from './vault-explorer'
import { WaitlistButton, WaitlistProvider } from './waitlist'
import { TERMS, overview, pct, usdShort } from './vaults'

const GITHUB = 'https://github.com/resi-labs-ai/zipcode-euler'

export default function Landing() {
  const o = overview()
  return (
    <main className="zc-landing">
      <WaitlistProvider>
        <header className="site-header">
          <div className="wrap">
            <nav className="top">
              <a href="/" aria-label="Zipcode home" className="brand">
                <Logo twoTone className="brand-logo" />
              </a>
              <div className="nav-links">
                <a href="#vaults" className="on">
                  Explore
                </a>
                <a href="#how">How it works</a>
                <a href="#lend">Lend</a>
                <a href="#borrow">Borrow</a>
              </div>
              <div className="nav-right">
                <ThemeToggle />
                <a href={GITHUB} className="nav-icon" aria-label="GitHub" title="GitHub" target="_blank" rel="noreferrer">
                  <svg width="19" height="19" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                  </svg>
                </a>
                <WaitlistButton intent="borrow" className="pill pill--primary">
                  Create a vault
                </WaitlistButton>
              </div>
            </nav>
          </div>
        </header>

        <header className="hero">
          <div className="wrap hero-grid">
            <div>
              <span className="eyebrow">Zipcode Finance · GPU loans</span>
              <h1 className="display">
                Permissionless
                <br />
                GPU loans, <span className="accent">{pct(TERMS.apr)} fixed</span>.
              </h1>
              <p className="lead">
                A borrower builds a vault for the hardware and funds <b>half</b>. Lenders fill the other half at a{' '}
                <b>{pct(TERMS.apr)} fixed APR</b> over <b>{TERMS.termMonths} months</b>. The GPUs sit in Zipcode custody until the
                last payment clears.
              </p>
              <div className="cta">
                <WaitlistButton intent="borrow" className="pill pill--primary">
                  Create a vault →
                </WaitlistButton>
                <a href="#vaults" className="pill pill--ghost">
                  Fund a vault
                </a>
              </div>
              <ul className="proof">
                <li>NVIDIA Inception allocation</li>
                <li>Custodial · no credit scoring</li>
                <li>Fixed rate · fixed term</li>
              </ul>
            </div>

            <div className="figure">
              <div className="cap">
                <span>Fig. 01 — 2× HGX B300 rack</span>
                <span>Zipcode</span>
              </div>
              <Rack />
            </div>
          </div>
        </header>

        <section className="band band--tight" id="overview">
          <div className="wrap">
            <div className="stats">
              <Stat k="Fixed APR" v={pct(TERMS.apr)} note="Set by the protocol, not a curve" />
              <Stat k="Borrower funds" v={pct(TERMS.borrowerShare)} note="Deposited into the vault up front" />
              <Stat k="Term" v={`${TERMS.termMonths} mo`} note="Equal monthly payments" />
              <Stat k="Lender side open" v={usdShort(o.lenderSide - o.filled)} note={`Across ${o.vaults} vaults · ${usdShort(o.hardware)} of hardware`} />
            </div>
          </div>
        </section>

        <section className="band" id="vaults">
          <div className="wrap">
            <div className="band-head">
              <div>
                <span className="eyebrow">Explore</span>
                <h2>Open vaults</h2>
              </div>
              <p>
                Each vault is one hardware purchase. The borrower has already deposited their half. Fill the lender side and
                earn {pct(TERMS.apr)} fixed. Figures are illustrative until launch.
              </p>
            </div>
            <VaultExplorer />
          </div>
        </section>

        <section className="band" id="how">
          <div className="wrap">
            <div className="band-head">
              <div>
                <span className="eyebrow">Section 01 — The model</span>
                <h2>Custodial GPU credit</h2>
              </div>
            </div>
            <div className="stack">
              <div className="cell" id="borrow">
                <div className="idx">01 / Build</div>
                <h3>Borrower opens a vault</h3>
                <div className="rule" />
                <p>
                  Pick the hardware, open a vault, deposit <code>{pct(TERMS.borrowerShare)}</code> of the purchase price. No
                  application, no credit check — the deposit and custody are the underwriting.
                </p>
              </div>
              <div className="cell" id="lend">
                <div className="idx">02 / Fill</div>
                <h3>Lenders fill the other half</h3>
                <div className="rule" />
                <p>
                  Anyone can fund any open vault, in any size, until the lender side is full. Every dollar earns the same{' '}
                  <code>{pct(TERMS.apr)}</code> fixed APR. Permissionless on both sides.
                </p>
              </div>
              <div className="cell">
                <div className="idx">03 / Repay</div>
                <h3>Hardware held until paid</h3>
                <div className="rule" />
                <p>
                  Zipcode takes delivery and custodies the GPUs. The borrower makes <code>{TERMS.termMonths}</code> equal monthly
                  payments; on the last one, title transfers. Miss payments and the hardware is sold to make lenders whole.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="band band--cta">
          <div className="wrap cta-grid">
            <div>
              <span className="eyebrow">Launch</span>
              <h2>Be first in the vault.</h2>
              <p>Vault creation and lending open together. Join the waitlist and we&rsquo;ll email you once, when it&rsquo;s live.</p>
            </div>
            <div className="cta">
              <WaitlistButton intent="borrow" className="pill pill--primary">
                I want to borrow
              </WaitlistButton>
              <WaitlistButton intent="lend" className="pill pill--ghost">
                I want to lend
              </WaitlistButton>
            </div>
          </div>
        </section>

        <footer className="site">
          <div className="wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <Logo twoTone style={{ height: 20, width: 'auto', display: 'block', color: 'var(--ink)' }} />
            <span className="meta">Permissionless GPU loans · 2026</span>
          </div>
        </footer>
      </WaitlistProvider>
    </main>
  )
}

function Stat({ k, v, note }: { k: string; v: string; note: string }) {
  return (
    <div className="stat">
      <span className="stat-k">{k}</span>
      <span className="stat-v">{v}</span>
      <span className="stat-n">{note}</span>
    </div>
  )
}
