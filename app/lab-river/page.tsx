import type { Metadata } from 'next'
import '../landing.css'
import '../lab/lab.css'
import { Logo } from '../logo'
import { ThemeToggle } from '../theme-toggle'

export const metadata: Metadata = {
  title: 'River lab — four charges',
  description: 'Narrow pass on the charge: mint and blue, smooth and stepped, fading and standing.',
  robots: { index: false },
}

function Ar({ id, mint = false }: { id: string; mint?: boolean }) {
  return (
    <marker id={id} markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
      <path d="M0 0 L7 3.5 L0 7 z" className={mint ? 'lab-ar mint' : 'lab-ar'} />
    </marker>
  )
}

const PERIOD = 7.2

function PhasedMote({
  path,
  t0,
  t1,
  begin = 0,
  kind = 'drop',
  ease = 'in',
  r = 2.8,
  until,
}: {
  path: string
  t0: number
  t1: number
  begin?: number
  kind?: 'drop' | 'note'
  ease?: 'in' | 'out'
  r?: number
  until?: number
}) {
  const spl = ease === 'in' ? '0.6 0 1 1' : '0.1 0.7 0.4 1'
  const opacity = until
    ? { values: '0;0;1;1;0;0', keyTimes: `0;${t0};${t0 + 0.02};${until};${Math.min(until + 0.02, 1)};1` }
    : { values: '0;0;1;1;0;0', keyTimes: `0;${t0};${t0 + 0.02};${t1 - 0.03};${t1};1` }
  return (
    <circle r={r} opacity="0" className={kind === 'drop' ? 'lab-drop-m' : 'lab-note-m'}>
      <animateMotion
        dur={`${PERIOD}s`}
        begin={`${begin}s`}
        repeatCount="indefinite"
        path={path}
        calcMode="spline"
        keyPoints="0;0;1;1"
        keyTimes={`0;${t0};${t1};1`}
        keySplines={`0 0 1 1;${spl};0 0 1 1`}
      />
      <animate
        attributeName="opacity"
        dur={`${PERIOD}s`}
        begin={`${begin}s`}
        repeatCount="indefinite"
        values={opacity.values}
        keyTimes={opacity.keyTimes}
      />
    </circle>
  )
}

function Flash({ x, y, at }: { x: number; y: number; at: number }) {
  return (
    <circle cx={x} cy={y} r="3" opacity="0" className="lab-flash">
      <animate
        attributeName="opacity"
        values="0;0;0.85;0;0"
        keyTimes={`0;${at};${at + 0.015};${at + 0.07};1`}
        dur={`${PERIOD}s`}
        repeatCount="indefinite"
      />
      <animate
        attributeName="r"
        values="3;3;12;3;3"
        keyTimes={`0;${at};${at + 0.05};${at + 0.07};1`}
        dur={`${PERIOD}s`}
        repeatCount="indefinite"
      />
    </circle>
  )
}

function hexPts(r: number) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2
    return `${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a)).toFixed(2)}`
  }).join(' ')
}

/** the charge: the hexagon draws itself closed; completion is the release */
function HexCharge({
  x,
  y,
  r = 30,
  at0,
  at1,
  blue = false,
  steps = false,
}: {
  x: number
  y: number
  r?: number
  at0: number
  at1: number
  blue?: boolean
  steps?: boolean
}) {
  const cls = blue ? 'lab-hex-charge blue' : 'lab-hex-charge'
  let dash
  if (steps) {
    const kts: string[] = ['0', `${at0.toFixed(3)}`]
    const vals: string[] = ['100', '100']
    for (let k = 1; k <= 6; k++) {
      kts.push((at0 + ((at1 - at0) * k) / 6).toFixed(3))
      vals.push((100 - (100 * k) / 6).toFixed(2))
    }
    kts.push('1')
    vals.push('0')
    dash = (
      <animate
        attributeName="stroke-dashoffset"
        values={vals.join(';')}
        keyTimes={kts.join(';')}
        calcMode="discrete"
        dur={`${PERIOD}s`}
        repeatCount="indefinite"
      />
    )
  } else {
    dash = (
      <animate
        attributeName="stroke-dashoffset"
        values="100;100;0;0"
        keyTimes={`0;${at0};${at1};1`}
        dur={`${PERIOD}s`}
        repeatCount="indefinite"
      />
    )
  }
  return (
    <g transform={`translate(${x} ${y})`}>
      <polygon points={hexPts(r)} pathLength={100} className={cls} strokeDasharray="100" opacity="0">
        {dash}
        <animate
          attributeName="opacity"
          values="0;0;0.9;0.9;0;0"
          keyTimes={`0;${at0};${at0 + 0.01};${at1};${at1 + 0.05};1`}
          dur={`${PERIOD}s`}
          repeatCount="indefinite"
        />
      </polygon>
    </g>
  )
}

/** phase table: staggered entries, staggered triggered releases */
const RK = Array.from({ length: 4 }, (_, i) => {
  const e0 = 0.02 + 0.06 * i
  const e1 = e0 + 0.1
  const f0 = e1 + 0.01
  const f1 = f0 + 0.06
  const g0 = f1 + 0.01
  const g1 = g0 + 0.07
  const r0 = 0.62 + 0.06 * i
  return {
    e0,
    e1,
    mint: e1 + 0.005,
    n0: e1 + 0.01,
    n1: e1 + 0.15,
    f0,
    f1,
    recv: f1 + 0.005,
    g0,
    g1,
    r0,
    r1: r0 + 0.16,
  }
})

/** the shared scene: mint → received → forwarded (visible queue) → released */
function ChargeScene({ idp, blue = false, steps = false, persist = false, caption }: { idp: string; blue?: boolean; steps?: boolean; persist?: boolean; caption: string }) {
  const SLOT_X = [413, 404, 395, 386]
  const YS = [70, 155, 245, 330]
  const fan = (y: number) => `C 482 200 492 ${y} 530 ${y}`
  return (
    <svg viewBox="0 0 640 470" role="img" aria-label={`${idp}, the charge`}>
      <defs>
        <Ar id={`${idp}-a`} />
        <Ar id={`${idp}-m`} mint />
      </defs>
      <g fontFamily="var(--mono)">
        <line x1="24" y1="200" x2="440" y2="200" className="lab-lane" />
        {YS.map((y) => (
          <path key={y} d={`M 444 200 ${fan(y)}`} className="lab-lane" markerEnd={`url(#${idp}-a)`} />
        ))}
        <line x1="110" y1="188" x2="110" y2="118" className="lab-lane mint" markerEnd={`url(#${idp}-m)`} />
        {RK.map((p, i) => {
          const sx = SLOT_X[i]
          return (
            <g key={i}>
              <PhasedMote path="M 24 200 L 110 200" t0={p.e0} t1={p.e1} />
              <Flash x={110} y={200} at={p.mint} />
              <PhasedMote path="M 110 188 L 110 122" t0={p.n0} t1={p.n1} kind="note" ease="out" r={2.4} />
              <PhasedMote path="M 110 200 L 251 200" t0={p.f0} t1={p.f1} />
              <Flash x={255} y={200} at={p.recv} />
              <PhasedMote path={`M 255 200 L ${sx} 200`} t0={p.g0} t1={p.g1} until={p.r0} />
              <HexCharge x={400} y={200} r={30} at0={p.r0 - 0.1} at1={p.r0} blue={blue} steps={steps} />
              <PhasedMote path={`M ${sx} 200 L 444 200 ${fan(YS[i])}`} t0={p.r0} t1={p.r1} ease="out" />
            </g>
          )
        })}
        <circle cx="110" cy="200" r="40" className="lab-world-lens" />
        <line x1="72" y1="192" x2="72" y2="208" className="lab-doorline" />
        <line x1="80" y1="192" x2="80" y2="208" className="lab-doorline" />
        <circle cx="110" cy="200" r="9" className="lab-core mint" />
        <text x="110" y="254" textAnchor="middle" className="lab-rel">
          THE MINT
        </text>
        <circle cx="255" cy="200" r="52" className="lab-world-lens" />
        <circle cx="255" cy="200" r="10" className="lab-core" />
        <text x="255" y="132" textAnchor="middle" className="lab-spec">
          EULER EARN | GNOSIS SAFE
        </text>
        <text x="255" y="270" textAnchor="middle" className="lab-rel">
          RECEIVED
        </text>
        {/* the storage vault: open outline, bundles visible on the wire */}
        <circle cx="400" cy="200" r="44" className="lab-world-lens" />
        <rect x="382" y="182" width="36" height="36" transform="rotate(45 400 200)" className="lab-vault-open" />
        {persist && (
          <g transform="translate(400 200)" className={blue ? 'lab-hex-standing blue' : 'lab-hex-standing'}>
            <polygon points={hexPts(30)} />
          </g>
        )}
        <text x="400" y="262" textAnchor="middle" className="lab-rel">
          FORWARDED
        </text>
        <text x="400" y="274" textAnchor="middle" className="lab-tag">
          THE USDC STORAGE VAULT
        </text>
        {YS.map((y, i) => (
          <g key={y}>
            <circle cx="558" cy={y} r="24" className="lab-world-lens" />
            <rect x="551" y={y - 7} width="14" height="14" transform={`rotate(45 558 ${y})`} className="lab-vault-sq" />
            <text x="590" y={y + 4} className="lab-lbl">
              0{i + 1}
            </text>
          </g>
        ))}
        <text x="530" y="392" textAnchor="middle" className="lab-rel">
          RELEASED
        </text>
        <text x="30" y="182" className="lab-lbl">
          USDC IN
        </text>
        <text x="102" y="114" textAnchor="end" className="lab-lbl mintink">
          zipUSD OUT
        </text>
        <text x="320" y="440" textAnchor="middle" className="lab-lbl">
          {caption}
        </text>
      </g>
    </svg>
  )
}

// ---------------------------------------------------------------------------

const TILES = [
  {
    key: 'mint',
    name: 'C1 — The charge · mint',
    blurb: 'The winner as-is: the hexagon draws closed around the waiting bundles; completion is the release.',
    el: <ChargeScene idp="c1" caption="THE CHARGE — MINT · COMPLETION IS THE RELEASE" />,
  },
  {
    key: 'blue',
    name: 'C2 — The charge · blue',
    blurb: 'Pure recolor: blue becomes the authority color — ink is the dollar, mint is the note, blue is the command.',
    el: <ChargeScene idp="c2" blue caption="THE CHARGE — BLUE · AUTHORITY GETS ITS OWN COLOR" />,
  },
  {
    key: 'meter',
    name: 'C3 — The meter · blue',
    blurb: 'The charge in six discrete steps — edge by edge, like a breaker arming. Crisper cause, same completion.',
    el: <ChargeScene idp="c3" blue steps caption="THE METER — BLUE, SIX STEPS · THE BREAKER ARMS, THEN TRIPS" />,
  },
  {
    key: 'standing',
    name: 'C4 — The standing seal · mint',
    blurb: 'A faint hexagon stands on the vault at all times; the charge brightens over it. Authority is always present, only sometimes active.',
    el: <ChargeScene idp="c4" persist caption="THE STANDING SEAL — THE HEXAGON NEVER LEAVES; IT ONLY CHARGES" />,
  },
]

export default function LabRiver() {
  return (
    <main className="zc-landing zc-lab">
      <header className="site-header">
        <div className="wrap">
          <nav className="top">
            <a href="/" aria-label="Zipcode home" className="brand">
              <Logo twoTone className="brand-logo" />
            </a>
            <div className="nav-links">
              <a href="/map">The machine</a>
              <a href="/lab">The lab</a>
            </div>
            <div className="nav-right">
              <ThemeToggle />
            </div>
          </nav>
        </div>
      </header>

      <section className="lab-grid-wrap">
        <div className="wrap">
          <div className="lab-grid">
            {TILES.map((t) => (
              <figure className="figure lab-tile" key={t.key}>
                <div className="cap">
                  <span>{t.name}</span>
                  <span>Zipcode</span>
                </div>
                {t.el}
                <figcaption>{t.blurb}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
