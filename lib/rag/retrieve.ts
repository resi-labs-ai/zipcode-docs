// Plan B retrieval — in-memory cosine top-k over the build-time index.
// Phase 2: fill this in when the agent is turned on. Kept dependency-free and
// unused for now so the build stays green.

export type Chunk = {
  id: string
  page: string // e.g. "/supply/szipusd"
  heading: string
  text: string
  embedding: number[]
}

export type Retrieved = Omit<Chunk, 'embedding'> & { score: number }

/**
 * Load public/rag-index.json and return the top-k chunks most similar to the
 * query embedding. Phase-2 stub — wire cosine similarity here.
 */
export async function retrieve(
  _queryEmbedding: number[],
  _k = 6,
): Promise<Retrieved[]> {
  throw new Error('RAG retrieve() is a phase-2 stub — not enabled yet.')
}

export function cosine(a: number[], b: number[]): number {
  let dot = 0
  let na = 0
  let nb = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    na += a[i] * a[i]
    nb += b[i] * b[i]
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1)
}
