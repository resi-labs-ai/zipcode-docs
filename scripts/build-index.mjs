/**
 * Plan B — build-time RAG index (phase 2, disabled).
 *
 * When turned on, this walks content/**\/*.mdx, chunks each page by heading,
 * embeds each chunk, and writes public/rag-index.json for retrieve.ts to load.
 *
 * Run manually (or from a `postbuild` script) once phase 2 is on:
 *   node scripts/build-index.mjs
 */

console.log(
  '[rag] build-index is a phase-2 stub. Turn on Plan B in lib/rag/README.md to enable.',
)
process.exit(0)
