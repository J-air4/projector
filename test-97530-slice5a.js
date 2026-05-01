// Slice 5a test: vocabulary-composed activity entries produce engine
// params equivalent to slice 1's hand-authored fixtures.
// Run: node test-97530-slice5a.js
//
// Voice tests use the corpus typo gate (assertSpellCorrect): voice
// = sentence-shape and vocabulary match the corpus, with the engine
// emitting spell-correct output. The gate ensures any corpus typo
// that leaks into engine output causes a hard test failure.
//
// Targets (in slice 1 order — Fragment A / C / D):
//   Voice 1 — wrist-roller-activity composed via vocabularies, with
//             quantification + opener overrides. Matches slice 1's
//             Fragment A target (qVerbS shape).
//   Voice 2 — untie-theraband-knots composed via vocabularies, with
//             quantification override. Matches slice 1's Fragment C
//             target (patientQS shape).
//   Voice 3 — ring-toss composed via vocabularies, with quantification
//             override. Matches slice 1's Fragment D target (qActivityS
//             shape with bundled substrate-graded equipment).
//
// Logic test:
//   Logic 1 — composition of ring-toss produces equipment.substrate
//             that is classified as bundled by the engine, exercising
//             the substrate-graded-bundled class path. Verifies the
//             engine sees the class, not just the phrase.

const DockyData = require('./docky/core/data.js');
const DockyEngine = require('./docky/core/engine.js');
const Vocab = require('./docky/core/vocabularies.js');
const { assertSpellCorrect } = require('./docky/core/typo-gate.js');
DockyEngine.init(DockyData);

const cases = [
  {
    name: 'Voice — wrist-roller-activity composed (Fragment A)',
    kind: 'voice',
    target:
      'To promote bilateral coordination and forearm/grip strength, ' +
      '4 feet of a lightweight rope rolled onto a dowel bar during ' +
      'wrist roller activity performed bilaterally.',
    run: function() {
      const params = Vocab.compose('wrist-roller-activity', {
        opener: {
          type: 'to-promote',
          verb: 'promote',
          goal: 'bilateral coordination and forearm/grip strength'
        },
        quantification: { type: 'distance', value: '4 feet' }
      });
      return DockyEngine.generate(params);
    }
  },
  {
    name: 'Voice — untie-theraband-knots composed (Fragment C)',
    kind: 'voice',
    target: 'Patient untied 9/9 knots from theraband.',
    run: function() {
      const params = Vocab.compose('untie-theraband-knots', {
        quantification: { type: 'fraction', value: '9/9 knots' }
      });
      return DockyEngine.generate(params);
    }
  },
  {
    name: 'Voice — ring-toss composed, bundled-class path (Fragment D)',
    kind: 'voice',
    target: '6 trials of standing Ring toss activity using 5 large lightweight rings.',
    run: function() {
      const params = Vocab.compose('ring-toss', {
        quantification: { type: 'count', value: '6 trials' }
      });
      return DockyEngine.generate(params);
    }
  },
  {
    name: 'Logic — ring-toss composition produces bundled equipment classification',
    kind: 'logic',
    run: function() {
      const params = Vocab.compose('ring-toss', {
        quantification: { type: 'count', value: '6 trials' }
      });
      const eq = params.activities[0].equipment || {};
      // Composed substrate is an array of {phrase, class} objects.
      // Engine's _classifyEquipment must report bundled=true.
      const classification = DockyEngine._classifyEquipment(eq);
      const item = (eq.substrate || [])[0];
      return {
        composedItem: item,
        classification,
        engineOutput: DockyEngine.generate(params)
      };
    },
    assert: function(result) {
      if (!result.composedItem || result.composedItem.class !== 'substrate-graded-bundled') {
        return { ok: false, why: 'composer did not emit substrate-graded-bundled class. item=' + JSON.stringify(result.composedItem) };
      }
      if (result.classification.bundled !== true) {
        return { ok: false, why: 'engine did not flag bundled=true. classification=' + JSON.stringify(result.classification) };
      }
      if (result.classification.substrate !== true) {
        return { ok: false, why: 'engine did not flag substrate=true. classification=' + JSON.stringify(result.classification) };
      }
      // Verify the rendered output is unchanged from Fragment D.
      const expected = '6 trials of standing Ring toss activity using 5 large lightweight rings.';
      if (result.engineOutput !== expected) {
        return { ok: false, why: 'engine output mismatch. expected=' + JSON.stringify(expected) + ' got=' + JSON.stringify(result.engineOutput) };
      }
      return { ok: true };
    }
  }
];

let pass = 0, fail = 0;

for (const c of cases) {
  if (c.kind === 'voice') {
    const out = c.run();
    const got = typeof out === 'string' ? out : JSON.stringify(out);
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
    const result = c.run();
    const verdict = c.assert(result);
    console.log(verdict.ok ? 'PASS' : 'FAIL', '[logic]', c.name);
    if (!verdict.ok) {
      console.log('  why:    ', verdict.why);
      fail++;
    } else {
      console.log('  classification: bundled=' + result.classification.bundled +
                  ', substrate=' + result.classification.substrate);
      pass++;
    }
  }
}

console.log('\n' + pass + '/' + (pass + fail) + ' passed');
process.exit(fail === 0 ? 0 : 1);
