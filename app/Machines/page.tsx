import type { Metadata } from 'next'
import '../landing.css'
import './machines.css'
import { MachineExplorer } from './machine-explorer'

const description = 'Explore GPU configurations with Zipcode. Compare specifications, build your selection, and save a summary for your infrastructure discussion.'

export const metadata: Metadata = {
  title: 'Machines — GPU configuration explorer',
  description,
  robots: { index: true, follow: true },
  alternates: { canonical: '/Machines' },
  openGraph: { title: 'Machines · Zipcode', description, type: 'website' },
  twitter: { card: 'summary', title: 'Machines · Zipcode', description },
}

export default function MachinesPage() {
  return <MachineExplorer />
}
