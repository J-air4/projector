// Slice 5c test: comma-join capitalization heuristic + per-call
// rendersAsActivityList override.
// Run: node test-97530-slice5c.js
//
// Two LOGIC tests (no voice tests; the behaviors are
// composer/assembler mechanics, not sentence-shape questions):
//
//   Logic 1 — capitalization heuristic. Exercises every prong of
//             _shouldPreserveCase: lowercase-this case, abbreviation,
//             hyphenated compound, known activity label, multi-prong
//             overlap. Verifies the join produces the right
//             casing for each.
//
//   Logic 2 — per-call rendersAsActivityList override precedence.
//             Profile default true / false × per-call override
//             undefined / true / false. All 6 combinations.

const DockyData = require('./docky/core/data.js');
const DockyEngine = require('./docky/core/engine.js');
const Vocab = require('./docky/core/vocabularies.js');
DockyEngine.init(DockyData);

let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; console.log('PASS', name); }
  else    { fail++; console.log('FAIL', name); if (detail) console.log('  ', detail); }
}

// ─────────────────────────────────────────────────────────────────
// Logic 1 — capitalization heuristic
// ─────────────────────────────────────────────────────────────────
console.log('--- Logic 1: capitalization heuristic ---');

// 1a. No activity labels in play, ordinary lowercase-this case.
//     "ADLs," + "While standing, ..." -> "ADLs, while standing, ..."
{
  const params = {
    activities: [{ label: 'Dynamic standing balance' }],
    opener: { type: 'to-promote', verb: 'improve', goal: 'overall task performance during ADLs' }
  };
  // Simulated: opener = "To improve overall task performance during ADLs,"
  // next part = "While standing, Dynamic standing balance performed."
  // Activity label "Dynamic standing balance" is NOT at the START of the
  // next part — "While standing, Dynamic standing balance performed."
  // starts with "While". So all three prongs miss; lowercase fires.
  const knownLabels = DockyEngine._collectKnownLabels(params);
  const part = 'While standing, Dynamic standing balance performed.';
  const preserve = DockyEngine._shouldPreserveCase(part, knownLabels);
  check('1a. "While standing,..." does not preserve case (lowercases to "while")', preserve === false, 'preserve=' + preserve);
}

// 1b. Abbreviation prong: two leading uppercase chars.
{
  const knownLabels = new Set();
  check('1b. "RW used during X" preserves (two leading caps -> abbreviation)',
    DockyEngine._shouldPreserveCase('RW used during X.', knownLabels) === true);
  check('1b. "BUE support required" preserves (two leading caps)',
    DockyEngine._shouldPreserveCase('BUE support required.', knownLabels) === true);
  check('1b. "MOD verbal cues" preserves (two leading caps)',
    DockyEngine._shouldPreserveCase('MOD verbal cues for X.', knownLabels) === true);
  check('1b. "Patient educated" does NOT preserve (only first cap, not abbreviation)',
    DockyEngine._shouldPreserveCase('Patient educated on safety.', knownLabels) === false);
}

// 1c. Hyphenated compound prong.
{
  const knownLabels = new Set();
  check('1c. "Sit-to-stand transfers" preserves (hyphen in first word)',
    DockyEngine._shouldPreserveCase('Sit-to-stand transfers performed.', knownLabels) === true);
  check('1c. "Half-kneel maintained" preserves (hyphen in first word)',
    DockyEngine._shouldPreserveCase('Half-kneel maintained for 30 seconds.', knownLabels) === true);
  check('1c. "Patient transferred" does NOT preserve (no hyphen)',
    DockyEngine._shouldPreserveCase('Patient transferred to chair.', knownLabels) === false);
}

// 1d. Known activity label prong.
{
  const knownLabels = new Set(['Sit-to-stand transfers', 'Dynamic standing balance']);
  // Already capitalized + matches a label
  check('1d. Matches a known label -> preserves',
    DockyEngine._shouldPreserveCase('Sit-to-stand transfers performed.', knownLabels) === true);
  check('1d. Matches another known label -> preserves',
    DockyEngine._shouldPreserveCase('Dynamic standing balance completed.', knownLabels) === true);
  check('1d. Does not match any label -> does not preserve via prong 3',
    DockyEngine._shouldPreserveCase('Patient performed exercise.', knownLabels) === false);
}

// 1e. End-to-end via _assembleNote: P2 opener + activity-as-event
//     for sit-stand-transfers. Should preserve "Sit-to-stand" via
//     prong 2 (hyphen) AND prong 3 (known label) -- both fire.
{
  const params = Vocab.compose('sit-stand-transfers', {
    opener: { type: 'to-promote', verb: 'promote', goal: 'safety and independence within living environment' },
    label: 'Sit-to-stand transfers',
    verb: 'performed',
    assists: null  // opt out of slice-7 profile assist auto-surface
  });
  const out = DockyEngine.generate(params);
  const expected = 'To promote safety and independence within living environment, Sit-to-stand transfers performed.';
  check('1e. End-to-end: sit-stand-transfers + P2 opener preserves "Sit-to-stand"',
    out === expected, 'got ' + JSON.stringify(out));
}

// 1f. End-to-end: opposite case. Position-led activity sentence
//     starts with "While standing" (not a label, no hyphen, not
//     two-cap). Should still lowercase to "while standing".
{
  const params = Vocab.compose('dynamic-standing-balance', {
    opener: { type: 'to-promote', verb: 'improve', goal: 'overall task performance during ADLs' },
    label: 'Dynamic standing balance',
    assists: null  // opt out of slice-7 profile assist auto-surface
  });
  const out = DockyEngine.generate(params);
  const expected = 'To improve overall task performance during ADLs, while standing, Dynamic standing balance performed.';
  check('1f. End-to-end: position-led "While standing" lowercases to "while standing"',
    out === expected, 'got ' + JSON.stringify(out));
}

// ─────────────────────────────────────────────────────────────────
// Logic 2 — rendersAsActivityList override precedence
// ─────────────────────────────────────────────────────────────────
console.log('--- Logic 2: rendersAsActivityList override ---');

// Profile defaults (verified):
//   bending-lifting-carrying.profile -> rendersAsActivityList=true
//   side-stepping.profile (dynamic-functional-task) -> false

// 2a. profile=true, no override -> renders true (inherits default)
{
  const p = Vocab.compose('bending-lifting-carrying');
  check('2a. profile=true, no override -> rendersAsActivityList=true',
    p.activities[0].rendersAsActivityList === true,
    JSON.stringify(p.activities[0]));
}

// 2b. profile=true, override=false -> renders false (override wins)
{
  const p = Vocab.compose('bending-lifting-carrying', { rendersAsActivityList: false });
  check('2b. profile=true, override=false -> rendersAsActivityList NOT set',
    p.activities[0].rendersAsActivityList !== true);
}

// 2c. profile=true, override=true -> renders true (consistent)
{
  const p = Vocab.compose('bending-lifting-carrying', { rendersAsActivityList: true });
  check('2c. profile=true, override=true -> rendersAsActivityList=true',
    p.activities[0].rendersAsActivityList === true);
}

// 2d. profile=false, no override -> renders false (inherits default)
{
  const p = Vocab.compose('side-stepping');
  check('2d. profile=false, no override -> rendersAsActivityList NOT set',
    p.activities[0].rendersAsActivityList !== true);
}

// 2e. profile=false, override=true -> renders true (override wins)
{
  const p = Vocab.compose('side-stepping', { rendersAsActivityList: true });
  check('2e. profile=false, override=true -> rendersAsActivityList=true',
    p.activities[0].rendersAsActivityList === true);
}

// 2f. profile=false, override=false -> renders false (consistent)
{
  const p = Vocab.compose('side-stepping', { rendersAsActivityList: false });
  check('2f. profile=false, override=false -> rendersAsActivityList NOT set',
    p.activities[0].rendersAsActivityList !== true);
}

console.log('\n' + pass + '/' + (pass + fail) + ' passed');
process.exit(fail === 0 ? 0 : 1);
