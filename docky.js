/**
 * DOCKY - AI-like Note Generation Engine
 *
 * A local, rule-based note generation system that produces natural,
 * varied clinical notes without external API calls.
 *
 * @version 1.0.0
 * @author OT Daily Note Builder
 */

const DOCKY = {
  // ============================================
  // PHRASE VARIATION BANKS
  // ============================================

  // Sentence starters for variety
  starters: {
    goal: [
      'To address',
      'In order to',
      'To facilitate',
      'To promote',
      'Working toward',
      'Targeting',
      'To support',
      'Aiming to'
    ],
    activity: [
      'Patient engaged in',
      'Patient participated in',
      'Patient performed',
      'Patient completed',
      'Pt worked on',
      'Treatment focused on',
      'Session involved',
      'Patient practiced'
    ]
  },

  // Instruction verbs
  instruction: [
    'instructed in',
    'trained in',
    'educated on',
    'guided through',
    'facilitated with',
    'engaged in'
  ],

  // Deficit introduction phrases
  deficitIntro: [
    'noted secondary to',
    '2/2',
    'due to',
    'related to',
    'attributed to',
    'as a result of'
  ],

  // Assistance phrasing
  assistRequired: [
    'required',
    'was necessary',
    'needed',
    'utilized',
    'provided'
  ],

  // Progress descriptors by category
  progressIntro: {
    improved: [
      'Demonstrated improvement compared to prior session',
      'Progress noted from baseline',
      'Performance improved since last session',
      'Patient showing gains',
      'Advancement observed from previous treatment'
    ],
    same: [
      'Performance remained consistent with prior session',
      'No significant change noted from baseline',
      'Static performance compared to last session',
      'Maintained current level of function',
      'Plateau observed at current level'
    ],
    declined: [
      'Regression noted from prior session',
      'Performance declined compared to baseline',
      'Decreased function observed since last session',
      'Patient demonstrated regression',
      'Step back noted from previous treatment'
    ]
  },

  // Tolerance phrasing subjects
  toleranceIntro: [
    'Patient',
    'Pt',
    'Individual'
  ],

  // Plan transitions
  planTransition: [
    'Plan:',
    'Moving forward,',
    'Next session,',
    'For progression,',
    'Recommendation:'
  ],

  // Sentence connectors
  connectors: [
    'Additionally,',
    'Furthermore,',
    'Also noted,',
    'Of note,',
    ''
  ],

  // Clinical reasoning frames
  reasoningFrames: [
    'Clinical reasoning supports',
    'Based on assessment,',
    'Given presentation,',
    'Per clinical judgment,',
    ''
  ],

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  /**
   * Randomly pick an item from an array
   * @param {Array} arr - Array to pick from
   * @returns {*} Random item from array
   */
  pick: function(arr) {
    if (!arr || arr.length === 0) return '';
    return arr[Math.floor(Math.random() * arr.length)];
  },

  /**
   * Weighted random selection - prefers earlier items in array
   * Useful for preferring more clinical/formal phrases
   * @param {Array} arr - Array to pick from
   * @returns {*} Weighted random item
   */
  pickWeighted: function(arr) {
    if (!arr || arr.length === 0) return '';
    const weights = arr.map((_, i) => arr.length - i);
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < arr.length; i++) {
      r -= weights[i];
      if (r <= 0) return arr[i];
    }
    return arr[0];
  },

  /**
   * Format a list of items naturally with proper grammar
   * @param {Array} items - Items to format
   * @returns {string} Formatted list string
   */
  formatList: function(items) {
    if (!items || items.length === 0) return '';
    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]} and ${items[1]}`;
    return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
  },

  /**
   * Capitalize first letter of a string
   * @param {string} str - String to capitalize
   * @returns {string} Capitalized string
   */
  capitalize: function(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  /**
   * Lowercase first letter of a string
   * @param {string} str - String to lowercase
   * @returns {string} Lowercased string
   */
  lowercaseFirst: function(str) {
    if (!str) return '';
    return str.charAt(0).toLowerCase() + str.slice(1);
  },

  // ============================================
  // MAIN GENERATION FUNCTION
  // ============================================

  /**
   * Generate a clinical note with natural variation
   * @param {Object} params - Note parameters
   * @param {Object} params.data - Clinical data from JSON files
   * @param {Array} params.selectedActivities - Selected activities
   * @param {Object} params.activityParams - Activity parameters (sets, reps, equipment)
   * @param {string} params.goal - Selected goal ID
   * @param {Array} params.assists - Configured assists
   * @param {Array} params.cues - Configured cues
   * @param {string} params.deficit - Selected deficit
   * @param {string} params.progress - Progress status (improved/same/declined)
   * @param {string} params.tolerance - Tolerance status
   * @param {string} params.plan - Selected plan
   * @param {Array} params.selectedPerformance - Performance qualifiers
   * @param {Array} params.selectedContext - Session context
   * @param {Array} params.selectedReasoning - Clinical reasoning
   * @param {string} params.patientSubjective - Patient subjective report
   * @param {string} params.painLocation - Pain location
   * @param {string} params.painRating - Pain rating
   * @param {Object} params.vitals - Vitals (hr, o2sat, bp)
   * @param {string} params.outputStyle - 'goal' or 'activity'
   * @returns {string} Generated clinical note
   */
  generate: function(params) {
    const {
      data,
      selectedActivities = [],
      activityParams = {},
      goal,
      assists = [],
      cues = [],
      deficit,
      progress,
      tolerance,
      plan,
      selectedPerformance = [],
      selectedContext = [],
      selectedReasoning = [],
      patientSubjective = '',
      painLocation = '',
      painRating = '',
      vitals = {},
      outputStyle = 'goal'
    } = params;

    if (!data) return '';
    const parts = [];

    // Build activity string with parameters
    let activityStr = '';
    if (selectedActivities.length > 0) {
      activityStr = this.formatList(selectedActivities);
      const activityParamsList = [];
      if (activityParams.sets && activityParams.reps) {
        activityParamsList.push(`${activityParams.sets}x${activityParams.reps}`);
      } else if (activityParams.sets) {
        activityParamsList.push(`${activityParams.sets} sets`);
      } else if (activityParams.reps) {
        activityParamsList.push(`${activityParams.reps} reps`);
      }
      if (activityParams.equipment) {
        activityParamsList.push(activityParams.equipment.toLowerCase());
      }
      if (activityParamsList.length) {
        activityStr += ` (${activityParamsList.join(', ')})`;
      }
    }

    // Get goal phrase
    const goalPhrase = goal ? data.GOALS.find(g => g.id === goal)?.phrase : '';

    // Build assist phrases with natural variation
    const assistPhrases = assists.map(a => {
      const level = data.ASSIST_LEVELS.find(l => l.id === a.level);
      if (!level) return '';
      if (a.level === 'I') return 'independence';
      if (a.level === 'ModI') return 'modified independence' + (a.modifier ? ` ${a.modifier}` : '');
      if (a.level === 'S') return 'supervision' + (a.purpose ? ` ${a.purpose}` : '');
      if (a.level === 'CGA') return 'CGA' + (a.purpose ? ` ${a.purpose}` : '');
      let phrase = level.full.toLowerCase();
      if (a.location) phrase += ` ${a.location}`;
      if (a.purpose) phrase += ` ${a.purpose}`;
      return phrase;
    }).filter(Boolean);

    // Build cue phrases
    const cuePhrases = cues.map(c => {
      let phrase = `${c.level} ${c.type} cues`;
      if (c.bodyPart) phrase += ` to ${c.bodyPart}`;
      if (c.purpose) phrase += ` for ${c.purpose}`;
      if (c.context) phrase += ` during ${c.context}`;
      return phrase.toLowerCase();
    });

    const deficitPhrase = deficit ? this.lowercaseFirst(deficit) : '';

    // Main sentence construction based on output style
    if (outputStyle === 'goal') {
      parts.push(...this._buildGoalLedSentence({
        goalPhrase,
        activityStr,
        assistPhrases,
        cuePhrases,
        deficitPhrase,
        progress,
        tolerance,
        plan,
        data
      }));
    } else {
      parts.push(...this._buildActivityLedSentence({
        goalPhrase,
        activityStr,
        assistPhrases,
        cuePhrases,
        deficitPhrase,
        progress,
        tolerance,
        plan,
        data
      }));
    }

    // Clinical analysis with Docky variation
    if (selectedPerformance.length > 0 || selectedContext.length > 0 || selectedReasoning.length > 0) {
      const analysisParts = [];
      if (selectedPerformance.length > 0) {
        analysisParts.push(`Patient demonstrated ${this.formatList(selectedPerformance)} performance`);
      }
      if (selectedContext.length > 0) {
        const connector = analysisParts.length > 0 ? this.pick(this.connectors) : '';
        analysisParts.push(`${connector} ${selectedContext[0]}`.trim());
      }
      if (selectedReasoning.length > 0) {
        const frame = this.pick(this.reasoningFrames);
        analysisParts.push(`${frame} ${selectedReasoning[0].toLowerCase()}`.trim());
      }
      if (analysisParts.length > 0) {
        parts.push(analysisParts.join('. ').replace(/\.\s*\./g, '.').trim() + '.');
      }
    }

    // Patient subjective, pain, vitals
    const responseItems = [];
    if (patientSubjective.trim()) {
      responseItems.push(`Patient reports: "${patientSubjective.trim()}"`);
    }
    if (painLocation.trim() && painRating.trim()) {
      responseItems.push(`Pain ${painRating}/10 at ${painLocation.trim()}`);
    } else if (painRating.trim()) {
      responseItems.push(`Pain ${painRating}/10`);
    }
    const vitalsList = [];
    if (vitals.hr) vitalsList.push(`HR ${vitals.hr}`);
    if (vitals.o2sat) vitalsList.push(`O2 Sat ${vitals.o2sat}%`);
    if (vitals.bp) vitalsList.push(`BP ${vitals.bp}`);
    if (vitalsList.length > 0) responseItems.push(`Vitals: ${vitalsList.join(', ')}`);
    if (responseItems.length > 0) parts.push(responseItems.join('. ') + '.');

    return parts.join(' ').replace(/\s+/g, ' ').replace(/\.\s*\./g, '.').trim();
  },

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  /**
   * Build goal-led format sentence
   * @private
   */
  _buildGoalLedSentence: function(params) {
    const { goalPhrase, activityStr, assistPhrases, cuePhrases, deficitPhrase, progress, tolerance, plan, data } = params;
    const parts = [];

    // Main opening sentence
    if (goalPhrase && activityStr) {
      const starter = this.pickWeighted(this.starters.goal);
      const instruction = this.pick(this.instruction);
      parts.push(`${starter} ${goalPhrase}, patient ${instruction} ${activityStr}.`);
    } else if (goalPhrase && !activityStr) {
      parts.push(`${this.pickWeighted(this.starters.goal)} ${goalPhrase}, patient [select activity]...`);
    } else if (!goalPhrase && activityStr) {
      parts.push(`${this.pick(this.starters.activity)} ${activityStr} to [select goal]...`);
    }

    // Assistance/cues with natural phrasing
    if (assistPhrases.length || cuePhrases.length) {
      const combined = [...assistPhrases, ...cuePhrases].filter(Boolean);
      if (combined.length > 0) {
        const assistVerb = this.pick(this.assistRequired);
        if (deficitPhrase) {
          const deficitIntro = this.pick(this.deficitIntro);
          parts.push(`${this.formatList(combined.map(c => this.capitalize(c)))} ${assistVerb} ${deficitIntro} ${deficitPhrase}.`);
        } else {
          parts.push(`${this.formatList(combined.map(c => this.capitalize(c)))} ${assistVerb}.`);
        }
      }
    } else if (deficitPhrase) {
      parts.push(`Limitations ${this.pick(this.deficitIntro)} ${deficitPhrase}.`);
    }

    // Progress with Docky variation
    if (progress && this.progressIntro[progress]) {
      parts.push(this.pick(this.progressIntro[progress]) + '.');
    }

    // Tolerance
    if (tolerance && data) {
      const toleranceData = data.TOLERANCE_OPTIONS.find(t => t.id === tolerance);
      if (toleranceData) {
        const intro = this.pick(this.toleranceIntro);
        parts.push(`${intro} ${toleranceData.phrase.toLowerCase()}.`);
      }
    }

    // Plan with transition
    if (plan && data) {
      const planData = data.PLAN_OPTIONS.find(p => p.id === plan);
      if (planData) {
        const transition = this.pick(this.planTransition);
        const planText = this.lowercaseFirst(planData.phrase);
        parts.push(`${transition} ${planText}.`);
      }
    }

    return parts;
  },

  /**
   * Build activity-led format sentence
   * @private
   */
  _buildActivityLedSentence: function(params) {
    const { goalPhrase, activityStr, assistPhrases, cuePhrases, deficitPhrase, progress, tolerance, plan, data } = params;
    const parts = [];

    // Main opening sentence
    if (activityStr && goalPhrase) {
      const starter = this.pickWeighted(this.starters.activity);
      let sentence = `${starter} ${activityStr}`;
      if (assistPhrases.length || cuePhrases.length) {
        const combined = [...assistPhrases, ...cuePhrases].filter(Boolean);
        sentence += ` with ${this.formatList(combined)}`;
      }
      sentence += ` to ${goalPhrase}.`;
      parts.push(sentence);
    } else if (activityStr && !goalPhrase) {
      const starter = this.pick(this.starters.activity);
      let sentence = `${starter} ${activityStr}`;
      if (assistPhrases.length || cuePhrases.length) {
        const combined = [...assistPhrases, ...cuePhrases].filter(Boolean);
        sentence += ` with ${this.formatList(combined)}`;
      }
      sentence += ` to [select goal]...`;
      parts.push(sentence);
    } else if (!activityStr && goalPhrase) {
      parts.push(`Patient performed [select activity] to ${goalPhrase}...`);
    }

    // Progress and deficit combination
    if (progress && this.progressIntro[progress]) {
      parts.push(this.pick(this.progressIntro[progress]) + '.');
      if (deficitPhrase) {
        parts.push(`Support ${this.pick(this.deficitIntro)} ${deficitPhrase}.`);
      }
    } else if (deficitPhrase) {
      parts.push(`Assistance ${this.pick(this.deficitIntro)} ${deficitPhrase}.`);
    }

    // Tolerance
    if (tolerance && data) {
      const toleranceData = data.TOLERANCE_OPTIONS.find(t => t.id === tolerance);
      if (toleranceData) {
        parts.push(`${this.pick(this.toleranceIntro)} ${toleranceData.phrase.toLowerCase()}.`);
      }
    }

    // Plan
    if (plan && data) {
      const planData = data.PLAN_OPTIONS.find(p => p.id === plan);
      if (planData) {
        const transition = this.pick(this.planTransition);
        const planText = this.lowercaseFirst(planData.phrase);
        parts.push(`${transition} ${planText}.`);
      }
    }

    return parts;
  }
};

// Export for use in browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DOCKY;
}
