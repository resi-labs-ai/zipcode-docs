'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

// Waitlist — the single conversion on the site. Any "Create a vault" / "Fund
// this vault" control opens one shared modal; the modal posts the email to
// /api/waitlist, which forwards it to WAITLIST_WEBHOOK_URL. One provider at
// the top of the landing, any number of <WaitlistButton/>s below it.

type Intent = 'borrow' | 'lend'
type Ctx = { open: (intent: Intent, vault?: string) => void }
const WaitlistCtx = createContext<Ctx | null>(null)

export function WaitlistProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ intent: Intent; vault?: string } | null>(null)
  const open = useCallback((intent: Intent, vault?: string) => setState({ intent, vault }), [])
  return (
    <WaitlistCtx.Provider value={{ open }}>
      {children}
      {state && <WaitlistModal intent={state.intent} vault={state.vault} onClose={() => setState(null)} />}
    </WaitlistCtx.Provider>
  )
}

export function WaitlistButton({
  intent,
  vault,
  className = 'pill pill--primary',
  children,
}: {
  intent: Intent
  vault?: string
  className?: string
  children: React.ReactNode
}) {
  const ctx = useContext(WaitlistCtx)
  return (
    <button type="button" className={className} onClick={() => ctx?.open(intent, vault)}>
      {children}
    </button>
  )
}

type Phase = 'idle' | 'sending' | 'done' | 'error'

function WaitlistModal({ intent, vault, onClose }: { intent: Intent; vault?: string; onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('') // honeypot — stays empty for humans
  const [phase, setPhase] = useState<Phase>('idle')
  const [message, setMessage] = useState('')
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    input.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (phase === 'sending') return
    setPhase('sending')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, intent, vault, source: 'zipcode.finance', website }),
      })
      const body = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`)
      setPhase('done')
    } catch (err) {
      setPhase('error')
      setMessage(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  const title = intent === 'borrow' ? 'Build a vault' : 'Fund a vault'
  const blurb =
    intent === 'borrow'
      ? 'Vault creation opens with the protocol launch. Leave your email and you will be first to build one.'
      : 'Lending opens with the protocol launch. Leave your email and you will be first to fill a vault.'

  return (
    <div className="wl-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="wl-modal" role="dialog" aria-modal="true" aria-labelledby="wl-title">
        <button type="button" className="wl-close" aria-label="Close" onClick={onClose}>
          ×
        </button>
        <span className="eyebrow">Waitlist · {intent === 'borrow' ? 'Borrower' : 'Lender'}</span>
        <h3 id="wl-title" className="wl-title">
          {title}
        </h3>
        {vault && <p className="wl-vault">{vault}</p>}

        {phase === 'done' ? (
          <div className="wl-done">
            <p>
              You&rsquo;re on the list. We&rsquo;ll email <b>{email}</b> when vaults go live.
            </p>
            <button type="button" className="pill pill--ghost" onClick={onClose}>
              Back to vaults
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="wl-form">
            <p className="wl-blurb">{blurb}</p>
            {/* Honeypot: visually hidden, excluded from the tab order and from screen readers. */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="wl-hp"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
            <label className="wl-label" htmlFor="wl-email">
              Email
            </label>
            <div className="wl-row">
              <input
                id="wl-email"
                ref={input}
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="wl-input"
              />
              <button type="submit" className="pill pill--primary" disabled={phase === 'sending'}>
                {phase === 'sending' ? 'Joining…' : 'Join waitlist'}
              </button>
            </div>
            {phase === 'error' && <p className="wl-error">{message}</p>}
            <p className="wl-fine">No spam. One email when we go live.</p>
          </form>
        )}
      </div>
    </div>
  )
}
