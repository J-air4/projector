/**
 * Typo normalization gate.
 *
 * The corpus in docs/97530-corpus.md is preserved bytes-for-bytes —
 * source-document fidelity. The engine, however, must always emit
 * spell-correct output: a clinician signs the engine's text into a
 * Medicare-billable document, and a misspelling there is a defect,
 * not a voice match.
 *
 * This module is the gate between the two. It exposes:
 *
 *   TYPO_REGISTRY      — canonical list of corpus typos with their
 *                        corrected forms. Mirrors docs/corpus-typos.md
 *                        (which is the human-readable explanation;
 *                        this file is the machine-readable source of
 *                        truth that the gate consults).
 *
 *   assertSpellCorrect(text)
 *                      — passes the text through unchanged when no
 *                        gated typo is present, throws an Error
 *                        listing every match when one or more are
 *                        present. Returns the input on success so
 *                        the gate can be inlined.
 *
 *   listGatedEntries() — predicate inspector for tests / tooling.
 *
 * The gate fails loud rather than silently passing through. This is
 * intentional. Silent passthrough is how a misspelling makes it into
 * a billable note six months from now and nobody notices.
 *
 * Tier policy:
 *   'definite'      — gate trips on these (clear misspellings,
 *                     unambiguous typographic errors).
 *   'typographic'   — gate trips on these (mechanical formatting
 *                     errors like quote-mark mismatches and stray
 *                     spaces in compound terms).
 *   'likely'        — NOT gated. These are dropped/stray-character
 *                     cases that need surrounding context to detect
 *                     reliably ("o promote" vs "to promote", stray
 *                     "t weight shifting"). The extractor handles
 *                     them with more context than a string match.
 *   'discuss'       — NOT gated. Non-standard but possibly intentional
 *                     ("<>" transfer shorthand). Auto-correcting
 *                     these would silently strip clinician-meaningful
 *                     shorthand. Surface as a decision instead.
 *
 * Slice 3 wired this gate into voice tests only (the test bar). Live
 * engine output is not gated yet — that's a follow-on once the gate
 * is proven on tests.
 */

const TYPO_REGISTRY = [
  // ── Definite — spelling errors ────────────────────────────────
  { wrong: 'physcial',           right: 'physical',           tier: 'definite' },
  { wrong: 'Paitent',            right: 'Patient',            tier: 'definite' },
  { wrong: 'Performace',         right: 'Performance',        tier: 'definite' },
  { wrong: 'vaious',             right: 'various',            tier: 'definite' },
  { wrong: 'iten',               right: 'item',               tier: 'definite' },
  { wrong: 'house keeping',      right: 'housekeeping',       tier: 'definite' },
  { wrong: 'throughput session', right: 'throughout session', tier: 'definite' },
  { wrong: 'O2 stats',           right: 'O2 sats',            tier: 'definite' },

  // ── Typographic ───────────────────────────────────────────────
  // Quote-mark mismatch: opening double-quote closes with apostrophe.
  { wrong: '"cracking\'',        right: '"cracking"',         tier: 'typographic' },
  // Stray space inside a compound clinical term.
  { wrong: 'forearm/ grip',      right: 'forearm/grip',       tier: 'typographic' },

  // ── Likely (not gated; documented for the extractor) ──────────
  // 'o promote'           -> 'To promote'      (missing leading T,
  //                                             needs sentence-start context)
  // 't weight shifting'   -> 'weight shifting' (stray 't', needs
  //                                             local context — could
  //                                             match "at weight" etc.)
  // 'BUE patient to roll' -> 'BUE to roll'     (stray 'patient',
  //                                             contextual)

  // ── Discuss (not gated; explicit decision required) ───────────
  // 'bed<> soft chair', 'w/c<>shower bench' — bidirectional transfer
  //   shorthand. Keep as a distinct token in extraction; render in
  //   long form when emitting.
];

const GATED_TIERS = new Set(['definite', 'typographic']);

function listGatedEntries() {
  return TYPO_REGISTRY.filter(e => GATED_TIERS.has(e.tier));
}

// Compile a word-boundary-aware matcher per entry. Some registry
// entries are substrings of OTHER registry entries — e.g. "iten" sits
// inside "Paitent" — and a naive .indexOf() match flags both even
// though only the longer typo is present. Anchoring with \b on the
// word-character ends prevents that false positive while still
// matching multi-word phrases ("house keeping") and special-character
// entries ('"cracking\'') correctly.
function _compileMatcher(wrong) {
  const escaped = wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const startsWord = /^\w/.test(wrong);
  const endsWord = /\w$/.test(wrong);
  const pattern = (startsWord ? '\\b' : '') + escaped + (endsWord ? '\\b' : '');
  return new RegExp(pattern);
}

for (const entry of TYPO_REGISTRY) {
  entry._matcher = _compileMatcher(entry.wrong);
}

function findGateMatches(text) {
  if (typeof text !== 'string' || text.length === 0) return [];
  const matches = [];
  for (const entry of TYPO_REGISTRY) {
    if (!GATED_TIERS.has(entry.tier)) continue;
    if (entry._matcher.test(text)) {
      matches.push(entry);
    }
  }
  return matches;
}

function assertSpellCorrect(text) {
  const matches = findGateMatches(text);
  if (matches.length === 0) return text;

  const lines = matches.map(m =>
    `  - "${m.wrong}" should be "${m.right}" [${m.tier}]`
  );
  const err = new Error(
    'Typo gate failed — engine output contains corpus typo(s) that ' +
    'were not normalized:\n' + lines.join('\n') +
    '\nFull text: ' + JSON.stringify(text) +
    '\nFix: normalize the input upstream of the engine, or correct the ' +
    'engine renderer that produced this token. Never edit the gate to ' +
    'remove the entry; that is silent passthrough by another name.'
  );
  err.gateMatches = matches;
  throw err;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TYPO_REGISTRY, GATED_TIERS, assertSpellCorrect, findGateMatches, listGatedEntries };
}
if (typeof window !== 'undefined') {
  window.DockyTypoGate = { TYPO_REGISTRY, GATED_TIERS, assertSpellCorrect, findGateMatches, listGatedEntries };
}
