/**
 * DOCKY v2.0 - Core Data Module
 * Single source of truth for all clinical data
 *
 * Philosophy: Performance Skills Model (OTPF-4)
 * Default: SNF/Medicare Part A with optional Part B expansion
 */

const DockyData = {
  // ══════════════════════════════════════════════════════════════
  // PERFORMANCE SKILLS (OTPF-4 Framework)
  // ══════════════════════════════════════════════════════════════
  performanceSkills: {
    motor: {
      label: 'Motor Skills',
      skills: [
        { id: 'stabilizes', label: 'Stabilizes', def: 'Maintains trunk control and balance' },
        { id: 'aligns', label: 'Aligns', def: 'Maintains appropriate body alignment' },
        { id: 'positions', label: 'Positions', def: 'Positions body or extremities appropriately' },
        { id: 'walks', label: 'Walks', def: 'Ambulates on level surfaces' },
        { id: 'reaches', label: 'Reaches', def: 'Extends arm to effectively grasp objects' },
        { id: 'bends', label: 'Bends', def: 'Flexes body to grasp or place objects' },
        { id: 'grips', label: 'Grips', def: 'Pinches or grasps objects with sufficient strength' },
        { id: 'manipulates', label: 'Manipulates', def: 'Uses dexterous movements' },
        { id: 'coordinates', label: 'Coordinates', def: 'Uses 2+ body parts together' },
        { id: 'moves', label: 'Moves', def: 'Pushes, pulls, or drags objects' },
        { id: 'transports', label: 'Transports', def: 'Carries objects while moving' },
        { id: 'lifts', label: 'Lifts', def: 'Raises or lowers objects' },
        { id: 'calibrates', label: 'Calibrates', def: 'Uses appropriate force/speed' },
        { id: 'flows', label: 'Flows', def: 'Uses smooth, fluid movements' },
        { id: 'endures', label: 'Endures', def: 'Sustains effort over time' },
        { id: 'paces', label: 'Paces', def: 'Maintains consistent rate of performance' }
      ]
    },
    process: {
      label: 'Process Skills',
      skills: [
        { id: 'attends', label: 'Attends', def: 'Maintains focus on task' },
        { id: 'heeds', label: 'Heeds', def: 'Follows safety precautions' },
        { id: 'chooses', label: 'Chooses', def: 'Selects appropriate tools/materials' },
        { id: 'uses', label: 'Uses', def: 'Applies tools/materials appropriately' },
        { id: 'handles', label: 'Handles', def: 'Supports and stabilizes objects' },
        { id: 'inquires', label: 'Inquires', def: 'Seeks needed information' },
        { id: 'initiates', label: 'Initiates', def: 'Starts task without hesitation' },
        { id: 'continues', label: 'Continues', def: 'Performs without interruption' },
        { id: 'sequences', label: 'Sequences', def: 'Performs steps in logical order' },
        { id: 'terminates', label: 'Terminates', def: 'Stops at appropriate time' },
        { id: 'searches', label: 'Searches', def: 'Looks for needed items' },
        { id: 'locates', label: 'Locates', def: 'Finds items in logical places' },
        { id: 'gathers', label: 'Gathers', def: 'Collects needed items' },
        { id: 'organizes', label: 'Organizes', def: 'Arranges workspace logically' },
        { id: 'restores', label: 'Restores', def: 'Returns items to proper places' },
        { id: 'navigates', label: 'Navigates', def: 'Moves around obstacles' },
        { id: 'adjusts', label: 'Adjusts', def: 'Modifies actions to overcome problems' },
        { id: 'accommodates', label: 'Accommodates', def: 'Changes method when initial approach fails' },
        { id: 'benefits', label: 'Benefits', def: 'Prevents future problems' }
      ]
    },
    social: {
      label: 'Social Interaction Skills',
      skills: [
        { id: 'approaches', label: 'Approaches', def: 'Approaches others appropriately' },
        { id: 'asks', label: 'Asks', def: 'Requests relevant information' },
        { id: 'engages', label: 'Engages', def: 'Initiates interactions' },
        { id: 'expresses', label: 'Expresses', def: 'Displays appropriate affect' },
        { id: 'modulates', label: 'Modulates', def: 'Uses appropriate volume/tone' },
        { id: 'shares', label: 'Shares', def: 'Gives information as appropriate' },
        { id: 'speaks', label: 'Speaks', def: 'Uses understandable speech' },
        { id: 'sustains', label: 'Sustains', def: 'Maintains conversation' },
        { id: 'relates', label: 'Relates', def: 'Assumes appropriate roles' }
      ]
    }
  },

  // ══════════════════════════════════════════════════════════════
  // OCCUPATIONS (What we're treating)
  // ══════════════════════════════════════════════════════════════
  occupations: {
    adl: {
      label: 'ADLs',
      activities: [
        { id: 'bathing', label: 'Bathing/Showering', shortcut: 'bath' },
        { id: 'dressing-ub', label: 'UB Dressing', shortcut: 'ub' },
        { id: 'dressing-lb', label: 'LB Dressing', shortcut: 'lb' },
        { id: 'grooming', label: 'Grooming', shortcut: 'grm' },
        { id: 'toileting', label: 'Toileting', shortcut: 'toi' },
        { id: 'toilet-hygiene', label: 'Toilet Hygiene', shortcut: 'th' },
        { id: 'self-feeding', label: 'Self-Feeding', shortcut: 'feed' },
        { id: 'functional-mobility', label: 'Functional Mobility', shortcut: 'mob' },
        { id: 'personal-hygiene', label: 'Personal Hygiene', shortcut: 'hyg' }
      ]
    },
    transfers: {
      label: 'Transfers',
      activities: [
        { id: 'sit-stand', label: 'Sit ↔ Stand', shortcut: 'sts' },
        { id: 'stand-pivot', label: 'Stand-Pivot', shortcut: 'piv' },
        { id: 'toilet-transfer', label: 'Toilet Transfer', shortcut: 'tt' },
        { id: 'tub-transfer', label: 'Tub/Shower Transfer', shortcut: 'tub' },
        { id: 'bed-wc', label: 'Bed ↔ W/C', shortcut: 'bwc' },
        { id: 'car-transfer', label: 'Car Transfer', shortcut: 'car' }
      ]
    },
    bedMobility: {
      label: 'Bed Mobility',
      activities: [
        { id: 'supine-sit', label: 'Supine ↔ Sit EOB', shortcut: 'sup' },
        { id: 'rolling', label: 'Rolling', shortcut: 'roll' },
        { id: 'scooting', label: 'Scooting/Repositioning', shortcut: 'scoot' }
      ]
    },
    balance: {
      label: 'Balance Training',
      activities: [
        { id: 'sitting-balance', label: 'Sitting Balance', shortcut: 'sitbal' },
        { id: 'standing-balance', label: 'Standing Balance', shortcut: 'stbal' },
        { id: 'dynamic-balance', label: 'Dynamic Balance', shortcut: 'dyn' }
      ]
    },
    therapeutic: {
      label: 'Therapeutic Exercise',
      activities: [
        { id: 'ue-strength', label: 'UE Strengthening', shortcut: 'ues' },
        { id: 'le-strength', label: 'LE Strengthening', shortcut: 'les' },
        { id: 'core-strength', label: 'Core Stabilization', shortcut: 'core' },
        { id: 'arom', label: 'AROM', shortcut: 'arom' },
        { id: 'prom', label: 'PROM', shortcut: 'prom' },
        { id: 'aarom', label: 'AAROM', shortcut: 'aarom' },
        { id: 'fine-motor', label: 'Fine Motor', shortcut: 'fm' }
      ]
    },
    iadl: {
      label: 'IADLs',
      activities: [
        { id: 'meal-prep', label: 'Meal Preparation', shortcut: 'meal' },
        { id: 'med-mgmt', label: 'Medication Management', shortcut: 'med' },
        { id: 'light-housekeeping', label: 'Light Housekeeping', shortcut: 'hsk' }
      ]
    }
  },

  // ══════════════════════════════════════════════════════════════
  // ASSIST LEVELS (FIM-Based)
  // ══════════════════════════════════════════════════════════════
  assistLevels: [
    { id: 'I', label: 'Independent', fim: 7, phrase: 'independently' },
    { id: 'ModI', label: 'Modified Independent', fim: 6, phrase: 'with modified independence' },
    { id: 'S', label: 'Supervision', fim: 5, phrase: 'with supervision' },
    { id: 'CGA', label: 'Contact Guard', fim: 5, phrase: 'with CGA' },
    { id: 'MinA', label: 'Minimal Assist', fim: 4, phrase: 'with minimal assistance', pct: '25%' },
    { id: 'ModA', label: 'Moderate Assist', fim: 3, phrase: 'with moderate assistance', pct: '50%' },
    { id: 'MaxA', label: 'Maximum Assist', fim: 2, phrase: 'with maximum assistance', pct: '75%' },
    { id: 'Dep', label: 'Dependent', fim: 1, phrase: 'with dependent assistance' }
  ],

  // ══════════════════════════════════════════════════════════════
  // ASSIST LOCATIONS
  // ══════════════════════════════════════════════════════════════
  assistLocations: [
    { id: 'trunk', label: 'at trunk' },
    { id: 'hips', label: 'at hips' },
    { id: 'bilat-ue', label: 'bilateral UEs' },
    { id: 'bilat-le', label: 'bilateral LEs' },
    { id: 'r-ue', label: 'R UE' },
    { id: 'l-ue', label: 'L UE' },
    { id: 'r-le', label: 'R LE' },
    { id: 'l-le', label: 'L LE' },
    { id: 'gait-belt', label: 'at gait belt' }
  ],

  // ══════════════════════════════════════════════════════════════
  // CUE TYPES
  // ══════════════════════════════════════════════════════════════
  cueTypes: [
    { id: 'verbal', label: 'Verbal' },
    { id: 'tactile', label: 'Tactile' },
    { id: 'visual', label: 'Visual' },
    { id: 'gestural', label: 'Gestural' }
  ],

  cuePurposes: [
    { id: 'safety', label: 'for safety' },
    { id: 'sequencing', label: 'for sequencing' },
    { id: 'technique', label: 'for technique' },
    { id: 'pacing', label: 'for pacing' },
    { id: 'initiation', label: 'for initiation' },
    { id: 'attention', label: 'for attention to task' },
    { id: 'weight-shift', label: 'for weight shift' },
    { id: 'posture', label: 'for posture' }
  ],

  // ══════════════════════════════════════════════════════════════
  // TOLERANCE/RESPONSE
  // ══════════════════════════════════════════════════════════════
  tolerance: [
    { id: 'well', label: 'Tolerated well', phrase: 'Patient tolerated activity well without adverse response.' },
    { id: 'min-fatigue', label: 'Minimal fatigue', phrase: 'Patient tolerated with minimal fatigue noted.' },
    { id: 'rest-breaks', label: 'Rest breaks', phrase: 'Rest breaks required to complete activity.' },
    { id: 'fatigue-limited', label: 'Fatigue limited', phrase: 'Activity limited secondary to fatigue.' },
    { id: 'pain-limited', label: 'Pain limited', phrase: 'Activity limited secondary to pain.' },
    { id: 'sob', label: 'SOB noted', phrase: 'Shortness of breath noted, requiring activity modification.' },
    { id: 'declined', label: 'Declined', phrase: 'Patient declined to participate.' }
  ],

  // ══════════════════════════════════════════════════════════════
  // PROGRESS
  // ══════════════════════════════════════════════════════════════
  progress: [
    { id: 'improved', label: 'Improved', phrase: 'Patient demonstrated improvement from prior session.' },
    { id: 'progressing', label: 'Progressing', phrase: 'Patient progressing toward goals.' },
    { id: 'same', label: 'Same', phrase: 'Performance consistent with prior session.' },
    { id: 'plateau', label: 'Plateau', phrase: 'Patient at plateau; reassessing approach.' },
    { id: 'declined', label: 'Declined', phrase: 'Regression noted; will adjust treatment plan.' },
    { id: 'baseline', label: 'Baseline', phrase: 'Initial session; baseline established.' }
  ],

  // ══════════════════════════════════════════════════════════════
  // PLAN
  // ══════════════════════════════════════════════════════════════
  plan: [
    { id: 'continue', label: 'Continue', phrase: 'Continue current treatment approach.' },
    { id: 'progress', label: 'Progress', phrase: 'Progress activity to increase challenge.' },
    { id: 'decrease-assist', label: '↓ Assist', phrase: 'Decrease level of assistance as tolerated.' },
    { id: 'add-equipment', label: 'Add DME', phrase: 'Introduce adaptive equipment.' },
    { id: 'modify', label: 'Modify', phrase: 'Modify approach based on patient response.' },
    { id: 'reassess', label: 'Reassess', phrase: 'Reassess goals and treatment plan.' },
    { id: 'dc-planning', label: 'D/C Planning', phrase: 'Initiate discharge planning.' }
  ],

  // ══════════════════════════════════════════════════════════════
  // SMART DEFAULTS - Activity → Suggested Options
  // ══════════════════════════════════════════════════════════════
  smartDefaults: {
    // Transfers
    'sit-stand': {
      skills: ['stabilizes', 'positions', 'endures', 'paces'],
      assists: ['CGA', 'MinA', 'ModA'],
      locations: ['trunk', 'gait-belt'],
      cues: [{ type: 'verbal', purpose: 'weight-shift' }, { type: 'verbal', purpose: 'safety' }],
      goals: ['Improve transfer safety', 'Increase independence with transfers', '↓ fall risk']
    },
    'stand-pivot': {
      skills: ['stabilizes', 'positions', 'coordinates', 'paces'],
      assists: ['CGA', 'MinA', 'ModA'],
      locations: ['trunk', 'gait-belt', 'hips'],
      cues: [{ type: 'verbal', purpose: 'weight-shift' }, { type: 'verbal', purpose: 'safety' }],
      goals: ['Improve transfer safety', 'Increase independence with transfers', '↓ fall risk']
    },
    'toilet-transfer': {
      skills: ['stabilizes', 'positions', 'sequences', 'heeds'],
      assists: ['CGA', 'MinA', 'ModA'],
      locations: ['trunk', 'gait-belt'],
      cues: [{ type: 'verbal', purpose: 'safety' }, { type: 'verbal', purpose: 'sequencing' }],
      goals: ['Improve transfer safety', 'Increase independence with toileting']
    },
    'tub-transfer': {
      skills: ['stabilizes', 'positions', 'sequences', 'heeds'],
      assists: ['CGA', 'MinA', 'ModA'],
      locations: ['trunk', 'gait-belt'],
      cues: [{ type: 'verbal', purpose: 'safety' }, { type: 'verbal', purpose: 'sequencing' }],
      goals: ['Improve transfer safety', 'Increase independence with bathing']
    },
    'bed-wc': {
      skills: ['stabilizes', 'positions', 'sequences', 'coordinates'],
      assists: ['MinA', 'ModA', 'CGA'],
      locations: ['trunk', 'gait-belt'],
      cues: [{ type: 'verbal', purpose: 'safety' }, { type: 'verbal', purpose: 'sequencing' }],
      goals: ['Improve transfer safety', 'Increase independence with transfers']
    },
    'car-transfer': {
      skills: ['stabilizes', 'positions', 'sequences', 'bends'],
      assists: ['MinA', 'ModA', 'CGA'],
      locations: ['trunk', 'gait-belt'],
      cues: [{ type: 'verbal', purpose: 'safety' }, { type: 'verbal', purpose: 'sequencing' }],
      goals: ['Improve transfer safety', 'Prepare for community mobility']
    },

    // ADLs
    'dressing-ub': {
      skills: ['reaches', 'grips', 'manipulates', 'sequences'],
      assists: ['MinA', 'S', 'ModI'],
      locations: ['bilat-ue'],
      cues: [{ type: 'verbal', purpose: 'sequencing' }],
      goals: ['Increase independence with dressing', 'Improve UE function for ADLs']
    },
    'dressing-lb': {
      skills: ['bends', 'reaches', 'grips', 'sequences', 'stabilizes'],
      assists: ['MinA', 'ModA', 'S'],
      locations: ['trunk', 'bilat-le'],
      cues: [{ type: 'verbal', purpose: 'safety' }, { type: 'verbal', purpose: 'sequencing' }],
      goals: ['Increase independence with dressing', 'Improve dynamic balance for ADLs']
    },
    'bathing': {
      skills: ['reaches', 'stabilizes', 'endures', 'sequences'],
      assists: ['CGA', 'MinA', 'S'],
      locations: ['trunk'],
      cues: [{ type: 'verbal', purpose: 'safety' }, { type: 'verbal', purpose: 'pacing' }],
      goals: ['Increase independence with bathing', 'Improve safety with bathing']
    },
    'toileting': {
      skills: ['stabilizes', 'positions', 'sequences', 'manipulates'],
      assists: ['CGA', 'MinA', 'S'],
      locations: ['trunk', 'gait-belt'],
      cues: [{ type: 'verbal', purpose: 'safety' }],
      goals: ['Increase independence with toileting', 'Improve safety with toileting']
    },
    'toilet-hygiene': {
      skills: ['reaches', 'manipulates', 'sequences', 'stabilizes'],
      assists: ['MinA', 'S', 'CGA'],
      locations: ['trunk'],
      cues: [{ type: 'verbal', purpose: 'sequencing' }],
      goals: ['Increase independence with toileting', 'Improve hygiene management']
    },
    'grooming': {
      skills: ['reaches', 'grips', 'manipulates', 'endures'],
      assists: ['S', 'MinA', 'ModI'],
      locations: ['bilat-ue'],
      cues: [{ type: 'verbal', purpose: 'pacing' }],
      goals: ['Increase independence with grooming', 'Improve standing tolerance']
    },
    'self-feeding': {
      skills: ['reaches', 'grips', 'manipulates', 'coordinates'],
      assists: ['S', 'MinA', 'ModI'],
      locations: ['bilat-ue', 'r-ue', 'l-ue'],
      cues: [{ type: 'verbal', purpose: 'pacing' }],
      goals: ['Increase independence with self-feeding', 'Improve UE coordination']
    },
    'functional-mobility': {
      skills: ['walks', 'navigates', 'endures', 'stabilizes'],
      assists: ['CGA', 'MinA', 'S'],
      locations: ['trunk', 'gait-belt'],
      cues: [{ type: 'verbal', purpose: 'safety' }],
      goals: ['Improve functional mobility', 'Improve ambulation safety']
    },
    'personal-hygiene': {
      skills: ['reaches', 'manipulates', 'sequences', 'endures'],
      assists: ['S', 'MinA', 'ModI'],
      locations: ['bilat-ue'],
      cues: [{ type: 'verbal', purpose: 'sequencing' }],
      goals: ['Increase independence with hygiene', 'Improve ADL performance']
    },

    // Bed Mobility
    'supine-sit': {
      skills: ['stabilizes', 'positions', 'coordinates', 'sequences'],
      assists: ['MinA', 'ModA', 'CGA'],
      locations: ['trunk'],
      cues: [{ type: 'verbal', purpose: 'sequencing' }, { type: 'tactile', purpose: 'technique' }],
      goals: ['Improve bed mobility', 'Increase independence with bed mobility']
    },
    'rolling': {
      skills: ['stabilizes', 'coordinates', 'initiates'],
      assists: ['MinA', 'ModA', 'S'],
      locations: ['trunk', 'hips'],
      cues: [{ type: 'verbal', purpose: 'sequencing' }],
      goals: ['Improve bed mobility', 'Increase trunk control']
    },
    'scooting': {
      skills: ['stabilizes', 'coordinates', 'positions'],
      assists: ['MinA', 'ModA', 'S'],
      locations: ['trunk', 'hips'],
      cues: [{ type: 'verbal', purpose: 'technique' }],
      goals: ['Improve bed mobility', 'Improve repositioning ability']
    },

    // Balance
    'sitting-balance': {
      skills: ['stabilizes', 'adjusts', 'reaches'],
      assists: ['CGA', 'S', 'MinA'],
      locations: ['trunk'],
      cues: [{ type: 'verbal', purpose: 'posture' }, { type: 'tactile', purpose: 'technique' }],
      goals: ['Improve sitting balance', 'Improve trunk control']
    },
    'standing-balance': {
      skills: ['stabilizes', 'adjusts', 'endures'],
      assists: ['CGA', 'MinA', 'S'],
      locations: ['trunk', 'gait-belt'],
      cues: [{ type: 'verbal', purpose: 'weight-shift' }, { type: 'verbal', purpose: 'safety' }],
      goals: ['Improve standing balance', '↓ fall risk', 'Improve standing tolerance']
    },
    'dynamic-balance': {
      skills: ['stabilizes', 'adjusts', 'navigates', 'reaches'],
      assists: ['CGA', 'MinA', 'S'],
      locations: ['trunk', 'gait-belt'],
      cues: [{ type: 'verbal', purpose: 'weight-shift' }, { type: 'verbal', purpose: 'safety' }],
      goals: ['Improve dynamic balance', '↓ fall risk', 'Improve functional mobility']
    },

    // Therapeutic Exercise
    'ue-strength': {
      skills: ['grips', 'reaches', 'lifts', 'calibrates'],
      assists: ['S', 'ModI', 'I'],
      locations: ['bilat-ue'],
      cues: [{ type: 'verbal', purpose: 'technique' }, { type: 'verbal', purpose: 'pacing' }],
      goals: ['Improve UE strength', 'Improve UE function for ADLs']
    },
    'le-strength': {
      skills: ['stabilizes', 'lifts', 'endures', 'calibrates'],
      assists: ['S', 'ModI', 'I'],
      locations: ['bilat-le'],
      cues: [{ type: 'verbal', purpose: 'technique' }, { type: 'verbal', purpose: 'pacing' }],
      goals: ['Improve LE strength', 'Improve transfer ability']
    },
    'core-strength': {
      skills: ['stabilizes', 'endures', 'paces'],
      assists: ['S', 'MinA', 'ModI'],
      locations: ['trunk'],
      cues: [{ type: 'verbal', purpose: 'technique' }],
      goals: ['Improve core stability', 'Improve trunk control', 'Improve balance']
    },
    'arom': {
      skills: ['reaches', 'flows', 'calibrates'],
      assists: ['S', 'ModI', 'I'],
      locations: ['bilat-ue', 'bilat-le'],
      cues: [{ type: 'verbal', purpose: 'technique' }],
      goals: ['Improve ROM', 'Maintain functional mobility']
    },
    'prom': {
      skills: [],
      assists: ['Dep'],
      locations: ['bilat-ue', 'bilat-le'],
      cues: [],
      goals: ['Maintain ROM', 'Prevent contracture']
    },
    'aarom': {
      skills: ['reaches', 'flows'],
      assists: ['MinA', 'ModA'],
      locations: ['bilat-ue', 'bilat-le'],
      cues: [{ type: 'verbal', purpose: 'technique' }],
      goals: ['Improve ROM', 'Progress toward AROM']
    },
    'fine-motor': {
      skills: ['grips', 'manipulates', 'coordinates', 'calibrates'],
      assists: ['S', 'ModI', 'I'],
      locations: ['bilat-ue', 'r-ue', 'l-ue'],
      cues: [{ type: 'verbal', purpose: 'technique' }],
      goals: ['Improve fine motor coordination', 'Improve hand function for ADLs']
    },

    // IADLs
    'meal-prep': {
      skills: ['sequences', 'organizes', 'reaches', 'manipulates', 'heeds'],
      assists: ['S', 'MinA', 'CGA'],
      locations: ['trunk'],
      cues: [{ type: 'verbal', purpose: 'sequencing' }, { type: 'verbal', purpose: 'safety' }],
      goals: ['Increase independence with IADLs', 'Improve safety with kitchen tasks']
    },
    'med-mgmt': {
      skills: ['sequences', 'attends', 'chooses', 'organizes'],
      assists: ['S', 'MinA'],
      locations: [],
      cues: [{ type: 'verbal', purpose: 'sequencing' }, { type: 'visual', purpose: 'attention' }],
      goals: ['Improve medication management', 'Improve cognitive function for IADLs']
    },
    'light-housekeeping': {
      skills: ['endures', 'sequences', 'organizes', 'heeds'],
      assists: ['S', 'MinA', 'CGA'],
      locations: ['trunk'],
      cues: [{ type: 'verbal', purpose: 'pacing' }, { type: 'verbal', purpose: 'safety' }],
      goals: ['Increase independence with IADLs', 'Improve activity tolerance']
    }
  },

  // ══════════════════════════════════════════════════════════════
  // KEYBOARD SHORTCUTS MAPPING
  // ══════════════════════════════════════════════════════════════
  shortcuts: {
    // Activities (from occupation shortcut fields)
    activities: {}, // Will be populated from occupations

    // Assist levels
    assist: {
      'i': 'I',
      'modi': 'ModI',
      's': 'S',
      'cga': 'CGA',
      'mina': 'MinA',
      'moda': 'ModA',
      'maxa': 'MaxA',
      'dep': 'Dep'
    },

    // Cue types
    cueTypes: {
      'vc': 'verbal',
      'tc': 'tactile',
      'vis': 'visual',
      'ges': 'gestural'
    },

    // Tolerance
    tolerance: {
      'tw': 'well',
      'mf': 'min-fatigue',
      'rb': 'rest-breaks',
      'fl': 'fatigue-limited',
      'pl': 'pain-limited',
      'sob': 'sob',
      'dec': 'declined'
    },

    // Progress
    progress: {
      'imp': 'improved',
      'prog': 'progressing',
      'same': 'same',
      'plat': 'plateau',
      'regr': 'declined',
      'base': 'baseline'
    },

    // Plan
    plan: {
      'cont': 'continue',
      'prg': 'progress',
      'deca': 'decrease-assist',
      'dme': 'add-equipment',
      'mod': 'modify',
      'reas': 'reassess',
      'dc': 'dc-planning'
    }
  },

  // ══════════════════════════════════════════════════════════════
  // HELPER METHODS
  // ══════════════════════════════════════════════════════════════

  /**
   * Find an activity by ID across all occupation categories
   */
  findActivity: function(activityId) {
    for (const category of Object.values(this.occupations)) {
      const activity = category.activities.find(a => a.id === activityId);
      if (activity) {
        return { ...activity, category: category.label };
      }
    }
    return null;
  },

  /**
   * Find an activity by shortcut
   */
  findActivityByShortcut: function(shortcut) {
    const normalizedShortcut = shortcut.toLowerCase();
    for (const category of Object.values(this.occupations)) {
      const activity = category.activities.find(a => a.shortcut === normalizedShortcut);
      if (activity) {
        return { ...activity, category: category.label };
      }
    }
    return null;
  },

  /**
   * Find a performance skill by ID
   */
  findSkill: function(skillId) {
    for (const category of Object.values(this.performanceSkills)) {
      const skill = category.skills.find(s => s.id === skillId);
      if (skill) {
        return { ...skill, category: category.label };
      }
    }
    return null;
  },

  /**
   * Find assist level by ID
   */
  findAssistLevel: function(assistId) {
    return this.assistLevels.find(a => a.id === assistId);
  },

  /**
   * Get all activities as flat array
   */
  getAllActivities: function() {
    const activities = [];
    for (const [categoryId, category] of Object.entries(this.occupations)) {
      for (const activity of category.activities) {
        activities.push({
          ...activity,
          categoryId,
          categoryLabel: category.label
        });
      }
    }
    return activities;
  },

  /**
   * Get all skills as flat array
   */
  getAllSkills: function() {
    const skills = [];
    for (const [categoryId, category] of Object.entries(this.performanceSkills)) {
      for (const skill of category.skills) {
        skills.push({
          ...skill,
          categoryId,
          categoryLabel: category.label
        });
      }
    }
    return skills;
  },

  /**
   * Initialize shortcuts from occupations
   */
  initShortcuts: function() {
    for (const category of Object.values(this.occupations)) {
      for (const activity of category.activities) {
        if (activity.shortcut) {
          this.shortcuts.activities[activity.shortcut] = activity.id;
        }
      }
    }
  }
};

// Initialize shortcuts on load
DockyData.initShortcuts();

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DockyData;
}
if (typeof window !== 'undefined') {
  window.DockyData = DockyData;
}
