// Slice 8 test: P-Cue. Single-cue renderer with chained-cue support
// (`chain` field), context tail (`context`), P12 causal tail
// (`causalTail`). Multi-cue stacks deferred — warn-and-render-first.
// Run: node test-97530-slice8.js
//
// Voice tests use the corpus typo gate (assertSpellCorrect): voice
// = sentence-shape and vocabulary match the corpus, with the engine
// emitting spell-correct output.
//
// Voice 1 — flat cue, plain (corpus: wrist-roller-2 "min verbal cues
//           for pacing"). Tests the bare-minimum field set.
// Voice 2 — flat cue with context (corpus: ring-toss-1 second cue
//           "Min verbal cues for hip mobility when reaching towards
//           the ground"). Tests the renamed `context` field that
//           replaces slice-2's `tail`.
// Voice 3 — chained cue (corpus: dynamic-standing-1 "MOD verbal
//           cues for BLE and foot placement facilitating wider BOS
//           for increased stability"). The strongest chained anchor
//           in the 97530 corpus. Tests `chain` field concat.
// Voice 4 — chained cue + P12 causal tail (corpus: number-tap-1
//           cue B). Splits purpose/chain/causalTail into separate
//           fields to exercise the chain+causalTail interaction;
//           byte output matches the corpus verbatim. tightCause
//           defaults to false → comma form.
//
// Logic 1 — multi-cue stack warns and renders first cue only.
// Logic 2 — cue.tail field is rejected with an explicit error
//           (slice 8 migration loud-fail; no silent drop).

const DockyData = require('./docky/core/data.js');
const DockyEngine = require('./docky/core/engine.js');
const { assertSpellCorrect } = require('./docky/core/typo-gate.js');
DockyEngine.init(DockyData);

const cases = [
  {
    name: 'Voice — flat cue, plain (wrist-roller-2)',
    kind: 'voice',
    target: 'min verbal cues for pacing.',
    run: function() {
      return DockyEngine.generate({
        cues: [{ quantity: 'min', type: 'verbal', purpose: 'pacing' }]
      });
    }
  },
  {
    name: 'Voice — flat cue with context (ring-toss-1)',
    kind: 'voice',
    target: 'Min verbal cues for hip mobility when reaching towards the ground.',
    run: function() {
      return DockyEngine.generate({
        cues: [{
          level: 'Min',  // v1-compat fallback exercised
          type: 'verbal',
          purpose: 'hip mobility',
          context: 'when reaching towards the ground'
        }]
      });
    }
  },
  {
    name: 'Voice — chained cue (dynamic-standing-1)',
    kind: 'voice',
    target: 'MOD verbal cues for BLE and foot placement facilitating wider BOS for increased stability.',
    run: function() {
      return DockyEngine.generate({
        cues: [{
          quantity: 'MOD',
          type: 'verbal',
          purpose: 'for BLE and foot placement',
          chain: 'facilitating wider BOS for increased stability'
        }]
      });
    }
  },
  {
    name: 'Voice — chained cue + P12 causal tail (number-tap-1 cue B)',
    kind: 'voice',
    target: 'min verbal cues to use previously trained breathing techniques to improve activity tolerance and task performance, secondary to symptoms of COPD.',
    run: function() {
      return DockyEngine.generate({
        cues: [{
          quantity: 'min',
          type: 'verbal',
          purpose: 'to use previously trained breathing techniques',
          chain: 'to improve activity tolerance and task performance',
          causalTail: {
            cause: { phrase: 'symptoms of COPD', kind: 'diagnostic' },
            connector: 'secondary to'
            // tightCause defaults to false -> ", secondary to ..." comma form
          }
        }]
      });
    }
  },
  {
    name: 'Logic — multi-cue stack warns and renders first cue only',
    kind: 'logic',
    run: function() {
      const originalWarn = console.warn;
      const warns = [];
      console.warn = function() { warns.push(Array.prototype.join.call(arguments, ' ')); };
      let out;
      try {
        out = DockyEngine.generate({
          cues: [
            { quantity: 'min', type: 'verbal', purpose: 'pacing' },
            { quantity: 'mod', type: 'tactile', purpose: 'trunk control' }
          ]
        });
      } finally {
        console.warn = originalWarn;
      }
      return { out, warns };
    },
    assert: function(result) {
      const warned = result.warns.some(w =>
        /multi-cue stacks deferred/.test(w) && /1 dropped/.test(w));
      if (!warned) {
        return { ok: false, why: 'expected warn mentioning multi-cue + 1 dropped; got ' + JSON.stringify(result.warns) };
      }
      const expected = 'min verbal cues for pacing.';
      if (result.out !== expected) {
        return { ok: false, why: 'expected first-cue render only; got ' + JSON.stringify(result.out) };
      }
      return { ok: true };
    }
  },
  {
    name: 'Logic — cue.tail field rejected (slice 8 migration loud-fail)',
    kind: 'logic',
    run: function() {
      return DockyEngine.generate({
        cues: [{
          quantity: 'Min',
          type: 'verbal',
          purpose: 'hip mobility',
          tail: 'when reaching towards the ground'  // slice 2 field, removed
        }]
      });
    },
    assert: function(result) {
      // _assembleNote bubbles the error up. The assembler wraps it as
      // { error, partial, slot } per its existing convention.
      if (!result || typeof result !== 'object' || !result.error) {
        return { ok: false, why: 'expected error object; got ' + JSON.stringify(result) };
      }
      if (result.error !== 'cue_tail_field_removed') {
        return { ok: false, why: 'expected error=cue_tail_field_removed; got ' + JSON.stringify(result.error) };
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
      console.log('  output: ', JSON.stringify(result.out !== undefined ? result.out : result));
      if (result.warns) console.log('  warns:  ', JSON.stringify(result.warns));
      pass++;
    }
  }
}

console.log('\n' + pass + '/' + (pass + fail) + ' passed');
process.exit(fail === 0 ? 0 : 1);
