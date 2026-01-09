/**
 * DOCKY - AI-like Note Generation Engine
 *
 * Main entry point that combines all modules.
 * Load order: phrases.js -> utils.js -> generator.js -> assistant.js -> docky.js
 *
 * @version 2.1.0
 */

const DOCKY = (function() {
  // Initialize modules with dependencies
  DockyGenerator.init(DockyPhrases, DockyUtils);
  DockyAssistant.init(DockyPhrases, DockyUtils);

  return {
    // Expose modules for direct access
    phrases: DockyPhrases,
    utils: DockyUtils,
    generator: DockyGenerator,
    assistant: DockyAssistant,

    // Main generate function (from generator)
    generate: function(params) {
      return DockyGenerator.generate(params);
    },

    // Assistant functions
    getQuestions: function() {
      return DockyAssistant.questions;
    },

    getVisibleQuestions: function(answers) {
      return DockyAssistant.getVisibleQuestions(answers);
    },

    generateNarrative: function(answers) {
      return DockyAssistant.generateNarrative(answers);
    },

    parseFreeForm: function(text) {
      return DockyAssistant.parseFreeForm(text);
    },

    generateFromFreeForm: function(text) {
      return DockyAssistant.generateFromFreeForm(text);
    },

    // Convenience methods from utils
    pick: DockyUtils.pick,
    pickWeighted: DockyUtils.pickWeighted,
    formatList: DockyUtils.formatList,
    capitalize: DockyUtils.capitalize,
    lowercaseFirst: DockyUtils.lowercaseFirst
  };
})();

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DOCKY;
}
