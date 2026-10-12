import { NextResponse } from 'next/server'
import { AMOUNTS, HARDWARE, INTENT_LABEL, LEND_TARGETS, NOTES_MAX, type Intent } from '../../waitlist-options'

/**
 * Waitlist intake.
 *
 * POST { email, intent: 'borrow' | 'lend', hardware?, amount?, notes?, source?, website?: '' }
 *
 * A signup is recorded by up to two sinks, both configured from the environment:
 * - WAITLIST_WEBHOOK_URL — the signup is POSTed there as JSON (Zapier / Make /
 *   a Google Apps Script web app — anything that accepts a POST).
 * - RESEND_API_KEY — an internal notification is emailed to WAITLIST_NOTIFY_TO,
 *   and the person who signed up gets a confirmation of what they submitted.
 *   Both are sent from WAITLIST_EMAIL_FROM, whose domain must be verified in Resend.
 *
 * The request succeeds if at least one sink records the signup. If neither is
 * configured the signup is acknowledged and a masked line is logged, so the
 * page works locally — configure both before launch.
 *
 * Abuse controls (a public, unauthenticated endpoint that sends email):
 * - strict input validation + size caps, JSON only; choice fields must match
 *   the options in app/waitlist-options.ts exactly
 * - links are refused in the free-text note, so the confirmation email cannot
 *   be used to deliver links from our domain to an arbitrary inbox
 * - `website` honeypot: bots that fill it get a 200 and are dropped
 * - best-effort per-IP rate limit and one confirmation per address per day
 *   (in-memory; resets per serverless instance — put a WAF rule in front for real volume)
 * - webhook URL must be https and comes only from the environment
 */

export const runtime = 'nodejs'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const LINK = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|ai|co|xyz|app|dev|me|info|biz|link|site|online|top|ru|cn)\b)/i
const MAX_BODY = 4_096
const RATE = { windowMs: 10 * 60_000, max: 5 }
const CONFIRM_EVERY_MS = 24 * 60 * 60_000

const FROM = process.env.WAITLIST_EMAIL_FROM || 'Zipcode Finance <support@resilabs.ai>'
const NOTIFY_TO = process.env.WAITLIST_NOTIFY_TO || 'seby@resilabs.ai'
const REPLY_TO = process.env.WAITLIST_REPLY_TO || 'support@resilabs.ai'

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

const confirmed = new Map<string, number>()
function shouldConfirm(email: string) {
  const now = Date.now()
  const last = confirmed.get(email)
  if (last && now - last < CONFIRM_EVERY_MS) return false
  confirmed.set(email, now)
  if (confirmed.size > 5_000) for (const [k, t] of confirmed) if (now - t > CONFIRM_EVERY_MS) confirmed.delete(k)
  return true
}

const mask = (e: string) => e.replace(/^(.).*(@.*)$/, '$1***$2')
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'cache-control': 'no-store' } })
const pick = (list: readonly string[], v: unknown) => (typeof v === 'string' && list.includes(v) ? v : undefined)

type Signup = {
  email: string
  intent: Intent
  hardware?: string
  amount?: string
  notes?: string
  source: string
  ts: string
}

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

  const intent: Intent = body.intent === 'lend' ? 'lend' : 'borrow'
  const hardware = pick(intent === 'borrow' ? HARDWARE : LEND_TARGETS, body.hardware)
  if (intent === 'borrow' && !hardware) return json({ error: 'Select the hardware you want to finance.' }, 400)

  const notes = typeof body.notes === 'string' ? body.notes.trim() : ''
  if (notes.length > NOTES_MAX) return json({ error: `Keep the note under ${NOTES_MAX} characters.` }, 400)
  if (LINK.test(notes)) return json({ error: 'Please leave links out of the note.' }, 400)

  const signup: Signup = {
    email,
    intent,
    hardware,
    amount: intent === 'lend' ? pick(AMOUNTS, body.amount) : undefined,
    notes: notes || undefined,
    source: typeof body.source === 'string' ? body.source.slice(0, 60) : 'zipcode.finance',
    ts: new Date().toISOString(),
  }

  const hook = process.env.WAITLIST_WEBHOOK_URL
  const resendKey = process.env.RESEND_API_KEY
  if (!hook && !resendKey) {
    console.warn(`[waitlist] no webhook or email configured — ${intent} signup from ${mask(email)} not stored`)
    return json({ ok: true, stored: false })
  }

  const [stored, notified] = await Promise.all([
    hook ? forward(hook, signup) : Promise.resolve(false),
    resendKey ? notifyTeam(resendKey, signup) : Promise.resolve(false),
  ])
  if (!stored && !notified) return json({ error: 'Could not save your details. Please try again.' }, 502)

  // Confirm to the person only once the signup is recorded somewhere.
  const confirmationSent = resendKey && shouldConfirm(email) ? await confirm(resendKey, signup) : false

  return json({ ok: true, stored, notified, confirmed: confirmationSent })
}

async function forward(hook: string, signup: Signup) {
  if (!hook.startsWith('https://')) {
    console.error('[waitlist] WAITLIST_WEBHOOK_URL must be https')
    return false
  }
  try {
    const res = await fetch(hook, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(signup),
      signal: AbortSignal.timeout(8_000),
    })
    if (!res.ok) throw new Error(`webhook responded ${res.status}`)
    return true
  } catch (err) {
    console.error('[waitlist] webhook failed:', err instanceof Error ? err.message : err)
    return false
  }
}

/* ------------------------------------------------------------------ emails */

function rows(s: Signup): [string, string][] {
  const r: [string, string][] = [
    ['Email', s.email],
    ['Interest', INTENT_LABEL[s.intent]],
  ]
  if (s.hardware) r.push([s.intent === 'borrow' ? 'Hardware' : 'Vaults to fund', s.hardware])
  if (s.intent === 'lend') r.push(['Indicative amount', s.amount ?? 'Not specified'])
  if (s.notes) r.push(['Note', s.notes])
  return r
}

const esc = (v: string) =>
  v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

const textTable = (r: [string, string][]) => r.map(([k, v]) => `${k}: ${v}`).join('\n')

const SITE = (process.env.SITE_URL || 'https://zipcode.finance').replace(/\/$/, '')
const C = { paper: '#ecebe6', panel: '#fcfcfb', ink: '#0b0b0a', muted: '#4c4c4c', faint: '#8a938d', mint: '#1bbc57', mintInk: '#0d8f41', mintWash: '#e3f8ea', hair: '#d9d8d2' }
const SERIF = "Georgia,'Times New Roman',serif"
const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif"
const MONO = "'SF Mono',Menlo,Consolas,monospace"

const htmlTable = (r: [string, string][]) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-top:1px solid ${C.hair}">${r
    .map(
      ([k, v]) =>
        `<tr><td style="padding:12px 16px 12px 0;border-bottom:1px solid ${C.hair};font-family:${MONO};font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${C.faint};vertical-align:top;white-space:nowrap;width:120px">${esc(k)}</td>` +
        `<td style="padding:12px 0;border-bottom:1px solid ${C.hair};font-family:${SANS};font-size:15px;color:${C.ink};white-space:pre-wrap">${esc(v)}</td></tr>`,
    )
    .join('')}</table>`

/** Branded, table-based layout with inline styles so it renders in Gmail, Outlook and Apple Mail. */
function emailLayout({ preheader, eyebrow, title, body, footer }: { preheader: string; eyebrow: string; title: string; body: string; footer: string }) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:${C.paper}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.paper}"><tr><td align="center" style="padding:40px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px">
<tr><td style="padding:0 4px 24px"><a href="${SITE}" style="text-decoration:none"><img src="${SITE}/zipcode-email-logo.png" width="164" height="30" alt="Zipcode" style="display:block;border:0;width:164px;height:30px"></a></td></tr>
<tr><td style="background:${C.panel};border:1px solid ${C.ink};border-radius:6px;padding:36px 36px 32px">
<div style="font-family:${MONO};font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${C.mintInk}">${esc(eyebrow)}</div>
<h1 style="margin:12px 0 0;font-family:${SERIF};font-weight:400;font-size:30px;line-height:1.1;letter-spacing:-0.01em;text-transform:uppercase;color:${C.ink}">${esc(title)}</h1>
<div style="width:40px;height:2px;background:${C.mint};margin:18px 0 22px;line-height:2px;font-size:0">&nbsp;</div>
<div style="font-family:${SANS};font-size:15px;line-height:1.6;color:${C.muted}">${body}</div>
</td></tr>
<tr><td style="padding:22px 4px 0;font-family:${SANS};font-size:12px;line-height:1.6;color:${C.faint}">${footer}</td></tr>
</table></td></tr></table></body></html>`
}

const para = (html: string, extra = '') => `<p style="margin:0 0 16px;${extra}">${html}</p>`

function notifyTeam(key: string, s: Signup) {
  const who = s.intent === 'borrow' ? 'Borrower' : 'Lender'
  const r = [...rows(s), ['Source', s.source], ['Received', s.ts]] as [string, string][]
  return sendEmail(key, {
    to: [NOTIFY_TO],
    reply_to: s.email,
    subject: `Waitlist: ${who}${s.hardware ? ` · ${s.hardware}` : ''} — ${s.email}`,
    text: `New ${who.toLowerCase()} waitlist signup.\n\n${textTable(r)}\n\nReply to this email to respond to ${s.email} directly.`,
    html: emailLayout({
      preheader: `${who} signup from ${s.email}`,
      eyebrow: `Waitlist · ${who}`,
      title: 'New signup',
      body: para(`A new ${who.toLowerCase()} joined the waitlist.`) + htmlTable(r) + para(`Reply to this email to respond to ${esc(s.email)} directly.`, 'margin:20px 0 0'),
      footer: 'Internal notification from the zipcode.finance waitlist.',
    }),
  })
}

function confirm(key: string, s: Signup) {
  const r = rows(s)
  const next =
    s.intent === 'borrow'
      ? 'We will be in touch before vault creation opens, so you can be among the first to build a vault.'
      : 'We will be in touch before lending opens, so you can be among the first to fund a vault.'
  const change =
    'If anything changes, such as the hardware, the timing or the amount, simply reply to this email and we will update your details.'
  return sendEmail(key, {
    to: [s.email],
    reply_to: REPLY_TO,
    subject: 'You are on the Zipcode Finance waitlist',
    text:
      `Thank you for joining the Zipcode Finance waitlist. Here is what you submitted:\n\n${textTable(r)}\n\n` +
      `${next}\n\n${change}\n\nIn the meantime, you can read how vaults work: ${SITE}/vaults\n\nThe Zipcode Finance team\n${SITE}`,
    html: emailLayout({
      preheader: 'Thank you for joining. Here is a copy of the details you submitted.',
      eyebrow: `Waitlist · ${s.intent === 'borrow' ? 'Borrower' : 'Lender'}`,
      title: 'You are on the list',
      body:
        para('Thank you for joining the Zipcode Finance waitlist. Here is a copy of the details you submitted:') +
        htmlTable(r) +
        para(next, 'margin:24px 0 16px') +
        para(change) +
        `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px"><tr><td style="border-radius:999px;background:#6ff7a1;border:1px solid ${C.ink}">` +
        `<a href="${SITE}/vaults" style="display:inline-block;padding:12px 24px;font-family:${MONO};font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:${C.ink};text-decoration:none">How vaults work</a></td></tr></table>` +
        para(`The Zipcode Finance team`, `margin:0;color:${C.ink}`),
      footer:
        `Zipcode Finance · Permissionless GPU loans · <a href="${SITE}" style="color:${C.mintInk};text-decoration:none">zipcode.finance</a><br>` +
        'You are receiving this email because this address was used to join the waitlist at zipcode.finance. If that was not you, you can ignore this message.',
    }),
  })
}

async function sendEmail(
  key: string,
  msg: { to: string[]; reply_to: string; subject: string; text: string; html: string },
) {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from: FROM, ...msg }),
      signal: AbortSignal.timeout(8_000),
    })
    if (!res.ok) throw new Error(`resend responded ${res.status}: ${(await res.text()).slice(0, 200)}`)
    return true
  } catch (err) {
    console.error(`[waitlist] email to ${mask(msg.to[0])} failed:`, err instanceof Error ? err.message : err)
    return false
  }
}
