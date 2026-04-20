---
title: Literary Network 3D - Viz Documentation
status: v7
last-edited: 2026-04-19
tags:
  - meta
  - viz
---

# Literary Network 3D — Viz Documentation

The 3D interactive literary graph is the visual counterpart to the vault. Both use the same layer taxonomy and edge vocabulary, so a node in the viz corresponds to a note in `Authors/`, and an edge label in the viz should be recognizable as a section header in the corresponding author note.

This file documents the shared vocabulary so that extensions to the viz and additions to the vault stay in sync.

## Current state

- **Version:** v7
- **Nodes:** 70 (including 1 frontier node)
- **Edges:** 251
- **File:** `literary-network-3d-v7.jsx` — React + Three.js, single-file component

## Layer taxonomy

Three horizontal layers, bottom to top:

- **Layer 0 — Philosophers.** Pure theory, no fiction. 16 nodes. In the vault: `layer: philosopher` in author frontmatter.
- **Layer 1 — Ideas through fiction.** Philosophical novelists, novelists who use fiction as investigation. 30 nodes. Vault: `layer: philosophical-fiction`.
- **Layer 2 — Pure novelists.** Genre, craft, narrative — not philosophical-investigation-first. 21 nodes + 1 frontier. Vault: `layer: novelist`.

The layer is not a value judgment. Layer 2 is not "lower" than Layer 1. The split is about *what the work is doing*, not how good it is. Some of the strongest writing in the network (Schweblin, Krasznahorkai, Aira) sits across or ambiguously between the layers.

## Edge taxonomy

Seven relationship types, each with a distinct color in the viz and a corresponding section-header convention in author notes:

| Viz edge type | Vault section header | Meaning |
|---|---|---|
| `genealogy` | *Genealogical* | Direct inheritance. A descends from B, A inherits architecture from B. |
| `parallel` | *Parallels* | Structural kinship without inheritance. Same move, separate origins. |
| `tension` | *In tension with* | Same problem, opposite solutions. The authors share a question and disagree. |
| `divergence` | *In tension with* (specialized) | Split from a shared origin — one source, two descendants going different ways. |
| `dialogue` | *Dialectical partners* | Neither parallel nor tension: sustained engagement with shared foundations and divergent prescriptions. The Nietzsche–Dostoevsky case is the paradigm. |
| `reading_path` | (not a formal section; included inline if relevant) | "X prepared me to read Y." Personal-reading-history, not intrinsic. |
| `frontier_link` | *Open threads* | Connection to an unmapped author or concept worth eventually mapping. |

When an author note lists another author under *Dialectical partners*, that should correspond to a `type: "dialogue"` edge in the viz (or, for pre-dialogue-type authors in v1–v4, upgrade when touched).

## Engagement tags

Author frontmatter uses `engagement:` with these values:

- **`deep`** — substantial corpus read; confident analysis possible
- **`working`** — at least one major work read; analysis is real but partial
- **`forming`** — one book or in-progress; claims are provisional
- **`not-read`** — referenced in the network (for comparison or genealogy) but not personally read; claims are critical framing, not my reading. Nodes with this tag should not be treated as authoritative readings — they're scaffolding.

## Satellite notes

Authors that appear in the viz but do not have a full batch-level note carry `satellite: true` in frontmatter and are intentionally compact. They exist to keep the network healthy — so every viz node links to *something* in the vault — without claiming false depth. When more material accumulates on a satellite author, the note can be expanded and the `satellite` tag removed.

## Relationship between viz and vault

- Every viz node should correspond to an author note in `Authors/`.
- Every non-trivial edge in the viz should be restate-able as a short paragraph in the *Dialectical partners*, *Parallels*, or *In tension with* section of the source author's note.
- Concepts (in `Concepts/`) are not nodes in the viz — the viz is authors/philosophers only. When a concept is load-bearing across multiple authors (e.g., [[I-Thou and I-It]], [[Accumulation vs Subtraction]]), it lives in `Concepts/` and is linked from each relevant author note.

## v8 open questions

- **Generative-question layout.** Treating the existentialist core (Dostoevsky–Nietzsche–Camus) as the organizing question of the network, with radial distance from it encoding something meaningful, would require a separate layout algorithm rather than a state overlay. Flagged for v8.
- **Liu Cixin placement.** Layer 1 (philosophical-fiction, Dark Forest as genuine cosmological architecture) vs. Layer 2 (pure novelist, prose-as-delivery-vehicle). Currently Layer 1; open question for v8 after *Dark Forest* and *Death's End* are complete.
- **Frontier nodes.** *Female Gothic* is the only current frontier node (unmapped cluster to test: Shirley Jackson, Angela Carter, Carmen Maria Machado, Daphne du Maurier). If the frontier approach pays off, similar placeholder nodes could be added for other unmapped clusters (e.g., *post-Soviet Eastern European*, *contemporary Japanese uncanny*).

## Deployment

The Three.js component lives in `Viz/literary-network-3d-v7.jsx` and is standalone — React + Three.js + OrbitControls. To render it inline in an Obsidian vault, either:

1. Use an external React host that imports the component and embeds the resulting page via iframe.
2. Port to a pre-bundled standalone HTML (single file, no build step) for direct browser opening.

Option 2 is the simpler vault-integration path and is worth building as a v7.1 output.
