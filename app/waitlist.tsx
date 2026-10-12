'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { AMOUNTS, HARDWARE, LEND_TARGETS, NOTES_MAX, type Intent } from './waitlist-options'

// Waitlist — the single conversion on the site. Any "Create a vault" / "Fund
// this vault" control opens one shared modal, preset to that side; a toggle in
// the modal switches between borrower and lender. The modal posts to
// /api/waitlist, which records the signup and sends the confirmation emails.
// One provider at the top of the landing, any number of <WaitlistButton/>s below it.

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

const COPY: Record<Intent, { title: string; blurb: string; submit: string }> = {
  borrow: {
    title: 'Build a vault',
    blurb: 'Vault creation opens with the protocol launch. Tell us what you need and you will be first to build one.',
    submit: 'Join the borrower waitlist',
  },
  lend: {
    title: 'Fund a vault',
    blurb: 'Lending opens with the protocol launch. Tell us what you would like to fund and you will be first to fill a vault.',
    submit: 'Join the lender waitlist',
  },
}

const known = (list: readonly string[], v?: string) => (v && list.includes(v) ? v : '')

function WaitlistModal({ intent: initial, vault, onClose }: { intent: Intent; vault?: string; onClose: () => void }) {
  const [intent, setIntent] = useState<Intent>(initial)
  const [email, setEmail] = useState('')
  const [hardware, setHardware] = useState(known(HARDWARE, vault))
  const [target, setTarget] = useState(known(LEND_TARGETS, vault) || LEND_TARGETS[0])
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
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
    const details = intent === 'borrow' ? { hardware } : { hardware: target, amount: amount || undefined }
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, intent, ...details, notes: notes.trim() || undefined, source: 'zipcode.finance', website }),
      })
      const body = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`)
      setPhase('done')
    } catch (err) {
      setPhase('error')
      setMessage(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  const copy = COPY[intent]

  return (
    <div className="wl-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="wl-modal" role="dialog" aria-modal="true" aria-labelledby="wl-title">
        <button type="button" className="wl-close" aria-label="Close" onClick={onClose}>
          ×
        </button>
        <span className="eyebrow">Waitlist · {intent === 'borrow' ? 'Borrower' : 'Lender'}</span>
        <h3 id="wl-title" className="wl-title">
          {copy.title}
        </h3>

        {phase === 'done' ? (
          <div className="wl-done">
            <p>
              You&rsquo;re on the list. A confirmation of your details is on its way to <b>{email}</b>. If anything changes,
              simply reply to that email.
            </p>
            <button type="button" className="pill pill--ghost" onClick={onClose}>
              Back to vaults
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="wl-form">
            <div className="wl-seg" role="radiogroup" aria-label="I want to">
              {(['borrow', 'lend'] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  role="radio"
                  aria-checked={intent === k}
                  className={intent === k ? 'wl-seg-on' : undefined}
                  onClick={() => setIntent(k)}
                >
                  {k === 'borrow' ? 'I want to borrow' : 'I want to lend'}
                </button>
              ))}
            </div>
            <p className="wl-blurb">{copy.blurb}</p>
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

            {intent === 'borrow' ? (
              <>
                <label className="wl-label" htmlFor="wl-hardware">
                  Hardware you want to finance
                </label>
                <select
                  id="wl-hardware"
                  required
                  className="wl-input wl-select"
                  value={hardware}
                  onChange={(e) => setHardware(e.target.value)}
                >
                  <option value="" disabled>
                    Select hardware
                  </option>
                  {HARDWARE.map((h) => (
                    <option key={h}>{h}</option>
                  ))}
                </select>
              </>
            ) : (
              <div className="wl-pair">
                <div>
                  <label className="wl-label" htmlFor="wl-target">
                    Vaults you would fund
                  </label>
                  <select id="wl-target" className="wl-input wl-select" value={target} onChange={(e) => setTarget(e.target.value)}>
                    {LEND_TARGETS.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="wl-label" htmlFor="wl-amount">
                    Indicative amount
                  </label>
                  <select id="wl-amount" className="wl-input wl-select" value={amount} onChange={(e) => setAmount(e.target.value)}>
                    <option value="">Prefer not to say</option>
                    {AMOUNTS.map((a) => (
                      <option key={a}>{a}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <label className="wl-label" htmlFor="wl-notes">
              Anything else <span className="wl-opt">(optional)</span>
            </label>
            <textarea
              id="wl-notes"
              className="wl-input wl-textarea"
              rows={3}
              maxLength={NOTES_MAX}
              placeholder={intent === 'borrow' ? 'Quantity, timing, or a configuration not listed' : 'Timing or any questions for the team'}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <button type="submit" className="pill pill--primary wl-submit" disabled={phase === 'sending'}>
              {phase === 'sending' ? 'Joining…' : copy.submit}
            </button>
            {phase === 'error' && <p className="wl-error">{message}</p>}
            <p className="wl-fine">We will email you a confirmation. No spam.</p>
          </form>
        )}
      </div>
    </div>
  )
}
