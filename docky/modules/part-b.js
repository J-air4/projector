/**
 * DOCKY v2.0 - Medicare Part B Expansion Module
 *
 * Lazy-loaded module for Part B specific documentation.
 * Includes skilled service justification, medical necessity, and goal timeframes.
 */

const PartBExpansion = {
  /**
   * Skilled service justification options
   */
  skilledServiceOptions: [
    {
      id: 'activity-analysis',
      label: 'Activity Analysis & Task Modification',
      phrase: 'Requires skilled OT for activity analysis and task modification'
    },
    {
      id: 'exercise-prescription',
      label: 'Therapeutic Exercise Prescription',
      phrase: 'Requires skilled OT for therapeutic exercise prescription and progression'
    },
    {
      id: 'safety-assessment',
      label: 'Safety Assessment & Fall Prevention',
      phrase: 'Requires skilled OT for safety assessment and fall prevention strategies'
    },
    {
      id: 'dme-training',
      label: 'Adaptive Equipment Training',
      phrase: 'Requires skilled OT for adaptive equipment recommendation and training'
    },
    {
      id: 'cognitive-retraining',
      label: 'Cognitive Retraining',
      phrase: 'Requires skilled OT for cognitive retraining strategies'
    },
    {
      id: 'clinical-decision',
      label: 'Complex Clinical Decision-Making',
      phrase: 'Complexity of condition requires skilled clinical decision-making'
    },
    {
      id: 'neuromuscular-reeducation',
      label: 'Neuromuscular Re-education',
      phrase: 'Requires skilled OT for neuromuscular re-education techniques'
    },
    {
      id: 'splint-orthotic',
      label: 'Splint/Orthotic Management',
      phrase: 'Requires skilled OT for splint/orthotic fabrication and management'
    },
    {
      id: 'edema-management',
      label: 'Edema Management',
      phrase: 'Requires skilled OT for edema management and lymphatic techniques'
    },
    {
      id: 'sensory-retraining',
      label: 'Sensory Re-education',
      phrase: 'Requires skilled OT for sensory re-education and desensitization'
    }
  ],

  /**
   * Medical necessity statement options
   */
  medicalNecessityOptions: [
    {
      id: 'restore-function',
      label: 'Restore Functional Independence',
      phrase: 'Treatment is medically necessary to restore functional independence'
    },
    {
      id: 'prevent-decline',
      label: 'Prevent Functional Decline',
      phrase: 'Skilled services required to prevent functional decline'
    },
    {
      id: 'rehab-potential',
      label: 'Rehabilitation Potential',
      phrase: 'Rehabilitation potential supports continued skilled intervention'
    },
    {
      id: 'benefits-from-services',
      label: 'Benefits from Services',
      phrase: 'Patient demonstrates ability to benefit from skilled OT services'
    },
    {
      id: 'complexity-requires',
      label: 'Condition Complexity',
      phrase: 'Complexity of medical condition requires skilled OT intervention'
    },
    {
      id: 'safety-concerns',
      label: 'Safety Concerns',
      phrase: 'Ongoing safety concerns require skilled OT assessment and intervention'
    }
  ],

  /**
   * Discharge disposition options
   */
  dischargeOptions: [
    {
      id: 'home-family',
      label: 'Home with Family Support',
      phrase: 'Discharge to home with family support'
    },
    {
      id: 'home-hh',
      label: 'Home with Home Health',
      phrase: 'Discharge to home with home health services'
    },
    {
      id: 'home-independent',
      label: 'Home, Independent',
      phrase: 'Discharge to home, independent'
    },
    {
      id: 'alf',
      label: 'Assisted Living',
      phrase: 'Discharge to assisted living facility'
    },
    {
      id: 'ltc',
      label: 'Long-Term Care',
      phrase: 'Discharge to long-term care facility'
    },
    {
      id: 'continue-snf',
      label: 'Continue SNF',
      phrase: 'Continue SNF stay for further rehabilitation'
    },
    {
      id: 'outpatient',
      label: 'Outpatient OT',
      phrase: 'Transition to outpatient OT services'
    }
  ],

  /**
   * Goal timeframe options
   */
  timeframeOptions: [
    { id: '1-week', label: '1 week', days: 7 },
    { id: '2-weeks', label: '2 weeks', days: 14 },
    { id: '3-weeks', label: '3 weeks', days: 21 },
    { id: '4-weeks', label: '4 weeks', days: 28 },
    { id: '6-weeks', label: '6 weeks', days: 42 },
    { id: '8-weeks', label: '8 weeks', days: 56 },
    { id: 'dc', label: 'by discharge', days: null }
  ],

  /**
   * Goal action templates
   */
  goalActionTemplates: [
    'perform sit-to-stand transfers',
    'complete UB dressing',
    'complete LB dressing',
    'perform bathing tasks',
    'perform grooming tasks',
    'complete toileting',
    'self-feed with utensils',
    'perform bed mobility',
    'maintain standing balance',
    'ambulate on level surfaces',
    'prepare simple meals',
    'manage medications',
    'complete light housekeeping'
  ],

  /**
   * Get all fields for Part B documentation
   *
   * @returns {Object} Field definitions
   */
  getFields: function() {
    return {
      skilledService: {
        label: 'Skilled Service Justification',
        required: true,
        options: this.skilledServiceOptions
      },
      medicalNecessity: {
        label: 'Medical Necessity',
        required: false,
        options: this.medicalNecessityOptions
      },
      plof: {
        label: 'Prior Level of Function (PLOF)',
        required: false,
        placeholder: 'Independent with all ADLs, lived alone, drove...',
        type: 'text'
      },
      dischargePlan: {
        label: 'Discharge Disposition',
        required: false,
        options: this.dischargeOptions
      },
      goalWithTimeframe: {
        label: 'Measurable Goal with Timeframe',
        required: false,
        template: 'Patient will [action] with [assist level] within [timeframe]',
        components: {
          action: { type: 'select', options: this.goalActionTemplates },
          assistLevel: { type: 'select', options: 'assistLevels' }, // Reference to data.assistLevels
          timeframe: { type: 'select', options: this.timeframeOptions }
        }
      }
    };
  },

  /**
   * Build Part B data object from selections
   *
   * @param {Object} selections - Selected values
   * @returns {Object} Part B data for engine
   */
  buildPartBData: function(selections) {
    const partB = {};

    // Skilled service
    if (selections.skilledService) {
      const option = this.skilledServiceOptions.find(o => o.id === selections.skilledService);
      partB.skilledService = option ? option.phrase : selections.skilledService;
    }

    // Medical necessity
    if (selections.medicalNecessity) {
      const option = this.medicalNecessityOptions.find(o => o.id === selections.medicalNecessity);
      partB.medicalNecessity = option ? option.phrase : selections.medicalNecessity;
    }

    // PLOF
    if (selections.plof) {
      partB.plof = selections.plof;
    }

    // Discharge plan
    if (selections.dischargePlan) {
      const option = this.dischargeOptions.find(o => o.id === selections.dischargePlan);
      partB.dischargePlan = option ? option.phrase : selections.dischargePlan;
    }

    // Goal with timeframe
    if (selections.goalAction && selections.goalAssist && selections.goalTimeframe) {
      partB.goalWithTimeframe = {
        action: selections.goalAction,
        assistLevel: selections.goalAssist,
        timeframe: this._formatTimeframe(selections.goalTimeframe)
      };
    }

    return partB;
  },

  /**
   * Format timeframe for display
   */
  _formatTimeframe: function(timeframeId) {
    const option = this.timeframeOptions.find(o => o.id === timeframeId);
    return option ? option.label : timeframeId;
  },

  /**
   * Generate Part B compliant narrative
   *
   * @param {string} baseNote - Base note content
   * @param {Object} partBData - Part B data from buildPartBData
   * @returns {string} Complete Part B note
   */
  generatePartBNote: function(baseNote, partBData) {
    const sections = [];

    // Standard note content
    sections.push(baseNote);

    // Skilled service justification
    if (partBData.skilledService) {
      sections.push(`Skilled services required: ${partBData.skilledService}.`);
    }

    // Medical necessity
    if (partBData.medicalNecessity) {
      sections.push(partBData.medicalNecessity + '.');
    }

    // PLOF reference
    if (partBData.plof) {
      sections.push(`PLOF: ${partBData.plof}.`);
    }

    // Discharge planning
    if (partBData.dischargePlan) {
      sections.push(`D/C plan: ${partBData.dischargePlan}.`);
    }

    // Goal with timeframe
    if (partBData.goalWithTimeframe) {
      const { action, assistLevel, timeframe } = partBData.goalWithTimeframe;
      sections.push(`Goal: Patient will ${action} with ${assistLevel} within ${timeframe}.`);
    }

    return sections.join(' ');
  },

  /**
   * Validate Part B specific requirements
   *
   * @param {Object} partBData - Part B data
   * @returns {Object} { valid, errors, warnings }
   */
  validate: function(partBData) {
    const errors = [];
    const warnings = [];

    if (!partBData.skilledService) {
      errors.push({
        field: 'skilledService',
        message: 'Skilled service justification is required for Part B',
        severity: 'error'
      });
    }

    if (!partBData.medicalNecessity) {
      warnings.push({
        field: 'medicalNecessity',
        message: 'Medical necessity statement is recommended',
        severity: 'warning'
      });
    }

    if (!partBData.goalWithTimeframe) {
      warnings.push({
        field: 'goalWithTimeframe',
        message: 'Measurable goal with timeframe is recommended for Part B',
        severity: 'warning'
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  },

  /**
   * Get suggested skilled services based on activities
   *
   * @param {string[]} activityIds - Selected activities
   * @returns {string[]} Suggested skilled service IDs
   */
  suggestSkilledServices: function(activityIds) {
    const suggestions = new Set();

    const activityToSkilled = {
      // ADLs
      'dressing-ub': ['activity-analysis', 'dme-training'],
      'dressing-lb': ['activity-analysis', 'dme-training', 'safety-assessment'],
      'bathing': ['activity-analysis', 'safety-assessment', 'dme-training'],
      'grooming': ['activity-analysis', 'dme-training'],
      'toileting': ['activity-analysis', 'safety-assessment'],
      'self-feeding': ['activity-analysis', 'dme-training'],

      // Transfers
      'sit-stand': ['safety-assessment', 'exercise-prescription'],
      'stand-pivot': ['safety-assessment', 'exercise-prescription'],
      'toilet-transfer': ['safety-assessment', 'activity-analysis'],
      'tub-transfer': ['safety-assessment', 'dme-training'],

      // Bed Mobility
      'supine-sit': ['activity-analysis', 'exercise-prescription'],
      'rolling': ['exercise-prescription', 'neuromuscular-reeducation'],

      // Balance
      'sitting-balance': ['exercise-prescription', 'safety-assessment'],
      'standing-balance': ['exercise-prescription', 'safety-assessment'],
      'dynamic-balance': ['exercise-prescription', 'safety-assessment'],

      // Exercise
      'ue-strength': ['exercise-prescription'],
      'le-strength': ['exercise-prescription'],
      'core-strength': ['exercise-prescription'],
      'fine-motor': ['exercise-prescription', 'dme-training'],

      // IADLs
      'meal-prep': ['activity-analysis', 'safety-assessment', 'cognitive-retraining'],
      'med-mgmt': ['cognitive-retraining', 'activity-analysis']
    };

    for (const activityId of activityIds) {
      const skilled = activityToSkilled[activityId] || ['activity-analysis'];
      skilled.forEach(s => suggestions.add(s));
    }

    return Array.from(suggestions);
  },

  /**
   * Generate PLOF suggestions based on discharge disposition
   *
   * @param {string} dischargeId - Discharge disposition ID
   * @returns {string[]} PLOF phrase suggestions
   */
  suggestPLOF: function(dischargeId) {
    const suggestions = {
      'home-independent': [
        'Independent with all ADLs prior to admission',
        'Lived alone, independent with self-care and home management',
        'Independent with functional mobility and community access'
      ],
      'home-family': [
        'Required minimal assistance with IADLs, independent with ADLs',
        'Lived with spouse, minimal assistance with heavy housekeeping',
        'Independent with ADLs, supervision for safety with IADLs'
      ],
      'home-hh': [
        'Required assistance with bathing and dressing prior to admission',
        'Supervision required for functional mobility',
        'Modified independent with ADLs, assistance with IADLs'
      ],
      'alf': [
        'Required supervision with ADLs and medication management',
        'Minimal assistance with dressing and bathing',
        'Supervision for safety, assistance with IADLs'
      ],
      'ltc': [
        'Required moderate assistance with ADLs',
        'Dependent with transfers and ambulation',
        'Maximum assistance with most ADLs'
      ]
    };

    return suggestions[dischargeId] || [
      'Independent with ADLs prior to admission',
      'Modified independent with functional mobility'
    ];
  }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PartBExpansion;
}
