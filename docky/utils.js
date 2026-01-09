/**
 * DOCKY Utility Functions
 *
 * Helper functions for text manipulation and random selection.
 * These are pure functions with no side effects.
 */

const DockyUtils = {
  /**
   * Randomly pick an item from an array
   * @param {Array} arr - Array to pick from
   * @returns {*} Random item from array, or empty string if array is empty
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
   * @returns {string} Formatted list string (e.g., "a, b, and c")
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
   * @returns {string} String with lowercased first letter
   */
  lowercaseFirst: function(str) {
    if (!str) return '';
    return str.charAt(0).toLowerCase() + str.slice(1);
  }
};

// Export for browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DockyUtils;
}
