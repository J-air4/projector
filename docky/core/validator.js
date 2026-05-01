/**
 * DOCKY v2.0 - Medicare Compliance Validator
 *
 * Validates note parameters meet Medicare documentation requirements.
 * Catches compliance issues before note generation.
 */

const DockyValidator = {
  data: null,

  /**
   * Initialize validator with data module
   */
  init: function(data) {
    this.data = data;
    return this;
  },

  /**
   * Validate note meets Medicare documentation requirements
   *
   * @param {Object} params - Note parameters
   * @returns {Object} { valid, errors, warnings }
   */
  validate: function(params) {
    const errors = [];
    const warnings = [];

    // ─────────────────────────────────────────────────────────────
    // REQUIRED FIELDS
    // ─────────────────────────────────────────────────────────────

    // Activity is required
    if (!params.activities || params.activities.length === 0) {
      errors.push({
        field: 'activities',
        message: 'Activity is required',
        severity: 'error'
      });
    } else {
      // Validate each activity exists
      for (const activityId of params.activities) {
        const activity = this.data.findActivity(activityId);
        if (!activity) {
          errors.push({
            field: 'activities',
            message: `Unknown activity: ${activityId}`,
            severity: 'error'
          });
        }
      }
    }

    // Assist level is required
    if (!params.assist) {
      errors.push({
        field: 'assist',
        message: 'Assist level is required',
        severity: 'error'
      });
    } else {
      // Validate assist level exists
      const assistLevel = this.data.findAssistLevel(params.assist);
      if (!assistLevel) {
        errors.push({
          field: 'assist',
          message: `Unknown assist level: ${params.assist}`,
          severity: 'error'
        });
      }
    }

    // ─────────────────────────────────────────────────────────────
    // RECOMMENDED FIELDS (Warnings)
    // ─────────────────────────────────────────────────────────────

    // Goal is recommended
    if (!params.goal) {
      warnings.push({
        field: 'goal',
        message: 'Goal is recommended for skilled documentation',
        severity: 'warning'
      });
    }

    // Tolerance/Response should be documented
    if (!params.tolerance) {
      warnings.push({
        field: 'tolerance',
        message: 'Patient response/tolerance should be documented',
        severity: 'warning'
      });
    }

    // Plan is recommended
    if (!params.plan) {
      warnings.push({
        field: 'plan',
        message: 'Plan is recommended',
        severity: 'warning'
      });
    }

    // Performance skills are recommended for OTPF-4 compliance
    if (!params.performanceSkills || params.performanceSkills.length === 0) {
      warnings.push({
        field: 'performanceSkills',
        message: 'Performance skills are recommended for OTPF-4 alignment',
        severity: 'warning'
      });
    }

    // ─────────────────────────────────────────────────────────────
    // PART B SPECIFIC VALIDATION
    // ─────────────────────────────────────────────────────────────

    if (params.partB) {
      // Skilled service justification required for Part B
      if (!params.partB.skilledService) {
        errors.push({
          field: 'partB.skilledService',
          message: 'Part B requires skilled service justification',
          severity: 'error'
        });
      }

      // Medical necessity recommended
      if (!params.partB.medicalNecessity) {
        warnings.push({
          field: 'partB.medicalNecessity',
          message: 'Medical necessity statement recommended for Part B',
          severity: 'warning'
        });
      }

      // PLOF recommended
      if (!params.partB.plof) {
        warnings.push({
          field: 'partB.plof',
          message: 'Prior Level of Function (PLOF) recommended for Part B',
          severity: 'warning'
        });
      }

      // Goal with timeframe recommended
      if (!params.partB.goalWithTimeframe) {
        warnings.push({
          field: 'partB.goalWithTimeframe',
          message: 'Measurable goal with timeframe recommended for Part B',
          severity: 'warning'
        });
      }
    }

    // ─────────────────────────────────────────────────────────────
    // LOGICAL CONSISTENCY CHECKS
    // ─────────────────────────────────────────────────────────────

    // If assist is Independent or Modified Independent, location is not needed
    if (params.assist === 'I' || params.assist === 'ModI') {
      if (params.location) {
        warnings.push({
          field: 'location',
          message: 'Location not typically needed for Independent or Modified Independent',
          severity: 'info'
        });
      }
    }

    // If assist requires hands-on, location is recommended
    if (['MinA', 'ModA', 'MaxA', 'Dep'].includes(params.assist)) {
      if (!params.location) {
        warnings.push({
          field: 'location',
          message: 'Assist location recommended for hands-on assistance',
          severity: 'warning'
        });
      }
    }

    // Cue validation
    if (params.cues && params.cues.length > 0) {
      for (const cue of params.cues) {
        if (!cue.type) {
          warnings.push({
            field: 'cues',
            message: 'Cue type missing',
            severity: 'warning'
          });
        }
        if (!cue.purpose) {
          warnings.push({
            field: 'cues',
            message: 'Cue purpose missing',
            severity: 'warning'
          });
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      errorCount: errors.length,
      warningCount: warnings.length
    };
  },

  /**
   * Validate note meets minimum Part A SNF requirements
   *
   * @param {Object} params - Note parameters
   * @returns {Object} { valid, errors, warnings }
   */
  validatePartA: function(params) {
    const result = this.validate(params);

    // Part A requires progress documentation
    if (!params.progress) {
      result.warnings.push({
        field: 'progress',
        message: 'Progress toward goals is recommended for Part A documentation',
        severity: 'warning'
      });
      result.warningCount++;
    }

    return result;
  },

  /**
   * Validate note meets Medicare Part B requirements
   *
   * @param {Object} params - Note parameters
   * @returns {Object} { valid, errors, warnings }
   */
  validatePartB: function(params) {
    // Start with base validation
    const result = this.validate(params);

    // Part B requires partB object
    if (!params.partB) {
      result.errors.push({
        field: 'partB',
        message: 'Part B documentation required for Medicare Part B billing',
        severity: 'error'
      });
      result.valid = false;
      result.errorCount++;
    }

    return result;
  },

  /**
   * Get validation summary suitable for display
   *
   * @param {Object} validationResult - Result from validate()
   * @returns {string} Human-readable summary
   */
  getSummary: function(validationResult) {
    if (validationResult.valid && validationResult.warningCount === 0) {
      return '✓ Note meets all documentation requirements';
    }

    const parts = [];

    if (!validationResult.valid) {
      parts.push(`✗ ${validationResult.errorCount} error(s) must be fixed`);
    }

    if (validationResult.warningCount > 0) {
      parts.push(`⚠ ${validationResult.warningCount} warning(s) to review`);
    }

    return parts.join(', ');
  },

  /**
   * Check if note is ready for Part B billing
   *
   * @param {Object} params - Note parameters
   * @returns {boolean}
   */
  isPartBReady: function(params) {
    const result = this.validatePartB(params);
    return result.valid;
  },

  /**
   * Suggest fixes for validation errors
   *
   * @param {Object} validationResult - Result from validate()
   * @returns {Object[]} Array of { field, suggestion }
   */
  suggestFixes: function(validationResult) {
    const suggestions = [];

    for (const error of validationResult.errors) {
      switch (error.field) {
        case 'activities':
          suggestions.push({
            field: 'activities',
            suggestion: 'Select at least one activity from the occupation list'
          });
          break;
        case 'assist':
          suggestions.push({
            field: 'assist',
            suggestion: 'Select an assist level (I, ModI, S, CGA, MinA, ModA, MaxA, Dep)'
          });
          break;
        case 'partB.skilledService':
          suggestions.push({
            field: 'partB.skilledService',
            suggestion: 'Select a skilled service justification for Part B compliance'
          });
          break;
        default:
          suggestions.push({
            field: error.field,
            suggestion: `Please provide a value for ${error.field}`
          });
      }
    }

    return suggestions;
  },

  /**
   * Calculate documentation completeness score (0-100)
   *
   * @param {Object} params - Note parameters
   * @returns {number} Completeness percentage
   */
  getCompletenessScore: function(params) {
    const fields = [
      { key: 'activities', weight: 20, check: () => params.activities && params.activities.length > 0 },
      { key: 'assist', weight: 15, check: () => !!params.assist },
      { key: 'goal', weight: 15, check: () => !!params.goal },
      { key: 'tolerance', weight: 10, check: () => !!params.tolerance },
      { key: 'progress', weight: 10, check: () => !!params.progress },
      { key: 'plan', weight: 10, check: () => !!params.plan },
      { key: 'performanceSkills', weight: 10, check: () => params.performanceSkills && params.performanceSkills.length > 0 },
      { key: 'cues', weight: 5, check: () => params.cues && params.cues.length > 0 },
      { key: 'location', weight: 5, check: () => !!params.location }
    ];

    let score = 0;
    for (const field of fields) {
      if (field.check()) {
        score += field.weight;
      }
    }

    return score;
  }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DockyValidator;
}
if (typeof window !== 'undefined') {
  window.DockyValidator = DockyValidator;
}
