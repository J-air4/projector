// Slice 1 verbatim test: opener + activity-sentence + foregrounding only.
// Run: node test-97530-slice1.js
//
// Three targets, each tests a different shape:
//   Fragment A — to-promote opener + activity-as-subject + qVerbS shape
//   Fragment C — patient-as-agent + patientQS shape
//   Fragment D — activity-as-subject + qActivityS shape with pre-position-modifier
//
// Match bar: character-for-character verbatim against the corpus opening.

const DockyData = require('./docky/core/data.js');
const DockyEngine = require('./docky/core/engine.js');
DockyEngine.init(DockyData);

const cases = [
  {
    name: 'Fragment A — to-promote + qVerbS',
    target:
      'To promote bilateral coordination and forearm/grip strength, ' +
      '4 feet of a lightweight rope rolled onto a dowel bar during ' +
      'wrist roller activity performed bilaterally.',
    params: {
      opener: {
        type: 'to-promote',
        verb: 'promote',
        goal: 'bilateral coordination and forearm/grip strength'
      },
      activities: [{
        label: 'wrist roller activity',
        quantification: { type: 'distance', value: '4 feet' },
        equipment: { substrate: ['a lightweight rope', 'a dowel bar'] },
        materialVerb: 'rolled onto',
        position: { value: 'performed bilaterally', kind: 'tail-modifier' }
      }]
    }
  },
  {
    name: 'Fragment C — patient-as-agent + patientQS',
    target: 'Patient untied 9/9 knots from theraband.',
    params: {
      activities: [{
        subject: 'patient-as-agent',
        label: 'theraband knot untying',
        verb: 'untied',
        quantification: { type: 'fraction', value: '9/9 knots' },
        equipment: { substrate: ['theraband'] }
      }]
    }
  },
  {
    name: 'Fragment D — activity-as-subject + qActivityS + pre-position',
    target: '6 trials of standing Ring toss activity using 5 large lightweight rings.',
    params: {
      activities: [{
        label: 'Ring toss activity',
        quantification: { type: 'count', value: '6 trials' },
        equipment: { substrate: ['5 large lightweight rings'] },
        position: { value: 'standing', kind: 'pre-modifier' }
      }]
    }
  }
];

let pass = 0, fail = 0;
for (const c of cases) {
  const out = DockyEngine.generate(c.params);
  const got = typeof out === 'string' ? out : JSON.stringify(out);
  const ok = got === c.target;
  console.log(ok ? '✓' : '✗', c.name);
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
