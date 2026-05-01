// Slice 6 test: P-Stack-Connectors. Three connector kinds with
// gerund-shape rendering for the second activity in non-default
// connectors. Caller-supplied hints; engine never infers
// connector from activity properties.
// Run: node test-97530-slice6.js
//
// Voice tests use the corpus typo gate (assertSpellCorrect): voice
// = sentence-shape and vocabulary match the corpus, with the engine
// emitting spell-correct output.
//
// Voice 1 — sentence-boundary regression. Two activities, no hints.
//           Output is the existing array-joined behavior (no change
//           from slice 5b).
// Voice 2 — in-addition-to: ring-toss + theraputty-rolling. Gerund
//           rendering for theraputty. Period stripped from sentence
//           1 before the connector joins.
// Voice 3 — progressed-to: theraband-knot-untying + plastic-eggs.
//           Gerund rendering for plastic-eggs. "While <toPosition>,
//           the patient progressed to ..." frame.
// Voice 4 — chained connectors: wrist-roller + plastic-eggs +
//           theraputty-rolling. progressed-to between [0]→[1] and
//           in-addition-to between [1]→[2]. Tests that gerund-mode
//           output cleanly chains into another gerund-mode hint.
//
// Logic 5 — fallback warn when gerundForm is missing on a
//           connector-target activity. Engine downgrades to
//           sentence-boundary and emits console.warn.

const DockyData = require('./docky/core/data.js');
const DockyEngine = require('./docky/core/engine.js');
const Vocab = require('./docky/core/vocabularies.js');
const { assertSpellCorrect } = require('./docky/core/typo-gate.js');
DockyEngine.init(DockyData);

const cases = [
  {
    name: 'Voice — sentence-boundary regression (no hints)',
    kind: 'voice',
    target: 'Patient untied 9/9 knots from theraband. 6 trials of standing Ring toss activity using 5 large lightweight rings.',
    run: function() {
      const params = Vocab.composeMany([
        { id: 'untie-theraband-knots', overrides: { quantification: { type: 'fraction', value: '9/9 knots' } } },
        { id: 'ring-toss', overrides: { quantification: { type: 'count', value: '6 trials' } } }
      ]);
      // No stackHints -> default sentence-boundary join via the
      // pre-slice-6 path (existing behavior).
      return DockyEngine.generate(params);
    }
  },
  {
    name: 'Voice — in-addition-to (ring-toss + theraputty-rolling)',
    kind: 'voice',
    target: '6 trials of standing Ring toss activity using 5 large lightweight rings in addition to rolling out orange theraputty with dowel bar.',
    run: function() {
      const params = Vocab.composeMany([
        { id: 'ring-toss', overrides: { quantification: { type: 'count', value: '6 trials' } } },
        { id: 'theraputty-rolling' }
      ]);
      params.stackHints = [
        { fromIndex: 0, toIndex: 1, connector: 'in-addition-to' }
      ];
      return DockyEngine.generate(params);
    }
  },
  {
    name: 'Voice — progressed-to (theraband-knots + plastic-eggs, position change)',
    kind: 'voice',
    target: 'Patient untied 9/9 knots from theraband. While standing, the patient progressed to cracking 6/12 plastic eggs with pegs inside.',
    run: function() {
      const params = Vocab.composeMany([
        { id: 'untie-theraband-knots', overrides: { quantification: { type: 'fraction', value: '9/9 knots' } } },
        { id: 'plastic-eggs', overrides: { quantification: { type: 'fraction', value: '6/12' } } }
      ]);
      params.stackHints = [
        { fromIndex: 0, toIndex: 1, connector: 'progressed-to', toPosition: 'standing' }
      ];
      return DockyEngine.generate(params);
    }
  },
  {
    name: 'Voice — chained: wrist-roller + plastic-eggs + theraputty-rolling',
    kind: 'voice',
    // Mirrors the wrist-roller-1 corpus chain shape (without the
    // intervening duration sentence and without the corpus's
    // scare-quotes around "cracking" — engine emits clean text).
    target: '4 feet of a lightweight rope rolled onto a dowel bar during wrist roller activity performed bilaterally. While standing, the patient progressed to cracking 6/12 plastic eggs with pegs inside in addition to rolling out orange theraputty with dowel bar.',
    run: function() {
      const params = Vocab.composeMany([
        { id: 'wrist-roller-activity', overrides: { quantification: { type: 'distance', value: '4 feet' } } },
        { id: 'plastic-eggs', overrides: { quantification: { type: 'fraction', value: '6/12' } } },
        { id: 'theraputty-rolling' }
      ]);
      params.stackHints = [
        { fromIndex: 0, toIndex: 1, connector: 'progressed-to', toPosition: 'standing' },
        { fromIndex: 1, toIndex: 2, connector: 'in-addition-to' }
      ];
      return DockyEngine.generate(params);
    }
  },
  {
    name: 'Logic — fallback warn when gerundForm missing',
    kind: 'logic',
    run: function() {
      // Capture console.warn calls during generate().
      const originalWarn = console.warn;
      const warns = [];
      console.warn = function() { warns.push(Array.prototype.join.call(arguments, ' ')); };
      let out;
      try {
        const params = Vocab.composeMany([
          { id: 'untie-theraband-knots', overrides: { quantification: { type: 'fraction', value: '9/9 knots' } } },
          // sit-stand-transfers has no gerundForm declared — the
          // hint's in-addition-to should warn and downgrade.
          { id: 'sit-stand-transfers', overrides: { label: 'Sit-to-stand transfers', verb: 'performed' } }
        ]);
        params.stackHints = [
          { fromIndex: 0, toIndex: 1, connector: 'in-addition-to' }
        ];
        out = DockyEngine.generate(params);
      } finally {
        console.warn = originalWarn;
      }
      return { out, warns };
    },
    assert: function(result) {
      // Engine must have emitted a warn that mentions the activity id.
      const warned = result.warns.some(w => /sit-stand-transfers/.test(w) && /gerundForm/.test(w));
      if (!warned) {
        return { ok: false, why: 'expected warn mentioning sit-stand-transfers + gerundForm; got ' + JSON.stringify(result.warns) };
      }
      // Output must use sentence-boundary join, not in-addition-to.
      // Sit-to-stand transfers preserves capital S via the slice 5c
      // capitalization heuristic (hyphenated compound + known label).
      const expected = 'Patient untied 9/9 knots from theraband. Sit-to-stand transfers performed.';
      if (result.out !== expected) {
        return { ok: false, why: 'expected sentence-boundary fallback output; got ' + JSON.stringify(result.out) };
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
      console.log('  output: ', JSON.stringify(result.out));
      console.log('  warns:  ', JSON.stringify(result.warns));
      pass++;
    }
  }
}

console.log('\n' + pass + '/' + (pass + fail) + ' passed');
process.exit(fail === 0 ? 0 : 1);
