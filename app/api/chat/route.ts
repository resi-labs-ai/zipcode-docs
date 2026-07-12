import { NextResponse } from 'next/server'

/**
 * Docs chat agent — PHASE 2 (Plan B) seam.
 *
 * Currently inert (returns 501) so it compiles and ships without an API key.
 * To turn on, replace the body with: embed question → retrieve top-k from
 * public/rag-index.json (lib/rag/retrieve.ts) → call Claude with that context →
 * stream the answer back. See lib/rag/README.md.
 */
export async function POST() {
  return NextResponse.json(
    { error: 'Chat agent is not enabled yet (phase 2).' },
    { status: 501 },
  )
}
