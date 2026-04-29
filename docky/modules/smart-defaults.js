/**
 * DOCKY v2.0 - Smart Defaults Module
 *
 * Auto-population chains for rapid note entry.
 * When activity is selected, everything else auto-populates with smart defaults.
 */

const SmartDefaults = {
  data: null,

  /**
   * Initialize with data module
   */
  init: function(data) {
    this.data = data;
    return this;
  },

  /**
   * Get defaults for a single activity
   *
   * @param {string} activityId - Activity ID
   * @returns {Object} Defaults with suggestions and auto-selected values
   */
  getDefaults: function(activityId) {
    const defaults = this.data.smartDefaults[activityId];
    if (!defaults) {
      return this._genericDefaults();
    }

    return {
      performanceSkills: defaults.skills || [],
      suggestedAssists: defaults.assists || [],
      suggestedLocations: defaults.locations || [],
      suggestedCues: defaults.cues || [],
      suggestedGoals: defaults.goals || [],
      // Pre-select first option in each category
      autoSelected: {
        assist: defaults.assists?.[0] || 'MinA',
        location: defaults.locations?.[0] || null,
        cue: defaults.cues?.[0] || null,
        goal: defaults.goals?.[0] || null
      }
    };
  },

  /**
   * Get defaults for multiple activities (merge logic)
   *
   * @param {string[]} activityIds - Array of activity IDs
   * @returns {Object} Merged defaults
   */
  getDefaultsForMultiple: function(activityIds) {
    if (!activityIds || activityIds.length === 0) {
      return this._genericDefaults();
    }

    if (activityIds.length === 1) {
      return this.getDefaults(activityIds[0]);
    }

    // Merge defaults from all activities
    const merged = {
      performanceSkills: new Set(),
      suggestedAssists: new Set(),
      suggestedLocations: new Set(),
      suggestedCues: [],
      suggestedGoals: new Set()
    };

    for (const activityId of activityIds) {
      const defaults = this.data.smartDefaults[activityId] || {};

      (defaults.skills || []).forEach(s => merged.performanceSkills.add(s));
      (defaults.assists || []).forEach(a => merged.suggestedAssists.add(a));
      (defaults.locations || []).forEach(l => merged.suggestedLocations.add(l));
      (defaults.goals || []).forEach(g => merged.suggestedGoals.add(g));

      // Cues need special handling (objects)
      for (const cue of (defaults.cues || [])) {
        const exists = merged.suggestedCues.some(
          c => c.type === cue.type && c.purpose === cue.purpose
        );
        if (!exists) {
          merged.suggestedCues.push(cue);
        }
      }
    }

    // Convert sets back to arrays
    const result = {
      performanceSkills: Array.from(merged.performanceSkills),
      suggestedAssists: Array.from(merged.suggestedAssists),
      suggestedLocations: Array.from(merged.suggestedLocations),
      suggestedCues: merged.suggestedCues,
      suggestedGoals: Array.from(merged.suggestedGoals),
      autoSelected: {
        assist: Array.from(merged.suggestedAssists)[0] || 'MinA',
        location: Array.from(merged.suggestedLocations)[0] || null,
        cue: merged.suggestedCues[0] || null,
        goal: Array.from(merged.suggestedGoals)[0] || null
      }
    };

    return result;
  },

  /**
   * Generic defaults when no activity-specific defaults exist
   */
  _genericDefaults: function() {
    return {
      performanceSkills: ['stabilizes', 'endures'],
      suggestedAssists: ['MinA', 'ModA', 'CGA'],
      suggestedLocations: ['trunk'],
      suggestedCues: [{ type: 'verbal', purpose: 'safety' }],
      suggestedGoals: ['Improve functional performance'],
      autoSelected: {
        assist: 'MinA',
        location: 'trunk',
        cue: { type: 'verbal', purpose: 'safety' },
        goal: 'Improve functional performance'
      }
    };
  },

  /**
   * Auto-populate entire note from single activity selection
   *
   * @param {string} activityId - Activity ID
   * @returns {Object} Complete note parameters ready for engine.generate()
   */
  autoPopulate: function(activityId) {
    const defaults = this.getDefaults(activityId);
    return {
      activities: [activityId],
      performanceSkills: defaults.performanceSkills.slice(0, 3), // Top 3
      assist: defaults.autoSelected.assist,
      location: defaults.autoSelected.location,
      cues: defaults.autoSelected.cue ? [defaults.autoSelected.cue] : [],
      goal: defaults.autoSelected.goal,
      tolerance: 'well',
      progress: 'progressing',
      plan: 'continue'
    };
  },

  /**
   * Auto-populate from multiple activities
   *
   * @param {string[]} activityIds - Array of activity IDs
   * @returns {Object} Complete note parameters
   */
  autoPopulateMultiple: function(activityIds) {
    if (!activityIds || activityIds.length === 0) {
      return null;
    }

    const defaults = this.getDefaultsForMultiple(activityIds);
    return {
      activities: activityIds,
      performanceSkills: defaults.performanceSkills.slice(0, 4), // Top 4 for multiple
      assist: defaults.autoSelected.assist,
      location: defaults.autoSelected.location,
      cues: defaults.autoSelected.cue ? [defaults.autoSelected.cue] : [],
      goal: defaults.autoSelected.goal,
      tolerance: 'well',
      progress: 'progressing',
      plan: 'continue'
    };
  },

  /**
   * Get related activities that commonly go together
   *
   * @param {string} activityId - Base activity ID
   * @returns {string[]} Array of related activity IDs
   */
  getRelatedActivities: function(activityId) {
    const relationships = {
      // Transfers
      'sit-stand': ['stand-pivot', 'toilet-transfer'],
      'stand-pivot': ['sit-stand', 'bed-wc'],
      'toilet-transfer': ['toileting', 'sit-stand'],
      'tub-transfer': ['bathing', 'standing-balance'],
      'bed-wc': ['supine-sit', 'stand-pivot'],
      'car-transfer': ['standing-balance', 'sit-stand'],

      // ADLs
      'dressing-ub': ['dressing-lb', 'grooming'],
      'dressing-lb': ['dressing-ub', 'sitting-balance'],
      'bathing': ['tub-transfer', 'standing-balance'],
      'toileting': ['toilet-transfer', 'toilet-hygiene'],
      'toilet-hygiene': ['toileting', 'sitting-balance'],
      'grooming': ['standing-balance', 'ue-strength'],
      'self-feeding': ['sitting-balance', 'fine-motor'],
      'functional-mobility': ['standing-balance', 'dynamic-balance'],
      'personal-hygiene': ['grooming', 'standing-balance'],

      // Bed Mobility
      'supine-sit': ['rolling', 'bed-wc'],
      'rolling': ['supine-sit', 'scooting'],
      'scooting': ['rolling', 'supine-sit'],

      // Balance
      'sitting-balance': ['standing-balance', 'supine-sit'],
      'standing-balance': ['sitting-balance', 'dynamic-balance'],
      'dynamic-balance': ['standing-balance', 'functional-mobility'],

      // Exercise
      'ue-strength': ['core-strength', 'fine-motor'],
      'le-strength': ['core-strength', 'standing-balance'],
      'core-strength': ['sitting-balance', 'standing-balance'],
      'arom': ['aarom', 'ue-strength'],
      'prom': ['aarom'],
      'aarom': ['arom', 'prom'],
      'fine-motor': ['ue-strength', 'self-feeding'],

      // IADLs
      'meal-prep': ['standing-balance', 'functional-mobility'],
      'med-mgmt': ['fine-motor', 'sitting-balance'],
      'light-housekeeping': ['standing-balance', 'functional-mobility']
    };

    return relationships[activityId] || [];
  },

  /**
   * Get activity category groups for quick selection
   *
   * @returns {Object} Categories with activity IDs
   */
  getActivityGroups: function() {
    const groups = {};
    for (const [categoryId, category] of Object.entries(this.data.occupations)) {
      groups[categoryId] = {
        label: category.label,
        activities: category.activities.map(a => a.id)
      };
    }
    return groups;
  },

  /**
   * Suggest goal based on activities
   *
   * @param {string[]} activityIds - Selected activities
   * @returns {string} Suggested goal
   */
  suggestGoal: function(activityIds) {
    if (!activityIds || activityIds.length === 0) {
      return 'Improve functional performance';
    }

    // Check activity categories for goal suggestion
    const categories = new Set();
    for (const activityId of activityIds) {
      const activity = this.data.findActivity(activityId);
      if (activity) {
        categories.add(activity.category);
      }
    }

    // Generate goal based on categories
    if (categories.has('ADLs')) {
      return 'Increase independence with ADLs';
    }
    if (categories.has('Transfers')) {
      return 'Improve transfer safety and independence';
    }
    if (categories.has('Bed Mobility')) {
      return 'Improve bed mobility';
    }
    if (categories.has('Balance Training')) {
      return 'Improve balance and reduce fall risk';
    }
    if (categories.has('Therapeutic Exercise')) {
      return 'Improve strength and functional capacity';
    }
    if (categories.has('IADLs')) {
      return 'Increase independence with IADLs';
    }

    return 'Improve functional performance';
  },

  /**
   * Suggest assist level based on FIM score target
   *
   * @param {number} targetFim - Target FIM score (1-7)
   * @returns {string} Suggested assist level ID
   */
  suggestAssistByFim: function(targetFim) {
    const fimToAssist = {
      7: 'I',
      6: 'ModI',
      5: 'S', // or CGA
      4: 'MinA',
      3: 'ModA',
      2: 'MaxA',
      1: 'Dep'
    };
    return fimToAssist[targetFim] || 'MinA';
  }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SmartDefaults;
}
if (typeof window !== 'undefined') {
  window.SmartDefaults = SmartDefaults;
}
