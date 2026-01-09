/**
 * DOCKY Generator
 *
 * Main note generation logic. Depends on DockyPhrases and DockyUtils.
 * Generates natural, varied clinical notes based on input parameters.
 */

const DockyGenerator = {
  // References to dependencies (set by DOCKY main module)
  phrases: null,
  utils: null,

  /**
   * Initialize generator with dependencies
   * @param {Object} phrases - DockyPhrases module
   * @param {Object} utils - DockyUtils module
   */
  init: function(phrases, utils) {
    this.phrases = phrases;
    this.utils = utils;
  },

  /**
   * Generate a clinical note with natural variation
   * @param {Object} params - Note parameters
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
    const activityStr = this._buildActivityString(selectedActivities, activityParams);

    // Get goal phrase
    const goalPhrase = goal ? data.GOALS.find(g => g.id === goal)?.phrase : '';

    // Build assist and cue phrases
    const assistPhrases = this._buildAssistPhrases(assists, data);
    const cuePhrases = this._buildCuePhrases(cues);
    const deficitPhrase = deficit ? this.utils.lowercaseFirst(deficit) : '';

    // Build main sentence based on output style
    const sentenceParams = {
      goalPhrase,
      activityStr,
      assistPhrases,
      cuePhrases,
      deficitPhrase,
      progress,
      tolerance,
      plan,
      data
    };

    if (outputStyle === 'goal') {
      parts.push(...this._buildGoalLedSentence(sentenceParams));
    } else {
      parts.push(...this._buildActivityLedSentence(sentenceParams));
    }

    // Add clinical analysis
    this._addClinicalAnalysis(parts, selectedPerformance, selectedContext, selectedReasoning);

    // Add patient response data
    this._addPatientResponse(parts, patientSubjective, painLocation, painRating, vitals);

    return parts.join(' ').replace(/\s+/g, ' ').replace(/\.\s*\./g, '.').trim();
  },

  /**
   * Build activity string with parameters
   * @private
   */
  _buildActivityString: function(selectedActivities, activityParams) {
    if (selectedActivities.length === 0) return '';

    let activityStr = this.utils.formatList(selectedActivities);
    const paramsList = [];

    if (activityParams.sets && activityParams.reps) {
      paramsList.push(`${activityParams.sets}x${activityParams.reps}`);
    } else if (activityParams.sets) {
      paramsList.push(`${activityParams.sets} sets`);
    } else if (activityParams.reps) {
      paramsList.push(`${activityParams.reps} reps`);
    }

    if (activityParams.equipment) {
      paramsList.push(activityParams.equipment.toLowerCase());
    }

    if (paramsList.length) {
      activityStr += ` (${paramsList.join(', ')})`;
    }

    return activityStr;
  },

  /**
   * Build assist phrases with natural variation
   * @private
   */
  _buildAssistPhrases: function(assists, data) {
    return assists.map(a => {
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
  },

  /**
   * Build cue phrases
   * @private
   */
  _buildCuePhrases: function(cues) {
    return cues.map(c => {
      let phrase = `${c.level} ${c.type} cues`;
      if (c.bodyPart) phrase += ` to ${c.bodyPart}`;
      if (c.purpose) phrase += ` for ${c.purpose}`;
      if (c.context) phrase += ` during ${c.context}`;
      return phrase.toLowerCase();
    });
  },

  /**
   * Build goal-led format sentence
   * @private
   */
  _buildGoalLedSentence: function(params) {
    const { goalPhrase, activityStr, assistPhrases, cuePhrases, deficitPhrase, progress, tolerance, plan, data } = params;
    const parts = [];

    // Main opening sentence
    if (goalPhrase && activityStr) {
      const starter = this.utils.pickWeighted(this.phrases.starters.goal);
      const instruction = this.utils.pick(this.phrases.instruction);
      parts.push(`${starter} ${goalPhrase}, patient ${instruction} ${activityStr}.`);
    } else if (goalPhrase && !activityStr) {
      parts.push(`${this.utils.pickWeighted(this.phrases.starters.goal)} ${goalPhrase}, patient [select activity]...`);
    } else if (!goalPhrase && activityStr) {
      parts.push(`${this.utils.pick(this.phrases.starters.activity)} ${activityStr} to [select goal]...`);
    }

    // Assistance/cues with natural phrasing
    if (assistPhrases.length || cuePhrases.length) {
      const combined = [...assistPhrases, ...cuePhrases].filter(Boolean);
      if (combined.length > 0) {
        const assistVerb = this.utils.pick(this.phrases.assistRequired);
        const capitalizedCombined = combined.map(c => this.utils.capitalize(c));
        parts.push(`${this.utils.formatList(capitalizedCombined)} ${assistVerb}.`);
      }
    }

    // Deficit as separate sentence for clarity
    if (deficitPhrase) {
      parts.push(`Intervention addressed ${deficitPhrase}.`);
    }

    // Progress
    if (progress && this.phrases.progressIntro[progress]) {
      parts.push(this.utils.pick(this.phrases.progressIntro[progress]) + '.');
    }

    // Tolerance
    if (tolerance && data) {
      const toleranceData = data.TOLERANCE_OPTIONS.find(t => t.id === tolerance);
      if (toleranceData) {
        const intro = this.utils.pick(this.phrases.toleranceIntro);
        parts.push(`${intro} ${toleranceData.phrase.toLowerCase()}.`);
      }
    }

    // Plan
    if (plan && data) {
      const planData = data.PLAN_OPTIONS.find(p => p.id === plan);
      if (planData) {
        const transition = this.utils.pick(this.phrases.planTransition);
        const planText = this.utils.lowercaseFirst(planData.phrase);
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
      const starter = this.utils.pickWeighted(this.phrases.starters.activity);
      let sentence = `${starter} ${activityStr}`;
      if (assistPhrases.length || cuePhrases.length) {
        const combined = [...assistPhrases, ...cuePhrases].filter(Boolean);
        sentence += ` with ${this.utils.formatList(combined)}`;
      }
      sentence += ` to ${goalPhrase}.`;
      parts.push(sentence);
    } else if (activityStr && !goalPhrase) {
      const starter = this.utils.pick(this.phrases.starters.activity);
      let sentence = `${starter} ${activityStr}`;
      if (assistPhrases.length || cuePhrases.length) {
        const combined = [...assistPhrases, ...cuePhrases].filter(Boolean);
        sentence += ` with ${this.utils.formatList(combined)}`;
      }
      sentence += ` to [select goal]...`;
      parts.push(sentence);
    } else if (!activityStr && goalPhrase) {
      parts.push(`Patient performed [select activity] to ${goalPhrase}...`);
    }

    // Deficit as separate clear sentence
    if (deficitPhrase) {
      parts.push(`Treatment addressed ${deficitPhrase}.`);
    }

    // Progress
    if (progress && this.phrases.progressIntro[progress]) {
      parts.push(this.utils.pick(this.phrases.progressIntro[progress]) + '.');
    }

    // Tolerance
    if (tolerance && data) {
      const toleranceData = data.TOLERANCE_OPTIONS.find(t => t.id === tolerance);
      if (toleranceData) {
        parts.push(`${this.utils.pick(this.phrases.toleranceIntro)} ${toleranceData.phrase.toLowerCase()}.`);
      }
    }

    // Plan
    if (plan && data) {
      const planData = data.PLAN_OPTIONS.find(p => p.id === plan);
      if (planData) {
        const transition = this.utils.pick(this.phrases.planTransition);
        const planText = this.utils.lowercaseFirst(planData.phrase);
        parts.push(`${transition} ${planText}.`);
      }
    }

    return parts;
  },

  /**
   * Add clinical analysis to parts
   * @private
   */
  _addClinicalAnalysis: function(parts, selectedPerformance, selectedContext, selectedReasoning) {
    if (selectedPerformance.length === 0 && selectedContext.length === 0 && selectedReasoning.length === 0) {
      return;
    }

    const analysisParts = [];

    if (selectedPerformance.length > 0) {
      analysisParts.push(`Patient demonstrated ${this.utils.formatList(selectedPerformance)} performance`);
    }

    if (selectedContext.length > 0) {
      const connector = analysisParts.length > 0 ? this.utils.pick(this.phrases.connectors) : '';
      analysisParts.push(`${connector} ${selectedContext[0]}`.trim());
    }

    if (selectedReasoning.length > 0) {
      const frame = this.utils.pick(this.phrases.reasoningFrames);
      analysisParts.push(`${frame} ${selectedReasoning[0].toLowerCase()}`.trim());
    }

    if (analysisParts.length > 0) {
      parts.push(analysisParts.join('. ').replace(/\.\s*\./g, '.').trim() + '.');
    }
  },

  /**
   * Add patient response data to parts
   * @private
   */
  _addPatientResponse: function(parts, patientSubjective, painLocation, painRating, vitals) {
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
    if (vitalsList.length > 0) {
      responseItems.push(`Vitals: ${vitalsList.join(', ')}`);
    }

    if (responseItems.length > 0) {
      parts.push(responseItems.join('. ') + '.');
    }
  }
};

// Export for browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DockyGenerator;
}
