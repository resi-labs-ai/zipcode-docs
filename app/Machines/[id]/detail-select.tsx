'use client'

import { useEffect, useState } from 'react'
import { MACHINES, MAX_SELECTION } from '../catalog'

// Shares the catalog's browser-local selection. Nothing is sent anywhere.
const STORAGE_KEY = 'zipcode-machine-selection-v1'
const knownIds = new Set(MACHINES.map((machine) => machine.id))

function read(): string[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(saved)
      ? [...new Set(saved.filter((id): id is string => typeof id === 'string' && knownIds.has(id)))].slice(0, MAX_SELECTION)
      : []
  } catch {
    return []
  }
}

export function DetailSelect({ id, name }: { id: string; name: string }) {
  const [ids, setIds] = useState<string[] | null>(null)
  const [notice, setNotice] = useState('')

  useEffect(() => setIds(read()), [])

  const selected = ids?.includes(id) ?? false

  function toggle() {
    const current = read()
    let next: string[]
    if (current.includes(id)) {
      next = current.filter((x) => x !== id)
      setNotice(`${name} removed from your selection.`)
    } else if (current.length >= MAX_SELECTION) {
      setNotice(`Compare up to ${MAX_SELECTION} configurations at a time. Remove one in your selection first.`)
      return
    } else {
      next = [...current, id]
      setNotice(`${name} added to your selection.`)
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      setNotice('Your browser is not saving selections. Use the catalog to compare instead.')
    }
    setIds(next)
  }

  return (
    <div className="detail-select">
      <button
        type="button"
        className={`machine-select${selected ? ' selected' : ''}`}
        aria-pressed={selected}
        aria-label={`${selected ? 'Remove' : 'Select'} ${name}`}
        onClick={toggle}
        disabled={ids === null}
      >
        <span>{selected ? 'Selected' : 'Add to selection'}</span>
        <span aria-hidden="true">{selected ? '✓' : '+'}</span>
      </button>
      <a className="detail-compare" href="/Machines#selection-title">
        Compare your selection{ids && ids.length ? ` (${ids.length})` : ''} <span aria-hidden="true">→</span>
      </a>
      <p className="sr-only" role="status" aria-live="polite">
        {notice}
      </p>
    </div>
  )
}
