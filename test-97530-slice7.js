// Slice 7 test: P-Assist. Standalone-sentence assist phrase. Single
// "Required" prefix hoisted to the sentence iff any assist is
// physical (max/mod/min). Compound assists join with " and ".
// Run: node test-97530-slice7.js
//
// Voice tests use the corpus typo gate (assertSpellCorrect): voice
// = sentence-shape and vocabulary match the corpus, with the engine
// emitting spell-correct output.
//
// Voice 1 — single CGA, flat purpose. No "Required" prefix because
//           CGA is not physical.
// Voice 2 — single physical assist with location + purpose. "Required"
//           prefix fires.
// Voice 3 — single physical assist with P12 causal tail. tightCause
//           defaults to true inside the assist renderer (no comma
//           between purpose and connector).
// Voice 4 — compound assist (CGA + physical). Single "Required"
//           prefix at the front of the sentence because at least one
//           assist is physical; CGA-first phrase carries no internal
//           "required".
//
// Inline assist (suffix on the activity sentence) is deferred to its
// own slice with a unified positional-context tail renderer. Slice 7
// covers standalone shape only.

const DockyData = require('./docky/core/data.js');
const DockyEngine = require('./docky/core/engine.js');
const Vocab = require('./docky/core/vocabularies.js');
const { assertSpellCorrect } = require('./docky/core/typo-gate.js');
DockyEngine.init(DockyData);

const cases = [
  {
    name: 'Voice — single CGA, flat purpose (no "Required" prefix)',
    kind: 'voice',
    target: 'CGA for stability.',
    run: function() {
      return DockyEngine.generate({
        assists: [{
          level: Vocab.ASSIST_LEVELS['cga'],
          purpose: Vocab.ASSIST_PURPOSES['stability'].phrase
        }]
      });
    }
  },
  {
    name: 'Voice — single physical assist with location + purpose',
    kind: 'voice',
    target: 'Required min physical assist at gait belt for safety.',
    run: function() {
      return DockyEngine.generate({
        assists: [{
          level:    Vocab.ASSIST_LEVELS['min'],
          location: Vocab.ASSIST_LOCATIONS['gait-belt'],
          purpose:  Vocab.ASSIST_PURPOSES['safety'].phrase
        }]
      });
    }
  },
  {
    name: 'Voice — single physical assist with P12 causal tail (tightCause default)',
    kind: 'voice',
    target: 'Required min physical assist at trunk to maintain midline alignment secondary to deconditioning.',
    run: function() {
      return DockyEngine.generate({
        assists: [{
          level:    Vocab.ASSIST_LEVELS['min'],
          location: Vocab.ASSIST_LOCATIONS['trunk'],
          purpose:  'to maintain midline alignment',
          causalTail: {
            cause: { phrase: 'deconditioning', kind: 'functional-state' },
            connector: 'secondary to'
          }
        }]
      });
    }
  },
  {
    name: 'Voice — compound assist (CGA + physical), single hoisted "Required"',
    kind: 'voice',
    target: 'Required CGA during transfer initiation to guard against posterior loss of balance and mod physical assist at bilateral hips for sustained standing balance.',
    run: function() {
      return DockyEngine.generate({
        assists: [
          {
            level:   Vocab.ASSIST_LEVELS['cga'],
            context: 'during transfer initiation',
            purpose: 'to guard against posterior loss of balance'
          },
          {
            level:    Vocab.ASSIST_LEVELS['mod'],
            location: { phrase: 'bilateral hips' },
            purpose:  'for sustained standing balance'
          }
        ]
      });
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
