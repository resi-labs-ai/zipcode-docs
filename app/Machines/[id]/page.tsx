import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import '../../landing.css'
import '../machines.css'
import { Logo } from '../../logo'
import { ThemeToggle } from '../../theme-toggle'
import { MACHINES, findMachine, platformClass, type MachineConfiguration } from '../catalog'
import { DetailSelect } from './detail-select'

// Only reviewed catalog IDs are routable; anything else is a 404.
export const dynamicParams = false

export function generateStaticParams() {
  return MACHINES.map((machine) => ({ id: machine.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const machine = findMachine((await params).id)
  if (!machine) return {}
  const description = `${machine.name}: baseline configuration for discussion with Zipcode. Pricing, availability and final specifications require confirmation.`
  return {
    title: `${machine.name} — Machines`,
    description,
    alternates: { canonical: `/Machines/${machine.id}` },
    openGraph: { title: `${machine.name} · Zipcode`, description, type: 'website' },
    twitter: { card: 'summary', title: `${machine.name} · Zipcode`, description },
  }
}

const TBC = 'To be confirmed'

function gpuLine(m: MachineConfiguration) {
  return `${m.gpuCount === null ? 'Count to be confirmed ·' : `${m.gpuCount} ×`} ${m.gpuModel}`
}

function gpuMemory(m: MachineConfiguration) {
  if (m.vramPerGpuGB) return `${m.vramPerGpuGB} GB per primary GPU${m.memoryType ? ` · ${m.memoryType}` : ''}`
  return m.gpuMemoryLabel || TBC
}

export default async function MachineDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const machine = findMachine((await params).id)
  if (!machine) notFound()

  const groups: { title: string; rows: [string, string | null | undefined][] }[] = [
    {
      title: 'Accelerators',
      rows: [
        ['Primary GPUs', gpuLine(machine)],
        ['GPU memory', gpuMemory(machine)],
        ...(machine.extraGpu ? ([['Additional GPU', machine.extraGpu]] as [string, string][]) : []),
        ['GPUs included', machine.gpuIncluded],
      ],
    },
    {
      title: 'System',
      rows: [
        ['Platform', platformClass(machine)],
        ['Form factor', machine.formLabel],
        ['CPU', machine.cpu],
        ['System memory', machine.systemMemory],
        ['Storage', machine.storage],
      ],
    },
    {
      title: 'Facility',
      rows: [
        ['Networking', machine.networking],
        ['Power', machine.power],
      ],
    },
  ]

  return (
    <main className="zc-landing machines-page machine-detail-page">
      <header className="site-header">
        <div className="wrap">
          <nav className="top" aria-label="Main navigation">
            <a href="/" className="brand" aria-label="Zipcode home">
              <Logo twoTone className="brand-logo" />
            </a>
            <div className="machine-nav">
              <a href="/">Overview</a>
              <a href="/Machines">Machines</a>
            </div>
            <div className="nav-right">
              <ThemeToggle />
            </div>
          </nav>
        </div>
      </header>

      <section className="wrap machine-detail" aria-labelledby="machine-title">
        <a className="detail-back" href="/Machines#machine-catalog">
          <span aria-hidden="true">←</span> All machines
        </a>
        <div className="detail-head">
          <div>
            <span className="eyebrow">{platformClass(machine)}</span>
            <h1 className="display" id="machine-title">
              {machine.name}
            </h1>
            <p className="detail-lead">
              {gpuLine(machine)}
              {machine.formLabel ? ` · ${machine.formLabel}` : ''}
            </p>
            {machine.reviewStatus && machine.reviewStatus !== 'Reviewed configuration' && (
              <span className="review-badge">{machine.reviewStatus}</span>
            )}
          </div>
          <div className="detail-commercial">
            <div>
              <span>Configured system</span>
              <strong>Request quote</strong>
            </div>
            <p>Availability, shipping and taxes to confirm.</p>
            <DetailSelect id={machine.id} name={machine.name} />
          </div>
        </div>

        <h2 className="detail-section-title">Baseline configuration</h2>
        <p className="detail-note">
          This is the reviewed baseline for discussion. Alternative components are not listed because they have not been
          validated; any change is confirmed with the quote.
        </p>
        <div className="detail-groups">
          {groups.map((group) => (
            <section key={group.title} className="detail-group" aria-labelledby={`group-${group.title}`}>
              <h3 id={`group-${group.title}`}>{group.title}</h3>
              <dl>
                {group.rows.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd className={value ? undefined : 'is-unknown'}>{value || TBC}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>

        {machine.notes.length > 0 && (
          <>
            <h2 className="detail-section-title">Notes</h2>
            <ul className="detail-notes">
              {machine.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </>
        )}

        <p className="catalog-disclosure">
          For discussion only. Pricing, GPU inclusion, final specifications, availability, shipping, taxes and procurement
          eligibility must be confirmed. Selecting a machine makes no commitment. Memory across multiple GPUs is aggregate
          capacity, not a single shared memory pool.
        </p>
      </section>

      <footer className="site">
        <div className="wrap machine-footer">
          <Logo twoTone />
          <span>Infrastructure, with perspective.</span>
          <span>Zipcode © 2026</span>
        </div>
      </footer>
    </main>
  )
}
