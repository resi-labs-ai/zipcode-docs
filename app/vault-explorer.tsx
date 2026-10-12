'use client'

import { useState } from 'react'
import { TERMS, VAULTS, pct, usd, usdShort, vaultMath, type Vault } from './vaults'
import { WaitlistButton } from './waitlist'

// The explore grid — Silo-style vault cards with a class filter on top.
// Client-side only for the filter; the cards themselves are plain markup.

type Filter = 'all' | Vault['klass']

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All vaults' },
  { key: 'workstation', label: 'Workstation' },
  { key: 'datacenter', label: 'Datacenter' },
]

export function VaultExplorer() {
  const [filter, setFilter] = useState<Filter>('all')
  const list = VAULTS.filter((v) => filter === 'all' || v.klass === filter)
  return (
    <>
      <div className="chips" role="tablist" aria-label="Filter vaults">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            role="tab"
            aria-selected={filter === f.key}
            className={`chip${filter === f.key ? ' chip--on' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
        <span className="chips-meta">
          {list.length} open · {pct(TERMS.apr)} fixed · {TERMS.termMonths} mo
        </span>
      </div>
      <div className="vault-grid">
        {list.map((v) => (
          <VaultCard key={v.id} v={v} />
        ))}
      </div>
    </>
  )
}

function VaultCard({ v }: { v: Vault }) {
  const m = vaultMath(v)
  const fill = Math.round(v.lenderFill * 100)
  return (
    <article className="vault" id={v.id}>
      <header className="vault-head">
        <GpuGlyph />
        <div>
          <h3 className="vault-name">{v.name}</h3>
          <p className="vault-family">{v.family}</p>
        </div>
        <span className={`tag tag--${v.status}`}>{v.status === 'open' ? 'New' : 'Filling'}</span>
      </header>

      <div className="vault-price">
        <span className="k">Hardware purchase</span>
        <span className="v">{usd(v.price)}</span>
      </div>

      <div className="vault-fill" aria-label={`Lender side ${fill}% filled`}>
        <div className="vault-fill-k">
          <span>Lender side</span>
          <span>
            <b>{usdShort(m.filled)}</b> of {usdShort(m.loan)} · {fill}%
          </span>
        </div>
        <div className="bar">
          <i style={{ width: `${fill}%` }} />
        </div>
      </div>

      <dl className="vault-rows">
        <Row k="Fixed APR" v={pct(TERMS.apr, 2)} strong />
        <Row k="Term" v={`${TERMS.termMonths} months`} />
        <Row k="Monthly payment" v={usd(m.payment)} />
        <Row k="Borrower deposit" v={`${usd(m.borrower)} · ${pct(TERMS.borrowerShare)}`} />
        <Row k="Lender interest, total" v={usd(m.interest)} />
        <Row k="Hardware" v={`${v.spec} · ${v.memory}`} />
      </dl>

      <footer className="vault-foot">
        <WaitlistButton intent="lend" vault={v.name} className="pill pill--primary">
          Fund this vault →
        </WaitlistButton>
        <span className="vault-custody">Custodied by Zipcode until repaid</span>
      </footer>
    </article>
  )
}

function Row({ k, v, strong = false }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className="vault-row">
      <dt>{k}</dt>
      <dd className={strong ? 'strong' : undefined}>{v}</dd>
    </div>
  )
}

function GpuGlyph() {
  // A GPU card seen from the bracket end: body, two fans, mint power light.
  return (
    <svg className="vault-glyph" viewBox="0 0 44 44" aria-hidden="true">
      <rect x="4" y="12" width="36" height="20" rx="1.5" style={{ fill: 'var(--mint-wash)', stroke: 'var(--ink)' }} />
      <circle cx="16" cy="22" r="5.5" style={{ fill: 'var(--panel)', stroke: 'var(--ink)' }} />
      <circle cx="30" cy="22" r="5.5" style={{ fill: 'var(--panel)', stroke: 'var(--ink)' }} />
      <circle cx="16" cy="22" r="1.2" style={{ fill: 'var(--ink)' }} />
      <circle cx="30" cy="22" r="1.2" style={{ fill: 'var(--ink)' }} />
      <rect x="8" y="32" width="20" height="3" style={{ fill: 'var(--faint)' }} opacity="0.6" />
      <circle cx="37" cy="15" r="1.3" style={{ fill: 'var(--live)' }} />
    </svg>
  )
}
