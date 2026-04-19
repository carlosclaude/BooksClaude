---
tags:
  - meta
---

# BooksClaude Vault

A reading notebook and thinking tool. Not a cataloging system.

## Folders

- **Authors/** — one note per author. Bio is secondary; interpretive frame is primary.
- **Works/** — one note per work actually engaged with. Not completeness — only books worth writing about.
- **Concepts/** — the ideas that travel across authors and works. This is where the thinking happens.
- **Essays/** — longer-form writing. The AI Digital Terraforming thesis lives here.
- **Reading Log/** — chronological entries when useful. Optional.
- **_Templates/** — note templates for each type. The underscore keeps them sorted at the top.

## Graph view setup

To exclude templates and meta notes from the graph view, open the graph view, click the filter icon, and add to the filter query:

```
-path:_Templates -tag:#meta
```

The filter is stored in `.obsidian/graph.json`, which is gitignored — so you'll need to set this once per device.

## Linking conventions

Links in Obsidian are untyped by default. To preserve edge semantics (the same distinctions used in the Three.js network), each Author, Work, and Concept note has section headers that classify its outbound links:

- **Dialectical partners** — sustained mutual engagement, same problem, different answers (Nietzsche ↔ Dostoevsky).
- **Parallels** — structurally similar work, no direct dialogue.
- **In tension with** — contradicts, fails to answer, or is contested by.
- **Genealogical** — descent, influence, extension (used mainly in Concepts/).

## Frontmatter

**Authors:** `layer` (`novelist` | `philosophical-fiction` | `philosopher`), `engagement` (`forming` | `working` | `deep`), `works-read` (integer).
**Works:** `status` (`unread` | `reading` | `read` | `abandoned`), `layer`.
**Concepts:** `coined-by`, `source-work`, `domain`.

## Naming

- Authors: `Last, First.md`
- Works: title in the language read (`The Sound and the Fury.md`, not `El ruido y la furia.md`). Original title goes in frontmatter.
- Concepts: short noun phrase.

## Honesty principle

Notes reflect what you've actually read and thought, not what you'd like to have read. An author note after one novel is a one-novel note — don't fake comprehensiveness. The `engagement` field is the explicit tracker for this.
