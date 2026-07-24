// Shared shapes for the protocol map (/map). Content lives in
// lib/map-content.json (distilled from zipcode-euler/docs); geometry lives in
// lib/map-layout.ts. The component joins the two by node id.

export type Stratum = 'euler' | 'zipcode' | 'external' | 'actor'

export type NodeKind = 'primitive' | 'contract' | 'engine' | 'neighborhood' | 'actor'

export interface MapNodeContent {
  id: string
  title: string
  kind: NodeKind
  stratum: Stratum
  /** ≤7-word mono label under the title */
  tagline: string
  /** 2–4 plain-English sentences: what it IS and what it's for */
  summary: string
  /** Which Euler primitive this contract stands on, and how */
  eulerPrimitive?: { id: string; how: string } | null
  code?: {
    excerpt: string
    path: string
    url: string
  } | null
  links: { label: string; url: string }[]
  /** Inline "read more" doc link shown directly under the summary */
  docLink?: { label: string; url: string } | null
  /** "Source contracts" group (the .sol files this node covers) */
  sources?: { label: string; url: string }[] | null
  /** "Built on" group (the external Euler primitives/repos) */
  builtOn?: { label: string; url: string }[] | null
  /** For collapsed blocks (the engine, federation, loss, neighborhoods) */
  members?: { name: string; blurb: string; url?: string }[] | null
}

export type FlowKind = 'senior' | 'junior' | 'exit' | 'loss'

export interface MapFlow {
  id: string
  title: string
  blurb: string
  /** Ordered node ids the value moves through */
  path: string[]
  kind: FlowKind
}

export interface NodeGeom {
  x: number
  y: number
  w: number
  h: number
}

export interface EdgeGeom {
  from: string
  to: string
  /** 'stands-on' renders dashed ink→foundation; 'flow' is a money/call seam */
  kind: 'flow' | 'stands-on'
  /** Optional explicit SVG path (overrides the auto elbow) */
  d?: string
  label?: string
  /** Label anchor when `d` is explicit */
  lx?: number
  ly?: number
}
