/**
 * DOCKY v2.0 - Note Generation Engine
 *
 * Generates Medicare-compliant clinical notes from structured parameters.
 * Focuses on Performance Skills Model (OTPF-4).
 */

const DockyEngine = {
  data: null,

  /**
   * Initialize engine with data module
   */
  init: function(data) {
    this.data = data;
    return this;
  },

  /**
   * Generate a clinical note from parameters
   *
   * @param {Object} params - Note parameters
   * @param {string[]} params.activities - Activity IDs
   * @param {string[]} params.performanceSkills - Performance skill IDs
   * @param {string} params.assist - Assist level ID
   * @param {string} params.location - Assist location ID
   * @param {Object[]} params.cues - Array of { type, purpose } objects
   * @param {string} params.goal - Goal text
   * @param {string} params.tolerance - Tolerance ID
   * @param {string} params.progress - Progress ID
   * @param {string} params.plan - Plan ID
   * @param {Object} params.partB - Optional Part B expansion data
   * @returns {string} Generated clinical note
   */
  generate: function(params) {
    const {
      activities,
      performanceSkills,
      assist,
      location,
      cues,
      goal,
      tolerance,
      progress,
      plan,
      partB
    } = params;

    const sentences = [];

    // ─────────────────────────────────────────────────────────────
    // SENTENCE 1: Activity + Assist + Goal
    // ─────────────────────────────────────────────────────────────
    const activityLabels = (activities || []).map(id =>
      this._findActivityLabel(id)
    ).filter(Boolean);

    if (activityLabels.length > 0) {
      const activityStr = this._formatList(activityLabels);
      const assistData = this.data.assistLevels.find(a => a.id === assist);
      const assistPhrase = assistData?.phrase || '';
      const locationData = this.data.assistLocations.find(l => l.id === location);
      const locationPhrase = locationData?.label || '';

      let opening = `Patient participated in ${activityStr}`;
      if (assistPhrase) {
        opening += ` ${assistPhrase}`;
      }
      if (locationPhrase) {
        opening += ` ${locationPhrase}`;
      }
      if (goal) {
        opening += ` to ${goal.toLowerCase()}`;
      }
      opening += '.';
      sentences.push(opening);
    }

    // ─────────────────────────────────────────────────────────────
    // SENTENCE 2: Cues (if any)
    // ─────────────────────────────────────────────────────────────
    if (cues && cues.length > 0) {
      const cueStrs = cues.map(c => {
        const type = this.data.cueTypes.find(t => t.id === c.type);
        const purpose = this.data.cuePurposes.find(p => p.id === c.purpose);
        return `${type?.label || c.type} cues ${purpose?.label || ''}`.trim();
      });
      sentences.push(`${this._formatList(cueStrs)} provided.`);
    }

    // ─────────────────────────────────────────────────────────────
    // SENTENCE 3: Performance Skills Addressed
    // ─────────────────────────────────────────────────────────────
    if (performanceSkills && performanceSkills.length > 0) {
      const skillLabels = performanceSkills.map(id => {
        const skill = this.data.findSkill(id);
        return skill ? skill.label.toLowerCase() : null;
      }).filter(Boolean);

      if (skillLabels.length > 0) {
        const skillCategory = this._categorizeSkills(performanceSkills);
        sentences.push(`Activity addressed ${skillCategory} skills including: ${this._formatList(skillLabels)}.`);
      }
    }

    // ─────────────────────────────────────────────────────────────
    // SENTENCE 4: Tolerance
    // ─────────────────────────────────────────────────────────────
    if (tolerance) {
      const tolData = this.data.tolerance.find(t => t.id === tolerance);
      if (tolData) {
        sentences.push(tolData.phrase);
      }
    }

    // ─────────────────────────────────────────────────────────────
    // SENTENCE 5: Progress
    // ─────────────────────────────────────────────────────────────
    if (progress) {
      const progData = this.data.progress.find(p => p.id === progress);
      if (progData) {
        sentences.push(progData.phrase);
      }
    }

    // ─────────────────────────────────────────────────────────────
    // SENTENCE 6: Plan
    // ─────────────────────────────────────────────────────────────
    if (plan) {
      const planData = this.data.plan.find(p => p.id === plan);
      if (planData) {
        sentences.push(planData.phrase);
      }
    }

    // ─────────────────────────────────────────────────────────────
    // PART B EXPANSION (if enabled)
    // ─────────────────────────────────────────────────────────────
    if (partB) {
      const partBSentences = this._generatePartB(partB);
      sentences.push(...partBSentences);
    }

    return sentences.join(' ');
  },

  /**
   * Generate multiple notes in batch mode
   *
   * @param {Object[]} paramsList - Array of note parameters
   * @returns {string[]} Array of generated notes
   */
  generateBatch: function(paramsList) {
    return paramsList.map(params => this.generate(params));
  },

  /**
   * Generate Part B expansion sentences
   */
  _generatePartB: function(partB) {
    const sentences = [];

    if (partB.skilledService) {
      sentences.push(`Skilled OT services required: ${partB.skilledService}.`);
    }

    if (partB.medicalNecessity) {
      sentences.push(partB.medicalNecessity);
    }

    if (partB.plof) {
      sentences.push(`PLOF: ${partB.plof}.`);
    }

    if (partB.dischargePlan) {
      sentences.push(`D/C plan: ${partB.dischargePlan}.`);
    }

    if (partB.goalWithTimeframe) {
      const { action, assistLevel, timeframe } = partB.goalWithTimeframe;
      if (action && assistLevel && timeframe) {
        const assistData = this.data.assistLevels.find(a => a.id === assistLevel);
        const assistLabel = assistData?.label || assistLevel;
        sentences.push(`Goal: Patient will ${action} ${assistData?.phrase || 'with ' + assistLabel} within ${timeframe}.`);
      }
    }

    return sentences;
  },

  /**
   * Find activity label by ID
   */
  _findActivityLabel: function(activityId) {
    const activity = this.data.findActivity(activityId);
    return activity ? activity.label : null;
  },

  /**
   * Categorize skills by type (motor/process/social)
   */
  _categorizeSkills: function(skillIds) {
    const categories = new Set();

    for (const skillId of skillIds) {
      // Check motor skills
      if (this.data.performanceSkills.motor.skills.some(s => s.id === skillId)) {
        categories.add('motor');
      }
      // Check process skills
      if (this.data.performanceSkills.process.skills.some(s => s.id === skillId)) {
        categories.add('process');
      }
      // Check social skills
      if (this.data.performanceSkills.social.skills.some(s => s.id === skillId)) {
        categories.add('social');
      }
    }

    const categoryList = Array.from(categories);
    if (categoryList.length === 0) return 'performance';
    if (categoryList.length === 1) return categoryList[0];
    if (categoryList.length === 2) return `${categoryList[0]}/${categoryList[1]}`;
    return 'motor/process/social';
  },

  /**
   * Format a list of items with proper grammar
   * @param {string[]} items - Items to format
   * @returns {string} Formatted list
   */
  _formatList: function(items) {
    if (!items || items.length === 0) return '';
    const filtered = items.filter(i => i != null && i !== '');
    if (filtered.length === 0) return '';
    if (filtered.length === 1) return filtered[0];
    if (filtered.length === 2) return `${filtered[0]} and ${filtered[1]}`;
    return `${filtered.slice(0, -1).join(', ')}, and ${filtered[filtered.length - 1]}`;
  },

  /**
   * Generate SOAP format note
   *
   * @param {Object} params - Note parameters plus SOAP-specific fields
   * @returns {Object} { subjective, objective, assessment, plan }
   */
  generateSOAP: function(params) {
    const {
      subjective,
      activities,
      performanceSkills,
      assist,
      location,
      cues,
      goal,
      tolerance,
      progress,
      plan
    } = params;

    // Subjective
    const sSection = subjective || 'Patient reports readiness to participate in therapy.';

    // Objective
    const oSentences = [];
    const activityLabels = (activities || []).map(id =>
      this._findActivityLabel(id)
    ).filter(Boolean);

    if (activityLabels.length > 0) {
      const activityStr = this._formatList(activityLabels);
      const assistData = this.data.assistLevels.find(a => a.id === assist);
      const assistPhrase = assistData?.phrase || '';
      const locationData = this.data.assistLocations.find(l => l.id === location);
      const locationPhrase = locationData?.label || '';

      let objLine = `Patient participated in ${activityStr}`;
      if (assistPhrase) objLine += ` ${assistPhrase}`;
      if (locationPhrase) objLine += ` ${locationPhrase}`;
      objLine += '.';
      oSentences.push(objLine);
    }

    if (cues && cues.length > 0) {
      const cueStrs = cues.map(c => {
        const type = this.data.cueTypes.find(t => t.id === c.type);
        const purpose = this.data.cuePurposes.find(p => p.id === c.purpose);
        return `${type?.label || c.type} cues ${purpose?.label || ''}`.trim();
      });
      oSentences.push(`${this._formatList(cueStrs)} provided.`);
    }

    if (performanceSkills && performanceSkills.length > 0) {
      const skillLabels = performanceSkills.map(id => {
        const skill = this.data.findSkill(id);
        return skill ? skill.label.toLowerCase() : null;
      }).filter(Boolean);

      if (skillLabels.length > 0) {
        oSentences.push(`Addressed: ${this._formatList(skillLabels)}.`);
      }
    }

    if (tolerance) {
      const tolData = this.data.tolerance.find(t => t.id === tolerance);
      if (tolData) oSentences.push(tolData.phrase);
    }

    const oSection = oSentences.join(' ');

    // Assessment
    const aSentences = [];
    if (progress) {
      const progData = this.data.progress.find(p => p.id === progress);
      if (progData) aSentences.push(progData.phrase);
    }
    if (goal) {
      aSentences.push(`Working toward: ${goal}.`);
    }
    const aSection = aSentences.join(' ');

    // Plan
    const pSentences = [];
    if (plan) {
      const planData = this.data.plan.find(p => p.id === plan);
      if (planData) pSentences.push(planData.phrase);
    }
    const pSection = pSentences.join(' ');

    return {
      subjective: sSection,
      objective: oSection,
      assessment: aSection,
      plan: pSection,
      formatted: `S: ${sSection}\nO: ${oSection}\nA: ${aSection}\nP: ${pSection}`
    };
  },

  /**
   * Generate DAP format note
   *
   * @param {Object} params - Note parameters
   * @returns {Object} { data, assessment, plan }
   */
  generateDAP: function(params) {
    const soap = this.generateSOAP(params);

    return {
      data: `${soap.subjective} ${soap.objective}`,
      assessment: soap.assessment,
      plan: soap.plan,
      formatted: `D: ${soap.subjective} ${soap.objective}\nA: ${soap.assessment}\nP: ${soap.plan}`
    };
  },

  /**
   * Parse shorthand input and generate note
   * Example: "sts mina trunk vc safety tw imp cont"
   *
   * @param {string} shorthand - Space-separated shorthand codes
   * @returns {Object} Parsed parameters ready for generate()
   */
  parseShorthand: function(shorthand) {
    const tokens = shorthand.toLowerCase().split(/\s+/);
    const params = {
      activities: [],
      performanceSkills: [],
      assist: null,
      location: null,
      cues: [],
      goal: null,
      tolerance: null,
      progress: null,
      plan: null
    };

    let pendingCueType = null;

    for (const token of tokens) {
      // Check activities
      if (this.data.shortcuts.activities[token]) {
        params.activities.push(this.data.shortcuts.activities[token]);
        continue;
      }

      // Check assist levels
      if (this.data.shortcuts.assist[token]) {
        params.assist = this.data.shortcuts.assist[token];
        continue;
      }

      // Check locations
      const locationMatch = this.data.assistLocations.find(l =>
        l.id === token || l.label.toLowerCase().includes(token)
      );
      if (locationMatch) {
        params.location = locationMatch.id;
        continue;
      }

      // Check cue types
      if (this.data.shortcuts.cueTypes[token]) {
        pendingCueType = this.data.shortcuts.cueTypes[token];
        continue;
      }

      // Check cue purposes (if we have a pending cue type)
      const purposeMatch = this.data.cuePurposes.find(p =>
        p.id === token || p.label.toLowerCase().includes(token)
      );
      if (purposeMatch && pendingCueType) {
        params.cues.push({ type: pendingCueType, purpose: purposeMatch.id });
        pendingCueType = null;
        continue;
      }

      // Check tolerance
      if (this.data.shortcuts.tolerance[token]) {
        params.tolerance = this.data.shortcuts.tolerance[token];
        continue;
      }

      // Check progress
      if (this.data.shortcuts.progress[token]) {
        params.progress = this.data.shortcuts.progress[token];
        continue;
      }

      // Check plan
      if (this.data.shortcuts.plan[token]) {
        params.plan = this.data.shortcuts.plan[token];
        continue;
      }
    }

    // If we have activities but no goal, use smart defaults
    if (params.activities.length > 0 && !params.goal) {
      const firstActivity = params.activities[0];
      const defaults = this.data.smartDefaults[firstActivity];
      if (defaults && defaults.goals && defaults.goals.length > 0) {
        params.goal = defaults.goals[0];
      }
    }

    // If we have activities but no skills, use smart defaults
    if (params.activities.length > 0 && params.performanceSkills.length === 0) {
      const firstActivity = params.activities[0];
      const defaults = this.data.smartDefaults[firstActivity];
      if (defaults && defaults.skills) {
        params.performanceSkills = defaults.skills.slice(0, 3);
      }
    }

    return params;
  },

  /**
   * Generate note from shorthand input
   *
   * @param {string} shorthand - Space-separated shorthand codes
   * @returns {string} Generated clinical note
   */
  generateFromShorthand: function(shorthand) {
    const params = this.parseShorthand(shorthand);
    return this.generate(params);
  }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DockyEngine;
}
