/**
 * 97530 vocabularies + activity profiles + activity entries.
 *
 * Layered structure so an activity entry composes from shared
 * vocabularies and a profile rather than re-declaring everything.
 * The same words live in exactly one place — change them once,
 * every activity referencing them updates.
 *
 * Layers:
 *
 *   1. SHARED VOCABULARIES — assist levels, assist locations,
 *      assist purposes, cue types, cue quantities, cue purposes,
 *      position phrases, equipment. Each entry is a small object
 *      with at minimum an `id` and a `phrase` (the rendered form).
 *      Some carry a `class` (e.g., equipment) or other metadata.
 *
 *   2. PROFILES — defaults grouped by activity type
 *      (transitional-mobility, fine-motor-task,
 *       standing-balance-task, ...). Activities inherit a profile
 *      and override only what's specific.
 *
 *   3. ACTIVITIES — one entry per 97530 activity. References
 *      vocabularies by id, declares only what's specific. Carries
 *      a `corpusEvidence` field pointing at the anchor in
 *      Section 1.5 of `docs/97530-corpus.md`, so "where did this
 *      default come from?" is answerable from the entry alone.
 *
 * Slice 5a ships three reference activities — wrist-roller-activity,
 * untie-theraband-knots, ring-toss — chosen because slice 1 tests
 * Fragment A / C / D against them. Slice 5b will pour in the rest
 * of the user's caseload.
 *
 * Compose helper: `compose(activityId, overrides)` resolves an
 * activity entry into the engine's params shape. Tests verify the
 * composed params produce the same engine output as slice 1's
 * hand-authored fixtures.
 *
 * Threshold for moving PROFILES into its own file: 15 profiles.
 * Below 15 they live next to the vocabularies they reference (this
 * file). At 15+ the file gets unwieldy; split.
 *
 * Engine docstring (`docky/core/engine.js`) and the patterns spec
 * (`docs/97530-patterns.md`) cover the rendering side; this file
 * is the input side.
 */

// ══════════════════════════════════════════════════════════════
// LAYER 1 — SHARED VOCABULARIES
// ══════════════════════════════════════════════════════════════

const ASSIST_LEVELS = {
  'max':         { id: 'max',         phrase: 'max physical assist',  short: 'max A' },
  'mod':         { id: 'mod',         phrase: 'mod physical assist',  short: 'mod A' },
  'min':         { id: 'min',         phrase: 'min physical assist',  short: 'min A' },
  'cga':         { id: 'cga',         phrase: 'CGA',                  short: 'CGA' },
  'sba':         { id: 'sba',         phrase: 'SBA',                  short: 'SBA' },
  'standby':     { id: 'standby',     phrase: 'standby assist',       short: 'SBA' },
  'supervision': { id: 'supervision', phrase: 'supervision assist',   short: 'S' },
  'touching':    { id: 'touching',    phrase: 'touching assist',      short: 'TA' },
  'independent': { id: 'independent', phrase: 'independent',          short: 'I' },
  'modified-i':  { id: 'modified-i',  phrase: 'modified independent', short: 'ModI' }
};

const ASSIST_LOCATIONS = {
  'gait-belt':            { id: 'gait-belt',            phrase: 'gait belt' },
  'pelvis':               { id: 'pelvis',               phrase: 'pelvis' },
  'l-pelvis':             { id: 'l-pelvis',             phrase: 'L pelvis' },
  'pelvis-bilateral':     { id: 'pelvis-bilateral',     phrase: 'bilateral pelvis' },
  'trunk':                { id: 'trunk',                phrase: 'trunk' },
  'posterior-trunk':      { id: 'posterior-trunk',      phrase: 'posterior trunk' },
  'trunk-and-ue':         { id: 'trunk-and-ue',         phrase: 'trunk and BUE' },
  'scapula':              { id: 'scapula',              phrase: 'scapula' },
  'l-scapula':            { id: 'l-scapula',            phrase: 'L scapula' },
  'bue':                  { id: 'bue',                  phrase: 'BUE' },
  'ble':                  { id: 'ble',                  phrase: 'BLE' },
  'r-ue':                 { id: 'r-ue',                 phrase: 'R UE' },
  'l-ue':                 { id: 'l-ue',                 phrase: 'L UE' },
  'greater-trochanters':  { id: 'greater-trochanters',  phrase: 'bilateral greater trochanters' },
  'draw-sheet':           { id: 'draw-sheet',           phrase: 'draw sheet' }
};

const ASSIST_PURPOSES = {
  'safety':                          { id: 'safety',                          phrase: 'for safety' },
  'support-and-safety':              { id: 'support-and-safety',              phrase: 'for support and safety' },
  'stability':                       { id: 'stability',                       phrase: 'for stability' },
  'balance-support':                 { id: 'balance-support',                 phrase: 'for balance support' },
  'weight-shift':                    { id: 'weight-shift',                    phrase: 'to facilitate weight shift' },
  'inhibit-retropulsion':            { id: 'inhibit-retropulsion',            phrase: 'to inhibit retropulsion' },
  'midline-stability':               { id: 'midline-stability',               phrase: 'for midline stability' },
  'safety-during-dual-task':         { id: 'safety-during-dual-task',         phrase: 'for safety during dual-task performance' },
  'body-mechanics-safety':           { id: 'body-mechanics-safety',           phrase: 'for safe body mechanics' },
  'safety-during-dynamic-task':      { id: 'safety-during-dynamic-task',      phrase: 'for safety during dynamic task performance' },
  'safety-through-transitional-phases':{id:'safety-through-transitional-phases',phrase:'through transitional phases' },
  'motor-sequencing-through-maneuver':{id:'motor-sequencing-through-maneuver',phrase:'through transitional phases' }
};

const CUE_TYPES = {
  'verbal':       { id: 'verbal',       phrase: 'verbal' },
  'tactile':      { id: 'tactile',      phrase: 'tactile' },
  'visual':       { id: 'visual',       phrase: 'visual' },
  'demonstration':{ id: 'demonstration',phrase: 'demonstration' },
  'gestural':     { id: 'gestural',     phrase: 'gestural' }
};

const CUE_QUANTITIES = {
  // Level qualifiers (case preserved as it appears in corpus most often).
  'min':          { id: 'min',          phrase: 'Min' },
  'mod':          { id: 'mod',          phrase: 'Mod' },
  'max':          { id: 'max',          phrase: 'Max' },
  'intermittent': { id: 'intermittent', phrase: 'Intermittent' },
  'fading':       { id: 'fading',       phrase: 'fading' },
  // Numeric quantities are passed through verbatim by the renderer
  // — no vocabulary entries needed for "1", "2", "3".
};

const CUE_PURPOSES = {
  // Free-text purposes most common in the corpus. Activities can
  // pass arbitrary purposes to the engine; these are the canonical
  // ones surfaced for UI/composer convenience.
  'safety-awareness':         { id: 'safety-awareness',         phrase: 'safety awareness' },
  'pacing':                   { id: 'pacing',                   phrase: 'pacing' },
  'pacing-and-task-management':{id:'pacing-and-task-management',phrase: 'pacing and task management' },
  'pinch-strategies':         { id: 'pinch-strategies',         phrase: 'pinch strategies' },
  'engaging-core':            { id: 'engaging-core',            phrase: 'engaging core' },
  'safe-sequence-ue':         { id: 'safe-sequence-ue',         phrase: 'safe sequence and hand UE placement' },
  'initiation-and-technique': { id: 'initiation-and-technique', phrase: 'initiation and technique' },
  'open-technique':           { id: 'open-technique',           phrase: 'open technique' },
  'hip-mobility':             { id: 'hip-mobility',             phrase: 'hip mobility' },
  'ble-foot-placement':       { id: 'ble-foot-placement',       phrase: 'BLE and foot placement' },
  'timed-release':            { id: 'timed-release',            phrase: 'timed release for enhanced coordination' },
  'safe-walker-management':   { id: 'safe-walker-management',   phrase: 'safe walker management' },
  'keep-walker-on-ground':    { id: 'keep-walker-on-ground',    phrase: 'keep walker on ground' },
  'body-and-safety-awareness':{ id: 'body-and-safety-awareness',phrase: 'increased body and safety awareness' },
  'motor-sequencing':         { id: 'motor-sequencing',         phrase: 'motor sequencing' },
  'midline-orientation':      { id: 'midline-orientation',      phrase: 'midline orientation' },
  'body-mechanics':           { id: 'body-mechanics',           phrase: 'body mechanics' },
  'trunk-control':            { id: 'trunk-control',            phrase: 'trunk control' }
};

const POSITION_PHRASES = {
  'from-wc':              { id: 'from-wc',              phrase: 'from w/c' },
  'wc-to-bed':            { id: 'wc-to-bed',            phrase: 'from w/c to bed' },
  'bed-to-wc':            { id: 'bed-to-wc',            phrase: 'from bed to w/c' },
  'wc-to-toilet':         { id: 'wc-to-toilet',         phrase: 'from w/c to toilet' },
  'wc-to-shower-bench':   { id: 'wc-to-shower-bench',   phrase: 'from w/c to shower bench' },
  'eob':                  { id: 'eob',                  phrase: 'EOB' },
  'while-seated-eob':     { id: 'while-seated-eob',     phrase: 'while seated EOB' },
  'seated-in-wc':         { id: 'seated-in-wc',         phrase: 'seated in w/c' },
  'standing':             { id: 'standing',             phrase: 'standing' },
  'while-standing':       { id: 'while-standing',       phrase: 'while standing' },
  'on-uneven-surface':    { id: 'on-uneven-surface',    phrase: 'on uneven walkway surfaces' },
  'performed-bilaterally':{ id: 'performed-bilaterally',phrase: 'performed bilaterally' },
  'supine':               { id: 'supine',               phrase: 'supine' },
  'sidelying':            { id: 'sidelying',            phrase: 'sidelying' },
  'l-sidelying':          { id: 'l-sidelying',          phrase: 'L sidelying' },
  'r-sidelying':          { id: 'r-sidelying',          phrase: 'R sidelying' },
  'quadruped':            { id: 'quadruped',            phrase: 'quadruped' },
  'half-kneel':           { id: 'half-kneel',           phrase: 'half-kneel' },
  'tall-kneel':           { id: 'tall-kneel',           phrase: 'tall kneel' },
  'at-counter':           { id: 'at-counter',           phrase: 'at counter' },
  'at-kitchen-counter':   { id: 'at-kitchen-counter',   phrase: 'at kitchen counter' },
  'on-foam':              { id: 'on-foam',              phrase: 'on foam' }
};

// Equipment carries a `class` because the engine's foregrounding
// rule (P15) and rendering choices depend on it. Classes:
//   'substrate'                — material the activity manipulates;
//                                renders as substrate, ranks 6 in
//                                P15 tiebreaker.
//   'substrate-graded'         — substrate that also encodes a
//                                grade (color/weight). Same render
//                                path; foregrounding rank 7 when
//                                no substrate is present.
//   'substrate-graded-bundled' — substrate-graded that's a single
//                                noun phrase ("5 large lightweight
//                                rings"). The phrase is atomic;
//                                _formatList must not split it.
//   'qualifying-difficulty'    — equipment that qualifies the
//                                activity's difficulty (RW, gait
//                                belt). Ranks 8 in P15.
//
// `spelled` carries the long form for documents that prefer
// expanded abbreviations. Engine doesn't read it yet; future use.

const EQUIPMENT = {
  'rw':                     { id: 'rw',                     phrase: 'RW',                          class: 'qualifying-difficulty', spelled: 'rolling walker' },
  'rollator':               { id: 'rollator',               phrase: 'rollator',                    class: 'qualifying-difficulty' },
  'walker':                 { id: 'walker',                 phrase: 'walker',                      class: 'qualifying-difficulty', spelled: 'standard walker' },
  'fwwc':                   { id: 'fwwc',                   phrase: 'FWW',                         class: 'qualifying-difficulty', spelled: 'front-wheeled walker' },
  'cane':                   { id: 'cane',                   phrase: 'cane',                        class: 'qualifying-difficulty' },
  'gait-belt':              { id: 'gait-belt',              phrase: 'gait belt',                   class: 'qualifying-difficulty' },
  'shower-bench':           { id: 'shower-bench',           phrase: 'shower bench',                class: 'qualifying-difficulty' },
  'transfer-board':         { id: 'transfer-board',         phrase: 'transfer board',              class: 'qualifying-difficulty' },
  'draw-sheet':             { id: 'draw-sheet',             phrase: 'draw sheet',                  class: 'qualifying-difficulty' },
  'theraband':              { id: 'theraband',              phrase: 'theraband',                   class: 'substrate' },
  'lightweight-rope':       { id: 'lightweight-rope',       phrase: 'a lightweight rope',          class: 'substrate', grade: 'lightweight' },
  'dowel-bar':              { id: 'dowel-bar',              phrase: 'a dowel bar',                 class: 'substrate' },
  'pegboard':               { id: 'pegboard',               phrase: 'pegboard',                    class: 'substrate' },
  'clothespins':            { id: 'clothespins',            phrase: 'clothespins',                 class: 'substrate' },
  'orange-theraputty':      { id: 'orange-theraputty',      phrase: 'orange theraputty',           class: 'substrate-graded', grade: 'orange' },
  'red-theraputty':         { id: 'red-theraputty',         phrase: 'red theraputty',              class: 'substrate-graded', grade: 'red' },
  'green-theraputty':       { id: 'green-theraputty',       phrase: 'green theraputty',            class: 'substrate-graded', grade: 'green' },
  'blue-theraputty':        { id: 'blue-theraputty',        phrase: 'blue theraputty',             class: 'substrate-graded', grade: 'blue' },
  'plastic-eggs-with-pegs': { id: 'plastic-eggs-with-pegs', phrase: 'plastic eggs with pegs inside',class:'substrate' },
  'large-lightweight-rings':{ id: 'large-lightweight-rings',phrase: '5 large lightweight rings',   class: 'substrate-graded-bundled' },
  'medium-weight-objects':  { id: 'medium-weight-objects',  phrase: 'medium-weight objects',       class: 'substrate-graded', grade: 'medium' },
  'foam-surface':           { id: 'foam-surface',           phrase: 'foam surface',                class: 'graded' },
  'rocker-board':           { id: 'rocker-board',           phrase: 'rocker board',                class: 'graded' },
  'bosu':                   { id: 'bosu',                   phrase: 'BOSU',                        class: 'graded' }
};

// ══════════════════════════════════════════════════════════════
// LAYER 2 — PROFILES
//
// Defaults grouped by activity type. Activities inherit a profile;
// individual activities override only what differs from the
// profile. Profiles cover the corpus-attested activity categories;
// add new profiles only when the activity's defaults genuinely
// don't fit any existing one.
//
// `foregroundingHint` is advisory — the engine's P15 tiebreaker
// still picks the foreground based on present signals. The hint
// just tells composers what kind of quantification to expect for
// the activity.
//
// `rendersAsActivityList` controls partition routing: when true,
// activities of this profile render as members of a P3 opener's
// focus list ("Skilled interventions focused on [list], to [goal]")
// rather than as their own activity sentences. When false (the
// default for almost every profile), activities render as their
// own sentences via the standard activity-stack path.
//
// Threshold for moving PROFILES into its own file: 15 profiles.
// Currently at 11. When the count crosses 15, split.
// ══════════════════════════════════════════════════════════════

const PROFILES = {
  'transitional-mobility': {
    id: 'transitional-mobility',
    description: 'Sit-to-stand, stand-pivot, lateral scooting, transfers',
    typicalAssistLevel: 'min',          // varies; 'mod' or 'max' for higher-acuity
    typicalAssistLocation: 'gait-belt',
    typicalAssistPurpose: 'safety',
    typicalCueQuantity: 'mod',
    typicalCueType: 'verbal',
    typicalCuePurpose: 'safe-sequence-ue',
    foregroundingHint: 'activity-as-event',
    p3Trigger: false,
    rendersAsActivityList: false
  },
  'fine-motor-task': {
    id: 'fine-motor-task',
    description: 'Theraband knots, peg-and-hole, hand strengthening',
    typicalAssistLevel: 'independent',
    typicalCueQuantity: 'min',
    typicalCueType: 'verbal',
    typicalCuePurpose: 'pinch-strategies',
    foregroundingHint: 'fraction',
    p3Trigger: false,
    rendersAsActivityList: false
  },
  'standing-balance-task': {
    id: 'standing-balance-task',
    description: 'Ring toss, dynamic standing balance, weight shifts in standing',
    typicalAssistLevel: 'cga',
    typicalAssistPurpose: 'balance-support',
    typicalCueQuantity: 'mod',
    typicalCueType: 'verbal',
    typicalCuePurpose: 'ble-foot-placement',
    foregroundingHint: 'count-or-fraction',
    p3Trigger: true,   // can read low-skill in isolation
    rendersAsActivityList: false
  },
  'bilateral-coordination-task': {
    id: 'bilateral-coordination-task',
    description: 'Wrist roller, plastic eggs, theraputty rolling',
    typicalAssistLevel: 'independent',
    typicalCueQuantity: 'min',
    typicalCueType: 'verbal',
    typicalCuePurpose: 'pacing',
    foregroundingHint: 'distance-or-substrate',
    p3Trigger: false,
    rendersAsActivityList: false
  },
  'functional-mobility': {
    id: 'functional-mobility',
    description: 'Item retrieval, walking with RW, ambulation in hallway',
    typicalAssistLevel: 'cga',
    typicalAssistPurpose: 'safety',
    typicalCueQuantity: 'min',
    typicalCueType: 'verbal',
    typicalCuePurpose: 'safe-walker-management',
    foregroundingHint: 'distance-or-fraction',
    p3Trigger: false,
    rendersAsActivityList: false
  },
  'bed-mobility-task': {
    id: 'bed-mobility-task',
    description: 'Rolling, supine-to-sit, bridging, scooting in bed',
    typicalAssistLevel: 'min',
    typicalAssistLocation: 'trunk',
    typicalAssistPurpose: 'motor-sequencing-through-maneuver',
    typicalCueQuantity: 'mod',
    typicalCueType: 'verbal',
    typicalCuePurpose: 'motor-sequencing',
    foregroundingHint: 'activity-as-event',
    p3Trigger: true,
    rendersAsActivityList: false
  },
  'sitting-balance-task': {
    id: 'sitting-balance-task',
    description: 'Sitting weight shifts, midline orientation, EOB tasks',
    typicalAssistLevel: 'cga',
    typicalAssistLocation: 'trunk',
    typicalAssistPurpose: 'midline-stability',
    typicalCueQuantity: 'min',
    typicalCueType: 'verbal',
    typicalCuePurpose: 'midline-orientation',
    foregroundingHint: 'count-or-fraction',
    p3Trigger: false,
    rendersAsActivityList: false
  },
  'ambulation-with-task': {
    id: 'ambulation-with-task',
    description: 'Distance ambulation paired with a functional task — mail retrieval, item retrieval outdoors, dual-task walking',
    typicalAssistLevel: 'cga',
    typicalAssistLocation: 'gait-belt',
    typicalAssistPurpose: 'safety-during-dual-task',
    typicalCueQuantity: 'min',
    typicalCueType: 'verbal',
    typicalCuePurpose: 'pacing-and-task-management',
    foregroundingHint: 'distance-led',
    p3Trigger: false,
    rendersAsActivityList: false
  },
  'bending-lifting-carrying': {
    id: 'bending-lifting-carrying',
    description: 'List-member activity that surfaces inside a P3 opener — bending/lifting/carrying tasks for IADL safety',
    typicalAssistLevel: 'cga',
    typicalAssistLocation: 'trunk',
    typicalAssistPurpose: 'body-mechanics-safety',
    typicalCueQuantity: 'min',
    typicalCueType: 'verbal',
    typicalCuePurpose: 'body-mechanics',
    foregroundingHint: 'activity-as-event',
    p3Trigger: true,
    rendersAsActivityList: true
  },
  'dynamic-functional-task': {
    id: 'dynamic-functional-task',
    description: 'Side-stepping for housekeeping, kitchen-counter reaching, dynamic IADL tasks',
    typicalAssistLevel: 'cga',
    typicalAssistLocation: 'trunk',
    typicalAssistPurpose: 'safety-during-dynamic-task',
    typicalCueQuantity: 'mod',
    typicalCueType: 'verbal',
    typicalCuePurpose: 'ble-foot-placement',
    foregroundingHint: 'count-or-position',
    p3Trigger: true,
    rendersAsActivityList: false
  },
  'floor-recovery-task': {
    id: 'floor-recovery-task',
    description: 'Floor-to-stand, fall recovery sequences, transitional phases through quadruped/half-kneel',
    typicalAssistLevel: 'mod',
    typicalAssistLocation: 'trunk-and-ue',
    typicalAssistPurpose: 'safety-through-transitional-phases',
    typicalCueQuantity: 'mod',
    typicalCueType: 'verbal',
    typicalCuePurpose: 'motor-sequencing',
    foregroundingHint: 'activity-as-event',
    p3Trigger: false,
    rendersAsActivityList: false
  }
};

// ══════════════════════════════════════════════════════════════
// LAYER 3 — ACTIVITIES
//
// Slice 5a foundation: three reference entries chosen to anchor
// against slice 1's verbatim tests. Activity order matches slice 1's
// test order (Fragment A / C / D) so cross-artifact debugging stays
// in the same activity sequence.
// ══════════════════════════════════════════════════════════════

const ACTIVITIES = {
  'wrist-roller-activity': {
    id: 'wrist-roller-activity',
    label: 'wrist roller activity',
    cpt: '97530',
    profile: 'bilateral-coordination-task',

    materialVerb: 'rolled onto',
    defaultPosition: { value: 'performed bilaterally', kind: 'tail-modifier' },
    defaultSubstrate: ['lightweight-rope', 'dowel-bar'],

    quantificationKind: 'distance',  // typical: "4 feet"

    gerundForm: 'rolling',  // slice 6 stack-connector gerund-shape rendering

    typicalGoalPhrasings: [
      'bilateral coordination and forearm/grip strength'  // corpus typo "forearm/ grip" corrected
    ],

    corpusEvidence: 'wrist-roller-1'
  },

  'untie-theraband-knots': {
    id: 'untie-theraband-knots',
    label: 'theraband knot untying',
    cpt: '97530',
    profile: 'fine-motor-task',

    subject: 'patient-as-agent',
    verb: 'untied',
    defaultSubstrate: ['theraband'],

    quantificationKind: 'fraction',  // typical: "9/9 knots"

    typicalGoalPhrasings: [
      'intrinsic hand muscles',
      'pinch/grip strength during functional task performance'
    ],
    typicalCuePurpose: 'pinch-strategies',

    corpusEvidence: 'theraband-knots-1'
  },

  'ring-toss': {
    id: 'ring-toss',
    label: 'Ring toss activity',
    cpt: '97530',
    profile: 'standing-balance-task',

    defaultPosition: { value: 'standing', kind: 'pre-modifier' },
    defaultSubstrate: ['large-lightweight-rings'],  // bundled class
    defaultQualifying: ['rw'],                       // RW qualifies difficulty

    quantificationKind: 'count',  // typical: "6 trials"

    gerundForm: 'completing',

    typicalGoalPhrasings: [
      'Bilateral shoulder Range of motion for enhanced dressing ability'
    ],
    typicalCuePurpose: 'timed-release',

    corpusEvidence: 'ring-toss-1'
  },

  // ── Slice 5b additions ────────────────────────────────────────
  // 11 entries covering the user's caseload. Where a defaultPosition
  // is given as a string ID, compose() resolves it via POSITION_PHRASES
  // and pairs it with kind = defaultPositionKind || 'tail-modifier'.
  // typicalGoalPhrasings is consumed by goal aggregation when this
  // activity participates as a list-member; the FIRST entry wins.

  'sit-stand-transfers': {
    id: 'sit-stand-transfers',
    label: 'Sit-to-stand transfers',
    cpt: '97530',
    profile: 'transitional-mobility',

    defaultPosition: 'from-wc',
    defaultPositionKind: 'tail-modifier',
    defaultQualifying: ['gait-belt'],

    quantificationKind: 'trials',

    typicalGoalPhrasings: [
      'promote safety and independence within living environment',
      'promote functional transfer skills'
    ],

    corpusEvidence: 'sts-1'
  },

  'stand-pivot-transfers': {
    id: 'stand-pivot-transfers',
    label: 'Stand-pivot transfers',
    cpt: '97530',
    profile: 'transitional-mobility',

    defaultPosition: 'wc-to-bed',
    defaultPositionKind: 'tail-modifier',
    defaultQualifying: ['gait-belt'],

    quantificationKind: 'trials',

    typicalGoalPhrasings: [
      'promote safe transfers between functional surfaces',
      'promote functional transfer skills'
    ],

    corpusEvidence: null
  },

  'bed-mobility': {
    id: 'bed-mobility',
    label: 'Bed mobility',
    cpt: '97530',
    profile: 'bed-mobility-task',

    defaultPosition: 'supine',
    defaultPositionKind: 'pre-modifier',
    defaultQualifying: ['draw-sheet'],

    quantificationKind: 'trials',

    typicalGoalPhrasings: [
      'promote bed mobility for ADL prep',
      'promote independent repositioning for skin integrity'
    ],

    corpusEvidence: null
  },

  'dynamic-standing-balance': {
    id: 'dynamic-standing-balance',
    label: 'Dynamic standing balance',
    cpt: '97530',
    profile: 'standing-balance-task',

    defaultPosition: 'standing',
    defaultPositionKind: 'pre-modifier',
    defaultQualifying: ['rw'],

    quantificationKind: 'trials',

    gerundForm: 'completing',

    typicalGoalPhrasings: [
      'improve overall task performance during ADLs',
      'promote standing balance during dynamic tasks'
    ],

    corpusEvidence: 'adl-balance-1'
  },

  'dynamic-sitting-balance': {
    id: 'dynamic-sitting-balance',
    label: 'Dynamic sitting balance',
    cpt: '97530',
    profile: 'sitting-balance-task',

    defaultPosition: 'while-seated-eob',
    defaultPositionKind: 'tail-modifier',

    quantificationKind: 'trials',

    typicalGoalPhrasings: [
      'promote sitting balance for ADL performance',
      'promote midline orientation during functional tasks'
    ],

    corpusEvidence: 'number-tap-1'  // weak: corpus paragraph anchored on sequenced number tap, which exercises sitting balance
  },

  'item-retrieval-standing': {
    id: 'item-retrieval-standing',
    label: 'Item retrieval in standing',
    cpt: '97530',
    profile: 'functional-mobility',

    defaultPosition: 'standing',
    defaultPositionKind: 'pre-modifier',
    defaultQualifying: ['rw'],

    quantificationKind: 'trials',

    typicalGoalPhrasings: [
      'promote trunk control during EOB dressing tasks',
      'promote safe retrieval during IADLs'
    ],

    corpusEvidence: 'item-retrieval-1'
  },

  'ambulation-with-task': {
    id: 'ambulation-with-task',
    label: 'Ambulation with task',
    cpt: '97530',
    profile: 'ambulation-with-task',

    defaultPosition: 'on-uneven-surface',
    defaultPositionKind: 'tail-modifier',
    defaultQualifying: ['rw'],

    quantificationKind: 'distance',

    typicalGoalPhrasings: [
      'engage in home living tasks',
      'promote functional ambulation for IADL completion'
    ],

    corpusEvidence: 'ec-concepts-1'  // 250-foot retrieval lives in this paragraph
  },

  'bending-lifting-carrying': {
    id: 'bending-lifting-carrying',
    label: 'bending/lifting/carrying tasks',  // corpus form (lowercase, no spaces around slashes) — required by list-member opener byte-match
    cpt: '97530',
    profile: 'bending-lifting-carrying',

    // List-members do not render their own activity sentences.
    // Position / quantification fields are intentionally omitted —
    // they're irrelevant in list-member context. The composer
    // surfaces rendersAsActivityList: true on this activity so the
    // engine partitions it into the P3 opener's focus list.
    quantificationKind: null,

    typicalGoalPhrasings: [
      'increase functional skill performance',  // corpus form (infinitive); first entry feeds list-member goal aggregation
      'promote safe task performance for IADL'
    ],

    corpusEvidence: 'side-stepping-1'
  },

  'side-stepping': {
    id: 'side-stepping',
    label: 'side stepping',  // corpus form (lowercase)
    cpt: '97530',
    profile: 'dynamic-functional-task',

    defaultPosition: 'standing',
    defaultPositionKind: 'pre-modifier',
    defaultQualifying: ['rw'],

    quantificationKind: 'trials',

    typicalGoalPhrasings: [
      'increase functional skill performance',  // matches corpus when participating as list-member
      'promote safety and independence during housekeeping tasks'
    ],

    corpusEvidence: 'side-stepping-1'
  },

  'functional-reaching': {
    id: 'functional-reaching',
    label: 'Functional reaching across planes',
    cpt: '97530',
    profile: 'dynamic-functional-task',

    defaultPosition: 'while-seated-eob',
    defaultPositionKind: 'tail-modifier',

    quantificationKind: 'trials',

    gerundForm: 'reaching',

    typicalGoalPhrasings: [
      'increase the ability to reach BLE when donning LB clothing',
      'promote enhanced dressing ability'
    ],
    typicalCuePurpose: 'trunk-control',

    corpusEvidence: 'ring-toss-1'  // floor-level reaching is the second activity of this paragraph
  },

  'floor-to-stand-recovery': {
    id: 'floor-to-stand-recovery',
    label: 'Floor-to-stand / fall recovery',
    cpt: '97530',
    profile: 'floor-recovery-task',

    defaultPosition: 'quadruped',
    defaultPositionKind: 'pre-modifier',

    quantificationKind: 'trials',

    typicalGoalPhrasings: [
      'promote fall recovery for community discharge',
      'promote safe floor recovery for home safety'
    ],

    corpusEvidence: null
  },

  // ── Slice 6 additions ─────────────────────────────────────────
  // Two activities that appear in the corpus only as members of a
  // stack (chained inside wrist-roller-1 with progressed-to and
  // in-addition-to connectors). Both could compose standalone in
  // future paragraphs. Profile: bilateral-coordination-task,
  // matching wrist-roller-activity. Each carries gerundForm so
  // they can render in gerund shape inside a stack hint chain.

  'plastic-eggs': {
    id: 'plastic-eggs',
    label: 'plastic eggs cracking',
    cpt: '97530',
    profile: 'bilateral-coordination-task',

    defaultPosition: 'standing',
    defaultPositionKind: 'pre-modifier',
    defaultSubstrate: ['plastic-eggs-with-pegs'],

    quantificationKind: 'fraction',  // typical: "6/12"

    gerundForm: 'cracking',

    typicalGoalPhrasings: [
      'bilateral coordination and forearm/grip strength'
    ],

    corpusEvidence: 'wrist-roller-1'
  },

  'theraputty-rolling': {
    id: 'theraputty-rolling',
    label: 'theraputty rolling',
    cpt: '97530',
    profile: 'bilateral-coordination-task',

    defaultPosition: 'standing',
    defaultPositionKind: 'pre-modifier',
    defaultSubstrate: ['orange-theraputty', 'dowel-bar'],

    quantificationKind: null,  // not quantified in corpus

    gerundForm: 'rolling out',

    typicalGoalPhrasings: [
      'bilateral coordination and forearm/grip strength'
    ],

    corpusEvidence: 'wrist-roller-1'
  }
};

// ══════════════════════════════════════════════════════════════
// COMPOSER
//
// compose(activityId, overrides) -> engine params object
//
// Resolves an activity entry into the params shape that
// engine.generate() expects. Equipment refs are looked up in the
// EQUIPMENT vocabulary and rendered as { phrase, class } objects
// so the engine's _classifyEquipment can read the class field.
//
// Overrides are applied per-call: the caller supplies fields that
// vary per session (quantification value, opener, cues,
// observations, tolerance, closer). Activity-level fields
// (label, materialVerb, default position, default substrate) come
// from the activity entry; they can be overridden too if the
// caller passes them.
//
// Returns null if activityId is unknown. Composition errors (e.g.,
// unresolvable equipment refs) drop the unresolvable entries and
// log a warning to console; they do not throw, because the engine
// itself will produce a partial note from whatever composes
// successfully.
// ══════════════════════════════════════════════════════════════

function _resolveEquipmentRefs(refs) {
  if (!Array.isArray(refs)) return [];
  const out = [];
  for (const ref of refs) {
    if (typeof ref === 'string') {
      const entry = EQUIPMENT[ref];
      if (entry) {
        out.push({ phrase: entry.phrase, class: entry.class });
      } else if (typeof console !== 'undefined' && console.warn) {
        console.warn('[vocabularies.compose] unknown equipment ref:', ref);
      }
    } else if (ref && typeof ref === 'object' && ref.phrase) {
      // Already-resolved item — pass through.
      out.push(ref);
    }
  }
  return out;
}

/**
 * Resolve a position field on an activity entry into the engine's
 * expected { value, kind } object.
 *
 * Three input forms accepted:
 *   - object { value, kind }  — passed through unchanged.
 *   - string POSITION_PHRASES id — phrase looked up; kind taken
 *     from activity.defaultPositionKind, defaulting to 'tail-modifier'.
 *   - string raw phrase (no matching id) — used as `value`; kind
 *     taken from activity.defaultPositionKind, defaulting to
 *     'tail-modifier'.
 * Returns null when no resolvable position is present.
 */
function _resolvePosition(positionField, activityEntry) {
  if (!positionField) return null;
  if (typeof positionField === 'object' && positionField.value) {
    return positionField;
  }
  if (typeof positionField === 'string') {
    const entry = POSITION_PHRASES[positionField];
    const value = entry ? entry.phrase : positionField;
    const kind = (activityEntry && activityEntry.defaultPositionKind) || 'tail-modifier';
    return { value, kind };
  }
  return null;
}

function compose(activityId, overrides) {
  const activity = ACTIVITIES[activityId];
  if (!activity) return null;
  const ov = overrides || {};
  const profile = PROFILES[activity.profile] || null;

  const a = { label: activity.label };

  if (activity.subject)      a.subject = activity.subject;
  if (activity.verb)         a.verb = activity.verb;
  if (activity.materialVerb) a.materialVerb = activity.materialVerb;

  const resolvedPosition = _resolvePosition(activity.defaultPosition, activity);
  if (resolvedPosition) a.position = resolvedPosition;

  if (activity.defaultSubstrate || activity.defaultGraded || activity.defaultQualifying) {
    a.equipment = {};
    const sub = _resolveEquipmentRefs(activity.defaultSubstrate);
    const gra = _resolveEquipmentRefs(activity.defaultGraded);
    const qua = _resolveEquipmentRefs(activity.defaultQualifying);
    if (sub.length) a.equipment.substrate = sub;
    if (gra.length) a.equipment.graded = gra;
    if (qua.length) a.equipment.qualifying = qua;
  }

  // Surface engine-relevant profile flags onto the activity object
  // so the engine can partition without consulting the vocabulary.
  //
  // rendersAsActivityList precedence: per-call override wins over
  // profile default. The choice between standalone-sentence and
  // list-member-in-P3-opener isn't really a profile property — it's
  // a per-note routing decision the caller (UI, clinician, test)
  // makes based on what's stacked alongside this activity. Profile
  // sets the default; ov.rendersAsActivityList overrides it
  // explicitly. Pass `false` to opt out, `true` to opt in; omit to
  // inherit the profile default.
  const profileSays  = !!(profile && profile.rendersAsActivityList);
  const overrideSays = ov.rendersAsActivityList;
  const finalRenders = (overrideSays === undefined) ? profileSays : !!overrideSays;
  if (finalRenders) {
    a.rendersAsActivityList = true;
  }
  // First typicalGoalPhrasings entry feeds list-member goal aggregation
  // and is also used by composers wiring P2 openers from defaults.
  if (Array.isArray(activity.typicalGoalPhrasings) && activity.typicalGoalPhrasings.length > 0) {
    a.goalPhrasing = activity.typicalGoalPhrasings[0];
  }
  // gerundForm surfaces onto the activity so the engine's stack-
  // connector path (slice 6) can render the activity in gerund shape
  // when an in-addition-to or progressed-to hint targets it.
  if (typeof activity.gerundForm === 'string') {
    a.gerundForm = activity.gerundForm;
  }
  // id surfaces too — useful for warn messages on missing-gerundForm
  // fallback so the operator knows which activity caused the warn.
  if (typeof activity.id === 'string') {
    a.id = activity.id;
  }

  // Per-call overrides on the activity entry
  if (ov.quantification) a.quantification = ov.quantification;
  if (ov.position) {
    const ovPos = _resolvePosition(ov.position, activity);
    if (ovPos) a.position = ovPos;
  }
  if (ov.purpose)        a.purpose = ov.purpose;
  if (ov.subject)        a.subject = ov.subject;
  if (ov.verb)           a.verb = ov.verb;
  if (ov.materialVerb)   a.materialVerb = ov.materialVerb;
  if (ov.equipment)      a.equipment = ov.equipment;  // full override
  if (ov.label)          a.label = ov.label;          // label override

  // Outer params
  const params = { activities: [a] };
  if (ov.opener)       params.opener = ov.opener;
  if (ov.observations) params.observations = ov.observations;
  if (ov.tolerance)    params.tolerance = ov.tolerance;
  if (ov.closer)       params.closer = ov.closer;
  // ov.cues handled by the slice-8 block below (auto-surface + opt-out).

  // P-Assist (slice 7). Per-call override convention matches
  // rendersAsActivityList: explicit ov.assists (any value, including
  // null/[]) means caller has spoken — pass through truthy, suppress
  // otherwise. ov.assists === undefined means inherit profile default.
  //
  // Profile auto-surface skips non-skilled levels ('independent' /
  // 'modified-i'): a profile listing those as typical means "no
  // assist phrase by default" — surfacing them would only produce a
  // no-op array the engine has to filter back out.
  if (ov.assists !== undefined) {
    if (ov.assists) params.assists = ov.assists;
  } else if (profile && profile.typicalAssistLevel
             && profile.typicalAssistLevel !== 'independent'
             && profile.typicalAssistLevel !== 'modified-i') {
    const level    = ASSIST_LEVELS[profile.typicalAssistLevel] || null;
    const location = profile.typicalAssistLocation
      ? (ASSIST_LOCATIONS[profile.typicalAssistLocation] || null) : null;
    const purpose  = profile.typicalAssistPurpose
      ? (ASSIST_PURPOSES[profile.typicalAssistPurpose] || null) : null;
    if (level) {
      const entry = { level: level };
      if (location) entry.location = location;
      if (purpose)  entry.purpose  = purpose.phrase;
      params.assists = [entry];
    }
  }

  // P-Cue (slice 8). Same opt-out convention as assists: explicit
  // ov.cues (any value) means caller has spoken; undefined inherits
  // profile default. Profile auto-surface emits flat shape only —
  // chained cues (`chain` field) are caller-passed because shape is
  // session-specific clinical reasoning, not a profile constant
  // (the corpus count showed chained-vs-flat is caller-determined
  // within profile bounds, same as assist purpose).
  //
  // Purpose passes the resolved phrase as a bare string (not the id),
  // matching the slice-7 assist convention. The engine's id-lookup
  // branch (data.cuePurposes) is unsynchronized with CUE_PURPOSES
  // here — see TODO in engine._resolveCuePurpose.
  if (ov.cues !== undefined) {
    if (ov.cues) params.cues = ov.cues;
  } else if (profile && profile.typicalCueQuantity && profile.typicalCueType) {
    const quantity = CUE_QUANTITIES[profile.typicalCueQuantity] || null;
    const type     = CUE_TYPES[profile.typicalCueType]         || null;
    const purpose  = profile.typicalCuePurpose
      ? (CUE_PURPOSES[profile.typicalCuePurpose] || null) : null;
    if (quantity && type) {
      const entry = { quantity: quantity.phrase, type: type.phrase };
      if (purpose) entry.purpose = purpose.phrase;
      params.cues = [entry];
    }
  }

  return params;
}

/**
 * Compose a multi-activity input. Accepts an array of either
 * { id, overrides } or just `id` strings, plus shared outer
 * overrides applied at the params level.
 *
 * Returns a single params object with activities[] populated from
 * each composition. Used by the slice 5b mixed-case test and any
 * caller that hands the engine more than one activity at a time.
 */
function composeMany(items, sharedOverrides) {
  const ov = sharedOverrides || {};
  const activities = [];
  for (const item of items) {
    const id = typeof item === 'string' ? item : item.id;
    const itemOv = typeof item === 'object' ? (item.overrides || {}) : {};
    const single = compose(id, itemOv);
    if (single && single.activities && single.activities[0]) {
      activities.push(single.activities[0]);
    }
  }
  const params = { activities };
  if (ov.opener)       params.opener = ov.opener;
  if (ov.cues)         params.cues = ov.cues;
  if (ov.observations) params.observations = ov.observations;
  if (ov.tolerance)    params.tolerance = ov.tolerance;
  if (ov.closer)       params.closer = ov.closer;
  if (ov.assists)      params.assists = ov.assists;
  return params;
}

// ══════════════════════════════════════════════════════════════
// EXPORTS
// ══════════════════════════════════════════════════════════════

const Vocabularies = {
  ASSIST_LEVELS,
  ASSIST_LOCATIONS,
  ASSIST_PURPOSES,
  CUE_TYPES,
  CUE_QUANTITIES,
  CUE_PURPOSES,
  POSITION_PHRASES,
  EQUIPMENT,
  PROFILES,
  ACTIVITIES,
  compose,
  composeMany
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Vocabularies;
}
if (typeof window !== 'undefined') {
  window.DockyVocabularies = Vocabularies;
}
