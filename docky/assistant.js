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
      placeholder: 'e.g., transfers, dressing, bathing',
      type: 'text',
      required: true
    },
    {
      id: 'goal',
      prompt: 'What was the therapeutic goal?',
      placeholder: 'e.g., improve safety, increase independence',
      type: 'text',
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
      placeholder: 'e.g., at trunk, bilateral UEs, at hips',
      type: 'text',
      showIf: (answers) => !['independent', 'supervision'].includes(answers.assistLevel)
    },
    {
      id: 'assistReason',
      prompt: 'Why was assistance needed?',
      placeholder: 'e.g., for safety, for balance, for weight shift',
      type: 'text',
      showIf: (answers) => answers.assistLevel !== 'independent'
    },
    {
      id: 'cues',
      prompt: 'What cues were provided?',
      placeholder: 'e.g., verbal cues for sequencing, tactile cues to trunk',
      type: 'text'
    },
    {
      id: 'tolerance',
      prompt: 'How did the patient tolerate the activity?',
      type: 'select',
      options: [
        { value: 'wellTolerated', label: 'Tolerated well, no fatigue' },
        { value: 'restBreaks', label: 'Required rest breaks' },
        { value: 'fatigue', label: 'Fatigue limited activity' },
        { value: 'pain', label: 'Pain limited activity' }
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
      placeholder: 'e.g., decreased balance, limited ROM, impaired safety awareness',
      type: 'text'
    },
    {
      id: 'plan',
      prompt: 'What is the plan going forward?',
      type: 'select',
      options: [
        { value: 'continue', label: 'Continue current plan' },
        { value: 'progress', label: 'Progress/upgrade activity' },
        { value: 'modify', label: 'Modify approach' },
        { value: 'addEquipment', label: 'Introduce adaptive equipment' }
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
      /decreased\s+[^,.]+/i,
      /impaired\s+[^,.]+/i,
      /limited\s+[^,.]+/i,
      /poor\s+[^,.]+/i,
      /reduced\s+[^,.]+/i
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
    restBreaks: 'Rest breaks were required to complete the activity.',
    fatigue: 'Fatigue was noted, limiting activity duration.',
    pain: 'Pain limited full participation in the activity.'
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
    addEquipment: 'Plan to introduce adaptive equipment to improve function.'
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

    // Cues sentence
    if (answers.cues) {
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
