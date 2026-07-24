import type { Metadata } from 'next'
import '../landing.css'
import '../lab/lab.css'
import './map.css'
import { Logo } from '../logo'
import { ThemeToggle } from '../theme-toggle'
import { ProtocolMap } from './protocol-map'

export const metadata: Metadata = {
  title: 'The machine — an interactive map',
  description:
    'How money moves through Zipcode: the senior credit machine, the junior engine, the external trust rail, and the Euler primitives underneath. Click anything.',
}

export default function MapPage() {
  return (
    <main className="zc-landing zc-map">
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

      <section className="map-stage">
        <div className="wrap">
          <div className="figure">
            <ProtocolMap />
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
