'use client'

import { useEffect, useMemo, useState } from 'react'
import { CANVAS, EDGES, GEOM } from '../../lib/map-layout'
import type { MapFlow, MapNodeContent, NodeGeom } from '../../lib/map-types'
import content from '../../lib/map-content.json'
import { EulerMark } from '../euler-mark'
import { ZodiacBadge } from '../zodiac-badge'
import { BittensorMark } from '../bittensor-mark'

// ————————————————————————————————————————————————————————————————
// Geometry helpers — every seam is an L-elbow between box anchors, matching
// the hand-drawn register of the landing schematic (Fig. 01).

const cx = (g: NodeGeom) => g.x + g.w / 2
const cy = (g: NodeGeom) => g.y + g.h / 2

/** Route an elbow path between two boxes. Returns [d, labelX, labelY]. */
function route(a: NodeGeom, b: NodeGeom): [string, number, number] {
  const overlapX = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)
  const overlapY = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y)

  if (overlapX > 24) {
    // vertical: bottom-center → top-center (or inverse)
    const x = (Math.max(a.x, b.x) + Math.min(a.x + a.w, b.x + b.w)) / 2
    const down = cy(b) > cy(a)
    const sy = down ? a.y + a.h : a.y
    const ty = down ? b.y : b.y + b.h
    const my = (sy + ty) / 2
    return [`M ${x} ${sy} L ${x} ${my} L ${x} ${my} L ${x} ${ty}`, x + 6, my]
  }
  if (overlapY > 12) {
    // horizontal: side-center → side-center
    const y = (Math.max(a.y, b.y) + Math.min(a.y + a.h, b.y + b.h)) / 2
    const right = cx(b) > cx(a)
    const sx = right ? a.x + a.w : a.x
    const tx = right ? b.x : b.x + b.w
    const mx = (sx + tx) / 2
    return [`M ${sx} ${y} L ${mx} ${y} L ${mx} ${y} L ${tx} ${y}`, mx, y - 6]
  }
  // corner: leave source horizontally toward target, arrive on target's top/bottom
  const right = cx(b) > cx(a)
  const sx = right ? a.x + a.w : a.x
  const sy = cy(a)
  const tx = cx(b)
  const ty = cy(b) > cy(a) ? b.y : b.y + b.h
  return [`M ${sx} ${sy} L ${tx} ${sy} L ${tx} ${ty}`, (sx + tx) / 2, sy - 6]
}

/** Reverse a simple M/L polyline path (all explicit corridors are these). */
function reversePoly(d: string): string {
  const nums = (d.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number)
  const pts: [number, number][] = []
  for (let i = 0; i + 1 < nums.length; i += 2) pts.push([nums[i], nums[i + 1]])
  pts.reverse()
  return 'M ' + pts.map((p) => p.join(' ')).join(' L ')
}

/** The path a particle travels between two nodes: an explicit corridor if one
 *  is declared in EDGES (either direction), else the auto elbow. */
function segmentPath(fromId: string, toId: string): string | null {
  const a = GEOM[fromId]
  const b = GEOM[toId]
  if (!a || !b) return null
  const fwd = EDGES.find((e) => e.from === fromId && e.to === toId)
  if (fwd?.d) return fwd.d
  const rev = EDGES.find((e) => e.from === toId && e.to === fromId)
  if (rev?.d) return reversePoly(rev.d)
  return route(a, b)[0]
}

// ————————————————————————————————————————————————————————————————

type ContentMap = Record<string, MapNodeContent>

const NODES: ContentMap = Object.fromEntries(
  (content.nodes as MapNodeContent[]).map((n) => [n.id, n]),
)
const FLOWS = content.flows as MapFlow[]

/** stubs that carry a drawn mark, landing-style */
const SIGILED = new Set(['safe-zodiac', 'baal', 'bittensor-bridge'])

/** the engine block's nine keeper modules, in flywheel order */
const ENGINE_CELLS = [
  'HARVEST',
  'EXERCISE',
  'SELL',
  'LP',
  'RECYCLE',
  'LEVER',
  'OFF-RAMP',
  'BUY-BURN',
  'FREEZE',
]

/** machine nodes flagged red */
const EXPRESSED = new Set([
  'lender',
  'deposit-module',
  'warehouse',
  'euler-earn',
  'originator',
  'redemption-queue',
  'safe-zodiac',
  'baal',
  'eulerswap',
  'exit-gate',
  'nav-oracle',
  'engine',
  'hydrex',
  'algebra-ichi',
  'cow',
  'chainlink-cre',
  'cre-gating-hook',
])

/** spine-node ids — a node deep-link outside this set opens the full machine */
const SPINE_IDS = new Set(['deposit-module', 'zipusd', 'warehouse', 'line-vault'])
const DIAL = { x: 380, y: 350, r: 190, core: 64 }
const DIAL_VAULTS = [
  { deg: 315, label: 'LINE 01' },
  { deg: 45, label: 'LINE 02' },
  { deg: 135, label: 'LINE 03' },
  { deg: 225, label: 'LINE 04' },
]
/** the condensation field above the synth: ink USDC spawns, mint note outs */
const DROP_SPAWNS: [number, number][] = [
  [312, 44],
  [330, 18],
  [364, 6],
  [398, 8],
  [292, 56],
]
const NOTE_OUTS: [number, number][] = [
  [430, 16],
  [452, 34],
  [462, 52],
]

const rad = (d: number) => (d * Math.PI) / 180
// Round to 2 decimals: raw trig output can differ by one ULP between the SSR
// and browser float serializers, which React flags as a hydration mismatch on
// the tick coordinates. 2dp is sub-pixel and serializes identically on both.
const r2 = (n: number) => Math.round(n * 100) / 100
const pxa = (r: number, d: number) => r2(DIAL.x + r * Math.cos(rad(d)))
const pya = (r: number, d: number) => r2(DIAL.y + r * Math.sin(rad(d)))


// ————————————————————————————————————————————————————————————————
// The charge (C2, blue): mint → received → forwarded (visible queue) →
// hexagon charges closed → released. Ported from the lab as a live view.

const CHG_PERIOD = 7.2

function chgHexPts(r: number) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2
    return `${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a)).toFixed(2)}`
  }).join(' ')
}

// one wedge of an annular ring (an outer-wheel section), from angle a0 to a1 (deg)
function annularSector(cx: number, cy: number, ri: number, ro: number, a0: number, a1: number) {
  const rad = (d: number) => (d * Math.PI) / 180
  const p = (r: number, a: number) => [cx + r * Math.cos(rad(a)), cy + r * Math.sin(rad(a))].map((n) => n.toFixed(2))
  const [x1, y1] = p(ri, a0)
  const [x2, y2] = p(ro, a0)
  const [x3, y3] = p(ro, a1)
  const [x4, y4] = p(ri, a1)
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0
  return `M ${x1} ${y1} L ${x2} ${y2} A ${ro} ${ro} 0 ${large} 1 ${x3} ${y3} L ${x4} ${y4} A ${ri} ${ri} 0 ${large} 0 ${x1} ${y1} Z`
}

// like annularSector, but each end edge runs parallel to a given direction
// (d0/d1) instead of radial — a "funnel" cap; the inner side is trimmed to the
// arc. `off` shifts each cap perpendicular, away from the centre-line by that much.
function funnelSector(cx: number, cy: number, ri: number, ro: number, a0: number, a1: number, d0: [number, number], d1: [number, number], off = 0) {
  const rad = (d: number) => (d * Math.PI) / 180
  // endcap parallel to (dx,dy), offset `off` perpendicular away from the centre;
  // returns [outer point, inner point] where it meets the ro / ri circles
  const cap = (a: number, dx: number, dy: number): [[number, number], [number, number]] => {
    const ox = cx + ro * Math.cos(rad(a)), oy = cy + ro * Math.sin(rad(a))
    let px = -dy, py = dx // perpendicular, pointed to the same side as the nominal outer point
    if (px * (ox - cx) + py * (oy - cy) < 0) { px = -px; py = -py }
    const rx = ox + off * px, ry = oy + off * py
    const hit = (R: number): [number, number] => {
      const fx = rx - cx, fy = ry - cy
      const fd = fx * dx + fy * dy
      const s = Math.sqrt(Math.max(0, fd * fd - (fx * fx + fy * fy - R * R)))
      const pa: [number, number] = [rx + (-fd + s) * dx, ry + (-fd + s) * dy]
      const pb: [number, number] = [rx + (-fd - s) * dx, ry + (-fd - s) * dy]
      return (pa[0] - ox) ** 2 + (pa[1] - oy) ** 2 < (pb[0] - ox) ** 2 + (pb[1] - oy) ** 2 ? pa : pb
    }
    return [hit(ro), hit(ri)]
  }
  const [o0, i0] = cap(a0, d0[0], d0[1])
  const [o1, i1] = cap(a1, d1[0], d1[1])
  const f = (n: number) => n.toFixed(2)
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0
  return `M ${f(o0[0])} ${f(o0[1])} A ${ro} ${ro} 0 ${large} 1 ${f(o1[0])} ${f(o1[1])} L ${f(i1[0])} ${f(i1[1])} A ${ri} ${ri} 0 ${large} 0 ${f(i0[0])} ${f(i0[1])} Z`
}

function ChgMote({
  path,
  t0,
  t1,
  kind = 'drop',
  ease = 'in',
  r = 2.8,
  until,
  hollow = false,
  blue = false,
  period = CHG_PERIOD,
}: {
  path: string
  t0: number
  t1: number
  kind?: 'drop' | 'note'
  ease?: 'in' | 'out'
  r?: number
  until?: number
  hollow?: boolean
  blue?: boolean
  period?: number
}) {
  const spl = ease === 'in' ? '0.6 0 1 1' : '0.1 0.7 0.4 1'
  const opacity = until
    ? { values: '0;0;1;1;0;0', keyTimes: `0;${t0};${t0 + 0.02};${until};${Math.min(until + 0.02, 1)};1` }
    : { values: '0;0;1;1;0;0', keyTimes: `0;${t0};${t0 + 0.02};${t1 - 0.03};${t1};1` }
  const base = hollow ? 'lab-lp-m' : kind === 'drop' ? 'lab-drop-m' : 'lab-note-m'
  return (
    <circle r={r} opacity="0" className={blue ? `${base} blue` : base}>
      <animateMotion
        dur={`${period}s`}
        repeatCount="indefinite"
        path={path}
        calcMode="spline"
        keyPoints="0;0;1;1"
        keyTimes={`0;${t0};${t1};1`}
        keySplines={`0 0 1 1;${spl};0 0 1 1`}
      />
      <animate attributeName="opacity" dur={`${period}s`} repeatCount="indefinite" values={opacity.values} keyTimes={opacity.keyTimes} />
    </circle>
  )
}

function ChgFlash({ x, y, at, blue = false, period = CHG_PERIOD }: { x: number; y: number; at: number; blue?: boolean; period?: number }) {
  return (
    <circle cx={x} cy={y} r="3" opacity="0" className={blue ? 'lab-flash blue' : 'lab-flash'}>
      <animate
        attributeName="opacity"
        values="0;0;0.85;0;0"
        keyTimes={`0;${at};${at + 0.015};${at + 0.07};1`}
        dur={`${period}s`}
        repeatCount="indefinite"
      />
      <animate
        attributeName="r"
        values="3;3;12;3;3"
        keyTimes={`0;${at};${at + 0.05};${at + 0.07};1`}
        dur={`${period}s`}
        repeatCount="indefinite"
      />
    </circle>
  )
}

function ChgHex({ x, y, r = 30, at0, at1, period = CHG_PERIOD }: { x: number; y: number; r?: number; at0: number; at1: number; period?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <polygon points={chgHexPts(r)} pathLength={100} className="lab-hex-charge blue" strokeDasharray="100" opacity="0">
        <animate attributeName="stroke-dashoffset" values="100;100;0;0" keyTimes={`0;${at0};${at1};1`} dur={`${period}s`} repeatCount="indefinite" />
        <animate
          attributeName="opacity"
          values="0;0;0.9;0.9;0;0"
          keyTimes={`0;${at0};${at0 + 0.01};${at1};${at1 + 0.05};1`}
          dur={`${period}s`}
          repeatCount="indefinite"
        />
      </polygon>
    </g>
  )
}

const CHG_RK = Array.from({ length: 4 }, (_, i) => {
  const e0 = 0.02 + 0.06 * i
  const e1 = e0 + 0.1
  const f0 = e1 + 0.01
  const f1 = f0 + 0.06
  const g0 = f1 + 0.01
  const g1 = g0 + 0.07
  const r0 = 0.62 + 0.06 * i
  return { e0, e1, mint: e1 + 0.005, n0: e1 + 0.01, n1: e1 + 0.15, f0, f1, recv: f1 + 0.005, g0, g1, r0, r1: r0 + 0.16 }
})

// Authentic USDC line-art, inlined from usdc-usd-coin-svgrepo-com.svg
// (viewBox 32, center 16,16, outer circle r=14.5, broken ring r≈10.5, $ = S
// body + two contained strikethrough stubs). Scaled so the outer circle equals
// r (the vault radius); stroke forced to the graph's 1.4 weight despite the
// scale, so it reads at the same weight as the lens circles.
function UsdcMark({ cx, cy, r = 24 }: { cx: number; cy: number; r?: number }) {
  const k = r / 14.5
  return (
    <g
      transform={`translate(${cx} ${cy}) scale(${k}) translate(-16 -16)`}
      className="chg-usdc"
      strokeWidth={1.4 / k}
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="14.5" />
      <path d="M12.5,18.5v0.22c0,1.26,1.02,2.28,2.28,2.28h2.44c1.26,0,2.28-1.02,2.28-2.28l0,0c0-1.02-0.67-1.91-1.65-2.19l-3.69-1.05c-0.98-0.28-1.65-1.17-1.65-2.19l0,0c0-1.26,1.02-2.28,2.28-2.28h2.44c1.26,0,2.28,1.02,2.28,2.28v0.22" />
      <line x1="16" x2="16" y1="23" y2="21" />
      <line x1="16" x2="16" y1="11" y2="9" />
      <path d="M12.5,6.11c-4.08,1.44-7,5.32-7,9.89s2.92,8.45,7,9.89" />
      <path d="M19.5,25.89c4.08-1.44,7-5.32,7-9.89s-2.92-8.45-7-9.89" />
    </g>
  )
}

// ————————————————————————————————————————————————————————————————
// Charge v2 (reserve star): the accurate flow with The Charge's big-circle,
// generous spacing. USDC → Deposit (zipUSD out) → Credit Warehouse → the big
// USDC Reserve at the centre, where the dollars are STORED and the CRE charge
// fires; Farm Vault taps above; the credit lines fan out right. One shared
// clock, phased causality, 1:1 conservation, physics easing, the reserve holds
// beads until CRE charges closed — completion IS the release.

const SQRT2 = 1.41421
const CV2_CY = 250
const CV2_FARM_Y = 100
// the five ring slots inside a Safe circle: 11/1/5/7/9 o'clock at r = 24.4 —
// the midpoint of the band between the loop (r ≈ 10.8) and rim (r = 38), so
// core-gap = rim-gap. The 2–4 o'clock channel stays clear for the keyhole shaft
const CV2_SAFE_SLOTS: [number, number][] = [
  [-12.2, -21.15],
  [12.2, -21.15],
  [12.2, 21.15],
  [-12.2, 21.15],
  [-24.4, 0],
]

const CV2_RK = Array.from({ length: 5 }, (_, i) => {
  const e0 = 0.02 + 0.05 * i
  const e1 = e0 + 0.07
  const s1_1 = e1 + 0.07
  const s2_1 = s1_1 + 0.09
  const r0 = 0.4 + 0.13 * i // five beats: 0–3 each release, beat 4 is retained
  return {
    e0,
    e1,
    mint: e1 + 0.004,
    n0: e1 + 0.01,
    n1: e1 + 0.11,
    s1_0: e1 + 0.01,
    s1_1,
    s2_0: s1_1 + 0.01,
    s2_1,
    recv: s2_1 + 0.004,
    c0: r0 - 0.12,
    r0,
    r1: r0 + 0.14,
  }
})

function ChargeV2View({ animate, selected, onSelect }: { animate: boolean; selected: string | null; onSelect: (id: string) => void }) {
  // Tight-column layout, ported from the lab seed. The reserve / farm / credit
  // vaults are BARE diamonds (no lens circles); the whole view runs flat (the
  // hexagon glow is stripped via .chg-flat). One clock, five beats, unchanged.
  const CY = CV2_CY // 250
  const DEP = 104
  const WH = 214
  const RX = 342
  const LX = 540
  const FARMY = 104
  const JRY = 104
  const DEPR = 30
  const WHR = 38
  const JRR = 38
  const RES_S = 26
  const RES_DIAG = RES_S * SQRT2
  const FARM_S = 11
  const FARM_DIAG = FARM_S * SQRT2
  const LINE_S = 11
  const LINE_YS = [180, 250, 320]
  const coinX = DEP - 62
  const fanStart = RX + RES_DIAG + 2
  const fanEndX = LX - 22
  const gateX = LX - 36
  const farmTopY = CY - RES_DIAG // reserve top vertex
  const farmBotY = FARMY + FARM_DIAG // farm bottom vertex
  const farmGateY = FARMY + 36 // gate mark near the arrow (matches the credit lines)
  const reserveRimX = RX - RES_DIAG // reserve left vertex (supply meets here)
  // the four CRE charge-cells inside the reserve, one per destination
  const CELLS: [number, number][] = [
    [RX - 20, CY - 18],
    [RX + 20, CY - 18],
    [RX + 20, CY + 18],
    [RX - 20, CY + 18],
  ]
  // release track for a credit line at y (the fan) — the middle line is straight
  const linePath = (y: number) => (y === CY ? `M ${fanStart} ${CY} L ${fanEndX} ${CY}` : `M ${fanStart} ${CY} C ${fanStart + 60} ${CY} ${fanStart + 70} ${y} ${fanEndX} ${y}`)
  const farmPath = `M ${RX} ${farmTopY.toFixed(2)} L ${RX} ${farmBotY.toFixed(2)}`
  // destinations in beat order: Farm Vault, then credit lines 01/02/03
  const DEST = [
    { farm: true, path: farmPath, gx: RX, gy: farmGateY },
    { path: linePath(LINE_YS[0]), gx: gateX, gy: LINE_YS[0] },
    { path: linePath(LINE_YS[1]), gx: gateX, gy: LINE_YS[1] },
    { path: linePath(LINE_YS[2]), gx: gateX, gy: LINE_YS[2] },
  ]
  const asY = CY - (CY - JRY) / 3 // auto-stake tap, ⅓ up the deposit→zodiac line
  return (
    <svg
      viewBox="0 0 640 470"
      role="img"
      aria-label="Credit Warehouse: USDC is deposited and minted to zipUSD, held by the warehouse safe, stored in the USDC Reserve, and released to the farm vault and the credit lines as Chainlink CRE charges each cell closed"
    >
      <defs>
        <marker id="cv2-a" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
          <path d="M0 0 L7 3.5 L0 7 z" className="lab-ar" />
        </marker>
        <marker id="cv2-m" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
          <path d="M0 0 L7 3.5 L0 7 z" className="lab-ar mint" />
        </marker>
      </defs>
      {/* Lock proportions, scale up, and centre. The drawing's measured bbox is
          {x:28, y:42.1, w:554.1, h:320.6}; this uniform transform seats it with
          symmetric buffers (≈29px left/right, ≈66px top/bottom) in the 640×470
          frame — no distortion, just scale + centre. */}
      <g className="chg-flat" fontFamily="var(--mono)" transform="translate(-3.67 19.6) scale(1.0645)">
        {/* drawn track — nothing crosses the reserve interior */}
        <line x1={coinX + 14} y1={CY} x2={DEP - DEPR} y2={CY} className="lab-lane" />
        <line x1={DEP + DEPR} y1={CY} x2={WH - WHR} y2={CY} className="lab-lane" markerEnd="url(#cv2-a)" />
        {/* warehouse straight into the reserve rim */}
        <line x1={WH + WHR} y1={CY} x2={reserveRimX - 6} y2={CY} className="lab-lane" markerEnd="url(#cv2-a)" />
        {/* farm vault: straight up, directly above the reserve */}
        <line x1={RX} y1={farmTopY - 2} x2={RX} y2={farmBotY + 4} className="lab-lane" markerEnd="url(#cv2-a)" />
        <line x1={RX - 6} y1={farmGateY} x2={RX + 6} y2={farmGateY} className="lab-gate" />
        {/* exit: one point on the reserve rim → a three-pronged symmetrical fan */}
        {LINE_YS.map((y) =>
          y === CY ? (
            <line key={y} x1={fanStart} y1={CY} x2={fanEndX} y2={CY} className="lab-lane" markerEnd="url(#cv2-a)" />
          ) : (
            <path key={y} d={linePath(y)} fill="none" className="lab-lane" markerEnd="url(#cv2-a)" />
          )
        )}
        {LINE_YS.map((y) => (
          <line key={`g${y}`} x1={gateX} y1={y - 6} x2={gateX} y2={y + 6} className="lab-gate" />
        ))}
        {/* deposit → zodiac vault, straight up into the safe's rim */}
        <line x1={DEP} y1={CY - DEPR} x2={DEP} y2={JRY + JRR} className="lab-lane mint" markerEnd="url(#cv2-m)" />

        {/* USDC symbol */}
        <UsdcMark cx={coinX - 2} cy={CY} r={14} />

        {/* deposit */}
        <g
          className={`chg-click${selected === 'deposit-module' ? ' sel' : ''}`}
          onClick={() => onSelect('deposit-module')}
          tabIndex={0}
          role="button"
          aria-label="Deposit, the ZipDepositModule"
        >
          <line x1={DEP - 34} y1={CY - 8} x2={DEP - 34} y2={CY + 8} className="lab-doorline" />
          <line x1={DEP - 26} y1={CY - 8} x2={DEP - 26} y2={CY + 8} className="lab-doorline" />
          <circle cx={DEP} cy={CY} r={DEPR} className="lab-world-lens" />
          <circle cx={DEP} cy={CY} r="8" className="lab-core mint" />
          <text x={DEP} y={CY + 59} textAnchor="middle" className="lab-rel">
            zipUSD MINT
          </text>
        </g>
        {/* zodiac vault — the junior-tranche Safe above the deposit, holding
            Chainlink feed marks (hexagons) instead of the senior share diamonds; clickable */}
        <g
          className={`chg-click${selected === 'safe-zodiac' ? ' sel' : ''}`}
          onClick={() => onSelect('safe-zodiac')}
          tabIndex={0}
          role="button"
          aria-label="Zodiac Vault"
        >
          <circle cx={DEP} cy={JRY} r={JRR} className="lab-world-lens" />
          <path
            d="M610.2,396.07l-144.11.11c-4.17,14.6-9.42,28.25-19.51,39.69-34.13,38.66-89.96,41.32-126.63,6.64-26.5-25.06-34.56-65.03-19.85-98.6,19.56-44.65,71.37-64.38,116.15-44.67l12.88,7.52c20.16,13.78,32.72,34.65,37.43,59l143.07.09c8.61,0,14.63,6.78,15.05,14.73.35,6.71-5.4,15.48-14.49,15.49Z"
            transform={`translate(${DEP} ${JRY}) scale(0.123) translate(-380.4 -379.2)`}
            className="chg-safe"
            vectorEffect="non-scaling-stroke"
          />
          {CV2_SAFE_SLOTS.map(([ox, oy], i) => (
            <polygon key={i} points={chgHexPts(6)} transform={`translate(${DEP + ox} ${JRY + oy})`} className="lab-hex-charge blue" opacity={0.9} />
          ))}
          <text x={DEP} y={JRY - JRR - 15} textAnchor="middle" className="lab-rel">
            ZODIAC VAULT
          </text>
        </g>

        {/* credit warehouse */}
        <g
          className={`chg-click${selected === 'warehouse' ? ' sel' : ''}`}
          onClick={() => onSelect('warehouse')}
          tabIndex={0}
          role="button"
          aria-label="The Credit Warehouse"
        >
          {/* empty outline circle, like the other worlds */}
          <circle cx={WH} cy={CY} r={WHR} className="lab-world-lens" />
          {/* the Safe keyhole sits dead-centre at real logo proportions */}
          <path
            d="M610.2,396.07l-144.11.11c-4.17,14.6-9.42,28.25-19.51,39.69-34.13,38.66-89.96,41.32-126.63,6.64-26.5-25.06-34.56-65.03-19.85-98.6,19.56-44.65,71.37-64.38,116.15-44.67l12.88,7.52c20.16,13.78,32.72,34.65,37.43,59l143.07.09c8.61,0,14.63,6.78,15.05,14.73.35,6.71-5.4,15.48-14.49,15.49Z"
            transform={`translate(${WH} ${CY}) scale(0.123) translate(-380.4 -379.2)`}
            className="chg-safe"
            vectorEffect="non-scaling-stroke"
          />
          {/* five senior share diamonds ring the key (see CV2_SAFE_SLOTS) */}
          {CV2_SAFE_SLOTS.map(([ox, oy], i) => (
            <rect key={i} x={WH + ox - 3.5} y={CY + oy - 3.5} width="7" height="7" transform={`rotate(45 ${WH + ox} ${CY + oy})`} className="lab-share-tok" />
          ))}
          <text x={WH} y={CY + WHR + 21} textAnchor="middle" className="lab-rel">
            WAREHOUSE SAFE
          </text>
        </g>


        {/* farm vault — a bare diamond off the reserve (no lens circle) */}
        <g
          className={`chg-click${selected === 'farm-vault' ? ' sel' : ''}`}
          onClick={() => onSelect('farm-vault')}
          tabIndex={0}
          role="button"
          aria-label="The farm vault"
        >
          <rect x={RX - FARM_S} y={FARMY - FARM_S} width={FARM_S * 2} height={FARM_S * 2} transform={`rotate(45 ${RX} ${FARMY})`} className="lab-vault-sq" />
        </g>
        <text x={RX} y={JRY - JRR} textAnchor="middle" className="lab-tag">
          FARM VAULT
        </text>

        {/* the USDC Reserve — a bare open diamond (no lens circle), holds four CRE cells */}
        <g
          className={`chg-click${selected === 'euler-earn' ? ' sel' : ''}`}
          onClick={() => onSelect('euler-earn')}
          tabIndex={0}
          role="button"
          aria-label="The USDC reserve"
        >
          <rect x={RX - RES_S} y={CY - RES_S} width={RES_S * 2} height={RES_S * 2} transform={`rotate(45 ${RX} ${CY})`} className="lab-vault-open" />
        </g>
        {/* four single-outline charge cells, faint until they charge */}
        {CELLS.map(([hx, hy], i) => (
          <polygon key={i} points={chgHexPts(13)} transform={`translate(${hx} ${hy})`} className="lab-hex-charge blue" opacity={animate ? 0.24 : 0.85} />
        ))}
        <text x={RX} y={CY + 59} textAnchor="middle" className="lab-rel">
          USDC RESERVE
        </text>

        {/* credit vaults — bare diamonds fanning out right */}
        {LINE_YS.map((y, i) => (
          <g
            key={y}
            className={`chg-click${selected === 'line-vault' ? ' sel' : ''}`}
            onClick={() => onSelect('line-vault')}
            tabIndex={0}
            role="button"
            aria-label={`Credit line 0${i + 1}`}
          >
            <rect x={LX - LINE_S} y={y - LINE_S} width={LINE_S * 2} height={LINE_S * 2} transform={`rotate(45 ${LX} ${y})`} className="lab-vault-sq" />
            <text x={LX + 22} y={y + 4} className="lab-lbl">
              0{i + 1}
            </text>
          </g>
        ))}
        <text x={LX} y={Math.max(...LINE_YS) + 40} textAnchor="middle" className="lab-rel">
          CREDIT VAULTS
        </text>

        {/* auto-stake sign: a green dashed stub off the deposit → zodiac connector */}
        <line x1={DEP} y1={asY} x2={DEP + 28} y2={asY - 30} className="lab-auth-line" />
        <text x={DEP + 62} y={asY - 35} textAnchor="middle" className="lab-gov-lbl" style={{ fill: 'var(--mint)' }}>
          ZIPUSD
        </text>
        <text x={DEP + 62} y={asY - 22} textAnchor="middle" className="lab-gov-lbl" style={{ fill: 'var(--mint)' }}>
          AUTO-STAKE
        </text>

        {/* animated flow — one clock, five beats. Each USDC pulse mints a
            zipUSD note that rises into the zodiac vault and settles in a
            hexagon; the supply continues to the reserve. Four beats release to
            the destinations; the fifth dollar is RETAINED in the reserve. */}
        {animate &&
          CV2_RK.map((p, i) => {
            const [jox, joy] = CV2_SAFE_SLOTS[i] // this beat's zodiac hexagon slot
            const retained = i >= CELLS.length // the fifth dollar stays in the reserve
            const d = DEST[i] // undefined on the retained beat (read only when !retained)
            return (
              <g key={i}>
                <ChgMote path={`M ${coinX} ${CY} L ${DEP} ${CY}`} t0={p.e0} t1={p.e1} />
                <ChgFlash x={DEP} y={CY} at={p.mint} />
                {/* mint → a zipUSD note rises into the zodiac vault and settles */}
                <ChgMote path={`M ${DEP} ${CY - DEPR} L ${DEP} ${JRY + JRR}`} t0={p.n0} t1={p.n1} kind="note" ease="out" r={2.4} />
                <circle cx={DEP + jox} cy={JRY + joy} r="2.2" opacity="0" className="lab-note-m">
                  <animate attributeName="opacity" dur={`${CHG_PERIOD}s`} repeatCount="indefinite" values="0;0;1;1;0;0" keyTimes={`0;${p.n1};${(p.n1 + 0.02).toFixed(3)};0.93;0.95;1`} />
                </circle>
                {/* supply rides the straight track to the reserve rim */}
                <ChgMote path={`M ${DEP} ${CY} L ${WH} ${CY}`} t0={p.s1_0} t1={p.s1_1} />
                <ChgMote path={`M ${WH + WHR} ${CY} L ${reserveRimX.toFixed(2)} ${CY}`} t0={p.s2_0} t1={p.s2_1} />
                {retained ? (
                  /* KEPT in the reserve — the dollar appears at the core and stays */
                  <circle cx={RX} cy={CY} r="2.8" opacity="0" className="lab-drop-m">
                    <animate attributeName="opacity" dur={`${CHG_PERIOD}s`} repeatCount="indefinite" values="0;0;1;1;0;0" keyTimes={`0;${p.s2_1};${(p.s2_1 + 0.02).toFixed(3)};0.93;0.95;1`} />
                  </circle>
                ) : (
                  <>
                    {/* the dollar APPEARS within its cell (stored), no fly */}
                    <circle cx={CELLS[i][0]} cy={CELLS[i][1]} r="2.8" opacity="0" className="lab-drop-m">
                      <animate attributeName="opacity" dur={`${CHG_PERIOD}s`} repeatCount="indefinite" values="0;0;1;1;0;0" keyTimes={`0;${p.s2_1};${p.s2_1 + 0.02};${p.r0};${p.r0 + 0.01};1`} />
                    </circle>
                    {/* the cell charges closed, concludes → its release appears on the exit track */}
                    <ChgHex x={CELLS[i][0]} y={CELLS[i][1]} r={13} at0={p.c0} at1={p.r0} />
                    <ChgFlash x={d.gx} y={d.gy} at={p.r0} blue />
                    <ChgMote path={d.path} t0={p.r0} t1={p.r1} ease="out" />
                  </>
                )}
              </g>
            )
          })}
      </g>
    </svg>
  )
}

// A fork of ChargeV2View — the "Credit Vault" view, an independent copy so it
// can diverge from the Credit Warehouse without affecting it. Trimmed to just
// the USDC Reserve and the credit-line fan it releases into.
function CreditVaultView({ animate, selected, onSelect }: { animate: boolean; selected: string | null; onSelect: (id: string) => void }) {
  const CY = CV2_CY // 250
  const RX = 342
  const LX = 540
  const RES_S = 26
  const RES_DIAG = RES_S * SQRT2
  const LINE_S = 11
  // three matched credit lines, evenly split around the centre
  const LINE_YS = [175, 250, 325]
  const fanStart = RX + RES_DIAG + 2
  // where every curved prong lands — 01 and 03 share this exact curvature
  const CURVE_END = LX - 22
  // the top prong (01) keeps that curve, then runs horizontally farther right
  const EXT = 170
  const lineLX = (y: number) => (y === LINE_YS[0] ? LX + EXT : LX)
  // 01 is a large hollow diamond (reserve-sized); its half-diagonal sets how far
  // the prong/arrow stops short, so the vault stays put while the arrow shrinks
  const vaultHalf = (y: number) => (y === LINE_YS[0] ? RES_DIAG : LINE_S * SQRT2)
  const fanEndX = (y: number) => lineLX(y) - vaultHalf(y) - 6
  const gateXf = (y: number) => lineLX(y) - vaultHalf(y) - 20
  // the four CRE charge-cells inside the reserve
  const CELLS: [number, number][] = [
    [RX - 20, CY - 18],
    [RX + 20, CY - 18],
    [RX + 20, CY + 18],
    [RX - 20, CY + 18],
  ]
  const linePath = (y: number) => {
    if (y === CY) return `M ${fanStart} ${CY} L ${CURVE_END} ${CY}`
    const curve = `M ${fanStart} ${CY} C ${fanStart + 60} ${CY} ${fanStart + 70} ${y} ${CURVE_END} ${y}`
    // the top prong extends the landed curve straight out to its farther vault
    return y === LINE_YS[0] ? `${curve} L ${fanEndX(y)} ${y}` : curve
  }
  return (
    <svg
      viewBox="0 0 640 470"
      role="img"
      aria-label="Credit Vault: the USDC Reserve forks to three isolated credit lines"
    >
      <defs>
        <marker id="cv2-a" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
          <path d="M0 0 L7 3.5 L0 7 z" className="lab-ar" />
        </marker>
      </defs>
      <g className="chg-flat" fontFamily="var(--mono)" transform="translate(-256.89 24.62) scale(1.0789)">
        {/* fork from the reserve rim → three symmetrical credit lines 01/02/03 */}
        {LINE_YS.map((y) =>
          y === CY ? (
            <line key={y} x1={fanStart} y1={CY} x2={fanEndX(y)} y2={CY} className="lab-lane" markerEnd="url(#cv2-a)" />
          ) : (
            <path key={y} d={linePath(y)} fill="none" className="lab-lane" markerEnd="url(#cv2-a)" />
          )
        )}
        {LINE_YS.map((y) => {
          const gh = y === LINE_YS[0] ? 12 : 6
          return <line key={`g${y}`} x1={gateXf(y)} y1={y - gh} x2={gateXf(y)} y2={y + gh} className="lab-gate" />
        })}

        {/* the USDC Reserve — a bare open diamond, holds four CRE cells */}
        <g
          className={`chg-click${selected === 'euler-earn' ? ' sel' : ''}`}
          onClick={() => onSelect('euler-earn')}
          tabIndex={0}
          role="button"
          aria-label="The USDC reserve"
        >
          <rect x={RX - RES_S} y={CY - RES_S} width={RES_S * 2} height={RES_S * 2} transform={`rotate(45 ${RX} ${CY})`} className="lab-vault-open" />
        </g>
        {CELLS.map(([hx, hy], i) => (
          <polygon key={i} points={chgHexPts(13)} transform={`translate(${hx} ${hy})`} className="lab-hex-charge blue" opacity={animate ? 0.24 : 0.85} />
        ))}
        <text x={RX} y={CY + 59} textAnchor="middle" className="lab-rel">
          USDC RESERVE
        </text>

        {/* credit vaults — three matched bare diamonds fanning out right */}
        {LINE_YS.map((y, i) => (
          <g
            key={y}
            className={`chg-click${selected === 'line-vault' ? ' sel' : ''}`}
            onClick={() => onSelect('line-vault')}
            tabIndex={0}
            role="button"
            aria-label={`Credit line 0${i + 1}`}
          >
            {y === LINE_YS[0] ? (
              <rect x={lineLX(y) - RES_S} y={y - RES_S} width={RES_S * 2} height={RES_S * 2} transform={`rotate(45 ${lineLX(y)} ${y})`} className="lab-vault-open" />
            ) : (
              <rect x={lineLX(y) - LINE_S} y={y - LINE_S} width={LINE_S * 2} height={LINE_S * 2} transform={`rotate(45 ${lineLX(y)} ${y})`} className="lab-vault-sq" />
            )}
            <text x={lineLX(y) + vaultHalf(y) + 8} y={y + 4} className="lab-lbl">
              0{i + 1}
            </text>
          </g>
        ))}
        <text x={LX} y={Math.max(...LINE_YS) + 40} textAnchor="middle" className="lab-rel">
          CREDIT VAULTS
        </text>

        {/* two solid CRE-blue feeds: drop from the Lien Factory (diamond) + Oracle Registry (hex),
            then a 90° crook inward that lands on the midpoint of each of the 01 vault's two top edges */}
        <path
          d={`M ${LX + EXT - 19.5 * 1.4} 137 L ${LX + EXT - 19.5 * 1.4} ${LINE_YS[0] - RES_DIAG / 2} L ${LX + EXT - RES_DIAG / 2} ${LINE_YS[0] - RES_DIAG / 2}`}
          fill="none"
          className="chg-ray"
        />
        <path
          d={`M ${LX + EXT + 19.5 * 1.4} 139 L ${LX + EXT + 19.5 * 1.4} ${LINE_YS[0] - RES_DIAG / 2} L ${LX + EXT + RES_DIAG / 2} ${LINE_YS[0] - RES_DIAG / 2}`}
          fill="none"
          className="chg-ray"
        />
        {/* a single solid CRE-blue drop from the Bittensor⟷CRE hex into the 01 vault apex below */}
        <line
          x1={LX + EXT}
          y1={45 + 19.5 / COS30}
          x2={LX + EXT}
          y2={LINE_YS[0] - RES_DIAG}
          className="chg-ray"
        />

        {/* ported from the System Map: the pair (Lien Factory diamond + Oracle
            Registry hex) with the large blue hexagon + TAO mark above the vault
            column (LX). Hex centre at y=45; pair baseline at y=128. The pair is
            scaled up (PS) proportionately; the hex + TAO are left at base size.
            Shifted right by EXT so its hex centre sits on the vertical scaffold
            (over the enlarged 01 diamond). */}
        {[EXT].map((dx) => {
          const PS = 1.4
          return (
            <g key={dx} transform={`translate(${dx} 0)`}>
              <g
                className={`chg-click${selected === 'lien-token' ? ' sel' : ''}`}
                onClick={() => onSelect('lien-token')}
                tabIndex={0}
                role="button"
                aria-label="Lien Factory"
              >
                <circle cx={LX - 19.5 * PS} cy={128} r={15} fill="transparent" />
                <Endpiece x={LX - 19.5 * PS} cy={128} kind="dia" halfW={15.5 * PS} ballR={11 * PS - 3} shaftH={36 * PS} />
              </g>
              <g
                className={`chg-click${selected === 'oracle-registry' ? ' sel' : ''}`}
                onClick={() => onSelect('oracle-registry')}
                tabIndex={0}
                role="button"
                aria-label="Oracle Registry"
              >
                <circle cx={LX + 19.5 * PS} cy={128} r={15} fill="transparent" />
                <Endpiece x={LX + 19.5 * PS} cy={128} kind="hex" halfW={15.5 * PS} ballR={10 * PS - 3} shaftH={36 * PS} />
              </g>
              <g
                className={`chg-click${selected === 'cre-gating-hook' ? ' sel' : ''}`}
                onClick={() => onSelect('cre-gating-hook')}
                tabIndex={0}
                role="button"
                aria-label="Bittensor CRE credit oracle"
              >
                <circle cx={LX} cy={45} r={24} fill="transparent" />
                <polygon points={chgHexPts(19.5 / COS30)} transform={`translate(${LX} 45)`} className="lab-hex-charge blue" />
                <BittensorMark x={LX - 14} y={45 + 1 - (26 * 5) / 7 / 2} width={26} height={(26 * 5) / 7} color="var(--ink)" />
              </g>
            </g>
          )
        })}
      </g>
    </svg>
  )
}

// ── mated socket + endpiece (lab winner "I1 — Snug fit"): a rectangular socket
// whose bottom edge is cut to the NEGATIVE of the endpiece's top, and the shape
// seated into it with a little clearance — top half mated, lower half exposed.
// The Lien Factory is the diamond endpiece, the Oracle Registry the hex.
const DIA_S = 12 // diamond vertex half-distance
const HEX_R = 11 // hex vertex radius
const ENDPIECE_GAP = 1.3 // snug clearance
const COS30 = Math.cos(Math.PI / 6)

function DiaBall({ x, y, s = DIA_S }: { x: number; y: number; s?: number }) {
  const h = s / SQRT2
  return <rect x={x - h} y={y - h} width={h * 2} height={h * 2} transform={`rotate(45 ${x} ${y})`} className="lab-vault-open" />
}
function HexBall({ x, y, r = HEX_R }: { x: number; y: number; r?: number }) {
  return <polygon points={chgHexPts(r)} transform={`translate(${x} ${y})`} className="lab-hex-charge blue" opacity={0.9} />
}
function socketPath(cx: number, cy: number, top: number, kind: 'hex' | 'dia', gap = ENDPIECE_GAP, shoulder = 4, halfW?: number) {
  let notch: [number, number][] // right baseline → over the top → left baseline
  if (kind === 'dia') {
    const S = DIA_S + gap
    notch = [
      [cx + S, cy],
      [cx, cy - S],
      [cx - S, cy],
    ]
  } else {
    const R = HEX_R + gap
    const hw = R * COS30
    const uy = cy - R / 2
    notch = [
      [cx + hw, cy],
      [cx + hw, uy],
      [cx, cy - R],
      [cx - hw, uy],
      [cx - hw, cy],
    ]
  }
  const half = halfW ?? Math.abs(notch[0][0] - cx) + shoulder // fixed width if given
  const seg = notch.map(([x, y]) => `L ${x.toFixed(2)} ${y.toFixed(2)}`).join(' ')
  return `M ${cx - half} ${top} L ${cx + half} ${top} L ${cx + half} ${cy} ${seg} L ${cx - half} ${cy} Z`
}
function Endpiece({ x, cy, kind, shaftH = 30, gap = ENDPIECE_GAP, shoulder = 4, halfW, ballR }: { x: number; cy: number; kind: 'hex' | 'dia'; shaftH?: number; gap?: number; shoulder?: number; halfW?: number; ballR?: number }) {
  // ballR shrinks only the endpiece (male); the socket cut (female) is unchanged
  return (
    <>
      <path d={socketPath(x, cy, cy - shaftH, kind, gap, shoulder, halfW)} fill="none" className="lab-world-lens" />
      {kind === 'hex' ? <HexBall x={x} y={cy} r={ballR} /> : <DiaBall x={x} y={cy} s={ballR} />}
    </>
  )
}

// A fork of ChargeV2View — an independent copy, surfaced as the "System Map"
// view so it can diverge from the Credit Warehouse without affecting it.
function SystemMapView({ animate, selected, onSelect }: { animate: boolean; selected: string | null; onSelect: (id: string) => void }) {
  const CY = CV2_CY // 250
  const DEP = 104
  const WH = 214
  const RX = 342
  const LX = 540
  const FARMY = 104
  const JRY = 104
  const DEPR = 30
  const WHR = 38
  const JRR = 38
  const RES_S = 26
  const RES_DIAG = RES_S * SQRT2
  const FARM_S = 11
  const FARM_DIAG = FARM_S * SQRT2
  const LINE_S = 11
  const LINE_YS = [180, 250, 320]
  const coinX = DEP - 62
  const fanStart = RX + RES_DIAG + 2
  const fanEndX = LX - 22
  const gateX = LX - 36
  const farmTopY = CY - RES_DIAG // reserve top vertex
  const farmBotY = FARMY + FARM_DIAG // farm bottom vertex
  const farmGateY = FARMY + 36 // gate mark near the arrow (mirrors the credit lines' 36-off-vault)
  const reserveRimX = RX - RES_DIAG // reserve left vertex (supply meets here)
  // the four CRE charge-cells inside the reserve, one per destination
  const CELLS: [number, number][] = [
    [RX - 20, CY - 18],
    [RX + 20, CY - 18],
    [RX + 20, CY + 18],
    [RX - 20, CY + 18],
  ]
  // release track for a credit line at y (the fan) — the middle line is straight
  const linePath = (y: number) => (y === CY ? `M ${fanStart} ${CY} L ${fanEndX} ${CY}` : `M ${fanStart} ${CY} C ${fanStart + 60} ${CY} ${fanStart + 70} ${y} ${fanEndX} ${y}`)
  const farmPath = `M ${RX} ${farmTopY.toFixed(2)} L ${RX} ${farmBotY.toFixed(2)}`
  // destinations in beat order: Farm Vault, then credit lines 01/02/03
  const DEST = [
    { farm: true, path: farmPath, gx: RX, gy: farmGateY },
    { path: linePath(LINE_YS[0]), gx: gateX, gy: LINE_YS[0] },
    { path: linePath(LINE_YS[1]), gx: gateX, gy: LINE_YS[1] },
    { path: linePath(LINE_YS[2]), gx: gateX, gy: LINE_YS[2] },
  ]
  // ── junior yield cluster, ported from the YIELD view and re-seated for this
  // layout: the Zodiac Vault (DEP,JRY) farms on the Hydrex LP via the Vault
  // Strategist, valued by the NAV Oracle. ──
  const HEXR = 10
  const FARM_EDGE = FARM_DIAG // farm diamond half-diagonal
  // Vault Strategist — a hex on the dotted vault↔farm link (both at y = JRY)
  const vRimX = DEP + JRR // vault right rim, toward the farm
  const fEdgeX = RX - FARM_EDGE // farm left vertex
  const vsX = (DEP + RX) / 2 // centred directly under the Hydrex LP circle
  const vsY = JRY
  // Hydrex LP pool — lifted above, between the vault and the farm
  const lpX = (DEP + RX) / 2
  const lpY = 34
  const lpR = 17
  const vLpLen = Math.hypot(lpX - DEP, lpY - JRY)
  const vLpUx = (lpX - DEP) / vLpLen
  const vLpUy = (lpY - JRY) / vLpLen
  const fLpLen = Math.hypot(lpX - RX, lpY - FARMY)
  const fLpUx = (lpX - RX) / fLpLen
  const fLpUy = (lpY - FARMY) / fLpLen
  // NAV Oracle — a blue dotted link along the vault↔warehouse centre axis, its
  // hex (the CRE oracle mark) seated at the midpoint
  const noLen = Math.hypot(WH - DEP, CY - JRY)
  const noUx = (WH - DEP) / noLen
  const noUy = (CY - JRY) / noLen
  const noSafeX = DEP + JRR * noUx
  const noSafeY = JRY + JRR * noUy
  const noWhX = WH - WHR * noUx
  const noWhY = CY - WHR * noUy
  const noX = (noSafeX + noWhX) / 2
  const noY = (noSafeY + noWhY) / 2
  // ── EXIT-view structures around the vault, scaled to fit (k = JRR/66, the
  // EXIT vault's radius). Exit Gate + Redemption Queue + CoW ring + the blue
  // axis ray through the paddings, ending in the flange/arrowhead. ──
  const EK = JRR / 66
  const eWHRI = 73 * EK
  const eWHRO = 106 * EK
  const eWHRM = (eWHRI + eWHRO) / 2
  const eCOWRI = 113 * EK
  const eCOWRO = 143 * EK
  const eSEAM = ((7 / 89.5) * 180) / Math.PI
  const eBPR = eCOWRO + 7 * EK
  const eXOUT = DEP - 191 * EK - 10 // USDC-out coin centre, pushed out so its clearance matches the entrance coin
  const erad = (d: number) => (d * Math.PI) / 180
  const ebpA = [DEP + eBPR * Math.cos(erad(174)), JRY + eBPR * Math.sin(erad(174))]
  const ebpB = [DEP + eBPR * Math.cos(erad(186)), JRY + eBPR * Math.sin(erad(186))]
  return (
    <svg
      viewBox="0 0 640 470"
      role="img"
      aria-label="System Map: USDC is deposited and minted to zipUSD, held by the warehouse safe, stored in the USDC Reserve, and released to the farm vault and the credit lines as Chainlink CRE charges each cell closed"
    >
      <defs>
        <marker id="cv2-a" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
          <path d="M0 0 L7 3.5 L0 7 z" className="lab-ar" />
        </marker>
        <marker id="cv2-m" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
          <path d="M0 0 L7 3.5 L0 7 z" className="lab-ar mint" />
        </marker>
        <marker id="cv2-b" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
          <path d="M0 0 L7 3.5 L0 7 z" className="lab-ar blue" />
        </marker>
      </defs>
      <g className="chg-flat" fontFamily="var(--mono)" transform="translate(56.63 85.85) scale(0.97)">
        {/* drawn track — nothing crosses the reserve interior */}
        <line x1={coinX + 14} y1={CY} x2={DEP - DEPR} y2={CY} className="lab-lane" />
        <line x1={DEP + DEPR} y1={CY} x2={WH - WHR} y2={CY} className="lab-lane" markerEnd="url(#cv2-a)" />
        {/* warehouse straight into the reserve rim */}
        <line x1={WH + WHR} y1={CY} x2={reserveRimX - 6} y2={CY} className="lab-lane" markerEnd="url(#cv2-a)" />
        {/* farm vault: straight up, directly above the reserve */}
        <line x1={RX} y1={farmTopY - 2} x2={RX} y2={farmBotY + 4} className="lab-lane" markerEnd="url(#cv2-a)" />
        <line x1={RX - 6} y1={farmGateY} x2={RX + 6} y2={farmGateY} className="lab-gate" />
        {/* exit: one point on the reserve rim → a three-pronged symmetrical fan */}
        {LINE_YS.map((y) =>
          y === CY ? (
            <line key={y} x1={fanStart} y1={CY} x2={fanEndX} y2={CY} className="lab-lane" markerEnd="url(#cv2-a)" />
          ) : (
            <path key={y} d={linePath(y)} fill="none" className="lab-lane" markerEnd="url(#cv2-a)" />
          )
        )}
        {LINE_YS.map((y) => (
          <line key={`g${y}`} x1={gateX} y1={y - 6} x2={gateX} y2={y + 6} className="lab-gate" />
        ))}
        {/* deposit → zodiac vault, straight up into the safe's rim */}
        <line x1={DEP} y1={CY - DEPR} x2={DEP} y2={JRY + JRR} className="lab-lane mint" markerEnd="url(#cv2-m)" />

        {/* USDC symbol */}
        <UsdcMark cx={coinX - 2} cy={CY} r={14} />

        {/* deposit */}
        <g
          className={`chg-click${selected === 'deposit-module' ? ' sel' : ''}`}
          onClick={() => onSelect('deposit-module')}
          tabIndex={0}
          role="button"
          aria-label="Deposit, the ZipDepositModule"
        >
          <line x1={DEP - 34} y1={CY - 8} x2={DEP - 34} y2={CY + 8} className="lab-doorline" />
          <line x1={DEP - 26} y1={CY - 8} x2={DEP - 26} y2={CY + 8} className="lab-doorline" />
          <circle cx={DEP} cy={CY} r={DEPR} className="lab-world-lens" />
          <circle cx={DEP} cy={CY} r="8" className="lab-core mint" />
        </g>
        {/* zodiac vault — the junior-tranche Safe above the deposit, holding
            Chainlink feed marks (hexagons) instead of the senior share diamonds; clickable */}
        <g
          className={`chg-click${selected === 'safe-zodiac' ? ' sel' : ''}`}
          onClick={() => onSelect('safe-zodiac')}
          tabIndex={0}
          role="button"
          aria-label="Zodiac Vault"
        >
          <circle cx={DEP} cy={JRY} r={JRR} className="lab-world-lens" />
          <path
            d="M610.2,396.07l-144.11.11c-4.17,14.6-9.42,28.25-19.51,39.69-34.13,38.66-89.96,41.32-126.63,6.64-26.5-25.06-34.56-65.03-19.85-98.6,19.56-44.65,71.37-64.38,116.15-44.67l12.88,7.52c20.16,13.78,32.72,34.65,37.43,59l143.07.09c8.61,0,14.63,6.78,15.05,14.73.35,6.71-5.4,15.48-14.49,15.49Z"
            transform={`translate(${DEP} ${JRY}) scale(0.123) translate(-380.4 -379.2)`}
            className="chg-safe"
            vectorEffect="non-scaling-stroke"
          />
          {CV2_SAFE_SLOTS.map(([ox, oy], i) => (
            <polygon key={i} points={chgHexPts(6)} transform={`translate(${DEP + ox} ${JRY + oy})`} className="lab-hex-charge blue" opacity={0.9} />
          ))}
        </g>

        {/* credit warehouse */}
        <g
          className={`chg-click${selected === 'warehouse' ? ' sel' : ''}`}
          onClick={() => onSelect('warehouse')}
          tabIndex={0}
          role="button"
          aria-label="The Credit Warehouse"
        >
          {/* empty outline circle, like the other worlds */}
          <circle cx={WH} cy={CY} r={WHR} className="lab-world-lens" />
          {/* the Safe keyhole sits dead-centre at real logo proportions */}
          <path
            d="M610.2,396.07l-144.11.11c-4.17,14.6-9.42,28.25-19.51,39.69-34.13,38.66-89.96,41.32-126.63,6.64-26.5-25.06-34.56-65.03-19.85-98.6,19.56-44.65,71.37-64.38,116.15-44.67l12.88,7.52c20.16,13.78,32.72,34.65,37.43,59l143.07.09c8.61,0,14.63,6.78,15.05,14.73.35,6.71-5.4,15.48-14.49,15.49Z"
            transform={`translate(${WH} ${CY}) scale(0.123) translate(-380.4 -379.2)`}
            className="chg-safe"
            vectorEffect="non-scaling-stroke"
          />
          {/* five senior share diamonds ring the key (see CV2_SAFE_SLOTS) */}
          {CV2_SAFE_SLOTS.map(([ox, oy], i) => (
            <rect key={i} x={WH + ox - 3.5} y={CY + oy - 3.5} width="7" height="7" transform={`rotate(45 ${WH + ox} ${CY + oy})`} className="lab-share-tok" />
          ))}
        </g>

        {/* farm vault — a bare diamond off the reserve (no lens circle) */}
        <g
          className={`chg-click${selected === 'farm-vault' ? ' sel' : ''}`}
          onClick={() => onSelect('farm-vault')}
          tabIndex={0}
          role="button"
          aria-label="The farm vault"
        >
          <rect x={RX - FARM_S} y={FARMY - FARM_S} width={FARM_S * 2} height={FARM_S * 2} transform={`rotate(45 ${RX} ${FARMY})`} className="lab-vault-sq" />
        </g>

        {/* the USDC Reserve — a bare open diamond (no lens circle), holds four CRE cells */}
        <g
          className={`chg-click${selected === 'euler-earn' ? ' sel' : ''}`}
          onClick={() => onSelect('euler-earn')}
          tabIndex={0}
          role="button"
          aria-label="The USDC reserve"
        >
          <rect x={RX - RES_S} y={CY - RES_S} width={RES_S * 2} height={RES_S * 2} transform={`rotate(45 ${RX} ${CY})`} className="lab-vault-open" />
        </g>
        {/* four single-outline charge cells, faint until they charge */}
        {CELLS.map(([hx, hy], i) => (
          <polygon key={i} points={chgHexPts(13)} transform={`translate(${hx} ${hy})`} className="lab-hex-charge blue" opacity={animate ? 0.24 : 0.85} />
        ))}

        {/* credit vaults — bare diamonds fanning out right */}
        {LINE_YS.map((y, i) => (
          <g
            key={y}
            className={`chg-click${selected === 'line-vault' ? ' sel' : ''}`}
            onClick={() => onSelect('line-vault')}
            tabIndex={0}
            role="button"
            aria-label={`Credit line 0${i + 1}`}
          >
            <rect x={LX - LINE_S} y={y - LINE_S} width={LINE_S * 2} height={LINE_S * 2} transform={`rotate(45 ${LX} ${y})`} className="lab-vault-sq" />
          </g>
        ))}

        {/* above the credit vaults: the Lien Factory (diamond) + Oracle Registry
            (hex), each an endpiece seated snug in its socket (lab winner I1).
            Both sockets share a width (halfW); their centres sit symmetric about
            the vault column (LX). */}
        <g
          className={`chg-click${selected === 'lien-token' ? ' sel' : ''}`}
          onClick={() => onSelect('lien-token')}
          tabIndex={0}
          role="button"
          aria-label="Lien Factory"
        >
          <circle cx={520.5} cy={102} r={14} fill="transparent" />
          <Endpiece x={520.5} cy={102} kind="dia" halfW={15.5} ballR={11} shaftH={102 - (JRY - JRR)} />
        </g>
        <g
          className={`chg-click${selected === 'oracle-registry' ? ' sel' : ''}`}
          onClick={() => onSelect('oracle-registry')}
          tabIndex={0}
          role="button"
          aria-label="Oracle Registry"
        >
          <circle cx={559.5} cy={102} r={14} fill="transparent" />
          <Endpiece x={559.5} cy={102} kind="hex" halfW={15.5} ballR={10} shaftH={102 - (JRY - JRR)} />
        </g>

        {/* CRE-blue feeds — independent paths (kept when scaffolding is removed):
            down v1/v2 from the endpiece centres, then kink onto the X arms and
            run in to dock on the top vault diamond's two top-edge midpoints. */}
        <path d="M 520.5 113 L 520.5 160.5 L 532.22 172.22" fill="none" className="lab-gov" />
        <path d="M 559.5 112 L 559.5 160.5 L 547.78 172.22" fill="none" className="lab-gov" />
        {/* blue dotted CRE line: the Bittensor⟷CRE hex → the top vault apex */}
        <line x1={LX} y1={lpY - lpR} x2={LX} y2={LINE_YS[0] - LINE_S * SQRT2} className="lab-gov" />
        {/* large blue hexagon: centred on the vault-column scaffold (LX), its two
            vertical sides landing on v1 (520.5) and v2 (559.5), pushed up so its
            bottom vertex rests on the top-of-Hydrex scaffold (lpY - lpR) */}
        <g
          className={`chg-click${selected === 'cre-gating-hook' ? ' sel' : ''}`}
          onClick={() => onSelect('cre-gating-hook')}
          tabIndex={0}
          role="button"
          aria-label="Bittensor CRE credit oracle"
        >
          <circle cx={LX} cy={lpY - lpR - 19.5 / COS30} r={24} fill="transparent" />
          <polygon points={chgHexPts(19.5 / COS30)} transform={`translate(${LX} ${lpY - lpR - 19.5 / COS30})`} className="lab-hex-charge blue" />
          {/* TAO / Bittensor mark inside the large blue hexagon */}
          <BittensorMark x={LX - 14} y={lpY - lpR - 19.5 / COS30 + 1 - (26 * 5) / 7 / 2} width={26} height={(26 * 5) / 7} color="var(--ink)" />
        </g>

        {/* animated flow — one clock, five beats. Each USDC pulse mints a
            zipUSD note that rises into the zodiac vault and settles in a
            hexagon; the supply continues to the reserve. Four beats release to
            the destinations; the fifth dollar is RETAINED in the reserve. */}
        {animate &&
          CV2_RK.map((p, i) => {
            const [jox, joy] = CV2_SAFE_SLOTS[i] // this beat's zodiac hexagon slot
            const retained = i >= CELLS.length // the fifth dollar stays in the reserve
            const d = DEST[i] // undefined on the retained beat (read only when !retained)
            return (
              <g key={i}>
                <ChgMote path={`M ${coinX} ${CY} L ${DEP} ${CY}`} t0={p.e0} t1={p.e1} />
                <ChgFlash x={DEP} y={CY} at={p.mint} />
                {/* mint → a zipUSD note rises into the zodiac vault and settles */}
                <ChgMote path={`M ${DEP} ${CY - DEPR} L ${DEP} ${JRY + JRR}`} t0={p.n0} t1={p.n1} kind="note" ease="out" r={2.4} />
                <circle cx={DEP + jox} cy={JRY + joy} r="2.2" opacity="0" className="lab-note-m">
                  <animate attributeName="opacity" dur={`${CHG_PERIOD}s`} repeatCount="indefinite" values="0;0;1;1;0;0" keyTimes={`0;${p.n1};${(p.n1 + 0.02).toFixed(3)};0.93;0.95;1`} />
                </circle>
                {/* supply rides the straight track to the reserve rim */}
                <ChgMote path={`M ${DEP} ${CY} L ${WH} ${CY}`} t0={p.s1_0} t1={p.s1_1} />
                <ChgMote path={`M ${WH + WHR} ${CY} L ${reserveRimX.toFixed(2)} ${CY}`} t0={p.s2_0} t1={p.s2_1} />
                {retained ? (
                  /* KEPT in the reserve — the dollar appears at the core and stays */
                  <circle cx={RX} cy={CY} r="2.8" opacity="0" className="lab-drop-m">
                    <animate attributeName="opacity" dur={`${CHG_PERIOD}s`} repeatCount="indefinite" values="0;0;1;1;0;0" keyTimes={`0;${p.s2_1};${(p.s2_1 + 0.02).toFixed(3)};0.93;0.95;1`} />
                  </circle>
                ) : (
                  <>
                    {/* the dollar APPEARS within its cell (stored), no fly */}
                    <circle cx={CELLS[i][0]} cy={CELLS[i][1]} r="2.8" opacity="0" className="lab-drop-m">
                      <animate attributeName="opacity" dur={`${CHG_PERIOD}s`} repeatCount="indefinite" values="0;0;1;1;0;0" keyTimes={`0;${p.s2_1};${p.s2_1 + 0.02};${p.r0};${p.r0 + 0.01};1`} />
                    </circle>
                    {/* the cell charges closed, concludes → its release appears on the exit track */}
                    <ChgHex x={CELLS[i][0]} y={CELLS[i][1]} r={13} at0={p.c0} at1={p.r0} />
                    <ChgFlash x={d.gx} y={d.gy} at={p.r0} blue />
                    <ChgMote path={d.path} t0={p.r0} t1={p.r1} ease="out" />
                  </>
                )}
              </g>
            )
          })}

        {/* credit check — before the reserve disperses to the lines, push blue signals down the
            feeds: CRE gate + Oracle price (solid blue), and the lien verify (hollow blue) */}
        {animate && (
          <g>
            <ChgMote path={`M ${LX} ${lpY - lpR} L ${LX} ${LINE_YS[0] - LINE_S * SQRT2}`} t0={0.3} t1={0.42} blue ease="in" r={2.4} />
            <ChgMote path="M 559.5 112 L 559.5 160.5 L 547.78 172.22" t0={0.3} t1={0.42} blue ease="in" r={2.4} />
            <ChgMote path="M 520.5 113 L 520.5 160.5 L 532.22 172.22" t0={0.3} t1={0.42} blue hollow ease="in" r={2.4} />
          </g>
        )}

        {/* ── junior yield cluster (Hydrex LP · Vault Strategist · NAV Oracle) ── */}
        {/* vault ↔ farm through the Vault Strategist hex (dotted authority) */}
        <line x1={vRimX} y1={JRY} x2={vsX - HEXR - 3} y2={vsY} className="lab-gov" />
        <line x1={vsX + HEXR + 3} y1={vsY} x2={fEdgeX} y2={JRY} className="lab-gov" />
        <g
          className={`chg-click${selected === 'cre-strategist' ? ' sel' : ''}`}
          onClick={() => onSelect('cre-strategist')}
          tabIndex={0}
          role="button"
          aria-label="CRE Strategist"
        >
          <circle cx={vsX} cy={vsY} r={HEXR + 3} fill="transparent" />
          <polygon points={chgHexPts(HEXR)} transform={`translate(${vsX} ${vsY})`} className="lab-hex-charge blue" />
        </g>
        {/* Hydrex LP pool, lifted above; dotted links down to the vault and farm */}
        <line x1={DEP + JRR * vLpUx} y1={JRY + JRR * vLpUy} x2={lpX - lpR * vLpUx} y2={lpY - lpR * vLpUy} className="lab-gov" />
        <line x1={RX + FARM_EDGE * fLpUx} y1={FARMY + FARM_EDGE * fLpUy} x2={lpX - lpR * fLpUx} y2={lpY - lpR * fLpUy} className="lab-gov" />
        <g
          className={`chg-click${selected === 'hydrex' ? ' sel' : ''}`}
          onClick={() => onSelect('hydrex')}
          tabIndex={0}
          role="button"
          aria-label="Hydrex LP pool"
        >
          <circle cx={lpX} cy={lpY} r={lpR} className="lab-world-lens" />
          <path
            transform={`translate(${lpX} ${lpY}) scale(${(lpR * 0.68) / 87}) translate(-87 -87)`}
            d="M156.803 60.4574C154.296 59.0993 151.654 58.0981 148.937 57.4356C144.042 56.2137 138.79 56.1401 133.983 54.5611C127.015 52.3748 121.343 46.5669 119.304 39.5553C117.71 34.3252 117.736 28.635 116.128 23.4049C114.328 17.2877 110.581 11.6601 105.649 7.5673C99.7193 2.52121 92.207 0 84.6764 0C77.3371 0 69.9868 2.39607 64.0794 7.1882C50.1885 17.8693 47.3287 39.0069 57.9106 52.8496C60.822 56.7842 64.6756 60.0415 69.0188 62.3308C67.7416 63.2583 66.516 64.2963 65.3639 65.4483C64.2192 66.593 63.1813 67.8149 62.2464 69.0958C60.2331 65.2716 57.4542 61.8266 54.1379 59.0735C48.212 54.0274 40.6998 51.5025 33.1691 51.5025C25.8299 51.5025 18.4796 53.8986 12.5721 58.6907C-1.31875 69.3718 -4.17863 90.5094 6.4033 104.352C10.8311 110.337 17.4269 114.772 24.63 116.568C29.621 117.871 34.9874 117.911 39.8937 119.509C46.9017 121.691 52.6178 127.544 54.6532 134.596C56.258 139.929 56.2027 145.737 57.9179 151.059C58.6872 153.536 59.7656 155.947 61.1348 158.214C67.3 168.623 78.2831 174 89.3361 174C98.4421 174 107.596 170.349 114.136 162.855L114.188 162.8C128.256 147.209 123.912 121.868 105.292 111.964C105.167 111.897 105.042 111.835 104.916 111.769C106.197 110.834 107.419 109.796 108.564 108.655C109.709 107.514 110.75 106.284 111.678 105.011C111.98 105.589 112.3 106.156 112.638 106.719C118.804 117.127 129.787 122.505 140.84 122.505C149.946 122.505 159.1 118.854 165.64 111.36L165.692 111.305C179.759 95.7138 175.416 70.3729 156.795 60.4684L156.803 60.4574ZM75.7765 98.2387C72.7878 95.25 71.1426 91.275 71.1426 87.046C71.1426 82.817 72.7878 78.8456 75.7765 75.8533C78.8609 72.769 82.9134 71.2268 86.9695 71.2268C91.0256 71.2268 95.0743 72.769 98.1624 75.8533C104.335 82.0257 104.335 92.0663 98.1624 98.235C95.1737 101.224 91.1985 102.873 86.9695 102.873C82.7404 102.873 78.7689 101.227 75.7765 98.235V98.2387ZM107.493 137.731C108.476 143.326 106.933 148.865 103.264 152.936C103.238 152.965 103.212 152.991 103.186 153.021L103.135 153.076C103.105 153.109 103.076 153.142 103.05 153.172C98.4163 158.483 92.4721 159.274 89.3435 159.274C82.7919 159.274 76.9875 156.072 73.8074 150.709C73.7853 150.672 73.7632 150.632 73.7374 150.595C72.994 149.366 72.4051 148.052 71.9818 146.69C71.967 146.642 71.9523 146.594 71.9376 146.546C71.437 144.99 71.1205 142.796 70.7856 140.477C70.3512 137.459 69.858 134.04 68.7796 130.429C65.3603 118.688 56.0187 109.141 44.3657 105.478C40.4789 104.223 36.8167 103.701 33.5814 103.237C31.6306 102.957 29.7866 102.696 28.3585 102.324C28.307 102.309 28.2554 102.298 28.2039 102.284C24.3576 101.323 20.6328 98.8239 18.244 95.5923C18.1998 95.5298 18.152 95.4709 18.1041 95.4083C12.458 88.025 14.0996 76.0852 21.5492 70.3619C21.6486 70.2846 21.7517 70.2036 21.8511 70.1226C24.9502 67.6088 28.9732 66.2249 33.1728 66.2249C37.4681 66.2249 41.5242 67.664 44.5939 70.2809C44.6418 70.3214 44.6896 70.3619 44.7375 70.4024C47.4354 72.6402 49.5334 75.7981 50.4977 79.0665C50.5161 79.1254 50.5308 79.1806 50.5492 79.2395C51.0204 80.7743 51.3259 82.8906 51.6498 85.1284C52.0878 88.1723 52.5846 91.6136 53.6852 95.2574C57.1082 106.918 66.4019 116.417 77.9702 120.079C81.8865 121.356 85.5782 121.886 88.8392 122.354C90.709 122.623 92.4721 122.877 93.8633 123.223C93.8891 123.23 93.9186 123.237 93.9443 123.245C95.4755 123.616 96.933 124.176 98.2728 124.901C98.3059 124.919 98.3427 124.938 98.3795 124.956C103.19 127.514 106.51 132.174 107.486 137.731H107.493ZM154.767 101.433C154.742 101.463 154.716 101.489 154.69 101.518L154.639 101.573C154.609 101.606 154.58 101.64 154.554 101.669C149.92 106.98 143.976 107.771 140.847 107.771C134.295 107.771 128.491 104.569 125.311 99.2067C125.289 99.1699 125.267 99.1294 125.241 99.0926C124.498 97.8633 123.909 96.5493 123.485 95.1875C123.471 95.1396 123.456 95.0918 123.441 95.0439C122.941 93.487 122.624 91.2934 122.289 88.9746C121.855 85.9566 121.362 82.5373 120.283 78.9266C116.864 67.1855 107.522 57.6381 95.8693 53.9759C91.9825 52.7208 88.3203 52.1982 85.0849 51.7344C83.1342 51.4547 81.2902 51.1934 79.8621 50.8179C79.8106 50.8032 79.759 50.7922 79.7075 50.7775C75.8612 49.8168 72.1364 47.3177 69.7476 44.0861C69.7034 44.0236 69.6556 43.9647 69.6077 43.9021C63.9616 36.5188 65.6032 24.579 73.0528 18.8557C73.1559 18.7784 73.2553 18.6974 73.3547 18.6164C76.4538 16.1026 80.4768 14.7187 84.6764 14.7187C88.9717 14.7187 93.0278 16.1578 96.0975 18.7747C96.1454 18.8152 96.1932 18.8557 96.2411 18.8962C98.939 21.134 101.037 24.2919 102.001 27.5603C102.02 27.6192 102.034 27.6744 102.053 27.7333C102.524 29.2681 102.829 31.3844 103.153 33.6222C103.591 36.6661 104.092 40.1148 105.192 43.7586C108.619 55.415 117.909 64.9109 129.474 68.5768C133.39 69.854 137.082 70.384 140.343 70.8514C142.209 71.1201 143.976 71.374 145.367 71.72C145.393 71.7274 145.422 71.7347 145.452 71.7421C146.983 72.1138 148.44 72.6733 149.78 73.3984C149.813 73.4168 149.85 73.4352 149.887 73.4536C154.697 76.0116 158.017 80.6712 158.993 86.2289C159.976 91.8234 158.433 97.3627 154.764 101.433H154.767Z"
            className="chg-logo"
          />
        </g>
        {/* NAV Oracle — a blue dotted link along the vault↔warehouse centre axis,
            broken around the hex (the CRE oracle mark) at the midpoint */}
        <line x1={noSafeX} y1={noSafeY} x2={noX - (HEXR + 3) * noUx} y2={noY - (HEXR + 3) * noUy} className="lab-gov" />
        <line x1={noX + (HEXR + 3) * noUx} y1={noY + (HEXR + 3) * noUy} x2={noWhX} y2={noWhY} className="lab-gov" />
        <g
          className={`chg-click${selected === 'nav-oracle' ? ' sel' : ''}`}
          onClick={() => onSelect('nav-oracle')}
          tabIndex={0}
          role="button"
          aria-label="NAV Oracle"
        >
          <circle cx={noX} cy={noY} r={HEXR + 3} fill="transparent" />
          <polygon points={chgHexPts(HEXR)} transform={`translate(${noX} ${noY})`} className="lab-hex-charge blue" />
        </g>

        {/* ── EXIT-view structures bridged onto the vault, scaled to fit ── */}
        {/* Exit Gate sector — clickable */}
        <g
          className={`chg-click${selected === 'exit-gate' ? ' sel' : ''}`}
          onClick={() => onSelect('exit-gate')}
          tabIndex={0}
          role="button"
          aria-label="Exit Gate"
        >
          <path d={annularSector(DEP, JRY, eWHRI, eWHRO, 210 + eSEAM, 270)} className="lab-world-lens" />
        </g>
        {/* CoW ring + its nested Redemption-Queue slots — clickable (matches the EXIT view) */}
        <g
          className={`chg-click${selected === 'cow' ? ' sel' : ''}`}
          onClick={() => onSelect('cow')}
          tabIndex={0}
          role="button"
          aria-label="CoW Protocol and its Redemption-Queue slots"
        >
          <path d={annularSector(DEP, JRY, eCOWRI, eCOWRO, 150, 210)} className="lab-world-lens" />
          <path d={annularSector(DEP, JRY, eWHRI, eWHRO, 150, 210)} className="lab-world-lens" />
          {[165, 180, 195].map((a) => {
            const r = erad(a)
            return <line key={a} x1={(DEP + eWHRI * Math.cos(r)).toFixed(2)} y1={(JRY + eWHRI * Math.sin(r)).toFixed(2)} x2={(DEP + eWHRO * Math.cos(r)).toFixed(2)} y2={(JRY + eWHRO * Math.sin(r)).toFixed(2)} className="lab-seg" />
          })}
          {[157.5, 172.5, 187.5, 202.5].map((a, i) => {
            const r = erad(a)
            return <circle key={i} cx={(DEP + eWHRM * Math.cos(r)).toFixed(2)} cy={(JRY + eWHRM * Math.sin(r)).toFixed(2)} r="2.2" className="lab-band-edge" opacity={0.5} />
          })}
        </g>
        {/* blue axis ray — shows in the two ring paddings and past CoW into the flange */}
        <line x1={DEP - JRR} y1={JRY} x2={DEP - eWHRI} y2={JRY} className="chg-ray" />
        <line x1={DEP - eWHRO} y1={JRY} x2={DEP - eCOWRI} y2={JRY} className="chg-ray" />
        <line x1={DEP - eCOWRO} y1={JRY} x2={eXOUT + 16} y2={JRY} className="chg-ray" markerEnd="url(#cv2-b)" />
        {/* curved baseplate flange (blue), parallel to CoW */}
        <path d={`M ${ebpA[0].toFixed(2)} ${ebpA[1].toFixed(2)} A ${eBPR} ${eBPR} 0 0 1 ${ebpB[0].toFixed(2)} ${ebpB[1].toFixed(2)}`} className="chg-ray" fill="none" />
        {/* redeemed USDC out — the ray's terminus, full-size to match the input coin */}
        <UsdcMark cx={eXOUT - 2} cy={JRY} r={14} />
      </g>
    </svg>
  )
}

function JuniorSafeView({ animate, selected, onSelect }: { animate: boolean; selected: string | null; onSelect: (id: string) => void }) {
  const RES_R = 30 // the junior reserve is small
  const CELL = 9 // its single CRE charge cell, seated inside the green diamond
  // the junior safe is the star here: larger than the warehouse safe and lifted
  // toward the top. JR_S scales the keyhole, hexagon ring, and hex size together.
  const JR_R = 66
  const JR_Y = 36
  const JR_S = JR_R / 38
  // bottom row spread across the width: the USDC mark's left margin (75) is
  // mirrored on the right by the reserve, with wider gaps between every circle
  const XU = 89 // USDC mark centre (r 14 -> left edge 75)
  const JD = 170 // deposit + junior safe
  const JW = 350 // warehouse safe
  const JRES = 535 // reserve + farm vault (r 30 -> right edge 565 -> right margin 75)
  const farmRel = `M ${JRES} ${CV2_CY - RES_R} L ${JRES} ${CV2_FARM_Y + 22}`
  const farmGateY = CV2_FARM_Y + 38 // gate ~16px from the arrow, matching CREDIT WAREHOUSE
  // dotted-blue link from the junior safe to the warehouse safe, through a hex node
  const HEXR = 12
  const lenJW = Math.hypot(JW - JD, CV2_CY - JR_Y)
  const uxJW = (JW - JD) / lenJW
  const uyJW = (CV2_CY - JR_Y) / lenJW
  // the hex sits at the midpoint of the two circle EDGES, so its dotted gaps match
  const jEdgeX = JD + JR_R * uxJW
  const jEdgeY = JR_Y + JR_R * uyJW
  const wEdgeX = JW - 38 * uxJW
  const wEdgeY = CV2_CY - 38 * uyJW
  const hmx = (jEdgeX + wEdgeX) / 2
  const hmy = (jEdgeY + wEdgeY) / 2
  const GAP = HEXR + 5
  // junior safe ↔ farm vault dotted-blue link (the "vault strategist"), through the 2nd hex
  const lenJF = Math.hypot(JRES - JD, CV2_FARM_Y - JR_Y)
  const uxJF = (JRES - JD) / lenJF
  const uyJF = (CV2_FARM_Y - JR_Y) / lenJF
  const h2x = (JD + JRES) / 2 // second hexagon at the junior-safe↔farm-vault centre-midpoint
  const h2y = (JR_Y + CV2_FARM_Y) / 2
  // hydrex pool at the top: small circle + a broader 5/6 outer ring whose opening
  // (a 60° gap) points straight at the vault-strategist hexagon
  const hxpX = h2x
  const hxpY = -54 // lifted high so the junior-safe → LP dotted line runs clear
  const hxpR = 10.77 * JR_S // inner pool = the junior safe's keyhole-loop (inside) size
  const hxpRI = hxpR + 5 // outer-wheel band (like CoW / exit gate)
  const hxpRO = hxpRI + 12
  const hxpGap = (Math.atan2(h2y - hxpY, h2x - hxpX) * 180) / Math.PI // opening centre angle
  // dotted-blue link from the junior safe to the LP inner circle (centre axis)
  const lenJL = Math.hypot(hxpX - JD, hxpY - JR_Y)
  const uxJL = (hxpX - JD) / lenJL
  const uyJL = (hxpY - JR_Y) / lenJL
  // its two endpoints — the LP round-trip rides this drawn line: the zipUSD out
  // (safe rim -> LP edge) and the LP receipt back (LP edge -> safe rim)
  const lpSafeX = JD + JR_R * uxJL
  const lpSafeY = JR_Y + JR_R * uyJL
  const lpEdgeX = hxpX - hxpR * uxJL
  const lpEdgeY = hxpY - hxpR * uyJL
  // dotted-blue link from the farm vault to the LP inner circle (centre axis)
  const lenFL = Math.hypot(hxpX - JRES, hxpY - CV2_FARM_Y)
  const uxFL = (hxpX - JRES) / lenFL
  const uyFL = (hxpY - CV2_FARM_Y) / lenFL
  // the zipUSD parks along the CENTRELINE of the hydrex outer-ring band (never on
  // its arcs); the LP receipt returns from the same band to the vault's hexagons
  const hydrexBandR = (hxpRI + hxpRO) / 2
  // the animation runs on a longer 12s clock (its own, not the shared 7.2s): the
  // front ~half is the deposit→mint→LP loop (compressed by F), the back half is
  // the LP-collateral yield sequence appended below.
  const P = 12
  const F = 0.5
  const rk = CV2_RK.map((p) => Object.fromEntries(Object.entries(p).map(([k, v]) => [k, v * F])) as (typeof CV2_RK)[number])
  // vault-strategist line endpoints (zodiac rim ↔ farm-vault edge) and the
  // farm↔LP line endpoints — reused by the back-half collateral sequence
  const sStratX = JD + JR_R * uxJF
  const sStratY = JR_Y + JR_R * uyJF
  const fStratX = JRES - 22 * uxJF
  const fStratY = CV2_FARM_Y - 22 * uyJF
  const fLpFarmX = JRES + 22 * uxFL
  const fLpFarmY = CV2_FARM_Y + 22 * uyFL
  const fLpEdgeX = hxpX - hxpR * uxFL
  const fLpEdgeY = hxpY - hxpR * uyFL
  return (
    <svg
      viewBox="0 0 640 470"
      role="img"
      aria-label="Junior Safe: USDC is deposited and minted to zipUSD, which fills the junior safe's Chainlink feed slots; the supply is held in a small USDC reserve vault whose single CRE-charged cell releases to the farm vault"
    >
      <defs>
        <marker id="cv2-a" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
          <path d="M0 0 L7 3.5 L0 7 z" className="lab-ar" />
        </marker>
        <marker id="cv2-m" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
          <path d="M0 0 L7 3.5 L0 7 z" className="lab-ar mint" />
        </marker>
      </defs>
      {/* only the vertical drop is nudged; the row is laid out in absolute x.
          chg-flat strips the hexagon glow/fuzz so this view reads flat. */}
      <g className="chg-flat" fontFamily="var(--mono)" transform="translate(-48.28 118.34) scale(1.0517)">
        {/* drawn track — nothing crosses the reserve interior */}
        <line x1={XU + 16} y1={CV2_CY} x2={JD - 34} y2={CV2_CY} className="lab-lane" />
        <line x1={JD + 30} y1={CV2_CY} x2={JW - 38} y2={CV2_CY} className="lab-lane" markerEnd="url(#cv2-a)" />
        {/* warehouse straight into the reserve rim */}
        <line x1={JW + 38} y1={CV2_CY} x2={JRES - RES_R} y2={CV2_CY} className="lab-lane" markerEnd="url(#cv2-a)" />
        {/* farm vault: straight up, directly above the reserve */}
        <line x1={JRES} y1={CV2_CY - RES_R} x2={JRES} y2={CV2_FARM_Y + 22} className="lab-lane" markerEnd="url(#cv2-a)" />
        <line x1={JRES - 6} y1={farmGateY} x2={JRES + 6} y2={farmGateY} className="lab-gate" />
        {/* deposit -> junior safe, straight up into the safe's rim */}
        <line x1={JD} y1={CV2_CY - 22} x2={JD} y2={JR_Y + JR_R} className="lab-lane mint" markerEnd="url(#cv2-m)" />

        {/* USDC symbol */}
        <UsdcMark cx={XU} cy={CV2_CY} r={14} />

        {/* deposit */}
        <g
          className={`chg-click${selected === 'deposit-module' ? ' sel' : ''}`}
          onClick={() => onSelect('deposit-module')}
          tabIndex={0}
          role="button"
          aria-label="Deposit, the ZipDepositModule"
        >
          <line x1={JD - 34} y1={CV2_CY - 8} x2={JD - 34} y2={CV2_CY + 8} className="lab-doorline" />
          <line x1={JD - 26} y1={CV2_CY - 8} x2={JD - 26} y2={CV2_CY + 8} className="lab-doorline" />
          <circle cx={JD} cy={CV2_CY} r="30" className="lab-world-lens" />
          <circle cx={JD} cy={CV2_CY} r="8" className="lab-core mint" />
          {/* centred under the minter, on the shared bottom-row baseline */}
          <text x={JD} y={CV2_CY + 59} textAnchor="middle" className="lab-rel">
            zipUSD MINT
          </text>
        </g>
        {/* Zodiac Vault — the junior-tranche Safe (Chainlink feed marks inside), clickable */}
        <g
          className={`chg-click${selected === 'safe-zodiac' ? ' sel' : ''}`}
          onClick={() => onSelect('safe-zodiac')}
          tabIndex={0}
          role="button"
          aria-label="Zodiac Vault"
        >
          <circle cx={JD} cy={JR_Y} r={JR_R} className="lab-world-lens" />
          <path
            d="M610.2,396.07l-144.11.11c-4.17,14.6-9.42,28.25-19.51,39.69-34.13,38.66-89.96,41.32-126.63,6.64-26.5-25.06-34.56-65.03-19.85-98.6,19.56-44.65,71.37-64.38,116.15-44.67l12.88,7.52c20.16,13.78,32.72,34.65,37.43,59l143.07.09c8.61,0,14.63,6.78,15.05,14.73.35,6.71-5.4,15.48-14.49,15.49Z"
            transform={`translate(${JD} ${JR_Y}) scale(${0.123 * JR_S}) translate(-380.4 -379.2)`}
            className="chg-safe"
            vectorEffect="non-scaling-stroke"
          />
          {CV2_SAFE_SLOTS.map(([ox, oy], i) => (
            <polygon key={i} points={chgHexPts(6 * JR_S)} transform={`translate(${JD + ox * JR_S} ${JR_Y + oy * JR_S})`} className="lab-hex-charge blue" opacity={0.9} />
          ))}
        </g>

        {/* junior safe ↔ warehouse safe: a dotted-blue link with a hexagon node
            at the edge-midpoint, equal dotted gaps on each side */}
        <line x1={jEdgeX} y1={jEdgeY} x2={hmx - GAP * uxJW} y2={hmy - GAP * uyJW} className="lab-gov" />
        <line x1={hmx + GAP * uxJW} y1={hmy + GAP * uyJW} x2={wEdgeX} y2={wEdgeY} className="lab-gov" />
        <g
          className={`chg-click${selected === 'nav-oracle' ? ' sel' : ''}`}
          onClick={() => onSelect('nav-oracle')}
          tabIndex={0}
          role="button"
          aria-label="NAV Oracle"
        >
          <circle cx={hmx} cy={hmy} r={HEXR + 4} fill="transparent" />
          <polygon points={chgHexPts(HEXR)} transform={`translate(${hmx} ${hmy})`} className="lab-hex-charge blue" />
        </g>
        <text x={hmx + HEXR + 8} y={hmy + 2} className="lab-rel blue">
          NAV ORACLE
        </text>

        {/* junior safe → farm vault: dotted-blue "vault strategist" link through a hexagon,
            aimed at the junior-safe centre, broken with equal gaps around the hex */}
        <line x1={JD + JR_R * uxJF} y1={JR_Y + JR_R * uyJF} x2={h2x - GAP * uxJF} y2={h2y - GAP * uyJF} className="lab-gov" />
        <line x1={h2x + GAP * uxJF} y1={h2y + GAP * uyJF} x2={JRES - 22 * uxJF} y2={CV2_FARM_Y - 22 * uyJF} className="lab-gov" />
        <g
          className={`chg-click${selected === 'cre-strategist' ? ' sel' : ''}`}
          onClick={() => onSelect('cre-strategist')}
          tabIndex={0}
          role="button"
          aria-label="CRE Strategist"
        >
          <circle cx={h2x} cy={h2y} r={HEXR + 4} fill="transparent" />
          <polygon points={chgHexPts(HEXR)} transform={`translate(${h2x} ${h2y})`} className="lab-hex-charge blue" />
        </g>
        <text x={h2x} y={CV2_FARM_Y + 1} textAnchor="middle" className="lab-rel blue">
          CRE STRATEGIST
        </text>

        {/* junior safe → LP inner circle: dotted-blue link */}
        <line x1={lpSafeX} y1={lpSafeY} x2={lpEdgeX} y2={lpEdgeY} className="lab-gov" />
        {/* farm vault → LP inner circle: dotted-blue link */}
        <line x1={JRES + 22 * uxFL} y1={CV2_FARM_Y + 22 * uyFL} x2={hxpX - hxpR * uxFL} y2={hxpY - hxpR * uyFL} className="lab-gov" />

        {/* hydrex pool — small inner circle + a 2/3 outer-wheel band, its opening
            (a 120° gap) aimed at the vault-strategist hexagon; clickable */}
        <g
          className={`chg-click${selected === 'hydrex' ? ' sel' : ''}`}
          onClick={() => onSelect('hydrex')}
          tabIndex={0}
          role="button"
          aria-label="Hydrex pool"
        >
          <circle cx={hxpX} cy={hxpY} r={hxpR} className="lab-world-lens" />
          {/* Hydrex mark, centred in the LP pool; scaled to ~80% of the circle.
              fill tracks --ink so it reads in both light and dark. */}
          <path
            transform={`translate(${hxpX} ${hxpY}) scale(${(hxpR * 0.684) / 87}) translate(-87 -87)`}
            d="M156.803 60.4574C154.296 59.0993 151.654 58.0981 148.937 57.4356C144.042 56.2137 138.79 56.1401 133.983 54.5611C127.015 52.3748 121.343 46.5669 119.304 39.5553C117.71 34.3252 117.736 28.635 116.128 23.4049C114.328 17.2877 110.581 11.6601 105.649 7.5673C99.7193 2.52121 92.207 0 84.6764 0C77.3371 0 69.9868 2.39607 64.0794 7.1882C50.1885 17.8693 47.3287 39.0069 57.9106 52.8496C60.822 56.7842 64.6756 60.0415 69.0188 62.3308C67.7416 63.2583 66.516 64.2963 65.3639 65.4483C64.2192 66.593 63.1813 67.8149 62.2464 69.0958C60.2331 65.2716 57.4542 61.8266 54.1379 59.0735C48.212 54.0274 40.6998 51.5025 33.1691 51.5025C25.8299 51.5025 18.4796 53.8986 12.5721 58.6907C-1.31875 69.3718 -4.17863 90.5094 6.4033 104.352C10.8311 110.337 17.4269 114.772 24.63 116.568C29.621 117.871 34.9874 117.911 39.8937 119.509C46.9017 121.691 52.6178 127.544 54.6532 134.596C56.258 139.929 56.2027 145.737 57.9179 151.059C58.6872 153.536 59.7656 155.947 61.1348 158.214C67.3 168.623 78.2831 174 89.3361 174C98.4421 174 107.596 170.349 114.136 162.855L114.188 162.8C128.256 147.209 123.912 121.868 105.292 111.964C105.167 111.897 105.042 111.835 104.916 111.769C106.197 110.834 107.419 109.796 108.564 108.655C109.709 107.514 110.75 106.284 111.678 105.011C111.98 105.589 112.3 106.156 112.638 106.719C118.804 117.127 129.787 122.505 140.84 122.505C149.946 122.505 159.1 118.854 165.64 111.36L165.692 111.305C179.759 95.7138 175.416 70.3729 156.795 60.4684L156.803 60.4574ZM75.7765 98.2387C72.7878 95.25 71.1426 91.275 71.1426 87.046C71.1426 82.817 72.7878 78.8456 75.7765 75.8533C78.8609 72.769 82.9134 71.2268 86.9695 71.2268C91.0256 71.2268 95.0743 72.769 98.1624 75.8533C104.335 82.0257 104.335 92.0663 98.1624 98.235C95.1737 101.224 91.1985 102.873 86.9695 102.873C82.7404 102.873 78.7689 101.227 75.7765 98.235V98.2387ZM107.493 137.731C108.476 143.326 106.933 148.865 103.264 152.936C103.238 152.965 103.212 152.991 103.186 153.021L103.135 153.076C103.105 153.109 103.076 153.142 103.05 153.172C98.4163 158.483 92.4721 159.274 89.3435 159.274C82.7919 159.274 76.9875 156.072 73.8074 150.709C73.7853 150.672 73.7632 150.632 73.7374 150.595C72.994 149.366 72.4051 148.052 71.9818 146.69C71.967 146.642 71.9523 146.594 71.9376 146.546C71.437 144.99 71.1205 142.796 70.7856 140.477C70.3512 137.459 69.858 134.04 68.7796 130.429C65.3603 118.688 56.0187 109.141 44.3657 105.478C40.4789 104.223 36.8167 103.701 33.5814 103.237C31.6306 102.957 29.7866 102.696 28.3585 102.324C28.307 102.309 28.2554 102.298 28.2039 102.284C24.3576 101.323 20.6328 98.8239 18.244 95.5923C18.1998 95.5298 18.152 95.4709 18.1041 95.4083C12.458 88.025 14.0996 76.0852 21.5492 70.3619C21.6486 70.2846 21.7517 70.2036 21.8511 70.1226C24.9502 67.6088 28.9732 66.2249 33.1728 66.2249C37.4681 66.2249 41.5242 67.664 44.5939 70.2809C44.6418 70.3214 44.6896 70.3619 44.7375 70.4024C47.4354 72.6402 49.5334 75.7981 50.4977 79.0665C50.5161 79.1254 50.5308 79.1806 50.5492 79.2395C51.0204 80.7743 51.3259 82.8906 51.6498 85.1284C52.0878 88.1723 52.5846 91.6136 53.6852 95.2574C57.1082 106.918 66.4019 116.417 77.9702 120.079C81.8865 121.356 85.5782 121.886 88.8392 122.354C90.709 122.623 92.4721 122.877 93.8633 123.223C93.8891 123.23 93.9186 123.237 93.9443 123.245C95.4755 123.616 96.933 124.176 98.2728 124.901C98.3059 124.919 98.3427 124.938 98.3795 124.956C103.19 127.514 106.51 132.174 107.486 137.731H107.493ZM154.767 101.433C154.742 101.463 154.716 101.489 154.69 101.518L154.639 101.573C154.609 101.606 154.58 101.64 154.554 101.669C149.92 106.98 143.976 107.771 140.847 107.771C134.295 107.771 128.491 104.569 125.311 99.2067C125.289 99.1699 125.267 99.1294 125.241 99.0926C124.498 97.8633 123.909 96.5493 123.485 95.1875C123.471 95.1396 123.456 95.0918 123.441 95.0439C122.941 93.487 122.624 91.2934 122.289 88.9746C121.855 85.9566 121.362 82.5373 120.283 78.9266C116.864 67.1855 107.522 57.6381 95.8693 53.9759C91.9825 52.7208 88.3203 52.1982 85.0849 51.7344C83.1342 51.4547 81.2902 51.1934 79.8621 50.8179C79.8106 50.8032 79.759 50.7922 79.7075 50.7775C75.8612 49.8168 72.1364 47.3177 69.7476 44.0861C69.7034 44.0236 69.6556 43.9647 69.6077 43.9021C63.9616 36.5188 65.6032 24.579 73.0528 18.8557C73.1559 18.7784 73.2553 18.6974 73.3547 18.6164C76.4538 16.1026 80.4768 14.7187 84.6764 14.7187C88.9717 14.7187 93.0278 16.1578 96.0975 18.7747C96.1454 18.8152 96.1932 18.8557 96.2411 18.8962C98.939 21.134 101.037 24.2919 102.001 27.5603C102.02 27.6192 102.034 27.6744 102.053 27.7333C102.524 29.2681 102.829 31.3844 103.153 33.6222C103.591 36.6661 104.092 40.1148 105.192 43.7586C108.619 55.415 117.909 64.9109 129.474 68.5768C133.39 69.854 137.082 70.384 140.343 70.8514C142.209 71.1201 143.976 71.374 145.367 71.72C145.393 71.7274 145.422 71.7347 145.452 71.7421C146.983 72.1138 148.44 72.6733 149.78 73.3984C149.813 73.4168 149.85 73.4352 149.887 73.4536C154.697 76.0116 158.017 80.6712 158.993 86.2289C159.976 91.8234 158.433 97.3627 154.764 101.433H154.767Z"
            className="chg-logo"
          />
          <path d={funnelSector(hxpX, hxpY, hxpRI, hxpRO, hxpGap + 67, hxpGap + 307, [uxJL, uyJL], [uxFL, uyFL], 3)} className="lab-world-lens" />
          <text x={hxpX + hxpRO + 10} y={hxpY + 3} className="lab-rel">
            zipUSD/ZIPCODE LP
          </text>
        </g>

        {/* warehouse safe */}
        <g
          className={`chg-click${selected === 'warehouse' ? ' sel' : ''}`}
          onClick={() => onSelect('warehouse')}
          tabIndex={0}
          role="button"
          aria-label="The Warehouse Safe"
        >
          <circle cx={JW} cy={CV2_CY} r="38" className="lab-world-lens" />
          <path
            d="M610.2,396.07l-144.11.11c-4.17,14.6-9.42,28.25-19.51,39.69-34.13,38.66-89.96,41.32-126.63,6.64-26.5-25.06-34.56-65.03-19.85-98.6,19.56-44.65,71.37-64.38,116.15-44.67l12.88,7.52c20.16,13.78,32.72,34.65,37.43,59l143.07.09c8.61,0,14.63,6.78,15.05,14.73.35,6.71-5.4,15.48-14.49,15.49Z"
            transform={`translate(${JW} ${CV2_CY}) scale(0.123) translate(-380.4 -379.2)`}
            className="chg-safe"
            vectorEffect="non-scaling-stroke"
          />
          {CV2_SAFE_SLOTS.map(([ox, oy], i) => (
            <rect key={i} x={JW + ox - 3.5} y={CV2_CY + oy - 3.5} width="7" height="7" transform={`rotate(45 ${JW + ox} ${CV2_CY + oy})`} className="lab-share-tok" />
          ))}
          <text x={JW} y={CV2_CY + 59} textAnchor="middle" className="lab-rel">
            WAREHOUSE SAFE
          </text>
        </g>


        {/* farm vault, up off the reserve */}
        <g
          className={`chg-click${selected === 'farm-vault' ? ' sel' : ''}`}
          onClick={() => onSelect('farm-vault')}
          tabIndex={0}
          role="button"
          aria-label="The farm vault"
        >
          <rect x={JRES - 11} y={CV2_FARM_Y - 11} width="22" height="22" transform={`rotate(45 ${JRES} ${CV2_FARM_Y})`} className="lab-vault-sq" />
        </g>
        <text x={JRES + 11 * SQRT2 + 10} y={CV2_FARM_Y + 1} textAnchor="start" className="lab-rel">
          FARM VAULT
        </text>

        {/* the small USDC Reserve Vault — one CRE charge cell in the green diamond */}
        <g
          className={`chg-click${selected === 'euler-earn' ? ' sel' : ''}`}
          onClick={() => onSelect('euler-earn')}
          tabIndex={0}
          role="button"
          aria-label="The USDC reserve"
        >
          <rect x={JRES - 16} y={CV2_CY - 16} width="32" height="32" transform={`rotate(45 ${JRES} ${CV2_CY})`} className="lab-vault-open" />
        </g>
        <text x={JRES} y={CV2_CY + 59} textAnchor="middle" className="lab-rel">
          USDC RESERVE
        </text>

        {/* the single charge cell, faint until it charges closed */}
        <polygon points={chgHexPts(CELL)} transform={`translate(${JRES} ${CV2_CY})`} className="lab-hex-charge blue" opacity={animate ? 0.24 : 0.85} />

        {/* animated flow — one clock, five beats. Each USDC pulse mints a
            zipUSD note that rises into the junior safe and settles in a
            hexagon; the supply continues to the small reserve. Four dollars
            charge the single cell and release up to the farm vault; the fifth
            is RETAINED in the reserve. */}
        {animate &&
          rk.map((p, i) => {
            const [jox, joy] = CV2_SAFE_SLOTS[i] // this beat's junior hexagon slot
            const retained = i >= 4 // one dollar stays in the reserve
            const hx = JD + jox * JR_S
            const hy = JR_Y + joy * JR_S
            const out0 = (0.34 + 0.07 * i) * F // hexagon fires; the zipUSD leaves the vault
            const out1 = out0 + 0.13 * F // ...and parks in the band ("into the clip")
            const ret1 = out1 + 0.13 * F // the LP receipt has ridden back into the slot
            // parked slot on the band centreline: the beads are spread EQUALLY
            // across the 240° band span (a0+67 → a0+307), centred over the top,
            // one padding step in from each funnel mouth
            const qaDeg = hxpGap + 67 + (240 / (CV2_RK.length + 1)) * (i + 1)
            const qa = (qaDeg * Math.PI) / 180
            const qx = hxpX + hydrexBandR * Math.cos(qa)
            const qy = hxpY + hydrexBandR * Math.sin(qa)
            return (
              <g key={i}>
                <ChgMote path={`M ${XU} ${CV2_CY} L ${JD} ${CV2_CY}`} t0={p.e0} t1={p.e1} period={P} />
                <ChgFlash x={JD} y={CV2_CY} at={p.mint} period={P} />
                {/* mint -> a zipUSD note rises into the junior safe and fills its hexagon */}
                <ChgMote path={`M ${JD} ${CV2_CY - 22} L ${JD} ${JR_Y + JR_R}`} t0={p.n0} t1={p.n1} kind="note" ease="out" r={2.4} period={P} />
                <circle cx={hx} cy={hy} r="2.2" opacity="0" className="lab-note-m">
                  <animate attributeName="opacity" dur={`${P}s`} repeatCount="indefinite" values="0;0;1;1;0;0" keyTimes={`0;${p.n1};${(p.n1 + 0.02).toFixed(3)};${out0.toFixed(3)};${(out0 + 0.02).toFixed(3)};1`} />
                </circle>
                {/* the hexagon fires; the zipUSD appears on the safe rim and rides
                    the drawn line to the pool, parking up inside the band */}
                <ChgFlash x={hx} y={hy} at={out0} period={P} />
                <ChgMote path={`M ${lpSafeX.toFixed(2)} ${lpSafeY.toFixed(2)} L ${lpEdgeX.toFixed(2)} ${lpEdgeY.toFixed(2)}`} t0={out0} t1={out1} kind="note" ease="out" r={2.4} period={P} />
                <circle cx={qx.toFixed(2)} cy={qy.toFixed(2)} r="2.2" opacity="0" className="lab-note-m">
                  <animate attributeName="opacity" dur={`${P}s`} repeatCount="indefinite" values="0;0;1;1;0;0" keyTimes={`0;${out1.toFixed(3)};${(out1 + 0.02).toFixed(3)};0.97;0.99;1`} />
                </circle>
                {/* the pool issues an LP receipt (hollow green) that rides the same
                    line back into the emptied hexagon slot — it replaces the zipUSD */}
                <ChgMote path={`M ${lpEdgeX.toFixed(2)} ${lpEdgeY.toFixed(2)} L ${lpSafeX.toFixed(2)} ${lpSafeY.toFixed(2)}`} t0={out1} t1={ret1} ease="out" r={2.4} hollow period={P} />
                <circle cx={hx} cy={hy} r="2.4" opacity="0" className="lab-lp-m">
                  <animate attributeName="opacity" dur={`${P}s`} repeatCount="indefinite" values="0;0;1;1;0;0" keyTimes={`0;${ret1.toFixed(3)};${(ret1 + 0.02).toFixed(3)};0.97;0.99;1`} />
                </circle>
                {/* supply rides the straight track to the reserve rim */}
                <ChgMote path={`M ${JD} ${CV2_CY} L ${JW} ${CV2_CY}`} t0={p.s1_0} t1={p.s1_1} period={P} />
                <ChgMote path={`M ${JW + 38} ${CV2_CY} L ${JRES - RES_R} ${CV2_CY}`} t0={p.s2_0} t1={p.s2_1} period={P} />
                {retained ? (
                  <circle cx={JRES} cy={CV2_CY} r="2.8" opacity="0" className="lab-drop-m">
                    <animate attributeName="opacity" dur={`${P}s`} repeatCount="indefinite" values="0;0;1;1;0;0" keyTimes={`0;${p.s2_1};${(p.s2_1 + 0.02).toFixed(3)};0.93;0.95;1`} />
                  </circle>
                ) : (
                  <>
                    <circle cx={JRES} cy={CV2_CY} r="2.8" opacity="0" className="lab-drop-m">
                      <animate attributeName="opacity" dur={`${P}s`} repeatCount="indefinite" values="0;0;1;1;0;0" keyTimes={`0;${p.s2_1};${p.s2_1 + 0.02};${p.r0};${p.r0 + 0.01};1`} />
                    </circle>
                    <ChgHex x={JRES} y={CV2_CY} r={CELL} at0={p.c0} at1={p.r0} period={P} />
                    <ChgFlash x={JRES} y={farmGateY} at={p.r0} blue period={P} />
                    <ChgMote path={farmRel} t0={p.r0} t1={p.r1} ease="out" period={P} />
                  </>
                )}
              </g>
            )
          })}

        {/* ── back half (0.50→1.0): the LP-collateral yield loop ──
            The vault posts an LP receipt to the farm vault as collateral (green
            hollow), borrows USDC back (white), Hydrex prices the position (blue:
            hollow out, solid back) and pays fees (white) to the farm + vault,
            then the collateral is returned to the vault. All on the 12s clock. */}
        {animate && (
          <g>
            {/* 1 — LP receipt posted as collateral: vault → farm, then parks */}
            <ChgMote path={`M ${sStratX.toFixed(2)} ${sStratY.toFixed(2)} L ${fStratX.toFixed(2)} ${fStratY.toFixed(2)}`} t0={0.5} t1={0.6} ease="out" r={2.4} hollow period={P} />
            <circle cx={JRES} cy={CV2_FARM_Y} r="2.6" opacity="0" className="lab-lp-m">
              <animate attributeName="opacity" dur={`${P}s`} repeatCount="indefinite" values="0;0;1;1;0;0" keyTimes="0;0.6;0.62;0.89;0.91;1" />
            </circle>
            {/* 2 — borrow: the farm pulls a USDC (white) back into the vault */}
            <ChgMote path={`M ${fStratX.toFixed(2)} ${fStratY.toFixed(2)} L ${sStratX.toFixed(2)} ${sStratY.toFixed(2)}`} t0={0.62} t1={0.72} ease="out" r={2.8} period={P} />
            {/* 3 — Hydrex prices the LP: blue hollow out to the vault, blue solid back */}
            <ChgMote path={`M ${lpEdgeX.toFixed(2)} ${lpEdgeY.toFixed(2)} L ${lpSafeX.toFixed(2)} ${lpSafeY.toFixed(2)}`} t0={0.7} t1={0.78} ease="out" r={2.4} hollow blue period={P} />
            <ChgMote path={`M ${lpEdgeX.toFixed(2)} ${lpEdgeY.toFixed(2)} L ${lpSafeX.toFixed(2)} ${lpSafeY.toFixed(2)}`} t0={0.73} t1={0.81} ease="out" r={2.4} hollow blue period={P} />
            <ChgMote path={`M ${lpSafeX.toFixed(2)} ${lpSafeY.toFixed(2)} L ${lpEdgeX.toFixed(2)} ${lpEdgeY.toFixed(2)}`} t0={0.8} t1={0.88} ease="out" r={2.4} blue period={P} />
            <ChgMote path={`M ${lpSafeX.toFixed(2)} ${lpSafeY.toFixed(2)} L ${lpEdgeX.toFixed(2)} ${lpEdgeY.toFixed(2)}`} t0={0.83} t1={0.91} ease="out" r={2.4} blue period={P} />
            {/* 4 — Hydrex pays fees (white) out to the farm vault and the zodiac vault */}
            <ChgMote path={`M ${fLpEdgeX.toFixed(2)} ${fLpEdgeY.toFixed(2)} L ${fLpFarmX.toFixed(2)} ${fLpFarmY.toFixed(2)}`} t0={0.74} t1={0.94} ease="out" r={2.8} period={P} />
            <ChgMote path={`M ${lpEdgeX.toFixed(2)} ${lpEdgeY.toFixed(2)} L ${lpSafeX.toFixed(2)} ${lpSafeY.toFixed(2)}`} t0={0.74} t1={0.94} ease="out" r={2.8} period={P} />
            {/* 5 — collateral returned: the farm's receipt rides back to the vault */}
            <ChgMote path={`M ${fStratX.toFixed(2)} ${fStratY.toFixed(2)} L ${sStratX.toFixed(2)} ${sStratY.toFixed(2)}`} t0={0.89} t1={0.98} ease="out" r={2.4} hollow period={P} />
          </g>
        )}

      </g>
    </svg>
  )
}

// centring transform for the EXIT view; tuned after measuring the stripped bbox
const EXIT_FIT = 'translate(6.13 107.32) scale(1.0572)'

function JuniorExitView({ animate, selected, onSelect }: { animate: boolean; selected: string | null; onSelect: (id: string) => void }) {
  const RES_R = 30 // the junior reserve is small
  const CELL = 9 // its single CRE charge cell, seated inside the green diamond
  // the junior safe is the star here: larger than the warehouse safe and lifted
  // toward the top. JR_S scales the keyhole, hexagon ring, and hex size together.
  const JR_R = 66
  const JR_Y = 36
  const JR_S = JR_R / 38
  // one padding value for every concentric seam — vault→first wheel, first
  // wheel→CoW ring, and (converted to an arc gap) the Exit Gate ↔ Redemption
  // Queue split. Change PAD and every gap moves together.
  const PAD = 7
  const WH_RI = JR_R + PAD // first wheel inner radius — one PAD off the Zodiac rim
  const WH_RO = WH_RI + JR_R / 2 // first wheel outer radius
  const WH_RM = (WH_RI + WH_RO) / 2 // band centre radius
  // outer CoW ring — one PAD beyond the first wheel, 30-wide band retained
  const COW_RI = WH_RO + PAD
  const COW_RO = COW_RI + 30
  // the Exit Gate ↔ Redemption Queue seam gap, in degrees; sized to read
  // PAD-wide at the band centre so it matches the radial paddings. The WHOLE
  // gap sits on the Exit Gate side of 210°, so the Redemption Queue stays flush
  // with the CoW wedge (both run the full 150°→210°) while the Exit Gate shrinks
  // to suit — its right edge stays on the 270° vertical.
  const SEAM = ((PAD / WH_RM) * 180) / Math.PI
  // redemption queue arc — full 150°→210° wedge (flush with CoW), 4 epoch cells
  const RQ0 = 150
  const RQ1 = 210
  const rqStep = (RQ1 - RQ0) / 4
  const polar = (r: number, a: number): [number, number] => [JD + r * Math.cos((a * Math.PI) / 180), JR_Y + r * Math.sin((a * Math.PI) / 180)]
  // bottom row spread across the width
  const XU = 89 // (legacy; referenced only by the paused animation block below)
  // internal cluster shifted right (+65): the Reserve Vault stays put at JRES,
  // so its arrow into the Warehouse shortens and everything else slides right.
  const JD = 235 // redemption door + junior safe (the spine)
  const JW = 415 // warehouse safe
  const JRES = 535 // reserve — UNCHANGED
  // dotted-blue link from the junior safe to the warehouse safe, through a hex node
  const HEXR = 12
  const lenJW = Math.hypot(JW - JD, CV2_CY - JR_Y)
  const uxJW = (JW - JD) / lenJW
  const uyJW = (CV2_CY - JR_Y) / lenJW
  // the hex sits at the midpoint of the two circle EDGES, so its dotted gaps match
  const jEdgeX = JD + JR_R * uxJW
  const jEdgeY = JR_Y + JR_R * uyJW
  const wEdgeX = JW - 38 * uxJW
  const wEdgeY = CV2_CY - 38 * uyJW
  const hmx = (jEdgeX + wEdgeX) / 2
  const hmy = (jEdgeY + wEdgeY) / 2
  const GAP = HEXR + 5
  // the Exit Gate sector's centre point (where szipUSD is burned) — the burn
  // motes fly here from the hex slots
  const [exitGX, exitGY] = polar(WH_RM, 246)
  // redeemed USDC exits along the blue ray, out past CoW's left surface: the
  // beyond-CoW segment runs through a curved baseplate (a gate concentric with
  // CoW) and on to the USDC-out mark, all on the y = JR_Y centre-line.
  const XOUT = 44 // USDC-out mark centre — pulled in so the arrow is short
  const BP_R = COW_RO + PAD // flange one PAD beyond CoW's outer edge (spacing rule)
  const bpA = polar(BP_R, 174) // short ±6° flange, curved parallel to CoW
  const bpB = polar(BP_R, 186)
  return (
    <svg
      viewBox="0 0 640 470"
      role="img"
      aria-label="Zodiac Vault Exit: szipUSD is burned at the Exit Gate while backing returns up the spine from the reserve to fund the Redemption Queue, which pays USDC out at par"
    >
      <defs>
        <marker id="cv2-a" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
          <path d="M0 0 L7 3.5 L0 7 z" className="lab-ar" />
        </marker>
        <marker id="cv2-m" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
          <path d="M0 0 L7 3.5 L0 7 z" className="lab-ar mint" />
        </marker>
        <marker id="cv2-b" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
          <path d="M0 0 L7 3.5 L0 7 z" className="lab-ar blue" />
        </marker>
      </defs>
      {/* Locked-proportion scale + centre of what remains (measured bbox, see
          EXIT_FIT). chg-flat strips the hexagon glow/fuzz so this view reads flat. */}
      <g className="chg-flat" fontFamily="var(--mono)" transform={EXIT_FIT}>
        {/* backing returns UP the spine to fund redemption: reserve -> warehouse
            -> door. The reserve is OUTSIDE the frame, so its arrow is now short. */}
        <line x1={JRES - RES_R} y1={CV2_CY} x2={JW + 38} y2={CV2_CY} className="lab-lane" markerEnd="url(#cv2-a)" />
        <line x1={JW - 38} y1={CV2_CY} x2={JD + 30} y2={CV2_CY} className="lab-lane" markerEnd="url(#cv2-a)" />
        {/* dotted authority link up to the Zodiac / Exit Gate, where the burn is */}
        <line x1={JD} y1={CV2_CY - 30} x2={JD} y2={JR_Y + JR_R} className="lab-gov" />
        <text x={JD + 9} y={hmy + 2} className="lab-rel blue">
          BURN
        </text>

        {/* redemption door (the ZipDepositModule, running in reverse) */}
        <g
          className={`chg-click${selected === 'deposit-module' ? ' sel' : ''}`}
          onClick={() => onSelect('deposit-module')}
          tabIndex={0}
          role="button"
          aria-label="Redemption, the ZipDepositModule in reverse"
        >
          <circle cx={JD} cy={CV2_CY} r="30" className="lab-world-lens" />
          <circle cx={JD} cy={CV2_CY} r="8" className="lab-core" />
          <text x={JD} y={CV2_CY + 59} textAnchor="middle" className="lab-rel">
            zipUSD REDEMPTION
          </text>
        </g>

        {/* axis ray (chainlink blue) — the Zodiac centre-line. Inside the ring
            cluster it shows only in open space (the two ring paddings). Past CoW
            it becomes the redeemed-USDC exit conduit: it runs through a curved
            baseplate (a gate concentric with CoW) out to the USDC-out mark.
            x = JD - r along 180°. */}
        <line x1={JD - JR_R} y1={JR_Y} x2={JD - WH_RI} y2={JR_Y} className="chg-ray" />
        <line x1={JD - WH_RO} y1={JR_Y} x2={JD - COW_RI} y2={JR_Y} className="chg-ray" />
        <line x1={JD - COW_RO} y1={JR_Y} x2={XOUT + 16} y2={JR_Y} className="chg-ray" markerEnd="url(#cv2-b)" />
        {/* curved baseplate (blue) — the exit gate flange, parallel to CoW's curve */}
        <path
          d={`M ${bpA[0].toFixed(2)} ${bpA[1].toFixed(2)} A ${BP_R} ${BP_R} 0 0 1 ${bpB[0].toFixed(2)} ${bpB[1].toFixed(2)}`}
          className="chg-ray"
          fill="none"
        />
        {/* redeemed USDC out — the ray's terminus (label dropped; the arrow says it) */}
        <UsdcMark cx={XOUT - 2} cy={JR_Y} r={14} />

        {/* Exit Gate — inner wheel sector, pulled in to hug the Zodiac (same
            depth as the Redemption Queue), clickable */}
        <g
          className={`chg-click${selected === 'exit-gate' ? ' sel' : ''}`}
          onClick={() => onSelect('exit-gate')}
          tabIndex={0}
          role="button"
          aria-label="Exit Gate"
        >
          <path d={annularSector(JD, JR_Y, WH_RI, WH_RO, 210 + SEAM, 270)} className="lab-world-lens" />
        </g>
        {/* CoW limit-orderbook label — to the left and slightly below the exit gate */}
        <text x={JD - 95} y={-52} textAnchor="end" className="lab-rel">
          CoW LIMIT ORDERBOOK
        </text>
        {/* Zodiac Vault — the junior-tranche Safe (Chainlink feed marks inside), clickable */}
        <g
          className={`chg-click${selected === 'safe-zodiac' ? ' sel' : ''}`}
          onClick={() => onSelect('safe-zodiac')}
          tabIndex={0}
          role="button"
          aria-label="Zodiac Vault"
        >
          <circle cx={JD} cy={JR_Y} r={JR_R} className="lab-world-lens" />
          <path
            d="M610.2,396.07l-144.11.11c-4.17,14.6-9.42,28.25-19.51,39.69-34.13,38.66-89.96,41.32-126.63,6.64-26.5-25.06-34.56-65.03-19.85-98.6,19.56-44.65,71.37-64.38,116.15-44.67l12.88,7.52c20.16,13.78,32.72,34.65,37.43,59l143.07.09c8.61,0,14.63,6.78,15.05,14.73.35,6.71-5.4,15.48-14.49,15.49Z"
            transform={`translate(${JD} ${JR_Y}) scale(${0.123 * JR_S}) translate(-380.4 -379.2)`}
            className="chg-safe"
            vectorEffect="non-scaling-stroke"
          />
          {CV2_SAFE_SLOTS.map(([ox, oy], i) => (
            <polygon key={i} points={chgHexPts(6 * JR_S)} transform={`translate(${JD + ox * JR_S} ${JR_Y + oy * JR_S})`} className="lab-hex-charge blue" opacity={0.9} />
          ))}
        </g>

        {/* CoW — outer ring over the queue's slice. The nested Redemption-Queue
            cells live INSIDE this group, so hovering CoW lights the slots it
            draws from. No label on the queue; the connection IS the hover. */}
        <g
          className={`chg-click${selected === 'cow' ? ' sel' : ''}`}
          onClick={() => onSelect('cow')}
          tabIndex={0}
          role="button"
          aria-label="CoW Protocol and its Redemption-Queue slots"
        >
          <path d={annularSector(JD, JR_Y, COW_RI, COW_RO, 150, 210)} className="lab-world-lens" />
          {/* nested Redemption Queue — one continuous band at the SAME depth as
              (and flush against) the Exit Gate, so the outer edge sweeps cleanly
              from the pieces through the gate. Divided into epoch cells by radial
              ticks; ink dots = filled rounds. */}
          <path d={annularSector(JD, JR_Y, WH_RI, WH_RO, RQ0, RQ1)} className="lab-world-lens" />
          {[1, 2, 3].map((k) => {
            const r = ((RQ0 + k * rqStep) * Math.PI) / 180
            return <line key={k} x1={(JD + WH_RI * Math.cos(r)).toFixed(2)} y1={(JR_Y + WH_RI * Math.sin(r)).toFixed(2)} x2={(JD + WH_RO * Math.cos(r)).toFixed(2)} y2={(JR_Y + WH_RO * Math.sin(r)).toFixed(2)} className="lab-seg" />
          })}
          {[0, 1, 2, 3].map((i) => {
            const r = ((RQ0 + (i + 0.5) * rqStep) * Math.PI) / 180
            return <circle key={i} cx={(JD + WH_RM * Math.cos(r)).toFixed(2)} cy={(JR_Y + WH_RM * Math.sin(r)).toFixed(2)} r="2.6" className="lab-band-edge" opacity={0.5} />
          })}
        </g>

        {/* junior safe ↔ warehouse safe: a dotted-blue link with a hexagon node
            at the edge-midpoint, equal dotted gaps on each side. The hex is the
            NAV Oracle — clickable, opens its panel. */}
        <line x1={jEdgeX} y1={jEdgeY} x2={hmx - GAP * uxJW} y2={hmy - GAP * uyJW} className="lab-gov" />
        <line x1={hmx + GAP * uxJW} y1={hmy + GAP * uyJW} x2={wEdgeX} y2={wEdgeY} className="lab-gov" />
        <g
          className={`chg-click${selected === 'nav-oracle' ? ' sel' : ''}`}
          onClick={() => onSelect('nav-oracle')}
          tabIndex={0}
          role="button"
          aria-label="NAV Oracle"
        >
          {/* transparent hit area — the hex outline is fill:none, so unclickable alone */}
          <circle cx={hmx} cy={hmy} r={HEXR + 3} fill="transparent" />
          <polygon points={chgHexPts(HEXR)} transform={`translate(${hmx} ${hmy})`} className="lab-hex-charge blue" />
          <text x={hmx + HEXR + 8} y={hmy + 2} className="lab-rel blue">
            NAV ORACLE
          </text>
        </g>

        {/* warehouse safe */}
        <g
          className={`chg-click${selected === 'warehouse' ? ' sel' : ''}`}
          onClick={() => onSelect('warehouse')}
          tabIndex={0}
          role="button"
          aria-label="The Warehouse Safe"
        >
          <circle cx={JW} cy={CV2_CY} r="38" className="lab-world-lens" />
          <path
            d="M610.2,396.07l-144.11.11c-4.17,14.6-9.42,28.25-19.51,39.69-34.13,38.66-89.96,41.32-126.63,6.64-26.5-25.06-34.56-65.03-19.85-98.6,19.56-44.65,71.37-64.38,116.15-44.67l12.88,7.52c20.16,13.78,32.72,34.65,37.43,59l143.07.09c8.61,0,14.63,6.78,15.05,14.73.35,6.71-5.4,15.48-14.49,15.49Z"
            transform={`translate(${JW} ${CV2_CY}) scale(0.123) translate(-380.4 -379.2)`}
            className="chg-safe"
            vectorEffect="non-scaling-stroke"
          />
          {CV2_SAFE_SLOTS.map(([ox, oy], i) => (
            <rect key={i} x={JW + ox - 3.5} y={CV2_CY + oy - 3.5} width="7" height="7" transform={`rotate(45 ${JW + ox} ${CV2_CY + oy})`} className="lab-share-tok" />
          ))}
          <text x={JW} y={CV2_CY + 59} textAnchor="middle" className="lab-rel">
            WAREHOUSE SAFE
          </text>
        </g>

        {/* the small USDC Reserve Vault — the source of returning backing */}
        <g
          className={`chg-click${selected === 'euler-earn' ? ' sel' : ''}`}
          onClick={() => onSelect('euler-earn')}
          tabIndex={0}
          role="button"
          aria-label="The USDC reserve"
        >
          <rect x={JRES - 16} y={CV2_CY - 16} width="32" height="32" transform={`rotate(45 ${JRES} ${CV2_CY})`} className="lab-vault-open" />
        </g>
        <text x={JRES + 3} y={CV2_CY + 59} textAnchor="middle" className="lab-rel">
          USDC RESERVE
        </text>
        <polygon points={chgHexPts(CELL)} transform={`translate(${JRES} ${CV2_CY})`} className="lab-hex-charge blue" opacity={animate ? 0.24 : 0.85} />

        {/* animated flow — one clock, five beats, running in reverse. Backing
            (USDC) returns from the reserve up the spine to the door; paired with
            each arrival, an szipUSD note leaves a hex slot and burns at the Exit
            Gate while a redeemed dollar exits the door at par. Burn ↔ payout.
            PAUSED: motion off for now (static while iterating on the layout). */}
        {false &&
          animate &&
          CV2_RK.map((p, i) => {
            const [jox, joy] = CV2_SAFE_SLOTS[i] // this beat's hex slot (szipUSD burned here)
            const hx = JD + jox * JR_S
            const hy = JR_Y + joy * JR_S
            const bk0 = 0.04 + 0.05 * i // backing leaves the reserve
            const bk1 = bk0 + 0.12 // ...reaches the warehouse
            const bk2 = bk1 + 0.02 // ...leaves the warehouse
            const bk3 = bk2 + 0.12 // ...reaches the door
            const pay0 = bk3 + 0.01 // burn + payout fire together
            const pay1 = pay0 + 0.13
            return (
              <g key={i}>
                {/* backing returns: reserve -> warehouse -> door (leftward) */}
                <ChgMote path={`M ${JRES - RES_R} ${CV2_CY} L ${JW + 38} ${CV2_CY}`} t0={bk0} t1={bk1} />
                <ChgMote path={`M ${JW - 38} ${CV2_CY} L ${JD + 30} ${CV2_CY}`} t0={bk2} t1={bk3} />
                {/* szipUSD leaves a hex slot, rides to the Exit Gate, and burns */}
                <ChgMote path={`M ${hx.toFixed(2)} ${hy.toFixed(2)} L ${exitGX.toFixed(2)} ${exitGY.toFixed(2)}`} t0={pay0} t1={pay1} kind="note" r={2.4} />
                <ChgFlash x={exitGX} y={exitGY} at={pay1} blue />
                {/* paired: a redeemed dollar exits the door to the holder (leftward) */}
                <ChgFlash x={JD} y={CV2_CY} at={pay0} />
                <ChgMote path={`M ${JD - 30} ${CV2_CY} L ${XU + 16} ${CV2_CY}`} t0={pay0} t1={pay1} ease="out" />
              </g>
            )
          })}
      </g>
    </svg>
  )
}

/** ids lit by hovering/selecting a foundation primitive */
function dependentsOf(primitiveId: string): Set<string> {
  const s = new Set<string>([primitiveId])
  for (const n of Object.values(NODES)) {
    if (n.eulerPrimitive?.id === primitiveId) s.add(n.id)
  }
  return s
}

export function ProtocolMap() {
  const [view, setView] = useState<'machine' | 'chargev2' | 'creditvault' | 'systemmap' | 'juniorsafe' | 'juniorexit'>('systemmap')
  const [selected, setSelected] = useState<string | null>(null)
  const [activeFlow, setActiveFlow] = useState<string | null>(null)
  const [hoverPrim, setHoverPrim] = useState<string | null>(null)
  // animations disabled across all views
  const animate = false

  // deep links: /map?node=<id> opens a panel, /map?flow=<id> runs a flow
  // (a flow or an explicit ?view=machine opens the full machine)
  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    const node = q.get('node')
    const f = q.get('flow')
    if (node && NODES[node]) setSelected(node)
    if (f && FLOWS.some((x) => x.id === f)) {
      setActiveFlow(f)
      setView('machine')
    }
    if (q.get('view') === 'machine') setView('machine')
    if (q.get('view') === 'chargev2') setView('chargev2')
    if (q.get('view') === 'creditvault') setView('creditvault')
    if (q.get('view') === 'systemmap') setView('systemmap')
    if (q.get('view') === 'juniorsafe') setView('juniorsafe')
    if (q.get('view') === 'juniorexit') setView('juniorexit')
    if (node && !SPINE_IDS.has(node)) setView('machine')
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const flow = FLOWS.find((f) => f.id === activeFlow) ?? null

  const lit = useMemo(() => {
    if (flow) return new Set(flow.path)
    if (hoverPrim) return dependentsOf(hoverPrim)
    return null
  }, [flow, hoverPrim])

  // stands-on ties, derived from content
  const ties = useMemo(
    () =>
      Object.values(NODES)
        .filter((n) => n.eulerPrimitive && GEOM[n.id] && GEOM[n.eulerPrimitive.id])
        .map((n) => ({ from: n.id, to: n.eulerPrimitive!.id })),
    [],
  )

  // the active flow's particle track: concatenated elbows along its node path
  const flowTrack = useMemo(() => {
    if (!flow) return null
    let d = ''
    for (let i = 0; i < flow.path.length - 1; i++) {
      const seg = segmentPath(flow.path[i], flow.path[i + 1])
      if (seg) d += seg + ' '
    }
    return d.trim() || null
  }, [flow])

  const sel = selected ? NODES[selected] : null

  // The panel content lags the selection on close so it stays mounted while the
  // grid track collapses — the panel slides out with it instead of popping.
  const [panelKey, setPanelKey] = useState<string | null>(selected)
  useEffect(() => {
    if (selected) {
      setPanelKey(selected)
      return
    }
    const t = setTimeout(() => setPanelKey(null), 340)
    return () => clearTimeout(t)
  }, [selected])
  const panelSel = panelKey ? NODES[panelKey] : null

  return (
    <div className={`map-shell${sel ? ' panel-open' : ''}`}>
      <div className="map-flows">
        <div className="map-views" role="tablist" aria-label="View">
          <button
            role="tab"
            aria-selected={view === 'systemmap'}
            className={`map-flow-pill map-view-pill${view === 'systemmap' ? ' on' : ''}`}
            onClick={() => setView('systemmap')}
          >
            SYSTEM MAP
          </button>
          <button
            role="tab"
            aria-selected={view === 'chargev2'}
            className={`map-flow-pill map-view-pill${view === 'chargev2' ? ' on' : ''}`}
            onClick={() => setView('chargev2')}
          >
            CREDIT WAREHOUSE
          </button>
          <button
            role="tab"
            aria-selected={view === 'creditvault'}
            className={`map-flow-pill map-view-pill${view === 'creditvault' ? ' on' : ''}`}
            onClick={() => setView('creditvault')}
          >
            CREDIT VAULT
          </button>
          <button
            role="tab"
            aria-selected={view === 'juniorsafe'}
            className={`map-flow-pill map-view-pill${view === 'juniorsafe' ? ' on' : ''}`}
            onClick={() => setView('juniorsafe')}
          >
            ZODIAC VAULT | YIELD
          </button>
          <button
            role="tab"
            aria-selected={view === 'juniorexit'}
            className={`map-flow-pill map-view-pill${view === 'juniorexit' ? ' on' : ''}`}
            onClick={() => setView('juniorexit')}
          >
            ZODIAC VAULT | EXIT
          </button>
        </div>
        {view === 'machine' && (
          <>
            <span className="map-flows-label">Follow the money —</span>
            {FLOWS.map((f) => (
              <button
                key={f.id}
                role="tab"
                aria-selected={activeFlow === f.id}
                className={`map-flow-pill${activeFlow === f.id ? ' on' : ''} k-${f.kind}`}
                onClick={() => setActiveFlow(activeFlow === f.id ? null : f.id)}
              >
                {f.title}
              </button>
            ))}
          </>
        )}
      </div>
      {view === 'machine' && flow && <p className="map-flow-blurb">{flow.blurb}</p>}

      {view === 'chargev2' && (
        <div className="map-canvas chg-canvas">
          <ChargeV2View animate={animate} selected={selected} onSelect={(id) => setSelected(selected === id ? null : id)} />
        </div>
      )}

      {view === 'creditvault' && (
        <div className="map-canvas chg-canvas">
          <CreditVaultView animate={animate} selected={selected} onSelect={(id) => setSelected(selected === id ? null : id)} />
        </div>
      )}

      {view === 'systemmap' && (
        <div className="map-canvas chg-canvas">
          <SystemMapView animate={animate} selected={selected} onSelect={(id) => setSelected(selected === id ? null : id)} />
        </div>
      )}

      {view === 'juniorsafe' && (
        <div className="map-canvas chg-canvas">
          <JuniorSafeView animate={animate} selected={selected} onSelect={(id) => setSelected(selected === id ? null : id)} />
        </div>
      )}

      {view === 'juniorexit' && (
        <div className="map-canvas chg-canvas">
          <JuniorExitView animate={animate} selected={selected} onSelect={(id) => setSelected(selected === id ? null : id)} />
        </div>
      )}

      {view === 'machine' && (
      <div className="map-canvas machine-canvas">
        <svg
          viewBox={`0 0 ${CANVAS.w} ${CANVAS.h}`}
          role="img"
          aria-label="Interactive schematic of the Zipcode protocol: actors, the senior and junior machines, the external trust rail, and the Euler primitives underneath"
        >
          <defs>
            <marker id="map-ar" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
              <path d="M0 0 L7 3.5 L0 7 z" className="map-ar" />
            </marker>
            <marker id="map-ar-lit" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
              <path d="M0 0 L7 3.5 L0 7 z" className="map-ar-lit" />
            </marker>
            {/* the landing's plus-grid ground, as an SVG pattern */}
            <pattern id="map-grid" width="54" height="54" patternUnits="userSpaceOnUse">
              <g className="map-grid-glyph" strokeWidth="1.2" strokeLinecap="round">
                <line x1="27" y1="22" x2="27" y2="32" />
                <line x1="22" y1="27" x2="32" y2="27" />
              </g>
            </pattern>
            {/* mint halos, matching the landing's #logo-glow pair */}
            <filter id="map-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodOpacity="0.5" style={{ floodColor: 'var(--mint)' }} />
            </filter>
            <filter id="map-glow-hover" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodOpacity="0.9" style={{ floodColor: 'var(--mint-bright)' }} />
            </filter>
            <filter id="map-particle-glow" x="-150%" y="-150%" width="400%" height="400%">
              <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodOpacity="0.9" style={{ floodColor: 'var(--mint-bright)' }} />
            </filter>
            {/* Bael seal (public domain — Goetia), luminance-masked as on the landing */}
            <mask id="map-baal" maskUnits="userSpaceOnUse" x="210" y="617" width="30" height="30">
              <image href="/baal-mask.png" x="210" y="617" width="30" height="30" />
            </mask>
          </defs>

          {/* the drafting ground: plus-grid + corner registration ticks */}
          <rect x="0" y="0" width={CANVAS.w} height={CANVAS.h} fill="url(#map-grid)" />
          <g className="map-reg" strokeWidth="1.2">
            <path d={`M 10 26 L 10 10 L 26 10`} />
            <path d={`M ${CANVAS.w - 26} 10 L ${CANVAS.w - 10} 10 L ${CANVAS.w - 10} 26`} />
            <path d={`M 10 ${CANVAS.h - 26} L 10 ${CANVAS.h - 10} L 26 ${CANVAS.h - 10}`} />
            <path d={`M ${CANVAS.w - 26} ${CANVAS.h - 10} L ${CANVAS.w - 10} ${CANVAS.h - 10} L ${CANVAS.w - 10} ${CANVAS.h - 26}`} />
          </g>

          {/* the title block, top-right — engineering-plate furniture */}
          <g className="map-titleblock" fontFamily="var(--mono)">
            <rect x="1120" y="22" width="310" height="50" />
            <line x1="1120" y1="39" x2="1430" y2="39" />
            <line x1="1120" y1="55" x2="1430" y2="55" />
            <text x="1130" y="34">FIG. 02 — THE MACHINE</text>
            <text x="1130" y="50">ZIPCODE PROTOCOL · BASE 8453</text>
            <text x="1130" y="66">SOLIDITY 0.8.24 · REV A · 2026</text>
          </g>

          {/* band furniture */}
          <g className="map-bands" fontFamily="var(--mono)">
            <rect x="40" y="700" width={CANVAS.w - 80} height="118" className="map-foundation-band" />
            <text x="60" y="716" className="map-band-label">
              THE EULER STACK — THE PRIMITIVES ZIPCODE STANDS ON
            </text>
            <g className="mark" filter="url(#map-glow)">
              <rect x="1290" y="700" width="130" height="20" fill="transparent" stroke="none" />
              <EulerMark x={1310} y={702} width={100} height={24.8} />
            </g>
            <text x="55" y="596" className="map-band-label">
              EXTERNAL TRUST
            </text>
          </g>

          {/* stands-on ties (under everything) */}
          <g className="map-ties">
            {ties.map((t) => {
              const [d] = route(GEOM[t.from], GEOM[t.to])
              const on =
                hoverPrim === t.to || selected === t.from || selected === t.to
              return <path key={`${t.from}-${t.to}`} d={d} className={`map-tie${on ? ' lit' : ''}`} />
            })}
          </g>

          {/* seams */}
          <g className="map-edges">
            {EDGES.map((e) => {
              const a = GEOM[e.from]
              const b = GEOM[e.to]
              if (!a || !b) return null
              const [autoD, autoLx, autoLy] = route(a, b)
              const d = e.d ?? autoD
              const lx = e.lx ?? autoLx
              const ly = e.ly ?? autoLy
              const onFlow =
                flow &&
                flow.path.some(
                  (id, i) =>
                    i < flow.path.length - 1 &&
                    ((id === e.from && flow.path[i + 1] === e.to) ||
                      (id === e.to && flow.path[i + 1] === e.from)),
                )
              return (
                <g key={`${e.from}-${e.to}`} className={onFlow ? 'lit' : flow ? 'dim' : ''}>
                  <path
                    d={d}
                    className="map-edge"
                    markerEnd={onFlow ? 'url(#map-ar-lit)' : 'url(#map-ar)'}
                  />
                  {e.label && (
                    <text x={lx} y={ly} className="map-edge-label">
                      {e.label}
                    </text>
                  )}
                </g>
              )
            })}
          </g>

          {/* the particle run for the active flow */}
          {flowTrack && animate && (
            <g className="map-particles" filter="url(#map-particle-glow)">
              {[0, 1, 2].map((i) => (
                <g key={i}>
                  {/* comet: lead + two trailing embers on the same track */}
                  <circle r="4.5" className="map-particle">
                    <animateMotion dur="7s" begin={`${-i * 2.3}s`} repeatCount="indefinite" path={flowTrack} />
                  </circle>
                  <circle r="2.6" className="map-particle map-ember">
                    <animateMotion dur="7s" begin={`${-i * 2.3 + 0.16}s`} repeatCount="indefinite" path={flowTrack} />
                  </circle>
                  <circle r="1.5" className="map-particle map-ember2">
                    <animateMotion dur="7s" begin={`${-i * 2.3 + 0.3}s`} repeatCount="indefinite" path={flowTrack} />
                  </circle>
                </g>
              ))}
            </g>
          )}

          {/* nodes */}
          <g fontFamily="var(--mono)">
            {Object.entries(GEOM).map(([id, g]) => {
              const n = NODES[id]
              const kind = n?.kind ?? 'contract'
              const dimmed = lit ? !lit.has(id) : false
              const isSel = selected === id
              return (
                <g
                  key={id}
                  className={`map-node k-${kind} s-${n?.stratum ?? 'zipcode'}${
                    dimmed ? ' dim' : ''
                  }${isSel ? ' sel' : ''}${EXPRESSED.has(id) ? ' expressed' : ''}`}
                  onClick={() => setSelected(isSel ? null : id)}
                  onMouseEnter={kind === 'primitive' ? () => setHoverPrim(id) : undefined}
                  onMouseLeave={kind === 'primitive' ? () => setHoverPrim(null) : undefined}
                  tabIndex={0}
                  role="button"
                  aria-label={n?.title ?? id}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setSelected(isSel ? null : id)
                    }
                  }}
                >
                  <rect x={g.x} y={g.y} width={g.w} height={g.h} rx="2" className="map-box" />
                  {/* sigil stubs carry their marks, landing-style */}
                  {id === 'safe-zodiac' && (
                    <g className="map-sigil" filter="url(#map-glow)">
                      <ZodiacBadge x={g.x + 10} y={g.y + 8} size={32} />
                    </g>
                  )}
                  {id === 'baal' && (
                    <g className="map-sigil" filter="url(#map-glow)">
                      <rect x="210" y="617" width="30" height="30" mask="url(#map-baal)" className="map-seal" />
                    </g>
                  )}
                  {id === 'bittensor-bridge' && (
                    <g className="map-sigil" filter="url(#map-glow)">
                      <BittensorMark x={g.x + 12} y={g.y + 14} width={28} height={20} />
                    </g>
                  )}
                  {SIGILED.has(id) ? (
                    <text x={g.x + 50} y={g.y + g.h / 2 + 4} className="map-title">
                      {n?.title ?? id}
                    </text>
                  ) : kind === 'engine' ? (
                    <>
                      <text x={cx(g)} y={g.y + 18} className="map-title" textAnchor="middle">
                        {n?.title ?? id}
                      </text>
                      <text x={cx(g)} y={g.y + 32} className="map-tagline" textAnchor="middle">
                        {n?.tagline}
                      </text>
                      {/* the nine keeper modules, as machinery */}
                      {ENGINE_CELLS.map((label, i) => {
                        const gx = g.x + 9 + (i % 3) * 76
                        const gy = g.y + 46 + Math.floor(i / 3) * 26
                        return (
                          <g key={label} className="map-cell">
                            <rect x={gx} y={gy} width={70} height={20} rx="1" />
                            <text x={gx + 35} y={gy + 13} textAnchor="middle">
                              {label}
                            </text>
                          </g>
                        )
                      })}
                    </>
                  ) : (
                    <>
                      <text
                        x={cx(g)}
                        y={g.y + (n?.tagline && kind !== 'neighborhood' ? g.h / 2 - 4 : g.h / 2 + 4)}
                        className="map-title"
                        textAnchor="middle"
                      >
                        {n?.title ?? id}
                      </text>
                      {n?.tagline && kind !== 'neighborhood' && (
                        <text x={cx(g)} y={g.y + g.h / 2 + 14} className="map-tagline" textAnchor="middle">
                          {n.tagline}
                        </text>
                      )}
                    </>
                  )}
                </g>
              )
            })}
          </g>
        </svg>
      </div>
      )}

      {/* detail panel */}
      {panelSel && (
        <aside className="map-panel" aria-label={`${panelSel.title} details`}>
          <button className="map-panel-close" onClick={() => setSelected(null)} aria-label="Close">
            ×
          </button>
          <span className="map-panel-eyebrow">
            {panelSel.stratum === 'euler'
              ? 'Euler primitive'
              : panelSel.stratum === 'external'
                ? 'External trust'
                : panelSel.kind === 'actor'
                  ? 'Actor'
                  : 'Zipcode contract'}
          </span>
          <h2>{panelSel.title}</h2>
          <p className="map-panel-tagline">{panelSel.tagline}</p>
          <p className="map-panel-summary">{panelSel.summary}</p>

          {panelSel.docLink && (
            <a
              className="map-panel-doclink"
              href={panelSel.docLink.url}
              target="_blank"
              rel="noreferrer"
            >
              {panelSel.docLink.label} ↗
            </a>
          )}

          {panelSel.eulerPrimitive && NODES[panelSel.eulerPrimitive.id] && !panelSel.builtOn && (
            <div className="map-panel-primitive">
              <span>Stands on</span>
              <button onClick={() => setSelected(panelSel.eulerPrimitive!.id)}>
                {NODES[panelSel.eulerPrimitive.id].title}
              </button>
              <p>{panelSel.eulerPrimitive.how}</p>
            </div>
          )}

          {panelSel.members && panelSel.members.length > 0 && (
            <div className="map-panel-members">
              <span className="map-panel-sub">Inside</span>
              <ul>
                {panelSel.members.map((m) => (
                  <li key={m.name}>
                    {m.url ? (
                      <a href={m.url} target="_blank" rel="noreferrer">
                        {m.name}
                      </a>
                    ) : (
                      <b>{m.name}</b>
                    )}{' '}
                    — {m.blurb}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {panelSel.code && (
            <div className="map-panel-code">
              <div className="map-panel-code-head">
                <span>{panelSel.code.path}</span>
              </div>
              <pre>
                <code>{panelSel.code.excerpt}</code>
              </pre>
            </div>
          )}

          {panelSel.sources && panelSel.sources.length > 0 && (
            <div className="map-panel-linkgroup">
              <span className="map-panel-sub">Source contracts</span>
              <div className="map-panel-links">
                {panelSel.sources.map((l) => (
                  <a key={l.url} href={l.url} target="_blank" rel="noreferrer">
                    {l.label} ↗
                  </a>
                ))}
              </div>
            </div>
          )}

          {panelSel.builtOn && panelSel.builtOn.length > 0 && (
            <div className="map-panel-linkgroup">
              <span className="map-panel-sub">Built on</span>
              <div className="map-panel-links">
                {panelSel.builtOn.map((l) => (
                  <a key={l.url} href={l.url} target="_blank" rel="noreferrer">
                    {l.label} ↗
                  </a>
                ))}
              </div>
            </div>
          )}

          {panelSel.links.length > 0 && (
            <div className="map-panel-links">
              {panelSel.links.map((l) => (
                <a key={l.url} href={l.url} target="_blank" rel="noreferrer">
                  {l.label} ↗
                </a>
              ))}
            </div>
          )}
        </aside>
      )}
    </div>
  )
}
