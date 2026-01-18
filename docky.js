/**
 * DOCKY - AI-like Note Generation Engine
 *
 * Main entry point that combines all modules.
 *
 * v1.x Load order: phrases.js -> utils.js -> generator.js -> assistant.js -> docky.js
 * v2.0 Load order: core/data.js -> core/engine.js -> core/validator.js ->
 *                  modules/smart-defaults.js -> modules/quick-notes.js ->
 *                  modules/part-b.js -> docky.js
 *
 * @version 2.0.0
 */

const DOCKY = (function() {
  // ══════════════════════════════════════════════════════════════
  // V1.x LEGACY SUPPORT (backward compatibility)
  // ══════════════════════════════════════════════════════════════
  let legacyInitialized = false;

  function initLegacy() {
    if (legacyInitialized) return;
    if (typeof DockyGenerator !== 'undefined' && typeof DockyPhrases !== 'undefined') {
      DockyGenerator.init(DockyPhrases, DockyUtils);
      DockyAssistant.init(DockyPhrases, DockyUtils);
      legacyInitialized = true;
    }
  }

  // Try to init legacy on load (for browser with script tags)
  if (typeof DockyPhrases !== 'undefined') {
    initLegacy();
  }

  // ══════════════════════════════════════════════════════════════
  // V2.0 MODULES
  // ══════════════════════════════════════════════════════════════

  // Load v2 modules (for Node.js or when loaded via import)
  let DockyData, DockyEngine, DockyValidator, SmartDefaults, QuickNotes, PartBExpansion;
  let v2Initialized = false;

  function initV2() {
    if (v2Initialized) return true;

    // Try to load modules (Node.js environment)
    if (typeof require !== 'undefined') {
      try {
        DockyData = require('./docky/core/data.js');
        DockyEngine = require('./docky/core/engine.js');
        DockyValidator = require('./docky/core/validator.js');
        SmartDefaults = require('./docky/modules/smart-defaults.js');
        QuickNotes = require('./docky/modules/quick-notes.js');
        PartBExpansion = require('./docky/modules/part-b.js');

        // Initialize modules with data
        DockyEngine.init(DockyData);
        DockyValidator.init(DockyData);
        SmartDefaults.init(DockyData);

        v2Initialized = true;
        return true;
      } catch (e) {
        // Modules not available
        return false;
      }
    }

    // Browser environment - check if modules are globally available
    if (typeof window !== 'undefined') {
      DockyData = window.DockyData;
      DockyEngine = window.DockyEngine;
      DockyValidator = window.DockyValidator;
      SmartDefaults = window.SmartDefaults;
      QuickNotes = window.QuickNotes;
      PartBExpansion = window.PartBExpansion;

      if (DockyData && DockyEngine) {
        DockyEngine.init(DockyData);
        if (DockyValidator) DockyValidator.init(DockyData);
        if (SmartDefaults) SmartDefaults.init(DockyData);
        v2Initialized = true;
        return true;
      }
    }

    return false;
  }

  // Try to initialize v2
  initV2();

  // ══════════════════════════════════════════════════════════════
  // PUBLIC API
  // ══════════════════════════════════════════════════════════════

  return {
    // Version info
    version: '2.0.0',

    // ────────────────────────────────────────────────────────────
    // V2.0 API (Performance Skills Model)
    // ────────────────────────────────────────────────────────────

    /**
     * V2 Data module - single source of truth
     */
    get data() {
      initV2();
      return DockyData;
    },

    /**
     * V2 Note generation engine
     */
    get engine() {
      initV2();
      return DockyEngine;
    },

    /**
     * V2 Compliance validator
     */
    get validator() {
      initV2();
      return DockyValidator;
    },

    /**
     * V2 Smart defaults module
     */
    get smartDefaults() {
      initV2();
      return SmartDefaults;
    },

    /**
     * V2 Quick notes templates
     */
    get quickNotes() {
      initV2();
      return QuickNotes;
    },

    /**
     * V2 Part B expansion module
     */
    get partB() {
      initV2();
      return PartBExpansion;
    },

    /**
     * V2 Generate note using new engine
     * @param {Object} params - Note parameters
     * @returns {string} Generated note
     */
    generateV2: function(params) {
      if (!initV2()) {
        throw new Error('DOCKY v2 modules not loaded');
      }
      return DockyEngine.generate(params);
    },

    /**
     * V2 Validate note parameters
     * @param {Object} params - Note parameters
     * @returns {Object} Validation result
     */
    validate: function(params) {
      if (!initV2()) {
        throw new Error('DOCKY v2 modules not loaded');
      }
      return DockyValidator.validate(params);
    },

    /**
     * V2 Auto-populate from activity selection
     * @param {string|string[]} activities - Activity ID(s)
     * @returns {Object} Auto-populated parameters
     */
    autoPopulate: function(activities) {
      if (!initV2()) {
        throw new Error('DOCKY v2 modules not loaded');
      }
      if (Array.isArray(activities)) {
        return SmartDefaults.autoPopulateMultiple(activities);
      }
      return SmartDefaults.autoPopulate(activities);
    },

    /**
     * V2 Generate from quick template
     * @param {string} templateId - Template ID
     * @param {Object} overrides - Optional overrides
     * @returns {string} Generated note
     */
    generateFromTemplate: function(templateId, overrides = {}) {
      if (!initV2()) {
        throw new Error('DOCKY v2 modules not loaded');
      }
      const params = QuickNotes.generate(templateId, overrides);
      if (!params) {
        throw new Error(`Template not found: ${templateId}`);
      }
      return DockyEngine.generate(params);
    },

    /**
     * V2 Generate from shorthand
     * @param {string} shorthand - Space-separated shorthand codes
     * @returns {string} Generated note
     */
    generateFromShorthand: function(shorthand) {
      if (!initV2()) {
        throw new Error('DOCKY v2 modules not loaded');
      }
      return DockyEngine.generateFromShorthand(shorthand);
    },

    /**
     * V2 Get all templates
     * @returns {Object[]} Quick note templates
     */
    getTemplates: function() {
      if (!initV2()) {
        throw new Error('DOCKY v2 modules not loaded');
      }
      return QuickNotes.getAll();
    },

    /**
     * V2 Get smart defaults for activity
     * @param {string} activityId - Activity ID
     * @returns {Object} Defaults
     */
    getDefaults: function(activityId) {
      if (!initV2()) {
        throw new Error('DOCKY v2 modules not loaded');
      }
      return SmartDefaults.getDefaults(activityId);
    },

    /**
     * V2 Check if v2 is available
     * @returns {boolean}
     */
    isV2Available: function() {
      return initV2();
    },

    // ────────────────────────────────────────────────────────────
    // V1.x LEGACY API (backward compatibility)
    // ────────────────────────────────────────────────────────────

    // Expose v1 modules for direct access
    get phrases() {
      initLegacy();
      return typeof DockyPhrases !== 'undefined' ? DockyPhrases : null;
    },

    get utils() {
      initLegacy();
      return typeof DockyUtils !== 'undefined' ? DockyUtils : null;
    },

    get generator() {
      initLegacy();
      return typeof DockyGenerator !== 'undefined' ? DockyGenerator : null;
    },

    get assistant() {
      initLegacy();
      return typeof DockyAssistant !== 'undefined' ? DockyAssistant : null;
    },

    /**
     * V1 Main generate function (from legacy generator)
     * @param {Object} params - Note parameters
     * @returns {string} Generated note
     */
    generate: function(params) {
      initLegacy();
      if (typeof DockyGenerator !== 'undefined') {
        return DockyGenerator.generate(params);
      }
      // Fallback to v2 if v1 not available
      if (initV2()) {
        return DockyEngine.generate(params);
      }
      throw new Error('No generation engine available');
    },

    // V1 Assistant functions
    getQuestions: function() {
      initLegacy();
      return typeof DockyAssistant !== 'undefined' ? DockyAssistant.questions : [];
    },

    getVisibleQuestions: function(answers) {
      initLegacy();
      return typeof DockyAssistant !== 'undefined'
        ? DockyAssistant.getVisibleQuestions(answers)
        : [];
    },

    generateNarrative: function(answers) {
      initLegacy();
      return typeof DockyAssistant !== 'undefined'
        ? DockyAssistant.generateNarrative(answers)
        : '';
    },

    parseFreeForm: function(text) {
      initLegacy();
      return typeof DockyAssistant !== 'undefined'
        ? DockyAssistant.parseFreeForm(text)
        : {};
    },

    generateFromFreeForm: function(text) {
      initLegacy();
      return typeof DockyAssistant !== 'undefined'
        ? DockyAssistant.generateFromFreeForm(text)
        : '';
    },

    // V1 Convenience methods from utils
    pick: function(...args) {
      initLegacy();
      return typeof DockyUtils !== 'undefined' ? DockyUtils.pick(...args) : args[0];
    },

    pickWeighted: function(...args) {
      initLegacy();
      return typeof DockyUtils !== 'undefined' ? DockyUtils.pickWeighted(...args) : args[0];
    },

    formatList: function(...args) {
      initLegacy();
      if (typeof DockyUtils !== 'undefined') {
        return DockyUtils.formatList(...args);
      }
      // Fallback implementation
      const items = args[0];
      if (!items || items.length === 0) return '';
      if (items.length === 1) return items[0];
      if (items.length === 2) return `${items[0]} and ${items[1]}`;
      return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
    },

    capitalize: function(str) {
      initLegacy();
      return typeof DockyUtils !== 'undefined'
        ? DockyUtils.capitalize(str)
        : (str ? str.charAt(0).toUpperCase() + str.slice(1) : '');
    },

    lowercaseFirst: function(str) {
      initLegacy();
      return typeof DockyUtils !== 'undefined'
        ? DockyUtils.lowercaseFirst(str)
        : (str ? str.charAt(0).toLowerCase() + str.slice(1) : '');
    }
  };
})();

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DOCKY;
}
