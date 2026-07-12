import nextra from 'nextra'

const withNextra = nextra({
  defaultShowCopyCode: true,
  // Built-in flexsearch keeps a local, static search index — no external
  // service. The phase-2 RAG agent (see lib/rag/) is a separate seam.
  search: { codeblocks: false },
})

export default withNextra({
  reactStrictMode: true,
  // Hide the Next.js dev-mode "N" indicator (dev-only diagnostic, never shipped).
  devIndicators: false,
})
