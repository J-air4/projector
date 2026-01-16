/**
 * DOCKY Assistant
 *
 * Provides guided interview and free-form input modes
 * for generating cohesive clinical narratives.
 */

const DockyAssistant = {
  // Dependencies (set via init)
  phrases: null,
  utils: null,

  /**
   * Initialize with dependencies
   */
  init: function(phrases, utils) {
    this.phrases = phrases;
    this.utils = utils;
  },

  // ============================================
  // INTERVIEW QUESTIONS
  // ============================================

  // Streamlined questions - reduced from 12 to 6 core questions
  // Combines related fields and makes optional items truly optional
  questions: [
    {
      id: 'activity',
      prompt: 'Activity performed:',
      type: 'activityPicker',
      options: [
        {
          group: 'Transfers',
          items: [
            { value: 'sit-to-stand transfers', label: 'Sit-to-stand transfers' },
            { value: 'stand-pivot transfers', label: 'Stand-pivot transfers' },
            { value: 'bed-to-wheelchair transfers', label: 'Bed-to-wheelchair transfers' },
            { value: 'toilet transfers', label: 'Toilet transfers' },
            { value: 'tub/shower transfers', label: 'Tub/shower transfers' },
            { value: 'car transfers', label: 'Car transfers' }
          ]
        },
        {
          group: 'Bed Mobility',
          items: [
            { value: 'supine-to-sit', label: 'Supine-to-sit' },
            { value: 'rolling', label: 'Rolling in bed' },
            { value: 'scooting in bed', label: 'Scooting in bed' },
            { value: 'bed mobility training', label: 'Bed mobility training' }
          ]
        },
        {
          group: 'ADLs',
          items: [
            { value: 'upper body dressing', label: 'Upper body dressing' },
            { value: 'lower body dressing', label: 'Lower body dressing' },
            { value: 'donning/doffing footwear', label: 'Donning/doffing footwear' },
            { value: 'shower routine', label: 'Shower routine' },
            { value: 'grooming at sink', label: 'Grooming at sink' },
            { value: 'toileting routine', label: 'Toileting routine' },
            { value: 'self-feeding', label: 'Self-feeding' }
          ]
        },
        {
          group: 'Balance & Mobility',
          items: [
            { value: 'sitting balance activities', label: 'Sitting balance' },
            { value: 'standing balance activities', label: 'Standing balance' },
            { value: 'dynamic balance training', label: 'Dynamic balance' },
            { value: 'functional ambulation', label: 'Functional ambulation' },
            { value: 'stair navigation', label: 'Stair navigation' }
          ]
        },
        {
          group: 'Therapeutic Exercise',
          items: [
            { value: 'UE strengthening', label: 'UE strengthening' },
            { value: 'core strengthening', label: 'Core strengthening' },
            { value: 'AROM/PROM exercises', label: 'AROM/PROM exercises' },
            { value: 'fine motor coordination', label: 'Fine motor coordination' }
          ]
        },
        {
          group: 'IADLs',
          items: [
            { value: 'meal preparation', label: 'Meal preparation' },
            { value: 'light housekeeping', label: 'Light housekeeping' },
            { value: 'medication management', label: 'Medication management' }
          ]
        }
      ],
      required: true
    },
    {
      id: 'assist',
      prompt: 'Assistance level:',
      type: 'select',
      options: [
        { value: 'independent', label: 'Independent' },
        { value: 'supervision', label: 'Supervision for safety' },
        { value: 'supervision-cues', label: 'Supervision with verbal cues' },
        { value: 'cga', label: 'CGA for balance' },
        { value: 'cga-safety', label: 'CGA for safety' },
        { value: 'minA-trunk', label: 'MinA at trunk' },
        { value: 'minA-LE', label: 'MinA at LE' },
        { value: 'modA-trunk', label: 'ModA at trunk' },
        { value: 'modA-bilateral', label: 'ModA bilateral support' },
        { value: 'maxA-trunk', label: 'MaxA at trunk' },
        { value: 'maxA-total', label: 'MaxA for all components' },
        { value: 'dependent', label: 'Dependent' }
      ],
      required: true
    },
    {
      id: 'tolerance',
      prompt: 'Tolerance & progress:',
      type: 'select',
      options: [
        { value: 'wellTolerated-improved', label: 'Tolerated well - improved from prior' },
        { value: 'wellTolerated-same', label: 'Tolerated well - same as prior' },
        { value: 'wellTolerated-new', label: 'Tolerated well - new activity' },
        { value: 'minimalFatigue-improved', label: 'Minimal fatigue - improved from prior' },
        { value: 'minimalFatigue-same', label: 'Minimal fatigue - same as prior' },
        { value: 'restBreaks-improved', label: 'Required rest breaks - improved' },
        { value: 'restBreaks-same', label: 'Required rest breaks - same' },
        { value: 'fatigue', label: 'Fatigue limited activity' },
        { value: 'pain', label: 'Pain limited activity' },
        { value: 'SOB', label: 'SOB limited activity' },
        { value: 'declined', label: 'Declined from prior session' }
      ],
      required: true
    },
    {
      id: 'goal',
      prompt: 'Goal (optional):',
      type: 'select',
      options: [
        { value: '', label: '— Auto-select based on activity —' },
        { value: 'improve safety during functional activities', label: 'Improve safety' },
        { value: 'decrease fall risk', label: 'Decrease fall risk' },
        { value: 'increase independence with ADLs', label: 'Increase ADL independence' },
        { value: 'increase independence with transfers', label: 'Increase transfer independence' },
        { value: 'improve functional mobility', label: 'Improve functional mobility' },
        { value: 'improve standing balance', label: 'Improve standing balance' },
        { value: 'improve activity tolerance', label: 'Improve activity tolerance' },
        { value: 'improve UE function', label: 'Improve UE function' },
        { value: 'improve fine motor coordination', label: 'Improve fine motor coordination' }
      ]
    },
    {
      id: 'plan',
      prompt: 'Plan (optional):',
      type: 'select',
      options: [
        { value: '', label: '— No plan statement —' },
        { value: 'continue', label: 'Continue current plan' },
        { value: 'progress', label: 'Progress activity' },
        { value: 'decreaseAssist', label: 'Decrease assistance level' },
        { value: 'addEquipment', label: 'Introduce adaptive equipment' },
        { value: 'modify', label: 'Modify approach' }
      ]
    },
    {
      id: 'additional',
      prompt: 'Additional notes (optional):',
      placeholder: 'e.g., family training, equipment used, specific observations',
      type: 'textarea'
    }
  ],

  /**
   * Get visible questions based on current answers
   */
  getVisibleQuestions: function(answers) {
    return this.questions.filter(q => {
      if (!q.showIf) return true;
      return q.showIf(answers);
    });
  },

  // ============================================
  // CLINICAL TERMINOLOGY MAPPING
  // ============================================

  /**
   * Maps informal/everyday language to proper clinical terminology
   */
  clinicalTerms: {
    // Activities - informal to clinical
    activities: [
      // Functional reaching/bending
      { patterns: [/pick(ing)?(\s+(up|stuff|things?|items?|objects?))?(\s+(from|off))?(\s+the)?(\s+(floor|ground))/i, /bending?\s*(down)?\s*(to|and)?\s*(pick|grab|get|reach)/i, /reach(ing)?\s*(to|down)?\s*(the\s*)?(floor|ground)/i], clinical: 'functional reaching and retrieval' },
      { patterns: [/reach(ing)?\s*(up|over|across|high|shelf|cabinet)/i], clinical: 'overhead reaching tasks' },

      // Bed mobility - use standard terms
      { patterns: [/get(ting)?\s*(out\s*of|up\s*from)\s*(the\s*)?bed/i, /out\s*of\s*bed/i], clinical: 'supine-to-sit edge of bed' },
      { patterns: [/get(ting)?\s*in(to)?\s*(the\s*)?bed/i, /ly(ing|e)\s*down/i], clinical: 'sit-to-supine' },
      { patterns: [/roll(ing)?\s*(in\s*)?bed|turn(ing)?\s*(over)?\s*(in\s*)?bed/i], clinical: 'rolling in bed' },
      { patterns: [/scoot(ing)?|reposit(ion|ing)/i], clinical: 'bed repositioning' },

      // Transfers - standard terminology
      { patterns: [/sit(ting)?\s*(down|to|and)\s*stand|stand(ing)?\s*(up|and)\s*sit|sit\s*to\s*stand/i], clinical: 'sit-to-stand transfers' },
      { patterns: [/stand(ing)?\s*and\s*(turn|pivot)|pivot\s*transfer/i], clinical: 'stand-pivot transfers' },
      { patterns: [/slide\s*board|sliding\s*board|lateral\s*transfer/i], clinical: 'lateral sliding board transfer' },
      { patterns: [/squat\s*pivot/i], clinical: 'squat-pivot transfer' },
      { patterns: [/get(ting)?\s*(on|in)(to)?\s*(the\s*)?(toilet|commode)/i, /toilet\s*transfer/i], clinical: 'toilet transfer' },
      { patterns: [/get(ting)?\s*(in|out)\s*(of)?\s*(the\s*)?(tub|shower|bath)/i, /tub\s*transfer|shower\s*transfer/i], clinical: 'tub/shower transfer' },
      { patterns: [/get(ting)?\s*(in|out)\s*(of)?\s*(the\s*)?car/i, /car\s*transfer/i], clinical: 'car transfer' },
      { patterns: [/wheelchair.*bed|bed.*wheelchair/i], clinical: 'wheelchair-to-bed transfer' },

      // Dressing - standard ADL terms
      { patterns: [/put(ting)?\s*on\s*(a\s*)?(shirt|top|blouse|sweater|jacket|bra)/i, /dress(ing)?\s*(upper|top|torso)/i, /upper\s*(body|extremity)\s*dress/i], clinical: 'upper body dressing' },
      { patterns: [/put(ting)?\s*on\s*(pants|shorts|underwear|bottoms|skirt)/i, /dress(ing)?\s*(lower|bottom|legs?)/i, /lower\s*(body|extremity)\s*dress/i], clinical: 'lower body dressing' },
      { patterns: [/put(ting)?\s*on\s*(shoes?|socks?|footwear|slippers?)/i, /shoe|sock/i], clinical: 'footwear management' },
      { patterns: [/button|zipper|snap|fastener|velcro|tie/i], clinical: 'fastener management' },

      // Grooming/Hygiene - standard terms
      { patterns: [/brush(ing)?\s*(my|the|their)?\s*teeth|floss/i, /oral\s*(care|hygiene)/i, /denture/i], clinical: 'oral hygiene' },
      { patterns: [/wash(ing)?\s*(my|the|their)?\s*(face|hands?)/i, /hand\s*wash/i], clinical: 'hand/face washing' },
      { patterns: [/wash(ing)?\s*(my|the|their)?\s*hair|shampoo/i], clinical: 'hair washing' },
      { patterns: [/comb(ing)?|brush(ing)?\s*hair|style?\s*hair/i], clinical: 'hair grooming' },
      { patterns: [/shav(e|ing)/i], clinical: 'shaving' },
      { patterns: [/makeup|cosmetic/i], clinical: 'cosmetic application' },
      { patterns: [/nail\s*(care|trim|clip)/i], clinical: 'nail care' },

      // Bathing - specific terms
      { patterns: [/tak(e|ing)\s*(a\s*)?shower|shower(ing)?/i], clinical: 'showering' },
      { patterns: [/tak(e|ing)\s*(a\s*)?bath|bath(ing)?/i], clinical: 'bathing' },
      { patterns: [/wash(ing)?\s*(up|body|myself|self|lower|upper)/i], clinical: 'bathing' },
      { patterns: [/sponge\s*bath/i], clinical: 'sponge bathing' },

      // Toileting
      { patterns: [/us(e|ing)\s*(the\s*)?(toilet|bathroom|restroom)/i, /go(ing)?\s*to\s*(the\s*)?(bathroom|toilet)/i, /toilet(ing)?/i], clinical: 'toileting' },
      { patterns: [/wip(e|ing)|clean(ing)?\s*(after|self)/i], clinical: 'perineal hygiene' },
      { patterns: [/manag(e|ing)\s*(clothing|clothes).*toilet/i, /toilet.*cloth/i], clinical: 'clothing management for toileting' },

      // Feeding/Eating
      { patterns: [/eat(ing)?(?!\s*out)|feed(ing)?\s*(myself|self)/i], clinical: 'self-feeding' },
      { patterns: [/cut(ting)?\s*(food|meat)/i], clinical: 'food cutting' },
      { patterns: [/drink(ing)?|cup|straw/i], clinical: 'drinking/cup management' },
      { patterns: [/utensil|fork|spoon|knife/i], clinical: 'utensil use' },

      // IADLs
      { patterns: [/cook(ing)?|mak(e|ing)\s*(food|meals?|breakfast|lunch|dinner)/i, /prepar(e|ing)\s*(food|meals?)/i], clinical: 'meal preparation' },
      { patterns: [/clean(ing)?\s*(house)?|housekeep|tidy(ing)?/i], clinical: 'light housekeeping' },
      { patterns: [/sweep|vacuum|mop|dust/i], clinical: 'floor/surface cleaning' },
      { patterns: [/laundry|wash(ing)?\s*(clothes|laundry)/i, /fold(ing)?\s*clothes/i], clinical: 'laundry management' },
      { patterns: [/shop(ping)?|grocer/i], clinical: 'shopping' },
      { patterns: [/money|pay(ing)?|budget/i], clinical: 'financial management' },
      { patterns: [/med(ication|icine)?\s*(manage|box|organiz)/i, /pill\s*box/i], clinical: 'medication management' },

      // Functional mobility
      { patterns: [/walk(ing)?(?!\s*the\s*dog)|ambula/i], clinical: 'ambulation' },
      { patterns: [/get(ting)?\s*around|mov(e|ing)\s*around/i], clinical: 'functional mobility' },
      { patterns: [/wheel\s*chair\s*(mobil|propel|maneuver)/i, /push(ing)?\s*(wheel)?chair/i], clinical: 'wheelchair mobility' },
      { patterns: [/stair|step(s)?(?!\s*stool)/i], clinical: 'stair negotiation' },
      { patterns: [/curb/i], clinical: 'curb negotiation' },
      { patterns: [/ramp/i], clinical: 'ramp negotiation' },

      // Therapeutic exercise
      { patterns: [/arm\s*(exercise|strength)|strengthen(ing)?\s*(arm|upper)/i, /UE\s*strength/i, /upper\s*extremity\s*strength/i], clinical: 'UE strengthening exercises' },
      { patterns: [/leg\s*(exercise|strength)|strengthen(ing)?\s*(leg|lower)/i, /LE\s*strength/i, /lower\s*extremity\s*strength/i], clinical: 'LE strengthening exercises' },
      { patterns: [/core\s*(exercise|strength|stabil)|ab(s|dominal)?\s*(exercise|strength)/i, /trunk\s*strength/i], clinical: 'core stabilization exercises' },
      { patterns: [/stretch(ing)?|flexib/i], clinical: 'stretching/flexibility exercises' },
      { patterns: [/ROM|range\s*of\s*motion/i], clinical: 'ROM exercises' },
      { patterns: [/AROM/i], clinical: 'AROM exercises' },
      { patterns: [/PROM/i], clinical: 'PROM exercises' },

      // Balance
      { patterns: [/sitting\s*(up|balance)|balance.*sit|seated\s*balance/i], clinical: 'sitting balance training' },
      { patterns: [/standing\s*balance|balance.*stand/i], clinical: 'standing balance training' },
      { patterns: [/dynamic\s*balance/i], clinical: 'dynamic balance training' },
      { patterns: [/static\s*balance/i], clinical: 'static balance training' },
      { patterns: [/weight\s*shift/i], clinical: 'weight shifting activities' },

      // Fine motor/coordination
      { patterns: [/fine\s*motor|small\s*muscle|finger\s*(control|dexterity)|hand\s*(coordination|dexterity)|pinch|grasp/i], clinical: 'fine motor activities' },
      { patterns: [/gross\s*motor|large\s*muscle/i], clinical: 'gross motor activities' },
      { patterns: [/coordinat/i], clinical: 'coordination training' },

      // Cognitive/Safety
      { patterns: [/sequenc(e|ing)/i], clinical: 'sequencing training' },
      { patterns: [/safety\s*(train|aware|educat)/i], clinical: 'safety training' },
      { patterns: [/memory|recall/i], clinical: 'memory strategies training' },
      { patterns: [/attention|focus|concentrat/i], clinical: 'attention training' },
      { patterns: [/problem\s*solv/i], clinical: 'problem-solving training' },

      // Energy conservation/Work simplification
      { patterns: [/energy\s*(conserv|sav)|pac(e|ing)/i], clinical: 'energy conservation training' },
      { patterns: [/work\s*simplif/i], clinical: 'work simplification training' },
      { patterns: [/joint\s*protect/i], clinical: 'joint protection training' },
      { patterns: [/body\s*mechanic/i], clinical: 'body mechanics training' },

      // Equipment
      { patterns: [/adaptive\s*(equip|device)|assist(ive)?\s*(device|tech)/i], clinical: 'adaptive equipment training' },
      { patterns: [/splint/i], clinical: 'splint wear/care training' },
      { patterns: [/ortho(tic|sis)/i], clinical: 'orthotic training' }
    ],

    // Deficits - informal to clinical
    deficits: [
      // Strength deficits
      { patterns: [/weak(ness)?.*arm|arm.*weak/i, /can(')?t\s*lift\s*(arm|arms)/i, /UE\s*weak/i], clinical: 'decreased UE strength' },
      { patterns: [/weak(ness)?.*leg|leg.*weak/i, /LE\s*weak/i], clinical: 'decreased LE strength' },
      { patterns: [/weak(ness)?.*core|core.*weak|trunk.*weak/i], clinical: 'decreased trunk/core strength' },
      { patterns: [/weak(ness)?.*grip|grip.*weak|can(')?t\s*hold|drop(ping)?\s*things/i], clinical: 'decreased grip strength' },
      { patterns: [/weak(ness)?.*pinch/i], clinical: 'decreased pinch strength' },
      { patterns: [/general(ized)?\s*weak/i], clinical: 'generalized weakness' },

      // Balance deficits
      { patterns: [/balance.*stand|stand.*balance|unsteady.*stand/i], clinical: 'impaired standing balance' },
      { patterns: [/balance.*sit|sit.*balance|unsteady.*sit/i], clinical: 'impaired sitting balance' },
      { patterns: [/dynamic\s*balance/i], clinical: 'impaired dynamic balance' },
      { patterns: [/static\s*balance/i], clinical: 'impaired static balance' },
      { patterns: [/balance.*bad|bad.*balance|unsteady|wobbly|tip(py|ping)/i, /fall(ing)?\s*(a\s*lot|often|frequently)/i, /lose?\s*balance/i], clinical: 'impaired balance' },

      // ROM deficits
      { patterns: [/can(')?t\s*(move|lift|raise).*shoulder|shoulder.*(stiff|limited|restricted)/i, /frozen\s*shoulder/i], clinical: 'limited shoulder ROM' },
      { patterns: [/can(')?t\s*(move|bend).*elbow|elbow.*(stiff|limited)/i], clinical: 'limited elbow ROM' },
      { patterns: [/can(')?t\s*(move|bend).*wrist|wrist.*(stiff|limited)/i], clinical: 'limited wrist ROM' },
      { patterns: [/can(')?t\s*bend.*hip|hip.*(stiff|limited|restricted)/i], clinical: 'limited hip ROM' },
      { patterns: [/can(')?t\s*bend.*knee|knee.*(stiff|limited)/i], clinical: 'limited knee ROM' },
      { patterns: [/stiff|tight|restricted\s*motion/i], clinical: 'limited ROM' },

      // Coordination deficits
      { patterns: [/clumsy|incoordinat/i], clinical: 'impaired coordination' },
      { patterns: [/fumbl(e|ing)|finger.*coordination|can(')?t\s*(button|zip|write)/i, /fine\s*motor.*(impair|deficit|problem)/i], clinical: 'impaired fine motor coordination' },
      { patterns: [/gross\s*motor.*(impair|deficit|problem)/i], clinical: 'impaired gross motor coordination' },
      { patterns: [/tremor|shak(e|y|ing)/i], clinical: 'tremor' },
      { patterns: [/ataxia|ataxic/i], clinical: 'ataxia' },

      // Endurance/tolerance
      { patterns: [/get(s)?\s*tired\s*(easily|fast|quickly)|low\s*energy|fatigue|no\s*endurance/i], clinical: 'decreased activity tolerance' },
      { patterns: [/can(')?t\s*stand\s*(long|very\s*long)|standing.*tolerance/i], clinical: 'decreased standing tolerance' },
      { patterns: [/can(')?t\s*sit\s*(long|very\s*long)|sitting.*tolerance/i], clinical: 'decreased sitting tolerance' },
      { patterns: [/short(ness)?\s*(of)?\s*breath|SOB|dyspnea/i], clinical: 'dyspnea with activity' },

      // Cognitive deficits
      { patterns: [/forget(s|ting)?.*order|order.*wrong|sequence|step.*order|can(')?t\s*follow\s*step/i], clinical: 'impaired sequencing' },
      { patterns: [/not\s*safe|safety.*aware|aware.*danger|danger.*aware|risk(y)?\s*behavior|impuls/i], clinical: 'decreased safety awareness' },
      { patterns: [/can(')?t\s*plan|planning.*difficult|motor\s*planning/i], clinical: 'impaired motor planning' },
      { patterns: [/can(')?t\s*(focus|concentrate|pay\s*attention)|distract|attention/i], clinical: 'decreased attention' },
      { patterns: [/memory|forget(ful)?|can(')?t\s*remember/i], clinical: 'impaired memory' },
      { patterns: [/confus(ed|ion)/i], clinical: 'confusion' },
      { patterns: [/problem\s*solv/i], clinical: 'impaired problem-solving' },

      // Sensory deficits
      { patterns: [/numb|can(')?t\s*feel|no\s*sensation|tingl/i], clinical: 'impaired sensation' },
      { patterns: [/vision|can(')?t\s*see|sight/i], clinical: 'impaired vision' },
      { patterns: [/neglect/i], clinical: 'unilateral neglect' },

      // Other
      { patterns: [/pain(ful)?.*move|move.*pain|hurt(s)?\s*to/i], clinical: 'pain limiting function' },
      { patterns: [/posture|slump|lean(ing)?/i], clinical: 'impaired posture' },
      { patterns: [/trunk\s*control/i], clinical: 'decreased trunk control' },
      { patterns: [/edema|swell(ing)?/i], clinical: 'edema' },
      { patterns: [/spastic/i], clinical: 'spasticity' },
      { patterns: [/flaccid/i], clinical: 'flaccidity' }
    ],

    // Goals - informal to clinical
    goals: [
      // Safety goals
      { patterns: [/safe(r|ty)?|not\s*fall|prevent.*fall|fall\s*(risk|prevent)/i], clinical: 'improve safety with functional mobility' },
      { patterns: [/safe.*transfer/i], clinical: 'improve safety with transfers' },

      // Independence goals
      { patterns: [/do\s*(it|things?).*myself|independent|on\s*(my|their)\s*own|without\s*help/i], clinical: 'increase independence with ADLs' },
      { patterns: [/dress.*better|better.*dress|put\s*on\s*clothes|independent.*dress/i], clinical: 'increase independence with dressing' },
      { patterns: [/bath(e|ing)?.*better|wash.*better|shower.*better|independent.*(bath|shower)/i], clinical: 'increase independence with bathing' },
      { patterns: [/groom.*better|independent.*groom/i], clinical: 'increase independence with grooming' },
      { patterns: [/toilet.*better|independent.*toilet/i], clinical: 'increase independence with toileting' },
      { patterns: [/eat.*better|feed.*better|independent.*(eat|feed)/i], clinical: 'increase independence with self-feeding' },
      { patterns: [/transfer.*better|get\s*(up|out).*easier|independent.*transfer/i], clinical: 'increase independence with transfers' },

      // Function goals
      { patterns: [/walk.*better|mobil(e|ity)|get\s*around/i], clinical: 'improve functional mobility' },
      { patterns: [/balance.*better|better.*balance|more\s*stable/i], clinical: 'improve balance' },
      { patterns: [/stand.*better|stand.*longer/i], clinical: 'improve standing tolerance' },
      { patterns: [/strong(er)?.*arm|arm.*strong|UE.*strength/i], clinical: 'increase UE strength' },
      { patterns: [/strong(er)?.*leg|leg.*strong|LE.*strength/i], clinical: 'increase LE strength' },
      { patterns: [/strong(er)?.*grip|grip.*strong/i], clinical: 'increase grip strength' },
      { patterns: [/strong(er)?|strength/i], clinical: 'increase strength' },
      { patterns: [/ROM|range\s*of\s*motion|flex(ible|ibility)/i], clinical: 'increase ROM' },
      { patterns: [/last\s*longer|more\s*endurance|not.*tired|stamina/i], clinical: 'improve activity tolerance' },
      { patterns: [/coordinat.*better|better.*coordinat/i], clinical: 'improve coordination' },
      { patterns: [/fine\s*motor/i], clinical: 'improve fine motor skills' },

      // Cognitive goals
      { patterns: [/remember|memory/i], clinical: 'improve memory strategies' },
      { patterns: [/safe.*aware|aware.*safe/i], clinical: 'improve safety awareness' },
      { patterns: [/attention|focus|concentrat/i], clinical: 'improve attention to task' },
      { patterns: [/sequenc/i], clinical: 'improve task sequencing' },

      // Pain/edema
      { patterns: [/less\s*pain|pain.*less|reduce.*pain|pain.*reduce/i], clinical: 'decrease pain' },
      { patterns: [/swell.*less|reduce.*swell|edema/i], clinical: 'reduce edema' }
    ]
  },

  /**
   * Convert informal text to clinical terminology
   * @param {string} text - Input text
   * @param {string} category - 'activities', 'deficits', or 'goals'
   * @returns {string} Clinical term or original text if no match
   */
  toClinicalTerm: function(text, category) {
    if (!text || !this.clinicalTerms[category]) return text;

    const mappings = this.clinicalTerms[category];
    for (const mapping of mappings) {
      for (const pattern of mapping.patterns) {
        if (pattern.test(text)) {
          return mapping.clinical;
        }
      }
    }
    return text; // Return original if no match
  },

  /**
   * Analyze and convert all informal terms in text to clinical terminology
   * @param {string} text - Raw input text
   * @returns {Object} Converted text with clinical terms
   */
  analyzeClinicalTerms: function(text) {
    const result = {
      original: text,
      activity: null,
      deficit: null,
      goal: null
    };

    // Find activities
    for (const mapping of this.clinicalTerms.activities) {
      for (const pattern of mapping.patterns) {
        if (pattern.test(text)) {
          result.activity = mapping.clinical;
          break;
        }
      }
      if (result.activity) break;
    }

    // Find deficits
    for (const mapping of this.clinicalTerms.deficits) {
      for (const pattern of mapping.patterns) {
        if (pattern.test(text)) {
          result.deficit = mapping.clinical;
          break;
        }
      }
      if (result.deficit) break;
    }

    // Find goals
    for (const mapping of this.clinicalTerms.goals) {
      for (const pattern of mapping.patterns) {
        if (pattern.test(text)) {
          result.goal = mapping.clinical;
          break;
        }
      }
      if (result.goal) break;
    }

    return result;
  },

  // ============================================
  // FREE-FORM PARSER
  // ============================================

  /**
   * Parse free-form clinical shorthand into structured data
   * Automatically converts informal language to clinical terminology
   */
  parseFreeForm: function(text) {
    const parsed = {
      activity: null,
      goal: null,
      assistLevel: null,
      assistLocation: null,
      assistReason: null,
      cues: null,
      tolerance: null,
      progress: null,
      deficit: null,
      plan: null,
      additional: null
    };

    const lowerText = text.toLowerCase();

    // Parse assist levels
    if (/\bindep(endent)?\b/i.test(text)) parsed.assistLevel = 'independent';
    else if (/\bsupervis(ion|e)?\b/i.test(text)) parsed.assistLevel = 'supervision';
    else if (/\bcga\b|contact guard/i.test(text)) parsed.assistLevel = 'cga';
    else if (/\bmin(imal)?\s*a(ssist)?\b/i.test(text)) parsed.assistLevel = 'minA';
    else if (/\bmod(erate)?\s*a(ssist)?\b/i.test(text)) parsed.assistLevel = 'modA';
    else if (/\bmax(imum)?\s*a(ssist)?\b/i.test(text)) parsed.assistLevel = 'maxA';
    else if (/\bdependent\b/i.test(text)) parsed.assistLevel = 'dependent';

    // Parse assist location
    const locationMatch = text.match(/(?:at|to|@)\s*(trunk|hips?|bilat(?:eral)?\s*[UL]Es?|[LR]\s*[UL]E|shoulder|arm|leg)/i);
    if (locationMatch) parsed.assistLocation = locationMatch[1];

    // Parse tolerance
    if (/toler(ated|ating)?\s*well|no\s*fatigue|without\s*fatigue/i.test(text)) parsed.tolerance = 'wellTolerated';
    else if (/rest\s*break|break.*required/i.test(text)) parsed.tolerance = 'restBreaks';
    else if (/fatigu/i.test(text)) parsed.tolerance = 'fatigue';
    else if (/pain\s*(limit|restrict)/i.test(text)) parsed.tolerance = 'pain';

    // Parse progress
    if (/improv(ed|ing|ement)|progress|better|gains?/i.test(text)) parsed.progress = 'improved';
    else if (/same|static|plateau|no\s*change|unchanged/i.test(text)) parsed.progress = 'same';
    else if (/declin(ed|ing)|regress|worse/i.test(text)) parsed.progress = 'declined';

    // Parse plan
    if (/continue|cont\b|maintain/i.test(text)) parsed.plan = 'continue';
    else if (/progress|upgrade|advance|increase.*challenge/i.test(text)) parsed.plan = 'progress';
    else if (/modify|adjust|change.*approach/i.test(text)) parsed.plan = 'modify';
    else if (/equip|adaptive|device/i.test(text)) parsed.plan = 'addEquipment';

    // Analyze clinical terms - converts informal language to clinical terminology
    const clinicalAnalysis = this.analyzeClinicalTerms(text);

    // Use clinical term if found, otherwise fall back to pattern matching
    if (clinicalAnalysis.activity) {
      parsed.activity = clinicalAnalysis.activity;
    } else {
      // Fallback: Parse activities (common OT activities)
      const activities = [
        'transfer', 'bed mobility', 'dressing', 'bathing', 'grooming',
        'toileting', 'feeding', 'self-feeding', 'meal prep', 'balance',
        'standing', 'sitting', 'ambulation', 'wheelchair', 'strengthening',
        'ROM', 'stretching', 'fine motor', 'gross motor', 'cogniti'
      ];
      for (const act of activities) {
        if (lowerText.includes(act)) {
          parsed.activity = text.match(new RegExp(`\b${act}[^,.;!?]*`, 'i'))?.[0]?.trim() || act;
          break;
        }
      }
    }

    // Parse cues
    const cueMatch = text.match(/(verbal|tactile|visual)\s*cues?\s*(?:for|to)?\s*([^,\.]+)?/i);
    if (cueMatch) {
      parsed.cues = cueMatch[0].trim();
    }

    // Use clinical term for deficit if found, otherwise fall back to pattern matching
    if (clinicalAnalysis.deficit) {
      parsed.deficit = clinicalAnalysis.deficit;
    } else {
      // Fallback: Parse deficits - use [^,.] to stop at delimiters
      const deficitPatterns = [
        /decreased\s+[^,.;!?]+/i,
        /impaired\s+[^,.;!?]+/i,
        /limited\s+[^,.;!?]+/i,
        /poor\s+[^,.;!?]+/i,
        /reduced\s+[^,.;!?]+/i
      ];
      for (const pattern of deficitPatterns) {
        const match = text.match(pattern);
        if (match) {
          parsed.deficit = match[0].trim();
          break;
        }
      }
    }

    // Use clinical term for goal if found
    if (clinicalAnalysis.goal) {
      parsed.goal = clinicalAnalysis.goal;
    }

    // Anything not parsed goes to additional
    parsed.rawInput = text;

    return parsed;
  },

  // ============================================
  // NARRATIVE GENERATOR
  // ============================================

  /**
   * Combined assist level mappings (level + location/purpose)
   */
  assistLevelText: {
    // Legacy mappings (for free-form parser compatibility)
    independent: 'independently',
    supervision: 'with supervision',
    cga: 'with contact guard assistance',
    minA: 'with minimal assistance',
    modA: 'with moderate assistance',
    maxA: 'with maximum assistance',
    dependent: 'with dependent assistance',
    // New combined mappings
    'supervision-cues': 'with supervision and verbal cues',
    'cga-safety': 'with CGA for safety',
    'minA-trunk': 'with minimal assistance at trunk',
    'minA-LE': 'with minimal assistance at LE',
    'modA-trunk': 'with moderate assistance at trunk',
    'modA-bilateral': 'with moderate assistance with bilateral support',
    'maxA-trunk': 'with maximum assistance at trunk',
    'maxA-total': 'with maximum assistance for all components'
  },

  /**
   * Combined tolerance + progress mappings
   */
  toleranceProgressText: {
    'wellTolerated-improved': 'Patient tolerated the activity well. This represents improvement compared to the prior session.',
    'wellTolerated-same': 'Patient tolerated the activity well. Performance remained consistent with the prior session.',
    'wellTolerated-new': 'Patient tolerated the activity well. This was the initial session for this activity.',
    'minimalFatigue-improved': 'Patient tolerated the activity well with minimal fatigue. This represents improvement from the prior session.',
    'minimalFatigue-same': 'Patient tolerated the activity well with minimal fatigue. Performance remained consistent with the prior session.',
    'restBreaks-improved': 'Rest breaks were required to complete the activity. Despite this, improvement was noted from the prior session.',
    'restBreaks-same': 'Rest breaks were required to complete the activity. Performance remained consistent with the prior session.',
    'fatigue': 'Fatigue was noted, limiting activity duration.',
    'pain': 'Pain limited full participation in the activity.',
    'SOB': 'Shortness of breath was noted, requiring activity modification.',
    'declined': 'A decline in performance was noted compared to the prior session.'
  },

  // Legacy tolerance text (for backward compatibility)
  toleranceText: {
    wellTolerated: 'Patient tolerated the activity well without signs of fatigue.',
    minimalFatigue: 'Patient tolerated the activity well with minimal fatigue noted.',
    restBreaks: 'Rest breaks were required to complete the activity.',
    fatigue: 'Fatigue was noted, limiting activity duration.',
    pain: 'Pain limited full participation in the activity.',
    SOB: 'Shortness of breath was noted, requiring activity modification.'
  },

  // Legacy progress text (for backward compatibility)
  progressText: {
    improved: 'This represents improvement compared to the prior session.',
    same: 'Performance remained consistent with the prior session.',
    declined: 'A decline in performance was noted compared to the prior session.',
    new: 'This was the initial session for this activity.'
  },

  planText: {
    continue: 'Plan to continue with the current intervention approach.',
    progress: 'Plan to progress the activity to increase challenge.',
    modify: 'Plan to modify the approach based on patient response.',
    addEquipment: 'Plan to introduce adaptive equipment to improve function.',
    decreaseAssist: 'Plan to decrease level of assistance as patient demonstrates improved performance.',
    increaseReps: 'Plan to increase repetitions and duration to build endurance.',
    addComplexity: 'Plan to add complexity to the task as patient demonstrates mastery.'
  },

  /**
   * Auto-suggest goal based on activity
   */
  activityGoalMap: {
    'sit-to-stand transfers': 'increase independence with transfers',
    'stand-pivot transfers': 'increase independence with transfers',
    'bed-to-wheelchair transfers': 'increase independence with transfers',
    'toilet transfers': 'increase independence with toileting',
    'tub/shower transfers': 'improve safety during functional activities',
    'car transfers': 'increase independence with transfers',
    'supine-to-sit': 'improve bed mobility',
    'rolling': 'improve bed mobility',
    'scooting in bed': 'improve bed mobility',
    'bed mobility training': 'improve bed mobility',
    'upper body dressing': 'increase independence with dressing',
    'lower body dressing': 'increase independence with dressing',
    'donning/doffing footwear': 'increase independence with dressing',
    'shower routine': 'increase independence with bathing',
    'grooming at sink': 'increase independence with grooming',
    'toileting routine': 'increase independence with toileting',
    'self-feeding': 'increase independence with self-feeding',
    'sitting balance activities': 'improve sitting balance',
    'standing balance activities': 'improve standing balance',
    'dynamic balance training': 'improve standing balance',
    'functional ambulation': 'improve functional mobility',
    'stair navigation': 'improve functional mobility',
    'UE strengthening': 'improve UE function',
    'core strengthening': 'improve standing balance',
    'AROM/PROM exercises': 'improve UE function',
    'fine motor coordination': 'improve fine motor coordination',
    'meal preparation': 'increase independence with ADLs',
    'light housekeeping': 'increase independence with ADLs',
    'medication management': 'improve safety during functional activities'
  },

  /**
   * Generate a cohesive narrative from structured answers
   * All user inputs are sanitized to prevent XSS
   */
  generateNarrative: function(answers) {
    const sentences = [];
    const sanitize = this.utils.sanitize.bind(this.utils);

    // Determine assist level (handle both old 'assistLevel' and new 'assist' fields)
    const assistKey = answers.assist || answers.assistLevel;

    // Auto-suggest goal if not provided
    let goal = answers.goal;
    if (!goal && answers.activity && this.activityGoalMap[answers.activity]) {
      goal = this.activityGoalMap[answers.activity];
    }

    // Opening sentence: Activity + Goal + Assist
    let opening = '';
    if (answers.activity) {
      const starter = this.utils.pick([
        'Patient participated in',
        'Patient engaged in',
        'Treatment session focused on',
        'Patient completed'
      ]);

      opening = `${starter} ${sanitize(answers.activity)}`;

      // Add assist level (handles both combined and legacy formats)
      if (assistKey && this.assistLevelText[assistKey]) {
        opening += ` ${this.assistLevelText[assistKey]}`;
      } else if (assistKey) {
        // Fallback for legacy format with separate location/reason
        if (this.assistLevelText[assistKey]) {
          opening += ` ${this.assistLevelText[assistKey]}`;
        }
        if (answers.assistLocation) {
          opening += ` at ${sanitize(answers.assistLocation)}`;
        }
        if (answers.assistReason) {
          opening += ` ${sanitize(answers.assistReason)}`;
        }
      }

      // Add goal
      if (goal) {
        opening += ` to ${sanitize(goal)}`;
      }

      opening += '.';
      sentences.push(opening);
    }

    // Cues sentence (handle both old 'cues' field and legacy cueType/cuePurpose)
    if (answers.cueType && answers.cueType !== '') {
      const cueStarter = this.utils.pick([
        'Cueing included',
        'Patient required',
        'Therapist provided'
      ]);
      let cuePhrase = sanitize(answers.cueType);
      if (answers.cuePurpose) {
        cuePhrase += ` ${sanitize(answers.cuePurpose)}`;
      }
      sentences.push(`${cueStarter} ${cuePhrase}.`);
    } else if (answers.cues) {
      // Fallback for old cues field (from free-form parsing)
      const cueStarter = this.utils.pick([
        'Cueing included',
        'Patient required',
        'Therapist provided'
      ]);
      sentences.push(`${cueStarter} ${sanitize(answers.cues)}.`);
    }

    // Deficit sentence
    if (answers.deficit) {
      const deficitStarter = this.utils.pick([
        'Intervention addressed',
        'Session targeted',
        'Treatment focused on'
      ]);
      sentences.push(`${deficitStarter} ${sanitize(answers.deficit)}.`);
    }

    // Tolerance + Progress sentence (handles combined format)
    if (answers.tolerance && this.toleranceProgressText[answers.tolerance]) {
      sentences.push(this.toleranceProgressText[answers.tolerance]);
    } else {
      // Fallback for legacy separate tolerance/progress fields
      if (answers.tolerance && this.toleranceText[answers.tolerance]) {
        sentences.push(this.toleranceText[answers.tolerance]);
      }
      if (answers.progress && this.progressText[answers.progress]) {
        sentences.push(this.progressText[answers.progress]);
      }
    }

    // Plan sentence
    if (answers.plan && this.planText[answers.plan]) {
      sentences.push(this.planText[answers.plan]);
    }

    // Additional info
    if (answers.additional && answers.additional.trim()) {
      sentences.push(sanitize(answers.additional));
    }

    return sentences.join(' ');
  },

  /**
   * Generate narrative from free-form text
   */
  generateFromFreeForm: function(text) {
    const parsed = this.parseFreeForm(text);
    return this.generateNarrative(parsed);
  }
};

// Export for browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DockyAssistant;
}
