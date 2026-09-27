# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`docs/CONTEXT.md`**: the domain glossary — what a "billet" is, the three origins, what the system deliberately does not do.
- **`docs/DECISIONS.md`**: a single running log of design decisions with the discarded alternative, in place of per-ADR files. Append a new entry here when you make a decision; never rewrite an existing entry.

If either file doesn't exist, proceed silently — don't flag its absence or suggest creating it upfront.

## File structure (single-context)

```
/
├── docs/
│   ├── CONTEXT.md
│   └── DECISIONS.md
└── web/
    └── src/
```

## Use the glossary's vocabulary

When your output names a domain concept (issue title, refactor proposal, hypothesis, test name), use the term as defined in `docs/CONTEXT.md` (`billet`, `entrees`, `scanne`, etc. — French, matching existing UI copy per `AGENTS.md`). Don't drift to synonyms the glossary avoids.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag decision conflicts

If your output contradicts an existing entry in `docs/DECISIONS.md`, surface it explicitly rather than silently overriding:

> _Contredit la décision "Pas de dashboard temps réel" — mais ça vaut la peine de rouvrir la question parce que…_
