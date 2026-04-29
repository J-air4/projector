// Acceptance harness for commit 2.
// Replays translateV1ToV2 + buildDockyOutput routing for six scenarios:
// three v2-mappable (sit-stand, bath UB, dress UB), three v1-only.
// Loads docky.js via require (Node path) for v2; loads v1 chain manually.
// Run: node test-acceptance.js

const fs = require('fs');
const path = require('path');

// ── Load v1 chain (script-tag globals not present in Node)
const DockyPhrases = require('./docky/phrases.js');
const DockyUtils = require('./docky/utils.js');
const DockyGenerator = require('./docky/generator.js');
const DockyAssistant = require('./docky/assistant.js');
DockyGenerator.init(DockyPhrases, DockyUtils);

// ── Load DOCKY (will require v2 modules via Node path internally)
const DOCKY = require('./docky.js');

// ── Build v1 `data` bundle from data/*.json (mirrors React's useDataStore)
const dataFiles = [
  'cpt-activities.json', 'goals.json', 'assist.json',
  'cues.json', 'clinical.json', 'session.json', 'vitals.json'
];
const data = {};
for (const f of dataFiles) {
  Object.assign(data, JSON.parse(fs.readFileSync(path.join('data', f), 'utf8')));
}

// ── Replicate window.V2_TRANSLATION + translateV1ToV2 (kept in sync with index.html)
const V2_TRANSLATION = {
  progress: {
    improved: 'improved', significantly_improved: 'improved', emerging_improvement: 'progressing',
    same: 'same', plateau: 'plateau', variable: 'progressing', baseline: 'baseline',
    declined: 'declined', declined_fatigue: 'declined', declined_pain: 'declined', declined_medical: 'declined'
  },
  tolerance: {
    tolerated_well: 'well', tolerated: 'well', minimal_fatigue: 'min-fatigue',
    moderate_fatigue: 'min-fatigue', rest_breaks: 'rest-breaks',
    frequent_rest_breaks: 'rest-breaks', pacing_required: 'rest-breaks',
    fatigued: 'fatigue-limited', fatigue_limited: 'fatigue-limited',
    pain: 'pain-limited', pain_limited: 'pain-limited',
    sob: 'sob', dizziness: 'sob', orthostatic: 'sob',
    anxiety: 'well', unable_complete: 'declined'
  },
  plan: {
    continue: 'continue', continue_monitor: 'continue', upgrade: 'progress',
    progress_assist: 'decrease-assist', increase_reps: 'progress', add_complexity: 'progress',
    reduce_cues: 'decrease-assist', downgrade: 'modify', downgrade_pain: 'modify',
    modify_approach: 'modify', simplify_task: 'modify',
    new_equipment: 'add-equipment', trial_equipment: 'add-equipment',
    add_strengthening: 'progress', add_balance: 'progress', add_endurance: 'progress',
    focus_safety: 'modify', fall_prevention: 'modify', energy_conservation: 'modify',
    body_mechanics: 'modify', cognitive_strategies: 'modify', external_cues: 'modify',
    errorless_learning: 'modify', family_training: 'continue',
    coordinate_nursing: 'continue', coordinate_pt: 'continue',
    home_program: 'dc-planning', discharge_planning: 'dc-planning',
    equipment_recommendations: 'add-equipment'
  },
  activityLabelToId: {
    'bathing|upper body': 'bathing', 'bathing|lower body': 'bathing', 'bathing|shower/tub': 'bathing',
    'dressing|upper body': 'dressing-ub', 'dressing|lower body': 'dressing-lb',
    'dressing|footwear': 'dressing-lb', 'dressing|fasteners': 'dressing-ub',
    'grooming|oral care': 'grooming', 'grooming|hair care': 'grooming',
    'grooming|face/skin': 'grooming', 'grooming|nail care': 'grooming',
    'toileting|transfer': 'toilet-transfer', 'toileting|hygiene': 'toilet-hygiene',
    'toileting|clothing management': 'toileting',
    'feeding|self-feeding': 'self-feeding', 'feeding|meal setup': 'self-feeding',
    'sit ↔ stand': 'sit-stand', 'sit-stand': 'sit-stand',
    'bathing/showering': 'bathing', 'ub dressing': 'dressing-ub', 'lb dressing': 'dressing-lb',
    'functional mobility': 'functional-mobility', 'rolling': 'rolling',
    'sitting balance': 'sitting-balance', 'standing balance': 'standing-balance', 'dynamic balance': 'dynamic-balance'
  },
  performanceSkillMatch: [
    { match: ['attention', 'focus'], skill: 'attends' },
    { match: ['safety'], skill: 'heeds' },
    { match: ['sequencing', 'sequence'], skill: 'sequences' },
    { match: ['initiation', 'initiate'], skill: 'initiates' },
    { match: ['stabili', 'trunk control'], skill: 'stabilizes' },
    { match: ['balance', 'aligns', 'alignment'], skill: 'aligns' },
    { match: ['endur', 'fatigue'], skill: 'endures' },
    { match: ['pacing', 'pace'], skill: 'paces' },
    { match: ['reach'], skill: 'reaches' },
    { match: ['grip', 'grasp'], skill: 'grips' },
    { match: ['coordin'], skill: 'coordinates' },
    { match: ['organiz'], skill: 'organizes' }
  ]
};

function translateV1ToV2(p, dockyData) {
  if (!dockyData) return null;
  const T = V2_TRANSLATION;
  const lower = (s) => String(s == null ? '' : s).toLowerCase().trim();

  let activityId = null;
  if (p.selectedParent && p.selectedSubCategory) {
    activityId = T.activityLabelToId[lower(p.selectedParent) + '|' + lower(p.selectedSubCategory)] || null;
  }
  if (!activityId) {
    const candidates = [].concat(p.selectedActivities || [], [p.selectedSubCategory, p.selectedParent])
      .filter(Boolean).map(lower);
    for (const c of candidates) {
      if (T.activityLabelToId[c]) { activityId = T.activityLabelToId[c]; break; }
      const occ = dockyData.occupations || {};
      for (const k in occ) {
        const acts = (occ[k] && occ[k].activities) || [];
        for (const a of acts) {
          if (a.id === c || a.shortcut === c || lower(a.label) === c) { activityId = a.id; break; }
        }
        if (activityId) break;
      }
      if (activityId) break;
    }
  }
  if (!activityId) return null;

  const firstAssist = (p.assists || [])[0];
  if (!firstAssist || !firstAssist.level) return null;
  const v2AssistIds = (dockyData.assistLevels || []).map(a => a.id);
  if (!v2AssistIds.includes(firstAssist.level)) return null;

  let goalText = null;
  if (p.goal && p.data && p.data.GOALS) {
    const g = p.data.GOALS.find(x => x.id === p.goal);
    if (g && g.phrase) goalText = g.phrase;
  }
  if (!goalText) return null;

  let locationId = null;
  if (firstAssist.location) {
    const loc = lower(firstAssist.location);
    const v2Loc = (dockyData.assistLocations || []).find(l =>
      l.id === loc || lower(l.label).indexOf(loc) !== -1);
    if (v2Loc) locationId = v2Loc.id;
  }

  const cues = (p.cues || []).map(c => {
    const type = lower(c.type);
    const v2Type = (dockyData.cueTypes || []).find(t => t.id === type || lower(t.label) === type);
    if (!v2Type) return null;
    const purposeRaw = lower(c.purpose);
    const v2Purpose = (dockyData.cuePurposes || []).find(pp =>
      pp.id === purposeRaw || (purposeRaw && lower(pp.label).indexOf(purposeRaw) !== -1));
    return { type: v2Type.id, purpose: v2Purpose ? v2Purpose.id : 'safety' };
  }).filter(Boolean);

  const performanceSkills = [];
  (p.selectedPerformance || []).forEach(raw => {
    const rl = lower(raw);
    T.performanceSkillMatch.forEach(m => {
      if (m.match.some(k => rl.indexOf(k) !== -1)) {
        if (!performanceSkills.includes(m.skill)) performanceSkills.push(m.skill);
      }
    });
  });

  return {
    activities: [activityId],
    performanceSkills,
    assist: firstAssist.level,
    location: locationId,
    cues,
    goal: goalText,
    tolerance: T.tolerance[p.tolerance] || null,
    progress: T.progress[p.progress] || null,
    plan: T.plan[p.plan] || null
  };
}

// ── buildDockyOutput equivalent (per index.html wiring)
function buildDockyOutput(v1Params) {
  const v2Available = !!(DOCKY && DOCKY.isV2Available && DOCKY.isV2Available());
  const dockyData = v2Available ? DOCKY.data : null;
  const v2Params = v2Available ? translateV1ToV2(v1Params, dockyData) : null;
  if (v2Params) {
    try {
      const note = DOCKY.generateV2(v2Params);
      const validation = DOCKY.validate(v2Params);
      return { route: 'v2', note, v2Params, validation };
    } catch (e) {
      // fall through
      return { route: 'v1-after-v2-error', note: DOCKY.generate(v1Params), error: e.message };
    }
  }
  // v1 path: in Node, DOCKY.generate falls back to v2 because DockyGenerator
  // global isn't visible. Call DockyGenerator directly to test the real v1 path.
  const note = DockyGenerator.generate(v1Params);
  return { route: 'v1', note };
}

// ── Six scenarios
const scenarios = [
  // ─── 3 v2-mappable ───
  {
    name: '1. sit-stand transfer (v2-mappable via direct activity label)',
    v1: {
      data,
      selectedActivities: ['Sit ↔ Stand'],
      selectedParent: null, selectedSubCategory: null,
      activityParams: {},
      goal: 'fall_prevention',
      assists: [{ level: 'MinA', location: 'gait belt', purpose: 'safety', modifier: '' }],
      cues: [{ level: 'min', type: 'verbal', bodyPart: '', purpose: 'safety', context: '' }],
      deficit: '', progress: 'improved', tolerance: 'tolerated_well', plan: 'continue',
      selectedPerformance: ['Patient demonstrated stabilization and safety awareness'],
      selectedContext: [], selectedReasoning: [],
      patientSubjective: '', painLocation: '', painRating: '', vitals: {}, outputStyle: 'goal'
    }
  },
  {
    name: '2. UB Bathing (v2-mappable via parent|subcat)',
    v1: {
      data,
      selectedActivities: ['Upper Body'],
      selectedParent: 'Bathing', selectedSubCategory: 'Upper Body',
      activityParams: {},
      goal: 'bathing_safety',
      assists: [{ level: 'ModA', location: 'bilateral UEs', purpose: 'safety', modifier: '' }],
      cues: [
        { level: 'min', type: 'verbal', bodyPart: '', purpose: 'sequencing', context: '' },
        { level: 'min', type: 'tactile', bodyPart: 'shoulder', purpose: 'pacing', context: '' }
      ],
      deficit: '', progress: 'progressing'.replace('progressing','emerging_improvement'),
      tolerance: 'minimal_fatigue', plan: 'reduce_cues',
      selectedPerformance: ['Initiation difficulty', 'Endurance reduced'],
      selectedContext: [], selectedReasoning: [],
      patientSubjective: '', painLocation: '', painRating: '', vitals: {}, outputStyle: 'goal'
    }
  },
  {
    name: '3. UB Dressing (v2-mappable via parent|subcat, multiple cues)',
    v1: {
      data,
      selectedActivities: ['Upper Body'],
      selectedParent: 'Dressing', selectedSubCategory: 'Upper Body',
      activityParams: {},
      goal: 'ub_dressing',
      assists: [{ level: 'CGA', location: '', purpose: 'safety', modifier: '' }],
      cues: [{ level: 'mod', type: 'visual', bodyPart: '', purpose: 'attention', context: '' }],
      deficit: '', progress: 'improved', tolerance: 'tolerated_well', plan: 'progress_assist',
      selectedPerformance: ['Reaching', 'Coordination'],
      selectedContext: [], selectedReasoning: [],
      patientSubjective: '', painLocation: '', painRating: '', vitals: {}, outputStyle: 'goal'
    }
  },
  // ─── 3 v1-only (no v2 activity match) ───
  {
    name: '4. Shoulder AROM all planes (v1-only: no v2 activity ID)',
    v1: {
      data,
      selectedActivities: ['Shoulder AROM all planes'],
      selectedParent: 'ROM - UE', selectedSubCategory: 'ROM - UE',
      activityParams: { sets: '3', reps: '10' },
      goal: 'fall_prevention',
      assists: [{ level: 'MinA', location: 'r ue', purpose: 'safety', modifier: '' }],
      cues: [],
      deficit: '', progress: 'improved', tolerance: 'tolerated_well', plan: 'continue',
      selectedPerformance: [], selectedContext: [], selectedReasoning: [],
      patientSubjective: '', painLocation: '', painRating: '', vitals: {}, outputStyle: 'goal'
    }
  },
  {
    name: '5. Dynamic standing balance (v1-only: no parent|subcat match)',
    v1: {
      data,
      selectedActivities: ['Dynamic standing balance'],
      selectedParent: 'Therapeutic Balance Training', selectedSubCategory: 'Therapeutic Balance Training',
      activityParams: {},
      goal: 'fall_prevention',
      assists: [{ level: 'CGA', location: 'gait belt', purpose: 'safety', modifier: '' }],
      cues: [{ level: 'min', type: 'verbal', bodyPart: '', purpose: 'posture', context: '' }],
      deficit: '', progress: 'improved', tolerance: 'minimal_fatigue', plan: 'add_balance',
      selectedPerformance: [], selectedContext: [], selectedReasoning: [],
      patientSubjective: '', painLocation: '', painRating: '', vitals: {}, outputStyle: 'activity'
    }
  },
  {
    name: '6. Grip strengthening (v1-only: no v2 ID)',
    v1: {
      data,
      selectedActivities: ['Grip strengthening progressive'],
      selectedParent: 'Strengthening - UE', selectedSubCategory: 'Strengthening - UE',
      activityParams: { sets: '2', reps: '15' },
      goal: 'ub_dressing',
      assists: [{ level: 'I', location: '', purpose: '', modifier: '' }],
      cues: [],
      deficit: '', progress: 'same', tolerance: 'tolerated', plan: 'increase_reps',
      selectedPerformance: [], selectedContext: [], selectedReasoning: [],
      patientSubjective: '', painLocation: '', painRating: '', vitals: {}, outputStyle: 'goal'
    }
  }
];

// ── Boot diagnostic mirror (the equivalent of the index.html boot block in browser)
console.log('=== Boot diagnostic ===');
console.log('  DOCKY.isV2Available():', DOCKY.isV2Available());
console.log('  DOCKY.data?.occupations keys:', Object.keys(DOCKY.data?.occupations || {}));
console.log('');

// ── Run scenarios
console.log('=== Scenarios ===\n');
for (const s of scenarios) {
  const r = buildDockyOutput(s.v1);
  console.log('▶', s.name);
  console.log('  route:', r.route);
  if (r.v2Params) {
    console.log('  v2Params:', JSON.stringify(r.v2Params, null, 2).split('\n').map((l,i) => i===0 ? l : '    '+l).join('\n'));
  }
  if (r.validation) {
    console.log('  validate: valid=' + r.validation.valid + ' score=' + r.validation.score + ' errors=' + r.validation.errors.length + ' warnings=' + r.validation.warnings.length);
  }
  if (r.error) {
    console.log('  error:', r.error);
  }
  console.log('  note:');
  console.log('    "' + (r.note || '') + '"');
  console.log('');
}
