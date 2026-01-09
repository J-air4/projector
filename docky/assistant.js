/**
 * DOCKY Assistant
 *
 * Provides guided interview and free-form input modes
 * for generating cohesive clinical narratives.
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
  // INTERVIEW QUESTIONS
  // ============================================

  questions: [
    {
      id: 'activity',
      prompt: 'What activity did the patient work on?',
      type: 'select',
      options: [
        // Transfers
        { value: 'sit-to-stand transfers', label: 'Sit-to-stand transfers' },
        { value: 'stand-pivot transfers', label: 'Stand-pivot transfers' },
        { value: 'bed-to-wheelchair transfers', label: 'Bed-to-wheelchair transfers' },
        { value: 'toilet transfers', label: 'Toilet transfers' },
        { value: 'tub/shower transfers', label: 'Tub/shower transfers' },
        { value: 'car transfers', label: 'Car transfers' },
        // Bed Mobility
        { value: 'supine-to-sit', label: 'Supine-to-sit' },
        { value: 'rolling', label: 'Rolling in bed' },
        { value: 'scooting in bed', label: 'Scooting in bed' },
        { value: 'bed mobility training', label: 'Bed mobility training' },
        // ADLs - Dressing
        { value: 'upper body dressing', label: 'Upper body dressing' },
        { value: 'lower body dressing', label: 'Lower body dressing' },
        { value: 'donning/doffing footwear', label: 'Donning/doffing footwear' },
        { value: 'fastener management', label: 'Fastener management' },
        // ADLs - Bathing
        { value: 'upper body bathing', label: 'Upper body bathing' },
        { value: 'lower body bathing', label: 'Lower body bathing' },
        { value: 'shower routine', label: 'Shower routine' },
        // ADLs - Grooming
        { value: 'oral hygiene', label: 'Oral hygiene' },
        { value: 'hair care', label: 'Hair care' },
        { value: 'shaving', label: 'Shaving' },
        { value: 'grooming at sink', label: 'Grooming at sink' },
        // ADLs - Toileting
        { value: 'toileting routine', label: 'Toileting routine' },
        { value: 'clothing management for toileting', label: 'Clothing management for toileting' },
        // ADLs - Feeding
        { value: 'self-feeding', label: 'Self-feeding' },
        { value: 'meal setup', label: 'Meal setup' },
        // Balance
        { value: 'sitting balance activities', label: 'Sitting balance activities' },
        { value: 'standing balance activities', label: 'Standing balance activities' },
        { value: 'dynamic balance training', label: 'Dynamic balance training' },
        // Functional Mobility
        { value: 'functional ambulation', label: 'Functional ambulation' },
        { value: 'wheelchair mobility', label: 'Wheelchair mobility' },
        { value: 'stair navigation', label: 'Stair navigation' },
        // Therapeutic
        { value: 'UE strengthening', label: 'UE strengthening' },
        { value: 'core strengthening', label: 'Core strengthening' },
        { value: 'fine motor coordination', label: 'Fine motor coordination' },
        { value: 'gross motor coordination', label: 'Gross motor coordination' },
        { value: 'AROM/PROM exercises', label: 'AROM/PROM exercises' },
        // Cognitive
        { value: 'sequencing training', label: 'Sequencing training' },
        { value: 'safety awareness training', label: 'Safety awareness training' },
        { value: 'medication management', label: 'Medication management' },
        // Home Management
        { value: 'meal preparation', label: 'Meal preparation' },
        { value: 'light housekeeping', label: 'Light housekeeping' },
        { value: 'laundry tasks', label: 'Laundry tasks' }
      ],
      required: true
    },
    {
      id: 'goal',
      prompt: 'What was the therapeutic goal?',
      type: 'select',
      options: [
        // Safety goals
        { value: 'improve safety during functional activities', label: 'Improve safety during functional activities' },
        { value: 'decrease fall risk', label: 'Decrease fall risk' },
        { value: 'improve transfer safety', label: 'Improve transfer safety' },
        // Independence goals
        { value: 'increase independence with ADLs', label: 'Increase independence with ADLs' },
        { value: 'increase independence with dressing', label: 'Increase independence with dressing' },
        { value: 'increase independence with bathing', label: 'Increase independence with bathing' },
        { value: 'increase independence with grooming', label: 'Increase independence with grooming' },
        { value: 'increase independence with toileting', label: 'Increase independence with toileting' },
        { value: 'increase independence with self-feeding', label: 'Increase independence with self-feeding' },
        { value: 'increase independence with transfers', label: 'Increase independence with transfers' },
        // Function goals
        { value: 'improve functional mobility', label: 'Improve functional mobility' },
        { value: 'improve standing balance', label: 'Improve standing balance' },
        { value: 'improve sitting balance', label: 'Improve sitting balance' },
        { value: 'improve bed mobility', label: 'Improve bed mobility' },
        { value: 'improve UE function', label: 'Improve UE function' },
        { value: 'improve fine motor coordination', label: 'Improve fine motor coordination' },
        { value: 'improve activity tolerance', label: 'Improve activity tolerance' },
        { value: 'improve standing tolerance', label: 'Improve standing tolerance' },
        // Cognitive goals
        { value: 'improve sequencing for ADL completion', label: 'Improve sequencing for ADL completion' },
        { value: 'improve safety awareness', label: 'Improve safety awareness' },
        { value: 'improve problem-solving skills', label: 'Improve problem-solving skills' },
        // Other
        { value: 'improve energy conservation', label: 'Improve energy conservation' },
        { value: 'improve use of adaptive equipment', label: 'Improve use of adaptive equipment' },
        { value: 'decrease pain during ADLs', label: 'Decrease pain during ADLs' }
      ],
      required: true
    },
    {
      id: 'assistLevel',
      prompt: 'What level of assistance was provided?',
      type: 'select',
      options: [
        { value: 'independent', label: 'Independent' },
        { value: 'supervision', label: 'Supervision' },
        { value: 'cga', label: 'Contact Guard Assist (CGA)' },
        { value: 'minA', label: 'Minimal Assist' },
        { value: 'modA', label: 'Moderate Assist' },
        { value: 'maxA', label: 'Maximum Assist' },
        { value: 'dependent', label: 'Dependent' }
      ],
      required: true
    },
    {
      id: 'assistLocation',
      prompt: 'Where was assistance provided?',
      type: 'select',
      options: [
        { value: 'at trunk', label: 'At trunk' },
        { value: 'at hips', label: 'At hips' },
        { value: 'at pelvis', label: 'At pelvis' },
        { value: 'bilateral UEs', label: 'Bilateral UEs' },
        { value: 'affected UE', label: 'Affected UE' },
        { value: 'bilateral LEs', label: 'Bilateral LEs' },
        { value: 'affected LE', label: 'Affected LE' },
        { value: 'at shoulders', label: 'At shoulders' },
        { value: 'at knees', label: 'At knees' },
        { value: 'posterior trunk', label: 'Posterior trunk' },
        { value: 'anterior trunk', label: 'Anterior trunk' }
      ],
      showIf: (answers) => !['independent', 'supervision'].includes(answers.assistLevel)
    },
    {
      id: 'assistReason',
      prompt: 'Why was assistance needed?',
      type: 'select',
      options: [
        { value: 'for safety', label: 'For safety' },
        { value: 'for balance', label: 'For balance' },
        { value: 'for weight shift', label: 'For weight shift' },
        { value: 'for postural control', label: 'For postural control' },
        { value: 'for motor control', label: 'For motor control' },
        { value: 'for stabilization', label: 'For stabilization' },
        { value: 'for guidance through movement', label: 'For guidance through movement' },
        { value: 'secondary to weakness', label: 'Secondary to weakness' },
        { value: 'secondary to fatigue', label: 'Secondary to fatigue' },
        { value: 'secondary to pain', label: 'Secondary to pain' },
        { value: 'secondary to decreased coordination', label: 'Secondary to decreased coordination' }
      ],
      showIf: (answers) => answers.assistLevel !== 'independent'
    },
    {
      id: 'cueType',
      prompt: 'What type of cues were provided?',
      type: 'select',
      options: [
        { value: '', label: 'No cues needed' },
        { value: 'verbal cues', label: 'Verbal cues' },
        { value: 'tactile cues', label: 'Tactile cues' },
        { value: 'visual cues', label: 'Visual cues' },
        { value: 'verbal and tactile cues', label: 'Verbal and tactile cues' },
        { value: 'verbal and visual cues', label: 'Verbal and visual cues' },
        { value: 'multi-modal cues', label: 'Multi-modal cues (verbal, tactile, visual)' }
      ]
    },
    {
      id: 'cuePurpose',
      prompt: 'What was the purpose of the cues?',
      type: 'select',
      options: [
        { value: 'for sequencing', label: 'For sequencing' },
        { value: 'for safety awareness', label: 'For safety awareness' },
        { value: 'for technique', label: 'For technique' },
        { value: 'for pacing', label: 'For pacing' },
        { value: 'for posture', label: 'For posture' },
        { value: 'for attention to task', label: 'For attention to task' },
        { value: 'for weight shift', label: 'For weight shift' },
        { value: 'for body mechanics', label: 'For body mechanics' },
        { value: 'for initiation', label: 'For initiation' },
        { value: 'for breath control', label: 'For breath control' }
      ],
      showIf: (answers) => answers.cueType && answers.cueType !== ''
    },
    {
      id: 'tolerance',
      prompt: 'How did the patient tolerate the activity?',
      type: 'select',
      options: [
        { value: 'wellTolerated', label: 'Tolerated well, no fatigue' },
        { value: 'minimalFatigue', label: 'Tolerated well with minimal fatigue' },
        { value: 'restBreaks', label: 'Required rest breaks' },
        { value: 'fatigue', label: 'Fatigue limited activity' },
        { value: 'pain', label: 'Pain limited activity' },
        { value: 'SOB', label: 'Shortness of breath noted' }
      ],
      required: true
    },
    {
      id: 'progress',
      prompt: 'How does this compare to the prior session?',
      type: 'select',
      options: [
        { value: 'improved', label: 'Improved' },
        { value: 'same', label: 'Same / Static' },
        { value: 'declined', label: 'Declined' },
        { value: 'new', label: 'New activity - no baseline' }
      ],
      required: true
    },
    {
      id: 'deficit',
      prompt: 'What deficit or limitation was addressed?',
      type: 'select',
      options: [
        // Balance deficits
        { value: 'decreased dynamic standing balance', label: 'Decreased dynamic standing balance' },
        { value: 'decreased static standing balance', label: 'Decreased static standing balance' },
        { value: 'decreased sitting balance', label: 'Decreased sitting balance' },
        { value: 'impaired reactive balance', label: 'Impaired reactive balance' },
        // Strength deficits
        { value: 'decreased UE strength', label: 'Decreased UE strength' },
        { value: 'decreased LE strength', label: 'Decreased LE strength' },
        { value: 'decreased core strength', label: 'Decreased core strength' },
        { value: 'decreased grip strength', label: 'Decreased grip strength' },
        // ROM deficits
        { value: 'limited shoulder ROM', label: 'Limited shoulder ROM' },
        { value: 'limited hip ROM', label: 'Limited hip ROM' },
        { value: 'limited knee ROM', label: 'Limited knee ROM' },
        // Coordination deficits
        { value: 'decreased fine motor coordination', label: 'Decreased fine motor coordination' },
        { value: 'decreased gross motor coordination', label: 'Decreased gross motor coordination' },
        { value: 'impaired bilateral coordination', label: 'Impaired bilateral coordination' },
        // Functional deficits
        { value: 'decreased activity tolerance', label: 'Decreased activity tolerance' },
        { value: 'decreased standing tolerance', label: 'Decreased standing tolerance' },
        { value: 'decreased functional reach', label: 'Decreased functional reach' },
        { value: 'decreased functional mobility', label: 'Decreased functional mobility' },
        // Cognitive deficits
        { value: 'impaired sequencing', label: 'Impaired sequencing' },
        { value: 'decreased safety awareness', label: 'Decreased safety awareness' },
        { value: 'impaired motor planning', label: 'Impaired motor planning' },
        { value: 'decreased attention to task', label: 'Decreased attention to task' },
        // Other
        { value: 'decreased postural control', label: 'Decreased postural control' },
        { value: 'decreased trunk control', label: 'Decreased trunk control' },
        { value: 'pain limiting function', label: 'Pain limiting function' }
      ]
    },
    {
      id: 'plan',
      prompt: 'What is the plan going forward?',
      type: 'select',
      options: [
        { value: 'continue', label: 'Continue current plan' },
        { value: 'progress', label: 'Progress/upgrade activity' },
        { value: 'modify', label: 'Modify approach' },
        { value: 'addEquipment', label: 'Introduce adaptive equipment' },
        { value: 'decreaseAssist', label: 'Decrease level of assistance' },
        { value: 'increaseReps', label: 'Increase repetitions/duration' },
        { value: 'addComplexity', label: 'Add complexity to task' }
      ]
    },
    {
      id: 'additional',
      prompt: 'Any additional details?',
      placeholder: 'e.g., patient reports feeling stronger, family present for training',
      type: 'textarea'
    }
  ],

  /**
   * Get visible questions based on current answers
   */
  getVisibleQuestions: function(answers) {
    return this.questions.filter(q => {
      if (!q.showIf) return true;
      return q.showIf(answers);
    });
  },

  // ============================================
  // FREE-FORM PARSER
  // ============================================

  /**
   * Parse free-form clinical shorthand into structured data
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

    // Parse activities (common OT activities)
    const activities = [
      'transfer', 'bed mobility', 'dressing', 'bathing', 'grooming',
      'toileting', 'feeding', 'self-feeding', 'meal prep', 'balance',
      'standing', 'sitting', 'ambulation', 'wheelchair', 'strengthening',
      'ROM', 'stretching', 'fine motor', 'gross motor', 'cogniti'
    ];
    for (const act of activities) {
      if (lowerText.includes(act)) {
        // Use [^,.] to stop at delimiters instead of greedy [\w\s]*
        parsed.activity = text.match(new RegExp(`\b${act}[^,.;!?]*`, 'i'))?.[0]?.trim() || act;
        break;
      }
    }

    // Parse cues
    const cueMatch = text.match(/(verbal|tactile|visual)\s*cues?\s*(?:for|to)?\s*([^,\.]+)?/i);
    if (cueMatch) {
      parsed.cues = cueMatch[0].trim();
    }

    // Parse deficits - use [^,.] to stop at delimiters
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

    // Anything not parsed goes to additional
    parsed.rawInput = text;

    return parsed;
  },

  // ============================================
  // NARRATIVE GENERATOR
  // ============================================

  /**
   * Assist level mappings for narrative
   */
  assistLevelText: {
    independent: 'independently',
    supervision: 'with supervision',
    cga: 'with contact guard assistance',
    minA: 'with minimal assistance',
    modA: 'with moderate assistance',
    maxA: 'with maximum assistance',
    dependent: 'with dependent assistance'
  },

  toleranceText: {
    wellTolerated: 'Patient tolerated the activity well without signs of fatigue.',
    minimalFatigue: 'Patient tolerated the activity well with minimal fatigue noted.',
    restBreaks: 'Rest breaks were required to complete the activity.',
    fatigue: 'Fatigue was noted, limiting activity duration.',
    pain: 'Pain limited full participation in the activity.',
    SOB: 'Shortness of breath was noted, requiring activity modification.'
  },

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
   * Generate a cohesive narrative from structured answers
   * All user inputs are sanitized to prevent XSS
   */
  generateNarrative: function(answers) {
    const sentences = [];
    const sanitize = this.utils.sanitize.bind(this.utils);

    // Opening sentence: Activity + Goal + Assist
    let opening = '';
    if (answers.activity) {
      const starter = this.utils.pick([
        'Patient participated in',
        'Patient engaged in',
        'Treatment session focused on',
        'Patient completed'
      ]);

      opening = `${starter} ${sanitize(answers.activity)}`;

      // Add assist level
      if (answers.assistLevel && this.assistLevelText[answers.assistLevel]) {
        opening += ` ${this.assistLevelText[answers.assistLevel]}`;
        if (answers.assistLocation) {
          opening += ` at ${sanitize(answers.assistLocation)}`;
        }
        if (answers.assistReason) {
          opening += ` ${sanitize(answers.assistReason)}`;
        }
      }

      // Add goal
      if (answers.goal) {
        opening += ` to ${sanitize(answers.goal)}`;
      }

      opening += '.';
      sentences.push(opening);
    }

    // Cues sentence (handle both old 'cues' field and new cueType/cuePurpose)
    if (answers.cueType && answers.cueType !== '') {
      const cueStarter = this.utils.pick([
        'Cueing included',
        'Patient required',
        'Therapist provided'
      ]);
      let cuePhrase = sanitize(answers.cueType);
      if (answers.cuePurpose) {
        cuePhrase += ` ${sanitize(answers.cuePurpose)}`;
      }
      sentences.push(`${cueStarter} ${cuePhrase}.`);
    } else if (answers.cues) {
      // Fallback for old cues field (from free-form parsing)
      const cueStarter = this.utils.pick([
        'Cueing included',
        'Patient required',
        'Therapist provided'
      ]);
      sentences.push(`${cueStarter} ${sanitize(answers.cues)}.`);
    }

    // Deficit sentence
    if (answers.deficit) {
      const deficitStarter = this.utils.pick([
        'Intervention addressed',
        'Session targeted',
        'Treatment focused on'
      ]);
      sentences.push(`${deficitStarter} ${sanitize(answers.deficit)}.`);
    }

    // Tolerance sentence
    if (answers.tolerance && this.toleranceText[answers.tolerance]) {
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
