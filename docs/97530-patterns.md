# 97530 Patterns

This is the canonical spec for the patterns the v2 engine emits. The
engine docstring (`docky/core/engine.js`) is the implementation
reference; the corpus (`docs/97530-corpus.md`) is the evidence. This
file is the bird's-eye view: pattern names, current status, locked
rules.

When the spec and the engine disagree, the engine is wrong unless
this doc is wrong. Either way, fix one, then fix the other in the
same commit.

---

## Cross-cutting rules

### Renderer asymmetry — hard-fail vs. graceful-degrade

Every per-slot renderer in the engine returns one of:
- `string` — the rendered slot
- `null` — no content for this slot, skip cleanly
- `{ error, ... }` — required-path failure, bubble to v1 fallback

The choice is structural, not stylistic:

- **Hard-fail (`{ error }`)** when a field is REQUIRED by the
  rendering path the engine has already committed to. Example: once
  P15 foregrounding picks "lead with quantification," a malformed
  quantification field is a developer bug. The engine errors and
  the translation layer falls back to v1.

- **Graceful-degrade (`null`)** when a field is OPTIONAL in the
  per-note flow. Cues, observations, tolerance, closers are
  optional flow slots — if the input doesn't carry enough to render
  them in corpus voice, skip the slot, emit the rest of the note.
  No error.

Test: required-path-component vs. optional-flow-slot. New renderers
follow the same rule. Translation gaps are not engine bugs; engine
bugs are engine bugs.

### Spell-correctness gate

The corpus is preserved bytes-for-bytes in `docs/97530-corpus.md`.
Engine output is always spell-correct. These two rules are not in
conflict: the corpus is training data; the engine produces audit-
billable notes. A misspelling from the corpus must never appear in
engine output verbatim.

`docky/core/typo-gate.js` is the structural enforcement. Voice tests
pass output through `assertSpellCorrect` before byte-string compare,
so any leak fails loud. Catalog of corpus typos lives in
`docs/corpus-typos.md` (human-readable) and `TYPO_REGISTRY` in
`docky/core/typo-gate.js` (machine-readable, source of truth for
the gate).

### Per-note cause registry (P12 substrate)

`generate()` creates a single `{ causesNamed: Set }` per note and
threads it through every renderer that may emit a causal connector.
First-occurrence-wins dedup: `_renderCausalConnector` registers a
normalized cause phrase on emit, and returns `{ phrase: null,
reason: 'dedup' }` on subsequent occurrences within the same note.
Callers elide the connector tail on dedup (slice 3); P-BackRef will
later produce a richer back-reference form here.

---

## Per-flow pattern catalog

Per-note flow:

```
opener -> pre-obs -> activity stack -> within-obs -> cues -> summary-obs -> tolerance -> closer
```

Status:
- ✓ implemented and verbatim-tested
- ◐ partially implemented (sub-pattern landed; sub-patterns pending)
- ○ stubbed / deferred

| Pattern | Slot | Status | Slice | Notes |
|---------|------|--------|-------|-------|
| **P1.a activity-as-subject** | opener | ✓ | 1 | First activity sentence carries the note; opener returns null. |
| **P1.b patient-as-agent**    | opener | ✓ | 1 | "Patient <verb> <qStr> from <substrate>..." |
| **P2 to-promote**            | opener | ✓ | 1 | "To <verb> <goal>, <activity clause>." Comma-joins to first activity. |
| **P3 skilled-interventions** | opener | ✓ | 1 | "Skilled interventions <focused on\|included> <focus> to <purpose>." Standalone. |
| **P4 activity stack**        | activity stack | ◐ | 1 | Orchestrator landed. Per-activity P12 emission deferred. P-Stack-Connectors deferred. |
| **P5 quantification**        | activity stack | ◐ | 1 | Foregrounded forms (fraction/sets/count/duration/distance) render via P15. Non-foregrounded slot rendering deferred. |
| **P6 flat cue**              | cues | ✓ | 2 | "<quantity\|level> <type> cues <purpose>[ <tail>]." Single cue per note. |
| **P6 chained cue**           | cues | ○ | — | High-skill form: cueing -> means -> outcome. **Open priority** — engine systematically under-reads skilled cueing without it. |
| **P6 multi-cue stack**       | cues | ○ | — | Multiple cue sentences; sentence-boundary stack connectors deferred. |
| **P7 goal in opener**        | opener | ✓ | 1 | Implemented via P2 (`To <verb> <goal>, ...`). |
| **P8 concrete tolerance**    | tolerance | ✓ | 4 | Two shapes: `np-required` ("<np> required[ <temporal>]"), `patient-required` ("Patient required <np>"). Both accept P12 cause + caller-controlled connector + tightCause separator. |
| **P9 generic-progress closer** | closer | ✓ | 2 | "The patient continues to make good progress toward therapeutic goals." Floor, not default — defer to within-session improvement when that ships. |
| **P9 within/cross-session closer** | closer | ○ | — | Specific-improvement closer forms. Deferred. |
| **P10 plan tail**            | (post-closer) | ○ | — | Not in v2 flow today; the corpus 97530 paragraphs do not carry plan tails. |
| **P11 patient-education events** | various | ○ | — | Deferred per user filter; cross-cuts CPT codes. Several 97530 paragraphs carry these (see corpus Section 3 P11 deferred entries). |
| **P12 causal connector**     | (utility) | ✓ | 3 | Primitive only; emitted from observations (slice 3) and tolerance (slice 4). Default rules: functional-state -> '2/2'; symptom/diagnostic/behavior -> 'secondary to'. Caller controls override + 'due to'. |
| **P13 abbreviations**        | (no slot) | — | n/a | Pass-through; engine treats abbreviations as opaque content tokens. |
| **P15 foregrounding**        | activity stack | ✓ | 1 | 4-component test (quantification / equipment / position / activity-as-event) + 8-step tiebreaker. See locked rule below. |
| **P-Obs-Pre/Within/Summary** | obs slots | ✓ | 3 | Single renderer routed by caller-tagged `position` (default `within`). Three kinds: `noted`, `count-instances`, `negation`. |
| **P-BackRef**                | (utility) | ○ | — | Return shape reserved in P12 primitive (`{ phrase: null, reason: 'backref', backRef }`). Not produced today. |
| **P-Stack-Connectors**       | activity stack | ○ | — | "in addition to", "progressed to" — currently default sentence-boundary stacking only. |

P14 is unassigned (no anchor in corpus annotations).

---

## Locked rules

### P15 foregrounding (rank order)

For each activity sentence, exactly one component is foregrounded.
Ranked tiebreaker:

```
1. fraction          (e.g. 9/9 knots, 6/12 plastic eggs)
2. sets              (e.g. 9x3 reps)
3. count             (e.g. 6 trials)
4. duration          (e.g. 7 minutes)
5. distance          (e.g. 4 feet, 250 feet)
6. equipment-substrate
7. equipment-graded         } both render as "equipment-substrate"
8. equipment-qualifying     } sentence shape; rank distinguishes pick
9. position
10. activity-as-event       (fallback when no other signal)
```

If no signal is present and no activity label exists, the renderer
errors (`no_foregroundable_signal`).

### P12 connector defaults

When the caller does not specify `options.connector`:

| Cause kind | Connector |
|------------|-----------|
| functional-state | `2/2` |
| symptom | `secondary to` |
| diagnostic | `secondary to` |
| behavior | `secondary to` |

Caller may override via `options.connector` (or per-slot field
`connector`). `'due to'` is caller-only — the engine never picks it
on its own. The corpus has too few `'due to'` instances to lock an
attachment rule; promoting it to a default requires more evidence.

### P12 separator (`tightCause`)

The corpus uses both comma-joined (`X required, secondary to Y`)
and tight (`X required secondary to Y`) attachments. No clean rule
distinguishes. Default `, ` (dominant corpus form); caller passes
`tightCause: true` to use a single space instead.

### Counter-example: bare functional-state nouns

Corpus contains both `2/2 decreased X` (matches default) and
`secondary to decreased X` (contradicts default). The locked rule
`functional-state -> '2/2'` stays. Callers honor the corpus voice
in counter-example cases by passing `connector: 'secondary to'`
explicitly. See corpus Section 3 for the catalog.

### P9 generic closer is the floor, not the default

`The patient continues to make good progress toward therapeutic
goals.` emits when no more specific closing observation is
available. When `_renderSummaryObs` and the within-session
improvement closer ship, the generic closer must defer to them.
Today the deference check is implicit because nothing else
competes for the closer slot.

---

## Cross-cuts and open priorities

In rough priority order:

1. **P6 chained-cue form.** The high-skill cue shape ties
   cueing -> means -> outcome and may carry a P12 cause. Without it
   the engine systematically under-reads skilled cueing on inputs
   that carry the structure. Should land before week 2 wraps.

2. **P-Obs-Within attached to specific activities.** Slice 3 puts
   within-observations as a flat block between the activity stack
   and cues. Real corpus often interleaves obs into specific
   activity tails. Per-activity attachment is a refinement.

3. **P-Stack-Connectors.** Two-activity notes currently read as two
   sentences side by side. Real corpus uses "in addition to" /
   "progressed to" as meaningful connectives.

4. **P9 within-session improvement closer.** Once obs slots can
   produce within-session improvement narratives, the generic
   closer should defer to them.

5. **P-BackRef.** P12 primitive return shape is reserved; rendering
   form not implemented. Slice that lands this also revises slice 3
   dedup behavior to use back-references where appropriate.

6. **Live engine output through the spell-correctness gate.** The
   gate runs on test outputs today. Wiring it to live output is a
   small follow-on; should land alongside the next slice that
   touches user-facing output.

---

## Conventions

- A new slice is one or two patterns plus their verbatim tests.
- Each verbatim test cites a corpus paragraph or notes when it is
  synthetic (logic-only).
- Voice tests pass output through `assertSpellCorrect` before
  byte-string compare. Logic tests run a behavioral assertion.
- The corpus is bytes-for-bytes; the typo registry is the gate.
- New typos discovered in the corpus go into both
  `docs/corpus-typos.md` and `docky/core/typo-gate.js` in the same
  commit. Anything outside the registry must fail loud, not pass
  through.
