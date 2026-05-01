// Slice 2 verbatim test: P6 flat cue + P9 generic-progress closer.
// Run: node test-97530-slice2.js
//
// Targets exercise the new slots stacked onto slice-1 sentence shapes.
//   Fragment A — patient-as-agent + patientQS + flat cue (numeric quantity)
//   Fragment B — qVerbS + generic-progress closer
//   Fragment C — qActivityS + flat cue with tail phrase
//
// Match bar: character-for-character verbatim against the assembled
// target string.

const DockyData = require('./docky/core/data.js');
const DockyEngine = require('./docky/core/engine.js');
DockyEngine.init(DockyData);

const cases = [
  {
    name: 'Fragment A — patientQS + flat cue (quantity-led)',
    target:
      'Patient untied 9/9 knots from theraband. ' +
      '1 verbal cues for pinch strategies.',
    params: {
      activities: [{
        subject: 'patient-as-agent',
        label: 'theraband knot untying',
        verb: 'untied',
        quantification: { type: 'fraction', value: '9/9 knots' },
        equipment: { substrate: ['theraband'] }
      }],
      cues: [{
        quantity: '1',
        type: 'verbal',
        purpose: 'pinch strategies'
      }]
    }
  },
  {
    name: 'Fragment B — qVerbS + generic-progress closer',
    target:
      '4 feet of a lightweight rope rolled onto a dowel bar during ' +
      'wrist roller activity performed bilaterally. ' +
      'The patient continues to make good progress toward therapeutic goals.',
    params: {
      activities: [{
        label: 'wrist roller activity',
        quantification: { type: 'distance', value: '4 feet' },
        equipment: { substrate: ['a lightweight rope', 'a dowel bar'] },
        materialVerb: 'rolled onto',
        position: { value: 'performed bilaterally', kind: 'tail-modifier' }
      }],
      closer: { type: 'generic-progress' }
    }
  },
  {
    name: 'Fragment C — qActivityS + flat cue with tail',
    target:
      '6 trials of standing Ring toss activity using 5 large lightweight rings. ' +
      'Min verbal cues for hip mobility when reaching towards the ground.',
    params: {
      activities: [{
        label: 'Ring toss activity',
        quantification: { type: 'count', value: '6 trials' },
        equipment: { substrate: ['5 large lightweight rings'] },
        position: { value: 'standing', kind: 'pre-modifier' }
      }],
      cues: [{
        level: 'Min',
        type: 'verbal',
        purpose: 'hip mobility',
        tail: 'when reaching towards the ground'
      }]
    }
  }
];

let pass = 0, fail = 0;
for (const c of cases) {
  const out = DockyEngine.generate(c.params);
  const got = typeof out === 'string' ? out : JSON.stringify(out);
  const ok = got === c.target;
  console.log(ok ? 'PASS' : 'FAIL', c.name);
  if (!ok) {
    console.log('  expected:', JSON.stringify(c.target));
    console.log('  got:     ', JSON.stringify(got));
    fail++;
  } else {
    console.log('  output:  ', JSON.stringify(got));
    pass++;
  }
}
console.log(`\n${pass}/${pass + fail} passed`);
process.exit(fail === 0 ? 0 : 1);
