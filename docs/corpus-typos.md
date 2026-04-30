# Corpus Typo Registry

The corpus in `docs/97530-corpus.md` is preserved bytes-for-bytes
(the source document is the source). The engine, however, must always
emit spell-correct output. The pattern extractor — and any code that
feeds corpus content into the engine — is responsible for normalizing
these items before they reach a renderer.

If a verbatim test ever passes because the engine emitted a typo from
this list, the test is wrong: fix the engine (or the input it was
given) so the output is the corrected form.

The registry is grouped by confidence so reviewers can sanity-check
classifications. "Definite" entries are clear misspellings or
mechanical errors. "Likely" entries are word-order or dropped-character
issues that read as errors in context. "Discuss" entries are
non-standard but defensible — flagged so the extractor decision is
explicit, not accidental.

---

## Definite — spelling errors

| Corpus form          | Corrected form         | Where it appears (Section 1 line) |
|----------------------|------------------------|------------------------------------|
| `physcial`           | `physical`             | line 46                            |
| `Paitent`            | `Patient`              | line 70                            |
| `Performace`         | `Performance`          | line 81                            |
| `vaious`             | `various`              | line 36                            |
| `iten`               | `item`                 | line 36                            |
| `house keeping`      | `housekeeping`         | line 46                            |
| `throughput session` | `throughout session`   | line 22                            |
| `O2 stats`           | `O2 sats`              | line 55 (clinical: oxygen saturation) |

## Likely — dropped or stray characters

| Corpus form        | Corrected form        | Where it appears | Notes |
|--------------------|-----------------------|------------------|-------|
| `o promote`        | `To promote`          | line 36          | Missing leading `T` — also flagged in Section 2 annotation |
| `t weight shifting`| `weight shifting`     | line 46          | Stray `t ` before `weight`; reads as a partial word |
| `BUE patient to roll` | `BUE to roll`      | line 33          | Stray `patient` after BUE; subject already established |

## Definite — typographic / formatting

| Corpus form           | Corrected form     | Where it appears | Notes |
|-----------------------|--------------------|--------------------|-------|
| `"cracking'`          | `"cracking"`       | lines 27, 33     | Opening double-quote closes with apostrophe |
| `forearm/ grip`       | `forearm/grip`     | lines 27, 33     | Stray space after slash |
| Double spaces (many)  | single space       | many lines       | Typographic; normalize on extract |
| Trailing whitespace   | (removed)          | many lines       | Whitespace at line end |

## Discuss — non-standard but possibly intentional

| Corpus form    | Possible read           | Notes |
|----------------|-------------------------|-------|
| `bed<> soft chair` | `bed to/from soft chair` | `<>` is a shorthand for bidirectional transfer; keep as a distinct token in extraction, render in long form |
| `w/c<>shower bench` | `w/c to/from shower bench` | Same shorthand, same handling |
| `compromised balance` | (no change)          | Real word, idiomatic in clinical writing — keep |
| `bilateral` vs `B`    | (no change)          | `B` is established abbreviation in P13; not a typo |
| `secondary to decreased standing balance` | (no change) | Section 3 counter-example; rule edge case, not a typo |

## Counter-examples — these are NOT typos

The corpus annotation in Section 3 of `97530-corpus.md` flags rule
edge cases (`secondary to` attaching to bare functional-state nouns,
`due to` as alternative connector, repeated paragraphs in original
message). Those are linguistic / pattern-rule questions, not spelling
errors, and do not belong in this registry.

---

## How the engine consumes this

For now there is no extractor; corpus content does not flow into the
engine automatically. Test fixtures (e.g. `test-97530-slice3.js`)
hand-author the corrected forms by referencing this registry. When
the extractor lands, it should:

1. Read corpus paragraphs verbatim from `docs/97530-corpus.md`.
2. Apply corrections from this registry as a normalization pass
   before any pattern extraction.
3. Treat any corpus content not matching a registry entry as
   already-clean text.

If a new typo turns up in the corpus that isn't in this registry,
the extractor should fail loudly rather than silently emit it. The
registry is the gate, not a hint.
