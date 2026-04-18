# BooksClaude Vault

A reading notebook and thinking tool. Not a cataloging system.

## Folders

- **Authors/** — one note per author. Bio is secondary; interpretive frame is primary.
- **Works/** — one note per work actually engaged with. Not completeness — only books worth writing about.
- **Concepts/** — the ideas that travel across authors and works. This is where the thinking happens.
- **Essays/** — longer-form writing. The AI Digital Terraforming thesis lives here.
- **Reading Log/** — chronological entries when useful. Optional, not required.
- **_Templates/** — note templates for each type. The underscore keeps them sorted at the top.

## Linking conventions

Links in Obsidian are untyped by default — `[[Faulkner, William]]` just says "related," not how. To preserve edge semantics (the same distinctions used in the Three.js network), each Author, Work, and Concept note has section headers that classify its outbound links:

- **Dialectical partners** — sustained mutual engagement, same problem, different answers (Nietzsche ↔ Dostoevsky).
- **Parallels** — structurally similar work, no direct dialogue.
- **In tension with** — contradicts, fails to answer, or is contested by.
- **Genealogical** — descent, influence, extension (used mainly in Concepts/).

Put links under the right heading. This is what keeps the vault in sync with the 3D viz ontology.

## Naming

- Authors: `Last, First.md` (e.g. `Faulkner, William.md`, `García Márquez, Gabriel.md`).
- Works: use the title in the language you read it in (`The Sound and the Fury.md`, not `El ruido y la furia.md`). Original title goes in frontmatter.
- Concepts: short noun phrase (`Capitalist Realism.md`, `Aira Closure Taxonomy.md`).

## Frontmatter

Every note has YAML frontmatter for queryable metadata. Use it. Obsidian's Bases and Dataview plugins can slice the vault by year, nationality, status, etc. — but only if the frontmatter is actually there.

## Honesty principle

Notes reflect what you've actually read and thought, not what you'd like to have read. An author note for Faulkner after one novel is a one-novel note — don't fake comprehensiveness. Add as you read.
