// Slice 3 test: observation slots (P-Obs-Pre/Within/Summary) +
// P12 causal connector primitive with cause-registry dedup.
// Run: node test-97530-slice3.js
//
// Two test categories with different pass bars:
//
//   VOICE tests pass when output matches a sentence-shape and
//     vocabulary that mirrors the corpus, but with all corpus
//     typos corrected. The corpus stays bytes-for-bytes in
//     docs/97530-corpus.md (the source document is the source);
//     the engine, however, must always emit spell-correct output.
//     If the engine ever produces a corpus typo verbatim, the test
//     fails and the engine gets fixed (typically by normalizing in
//     the extractor before the data reaches the engine). See
//     docs/corpus-typos.md for the registry.
//
//   LOGIC tests pass when output matches a behavioral assertion.
//     There's no verbatim corpus fragment for the asserted shape;
//     the test verifies the engine does the right thing logically
//     (e.g. dedup elides a second occurrence).
//
// Bar:
//   Voice: target === output, byte for byte.
//   Logic: explicit assertion described in the case.

const DockyData = require('./docky/core/data.js');
const DockyEngine = require('./docky/core/engine.js');
const { assertSpellCorrect } = require('./docky/core/typo-gate.js');
DockyEngine.init(DockyData);

const cases = [
  // ─────────────────────────────────────────────────────────────
  // VOICE TESTS (verbatim against corpus)
  // ─────────────────────────────────────────────────────────────
  {
    name: 'Voice — Obs-Within "noted" with contextual tail (standalone)',
    kind: 'voice',
    // Verbatim sentence from corpus paragraph "o promote safety and
    // independence within living environment". Tested standalone to
    // isolate the observation renderer from activity stack shape.
    target: 'Posterior retropulsion noted when standing from w/c.',
    params: {
      observations: [{
        position: 'within',
        kind: 'noted',
        content: 'Posterior retropulsion',
        context: 'when standing from w/c'
      }]
    }
  },
  {
    name: 'Voice — Obs-Within "count-instances" (corpus typo corrected)',
    kind: 'voice',
    // Sentence shape from corpus paragraph "Patient instructed in 4/4 trials".
    // The corpus text reads "physcial assist"; engine output must be
    // spell-correct, so the test asserts "physical". Corpus stays
    // bytes-for-bytes in docs/97530-corpus.md; the extractor / caller
    // normalizes before reaching the engine. See docs/corpus-typos.md
    // for the full registry of corpus typos that must not encode as
    // "voice".
    target: '1 instance of instability without physical assist to correct noted.',
    params: {
      observations: [{
        position: 'within',
        kind: 'count-instances',
        count: '1',
        content: 'instability',
        qualifier: 'without physical assist to correct'
      }]
    }
  },
  {
    name: 'Voice — Obs-Summary "negation" form',
    kind: 'voice',
    // Verbatim from corpus paragraph "Item retrieval completed while seated EOB":
    //   "No loss of balance this session"
    target: 'No loss of balance this session.',
    params: {
      observations: [{
        position: 'summary',
        kind: 'negation',
        phrase: 'No loss of balance',
        temporal: 'this session'
      }]
    }
  },

  // ─────────────────────────────────────────────────────────────
  // LOGIC TESTS (behavioral, not voice)
  // ─────────────────────────────────────────────────────────────
  {
    name: 'Logic — P12 dedup elides connector on second occurrence',
    kind: 'logic',
    // Two Within observations both attribute to the same cause
    // ("shortness of breath"). The first emits the full connector
    // tail "secondary to shortness of breath". The second elides
    // the tail entirely (slice 3 simple elision; future P-BackRef
    // slices will produce a richer back-reference here).
    params: {
      observations: [
        {
          position: 'within',
          kind: 'noted',
          content: 'Patient verbalized need to sit',
          cause: { phrase: 'shortness of breath', kind: 'symptom' }
        },
        {
          position: 'within',
          kind: 'noted',
          content: 'Activity ceased',
          cause: { phrase: 'shortness of breath', kind: 'symptom' }
        }
      ]
    },
    assert: function(out) {
      // First occurrence MUST contain "secondary to shortness of breath".
      // Second occurrence MUST NOT contain a second copy.
      if (typeof out !== 'string') {
        return { ok: false, why: 'engine returned non-string: ' + JSON.stringify(out) };
      }
      const matches = out.match(/secondary to shortness of breath/g) || [];
      if (matches.length !== 1) {
        return { ok: false, why: 'expected 1 connector emission, got ' + matches.length + ' — output: ' + JSON.stringify(out) };
      }
      // Second sentence ("Activity ceased noted.") MUST end with bare
      // elision — no comma-connector tail.
      if (!/Activity ceased noted\./.test(out)) {
        return { ok: false, why: 'second occurrence did not elide cleanly — output: ' + JSON.stringify(out) };
      }
      return { ok: true };
    }
  }
];

let pass = 0, fail = 0;

for (const c of cases) {
  const out = DockyEngine.generate(c.params);
  const got = typeof out === 'string' ? out : JSON.stringify(out);

  if (c.kind === 'voice') {
    // Spell-correctness gate. Voice tests must pass through the
    // typo gate before the byte-string compare. If the engine ever
    // emits a corpus typo verbatim, the gate throws and the test
    // fails with a specific error pointing at the typo and its
    // corrected form. The gate is the structural enforcement of the
    // "engine output is always spell-correct" rule.
    try {
      assertSpellCorrect(got);
    } catch (gateErr) {
      console.log('FAIL', '[voice]', c.name);
      console.log('  gate:    ', gateErr.message.split('\n').map((l,i) => i===0 ? l : '           ' + l).join('\n'));
      fail++;
      continue;
    }
    const ok = got === c.target;
    console.log(ok ? 'PASS' : 'FAIL', '[voice]', c.name);
    if (!ok) {
      console.log('  expected:', JSON.stringify(c.target));
      console.log('  got:     ', JSON.stringify(got));
      fail++;
    } else {
      console.log('  output:  ', JSON.stringify(got));
      pass++;
    }
  } else if (c.kind === 'logic') {
    const result = c.assert(out);
    console.log(result.ok ? 'PASS' : 'FAIL', '[logic]', c.name);
    if (!result.ok) {
      console.log('  why:    ', result.why);
      fail++;
    } else {
      console.log('  output: ', JSON.stringify(got));
      pass++;
    }
  }
}

console.log(`\n${pass}/${pass + fail} passed`);
process.exit(fail === 0 ? 0 : 1);
