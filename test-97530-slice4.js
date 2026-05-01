// Slice 4 test: P8 concrete tolerance + P12 connector handoff.
// Run: node test-97530-slice4.js
//
// Voice tests use the corpus typo gate (assertSpellCorrect): voice
// = sentence-shape and vocabulary match the corpus, but the engine
// always emits spell-correct text. The gate ensures any corpus typo
// that leaks into engine output causes a hard test failure.
//
// Targets:
//   Voice 1 — np-required (corpus typo "throughput" gate-corrected
//                          upstream of the engine; renderer emits
//                          the corrected "throughout").
//   Voice 2 — np-required + P12 functional-state default '2/2'
//             (verbatim from corpus paragraph "To improve overall
//              task performance during ADLs").
//   Voice 3 — np-required + P12 caller-overridden connector, the
//             counter-example case where 'secondary to' attaches to
//             a bare functional-state noun (verbatim from corpus
//             paragraph ", the patient was educated on EC concepts").
//   Voice 4 — patient-required form (synthetic shape but corpus
//             vocabulary).

const DockyData = require('./docky/core/data.js');
const DockyEngine = require('./docky/core/engine.js');
const { assertSpellCorrect } = require('./docky/core/typo-gate.js');
DockyEngine.init(DockyData);

const cases = [
  {
    name: 'Voice — np-required with temporal',
    kind: 'voice',
    target: 'Short rest period required throughout session.',
    params: {
      tolerance: {
        kind: 'np-required',
        np: 'Short rest period',
        temporal: 'throughout session'
      }
    }
  },
  {
    name: 'Voice — np-required + P12 functional-state default 2/2',
    kind: 'voice',
    target:
      'Multiple trials with short recovery periods required, ' +
      '2/2 decreased cardiopulmonary endurance/activity tolerance.',
    params: {
      tolerance: {
        kind: 'np-required',
        np: 'Multiple trials with short recovery periods',
        cause: {
          phrase: 'decreased cardiopulmonary endurance/activity tolerance',
          kind: 'functional-state'
        }
        // No connector override -> default rule emits '2/2' for
        // functional-state cause.
      }
    }
  },
  {
    name: 'Voice — np-required + P12 caller override (counter-example)',
    kind: 'voice',
    // Corpus counter-example: 'secondary to' attaches to a bare
    // functional-state noun, contradicting the engine's locked
    // default ('2/2'). Caller honors the corpus by overriding.
    target: '2 rest required secondary to decreased activity tolerance.',
    params: {
      tolerance: {
        kind: 'np-required',
        np: '2 rest',
        cause: {
          phrase: 'decreased activity tolerance',
          kind: 'functional-state'
        },
        connector: 'secondary to',  // caller override of default '2/2'
        tightCause: true            // corpus form has no comma here
      }
    }
  },
  {
    name: 'Voice — patient-required form',
    kind: 'voice',
    target: 'Patient required multiple short breaks.',
    params: {
      tolerance: {
        kind: 'patient-required',
        np: 'multiple short breaks'
      }
    }
  }
];

let pass = 0, fail = 0;

for (const c of cases) {
  const out = DockyEngine.generate(c.params);
  const got = typeof out === 'string' ? out : JSON.stringify(out);

  if (c.kind === 'voice') {
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
  }
}

console.log('\n' + pass + '/' + (pass + fail) + ' passed');
process.exit(fail === 0 ? 0 : 1);
