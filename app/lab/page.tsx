import type { Metadata } from 'next'
import '../landing.css'
import './lab.css'
import '../map/map.css'
import { Logo } from '../logo'
import { ThemeToggle } from '../theme-toggle'

export const metadata: Metadata = {
  title: 'Lab — System Map seed',
  description: 'The /map System Map ported in as a static seed. Four identical canvases, ready to place a couple things and diverge.',
  robots: { index: false },
}

// ——— helpers, copied from the map so this seed is self-contained ———
const SQRT2 = 1.41421
const CV2_SAFE_SLOTS: [number, number][] = [
  [-12.2, -21.15],
  [12.2, -21.15],
  [12.2, 21.15],
  [-12.2, 21.15],
  [-24.4, 0],
]

function chgHexPts(r: number) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2
    return `${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a)).toFixed(2)}`
  }).join(' ')
}

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

function UsdcMark({ cx, cy, r = 24 }: { cx: number; cy: number; r?: number }) {
  const k = r / 14.5
  return (
    <g transform={`translate(${cx} ${cy}) scale(${k}) translate(-16 -16)`} className="chg-usdc" strokeWidth={1.4 / k} aria-hidden="true">
      <circle cx="16" cy="16" r="14.5" />
      <path d="M12.5,18.5v0.22c0,1.26,1.02,2.28,2.28,2.28h2.44c1.26,0,2.28-1.02,2.28-2.28l0,0c0-1.02-0.67-1.91-1.65-2.19l-3.69-1.05c-0.98-0.28-1.65-1.17-1.65-2.19l0,0c0-1.26,1.02-2.28,2.28-2.28h2.44c1.26,0,2.28,1.02,2.28,2.28v0.22" />
      <line x1="16" x2="16" y1="23" y2="21" />
      <line x1="16" x2="16" y1="11" y2="9" />
      <path d="M12.5,6.11c-4.08,1.44-7,5.32-7,9.89s2.92,8.45,7,9.89" />
      <path d="M19.5,25.89c4.08-1.44,7-5.32,7-9.89s-2.92-8.45-7-9.89" />
    </g>
  )
}

// ——— the seed: a static copy of /map's System Map (no animation). Each tile
// passes a different `overlay` — the couple things we're iterating on. ———
function SystemSeed({ overlay }: { overlay?: React.ReactNode }) {
  const CY = 250
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
  const farmTopY = CY - RES_DIAG
  const farmBotY = FARMY + FARM_DIAG
  const farmGateY = FARMY + 36
  const reserveRimX = RX - RES_DIAG
  const CELLS: [number, number][] = [
    [RX - 20, CY - 18],
    [RX + 20, CY - 18],
    [RX + 20, CY + 18],
    [RX - 20, CY + 18],
  ]
  const linePath = (y: number) => (y === CY ? `M ${fanStart} ${CY} L ${fanEndX} ${CY}` : `M ${fanStart} ${CY} C ${fanStart + 60} ${CY} ${fanStart + 70} ${y} ${fanEndX} ${y}`)
  // ── junior yield cluster (Hydrex LP · Vault Strategist · NAV Oracle) ──
  const HEXR = 10
  const FARM_EDGE = FARM_DIAG
  const vRimX = DEP + JRR
  const fEdgeX = RX - FARM_EDGE
  const vsX = (DEP + RX) / 2
  const vsY = JRY
  const lpX = (DEP + RX) / 2
  const lpY = 34
  const lpR = 17
  const vLpLen = Math.hypot(lpX - DEP, lpY - JRY)
  const vLpUx = (lpX - DEP) / vLpLen
  const vLpUy = (lpY - JRY) / vLpLen
  const fLpLen = Math.hypot(lpX - RX, lpY - FARMY)
  const fLpUx = (lpX - RX) / fLpLen
  const fLpUy = (lpY - FARMY) / fLpLen
  const noLen = Math.hypot(WH - DEP, CY - JRY)
  const noUx = (WH - DEP) / noLen
  const noUy = (CY - JRY) / noLen
  const noSafeX = DEP + JRR * noUx
  const noSafeY = JRY + JRR * noUy
  const noWhX = WH - WHR * noUx
  const noWhY = CY - WHR * noUy
  const noX = (noSafeX + noWhX) / 2
  const noY = (noSafeY + noWhY) / 2
  // ── EXIT-view structures around the vault, scaled to fit ──
  const EK = JRR / 66
  const eWHRI = 73 * EK
  const eWHRO = 106 * EK
  const eWHRM = (eWHRI + eWHRO) / 2
  const eCOWRI = 113 * EK
  const eCOWRO = 143 * EK
  const eSEAM = ((7 / 89.5) * 180) / Math.PI
  const eBPR = eCOWRO + 7 * EK
  const eXOUT = DEP - 191 * EK - 10
  const erad = (d: number) => (d * Math.PI) / 180
  const ebpA = [DEP + eBPR * Math.cos(erad(174)), JRY + eBPR * Math.sin(erad(174))]
  const ebpB = [DEP + eBPR * Math.cos(erad(186)), JRY + eBPR * Math.sin(erad(186))]
  return (
    <svg viewBox="0 0 640 470" role="img" aria-label="System Map seed">
      <defs>
        <marker id="seed-a" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
          <path d="M0 0 L7 3.5 L0 7 z" className="lab-ar" />
        </marker>
        <marker id="seed-m" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
          <path d="M0 0 L7 3.5 L0 7 z" className="lab-ar mint" />
        </marker>
        <marker id="seed-b" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
          <path d="M0 0 L7 3.5 L0 7 z" className="lab-ar blue" />
        </marker>
      </defs>
      <g className="chg-flat" fontFamily="var(--mono)" transform="translate(50.71 54.36) scale(1.0247)">
        {/* drawn track — nothing crosses the reserve interior */}
        <line x1={coinX + 14} y1={CY} x2={DEP - DEPR} y2={CY} className="lab-lane" />
        <line x1={DEP + DEPR} y1={CY} x2={WH - WHR} y2={CY} className="lab-lane" markerEnd="url(#seed-a)" />
        <line x1={WH + WHR} y1={CY} x2={reserveRimX - 6} y2={CY} className="lab-lane" markerEnd="url(#seed-a)" />
        <line x1={RX} y1={farmTopY - 2} x2={RX} y2={farmBotY + 4} className="lab-lane" markerEnd="url(#seed-a)" />
        <line x1={RX - 6} y1={farmGateY} x2={RX + 6} y2={farmGateY} className="lab-gate" />
        {LINE_YS.map((y) =>
          y === CY ? (
            <line key={y} x1={fanStart} y1={CY} x2={fanEndX} y2={CY} className="lab-lane" markerEnd="url(#seed-a)" />
          ) : (
            <path key={y} d={linePath(y)} fill="none" className="lab-lane" markerEnd="url(#seed-a)" />
          )
        )}
        {LINE_YS.map((y) => (
          <line key={`g${y}`} x1={gateX} y1={y - 6} x2={gateX} y2={y + 6} className="lab-gate" />
        ))}
        <line x1={DEP} y1={CY - DEPR} x2={DEP} y2={JRY + JRR} className="lab-lane mint" markerEnd="url(#seed-m)" />

        {/* USDC symbol */}
        <UsdcMark cx={coinX - 2} cy={CY} r={14} />

        {/* deposit */}
        <g>
          <line x1={DEP - 34} y1={CY - 8} x2={DEP - 34} y2={CY + 8} className="lab-doorline" />
          <line x1={DEP - 26} y1={CY - 8} x2={DEP - 26} y2={CY + 8} className="lab-doorline" />
          <circle cx={DEP} cy={CY} r={DEPR} className="lab-world-lens" />
          <circle cx={DEP} cy={CY} r="8" className="lab-core mint" />
        </g>
        {/* zodiac vault */}
        <g>
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
        <g>
          <circle cx={WH} cy={CY} r={WHR} className="lab-world-lens" />
          <path
            d="M610.2,396.07l-144.11.11c-4.17,14.6-9.42,28.25-19.51,39.69-34.13,38.66-89.96,41.32-126.63,6.64-26.5-25.06-34.56-65.03-19.85-98.6,19.56-44.65,71.37-64.38,116.15-44.67l12.88,7.52c20.16,13.78,32.72,34.65,37.43,59l143.07.09c8.61,0,14.63,6.78,15.05,14.73.35,6.71-5.4,15.48-14.49,15.49Z"
            transform={`translate(${WH} ${CY}) scale(0.123) translate(-380.4 -379.2)`}
            className="chg-safe"
            vectorEffect="non-scaling-stroke"
          />
          {CV2_SAFE_SLOTS.map(([ox, oy], i) => (
            <rect key={i} x={WH + ox - 3.5} y={CY + oy - 3.5} width="7" height="7" transform={`rotate(45 ${WH + ox} ${CY + oy})`} className="lab-share-tok" />
          ))}
        </g>

        {/* farm vault */}
        <g>
          <rect x={RX - FARM_S} y={FARMY - FARM_S} width={FARM_S * 2} height={FARM_S * 2} transform={`rotate(45 ${RX} ${FARMY})`} className="lab-vault-sq" />
        </g>

        {/* the USDC Reserve — a bare open diamond, holds four CRE cells */}
        <g>
          <rect x={RX - RES_S} y={CY - RES_S} width={RES_S * 2} height={RES_S * 2} transform={`rotate(45 ${RX} ${CY})`} className="lab-vault-open" />
        </g>
        {CELLS.map(([hx, hy], i) => (
          <polygon key={i} points={chgHexPts(13)} transform={`translate(${hx} ${hy})`} className="lab-hex-charge blue" opacity={0.85} />
        ))}

        {/* credit vaults — bare diamonds fanning out right */}
        {LINE_YS.map((y) => (
          <g key={y}>
            <rect x={LX - LINE_S} y={y - LINE_S} width={LINE_S * 2} height={LINE_S * 2} transform={`rotate(45 ${LX} ${y})`} className="lab-vault-sq" />
          </g>
        ))}

        {/* per-tile iteration: the couple things placed above the credit vaults */}
        {overlay}

        {/* ── junior yield cluster (Hydrex LP · Vault Strategist · NAV Oracle) ── */}
        <line x1={vRimX} y1={JRY} x2={vsX - HEXR - 3} y2={vsY} className="lab-gov" />
        <line x1={vsX + HEXR + 3} y1={vsY} x2={fEdgeX} y2={JRY} className="lab-gov" />
        <g>
          <circle cx={vsX} cy={vsY} r={HEXR + 3} fill="transparent" />
          <polygon points={chgHexPts(HEXR)} transform={`translate(${vsX} ${vsY})`} className="lab-hex-charge blue" />
        </g>
        <line x1={DEP + JRR * vLpUx} y1={JRY + JRR * vLpUy} x2={lpX - lpR * vLpUx} y2={lpY - lpR * vLpUy} className="lab-gov" />
        <line x1={RX + FARM_EDGE * fLpUx} y1={FARMY + FARM_EDGE * fLpUy} x2={lpX - lpR * fLpUx} y2={lpY - lpR * fLpUy} className="lab-gov" />
        <g>
          <circle cx={lpX} cy={lpY} r={lpR} className="lab-world-lens" />
          <path
            transform={`translate(${lpX} ${lpY}) scale(${(lpR * 0.68) / 87}) translate(-87 -87)`}
            d="M156.803 60.4574C154.296 59.0993 151.654 58.0981 148.937 57.4356C144.042 56.2137 138.79 56.1401 133.983 54.5611C127.015 52.3748 121.343 46.5669 119.304 39.5553C117.71 34.3252 117.736 28.635 116.128 23.4049C114.328 17.2877 110.581 11.6601 105.649 7.5673C99.7193 2.52121 92.207 0 84.6764 0C77.3371 0 69.9868 2.39607 64.0794 7.1882C50.1885 17.8693 47.3287 39.0069 57.9106 52.8496C60.822 56.7842 64.6756 60.0415 69.0188 62.3308C67.7416 63.2583 66.516 64.2963 65.3639 65.4483C64.2192 66.593 63.1813 67.8149 62.2464 69.0958C60.2331 65.2716 57.4542 61.8266 54.1379 59.0735C48.212 54.0274 40.6998 51.5025 33.1691 51.5025C25.8299 51.5025 18.4796 53.8986 12.5721 58.6907C-1.31875 69.3718 -4.17863 90.5094 6.4033 104.352C10.8311 110.337 17.4269 114.772 24.63 116.568C29.621 117.871 34.9874 117.911 39.8937 119.509C46.9017 121.691 52.6178 127.544 54.6532 134.596C56.258 139.929 56.2027 145.737 57.9179 151.059C58.6872 153.536 59.7656 155.947 61.1348 158.214C67.3 168.623 78.2831 174 89.3361 174C98.4421 174 107.596 170.349 114.136 162.855L114.188 162.8C128.256 147.209 123.912 121.868 105.292 111.964C105.167 111.897 105.042 111.835 104.916 111.769C106.197 110.834 107.419 109.796 108.564 108.655C109.709 107.514 110.75 106.284 111.678 105.011C111.98 105.589 112.3 106.156 112.638 106.719C118.804 117.127 129.787 122.505 140.84 122.505C149.946 122.505 159.1 118.854 165.64 111.36L165.692 111.305C179.759 95.7138 175.416 70.3729 156.795 60.4684L156.803 60.4574ZM75.7765 98.2387C72.7878 95.25 71.1426 91.275 71.1426 87.046C71.1426 82.817 72.7878 78.8456 75.7765 75.8533C78.8609 72.769 82.9134 71.2268 86.9695 71.2268C91.0256 71.2268 95.0743 72.769 98.1624 75.8533C104.335 82.0257 104.335 92.0663 98.1624 98.235C95.1737 101.224 91.1985 102.873 86.9695 102.873C82.7404 102.873 78.7689 101.227 75.7765 98.235V98.2387ZM107.493 137.731C108.476 143.326 106.933 148.865 103.264 152.936C103.238 152.965 103.212 152.991 103.186 153.021L103.135 153.076C103.105 153.109 103.076 153.142 103.05 153.172C98.4163 158.483 92.4721 159.274 89.3435 159.274C82.7919 159.274 76.9875 156.072 73.8074 150.709C73.7853 150.672 73.7632 150.632 73.7374 150.595C72.994 149.366 72.4051 148.052 71.9818 146.69C71.967 146.642 71.9523 146.594 71.9376 146.546C71.437 144.99 71.1205 142.796 70.7856 140.477C70.3512 137.459 69.858 134.04 68.7796 130.429C65.3603 118.688 56.0187 109.141 44.3657 105.478C40.4789 104.223 36.8167 103.701 33.5814 103.237C31.6306 102.957 29.7866 102.696 28.3585 102.324C28.307 102.309 28.2554 102.298 28.2039 102.284C24.3576 101.323 20.6328 98.8239 18.244 95.5923C18.1998 95.5298 18.152 95.4709 18.1041 95.4083C12.458 88.025 14.0996 76.0852 21.5492 70.3619C21.6486 70.2846 21.7517 70.2036 21.8511 70.1226C24.9502 67.6088 28.9732 66.2249 33.1728 66.2249C37.4681 66.2249 41.5242 67.664 44.5939 70.2809C44.6418 70.3214 44.6896 70.3619 44.7375 70.4024C47.4354 72.6402 49.5334 75.7981 50.4977 79.0665C50.5161 79.1254 50.5308 79.1806 50.5492 79.2395C51.0204 80.7743 51.3259 82.8906 51.6498 85.1284C52.0878 88.1723 52.5846 91.6136 53.6852 95.2574C57.1082 106.918 66.4019 116.417 77.9702 120.079C81.8865 121.356 85.5782 121.886 88.8392 122.354C90.709 122.623 92.4721 122.877 93.8633 123.223C93.8891 123.23 93.9186 123.237 93.9443 123.245C95.4755 123.616 96.933 124.176 98.2728 124.901C98.3059 124.919 98.3427 124.938 98.3795 124.956C103.19 127.514 106.51 132.174 107.486 137.731H107.493ZM154.767 101.433C154.742 101.463 154.716 101.489 154.69 101.518L154.639 101.573C154.609 101.606 154.58 101.64 154.554 101.669C149.92 106.98 143.976 107.771 140.847 107.771C134.295 107.771 128.491 104.569 125.311 99.2067C125.289 99.1699 125.267 99.1294 125.241 99.0926C124.498 97.8633 123.909 96.5493 123.485 95.1875C123.471 95.1396 123.456 95.0918 123.441 95.0439C122.941 93.487 122.624 91.2934 122.289 88.9746C121.855 85.9566 121.362 82.5373 120.283 78.9266C116.864 67.1855 107.522 57.6381 95.8693 53.9759C91.9825 52.7208 88.3203 52.1982 85.0849 51.7344C83.1342 51.4547 81.2902 51.1934 79.8621 50.8179C79.8106 50.8032 79.759 50.7922 79.7075 50.7775C75.8612 49.8168 72.1364 47.3177 69.7476 44.0861C69.7034 44.0236 69.6556 43.9647 69.6077 43.9021C63.9616 36.5188 65.6032 24.579 73.0528 18.8557C73.1559 18.7784 73.2553 18.6974 73.3547 18.6164C76.4538 16.1026 80.4768 14.7187 84.6764 14.7187C88.9717 14.7187 93.0278 16.1578 96.0975 18.7747C96.1454 18.8152 96.1932 18.8557 96.2411 18.8962C98.939 21.134 101.037 24.2919 102.001 27.5603C102.02 27.6192 102.034 27.6744 102.053 27.7333C102.524 29.2681 102.829 31.3844 103.153 33.6222C103.591 36.6661 104.092 40.1148 105.192 43.7586C108.619 55.415 117.909 64.9109 129.474 68.5768C133.39 69.854 137.082 70.384 140.343 70.8514C142.209 71.1201 143.976 71.374 145.367 71.72C145.393 71.7274 145.422 71.7347 145.452 71.7421C146.983 72.1138 148.44 72.6733 149.78 73.3984C149.813 73.4168 149.85 73.4352 149.887 73.4536C154.697 76.0116 158.017 80.6712 158.993 86.2289C159.976 91.8234 158.433 97.3627 154.764 101.433H154.767Z"
            className="chg-logo"
          />
        </g>
        {/* NAV Oracle */}
        <line x1={noSafeX} y1={noSafeY} x2={noX - (HEXR + 3) * noUx} y2={noY - (HEXR + 3) * noUy} className="lab-gov" />
        <line x1={noX + (HEXR + 3) * noUx} y1={noY + (HEXR + 3) * noUy} x2={noWhX} y2={noWhY} className="lab-gov" />
        <g>
          <circle cx={noX} cy={noY} r={HEXR + 3} fill="transparent" />
          <polygon points={chgHexPts(HEXR)} transform={`translate(${noX} ${noY})`} className="lab-hex-charge blue" />
        </g>

        {/* ── EXIT-view structures bridged onto the vault ── */}
        <path d={annularSector(DEP, JRY, eWHRI, eWHRO, 210 + eSEAM, 270)} className="lab-world-lens" />
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
        <line x1={DEP - JRR} y1={JRY} x2={DEP - eWHRI} y2={JRY} className="chg-ray" />
        <line x1={DEP - eWHRO} y1={JRY} x2={DEP - eCOWRI} y2={JRY} className="chg-ray" />
        <line x1={DEP - eCOWRO} y1={JRY} x2={eXOUT + 16} y2={JRY} className="chg-ray" markerEnd="url(#seed-b)" />
        <path d={`M ${ebpA[0].toFixed(2)} ${ebpA[1].toFixed(2)} A ${eBPR} ${eBPR} 0 0 1 ${ebpB[0].toFixed(2)} ${ebpB[1].toFixed(2)}`} className="chg-ray" fill="none" />
        <UsdcMark cx={eXOUT - 2} cy={JRY} r={14} />
      </g>
    </svg>
  )
}

// ---------------------------------------------------------------------------

// The two things above the credit vaults, drawn as a mating pair: a rectangular
// SOCKET whose bottom edge is cut to the NEGATIVE of the endpiece's top, and the
// endpiece SHAPE seated into that cut with a little clearance — its top half
// mated inside the socket, its lower half exposed below (nut in a wrench jaw).
// One endpiece is the Oracle Registry (hex), one the Lien Factory (diamond).
// Vault column: LX = 540, top vault at y = 180 (top vertex ≈ 163).
const DIA_S = 12 // diamond vertex half-distance (apex reaches cy ± DIA_S)
const HEX_R = 11 // hex vertex radius
const GAP = 2.6 // clearance between socket cut and endpiece
const COS30 = Math.cos(Math.PI / 6)

// a diamond whose vertices reach ±s (drawn as a rotated square of half-side s/√2)
function DiaBall({ x, y, s = DIA_S }: { x: number; y: number; s?: number }) {
  const h = s / SQRT2
  return <rect x={x - h} y={y - h} width={h * 2} height={h * 2} transform={`rotate(45 ${x} ${y})`} className="lab-vault-sq" />
}
function HexBall({ x, y, r = HEX_R }: { x: number; y: number; r?: number }) {
  return <polygon points={chgHexPts(r)} transform={`translate(${x} ${y})`} className="lab-hex-charge blue" opacity={0.9} />
}

// the socket: a rectangle from `top` down to the baseline at `cy`, with a notch
// carved up into its bottom edge matching the endpiece's upper outline + `gap`.
function socketPath(cx: number, cy: number, top: number, kind: 'hex' | 'dia', gap = GAP, shoulder = 4) {
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
  const half = Math.abs(notch[0][0] - cx) + shoulder // wall clears the notch by `shoulder`
  const seg = notch.map(([x, y]) => `L ${x.toFixed(2)} ${y.toFixed(2)}`).join(' ')
  return `M ${cx - half} ${top} L ${cx + half} ${top} L ${cx + half} ${cy} ${seg} L ${cx - half} ${cy} Z`
}

// x = centre, cy = the socket baseline / endpiece centre; shaft rises `shaftH`.
function Endpiece({ x, cy, kind, shaftH = 30, gap = GAP, shoulder = 4 }: { x: number; cy: number; kind: 'hex' | 'dia'; shaftH?: number; gap?: number; shoulder?: number }) {
  return (
    <>
      <path d={socketPath(x, cy, cy - shaftH, kind, gap, shoulder)} fill="none" className="lab-world-lens" />
      {kind === 'hex' ? <HexBall x={x} y={cy} /> : <DiaBall x={x} y={cy} />}
    </>
  )
}

// narrow pass on the winner — diamond | hex side by side, mated — varying the
// FIT: clearance, shaft length, shoulder, and how much of the shape is exposed.
const TILES = [
  {
    key: 'i1',
    name: 'I1 — Snug fit',
    blurb: 'The winner tightened — minimal clearance, the endpiece seated flush in its socket. Diamond left, hex right.',
    overlay: (
      <>
        <Endpiece x={500} cy={102} kind="dia" gap={1.3} />
        <Endpiece x={539} cy={102} kind="hex" gap={1.3} />
      </>
    ),
  },
  {
    key: 'i2',
    name: 'I2 — Tall shafts',
    blurb: 'Same mate, longer rectangles descending — the sockets read as shafts coming down onto the endpieces.',
    overlay: (
      <>
        <Endpiece x={500} cy={110} kind="dia" shaftH={46} />
        <Endpiece x={539} cy={110} kind="hex" shaftH={46} />
      </>
    ),
  },
  {
    key: 'i3',
    name: 'I3 — Flush walls',
    blurb: 'No shoulder — the socket walls come straight down to the notch edges (|/\\|), so the cut fills the full width.',
    overlay: (
      <>
        <Endpiece x={505} cy={102} kind="dia" shoulder={0} />
        <Endpiece x={535} cy={102} kind="hex" shoulder={0} />
      </>
    ),
  },
  {
    key: 'i4',
    name: 'I4 — Loose, more exposed',
    blurb: 'Bigger clearance and wider shoulders — the endpieces sit looser in broader sockets, more of each shape showing.',
    overlay: (
      <>
        <Endpiece x={496} cy={98} kind="dia" gap={4.5} shoulder={7} shaftH={26} />
        <Endpiece x={545} cy={98} kind="hex" gap={4.5} shoulder={7} shaftH={26} />
      </>
    ),
  },
]

export default function Lab() {
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
              <a href="/lab-river">The river lab</a>
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
                <SystemSeed overlay={t.overlay} />
                <figcaption>{t.blurb}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
