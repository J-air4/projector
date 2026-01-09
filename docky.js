/**
 * DOCKY - AI-like Note Generation Engine
 *
 * Main entry point that combines all modules.
 * Load order: phrases.js -> utils.js -> generator.js -> docky.js
 *
 * @version 2.0.0
 */

const DOCKY = (function() {
  // Initialize generator with dependencies
  DockyGenerator.init(DockyPhrases, DockyUtils);

  return {
    // Expose phrases for direct access if needed
    phrases: DockyPhrases,

    // Expose utils for direct access if needed
    utils: DockyUtils,

    // Main generate function
    generate: function(params) {
      return DockyGenerator.generate(params);
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
