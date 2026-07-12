# RAG agent — phase 2 (Plan B seam)

This folder is the home for the docs chat agent. Nothing here runs yet — it's
scaffolding so "Plan B" (build-time static index, in-memory retrieval, all
Anthropic) can be turned on without restructuring anything.

## The shape (Plan B)

1. **Index at build time.** `scripts/build-index.mjs` walks `content/**/*.mdx`,
   chunks each page, embeds each chunk, and writes `public/rag-index.json`
   (git-ignored — regenerated on every build). A few hundred KB for a docs-sized
   corpus.

2. **Retrieve + answer at query time.** `app/api/chat/route.ts` (currently a
   501 stub) loads the index, embeds the question, takes the top-k chunks by
   cosine similarity, and calls Claude (Haiku 4.5) with those chunks as the only
   context. Streams the answer back with citations to page anchors.

3. **Widget.** A floating chat component mounted in the theme calls
   `/api/chat`, styled in the mint/terminal skin.

## What to add when turning it on

- `pnpm add @anthropic-ai/sdk` and an embeddings provider (Voyage, or reuse
  Anthropic's recommended embedding model).
- `ANTHROPIC_API_KEY` (+ embeddings key) in `.env.local`.
- Fill in `retrieve.ts` (cosine top-k over the loaded index).
- Replace the 501 body in `app/api/chat/route.ts` with retrieve → prompt → stream.

## Guardrails (system prompt)

Answer **only** from retrieved doc context. If a question isn't covered, say so
— never speculate on unaudited mechanics, and never give financial advice.

## Upgrade path (Plan C)

If the corpus outgrows an in-memory JSON index, swap `retrieve.ts` for a vector
DB (Cloudflare Vectorize / Supabase pgvector). Nothing else changes.
