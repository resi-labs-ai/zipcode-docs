import type { EdgeGeom, NodeGeom } from './map-types'

// Hand-placed schematic geometry (viewBox coordinates). Bands, top to bottom:
// actors · the working machine (senior column / credit-line cluster / junior
// column, with the external venue stack on the right rail) · governance stubs ·
// the Euler foundation strip. "Stands-on" ties are NOT listed here — they are
// derived from each content node's `eulerPrimitive.id`, so adding a mapping in
// content draws the tie.
//
// Reserved corridors (keep clear when moving boxes):
//   y=104   the deposit-zap highway across the top
//   x=350   senior column → foundation
//   x=385   warehouse → EulerEarn drop
//   y=690   the east–west run above the foundation strip
//   x=990   nav-oracle → exit-gate return
//   x=1264  chainlink-cre → engine tick

export const CANVAS = { w: 1440, h: 840 }

export const GEOM: Record<string, NodeGeom> = {
  // actors
  lender: { x: 70, y: 24, w: 220, h: 46 },
  originator: { x: 400, y: 24, w: 240, h: 46 },

  // senior supply column
  'deposit-module': { x: 70, y: 130, w: 230, h: 64 },
  warehouse: { x: 70, y: 254, w: 230, h: 72 },
  'redemption-queue': { x: 70, y: 386, w: 230, h: 64 },
  federation: { x: 70, y: 506, w: 230, h: 56 },

  // credit-line cluster
  controller: { x: 400, y: 130, w: 240, h: 64 },
  'venue-adapter': { x: 400, y: 254, w: 240, h: 64 },
  'line-account': { x: 400, y: 378, w: 240, h: 64 },
  'oracle-registry': { x: 700, y: 130, w: 210, h: 64 },
  'lien-token': { x: 700, y: 254, w: 210, h: 64 },
  'cre-gating-hook': { x: 700, y: 378, w: 210, h: 64 },
  loss: { x: 700, y: 506, w: 210, h: 56 },

  // junior column
  'exit-gate': { x: 1010, y: 130, w: 240, h: 64 },
  engine: { x: 1010, y: 254, w: 240, h: 132 },
  'nav-oracle': { x: 1010, y: 440, w: 240, h: 64 },

  // external venue stack (right rail)
  hydrex: { x: 1280, y: 254, w: 150, h: 48 },
  'algebra-ichi': { x: 1280, y: 316, w: 150, h: 48 },
  cow: { x: 1280, y: 378, w: 150, h: 48 },
  'bittensor-bridge': { x: 1280, y: 460, w: 150, h: 48 },
  'chainlink-cre': { x: 1280, y: 522, w: 150, h: 48 },

  // governance stubs (bottom left)
  'safe-zodiac': { x: 45, y: 608, w: 140, h: 48 },
  baal: { x: 200, y: 608, w: 140, h: 48 },

  // the Euler foundation strip (euler-earn sits left of evk so the
  // warehouse and borrow drops reach their targets without crossing)
  evc: { x: 60, y: 726, w: 195, h: 76 },
  'euler-earn': { x: 283, y: 726, w: 195, h: 76 },
  evk: { x: 506, y: 726, w: 195, h: 76 },
  'euler-oracles': { x: 729, y: 726, w: 195, h: 76 },
  'euler-hooks': { x: 952, y: 726, w: 195, h: 76 },
  eulerswap: { x: 1175, y: 726, w: 195, h: 76 },
}

// Money / call seams. Explicit `d` paths follow the reserved corridors above.
export const EDGES: EdgeGeom[] = [
  // senior supply
  { from: 'lender', to: 'deposit-module', kind: 'flow', label: 'USDC' },
  { from: 'deposit-module', to: 'warehouse', kind: 'flow', label: 'mint zipUSD' },
  {
    from: 'warehouse',
    to: 'euler-earn',
    kind: 'flow',
    label: 'senior backing',
    d: 'M 300 290 L 350 290 L 350 690 L 380 690 L 380 726',
    lx: 358,
    ly: 480,
  },
  { from: 'warehouse', to: 'redemption-queue', kind: 'flow', label: 'par exit' },
  {
    from: 'engine',
    to: 'redemption-queue',
    kind: 'flow',
    label: 'off-ramp',
    d: 'M 1010 350 L 970 350 L 970 470 L 310 470 L 310 418 L 300 418',
    lx: 660,
    ly: 464,
  },

  // the junior zap highway
  {
    from: 'deposit-module',
    to: 'exit-gate',
    kind: 'flow',
    label: 'junior zap',
    d: 'M 185 130 L 185 104 L 1130 104 L 1130 130',
    lx: 660,
    ly: 98,
  },

  // the credit line
  { from: 'originator', to: 'controller', kind: 'flow', label: 'draw' },
  { from: 'controller', to: 'venue-adapter', kind: 'flow' },
  { from: 'venue-adapter', to: 'line-account', kind: 'flow' },
  { from: 'lien-token', to: 'line-account', kind: 'flow', label: 'collateral' },
  { from: 'oracle-registry', to: 'lien-token', kind: 'flow', label: 'prices' },
  { from: 'cre-gating-hook', to: 'line-account', kind: 'flow', label: 'gates' },
  {
    from: 'line-account',
    to: 'evk',
    kind: 'flow',
    label: 'borrow',
    d: 'M 520 442 L 520 676 L 603 676 L 603 726',
    lx: 532,
    ly: 560,
  },

  // junior
  { from: 'exit-gate', to: 'engine', kind: 'flow', label: 'basket' },
  { from: 'engine', to: 'hydrex', kind: 'flow' },
  { from: 'engine', to: 'algebra-ichi', kind: 'flow' },
  { from: 'engine', to: 'cow', kind: 'flow', label: 'buy-burn' },
  { from: 'engine', to: 'nav-oracle', kind: 'flow', label: 'marks' },
  {
    from: 'nav-oracle',
    to: 'exit-gate',
    kind: 'flow',
    label: 'NAV/share',
    d: 'M 1010 472 L 990 472 L 990 162 L 1010 162',
    lx: 962,
    ly: 310,
  },
  {
    from: 'chainlink-cre',
    to: 'engine',
    kind: 'flow',
    label: 'tick',
    d: 'M 1280 546 L 1264 546 L 1264 320 L 1250 320',
    lx: 1264,
    ly: 430,
  },
]
