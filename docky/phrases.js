/**
 * DOCKY Phrase Banks
 *
 * Contains all phrase variation banks used for natural note generation.
 * Organized by category for easy maintenance and extension.
 */

const DockyPhrases = {
  // Sentence starters for variety
  starters: {
    goal: [
      'To address',
      'In order to',
      'To facilitate',
      'To promote',
      'Working toward',
      'Targeting',
      'To support',
      'Aiming to'
    ],
    activity: [
      'Pt engaged in',
      'Pt participated in',
      'Pt performed',
      'Pt completed',
      'Pt worked on',
      'Patient engaged in',
      'Patient participated in'
    ]
  },

  // Instruction verbs
  instruction: [
    'instructed in',
    'trained in',
    'educated on',
    'guided through',
    'facilitated with',
    'engaged in'
  ],

  // Deficit introduction phrases
  deficitIntro: [
    'noted secondary to',
    '2/2',
    'due to',
    'related to',
    'attributed to',
    'as a result of'
  ],

  // Assistance phrasing
  assistRequired: [
    'required',
    'was necessary',
    'needed',
    'utilized',
    'provided'
  ],

  // Progress descriptors by category
  progressIntro: {
    improved: [
      'Demonstrated improvement compared to prior session',
      'Progress noted from baseline',
      'Performance improved since last session',
      'Patient showing gains',
      'Advancement observed from previous treatment'
    ],
    same: [
      'Performance remained consistent with prior session',
      'No significant change noted from baseline',
      'Static performance compared to last session',
      'Maintained current level of function',
      'Plateau observed at current level'
    ],
    declined: [
      'Regression noted from prior session',
      'Performance declined compared to baseline',
      'Decreased function observed since last session',
      'Patient demonstrated regression',
      'Step back noted from previous treatment'
    ]
  },

  // Tolerance phrasing subjects
  toleranceIntro: [
    'Patient',
    'Pt',
    'Individual'
  ],

  // Plan transitions
  planTransition: [
    'Plan:',
    'Moving forward,',
    'Next session,',
    'For progression,',
    'Recommendation:'
  ],

  // Sentence connectors
  connectors: [
    'Additionally,',
    'Furthermore,',
    'Also noted,',
    'Of note,',
    ''
  ],

  // Clinical reasoning frames
  reasoningFrames: [
    'Clinical reasoning supports',
    'Based on assessment,',
    'Given presentation,',
    'Per clinical judgment,',
    ''
  ]
};

// Export for browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DockyPhrases;
}
