// Self-tests for the typo gate. Verifies word-boundary matching,
// substring-overlap correctness, and special-character handling.
// Run: node test-typo-gate.js

const { assertSpellCorrect, findGateMatches } = require('./docky/core/typo-gate.js');

let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; console.log('PASS', name); }
  else    { fail++; console.log('FAIL', name, detail || ''); }
}

// 1. Clean text passes through untouched
const clean = 'Posterior retropulsion noted when standing from w/c.';
check('clean text passes', assertSpellCorrect(clean) === clean);

// 2. Single typo trips with the right entry reported
let caught;
try { assertSpellCorrect('1 instance of instability without physcial assist.'); caught = null; }
catch (e) { caught = e; }
check('physcial trips',
  caught && caught.gateMatches.length === 1 && caught.gateMatches[0].wrong === 'physcial',
  caught ? caught.gateMatches.map(m => m.wrong) : 'no throw');

// 3. Multiple typos report all of them
try { assertSpellCorrect('Paitent rest required throughput session.'); caught = null; }
catch (e) { caught = e; }
const got3 = caught ? caught.gateMatches.map(m => m.wrong).sort() : [];
check('multi-typo reports all',
  JSON.stringify(got3) === JSON.stringify(['Paitent', 'throughput session']),
  JSON.stringify(got3));

// 4. WORD BOUNDARY: "iten" must NOT trip when it's a substring of "Paitent"
try { assertSpellCorrect('Paitent ate lunch.'); caught = null; }
catch (e) { caught = e; }
const got4 = caught ? caught.gateMatches.map(m => m.wrong) : [];
check('iten does not trip inside Paitent',
  got4.length === 1 && got4[0] === 'Paitent',
  JSON.stringify(got4));

// 5. Correctly-spelled "Patient" must NOT trip Paitent
check('clean Patient does not trip', findGateMatches('Patient ate lunch.').length === 0);

// 6. Phrase entry: "house keeping" trips, "housekeeping" does not
check('house keeping trips', findGateMatches('during house keeping tasks.').length === 1);
check('housekeeping does not trip', findGateMatches('during housekeeping tasks.').length === 0);

// 7. Special-character entry: typographic quote-mismatch trips
const badQuote = '"cracking\' 6/12 plastic eggs';
check('cracking-quote-mismatch trips', findGateMatches(badQuote).length === 1);
check('correct quote does not trip', findGateMatches('"cracking" 6/12 plastic eggs').length === 0);

// 8. forearm/ grip vs forearm/grip
check('forearm/ grip trips', findGateMatches('forearm/ grip strength').length === 1);
check('forearm/grip does not trip', findGateMatches('forearm/grip strength').length === 0);

// 9. Empty / non-string inputs degrade safely
check('empty string', findGateMatches('').length === 0);
check('null safe', findGateMatches(null).length === 0);
check('non-string safe', findGateMatches(42).length === 0);
check('assertSpellCorrect returns input on null', assertSpellCorrect(null) === null);

console.log('\n' + pass + '/' + (pass + fail) + ' passed');
process.exit(fail === 0 ? 0 : 1);
