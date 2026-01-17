/**
 * DOCKY v2.0 - Quick Notes Module
 *
 * Pre-built note templates for the most common scenarios.
 * Target: 1-2 clicks for standard notes.
 */

const QuickNotes = {
  /**
   * Pre-built templates for common session types
   */
  templates: [
    {
      id: 'standard-adl',
      name: 'Standard ADL Session',
      description: 'ADL training, MinA, progressing',
      category: 'adl',
      template: {
        activities: ['dressing-ub', 'dressing-lb', 'grooming'],
        performanceSkills: ['reaches', 'grips', 'manipulates', 'sequences'],
        assist: 'MinA',
        location: 'trunk',
        cues: [{ type: 'verbal', purpose: 'sequencing' }],
        goal: 'Increase independence with ADLs',
        tolerance: 'well',
        progress: 'progressing',
        plan: 'continue'
      }
    },
    {
      id: 'transfer-training',
      name: 'Transfer Training',
      description: 'STS + pivot transfers, CGA',
      category: 'transfers',
      template: {
        activities: ['sit-stand', 'stand-pivot'],
        performanceSkills: ['stabilizes', 'positions', 'coordinates', 'paces'],
        assist: 'CGA',
        location: 'gait-belt',
        cues: [{ type: 'verbal', purpose: 'safety' }, { type: 'verbal', purpose: 'weight-shift' }],
        goal: 'Improve transfer safety',
        tolerance: 'well',
        progress: 'improved',
        plan: 'decrease-assist'
      }
    },
    {
      id: 'bed-mobility',
      name: 'Bed Mobility',
      description: 'Supine-sit, rolling, repositioning',
      category: 'bed-mobility',
      template: {
        activities: ['supine-sit', 'rolling', 'scooting'],
        performanceSkills: ['stabilizes', 'coordinates', 'sequences', 'initiates'],
        assist: 'MinA',
        location: 'trunk',
        cues: [{ type: 'verbal', purpose: 'sequencing' }],
        goal: 'Improve bed mobility',
        tolerance: 'well',
        progress: 'progressing',
        plan: 'continue'
      }
    },
    {
      id: 'balance-safety',
      name: 'Balance & Safety',
      description: 'Balance training, fall prevention',
      category: 'balance',
      template: {
        activities: ['sitting-balance', 'standing-balance'],
        performanceSkills: ['stabilizes', 'adjusts', 'endures'],
        assist: 'CGA',
        location: 'trunk',
        cues: [{ type: 'verbal', purpose: 'weight-shift' }, { type: 'verbal', purpose: 'safety' }],
        goal: 'Improve balance and reduce fall risk',
        tolerance: 'well',
        progress: 'improved',
        plan: 'progress'
      }
    },
    {
      id: 'ther-ex',
      name: 'Therapeutic Exercise',
      description: 'UE/Core strengthening',
      category: 'exercise',
      template: {
        activities: ['ue-strength', 'core-strength'],
        performanceSkills: ['grips', 'reaches', 'stabilizes', 'calibrates'],
        assist: 'S',
        location: null,
        cues: [{ type: 'verbal', purpose: 'technique' }],
        goal: 'Improve strength for functional activities',
        tolerance: 'min-fatigue',
        progress: 'progressing',
        plan: 'continue'
      }
    },
    {
      id: 'bathing-session',
      name: 'Bathing Session',
      description: 'Bathing + tub transfer',
      category: 'adl',
      template: {
        activities: ['bathing', 'tub-transfer'],
        performanceSkills: ['reaches', 'stabilizes', 'sequences', 'heeds'],
        assist: 'CGA',
        location: 'trunk',
        cues: [{ type: 'verbal', purpose: 'safety' }, { type: 'verbal', purpose: 'pacing' }],
        goal: 'Improve safety and independence with bathing',
        tolerance: 'well',
        progress: 'progressing',
        plan: 'continue'
      }
    },
    {
      id: 'toileting-session',
      name: 'Toileting Session',
      description: 'Toileting + toilet transfer',
      category: 'adl',
      template: {
        activities: ['toileting', 'toilet-transfer', 'toilet-hygiene'],
        performanceSkills: ['stabilizes', 'positions', 'sequences', 'manipulates'],
        assist: 'MinA',
        location: 'trunk',
        cues: [{ type: 'verbal', purpose: 'safety' }],
        goal: 'Improve safety and independence with toileting',
        tolerance: 'well',
        progress: 'progressing',
        plan: 'continue'
      }
    },
    {
      id: 'fine-motor-adl',
      name: 'Fine Motor/Self-Care',
      description: 'Fine motor + feeding/grooming',
      category: 'adl',
      template: {
        activities: ['fine-motor', 'self-feeding', 'grooming'],
        performanceSkills: ['grips', 'manipulates', 'coordinates', 'calibrates'],
        assist: 'S',
        location: 'bilat-ue',
        cues: [{ type: 'verbal', purpose: 'technique' }],
        goal: 'Improve fine motor coordination for ADLs',
        tolerance: 'well',
        progress: 'progressing',
        plan: 'continue'
      }
    },
    {
      id: 'dynamic-balance',
      name: 'Dynamic Balance Training',
      description: 'Dynamic balance + functional mobility',
      category: 'balance',
      template: {
        activities: ['dynamic-balance', 'functional-mobility'],
        performanceSkills: ['stabilizes', 'adjusts', 'navigates', 'endures'],
        assist: 'CGA',
        location: 'gait-belt',
        cues: [{ type: 'verbal', purpose: 'weight-shift' }, { type: 'verbal', purpose: 'safety' }],
        goal: 'Improve dynamic balance for functional mobility',
        tolerance: 'well',
        progress: 'improved',
        plan: 'progress'
      }
    },
    {
      id: 'iadl-session',
      name: 'IADL Session',
      description: 'Meal prep + med management',
      category: 'iadl',
      template: {
        activities: ['meal-prep', 'med-mgmt'],
        performanceSkills: ['sequences', 'organizes', 'attends', 'heeds'],
        assist: 'S',
        location: null,
        cues: [{ type: 'verbal', purpose: 'sequencing' }, { type: 'verbal', purpose: 'safety' }],
        goal: 'Increase independence with IADLs',
        tolerance: 'well',
        progress: 'progressing',
        plan: 'continue'
      }
    },
    {
      id: 'initial-eval-followup',
      name: 'Baseline Session',
      description: 'First session after eval',
      category: 'general',
      template: {
        activities: ['sit-stand', 'standing-balance'],
        performanceSkills: ['stabilizes', 'positions', 'endures'],
        assist: 'MinA',
        location: 'trunk',
        cues: [{ type: 'verbal', purpose: 'safety' }],
        goal: 'Establish baseline for treatment',
        tolerance: 'well',
        progress: 'baseline',
        plan: 'continue'
      }
    },
    {
      id: 'discharge-prep',
      name: 'Discharge Preparation',
      description: 'Focus on d/c goals',
      category: 'general',
      template: {
        activities: ['sit-stand', 'functional-mobility', 'dressing-ub', 'dressing-lb'],
        performanceSkills: ['stabilizes', 'sequences', 'endures', 'navigates'],
        assist: 'S',
        location: null,
        cues: [{ type: 'verbal', purpose: 'safety' }],
        goal: 'Prepare for safe discharge',
        tolerance: 'well',
        progress: 'progressing',
        plan: 'dc-planning'
      }
    }
  ],

  /**
   * Get all templates
   *
   * @returns {Object[]} All templates
   */
  getAll: function() {
    return this.templates;
  },

  /**
   * Get templates by category
   *
   * @param {string} category - Category name
   * @returns {Object[]} Filtered templates
   */
  getByCategory: function(category) {
    return this.templates.filter(t => t.category === category);
  },

  /**
   * Get a specific template by ID
   *
   * @param {string} templateId - Template ID
   * @returns {Object|null} Template or null
   */
  get: function(templateId) {
    return this.templates.find(t => t.id === templateId) || null;
  },

  /**
   * Generate note parameters from template with optional overrides
   *
   * @param {string} templateId - Template ID
   * @param {Object} overrides - Optional parameter overrides
   * @returns {Object|null} Note parameters or null
   */
  generate: function(templateId, overrides = {}) {
    const template = this.get(templateId);
    if (!template) return null;

    // Deep merge template with overrides
    const result = { ...template.template };

    for (const key of Object.keys(overrides)) {
      if (overrides[key] !== undefined) {
        result[key] = overrides[key];
      }
    }

    return result;
  },

  /**
   * Get template categories
   *
   * @returns {Object[]} Array of { id, label, count }
   */
  getCategories: function() {
    const counts = {};
    for (const template of this.templates) {
      counts[template.category] = (counts[template.category] || 0) + 1;
    }

    const categoryLabels = {
      'adl': 'ADLs',
      'transfers': 'Transfers',
      'bed-mobility': 'Bed Mobility',
      'balance': 'Balance',
      'exercise': 'Exercise',
      'iadl': 'IADLs',
      'general': 'General'
    };

    return Object.keys(counts).map(id => ({
      id,
      label: categoryLabels[id] || id,
      count: counts[id]
    }));
  },

  /**
   * Search templates by name or description
   *
   * @param {string} query - Search query
   * @returns {Object[]} Matching templates
   */
  search: function(query) {
    const normalizedQuery = query.toLowerCase();
    return this.templates.filter(t =>
      t.name.toLowerCase().includes(normalizedQuery) ||
      t.description.toLowerCase().includes(normalizedQuery)
    );
  },

  /**
   * Add a custom template (user-defined)
   *
   * @param {Object} template - Template object
   * @returns {boolean} Success
   */
  addCustom: function(template) {
    if (!template.id || !template.name || !template.template) {
      return false;
    }

    // Ensure ID doesn't conflict
    if (this.templates.some(t => t.id === template.id)) {
      return false;
    }

    template.custom = true;
    template.category = template.category || 'custom';
    this.templates.push(template);
    return true;
  },

  /**
   * Remove a custom template
   *
   * @param {string} templateId - Template ID
   * @returns {boolean} Success
   */
  removeCustom: function(templateId) {
    const index = this.templates.findIndex(t => t.id === templateId && t.custom);
    if (index === -1) return false;

    this.templates.splice(index, 1);
    return true;
  },

  /**
   * Get recently used templates (for UI)
   * Note: Actual tracking would be done by UI layer
   *
   * @param {string[]} recentIds - Array of recently used template IDs
   * @returns {Object[]} Templates in order of recentIds
   */
  getRecent: function(recentIds) {
    return recentIds
      .map(id => this.get(id))
      .filter(Boolean);
  },

  /**
   * Create template from existing note parameters
   *
   * @param {string} name - Template name
   * @param {string} description - Template description
   * @param {Object} params - Note parameters
   * @returns {Object} New template object
   */
  createFromParams: function(name, description, params) {
    const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    return {
      id: `custom-${id}-${Date.now()}`,
      name,
      description,
      category: 'custom',
      custom: true,
      template: {
        activities: params.activities || [],
        performanceSkills: params.performanceSkills || [],
        assist: params.assist || 'MinA',
        location: params.location || null,
        cues: params.cues || [],
        goal: params.goal || '',
        tolerance: params.tolerance || 'well',
        progress: params.progress || 'progressing',
        plan: params.plan || 'continue'
      }
    };
  }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = QuickNotes;
}
