/**
 * DOCKY Assistant
 *
 * Activity-driven documentation suggester.
 * Select an activity, see relevant options, build your note.
 */

const DockyAssistant = {
  // Dependencies (set via init)
  phrases: null,
  utils: null,

  /**
   * Initialize with dependencies
   */
  init: function(phrases, utils) {
    this.phrases = phrases;
    this.utils = utils;
  },

  // ============================================
  // ACTIVITIES & SUGGESTIONS
  // ============================================

  activities: [
    // Transfers
    { value: 'sit-to-stand transfers', label: 'Sit-to-stand', group: 'Transfers' },
    { value: 'stand-to-sit transfers', label: 'Stand-to-sit', group: 'Transfers' },
    { value: 'stand-pivot transfers', label: 'Stand-pivot', group: 'Transfers' },
    { value: 'sliding board transfers', label: 'Sliding board', group: 'Transfers' },
    { value: 'squat-pivot transfers', label: 'Squat-pivot', group: 'Transfers' },
    { value: 'toilet transfers', label: 'Toilet transfer', group: 'Transfers' },
    { value: 'tub/shower transfers', label: 'Tub/shower transfer', group: 'Transfers' },
    { value: 'bed-to-wheelchair transfers', label: 'Bed ↔ W/C', group: 'Transfers' },
    { value: 'car transfers', label: 'Car transfer', group: 'Transfers' },
    { value: 'floor-to-stand transfers', label: 'Floor to stand', group: 'Transfers' },
    // Bed Mobility
    { value: 'supine-to-sit', label: 'Supine-to-sit', group: 'Bed Mobility' },
    { value: 'sit-to-supine', label: 'Sit-to-supine', group: 'Bed Mobility' },
    { value: 'rolling', label: 'Rolling', group: 'Bed Mobility' },
    { value: 'scooting in bed', label: 'Scooting', group: 'Bed Mobility' },
    { value: 'bridging', label: 'Bridging', group: 'Bed Mobility' },
    { value: 'edge of bed positioning', label: 'EOB positioning', group: 'Bed Mobility' },
    // Dressing
    { value: 'upper body dressing', label: 'UB dressing', group: 'Dressing' },
    { value: 'lower body dressing', label: 'LB dressing', group: 'Dressing' },
    { value: 'donning/doffing footwear', label: 'Footwear', group: 'Dressing' },
    { value: 'fastener management', label: 'Fasteners', group: 'Dressing' },
    { value: 'compression stocking management', label: 'Compression stockings', group: 'Dressing' },
    { value: 'brace/splint donning', label: 'Brace/splint', group: 'Dressing' },
    // Bathing/Hygiene
    { value: 'shower routine', label: 'Showering', group: 'Bathing/Hygiene' },
    { value: 'bathing routine', label: 'Bathing', group: 'Bathing/Hygiene' },
    { value: 'upper body bathing', label: 'UB bathing', group: 'Bathing/Hygiene' },
    { value: 'lower body bathing', label: 'LB bathing', group: 'Bathing/Hygiene' },
    { value: 'hair washing', label: 'Hair washing', group: 'Bathing/Hygiene' },
    // Grooming
    { value: 'grooming at sink', label: 'Grooming', group: 'Grooming' },
    { value: 'oral hygiene', label: 'Oral hygiene', group: 'Grooming' },
    { value: 'hair care', label: 'Hair care', group: 'Grooming' },
    { value: 'shaving', label: 'Shaving', group: 'Grooming' },
    { value: 'nail care', label: 'Nail care', group: 'Grooming' },
    { value: 'makeup application', label: 'Makeup', group: 'Grooming' },
    // Toileting
    { value: 'toileting routine', label: 'Toileting', group: 'Toileting' },
    { value: 'clothing management toileting', label: 'Clothing mgmt', group: 'Toileting' },
    { value: 'hygiene after toileting', label: 'Hygiene care', group: 'Toileting' },
    // Feeding
    { value: 'self-feeding', label: 'Self-feeding', group: 'Feeding' },
    { value: 'utensil use', label: 'Utensil use', group: 'Feeding' },
    { value: 'cup/glass management', label: 'Cup management', group: 'Feeding' },
    { value: 'food cutting', label: 'Food cutting', group: 'Feeding' },
    { value: 'meal setup', label: 'Meal setup', group: 'Feeding' },
    // Balance
    { value: 'sitting balance activities', label: 'Sitting balance', group: 'Balance' },
    { value: 'static sitting balance', label: 'Static sitting', group: 'Balance' },
    { value: 'dynamic sitting balance', label: 'Dynamic sitting', group: 'Balance' },
    { value: 'standing balance activities', label: 'Standing balance', group: 'Balance' },
    { value: 'static standing balance', label: 'Static standing', group: 'Balance' },
    { value: 'dynamic balance training', label: 'Dynamic balance', group: 'Balance' },
    { value: 'reactive balance training', label: 'Reactive balance', group: 'Balance' },
    { value: 'weight shifting', label: 'Weight shifting', group: 'Balance' },
    // Mobility
    { value: 'functional ambulation', label: 'Ambulation', group: 'Mobility' },
    { value: 'stair navigation', label: 'Stairs', group: 'Mobility' },
    { value: 'curb navigation', label: 'Curbs', group: 'Mobility' },
    { value: 'wheelchair mobility', label: 'W/C mobility', group: 'Mobility' },
    { value: 'walker/RW training', label: 'Walker training', group: 'Mobility' },
    { value: 'functional reaching', label: 'Functional reaching', group: 'Mobility' },
    { value: 'floor retrieval', label: 'Floor retrieval', group: 'Mobility' },
    // Exercise/Therapeutic
    { value: 'UE strengthening', label: 'UE strengthening', group: 'Exercise' },
    { value: 'LE strengthening', label: 'LE strengthening', group: 'Exercise' },
    { value: 'core strengthening', label: 'Core strengthening', group: 'Exercise' },
    { value: 'grip strengthening', label: 'Grip strengthening', group: 'Exercise' },
    { value: 'AROM exercises', label: 'AROM', group: 'Exercise' },
    { value: 'PROM exercises', label: 'PROM', group: 'Exercise' },
    { value: 'AROM/PROM exercises', label: 'ROM exercises', group: 'Exercise' },
    { value: 'stretching exercises', label: 'Stretching', group: 'Exercise' },
    { value: 'endurance training', label: 'Endurance', group: 'Exercise' },
    // Fine Motor
    { value: 'fine motor coordination', label: 'Fine motor', group: 'Fine Motor' },
    { value: 'pinch/grasp activities', label: 'Pinch/grasp', group: 'Fine Motor' },
    { value: 'in-hand manipulation', label: 'In-hand manipulation', group: 'Fine Motor' },
    { value: 'bilateral coordination', label: 'Bilateral coordination', group: 'Fine Motor' },
    { value: 'hand-eye coordination', label: 'Hand-eye coordination', group: 'Fine Motor' },
    { value: 'writing activities', label: 'Writing', group: 'Fine Motor' },
    // IADLs
    { value: 'meal preparation', label: 'Meal prep', group: 'IADLs' },
    { value: 'light housekeeping', label: 'Housekeeping', group: 'IADLs' },
    { value: 'laundry management', label: 'Laundry', group: 'IADLs' },
    { value: 'medication management', label: 'Med management', group: 'IADLs' },
    { value: 'phone use', label: 'Phone use', group: 'IADLs' },
    { value: 'money management', label: 'Money management', group: 'IADLs' },
    { value: 'shopping activities', label: 'Shopping', group: 'IADLs' },
    // Cognitive
    { value: 'sequencing training', label: 'Sequencing', group: 'Cognitive' },
    { value: 'safety awareness training', label: 'Safety awareness', group: 'Cognitive' },
    { value: 'memory strategies training', label: 'Memory strategies', group: 'Cognitive' },
    { value: 'attention training', label: 'Attention training', group: 'Cognitive' },
    { value: 'problem solving training', label: 'Problem solving', group: 'Cognitive' },
    { value: 'orientation training', label: 'Orientation', group: 'Cognitive' }
  ],

  // Activity-specific suggestions
  activitySuggestions: {
    // Transfers
    'sit-to-stand transfers': {
      assist: ['CGA', 'MinA at trunk', 'ModA at trunk', 'MinA bilateral', 'Supervision'],
      goal: ['Improve transfer safety', 'Increase transfer independence', 'Decrease fall risk'],
      deficit: ['Decreased LE strength', 'Impaired balance', 'Decreased activity tolerance'],
      cues: ['Weight shift', 'Nose over toes', 'Push through legs']
    },
    'stand-pivot transfers': {
      assist: ['CGA', 'MinA at trunk', 'ModA bilateral', 'Supervision'],
      goal: ['Improve transfer safety', 'Increase transfer independence'],
      deficit: ['Impaired balance', 'Decreased LE strength', 'Decreased trunk control'],
      cues: ['Weight shift', 'Hand placement', 'Pivot feet']
    },
    'toilet transfers': {
      assist: ['CGA', 'MinA at trunk', 'Supervision', 'ModA bilateral'],
      goal: ['Increase toileting independence', 'Improve transfer safety'],
      deficit: ['Impaired balance', 'Decreased LE strength'],
      cues: ['Grab bar use', 'Weight shift', 'Clothing management']
    },
    'tub/shower transfers': {
      assist: ['CGA', 'MinA', 'ModA', 'Supervision'],
      goal: ['Improve safety with bathing', 'Increase bathing independence'],
      deficit: ['Impaired balance', 'Decreased LE strength', 'Fear of falling'],
      cues: ['Grab bar use', 'Foot placement', 'Sequence']
    },
    'bed-to-wheelchair transfers': {
      assist: ['MinA at trunk', 'ModA at trunk', 'CGA', 'Sliding board'],
      goal: ['Increase transfer independence', 'Improve transfer safety'],
      deficit: ['Decreased LE strength', 'Impaired balance', 'Decreased trunk control'],
      cues: ['Wheelchair positioning', 'Brake locks', 'Scoot forward']
    },
    'car transfers': {
      assist: ['CGA', 'MinA', 'Supervision', 'ModA'],
      goal: ['Increase community mobility', 'Improve transfer safety'],
      deficit: ['Decreased LE strength', 'Limited hip ROM', 'Impaired balance'],
      cues: ['Seat height', 'Hand placement', 'Leg management']
    },

    // Bed Mobility
    'supine-to-sit': {
      assist: ['MinA', 'ModA', 'CGA', 'Supervision'],
      goal: ['Improve bed mobility', 'Increase independence'],
      deficit: ['Decreased core strength', 'Decreased UE strength', 'Impaired trunk control'],
      cues: ['Log roll first', 'Push through arms', 'Sequence']
    },
    'rolling': {
      assist: ['MinA', 'ModA', 'CGA', 'Supervision'],
      goal: ['Improve bed mobility', 'Increase bed positioning independence'],
      deficit: ['Decreased trunk control', 'Decreased core strength'],
      cues: ['Head leads', 'Arm swing', 'Knee drive']
    },
    'scooting in bed': {
      assist: ['MinA', 'ModA', 'Supervision'],
      goal: ['Improve bed mobility', 'Improve bed positioning'],
      deficit: ['Decreased LE strength', 'Decreased core strength'],
      cues: ['Bridge', 'Weight shift', 'Small movements']
    },

    // ADLs
    'upper body dressing': {
      assist: ['MinA', 'Supervision', 'ModA', 'Setup only'],
      goal: ['Increase dressing independence', 'Improve UE function'],
      deficit: ['Limited shoulder ROM', 'Decreased UE strength', 'Impaired coordination'],
      cues: ['Affected arm first', 'Head through', 'Sequence']
    },
    'lower body dressing': {
      assist: ['MinA', 'ModA', 'Supervision', 'Setup only'],
      goal: ['Increase dressing independence', 'Improve LE management'],
      deficit: ['Limited hip ROM', 'Decreased balance', 'Decreased LE strength'],
      cues: ['Seated position', 'Leg lifter use', 'Reacher use']
    },
    'donning/doffing footwear': {
      assist: ['MinA', 'Supervision', 'Setup only'],
      goal: ['Increase dressing independence'],
      deficit: ['Limited hip ROM', 'Decreased balance', 'Impaired fine motor'],
      cues: ['Long-handled shoe horn', 'Seated position', 'Elastic laces']
    },
    'shower routine': {
      assist: ['CGA', 'MinA', 'Supervision', 'ModA'],
      goal: ['Increase bathing independence', 'Improve safety with bathing'],
      deficit: ['Decreased activity tolerance', 'Impaired balance', 'Decreased UE ROM'],
      cues: ['Shower chair use', 'Long-handled sponge', 'Energy conservation']
    },
    'grooming at sink': {
      assist: ['Supervision', 'MinA', 'Setup only'],
      goal: ['Increase grooming independence', 'Improve standing tolerance'],
      deficit: ['Decreased standing tolerance', 'Impaired balance', 'Decreased UE function'],
      cues: ['Counter support', 'Seated option', 'Item organization']
    },
    'toileting routine': {
      assist: ['CGA', 'MinA', 'Supervision'],
      goal: ['Increase toileting independence', 'Improve safety'],
      deficit: ['Impaired balance', 'Decreased LE strength', 'Impaired sequencing'],
      cues: ['Grab bar use', 'Clothing management', 'Hygiene sequence']
    },
    'self-feeding': {
      assist: ['Supervision', 'MinA', 'Setup only'],
      goal: ['Increase feeding independence', 'Improve UE function'],
      deficit: ['Decreased UE strength', 'Impaired coordination', 'Decreased grip strength'],
      cues: ['Adaptive utensils', 'Plate guard', 'Arm positioning']
    },

    // Balance
    'sitting balance activities': {
      assist: ['CGA', 'Supervision', 'MinA'],
      goal: ['Improve sitting balance', 'Improve trunk control'],
      deficit: ['Decreased trunk control', 'Impaired sitting balance', 'Decreased core strength'],
      cues: ['Midline', 'Weight shift', 'Reach activities']
    },
    'standing balance activities': {
      assist: ['CGA', 'MinA', 'Supervision'],
      goal: ['Improve standing balance', 'Decrease fall risk'],
      deficit: ['Impaired standing balance', 'Decreased LE strength', 'Decreased ankle strategy'],
      cues: ['Feet position', 'Visual focus', 'Weight shift']
    },
    'dynamic balance training': {
      assist: ['CGA', 'MinA', 'Supervision'],
      goal: ['Improve dynamic balance', 'Decrease fall risk'],
      deficit: ['Impaired dynamic balance', 'Decreased reactive balance'],
      cues: ['Anticipatory adjustments', 'Multi-directional reach', 'Gait variations']
    },

    // Mobility
    'functional ambulation': {
      assist: ['CGA', 'Supervision', 'MinA', 'Contact guard with device'],
      goal: ['Improve functional mobility', 'Increase ambulation distance'],
      deficit: ['Decreased activity tolerance', 'Impaired balance', 'Decreased LE strength'],
      cues: ['Gait pattern', 'Device use', 'Heel strike']
    },
    'stair navigation': {
      assist: ['CGA', 'MinA', 'Supervision with rail'],
      goal: ['Improve stair safety', 'Increase stair independence'],
      deficit: ['Decreased LE strength', 'Impaired balance', 'Decreased activity tolerance'],
      cues: ['Up with strong', 'Down with weak', 'Rail use']
    },

    // Exercise
    'UE strengthening': {
      assist: ['Supervision', 'Setup only', 'Verbal cues'],
      goal: ['Improve UE strength', 'Improve UE function'],
      deficit: ['Decreased UE strength', 'Decreased grip strength', 'Limited UE ROM'],
      cues: ['Form', 'Breathing', 'Rep count']
    },
    'core strengthening': {
      assist: ['Supervision', 'MinA for positioning'],
      goal: ['Improve core strength', 'Improve trunk control'],
      deficit: ['Decreased core strength', 'Decreased trunk control'],
      cues: ['Engage core', 'Neutral spine', 'Breathing']
    },
    'AROM/PROM exercises': {
      assist: ['PROM', 'AAROM', 'AROM supervision'],
      goal: ['Increase ROM', 'Maintain joint mobility'],
      deficit: ['Limited ROM', 'Joint stiffness', 'Pain with movement'],
      cues: ['Pain-free range', 'Slow controlled', 'End range hold']
    },
    'fine motor coordination': {
      assist: ['Supervision', 'Setup only'],
      goal: ['Improve fine motor skills', 'Improve hand function'],
      deficit: ['Impaired fine motor coordination', 'Decreased grip strength', 'Tremor'],
      cues: ['Grasp patterns', 'Precision', 'Speed vs accuracy']
    },

    // IADLs
    'meal preparation': {
      assist: ['Supervision', 'MinA', 'Setup only', 'CGA for standing'],
      goal: ['Increase IADL independence', 'Improve safety in kitchen', 'Improve standing tolerance', 'Improve energy conservation'],
      deficit: ['Decreased standing tolerance', 'Impaired sequencing', 'Decreased safety awareness', 'Decreased problem solving', 'Decreased activity tolerance'],
      cues: ['Energy conservation', 'Workstation setup', 'Safety awareness', 'Pacing', 'Task organization']
    },
    'light housekeeping': {
      assist: ['Supervision', 'MinA', 'Setup only'],
      goal: ['Increase IADL independence', 'Improve activity tolerance', 'Improve energy conservation', 'Improve functional mobility'],
      deficit: ['Decreased activity tolerance', 'Impaired balance', 'Decreased endurance', 'Decreased standing tolerance', 'Limited functional reach'],
      cues: ['Energy conservation', 'Body mechanics', 'Pacing', 'Work simplification', 'Rest breaks']
    },
    'laundry management': {
      assist: ['Supervision', 'MinA', 'Setup only'],
      goal: ['Increase IADL independence', 'Improve standing tolerance', 'Improve functional mobility'],
      deficit: ['Decreased standing tolerance', 'Decreased activity tolerance', 'Limited functional reach', 'Impaired balance'],
      cues: ['Energy conservation', 'Body mechanics', 'Pacing', 'Safety at machines']
    },
    'medication management': {
      assist: ['Supervision', 'Setup only', 'Verbal cues', 'Visual cues'],
      goal: ['Improve medication safety', 'Increase independence', 'Improve memory strategies', 'Improve sequencing'],
      deficit: ['Impaired memory', 'Decreased safety awareness', 'Impaired sequencing', 'Decreased attention', 'Impaired fine motor'],
      cues: ['Pill organizer', 'Schedule review', 'Double check', 'External memory aids', 'Written checklist']
    },
    'phone use': {
      assist: ['Supervision', 'Setup only', 'Verbal cues'],
      goal: ['Improve communication independence', 'Improve safety awareness', 'Improve fine motor'],
      deficit: ['Decreased fine motor', 'Impaired vision', 'Impaired hearing', 'Decreased problem solving', 'Impaired memory'],
      cues: ['Large buttons', 'Speed dial setup', 'Emergency numbers', 'Written instructions']
    },
    'money management': {
      assist: ['Supervision', 'Setup only', 'Verbal cues'],
      goal: ['Improve financial independence', 'Improve sequencing', 'Improve problem solving'],
      deficit: ['Decreased problem solving', 'Impaired calculation', 'Decreased attention', 'Impaired memory', 'Decreased fine motor'],
      cues: ['Calculator use', 'Written tracking', 'Organization strategies', 'Safety awareness']
    },
    // Cognitive Activities
    'sequencing training': {
      assist: ['Verbal cues', 'Visual cues', 'Demonstration'],
      goal: ['Improve task sequencing', 'Improve safety with ADLs', 'Improve independence'],
      deficit: ['Impaired sequencing', 'Decreased safety awareness', 'Impaired motor planning', 'Decreased attention'],
      cues: ['Step-by-step instructions', 'Visual schedules', 'Checklists', 'Verbal rehearsal']
    },
    'safety awareness training': {
      assist: ['Supervision', 'Verbal cues', 'Environmental setup'],
      goal: ['Improve safety awareness', 'Decrease fall risk', 'Improve judgment'],
      deficit: ['Decreased safety awareness', 'Impaired judgment', 'Decreased impulse control', 'Impaired problem solving'],
      cues: ['Hazard identification', 'Stop and think', 'Environmental scanning', 'Consequences review']
    },
    'memory strategies training': {
      assist: ['Verbal cues', 'Visual cues', 'External aids'],
      goal: ['Improve memory for daily tasks', 'Improve use of compensatory strategies', 'Improve independence'],
      deficit: ['Impaired short-term memory', 'Impaired long-term memory', 'Decreased attention', 'Impaired sequencing'],
      cues: ['External memory aids', 'Written lists', 'Calendar use', 'Repetition strategies']
    },
    'attention training': {
      assist: ['Verbal cues', 'Environmental modification', 'Task simplification'],
      goal: ['Improve sustained attention', 'Improve divided attention', 'Improve task completion'],
      deficit: ['Decreased sustained attention', 'Decreased divided attention', 'Increased distractibility', 'Decreased processing speed'],
      cues: ['Minimize distractions', 'Task breakdown', 'Frequent breaks', 'Refocusing strategies']
    },
    // Additional Transfer Activities
    'stand-to-sit transfers': {
      assist: ['CGA', 'MinA at trunk', 'ModA at trunk', 'Supervision'],
      goal: ['Improve transfer safety', 'Increase transfer independence', 'Improve eccentric control'],
      deficit: ['Decreased eccentric control', 'Impaired balance', 'Decreased LE strength', 'Fear of falling'],
      cues: ['Controlled lowering', 'Feel surface first', 'Hand placement', 'Weight shift back']
    },
    'sliding board transfers': {
      assist: ['MinA', 'ModA', 'CGA', 'Supervision'],
      goal: ['Improve transfer independence', 'Improve safety with lateral transfers'],
      deficit: ['Decreased LE strength', 'Unable to bear weight on LE', 'Decreased trunk control', 'Decreased UE strength'],
      cues: ['Board positioning', 'Weight shift', 'Small movements', 'Brake locks']
    },
    'floor-to-stand transfers': {
      assist: ['ModA', 'MaxA', 'Supervision', '2 person assist'],
      goal: ['Improve ability to recover from fall', 'Improve safety', 'Decrease fall anxiety'],
      deficit: ['Decreased LE strength', 'Decreased UE strength', 'Impaired motor planning', 'Fear of falling'],
      cues: ['Sequence', 'Use furniture', 'Rest between stages', 'Safety call']
    },
    // Additional Bed Mobility
    'sit-to-supine': {
      assist: ['MinA', 'ModA', 'CGA', 'Supervision'],
      goal: ['Improve bed mobility', 'Improve safety'],
      deficit: ['Decreased trunk control', 'Decreased eccentric control', 'Impaired motor planning'],
      cues: ['Side-lying first', 'Controlled lowering', 'Head position', 'Use arms']
    },
    'bridging': {
      assist: ['MinA for positioning', 'Verbal cues', 'Tactile cues'],
      goal: ['Improve bed mobility', 'Improve core strength', 'Improve LE strength'],
      deficit: ['Decreased core strength', 'Decreased glute strength', 'Decreased hip extension'],
      cues: ['Squeeze glutes', 'Lift hips', 'Hold position', 'Controlled lowering']
    },
    // Additional Balance Activities
    'static sitting balance': {
      assist: ['CGA', 'Supervision', 'MinA'],
      goal: ['Improve sitting balance', 'Improve trunk control', 'Improve postural stability'],
      deficit: ['Decreased static sitting balance', 'Decreased trunk control', 'Decreased core strength'],
      cues: ['Midline', 'Sit tall', 'Even weight', 'Core engagement']
    },
    'dynamic sitting balance': {
      assist: ['CGA', 'MinA', 'Supervision'],
      goal: ['Improve dynamic sitting balance', 'Improve reaching', 'Improve trunk rotation'],
      deficit: ['Decreased dynamic sitting balance', 'Decreased trunk rotation', 'Decreased anticipatory control'],
      cues: ['Weight shift', 'Reach and return', 'Look where reaching', 'Core engagement']
    },
    'static standing balance': {
      assist: ['CGA', 'MinA', 'Supervision'],
      goal: ['Improve standing balance', 'Decrease fall risk', 'Improve standing tolerance'],
      deficit: ['Decreased static standing balance', 'Decreased ankle strategy', 'Decreased proprioception'],
      cues: ['Feet position', 'Weight distribution', 'Visual focus', 'Relaxed shoulders']
    },
    'reactive balance training': {
      assist: ['CGA', 'MinA', 'Gait belt'],
      goal: ['Improve reactive balance', 'Decrease fall risk', 'Improve recovery strategies'],
      deficit: ['Decreased reactive balance', 'Delayed righting reactions', 'Decreased protective responses'],
      cues: ['Anticipate perturbation', 'Step strategy', 'Reach strategy', 'Recovery steps']
    },
    'weight shifting': {
      assist: ['CGA', 'Supervision', 'MinA'],
      goal: ['Improve weight shifting', 'Improve dynamic balance', 'Improve transfer preparation'],
      deficit: ['Decreased lateral weight shift', 'Decreased anterior weight shift', 'Impaired balance'],
      cues: ['Shift to target', 'Return to center', 'Control movement', 'Even weight through feet']
    },
    // Additional Fine Motor
    'pinch/grasp activities': {
      assist: ['Supervision', 'Setup only', 'Verbal cues'],
      goal: ['Improve pinch strength', 'Improve grasp patterns', 'Improve fine motor for ADLs'],
      deficit: ['Decreased pinch strength', 'Decreased grasp strength', 'Impaired coordination'],
      cues: ['Grasp type', 'Sustained hold', 'Precision', 'Release control']
    },
    'in-hand manipulation': {
      assist: ['Supervision', 'Verbal cues'],
      goal: ['Improve in-hand manipulation', 'Improve dexterity', 'Improve ADL performance'],
      deficit: ['Impaired in-hand manipulation', 'Decreased finger isolation', 'Decreased dexterity'],
      cues: ['Object positioning', 'Finger movements', 'Precision', 'Speed vs accuracy']
    },
    'bilateral coordination': {
      assist: ['Supervision', 'Setup only', 'Verbal cues'],
      goal: ['Improve bilateral coordination', 'Improve ADL performance', 'Improve motor planning'],
      deficit: ['Impaired bilateral coordination', 'Decreased motor planning', 'Asymmetric function'],
      cues: ['Both hands together', 'Stabilize and manipulate', 'Timing', 'Symmetry']
    },
    // Additional Grooming
    'oral hygiene': {
      assist: ['Supervision', 'MinA', 'Setup only'],
      goal: ['Improve oral hygiene independence', 'Improve sequencing', 'Improve fine motor'],
      deficit: ['Decreased fine motor', 'Impaired sequencing', 'Decreased standing tolerance', 'Decreased UE function'],
      cues: ['Brush all surfaces', 'Sequence', 'Standing support', 'Mirror use']
    },
    'hair care': {
      assist: ['Supervision', 'MinA', 'Setup only'],
      goal: ['Improve grooming independence', 'Improve UE function', 'Improve standing tolerance'],
      deficit: ['Limited shoulder ROM', 'Decreased UE strength', 'Decreased standing tolerance', 'Decreased activity tolerance'],
      cues: ['Seated option', 'Pacing', 'Long-handled brush', 'Rest breaks']
    },
    'shaving': {
      assist: ['Supervision', 'MinA', 'Setup only'],
      goal: ['Improve grooming independence', 'Improve fine motor', 'Improve safety'],
      deficit: ['Decreased fine motor', 'Decreased safety awareness', 'Impaired vision', 'Decreased standing tolerance'],
      cues: ['Mirror use', 'Good lighting', 'Electric razor option', 'Skin care']
    },
    // Additional Exercise
    'LE strengthening': {
      assist: ['Supervision', 'MinA for positioning', 'Verbal cues'],
      goal: ['Improve LE strength', 'Improve functional mobility', 'Improve transfer ability'],
      deficit: ['Decreased LE strength', 'Decreased hip strength', 'Decreased knee strength', 'Decreased ankle strength'],
      cues: ['Form', 'Breathing', 'Rep count', 'Full range', 'Control']
    },
    'grip strengthening': {
      assist: ['Supervision', 'Setup only'],
      goal: ['Improve grip strength', 'Improve hand function', 'Improve ADL performance'],
      deficit: ['Decreased grip strength', 'Decreased hand function', 'Decreased endurance'],
      cues: ['Squeeze and hold', 'Controlled release', 'Resistance level', 'Repetitions']
    },
    'endurance training': {
      assist: ['Supervision', 'CGA'],
      goal: ['Improve activity tolerance', 'Improve endurance', 'Improve functional capacity'],
      deficit: ['Decreased activity tolerance', 'Decreased endurance', 'Decreased cardiopulmonary function'],
      cues: ['Pacing', 'Monitor fatigue', 'Rest breaks', 'Gradual progression']
    }
  },

  // Global options (shown for all activities) - organized by category
  globalOptions: {
    // Tolerance/Response options - how the patient handled the activity
    response: [
      // Good tolerance
      { value: 'tolerated-well', label: 'Tolerated well', category: 'Good' },
      { value: 'minimal-fatigue', label: 'Minimal fatigue', category: 'Good' },
      { value: 'good-effort', label: 'Good effort', category: 'Good' },
      { value: 'motivated', label: 'Motivated', category: 'Good' },
      // Moderate tolerance
      { value: 'moderate-fatigue', label: 'Moderate fatigue', category: 'Moderate' },
      { value: 'rest-breaks', label: 'Rest breaks needed', category: 'Moderate' },
      { value: 'frequent-breaks', label: 'Frequent breaks', category: 'Moderate' },
      { value: 'pacing-required', label: 'Pacing required', category: 'Moderate' },
      // Limited tolerance
      { value: 'fatigue-limited', label: 'Fatigue limited', category: 'Limited' },
      { value: 'pain-limited', label: 'Pain limited', category: 'Limited' },
      { value: 'SOB', label: 'SOB noted', category: 'Limited' },
      { value: 'dizziness', label: 'Dizziness', category: 'Limited' },
      { value: 'orthostatic', label: 'Orthostatic symptoms', category: 'Limited' },
      { value: 'anxiety-limited', label: 'Anxiety limited', category: 'Limited' },
      { value: 'unable-complete', label: 'Unable to complete', category: 'Limited' }
    ],
    // Progress options - comparison to previous performance
    progress: [
      // Positive progress
      { value: 'improved', label: 'Improved', category: 'Positive' },
      { value: 'significantly-improved', label: 'Significantly improved', category: 'Positive' },
      { value: 'emerging-improvement', label: 'Emerging improvement', category: 'Positive' },
      // Neutral progress
      { value: 'same', label: 'Same as prior', category: 'Neutral' },
      { value: 'plateau', label: 'Plateau', category: 'Neutral' },
      { value: 'variable', label: 'Variable', category: 'Neutral' },
      { value: 'new', label: 'New/baseline', category: 'Neutral' },
      // Concerns
      { value: 'declined', label: 'Declined', category: 'Concern' },
      { value: 'declined-fatigue', label: 'Declined (fatigue)', category: 'Concern' },
      { value: 'declined-pain', label: 'Declined (pain)', category: 'Concern' },
      { value: 'declined-medical', label: 'Declined (medical)', category: 'Concern' }
    ],
    // Plan options - what to do next session
    plan: [
      // Continue
      { value: 'continue', label: 'Continue', category: 'Continue' },
      { value: 'continue-monitor', label: 'Continue & monitor', category: 'Continue' },
      // Progress
      { value: 'progress', label: 'Progress complexity', category: 'Progress' },
      { value: 'decrease-assist', label: '↓ Assist level', category: 'Progress' },
      { value: 'increase-reps', label: '↑ Reps/duration', category: 'Progress' },
      { value: 'reduce-cues', label: '↓ Cueing', category: 'Progress' },
      // Modify
      { value: 'modify', label: 'Modify approach', category: 'Modify' },
      { value: 'simplify', label: 'Simplify task', category: 'Modify' },
      { value: 'downgrade-fatigue', label: 'Downgrade (fatigue)', category: 'Modify' },
      { value: 'downgrade-pain', label: 'Downgrade (pain)', category: 'Modify' },
      // Add intervention
      { value: 'add-equipment', label: 'Add equipment', category: 'Add' },
      { value: 'trial-equipment', label: 'Trial different equipment', category: 'Add' },
      { value: 'add-strengthening', label: 'Add strengthening', category: 'Add' },
      { value: 'add-balance', label: 'Add balance training', category: 'Add' },
      { value: 'add-endurance', label: 'Add endurance', category: 'Add' },
      // Safety/Education
      { value: 'focus-safety', label: 'Focus on safety', category: 'Safety' },
      { value: 'fall-prevention', label: 'Fall prevention', category: 'Safety' },
      { value: 'energy-conservation', label: 'Energy conservation', category: 'Safety' },
      { value: 'body-mechanics', label: 'Body mechanics', category: 'Safety' },
      // Cognitive
      { value: 'cognitive-strategies', label: 'Cognitive strategies', category: 'Cognitive' },
      { value: 'external-cues', label: 'External cue setup', category: 'Cognitive' },
      // Collaboration
      { value: 'family-training', label: 'Family training', category: 'Collaboration' },
      { value: 'coordinate-nursing', label: 'Coordinate nursing', category: 'Collaboration' },
      { value: 'coordinate-pt', label: 'Coordinate PT', category: 'Collaboration' },
      // Discharge planning
      { value: 'home-program', label: 'Home program', category: 'Discharge' },
      { value: 'dc-planning', label: 'D/C planning', category: 'Discharge' },
      { value: 'equipment-recs', label: 'Equipment recs', category: 'Discharge' }
    ],
    // Performance qualifiers - how the patient performed
    performance: [
      { value: 'improved-technique', label: 'Improved technique', category: 'Positive' },
      { value: 'improved-confidence', label: 'Improved confidence', category: 'Positive' },
      { value: 'improved-timing', label: 'Improved timing', category: 'Positive' },
      { value: 'decreased-fear', label: 'Decreased fear', category: 'Positive' },
      { value: 'good-sequencing', label: 'Good sequencing', category: 'Positive' },
      { value: 'slowly-deliberately', label: 'Slow & deliberate', category: 'Neutral' },
      { value: 'multiple-attempts', label: 'Multiple attempts', category: 'Concern' },
      { value: 'loss-of-balance', label: 'Loss of balance', category: 'Concern' },
      { value: 'poor-body-mechanics', label: 'Poor body mechanics', category: 'Concern' },
      { value: 'safety-concerns', label: 'Safety concerns', category: 'Concern' },
      { value: 'frequent-cues-needed', label: 'Frequent cues needed', category: 'Concern' },
      { value: 'decreased-attention', label: 'Decreased attention', category: 'Concern' }
    ],
    // Session context options
    context: [
      { value: 'alert-today', label: 'More alert today', category: 'Patient Status' },
      { value: 'fatigued-after-pt', label: 'Fatigued after PT', category: 'Patient Status' },
      { value: 'well-rested', label: 'Well rested', category: 'Patient Status' },
      { value: 'slept-poorly', label: 'Slept poorly', category: 'Patient Status' },
      { value: 'pain-med-prior', label: 'Pain med 1hr prior', category: 'Patient Status' },
      { value: 'first-post-procedure', label: 'First post-procedure', category: 'Patient Status' },
      { value: 'anxious', label: 'Appeared anxious', category: 'Patient Status' },
      { value: 'motivated', label: 'Motivated', category: 'Patient Status' },
      { value: 'family-present', label: 'Family present', category: 'Environment' },
      { value: 'caregiver-present', label: 'Caregiver present', category: 'Environment' },
      { value: 'bedside-session', label: 'Bedside session', category: 'Environment' },
      { value: 'gym-session', label: 'Gym session', category: 'Environment' },
      { value: 'equipment-trialed', label: 'Equipment trialed', category: 'Environment' },
      { value: 'env-modified', label: 'Environment modified', category: 'Environment' },
      { value: 'carryover-noted', label: 'Carryover noted', category: 'Learning' },
      { value: 'forgot-techniques', label: 'Forgot techniques', category: 'Learning' },
      { value: 'interrupted', label: 'Session interrupted', category: 'Other' }
    ]
  },

  /**
   * Get suggestions for a specific activity
   */
  getSuggestions: function(activity) {
    const defaults = {
      assist: ['Supervision', 'CGA', 'MinA', 'ModA'],
      goal: ['Improve function', 'Increase independence', 'Improve safety'],
      deficit: ['Decreased strength', 'Impaired balance', 'Decreased endurance'],
      cues: []
    };
    return this.activitySuggestions[activity] || defaults;
  },

  // ============================================
  // CLINICAL TERMINOLOGY MAPPING
  // ============================================

  /**
   * Maps informal/everyday language to proper clinical terminology
   */
  clinicalTerms: {
    // Activities - informal to clinical
    activities: [
      // Functional reaching/bending
      { patterns: [/pick(ing)?(\s+(up|stuff|things?|items?|objects?))?(\s+(from|off))?(\s+the)?(\s+(floor|ground))/i, /bending?\s*(down)?\s*(to|and)?\s*(pick|grab|get|reach)/i, /reach(ing)?\s*(to|down)?\s*(the\s*)?(floor|ground)/i], clinical: 'functional reaching and retrieval' },
      { patterns: [/reach(ing)?\s*(up|over|across|high|shelf|cabinet)/i], clinical: 'overhead reaching tasks' },

      // Bed mobility - use standard terms
      { patterns: [/get(ting)?\s*(out\s*of|up\s*from)\s*(the\s*)?bed/i, /out\s*of\s*bed/i], clinical: 'supine-to-sit edge of bed' },
      { patterns: [/get(ting)?\s*in(to)?\s*(the\s*)?bed/i, /ly(ing|e)\s*down/i], clinical: 'sit-to-supine' },
      { patterns: [/roll(ing)?\s*(in\s*)?bed|turn(ing)?\s*(over)?\s*(in\s*)?bed/i], clinical: 'rolling in bed' },
      { patterns: [/scoot(ing)?|reposit(ion|ing)/i], clinical: 'bed repositioning' },

      // Transfers - standard terminology
      { patterns: [/sit(ting)?\s*(down|to|and)\s*stand|stand(ing)?\s*(up|and)\s*sit|sit\s*to\s*stand/i], clinical: 'sit-to-stand transfers' },
      { patterns: [/stand(ing)?\s*and\s*(turn|pivot)|pivot\s*transfer/i], clinical: 'stand-pivot transfers' },
      { patterns: [/slide\s*board|sliding\s*board|lateral\s*transfer/i], clinical: 'lateral sliding board transfer' },
      { patterns: [/squat\s*pivot/i], clinical: 'squat-pivot transfer' },
      { patterns: [/get(ting)?\s*(on|in)(to)?\s*(the\s*)?(toilet|commode)/i, /toilet\s*transfer/i], clinical: 'toilet transfer' },
      { patterns: [/get(ting)?\s*(in|out)\s*(of)?\s*(the\s*)?(tub|shower|bath)/i, /tub\s*transfer|shower\s*transfer/i], clinical: 'tub/shower transfer' },
      { patterns: [/get(ting)?\s*(in|out)\s*(of)?\s*(the\s*)?car/i, /car\s*transfer/i], clinical: 'car transfer' },
      { patterns: [/wheelchair.*bed|bed.*wheelchair/i], clinical: 'wheelchair-to-bed transfer' },

      // Dressing - standard ADL terms
      { patterns: [/put(ting)?\s*on\s*(a\s*)?(shirt|top|blouse|sweater|jacket|bra)/i, /dress(ing)?\s*(upper|top|torso)/i, /upper\s*(body|extremity)\s*dress/i], clinical: 'upper body dressing' },
      { patterns: [/put(ting)?\s*on\s*(pants|shorts|underwear|bottoms|skirt)/i, /dress(ing)?\s*(lower|bottom|legs?)/i, /lower\s*(body|extremity)\s*dress/i], clinical: 'lower body dressing' },
      { patterns: [/put(ting)?\s*on\s*(shoes?|socks?|footwear|slippers?)/i, /shoe|sock/i], clinical: 'footwear management' },
      { patterns: [/button|zipper|snap|fastener|velcro|tie/i], clinical: 'fastener management' },

      // Grooming/Hygiene - standard terms
      { patterns: [/brush(ing)?\s*(my|the|their)?\s*teeth|floss/i, /oral\s*(care|hygiene)/i, /denture/i], clinical: 'oral hygiene' },
      { patterns: [/wash(ing)?\s*(my|the|their)?\s*(face|hands?)/i, /hand\s*wash/i], clinical: 'hand/face washing' },
      { patterns: [/wash(ing)?\s*(my|the|their)?\s*hair|shampoo/i], clinical: 'hair washing' },
      { patterns: [/comb(ing)?|brush(ing)?\s*hair|style?\s*hair/i], clinical: 'hair grooming' },
      { patterns: [/shav(e|ing)/i], clinical: 'shaving' },
      { patterns: [/makeup|cosmetic/i], clinical: 'cosmetic application' },
      { patterns: [/nail\s*(care|trim|clip)/i], clinical: 'nail care' },

      // Bathing - specific terms
      { patterns: [/tak(e|ing)\s*(a\s*)?shower|shower(ing)?/i], clinical: 'showering' },
      { patterns: [/tak(e|ing)\s*(a\s*)?bath|bath(ing)?/i], clinical: 'bathing' },
      { patterns: [/wash(ing)?\s*(up|body|myself|self|lower|upper)/i], clinical: 'bathing' },
      { patterns: [/sponge\s*bath/i], clinical: 'sponge bathing' },

      // Toileting
      { patterns: [/us(e|ing)\s*(the\s*)?(toilet|bathroom|restroom)/i, /go(ing)?\s*to\s*(the\s*)?(bathroom|toilet)/i, /toilet(ing)?/i], clinical: 'toileting' },
      { patterns: [/wip(e|ing)|clean(ing)?\s*(after|self)/i], clinical: 'perineal hygiene' },
      { patterns: [/manag(e|ing)\s*(clothing|clothes).*toilet/i, /toilet.*cloth/i], clinical: 'clothing management for toileting' },

      // Feeding/Eating
      { patterns: [/eat(ing)?(?!\s*out)|feed(ing)?\s*(myself|self)/i], clinical: 'self-feeding' },
      { patterns: [/cut(ting)?\s*(food|meat)/i], clinical: 'food cutting' },
      { patterns: [/drink(ing)?|cup|straw/i], clinical: 'drinking/cup management' },
      { patterns: [/utensil|fork|spoon|knife/i], clinical: 'utensil use' },

      // IADLs
      { patterns: [/cook(ing)?|mak(e|ing)\s*(food|meals?|breakfast|lunch|dinner)/i, /prepar(e|ing)\s*(food|meals?)/i], clinical: 'meal preparation' },
      { patterns: [/clean(ing)?\s*(house)?|housekeep|tidy(ing)?/i], clinical: 'light housekeeping' },
      { patterns: [/sweep|vacuum|mop|dust/i], clinical: 'floor/surface cleaning' },
      { patterns: [/laundry|wash(ing)?\s*(clothes|laundry)/i, /fold(ing)?\s*clothes/i], clinical: 'laundry management' },
      { patterns: [/shop(ping)?|grocer/i], clinical: 'shopping' },
      { patterns: [/money|pay(ing)?|budget/i], clinical: 'financial management' },
      { patterns: [/med(ication|icine)?\s*(manage|box|organiz)/i, /pill\s*box/i], clinical: 'medication management' },

      // Functional mobility
      { patterns: [/walk(ing)?(?!\s*the\s*dog)|ambula/i], clinical: 'ambulation' },
      { patterns: [/get(ting)?\s*around|mov(e|ing)\s*around/i], clinical: 'functional mobility' },
      { patterns: [/wheel\s*chair\s*(mobil|propel|maneuver)/i, /push(ing)?\s*(wheel)?chair/i], clinical: 'wheelchair mobility' },
      { patterns: [/stair|step(s)?(?!\s*stool)/i], clinical: 'stair negotiation' },
      { patterns: [/curb/i], clinical: 'curb negotiation' },
      { patterns: [/ramp/i], clinical: 'ramp negotiation' },

      // Therapeutic exercise
      { patterns: [/arm\s*(exercise|strength)|strengthen(ing)?\s*(arm|upper)/i, /UE\s*strength/i, /upper\s*extremity\s*strength/i], clinical: 'UE strengthening exercises' },
      { patterns: [/leg\s*(exercise|strength)|strengthen(ing)?\s*(leg|lower)/i, /LE\s*strength/i, /lower\s*extremity\s*strength/i], clinical: 'LE strengthening exercises' },
      { patterns: [/core\s*(exercise|strength|stabil)|ab(s|dominal)?\s*(exercise|strength)/i, /trunk\s*strength/i], clinical: 'core stabilization exercises' },
      { patterns: [/stretch(ing)?|flexib/i], clinical: 'stretching/flexibility exercises' },
      { patterns: [/ROM|range\s*of\s*motion/i], clinical: 'ROM exercises' },
      { patterns: [/AROM/i], clinical: 'AROM exercises' },
      { patterns: [/PROM/i], clinical: 'PROM exercises' },

      // Balance
      { patterns: [/sitting\s*(up|balance)|balance.*sit|seated\s*balance/i], clinical: 'sitting balance training' },
      { patterns: [/standing\s*balance|balance.*stand/i], clinical: 'standing balance training' },
      { patterns: [/dynamic\s*balance/i], clinical: 'dynamic balance training' },
      { patterns: [/static\s*balance/i], clinical: 'static balance training' },
      { patterns: [/weight\s*shift/i], clinical: 'weight shifting activities' },

      // Fine motor/coordination
      { patterns: [/fine\s*motor|small\s*muscle|finger\s*(control|dexterity)|hand\s*(coordination|dexterity)|pinch|grasp/i], clinical: 'fine motor activities' },
      { patterns: [/gross\s*motor|large\s*muscle/i], clinical: 'gross motor activities' },
      { patterns: [/coordinat/i], clinical: 'coordination training' },

      // Cognitive/Safety
      { patterns: [/sequenc(e|ing)/i], clinical: 'sequencing training' },
      { patterns: [/safety\s*(train|aware|educat)/i], clinical: 'safety training' },
      { patterns: [/memory|recall/i], clinical: 'memory strategies training' },
      { patterns: [/attention|focus|concentrat/i], clinical: 'attention training' },
      { patterns: [/problem\s*solv/i], clinical: 'problem-solving training' },

      // Energy conservation/Work simplification
      { patterns: [/energy\s*(conserv|sav)|pac(e|ing)/i], clinical: 'energy conservation training' },
      { patterns: [/work\s*simplif/i], clinical: 'work simplification training' },
      { patterns: [/joint\s*protect/i], clinical: 'joint protection training' },
      { patterns: [/body\s*mechanic/i], clinical: 'body mechanics training' },

      // Equipment
      { patterns: [/adaptive\s*(equip|device)|assist(ive)?\s*(device|tech)/i], clinical: 'adaptive equipment training' },
      { patterns: [/splint/i], clinical: 'splint wear/care training' },
      { patterns: [/ortho(tic|sis)/i], clinical: 'orthotic training' }
    ],

    // Deficits - informal to clinical
    deficits: [
      // Strength deficits
      { patterns: [/weak(ness)?.*arm|arm.*weak/i, /can(')?t\s*lift\s*(arm|arms)/i, /UE\s*weak/i], clinical: 'decreased UE strength' },
      { patterns: [/weak(ness)?.*leg|leg.*weak/i, /LE\s*weak/i], clinical: 'decreased LE strength' },
      { patterns: [/weak(ness)?.*core|core.*weak|trunk.*weak/i], clinical: 'decreased trunk/core strength' },
      { patterns: [/weak(ness)?.*grip|grip.*weak|can(')?t\s*hold|drop(ping)?\s*things/i], clinical: 'decreased grip strength' },
      { patterns: [/weak(ness)?.*pinch/i], clinical: 'decreased pinch strength' },
      { patterns: [/general(ized)?\s*weak/i], clinical: 'generalized weakness' },

      // Balance deficits
      { patterns: [/balance.*stand|stand.*balance|unsteady.*stand/i], clinical: 'impaired standing balance' },
      { patterns: [/balance.*sit|sit.*balance|unsteady.*sit/i], clinical: 'impaired sitting balance' },
      { patterns: [/dynamic\s*balance/i], clinical: 'impaired dynamic balance' },
      { patterns: [/static\s*balance/i], clinical: 'impaired static balance' },
      { patterns: [/balance.*bad|bad.*balance|unsteady|wobbly|tip(py|ping)/i, /fall(ing)?\s*(a\s*lot|often|frequently)/i, /lose?\s*balance/i], clinical: 'impaired balance' },

      // ROM deficits
      { patterns: [/can(')?t\s*(move|lift|raise).*shoulder|shoulder.*(stiff|limited|restricted)/i, /frozen\s*shoulder/i], clinical: 'limited shoulder ROM' },
      { patterns: [/can(')?t\s*(move|bend).*elbow|elbow.*(stiff|limited)/i], clinical: 'limited elbow ROM' },
      { patterns: [/can(')?t\s*(move|bend).*wrist|wrist.*(stiff|limited)/i], clinical: 'limited wrist ROM' },
      { patterns: [/can(')?t\s*bend.*hip|hip.*(stiff|limited|restricted)/i], clinical: 'limited hip ROM' },
      { patterns: [/can(')?t\s*bend.*knee|knee.*(stiff|limited)/i], clinical: 'limited knee ROM' },
      { patterns: [/stiff|tight|restricted\s*motion/i], clinical: 'limited ROM' },

      // Coordination deficits
      { patterns: [/clumsy|incoordinat/i], clinical: 'impaired coordination' },
      { patterns: [/fumbl(e|ing)|finger.*coordination|can(')?t\s*(button|zip|write)/i, /fine\s*motor.*(impair|deficit|problem)/i], clinical: 'impaired fine motor coordination' },
      { patterns: [/gross\s*motor.*(impair|deficit|problem)/i], clinical: 'impaired gross motor coordination' },
      { patterns: [/tremor|shak(e|y|ing)/i], clinical: 'tremor' },
      { patterns: [/ataxia|ataxic/i], clinical: 'ataxia' },

      // Endurance/tolerance
      { patterns: [/get(s)?\s*tired\s*(easily|fast|quickly)|low\s*energy|fatigue|no\s*endurance/i], clinical: 'decreased activity tolerance' },
      { patterns: [/can(')?t\s*stand\s*(long|very\s*long)|standing.*tolerance/i], clinical: 'decreased standing tolerance' },
      { patterns: [/can(')?t\s*sit\s*(long|very\s*long)|sitting.*tolerance/i], clinical: 'decreased sitting tolerance' },
      { patterns: [/short(ness)?\s*(of)?\s*breath|SOB|dyspnea/i], clinical: 'dyspnea with activity' },

      // Cognitive deficits
      { patterns: [/forget(s|ting)?.*order|order.*wrong|sequence|step.*order|can(')?t\s*follow\s*step/i], clinical: 'impaired sequencing' },
      { patterns: [/not\s*safe|safety.*aware|aware.*danger|danger.*aware|risk(y)?\s*behavior|impuls/i], clinical: 'decreased safety awareness' },
      { patterns: [/can(')?t\s*plan|planning.*difficult|motor\s*planning/i], clinical: 'impaired motor planning' },
      { patterns: [/can(')?t\s*(focus|concentrate|pay\s*attention)|distract|attention/i], clinical: 'decreased attention' },
      { patterns: [/memory|forget(ful)?|can(')?t\s*remember/i], clinical: 'impaired memory' },
      { patterns: [/confus(ed|ion)/i], clinical: 'confusion' },
      { patterns: [/problem\s*solv/i], clinical: 'impaired problem-solving' },

      // Sensory deficits
      { patterns: [/numb|can(')?t\s*feel|no\s*sensation|tingl/i], clinical: 'impaired sensation' },
      { patterns: [/vision|can(')?t\s*see|sight/i], clinical: 'impaired vision' },
      { patterns: [/neglect/i], clinical: 'unilateral neglect' },

      // Other
      { patterns: [/pain(ful)?.*move|move.*pain|hurt(s)?\s*to/i], clinical: 'pain limiting function' },
      { patterns: [/posture|slump|lean(ing)?/i], clinical: 'impaired posture' },
      { patterns: [/trunk\s*control/i], clinical: 'decreased trunk control' },
      { patterns: [/edema|swell(ing)?/i], clinical: 'edema' },
      { patterns: [/spastic/i], clinical: 'spasticity' },
      { patterns: [/flaccid/i], clinical: 'flaccidity' }
    ],

    // Goals - informal to clinical
    goals: [
      // Safety goals
      { patterns: [/safe(r|ty)?|not\s*fall|prevent.*fall|fall\s*(risk|prevent)/i], clinical: 'improve safety with functional mobility' },
      { patterns: [/safe.*transfer/i], clinical: 'improve safety with transfers' },

      // Independence goals
      { patterns: [/do\s*(it|things?).*myself|independent|on\s*(my|their)\s*own|without\s*help/i], clinical: 'increase independence with ADLs' },
      { patterns: [/dress.*better|better.*dress|put\s*on\s*clothes|independent.*dress/i], clinical: 'increase independence with dressing' },
      { patterns: [/bath(e|ing)?.*better|wash.*better|shower.*better|independent.*(bath|shower)/i], clinical: 'increase independence with bathing' },
      { patterns: [/groom.*better|independent.*groom/i], clinical: 'increase independence with grooming' },
      { patterns: [/toilet.*better|independent.*toilet/i], clinical: 'increase independence with toileting' },
      { patterns: [/eat.*better|feed.*better|independent.*(eat|feed)/i], clinical: 'increase independence with self-feeding' },
      { patterns: [/transfer.*better|get\s*(up|out).*easier|independent.*transfer/i], clinical: 'increase independence with transfers' },

      // Function goals
      { patterns: [/walk.*better|mobil(e|ity)|get\s*around/i], clinical: 'improve functional mobility' },
      { patterns: [/balance.*better|better.*balance|more\s*stable/i], clinical: 'improve balance' },
      { patterns: [/stand.*better|stand.*longer/i], clinical: 'improve standing tolerance' },
      { patterns: [/strong(er)?.*arm|arm.*strong|UE.*strength/i], clinical: 'increase UE strength' },
      { patterns: [/strong(er)?.*leg|leg.*strong|LE.*strength/i], clinical: 'increase LE strength' },
      { patterns: [/strong(er)?.*grip|grip.*strong/i], clinical: 'increase grip strength' },
      { patterns: [/strong(er)?|strength/i], clinical: 'increase strength' },
      { patterns: [/ROM|range\s*of\s*motion|flex(ible|ibility)/i], clinical: 'increase ROM' },
      { patterns: [/last\s*longer|more\s*endurance|not.*tired|stamina/i], clinical: 'improve activity tolerance' },
      { patterns: [/coordinat.*better|better.*coordinat/i], clinical: 'improve coordination' },
      { patterns: [/fine\s*motor/i], clinical: 'improve fine motor skills' },

      // Cognitive goals
      { patterns: [/remember|memory/i], clinical: 'improve memory strategies' },
      { patterns: [/safe.*aware|aware.*safe/i], clinical: 'improve safety awareness' },
      { patterns: [/attention|focus|concentrat/i], clinical: 'improve attention to task' },
      { patterns: [/sequenc/i], clinical: 'improve task sequencing' },

      // Pain/edema
      { patterns: [/less\s*pain|pain.*less|reduce.*pain|pain.*reduce/i], clinical: 'decrease pain' },
      { patterns: [/swell.*less|reduce.*swell|edema/i], clinical: 'reduce edema' }
    ]
  },

  /**
   * Convert informal text to clinical terminology
   * @param {string} text - Input text
   * @param {string} category - 'activities', 'deficits', or 'goals'
   * @returns {string} Clinical term or original text if no match
   */
  toClinicalTerm: function(text, category) {
    if (!text || !this.clinicalTerms[category]) return text;

    const mappings = this.clinicalTerms[category];
    for (const mapping of mappings) {
      for (const pattern of mapping.patterns) {
        if (pattern.test(text)) {
          return mapping.clinical;
        }
      }
    }
    return text; // Return original if no match
  },

  /**
   * Analyze and convert all informal terms in text to clinical terminology
   * @param {string} text - Raw input text
   * @returns {Object} Converted text with clinical terms
   */
  analyzeClinicalTerms: function(text) {
    const result = {
      original: text,
      activity: null,
      deficit: null,
      goal: null
    };

    // Find activities
    for (const mapping of this.clinicalTerms.activities) {
      for (const pattern of mapping.patterns) {
        if (pattern.test(text)) {
          result.activity = mapping.clinical;
          break;
        }
      }
      if (result.activity) break;
    }

    // Find deficits
    for (const mapping of this.clinicalTerms.deficits) {
      for (const pattern of mapping.patterns) {
        if (pattern.test(text)) {
          result.deficit = mapping.clinical;
          break;
        }
      }
      if (result.deficit) break;
    }

    // Find goals
    for (const mapping of this.clinicalTerms.goals) {
      for (const pattern of mapping.patterns) {
        if (pattern.test(text)) {
          result.goal = mapping.clinical;
          break;
        }
      }
      if (result.goal) break;
    }

    return result;
  },

  // ============================================
  // FREE-FORM PARSER
  // ============================================

  /**
   * Parse free-form clinical shorthand into structured data
   * Automatically converts informal language to clinical terminology
   */
  parseFreeForm: function(text) {
    const parsed = {
      activity: null,
      goal: null,
      assistLevel: null,
      assistLocation: null,
      assistReason: null,
      cues: null,
      tolerance: null,
      progress: null,
      deficit: null,
      plan: null,
      additional: null
    };

    const lowerText = text.toLowerCase();

    // Parse assist levels
    if (/\bindep(endent)?\b/i.test(text)) parsed.assistLevel = 'independent';
    else if (/\bsupervis(ion|e)?\b/i.test(text)) parsed.assistLevel = 'supervision';
    else if (/\bcga\b|contact guard/i.test(text)) parsed.assistLevel = 'cga';
    else if (/\bmin(imal)?\s*a(ssist)?\b/i.test(text)) parsed.assistLevel = 'minA';
    else if (/\bmod(erate)?\s*a(ssist)?\b/i.test(text)) parsed.assistLevel = 'modA';
    else if (/\bmax(imum)?\s*a(ssist)?\b/i.test(text)) parsed.assistLevel = 'maxA';
    else if (/\bdependent\b/i.test(text)) parsed.assistLevel = 'dependent';

    // Parse assist location
    const locationMatch = text.match(/(?:at|to|@)\s*(trunk|hips?|bilat(?:eral)?\s*[UL]Es?|[LR]\s*[UL]E|shoulder|arm|leg)/i);
    if (locationMatch) parsed.assistLocation = locationMatch[1];

    // Parse tolerance
    if (/toler(ated|ating)?\s*well|no\s*fatigue|without\s*fatigue/i.test(text)) parsed.tolerance = 'wellTolerated';
    else if (/rest\s*break|break.*required/i.test(text)) parsed.tolerance = 'restBreaks';
    else if (/fatigu/i.test(text)) parsed.tolerance = 'fatigue';
    else if (/pain\s*(limit|restrict)/i.test(text)) parsed.tolerance = 'pain';

    // Parse progress
    if (/improv(ed|ing|ement)|progress|better|gains?/i.test(text)) parsed.progress = 'improved';
    else if (/same|static|plateau|no\s*change|unchanged/i.test(text)) parsed.progress = 'same';
    else if (/declin(ed|ing)|regress|worse/i.test(text)) parsed.progress = 'declined';

    // Parse plan
    if (/continue|cont\b|maintain/i.test(text)) parsed.plan = 'continue';
    else if (/progress|upgrade|advance|increase.*challenge/i.test(text)) parsed.plan = 'progress';
    else if (/modify|adjust|change.*approach/i.test(text)) parsed.plan = 'modify';
    else if (/equip|adaptive|device/i.test(text)) parsed.plan = 'addEquipment';

    // Analyze clinical terms - converts informal language to clinical terminology
    const clinicalAnalysis = this.analyzeClinicalTerms(text);

    // Use clinical term if found, otherwise fall back to pattern matching
    if (clinicalAnalysis.activity) {
      parsed.activity = clinicalAnalysis.activity;
    } else {
      // Fallback: Parse activities (common OT activities)
      const activities = [
        'transfer', 'bed mobility', 'dressing', 'bathing', 'grooming',
        'toileting', 'feeding', 'self-feeding', 'meal prep', 'balance',
        'standing', 'sitting', 'ambulation', 'wheelchair', 'strengthening',
        'ROM', 'stretching', 'fine motor', 'gross motor', 'cogniti'
      ];
      for (const act of activities) {
        if (lowerText.includes(act)) {
          parsed.activity = text.match(new RegExp(`\b${act}[^,.;!?]*`, 'i'))?.[0]?.trim() || act;
          break;
        }
      }
    }

    // Parse cues
    const cueMatch = text.match(/(verbal|tactile|visual)\s*cues?\s*(?:for|to)?\s*([^,\.]+)?/i);
    if (cueMatch) {
      parsed.cues = cueMatch[0].trim();
    }

    // Use clinical term for deficit if found, otherwise fall back to pattern matching
    if (clinicalAnalysis.deficit) {
      parsed.deficit = clinicalAnalysis.deficit;
    } else {
      // Fallback: Parse deficits - use [^,.] to stop at delimiters
      const deficitPatterns = [
        /decreased\s+[^,.;!?]+/i,
        /impaired\s+[^,.;!?]+/i,
        /limited\s+[^,.;!?]+/i,
        /poor\s+[^,.;!?]+/i,
        /reduced\s+[^,.;!?]+/i
      ];
      for (const pattern of deficitPatterns) {
        const match = text.match(pattern);
        if (match) {
          parsed.deficit = match[0].trim();
          break;
        }
      }
    }

    // Use clinical term for goal if found
    if (clinicalAnalysis.goal) {
      parsed.goal = clinicalAnalysis.goal;
    }

    // Anything not parsed goes to additional
    parsed.rawInput = text;

    return parsed;
  },

  // ============================================
  // NARRATIVE GENERATOR
  // ============================================

  /**
   * Combined assist level mappings (level + location/purpose)
   */
  assistLevelText: {
    // Legacy mappings (for free-form parser compatibility)
    independent: 'independently',
    supervision: 'with supervision',
    cga: 'with contact guard assistance',
    minA: 'with minimal assistance',
    modA: 'with moderate assistance',
    maxA: 'with maximum assistance',
    dependent: 'with dependent assistance',
    // New combined mappings
    'supervision-cues': 'with supervision and verbal cues',
    'cga-safety': 'with CGA for safety',
    'minA-trunk': 'with minimal assistance at trunk',
    'minA-LE': 'with minimal assistance at LE',
    'modA-trunk': 'with moderate assistance at trunk',
    'modA-bilateral': 'with moderate assistance with bilateral support',
    'maxA-trunk': 'with maximum assistance at trunk',
    'maxA-total': 'with maximum assistance for all components'
  },

  /**
   * Combined tolerance + progress mappings
   */
  toleranceProgressText: {
    'wellTolerated-improved': 'Patient tolerated the activity well. This represents improvement compared to the prior session.',
    'wellTolerated-same': 'Patient tolerated the activity well. Performance remained consistent with the prior session.',
    'wellTolerated-new': 'Patient tolerated the activity well. This was the initial session for this activity.',
    'minimalFatigue-improved': 'Patient tolerated the activity well with minimal fatigue. This represents improvement from the prior session.',
    'minimalFatigue-same': 'Patient tolerated the activity well with minimal fatigue. Performance remained consistent with the prior session.',
    'restBreaks-improved': 'Rest breaks were required to complete the activity. Despite this, improvement was noted from the prior session.',
    'restBreaks-same': 'Rest breaks were required to complete the activity. Performance remained consistent with the prior session.',
    'fatigue': 'Fatigue was noted, limiting activity duration.',
    'pain': 'Pain limited full participation in the activity.',
    'SOB': 'Shortness of breath was noted, requiring activity modification.',
    'declined': 'A decline in performance was noted compared to the prior session.'
  },

  // Legacy tolerance text (for backward compatibility)
  toleranceText: {
    wellTolerated: 'Patient tolerated the activity well without signs of fatigue.',
    minimalFatigue: 'Patient tolerated the activity well with minimal fatigue noted.',
    restBreaks: 'Rest breaks were required to complete the activity.',
    fatigue: 'Fatigue was noted, limiting activity duration.',
    pain: 'Pain limited full participation in the activity.',
    SOB: 'Shortness of breath was noted, requiring activity modification.'
  },

  // Legacy progress text (for backward compatibility)
  progressText: {
    improved: 'This represents improvement compared to the prior session.',
    same: 'Performance remained consistent with the prior session.',
    declined: 'A decline in performance was noted compared to the prior session.',
    new: 'This was the initial session for this activity.'
  },

  planText: {
    continue: 'Plan to continue with the current intervention approach.',
    progress: 'Plan to progress the activity to increase challenge.',
    modify: 'Plan to modify the approach based on patient response.',
    addEquipment: 'Plan to introduce adaptive equipment to improve function.',
    decreaseAssist: 'Plan to decrease level of assistance as patient demonstrates improved performance.',
    increaseReps: 'Plan to increase repetitions and duration to build endurance.',
    addComplexity: 'Plan to add complexity to the task as patient demonstrates mastery.'
  },

  /**
   * Auto-suggest goal based on activity
   */
  activityGoalMap: {
    'sit-to-stand transfers': 'increase independence with transfers',
    'stand-pivot transfers': 'increase independence with transfers',
    'bed-to-wheelchair transfers': 'increase independence with transfers',
    'toilet transfers': 'increase independence with toileting',
    'tub/shower transfers': 'improve safety during functional activities',
    'car transfers': 'increase independence with transfers',
    'supine-to-sit': 'improve bed mobility',
    'rolling': 'improve bed mobility',
    'scooting in bed': 'improve bed mobility',
    'bed mobility training': 'improve bed mobility',
    'upper body dressing': 'increase independence with dressing',
    'lower body dressing': 'increase independence with dressing',
    'donning/doffing footwear': 'increase independence with dressing',
    'shower routine': 'increase independence with bathing',
    'grooming at sink': 'increase independence with grooming',
    'toileting routine': 'increase independence with toileting',
    'self-feeding': 'increase independence with self-feeding',
    'sitting balance activities': 'improve sitting balance',
    'standing balance activities': 'improve standing balance',
    'dynamic balance training': 'improve standing balance',
    'functional ambulation': 'improve functional mobility',
    'stair navigation': 'improve functional mobility',
    'UE strengthening': 'improve UE function',
    'core strengthening': 'improve standing balance',
    'AROM/PROM exercises': 'improve UE function',
    'fine motor coordination': 'improve fine motor coordination',
    'meal preparation': 'increase independence with ADLs',
    'light housekeeping': 'increase independence with ADLs',
    'medication management': 'improve safety during functional activities'
  },

  /**
   * Map response values to tolerance text
   */
  responseToToleranceText: {
    'tolerated-well': 'Patient tolerated the activity well without signs of fatigue.',
    'minimal-fatigue': 'Patient tolerated the activity well with minimal fatigue noted.',
    'rest-breaks': 'Rest breaks were required to complete the activity.',
    'fatigue-limited': 'Fatigue was noted, limiting activity duration.',
    'pain-limited': 'Pain limited full participation in the activity.',
    'SOB': 'Shortness of breath was noted, requiring activity modification.'
  },

  /**
   * Generate a cohesive narrative from structured answers
   * All user inputs are sanitized to prevent XSS
   */
  generateNarrative: function(answers) {
    const sentences = [];
    const sanitize = this.utils.sanitize.bind(this.utils);

    // Determine assist level - handle direct string (new chip format) or key lookup
    const assistValue = answers.assist || answers.assistLevel;

    // Auto-suggest goal if not provided
    let goal = answers.goal;
    if (!goal && answers.activity && this.activityGoalMap[answers.activity]) {
      goal = this.activityGoalMap[answers.activity];
    }

    // Opening sentence: Activity + Goal + Assist
    let opening = '';
    if (answers.activity) {
      const starter = this.utils.pick([
        'Pt participated in',
        'Pt engaged in',
        'Pt completed',
        'Patient participated in'
      ]);

      opening = `${starter} ${sanitize(answers.activity)}`;

      // Add assist level
      if (assistValue) {
        // Check if it's a key in assistLevelText (legacy format)
        if (this.assistLevelText[assistValue]) {
          opening += ` ${this.assistLevelText[assistValue]}`;
        } else {
          // Direct string from chip selection (new format)
          opening += ` with ${sanitize(assistValue)}`;
        }
      }

      // Add goal
      if (goal) {
        opening += ` to ${sanitize(goal.toLowerCase())}`;
      }

      opening += '.';
      sentences.push(opening);
    }

    // Cues sentence (handle both old 'cues' field and legacy cueType/cuePurpose)
    if (answers.cueType && answers.cueType !== '') {
      const cueStarter = this.utils.pick([
        'Cues provided for',
        'Patient required',
        'Cueing included'
      ]);
      let cuePhrase = sanitize(answers.cueType);
      if (answers.cuePurpose) {
        cuePhrase += ` ${sanitize(answers.cuePurpose)}`;
      }
      sentences.push(`${cueStarter} ${cuePhrase}.`);
    } else if (answers.cues) {
      // Fallback for old cues field (from free-form parsing)
      const cueStarter = this.utils.pick([
        'Cues provided for',
        'Patient required',
        'Cueing included'
      ]);
      sentences.push(`${cueStarter} ${sanitize(answers.cues)}.`);
    }

    // Deficit sentence
    if (answers.deficit) {
      const deficitStarter = this.utils.pick([
        'Intervention addressed',
        'Activity addressed',
        'Session targeted'
      ]);
      sentences.push(`${deficitStarter} ${sanitize(answers.deficit)}.`);
    }

    // Response/Tolerance sentence - handles new chip format and legacy format
    if (answers.response && this.responseToToleranceText[answers.response]) {
      sentences.push(this.responseToToleranceText[answers.response]);
    } else if (answers.tolerance && this.toleranceProgressText[answers.tolerance]) {
      sentences.push(this.toleranceProgressText[answers.tolerance]);
    } else if (answers.tolerance && this.toleranceText[answers.tolerance]) {
      sentences.push(this.toleranceText[answers.tolerance]);
    }

    // Progress sentence
    if (answers.progress && this.progressText[answers.progress]) {
      sentences.push(this.progressText[answers.progress]);
    }

    // Plan sentence
    if (answers.plan && this.planText[answers.plan]) {
      sentences.push(this.planText[answers.plan]);
    }

    // Additional info
    if (answers.additional && answers.additional.trim()) {
      sentences.push(sanitize(answers.additional));
    }

    return sentences.join(' ');
  },

  /**
   * Generate narrative from free-form text
   */
  generateFromFreeForm: function(text) {
    const parsed = this.parseFreeForm(text);
    return this.generateNarrative(parsed);
  }
};

// Export for browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DockyAssistant;
}
