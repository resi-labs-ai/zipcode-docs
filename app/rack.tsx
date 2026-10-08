// Hero figure — a server rack carrying two HGX B300 nodes, drawn as a brand
// schematic (ink hairlines, paper panels, mint for anything "live"). Colors
// ride the .zc-landing CSS tokens via inline style so the whole drawing
// re-themes with the page (SVG presentation attributes don't resolve var()).
//
// Geometry: a 240-wide rack, 10U-ish of visible height. Two tall HGX trays
// (8 GPU bays each) sit between a top-of-rack switch pair and a PDU, with a
// fan wall drawn on each tray's right third. Everything is derived from the
// constants below so the drawing stays on its own grid.

const RACK_X = 70
const RACK_W = 240
const RACK_Y = 12
const RACK_H = 396
const RAIL = 14 // rail width either side
const INNER_X = RACK_X + RAIL
const INNER_W = RACK_W - RAIL * 2
const U = 17 // one rack unit, px

const ink = { stroke: 'var(--ink)' }
const panel = { fill: 'var(--panel)', stroke: 'var(--ink)' }
const faint = { fill: 'var(--faint)' }
const mint = { fill: 'var(--mint)' }

function Rails() {
  // Perforated mounting rails: a dot every U on both sides.
  const dots = []
  for (let i = 0; i < RACK_H / U; i++) {
    const cy = RACK_Y + U * i + U / 2
    dots.push(
      <circle key={`l${i}`} cx={RACK_X + RAIL / 2} cy={cy} r={1.4} style={faint} />,
      <circle key={`r${i}`} cx={RACK_X + RACK_W - RAIL / 2} cy={cy} r={1.4} style={faint} />,
    )
  }
  return <g>{dots}</g>
}

function Switch({ y }: { y: number }) {
  // 1U top-of-rack switch: a row of 24 ports, a mint link light on the first few.
  const ports = []
  const px = INNER_X + 10
  for (let i = 0; i < 24; i++) {
    ports.push(
      <rect
        key={i}
        x={px + i * 7}
        y={y + 5}
        width={5}
        height={7}
        style={i < 6 ? mint : faint}
        opacity={i < 6 ? 1 : 0.35}
      />,
    )
  }
  return (
    <g>
      <rect x={INNER_X} y={y} width={INNER_W} height={U} style={panel} />
      {ports}
      <circle cx={INNER_X + INNER_W - 10} cy={y + U / 2} r={1.8} style={{ fill: 'var(--live)' }} />
    </g>
  )
}

function Hgx({ y, label }: { y: number; label: string }) {
  // 8U tray: 8 GPU bays (2 rows × 4) on the left two-thirds, a fan wall on the right.
  const h = U * 8
  const bayW = 30
  const bayH = 46
  const gap = 6
  const bx0 = INNER_X + 12
  const by0 = y + 14
  const bays = []
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 4; c++) {
      const bx = bx0 + c * (bayW + gap)
      const by = by0 + r * (bayH + gap)
      bays.push(
        <g key={`${r}${c}`}>
          <rect x={bx} y={by} width={bayW} height={bayH} style={panel} />
          {/* heatsink fins */}
          {[0, 1, 2, 3, 4].map((f) => (
            <line
              key={f}
              x1={bx + 5}
              x2={bx + bayW - 5}
              y1={by + 9 + f * 7}
              y2={by + 9 + f * 7}
              strokeWidth={1}
              style={ink}
              opacity={0.45}
            />
          ))}
          <circle cx={bx + bayW - 5} cy={by + 5} r={1.5} style={{ fill: 'var(--live)' }} />
        </g>,
      )
    }
  }
  // fan wall: 2 × 2 fans on the right third
  const fx0 = bx0 + 4 * (bayW + gap) + 6
  const fans = []
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 2; c++) {
      const cx = fx0 + 14 + c * 30
      const cy = by0 + 23 + r * (bayH + gap)
      fans.push(
        <g key={`f${r}${c}`}>
          <circle cx={cx} cy={cy} r={12} style={panel} />
          <circle cx={cx} cy={cy} r={2} style={{ fill: 'var(--ink)' }} />
          {[0, 60, 120].map((a) => (
            <line
              key={a}
              x1={cx - 10}
              x2={cx + 10}
              y1={cy}
              y2={cy}
              transform={`rotate(${a} ${cx} ${cy})`}
              strokeWidth={1}
              style={ink}
              opacity={0.5}
            />
          ))}
        </g>,
      )
    }
  }
  return (
    <g>
      <rect x={INNER_X} y={y} width={INNER_W} height={h} style={{ fill: 'var(--mint-wash)', stroke: 'var(--ink)' }} />
      {bays}
      {fans}
      <text
        x={INNER_X + 12}
        y={y + h - 9}
        fontSize="8"
        letterSpacing="0.14em"
        fontFamily="ui-monospace,Menlo,monospace"
        style={{ fill: 'var(--mint-ink)' }}
      >
        {label}
      </text>
    </g>
  )
}

function Pdu({ y }: { y: number }) {
  // 2U power shelf: four PSU slots, handles drawn as short bars.
  const slots = []
  const sw = (INNER_W - 10 * 2 - 6 * 3) / 4
  for (let i = 0; i < 4; i++) {
    const sx = INNER_X + 10 + i * (sw + 6)
    slots.push(
      <g key={i}>
        <rect x={sx} y={y + 6} width={sw} height={U * 2 - 12} style={panel} />
        <rect x={sx + 6} y={y + U - 1.5} width={sw - 12} height={3} style={faint} opacity={0.5} />
        <circle cx={sx + sw - 6} cy={y + 11} r={1.6} style={{ fill: 'var(--live)' }} />
      </g>,
    )
  }
  return (
    <g>
      <rect x={INNER_X} y={y} width={INNER_W} height={U * 2} style={panel} />
      {slots}
    </g>
  )
}

export function Rack() {
  const sw1 = RACK_Y + U * 0.5
  const sw2 = sw1 + U + 4
  const hgx1 = sw2 + U + 10
  const hgx2 = hgx1 + U * 8 + 10
  const pdu = hgx2 + U * 8 + 10
  return (
    <svg
      viewBox="0 0 380 420"
      role="img"
      aria-label="Schematic: a server rack holding two HGX B300 nodes, each with eight GPUs, between a top-of-rack switch pair and a power shelf"
    >
      <g>
        {/* rack cabinet */}
        <rect x={RACK_X} y={RACK_Y} width={RACK_W} height={RACK_H} style={{ fill: 'var(--paper)', stroke: 'var(--ink)' }} />
        <rect x={RACK_X} y={RACK_Y} width={RAIL} height={RACK_H} style={panel} />
        <rect x={RACK_X + RACK_W - RAIL} y={RACK_Y} width={RAIL} height={RACK_H} style={panel} />
        <Rails />
        <Switch y={sw1} />
        <Switch y={sw2} />
        <Hgx y={hgx1} label="HGX B300 · 8 GPU · 2.3 TB" />
        <Hgx y={hgx2} label="HGX B300 · 8 GPU · 2.3 TB" />
        <Pdu y={pdu} />

        {/* side callouts — mono labels pointing at the trays, the brand's "Add Window" device */}
        <g fontFamily="ui-monospace,Menlo,monospace" fontSize="8.5" letterSpacing="0.12em">
          <line x1={RACK_X + RACK_W} y1={hgx1 + 30} x2={RACK_X + RACK_W + 22} y2={hgx1 + 30} strokeWidth={1} style={ink} />
          <text x={RACK_X + RACK_W + 26} y={hgx1 + 33} style={{ fill: 'var(--muted)' }}>
            NODE 01
          </text>
          <line x1={RACK_X + RACK_W} y1={hgx2 + 30} x2={RACK_X + RACK_W + 22} y2={hgx2 + 30} strokeWidth={1} style={ink} />
          <text x={RACK_X + RACK_W + 26} y={hgx2 + 33} style={{ fill: 'var(--muted)' }}>
            NODE 02
          </text>
          <line x1={RACK_X} y1={pdu + U} x2={RACK_X - 22} y2={pdu + U} strokeWidth={1} style={ink} />
          <text x={RACK_X - 26} y={pdu + U + 3} textAnchor="end" style={{ fill: 'var(--muted)' }}>
            PDU
          </text>
          <line x1={RACK_X} y1={sw1 + U} x2={RACK_X - 22} y2={sw1 + U} strokeWidth={1} style={ink} />
          <text x={RACK_X - 26} y={sw1 + U + 3} textAnchor="end" style={{ fill: 'var(--muted)' }}>
            TOR
          </text>
        </g>
      </g>
    </svg>
  )
}
