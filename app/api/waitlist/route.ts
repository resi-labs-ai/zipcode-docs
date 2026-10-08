import { NextResponse } from 'next/server'

/**
 * Waitlist intake.
 *
 * POST { email, intent: 'borrow' | 'lend', vault?: string, source?: string, website?: '' }
 *
 * Forwards the signup as JSON to WAITLIST_WEBHOOK_URL (Zapier / Make / a
 * Google Apps Script web app / Loops / Resend — anything that accepts a POST).
 * Nothing is stored here. If the env var is unset the signup is acknowledged
 * and a masked line is logged, so the page works before the hook is wired —
 * set the variable before launch or those emails only live in logs.
 *
 * Abuse controls (a public, unauthenticated endpoint):
 * - strict input validation + size caps, JSON only
 * - `website` honeypot: bots that fill it get a 200 and are dropped
 * - best-effort per-IP rate limit (in-memory; resets per serverless instance,
 *   which is fine as a first line — put a WAF rule in front for real volume)
 * - webhook URL must be https and comes only from the environment
 */

export const runtime = 'nodejs'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MAX_BODY = 2_048
const RATE = { windowMs: 10 * 60_000, max: 5 }

const hits = new Map<string, { n: number; reset: number }>()
function limited(ip: string) {
  const now = Date.now()
  const h = hits.get(ip)
  if (!h || h.reset < now) {
    hits.set(ip, { n: 1, reset: now + RATE.windowMs })
    if (hits.size > 5_000) for (const [k, v] of hits) if (v.reset < now) hits.delete(k)
    return false
  }
  h.n += 1
  return h.n > RATE.max
}

const mask = (e: string) => e.replace(/^(.).*(@.*)$/, '$1***$2')
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'cache-control': 'no-store' } })

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
  if (limited(ip)) return json({ error: 'Too many requests. Try again in a few minutes.' }, 429)

  if (!req.headers.get('content-type')?.includes('application/json')) {
    return json({ error: 'Expected JSON.' }, 415)
  }
  const raw = await req.text()
  if (raw.length > MAX_BODY) return json({ error: 'Request too large.' }, 413)

  let body: Record<string, unknown>
  try {
    body = JSON.parse(raw)
  } catch {
    return json({ error: 'Invalid JSON.' }, 400)
  }
  if (!body || typeof body !== 'object') return json({ error: 'Invalid JSON.' }, 400)

  // Honeypot — a real browser never fills this hidden field.
  if (typeof body.website === 'string' && body.website.length > 0) return json({ ok: true })

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!EMAIL.test(email) || email.length > 254) return json({ error: 'Enter a valid email.' }, 400)

  const payload = {
    email,
    intent: body.intent === 'lend' ? 'lend' : 'borrow',
    vault: typeof body.vault === 'string' ? body.vault.slice(0, 120) : undefined,
    source: typeof body.source === 'string' ? body.source.slice(0, 60) : 'zipcode.finance',
    ts: new Date().toISOString(),
  }

  const hook = process.env.WAITLIST_WEBHOOK_URL
  if (!hook) {
    console.warn(`[waitlist] WAITLIST_WEBHOOK_URL not set — ${payload.intent} signup from ${mask(email)} not stored`)
    return json({ ok: true, stored: false })
  }
  if (!hook.startsWith('https://')) {
    console.error('[waitlist] WAITLIST_WEBHOOK_URL must be https')
    return json({ error: 'Waitlist is temporarily unavailable.' }, 503)
  }

  try {
    const res = await fetch(hook, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8_000),
    })
    if (!res.ok) throw new Error(`webhook responded ${res.status}`)
    return json({ ok: true, stored: true })
  } catch (err) {
    console.error('[waitlist] webhook failed:', err instanceof Error ? err.message : err)
    return json({ error: 'Could not save your email. Please try again.' }, 502)
  }
}
