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
  'trunk':                { id: 'trunk',                phrase: 'trunk' },
  'posterior-trunk':      { id: 'posterior-trunk',      phrase: 'posterior trunk' },
  'bue':                  { id: 'bue',                  phrase: 'BUE' },
  'ble':                  { id: 'ble',                  phrase: 'BLE' },
  'r-ue':                 { id: 'r-ue',                 phrase: 'R UE' },
  'l-ue':                 { id: 'l-ue',                 phrase: 'L UE' },
  'greater-trochanters':  { id: 'greater-trochanters',  phrase: 'bilateral greater trochanters' }
};

const ASSIST_PURPOSES = {
  'safety':              { id: 'safety',              phrase: 'for safety' },
  'support-and-safety':  { id: 'support-and-safety',  phrase: 'for support and safety' },
  'stability':           { id: 'stability',           phrase: 'for stability' },
  'balance-support':     { id: 'balance-support',     phrase: 'for balance support' },
  'weight-shift':        { id: 'weight-shift',        phrase: 'to facilitate weight shift' },
  'inhibit-retropulsion':{ id: 'inhibit-retropulsion',phrase: 'to inhibit retropulsion' }
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
  'body-and-safety-awareness':{ id: 'body-and-safety-awareness',phrase: 'increased body and safety awareness' }
};

const POSITION_PHRASES = {
  'from-wc':            { id: 'from-wc',            phrase: 'from w/c' },
  'eob':                { id: 'eob',                phrase: 'EOB' },
  'while-seated-eob':   { id: 'while-seated-eob',   phrase: 'while seated EOB' },
  'seated-in-wc':       { id: 'seated-in-wc',       phrase: 'seated in w/c' },
  'standing':           { id: 'standing',           phrase: 'standing' },
  'while-standing':     { id: 'while-standing',     phrase: 'while standing' },
  'on-uneven-surface':  { id: 'on-uneven-surface',  phrase: 'on uneven walkway surfaces' },
  'performed-bilaterally':{id:'performed-bilaterally',phrase:'performed bilaterally' }
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
  'gait-belt':              { id: 'gait-belt',              phrase: 'gait belt',                   class: 'qualifying-difficulty' },
  'shower-bench':           { id: 'shower-bench',           phrase: 'shower bench',                class: 'qualifying-difficulty' },
  'theraband':              { id: 'theraband',              phrase: 'theraband',                   class: 'substrate' },
  'lightweight-rope':       { id: 'lightweight-rope',       phrase: 'a lightweight rope',          class: 'substrate' },
  'dowel-bar':              { id: 'dowel-bar',              phrase: 'a dowel bar',                 class: 'substrate' },
  'orange-theraputty':      { id: 'orange-theraputty',      phrase: 'orange theraputty',           class: 'substrate-graded', grade: 'orange' },
  'plastic-eggs-with-pegs': { id: 'plastic-eggs-with-pegs', phrase: 'plastic eggs with pegs inside',class:'substrate' },
  'large-lightweight-rings':{ id: 'large-lightweight-rings',phrase: '5 large lightweight rings',   class: 'substrate-graded-bundled' },
  'medium-weight-objects':  { id: 'medium-weight-objects',  phrase: 'medium-weight objects',       class: 'substrate-graded', grade: 'medium' }
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
// ══════════════════════════════════════════════════════════════

const PROFILES = {
  'transitional-mobility': {
    id: 'transitional-mobility',
    description: 'Sit-to-stand, stand-pivot, lateral scooting, transfers',
    typicalAssistLevel: 'min',          // varies; 'mod' or 'max' for higher-acuity
    typicalAssistLocation: 'gait-belt',
    typicalCueQuantity: 'mod',
    typicalCueType: 'verbal',
    typicalCuePurpose: 'safe-sequence-ue',
    foregroundingHint: 'activity-as-event',
    p3Trigger: false
  },
  'fine-motor-task': {
    id: 'fine-motor-task',
    description: 'Theraband knots, peg-and-hole, hand strengthening',
    typicalAssistLevel: 'independent',
    typicalCueQuantity: 'min',
    typicalCueType: 'verbal',
    typicalCuePurpose: 'pinch-strategies',
    foregroundingHint: 'fraction',
    p3Trigger: false
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
    p3Trigger: true   // can read low-skill in isolation
  },
  'bilateral-coordination-task': {
    id: 'bilateral-coordination-task',
    description: 'Wrist roller, plastic eggs, theraputty rolling',
    typicalAssistLevel: 'independent',
    typicalCueQuantity: 'min',
    typicalCueType: 'verbal',
    typicalCuePurpose: 'pacing',
    foregroundingHint: 'distance-or-substrate',
    p3Trigger: false
  },
  'functional-mobility': {
    id: 'functional-mobility',
    description: 'Item retrieval, walking with RW, ambulation in hallway',
    typicalAssistLevel: 'cga',
    typicalCueQuantity: 'min',
    typicalCueType: 'verbal',
    typicalCuePurpose: 'safe-walker-management',
    foregroundingHint: 'distance-or-fraction',
    p3Trigger: false
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

    typicalGoalPhrasings: [
      'Bilateral shoulder Range of motion for enhanced dressing ability'
    ],
    typicalCuePurpose: 'timed-release',

    corpusEvidence: 'ring-toss-1'
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

function compose(activityId, overrides) {
  const activity = ACTIVITIES[activityId];
  if (!activity) return null;
  const ov = overrides || {};

  const a = { label: activity.label };

  if (activity.subject)      a.subject = activity.subject;
  if (activity.verb)         a.verb = activity.verb;
  if (activity.materialVerb) a.materialVerb = activity.materialVerb;
  if (activity.defaultPosition) a.position = activity.defaultPosition;

  if (activity.defaultSubstrate || activity.defaultGraded || activity.defaultQualifying) {
    a.equipment = {};
    const sub = _resolveEquipmentRefs(activity.defaultSubstrate);
    const gra = _resolveEquipmentRefs(activity.defaultGraded);
    const qua = _resolveEquipmentRefs(activity.defaultQualifying);
    if (sub.length) a.equipment.substrate = sub;
    if (gra.length) a.equipment.graded = gra;
    if (qua.length) a.equipment.qualifying = qua;
  }

  // Per-call overrides on the activity entry
  if (ov.quantification) a.quantification = ov.quantification;
  if (ov.position)       a.position = ov.position;
  if (ov.purpose)        a.purpose = ov.purpose;
  if (ov.subject)        a.subject = ov.subject;
  if (ov.verb)           a.verb = ov.verb;
  if (ov.materialVerb)   a.materialVerb = ov.materialVerb;
  if (ov.equipment)      a.equipment = ov.equipment;  // full override

  // Outer params
  const params = { activities: [a] };
  if (ov.opener)       params.opener = ov.opener;
  if (ov.cues)         params.cues = ov.cues;
  if (ov.observations) params.observations = ov.observations;
  if (ov.tolerance)    params.tolerance = ov.tolerance;
  if (ov.closer)       params.closer = ov.closer;

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
  compose
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Vocabularies;
}
if (typeof window !== 'undefined') {
  window.DockyVocabularies = Vocabularies;
}
