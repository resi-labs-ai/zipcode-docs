'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Logo } from '../logo'
import { ThemeToggle } from '../theme-toggle'
import { MACHINES, MAX_SELECTION, buildQuery, filterMachines, gpuCounts, parseFilters, platformClass, selectionSummary, type MachineConfiguration, type MachineFilters } from './catalog'

const STORAGE_KEY = 'zipcode-machine-selection-v1'
const knownIds = new Set(MACHINES.map(machine => machine.id))
const emptyFilters = () => parseFilters(new URLSearchParams())
const GPU_COUNTS = gpuCounts()
const FORM_LABEL: Record<string, string> = { rack: 'Rack systems', tower: 'Tower', unknown: 'Form factor to confirm' }

function memoryLabel(machine: MachineConfiguration) {
  return machine.gpuMemoryLabel || (machine.vramPerGpuGB ? `${machine.vramPerGpuGB} GB per primary GPU` : 'Memory to confirm')
}

function MachineMark({ tower = false, large = false }: { tower?: boolean; large?: boolean }) {
  return <svg viewBox={tower ? '0 0 180 140' : '0 0 280 140'} className={large ? 'machine-mark machine-mark--large' : 'machine-mark'} aria-hidden="true" fill="none">
    {tower ? <>
      <path d="m57 24 64-10 21 13v100l-64 7-21-12Z" fill="var(--machine-surface)" stroke="currentColor" />
      <path d="m57 24 21 14 64-11M78 38v96" stroke="currentColor" />
      <path d="m88 52 42-5v54l-42 5Z" fill="var(--machine-slot)" stroke="currentColor" />
      {[60, 69, 78, 87, 96].map(y => <path key={y} d={`m92 ${y} 34-4`} stroke="currentColor" opacity=".4" />)}
      <circle cx="129" cy="115" r="3" fill="#6ff7a1" />
    </> : <>
      <path d="m26 47 34-24h177l22 24v66H26Z" fill="var(--machine-surface)" stroke="currentColor" />
      <path d="M26 47h233M39 53v54m207-54v54" stroke="currentColor" />
      {[0, 1, 2, 3].map(n => <g key={n}>
        <rect x={49 + n * 47} y="57" width="39" height="42" rx="2" fill="var(--machine-slot)" stroke="currentColor" />
        {[0, 1, 2, 3, 4].map(i => <path key={i} d={`M${55 + n * 47} ${64 + i * 6}h27`} stroke="currentColor" opacity=".4" />)}
        <path d={`M${52 + n * 47} 105h32`} stroke="#6ff7a1" strokeWidth="2" />
      </g>)}
      <path d="M62 31h162M56 37h174" stroke="currentColor" opacity=".25" />
      <circle cx="33" cy="58" r="2" fill="#6ff7a1" />
    </>}
  </svg>
}

export function MachineExplorer() {
  const [filters, setFilters] = useState<MachineFilters>(emptyFilters)
  const [ready, setReady] = useState(false)
  const [view, setView] = useState<'all' | 'selected'>('all')
  const [notice, setNotice] = useState('')
  const selectionHeading = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const initial = parseFilters(params)
    if (!params.has('select')) {
      try {
        const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
        if (Array.isArray(saved)) initial.selectedIds = [...new Set(saved.filter((id): id is string => typeof id === 'string' && knownIds.has(id)))].slice(0, MAX_SELECTION)
      } catch { /* Storage is optional; private browsing still works. */ }
    }
    setFilters(initial)
    setView(params.get('view') === 'selected' ? 'selected' : 'all')
    setReady(true)
    const onPop = () => {
      const query = new URLSearchParams(window.location.search)
      setFilters(parseFilters(query))
      setView(query.get('view') === 'selected' ? 'selected' : 'all')
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => {
    if (!ready) return
    const params = buildQuery(filters)
    if (view === 'selected') params.set('view', 'selected')
    const query = params.toString()
    window.history.replaceState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(filters.selectedIds)) } catch { /* Storage is optional. */ }
  }, [filters, ready, view])

  const selected = useMemo(() => filters.selectedIds.map(id => MACHINES.find(machine => machine.id === id)).filter((item): item is MachineConfiguration => Boolean(item)), [filters.selectedIds])
  const matches = useMemo(() => filterMachines(view === 'selected' ? selected : MACHINES, filters), [filters, view, selected])
  const platforms = [...new Set(MACHINES.map(machine => machine.platform))].sort()
  const chips: { label: string; clear: Partial<MachineFilters> }[] = [
    ...(filters.search ? [{ label: `“${filters.search}”`, clear: { search: '' } }] : []),
    ...(filters.platform ? [{ label: filters.platform, clear: { platform: '' } }] : []),
    ...(filters.gpuCount ? [{ label: `${filters.gpuCount} primary ${filters.gpuCount === 1 ? 'GPU' : 'GPUs'}`, clear: { gpuCount: 0 } }] : []),
    ...(filters.formFactor ? [{ label: FORM_LABEL[filters.formFactor], clear: { formFactor: '' as const } }] : []),
    ...(filters.minMemoryGB ? [{ label: `≥ ${filters.minMemoryGB} GB per GPU`, clear: { minMemoryGB: 0 } }] : []),
    ...(filters.workload ? [{ label: filters.workload, clear: { workload: '' as const } }] : []),
  ]
  const activeFilters = chips.length > 0

  function update<K extends keyof MachineFilters>(key: K, value: MachineFilters[K]) {
    setFilters(current => ({ ...current, [key]: value }))
  }

  function toggle(machine: MachineConfiguration) {
    const exists = filters.selectedIds.includes(machine.id)
    if (!exists && selected.length >= MAX_SELECTION) {
      setNotice(`Compare up to ${MAX_SELECTION} configurations at a time. Remove one to add another.`)
      return
    }
    update('selectedIds', exists ? filters.selectedIds.filter(id => id !== machine.id) : [...filters.selectedIds, machine.id])
    setNotice(`${machine.name} ${exists ? 'removed from' : 'added to'} your selection.`)
  }

  function reset() {
    setFilters(current => ({ ...emptyFilters(), selectedIds: current.selectedIds }))
    setNotice('Filters reset.')
  }

  function reviewSelection() {
    selectionHeading.current?.scrollIntoView({ behavior: 'instant', block: 'start' })
    selectionHeading.current?.focus({ preventScroll: true })
  }

  function download() {
    const blob = new Blob([selectionSummary(selected)], { type: 'text/markdown;charset=utf-8' })
    const href = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = href
    link.download = 'zipcode-machine-selection.md'
    link.click()
    setTimeout(() => URL.revokeObjectURL(href), 1_000)
    setNotice('Selection summary downloaded. Nothing was sent to Zipcode.')
  }

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(selectionSummary(selected))
      setNotice('Selection summary copied. Nothing was sent to Zipcode.')
    } catch { setNotice('Copying is unavailable in this browser. Use Download summary instead.') }
  }

  async function copyLink() {
    try {
      const params = buildQuery(filters)
      params.set('select', filters.selectedIds.join(','))
      if (view === 'selected') params.set('view', 'selected')
      const query = params.toString()
      await navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}${query ? `?${query}` : ''}`)
      setNotice('Link copied with your filters and selection.')
    } catch { setNotice('Copy the address from your browser to share these filters and selection.') }
  }

  return <main className="zc-landing machines-page">
    <a className="machine-skip" href="#machine-catalog">Skip to configurations</a>
    <header className="site-header">
      <div className="wrap"><nav className="top" aria-label="Main navigation">
        <a href="/" className="brand" aria-label="Zipcode home"><Logo twoTone className="brand-logo" /></a>
        <div className="machine-nav"><a href="/">Overview</a><a href="/Machines" aria-current="page">Machines</a></div>
        <div className="nav-right"><ThemeToggle /><button type="button" className="selection-nav" onClick={reviewSelection}>Selection <span>{selected.length}</span></button></div>
      </nav></div>
    </header>

    <section className="machine-hero wrap" aria-labelledby="machines-title">
      <div className="machine-intro">
        <span className="eyebrow">Zipcode / Infrastructure</span>
        <h1 className="display" id="machines-title">Serious compute.<br /><em>Your configuration.</em></h1>
        <p>Explore the hardware behind your next idea. Compare GPU systems and build a selection for your infrastructure discussion.</p>
        <a className="pill pill--primary" href="#machine-catalog">Explore configurations <span aria-hidden="true">↗</span></a>
      </div>
      <div className="machine-blueprint" aria-label="GPU system illustration">
        <div className="blueprint-label"><span>Hardware, in perspective</span><span aria-hidden="true">01 / ZC</span></div>
        <MachineMark large />
        <div className="blueprint-foot"><span>From a single tower<br />to rack-scale compute</span><span className="blueprint-cross" aria-hidden="true">+</span></div>
        <span className="schematic-label">Illustrative schematic</span>
      </div>
    </section>

    <div className="machine-context"><div className="wrap"><span><b>{MACHINES.length.toString().padStart(2, '0')}</b> configurations to explore</span><span>Compare. Select. Save.</span><span className="context-note">Presentation catalog · specifications subject to confirmation</span></div></div>

    <section className="machine-catalog wrap" id="machine-catalog" aria-labelledby="catalog-title">
      <div className="catalog-heading"><div><span className="eyebrow">Find your fit</span><h2 id="catalog-title">Explore machines</h2></div><p>Start with the platform, the form factor,<br className="desktop-break" /> or the memory your workload needs.</p></div>
      <div className="catalog-layout">
        <aside className="machine-filters" aria-label="Configuration filters">
          <div className="filter-heading"><h3>Refine</h3><button type="button" onClick={reset} disabled={!activeFilters && filters.sort === 'catalog'}>Reset filters</button></div>
          <label className="machine-field"><span>Search configurations</span><input type="search" placeholder="GPU, platform, CPU…" value={filters.search} maxLength={100} onChange={event => update('search', event.target.value)} /></label>
          <label className="machine-field"><span>Platform</span><select value={filters.platform} onChange={event => update('platform', event.target.value)}><option value="">All platforms</option>{platforms.map(value => <option key={value}>{value}</option>)}</select></label>
          <label className="machine-field"><span>Primary GPU count</span><select value={filters.gpuCount} onChange={event => update('gpuCount', Number(event.target.value))}><option value="0">Any GPU count</option>{GPU_COUNTS.map(count => <option key={count} value={count}>{count} {count === 1 ? 'GPU' : 'GPUs'}</option>)}</select></label>
          <label className="machine-field"><span>Form factor</span><select value={filters.formFactor} onChange={event => update('formFactor', event.target.value as MachineFilters['formFactor'])}><option value="">All form factors</option><option value="rack">Rack systems</option><option value="tower">Tower</option><option value="unknown">To confirm</option></select></label>
          <label className="machine-field"><span>Minimum primary GPU memory</span><select value={filters.minMemoryGB} onChange={event => update('minMemoryGB', Number(event.target.value))}><option value="0">Any memory capacity</option><option value="80">80 GB or more</option><option value="140">140 GB or more</option><option value="180">180 GB or more</option><option value="250">250 GB or more</option>{![0, 80, 140, 180, 250].includes(filters.minMemoryGB) && <option value={filters.minMemoryGB}>{filters.minMemoryGB} GB or more</option>}</select></label>
          <label className="machine-field"><span>Workload</span><select value={filters.workload} onChange={event => update('workload', event.target.value as MachineFilters['workload'])}><option value="">All workloads</option><option>Training</option><option>Inference</option><option>Development</option></select></label>
          <p className="filter-note">Memory filters use confirmed capacity per primary GPU. Workload tags are a starting point; fit and performance depend on your software and deployment.</p>
          <div className="filter-help"><span aria-hidden="true">↗</span><b>One clear selection.</b><p>Add configurations, compare the details, then download a summary to keep the discussion moving.</p></div>
        </aside>

        <div className="catalog-results">
          <div className="results-toolbar"><div className="catalog-view" aria-label="Show configurations"><button type="button" aria-pressed={view === 'all'} onClick={() => setView('all')}>All machines</button><button type="button" aria-pressed={view === 'selected'} onClick={() => setView('selected')}>Selected ({selected.length})</button></div><label className="sort-field"><span>Sort by</span><select value={filters.sort} onChange={event => update('sort', event.target.value as MachineFilters['sort'])}><option value="catalog">Catalog order</option><option value="name">Name A–Z</option><option value="gpu-count">Primary GPUs: high to low</option><option value="memory">Primary GPU memory: high to low</option></select></label></div>
          <div className="results-meta"><p aria-live="polite" aria-atomic="true">{matches.length} {matches.length === 1 ? 'configuration' : 'configurations'}{activeFilters ? ' matching your filters' : ''}</p><button type="button" onClick={copyLink}>Copy view link <span aria-hidden="true">↗</span></button></div>
          {chips.length > 0 && <ul className="active-filters" aria-label="Active filters">{chips.map(chip => <li key={chip.label}><button type="button" onClick={() => setFilters(current => ({ ...current, ...chip.clear }))} aria-label={`Remove filter ${chip.label}`}>{chip.label} <span aria-hidden="true">×</span></button></li>)}<li><button type="button" className="chip-clear" onClick={reset}>Clear all</button></li></ul>}
          {matches.length ? <div className="machine-grid">{matches.map(machine => <MachineCard key={machine.id} machine={machine} selected={filters.selectedIds.includes(machine.id)} onToggle={() => toggle(machine)} />)}</div> : <div className="machine-empty"><span aria-hidden="true">⌕</span><h3>{view === 'selected' && selected.length === 0 ? 'Your selection starts here.' : 'No configurations match yet.'}</h3><p>{view === 'selected' && selected.length === 0 ? 'Add a machine from the catalog to compare its specifications.' : 'Try a broader platform or memory range. Unconfirmed memory is excluded when a minimum is set.'}</p><button className="pill pill--primary" type="button" onClick={() => { reset(); setView('all') }}>Show all machines</button></div>}
          <p className="catalog-disclosure">All configurations are for discussion. Pricing, GPU inclusion, final specifications, availability, shipping, taxes and procurement eligibility must be confirmed. Selecting a machine makes no commitment.</p>
        </div>
      </div>
    </section>

    <section className="selection-section" aria-labelledby="selection-title"><div className="wrap">
      <div className="selection-heading"><div><span className="eyebrow">Your shortlist</span><h2 id="selection-title" tabIndex={-1} ref={selectionHeading}>The details, side by side.</h2><p>Compare up to {MAX_SELECTION} systems. Saved on this browser; copy or download a summary when you’re ready.</p></div><div className="selection-actions"><button type="button" className="pill pill--primary" disabled={!selected.length} onClick={download}>Download summary <span aria-hidden="true">↓</span></button><button type="button" className="quiet-button" disabled={!selected.length} onClick={copySummary}>Copy summary</button><button type="button" className="quiet-button" disabled={!selected.length} onClick={() => { update('selectedIds', []); setNotice('Selection cleared.') }}>Clear selection</button></div></div>
      {selected.length ? <div className="comparison-scroll" tabIndex={0} role="region" aria-label="Selected machine comparison, scroll horizontally for more configurations"><table className="machine-comparison"><caption className="sr-only">Selected GPU configurations</caption><thead><tr><th scope="col">Configuration</th>{selected.map(machine => <th scope="col" key={machine.id}><span>{machine.name}</span><button type="button" onClick={() => toggle(machine)} aria-label={`Remove ${machine.name} from selection`}>Remove ×</button></th>)}</tr></thead><tbody>
        {([
          ['Platform', (m: MachineConfiguration) => m.platform],
          ['Form factor', (m: MachineConfiguration) => m.formLabel || null],
          ['GPU configuration', (m: MachineConfiguration) => `${m.gpuCount === null ? 'Count to confirm ·' : `${m.gpuCount} ×`} ${m.gpuModel}${m.extraGpu ? `; ${m.extraGpu}` : ''}`],
          ['GPU memory', memoryLabel],
          ['CPU', (m: MachineConfiguration) => m.cpu],
          ['System memory', (m: MachineConfiguration) => m.systemMemory],
          ['Storage', (m: MachineConfiguration) => m.storage],
          ['Networking', (m: MachineConfiguration) => m.networking],
          ['Power', (m: MachineConfiguration) => m.power],
          ['GPUs included', (m: MachineConfiguration) => m.gpuIncluded],
          ['Configuration status', (m: MachineConfiguration) => m.reviewStatus || null],
          ['Price basis', () => 'Request quote · configured system'],
          ['Availability', () => 'Confirm availability'],
          ['Shipping & taxes', () => 'To be confirmed'],
        ] as [string, (m: MachineConfiguration) => string | null][]).map(([label, getValue]) => <tr key={label}><th scope="row">{label}</th>{selected.map(machine => <td key={machine.id}>{getValue(machine) || 'To be confirmed'}</td>)}</tr>)}
      </tbody></table></div> : <div className="selection-placeholder"><span aria-hidden="true">+</span><p>No machines selected yet.<br /><b>Add a configuration above to start comparing.</b></p><a href="#machine-catalog">Browse machines ↗</a></div>}
      <p className="selection-footnote">This is a presentation tool. Saving or downloading a selection does not send an inquiry, reserve hardware, place an order, or confirm financing.</p>
    </div></section>

    <footer className="site"><div className="wrap machine-footer"><Logo twoTone /><span>Infrastructure, with perspective.</span><span>Zipcode © 2026</span></div></footer>
    <div className="sr-only" role="status" aria-live="polite">{notice}</div>
    {notice && <div className="machine-notice"><span>{notice}</span><button type="button" aria-label="Dismiss notification" onClick={() => setNotice('')}>×</button></div>}
    {selected.length > 0 && <div className="selection-dock"><div><span className="dock-count">{selected.length.toString().padStart(2, '0')}</span><span>In your selection<small>Saved on this browser</small></span></div><button type="button" className="pill pill--primary" onClick={reviewSelection}>Compare & save <span aria-hidden="true">↗</span></button></div>}
  </main>
}

function MachineCard({ machine, selected, onToggle }: { machine: MachineConfiguration; selected: boolean; onToggle: () => void }) {
  const pending = machine.reviewStatus !== 'Reviewed configuration'
  return <article className={`machine-card${selected ? ' is-selected' : ''}`} aria-labelledby={`${machine.id}-title`}>
    <div className="card-art"><span className="card-format">{machine.formLabel}</span><MachineMark tower={machine.formFactor === 'tower'} /><span className="card-platform">Illustrative schematic</span></div>
    <div className="card-body"><div className="card-kicker"><span>{platformClass(machine)}</span>{pending && <span className="review-badge">{machine.reviewStatus}</span>}</div>
      <h3 id={`${machine.id}-title`}>{machine.name}</h3><p className="gpu-model">{machine.gpuCount !== null ? `${machine.gpuCount} × ` : ''}{machine.gpuModel}</p>
      {machine.extraGpu && <p className="extra-gpu">+ {machine.extraGpu}</p>}
      <dl className="card-specs"><div><dt>GPU memory</dt><dd>{memoryLabel(machine)}</dd></div><div><dt>System memory</dt><dd>{machine.systemMemory || 'To be confirmed'}</dd></div><div><dt>GPUs included</dt><dd>{machine.gpuIncluded}</dd></div></dl>
      <div className="workload-tags">{machine.workloads.map(workload => <span key={workload}>{workload}</span>)}</div>
      <details className="machine-details"><summary>Configuration details <span aria-hidden="true">+</span></summary><dl><div><dt>CPU</dt><dd>{machine.cpu || 'To be confirmed'}</dd></div><div><dt>Storage</dt><dd>{machine.storage || 'To be confirmed'}</dd></div><div><dt>Networking</dt><dd>{machine.networking || 'To be confirmed'}</dd></div><div><dt>Power</dt><dd>{machine.power || 'To be confirmed'}</dd></div></dl>{machine.notes.length > 0 && <ul>{machine.notes.map(note => <li key={note}>{note}</li>)}</ul>}<p>Memory across multiple GPUs is aggregate capacity, not a single shared memory pool. Deployment and software affect usable capacity.</p></details>
      <div className="card-commercial"><div><span>Configured system</span><strong>Request quote</strong></div><p>Availability, shipping<br />and taxes to confirm</p></div>
      <a className="machine-detail-link" href={`/Machines/${machine.id}`}>View full configuration <span aria-hidden="true">→</span></a>
      <button type="button" className={`machine-select${selected ? ' selected' : ''}`} aria-pressed={selected} aria-label={`${selected ? 'Remove' : 'Select'} ${machine.name}`} onClick={onToggle}><span>{selected ? 'Selected' : 'Add to selection'}</span><span aria-hidden="true">{selected ? '✓' : '+'}</span></button>
    </div>
  </article>
}
