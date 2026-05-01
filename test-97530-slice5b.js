// Slice 5b test: 11-activity vocabulary expansion + list-member
// partition routing through the P3 opener.
// Run: node test-97530-slice5b.js
//
// Voice tests use the corpus typo gate (assertSpellCorrect): voice
// = sentence-shape and vocabulary match the corpus, with the engine
// emitting spell-correct output. The gate ensures any corpus typo
// that leaks into engine output causes a hard test failure.
//
// Targets:
//   Voice 1 — sit-stand-transfers composed via vocabularies, with
//             a P2 opener built from typicalGoalPhrasings[0]. Anchors
//             at corpus paragraph `sts-1` ("o promote safety and
//             independence within living environment Sit-to-stand
//             transfers...") — engine emits the corrected form.
//   Voice 2 — dynamic-standing-balance composed via vocabularies,
//             with a P2 opener. Anchors at corpus paragraph
//             `adl-balance-1` ("To improve overall task performance
//             during ADLs, ...").
//   Voice 3 — bending-lifting-carrying + side-stepping composed
//             together as list-members. Engine partitions both into
//             the P3 opener's focus list. Matches the corpus
//             `side-stepping-1` opener byte-for-byte (engine emits
//             spell-correct).
//
// Logic test:
//   Logic 1 — mixed case: list-member (bending-lifting-carrying) +
//             standalone (dynamic-standing-balance). Engine emits
//             a P3 opener with bending/lifting/carrying as the
//             focus, followed by a standalone sentence for dynamic
//             standing balance. Verifies the partition routes both
//             paths in the same note.

const DockyData = require('./docky/core/data.js');
const DockyEngine = require('./docky/core/engine.js');
const Vocab = require('./docky/core/vocabularies.js');
const { assertSpellCorrect } = require('./docky/core/typo-gate.js');
DockyEngine.init(DockyData);

const cases = [
  {
    name: 'Voice — sit-stand-transfers with P2 opener (sts-1)',
    kind: 'voice',
    // P2 opener ends with comma; the assembler usually lowercases
    // the first character of the next part. The slice 5c
    // capitalization heuristic preserves the case here because
    // "Sit-to-stand transfers" is a known activity label (and also
    // a hyphenated compound — both prongs fire). The corpus
    // paragraph this anchors against is run-on (no comma) so the
    // byte-match is to a corrected/structured form, not the raw
    // corpus text.
    target: 'To promote safety and independence within living environment, Sit-to-stand transfers performed.',
    run: function() {
      const params = Vocab.compose('sit-stand-transfers', {
        opener: {
          type: 'to-promote',
          verb: 'promote',
          goal: 'safety and independence within living environment'
        },
        label: 'Sit-to-stand transfers',
        // No quantification -> activity-as-event renderer fires
        // ("<label> performed."). The activity's defaultPosition
        // (`from-wc`, kind 'tail-modifier') doesn't foreground —
        // tail-modifier positions don't lead a sentence, only attach
        // as tails to other foregrounding paths. activity-as-event
        // doesn't render tails today, so position is silent here.
        verb: 'performed',
        assists: null,  // opt out of slice-7 profile assist auto-surface
        cues: null      // opt out of slice-8 profile cue auto-surface
      });
      return DockyEngine.generate(params);
    }
  },
  {
    name: 'Voice — dynamic-standing-balance with P2 opener (adl-balance-1)',
    kind: 'voice',
    // The activity entry's defaultPosition='standing' (pre-modifier)
    // is foregroundable, so the engine emits a position-led sentence
    // ("While standing, Dynamic standing balance performed.") rather
    // than activity-as-event. The opener-comma joining lowercases
    // the first char of the joined part: "ADLs, while standing, ...".
    target: 'To improve overall task performance during ADLs, while standing, Dynamic standing balance performed.',
    run: function() {
      const params = Vocab.compose('dynamic-standing-balance', {
        opener: {
          type: 'to-promote',
          verb: 'improve',
          goal: 'overall task performance during ADLs'
        },
        label: 'Dynamic standing balance',
        assists: null,  // opt out of slice-7 profile assist auto-surface
        cues: null      // opt out of slice-8 profile cue auto-surface
      });
      return DockyEngine.generate(params);
    }
  },
  {
    name: 'Voice — bending-lifting-carrying + side-stepping list-member opener (side-stepping-1)',
    kind: 'voice',
    target: 'Skilled interventions focused on bending/lifting/carrying tasks, side stepping to increase functional skill performance.',
    run: function() {
      // bending-lifting-carrying inherits rendersAsActivityList=true
      // from its profile. side-stepping is on dynamic-functional-task
      // (profile default false), but the corpus side-stepping-1
      // paragraph routes it as a list-member alongside
      // bending-lifting-carrying — that's a per-note routing
      // decision, not a profile property. Slice 5c added a per-call
      // override in compose's overrides arg; precedence is per-call
      // override > profile default.
      const params = Vocab.composeMany([
        { id: 'bending-lifting-carrying' },
        { id: 'side-stepping', overrides: { rendersAsActivityList: true } }
      ]);
      return DockyEngine.generate(params);
    }
  },
  {
    name: 'Logic — mixed case: list-member + standalone in same note',
    kind: 'logic',
    run: function() {
      const params = Vocab.composeMany([
        { id: 'bending-lifting-carrying' },     // rendersAsActivityList=true
        { id: 'dynamic-standing-balance', overrides: { label: 'Dynamic standing balance', verb: 'completed' } }
      ]);
      // dynamic-standing-balance is on standing-balance-task profile
      // (rendersAsActivityList: false) -> partitions as standalone.
      const out = DockyEngine.generate(params);
      return { out, params };
    },
    assert: function(result) {
      const out = result.out;
      if (typeof out !== 'string') {
        return { ok: false, why: 'engine returned non-string: ' + JSON.stringify(out) };
      }
      // Expected: P3 opener with bending/lifting/carrying in the
      // focus list, followed by a standalone position-led sentence
      // for Dynamic standing balance (its defaultPosition='standing'
      // is pre-modifier, so position-led foregrounding fires).
      const expected =
        'Skilled interventions focused on bending/lifting/carrying tasks to increase functional skill performance. ' +
        'While standing, Dynamic standing balance performed.';
      if (out !== expected) {
        return { ok: false, why: 'output mismatch.\n  expected: ' + JSON.stringify(expected) + '\n  got:      ' + JSON.stringify(out) };
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
      pass++;
    }
  }
}

console.log('\n' + pass + '/' + (pass + fail) + ' passed');
process.exit(fail === 0 ? 0 : 1);
