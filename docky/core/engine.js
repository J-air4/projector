/**
 * DOCKY v2.0 - Note Generation Engine (97530-shaped)
 *
 * Week 2: replaced the generic OTPF-4 assembler with a 97530-shaped
 * sentence-stack constructor. ADL/neuro activities currently routed
 * to v2 will read like therapeutic-activities notes through weeks
 * 2-4 until per-CPT assemblers land. v1 fallback unaffected.
 *
 * Architecture: per-note flow is opener -> pre-obs -> activity stack
 * -> cues -> summary-obs -> tolerance -> closer. No plan tail (P10).
 *
 * Each _render* helper returns string | null | { error, ... }.
 * Errors propagate; generate() returns string OR
 * { error, partial } so the translation layer can decide whether
 * to use the partial output or fall back to v1 entirely.
 *
 * Required-path vs optional-flow asymmetry (apply to all renderers):
 *   Hard-fail (return { error }) when a field is REQUIRED by the
 *     rendering path the engine has already committed to. e.g. once
 *     foregrounding picks "lead with quantification", a malformed
 *     quantification field is a developer bug — error and let the
 *     translation layer decide to fall back to v1.
 *   Graceful-degrade (return null) when a field is OPTIONAL in the
 *     per-note flow. Cues, observations, tolerance, closers are
 *     optional flow slots — if the input doesn't carry enough to
 *     render them in corpus voice, skip the slot, emit the rest of
 *     the note. No error.
 *   Test: required-path-component vs. optional-flow-slot.
 *
 * Patterns implemented:
 *   slice 1 — P1, P2, P3, P4 (orchestrator only), P7 (goal in opener
 *     position), P15 (foregrounding rule + operational tests + tiebreaker).
 *   slice 2 — P6 flat-cue form (single cue per note), P9 generic-progress
 *     closer.
 *   slice 3 — P-Obs-Pre/Within/Summary (single renderer, caller-tagged
 *     position) for kinds 'noted' / 'count-instances' / 'negation';
 *     P12 causal connector primitive ('secondary to' / '2/2', plus
 *     caller-controlled 'due to') with per-note cause registry
 *     (first-occurrence-wins dedup). Registry is threaded from
 *     generate() through every renderer that may emit a connector.
 *   slice 4 — P8 concrete tolerance for kinds 'np-required' /
 *     'patient-required'; uses the slice-3 P12 primitive + cause
 *     registry without rewrite (the seam was built in slice 3).
 * Stubbed (return null): P5 quantification rendering for non-foregrounded
 * slots, P6 chained-cue form and multi-cue stacks, P9 within-session
 * and cross-session improvement closers, P10 plan,
 * P-BackRef (return shape reserved in P12 primitive), P-Stack-Connectors.
 * Slice goal is sentence-shape match for verbatim corpus fragments.
 *
 * Spec: docs/97530-patterns.md is the bird's-eye spec (locked rules,
 * pattern catalog, current implementation status). docs/97530-corpus.md
 * is the evidence (bytes-for-bytes corpus + annotation index +
 * counter-examples). docs/corpus-typos.md is the registry of corpus
 * typos that must never appear in engine output. This docstring is
 * the implementation reference. When the spec and the engine
 * disagree, fix one, then fix the other in the same commit.
 */

const DockyEngine = {
  data: null,

  init: function(data) {
    this.data = data;
    return this;
  },

  /**
   * Generate a 97530-shaped clinical note.
   * Returns string on success; { error, partial } on required-slot failure.
   *
   * The per-note cause registry (P12) is created here and threaded
   * through every renderer that might emit a causal connector. Today
   * that's the observation slots; when P8 tolerance and P6 chained-cue
   * ship they pick up the registry by adding it to their signature
   * with no rewrite to the primitive.
   */
  generate: function(params) {
    const registry = { causesNamed: new Set() };
    const note = {
      opener: this._renderOpener(params),
      preObs: this._renderObservationsAt(params, 'pre', registry),
      activitySentences: this._renderActivityStack(params, registry),
      withinObs: this._renderObservationsAt(params, 'within', registry),
      cues: this._renderCues(params),
      summaryObs: this._renderObservationsAt(params, 'summary', registry),
      tolerance: this._renderTolerance(params, registry),
      closer: this._renderCloser(params)
    };
    return this._assembleNote(note);
  },

  // ───────────────────────────────────────────────────────────────
  // OPENER (P1 / P2 / P3)
  // ───────────────────────────────────────────────────────────────

  /**
   * Returns one of:
   *   string ending in ',' (P2/P3 — joins to next sentence-fragment)
   *   string ending in '.' (standalone opener)
   *   null  (no opener emitted; activity stack carries the note)
   *   { error } if a required field for the chosen type is missing
   */
  _renderOpener: function(params) {
    const op = params.opener;
    if (!op || !op.type || op.type === 'none') return null;

    if (op.type === 'to-promote') {
      // P2: "To [promote|improve|facilitate] X, [activity clause]."
      // The opener is a sentence-initial infinitive phrase that joins
      // to the first activity sentence with a comma.
      if (!op.goal) {
        return { error: 'opener_to_promote_missing_goal' };
      }
      const verb = op.verb || 'promote';
      return `To ${verb} ${op.goal},`;
    }

    if (op.type === 'skilled-interventions') {
      // P3: "Skilled interventions [focused on|included] X to Y."
      // Standalone sentence. Activity stack follows.
      if (!op.focus) {
        return { error: 'opener_skilled_missing_focus' };
      }
      const verb = op.verb || 'focused on';
      const tail = op.purpose ? ` to ${op.purpose}` : '';
      return `Skilled interventions ${verb} ${op.focus}${tail}.`;
    }

    if (op.type === 'activity-as-subject' || op.type === 'patient-as-agent') {
      // P1.a / P1.b: opener is null; the first activity sentence is
      // the opener. The activity-stack renderer handles subject choice
      // via params.activities[0].subject.
      return null;
    }

    return { error: 'opener_unknown_type', type: op.type };
  },

  // ───────────────────────────────────────────────────────────────
  // ACTIVITY STACK (P4 orchestrator + P15 foregrounding per activity)
  // ───────────────────────────────────────────────────────────────

  /**
   * Returns string[] (one rendered sentence per activity) | null | { error }.
   * The cause registry (P12) is created at generate() level and threaded
   * through here so activity sentences and observations share the same
   * dedup state. Activity-level P12 emission is deferred — when it
   * lands, it calls _renderCausalConnector(cause, registry) directly.
   */
  _renderActivityStack: function(params, registry) {
    const activities = params.activities || [];
    if (activities.length === 0) return null;

    const sentences = [];

    for (const raw of activities) {
      const activity = typeof raw === 'string' ? { id: raw } : raw;
      const result = this._renderActivitySentence(activity, params, registry);
      if (result && result.error) {
        return result; // bubble up
      }
      sentences.push(result.sentence);
    }

    // P-Stack-Connectors logic deferred: default sentence-boundary stacking.
    return sentences;
  },

  /**
   * Render one activity sentence using P15 foregrounding.
   * Returns { sentence } | { error, ... }.
   */
  _renderActivitySentence: function(activity, params, registry) {
    const label = activity.label || this._findActivityLabel(activity.id);
    if (!label) {
      return { error: 'activity_label_unresolved', activityId: activity.id };
    }

    const foreground = this._pickForegroundedComponent(activity);
    const isOpener = !!(params.opener && (params.opener.type === 'to-promote'
      || params.opener.type === 'patient-as-agent'
      || params.opener.type === 'activity-as-subject'));
    // Per-activity subject takes precedence; opener.type is fallback; default
    // is activity-as-subject. Lets stacked notes mix subjects.
    const subject = activity.subject
      || (params.opener && params.opener.type === 'patient-as-agent' ? 'patient-as-agent' : null)
      || 'activity-as-subject';

    if (foreground === 'quantification') {
      return this._renderQuantificationLed(activity, label, isOpener, subject);
    }
    if (foreground === 'equipment-substrate') {
      return this._renderEquipmentSubstrateLed(activity, label, isOpener);
    }
    if (foreground === 'position') {
      return this._renderPositionLed(activity, label, isOpener, subject);
    }
    if (foreground === 'activity-as-event') {
      return this._renderActivityAsEvent(activity, label, isOpener, subject);
    }

    return { error: 'no_foregroundable_signal', activityId: activity.id };
  },

  // ───────────────────────────────────────────────────────────────
  // FOREGROUNDING (P15: 4-component test, 8-step tiebreaker, omit-on-no-signal)
  // ───────────────────────────────────────────────────────────────

  /**
   * Returns one of: 'quantification' | 'equipment-substrate' | 'position'
   *   | 'activity-as-event' | null (no signal; caller emits error).
   */
  _pickForegroundedComponent: function(activity) {
    const q = this._classifyQuantification(activity.quantification);
    const e = this._classifyEquipment(activity.equipment);
    const p = this._classifyPosition(activity.position);

    // Tiebreaker: fraction > set > count > duration > distance
    //           > equipment-substrate > equipment-graded > equipment-qualifying
    //           > position > activity-as-event
    const ranked = [
      { key: 'quantification', sub: 'fraction',  rank: 1, present: q === 'fraction' },
      { key: 'quantification', sub: 'sets',      rank: 2, present: q === 'sets' },
      { key: 'quantification', sub: 'count',     rank: 3, present: q === 'count' },
      { key: 'quantification', sub: 'duration',  rank: 4, present: q === 'duration' },
      { key: 'quantification', sub: 'distance',  rank: 5, present: q === 'distance' },
      { key: 'equipment-substrate',  rank: 6, present: e.substrate },
      { key: 'equipment-graded',     rank: 7, present: e.graded },
      { key: 'equipment-qualifying', rank: 8, present: e.qualifying },
      { key: 'position',             rank: 9, present: p }
    ];
    const winner = ranked.find(r => r.present);
    if (winner) {
      // equipment-graded and equipment-qualifying still foreground as
      // 'equipment-substrate' rendering path; the distinction matters
      // for inline rendering, not for the lead.
      if (winner.key === 'equipment-graded' || winner.key === 'equipment-qualifying') {
        return 'equipment-substrate';
      }
      return winner.key;
    }
    // No signal foregrounded; activity-as-event is the fallback when
    // there's at least an activity label. Otherwise null (caller errors).
    return 'activity-as-event';
  },

  /**
   * Quantification operational test.
   * notable if: fraction (X/Y), set notation (NxR), count (specific N),
   *   duration (with implied baseline), distance (with clinical meaning).
   * not notable: generic ("multiple trials").
   * Returns the kind ('fraction'|'sets'|'count'|'duration'|'distance') or null.
   */
  _classifyQuantification: function(q) {
    if (!q || q.notable === false) return null;
    if (typeof q === 'string') {
      // String shortcut: try to detect kind
      if (/^\d+\/\d+/.test(q)) return 'fraction';
      if (/^\d+x\d+/i.test(q)) return 'sets';
      if (/\b(feet|ft|meters|m)\b/i.test(q)) return 'distance';
      if (/\b(minutes?|seconds?|min|sec)\b/i.test(q)) return 'duration';
      if (/^\d+\s+(reps?|trials?|items?)/i.test(q)) return 'count';
      return null;
    }
    if (q.type && q.value) {
      const kind = q.type;
      if (['fraction','sets','count','duration','distance'].indexOf(kind) === -1) return null;
      return kind;
    }
    return null;
  },

  /**
   * Equipment operational test.
   * Returns { substrate, graded, qualifying } booleans.
   */
  _classifyEquipment: function(eq) {
    if (!eq) return { substrate: false, graded: false, qualifying: false };
    return {
      substrate:  Array.isArray(eq.substrate)  && eq.substrate.length > 0,
      graded:     Array.isArray(eq.graded)     && eq.graded.length > 0,
      qualifying: Array.isArray(eq.qualifying) && eq.qualifying.length > 0
    };
  },

  /**
   * Position operational test.
   * notable if: non-default | transition | graded-variable | progression-marker.
   * not notable: default (the position the activity is always done in).
   */
  _classifyPosition: function(pos) {
    if (!pos) return false;
    if (typeof pos === 'string') return false; // bare strings are treated as default modifiers
    if (pos.notable === false) return false;
    if (pos.kind === 'default') return false;
    return !!pos.value;
  },

  // ───────────────────────────────────────────────────────────────
  // ACTIVITY-SENTENCE RENDERERS (one per foregrounded component)
  // Each returns { sentence } | { error }.
  // ───────────────────────────────────────────────────────────────

  /**
   * Quantification leads. Three shapes selected by subject + materialVerb:
   *
   *   Shape "patientQS" — patient-as-agent:
   *     "Patient <verb> <qStr> from <substrate>[ to <purpose>]."
   *     e.g. "Patient untied 9/9 knots from theraband."
   *
   *   Shape "qVerbS" — activity-as-subject WITH materialVerb:
   *     "<qStr> of <substrate-pivot> during <activity-label>[ <tail-pos>]."
   *     e.g. "4 feet of a lightweight rope rolled onto a dowel bar during
   *           wrist roller activity performed bilaterally."
   *
   *   Shape "qActivityS" — activity-as-subject WITHOUT materialVerb:
   *     "<qStr> of [<pre-pos> ]<activity-label>[ using <substrate>][ <tail-pos>]."
   *     e.g. "6 trials of standing Ring toss activity using 5 large
   *           lightweight rings."
   */
  _renderQuantificationLed: function(activity, label, isOpener, subject) {
    const q = activity.quantification;
    const qStr = this._renderQuantificationPhrase(q);
    if (!qStr) return { error: 'quantification_unrenderable', activityId: activity.id };

    const eq = activity.equipment || {};
    const substrate = (eq.substrate && eq.substrate.length) ? eq.substrate : null;
    const graded    = (eq.graded    && eq.graded.length)    ? eq.graded    : null;
    const pos = activity.position;
    const posKind = (pos && typeof pos === 'object') ? pos.kind : null;
    const posValue = (pos && typeof pos === 'object') ? pos.value : (typeof pos === 'string' ? pos : null);
    const prePosition  = (posKind === 'pre-modifier'  && posValue) ? posValue : null;
    const tailPosition = (posKind === 'tail-modifier' && posValue) ? posValue : null;

    let sentence;

    if (subject === 'patient-as-agent') {
      const verb = activity.verb;
      if (!verb) return { error: 'patient_as_agent_missing_verb', activityId: activity.id };
      sentence = `Patient ${verb} ${qStr}`;
      if (substrate) sentence += ` from ${this._formatList(substrate)}`;
      if (activity.purpose) sentence += ` to ${activity.purpose}`;
      sentence += '.';
      return { sentence };
    }

    // activity-as-subject paths
    if (substrate && activity.materialVerb) {
      // Shape "qVerbS" — substrate pivots through the middle of the sentence.
      const matVerb = activity.materialVerb;
      const pivot = substrate.length === 2
        ? `${substrate[0]} ${matVerb} ${substrate[1]}`
        : this._formatList(substrate);
      sentence = `${qStr} of ${pivot} during ${label}`;
      if (tailPosition) sentence += ` ${tailPosition}`;
      sentence += '.';
    } else {
      // Shape "qActivityS" — substrate (if any) attaches via "using" after activity.
      sentence = `${qStr} of `;
      if (prePosition) sentence += `${prePosition} `;
      sentence += label;
      if (substrate) {
        sentence += ` using ${this._formatList(substrate)}`;
      } else if (graded) {
        sentence += ` using ${this._formatList(graded)}`;
      }
      if (tailPosition) sentence += ` ${tailPosition}`;
      sentence += '.';
    }

    sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
    return { sentence };
  },

  /**
   * Substrate equipment leads. Used when no notable quantification but
   * substrate equipment is present.
   */
  _renderEquipmentSubstrateLed: function(activity, label, isOpener) {
    const eq = activity.equipment || {};
    const substrate = (eq.substrate && eq.substrate.length) ? eq.substrate : null;
    if (!substrate) return { error: 'substrate_unrenderable', activityId: activity.id };
    const positionTail = this._renderPositionTail(activity.position);
    let sentence = `${this._formatList(substrate)} used during ${label}`;
    if (positionTail) sentence += ` ${positionTail}`;
    sentence += '.';
    sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
    return { sentence };
  },

  /**
   * Position leads — "While <position>, <activity clause>."
   * Used for position-as-progression-marker per P15 refinement.
   */
  _renderPositionLed: function(activity, label, isOpener, subject) {
    const pos = activity.position;
    const posValue = typeof pos === 'string' ? pos : pos.value;
    if (!posValue) return { error: 'position_unrenderable', activityId: activity.id };
    const subjectStr = subject === 'patient-as-agent' ? 'the patient' : label;
    let sentence = `While ${posValue}, ${subjectStr}`;
    if (subject === 'patient-as-agent') {
      sentence += ` ${activity.verb || 'performed'} ${label}`;
    } else {
      sentence += ` performed`;
    }
    sentence += '.';
    return { sentence: sentence.charAt(0).toUpperCase() + sentence.slice(1) };
  },

  /**
   * Activity-as-event fallback. Emits a minimal sentence from label only.
   * Used when no foregrounding signal is present but an activity label is.
   */
  _renderActivityAsEvent: function(activity, label, isOpener, subject) {
    const verb = activity.verb || 'performed';
    let sentence;
    if (subject === 'patient-as-agent') {
      sentence = `Patient ${verb} ${label}.`;
    } else {
      sentence = `${label} ${verb}.`;
      sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
    }
    return { sentence };
  },

  // ───────────────────────────────────────────────────────────────
  // SUB-RENDERERS: quantification phrase, position tail
  // ───────────────────────────────────────────────────────────────

  _renderQuantificationPhrase: function(q) {
    if (!q) return null;
    if (typeof q === 'string') return q;
    if (q.value) return q.value;
    return null;
  },

  _renderPositionTail: function(pos) {
    if (!pos) return null;
    if (typeof pos === 'string') return pos;
    if (pos.kind === 'progression') return null; // handled by position-led renderer
    if (pos.value) return pos.value;
    return null;
  },

  // ───────────────────────────────────────────────────────────────
  // CUES (P6 — flat cue form only; chained-cue form deferred)
  //
  // GAP: the spec recognizes both flat ("Min verbal cues for pacing")
  // and chained ("min verbal cues to use previously trained breathing
  // techniques to improve activity tolerance and task performance,
  // secondary to symptoms of COPD") cue forms. The chained form is
  // the high-skill version that ties cueing -> means -> outcome and
  // optionally to a P12 cause. Until it ships, the engine emits only
  // the flat form, systematically under-reading skilled cueing on
  // any input that carries that structure. Close this before week 2
  // wraps.
  // ───────────────────────────────────────────────────────────────

  /**
   * Flat cue: "[quantity|level] [type] cues for [purpose][ <tail>]."
   *   - quantity: numeric ("1", "2"), preserved verbatim
   *   - level:    qualifier ("min", "Min", "mod", "MOD", "Intermittent")
   *               preserved verbatim — corpus does not normalize case
   *   - type:     "verbal" | "tactile" | "visual" (verbatim)
   *   - purpose:  free-text phrase. May begin with "for" already, or
   *               with "to" (purpose-clause form) — caller controls.
   *   - tail:     optional trailing phrase ("were required",
   *               "when reaching towards the ground"). Verbatim.
   *
   * Returns a single sentence string for now. When called with
   * cues = [], returns null (no sentence emitted).
   * Multi-cue stacking deferred — flag and bail with error.
   */
  _renderCues: function(params) {
    const cues = params.cues;
    if (!cues || !Array.isArray(cues) || cues.length === 0) return null;

    // Multi-cue stacking is deferred (chained cues + sentence-boundary
    // stack connectors land in a later slice). Skip silently rather than
    // erroring so a partially-mappable v1->v2 input still produces a
    // best-effort note.
    if (cues.length > 1) return null;

    const cue = cues[0];
    if (!cue.type || !cue.purpose) return null;
    const lead = cue.quantity || cue.level;
    if (!lead) return null;

    // If purpose matches a known v2 cuePurpose id, use its label (which
    // already begins with "for"). Otherwise treat as free text and
    // prepend "for" only when the phrase doesn't already start with
    // a binding word.
    let purposePhrase;
    const lookup = this.data && this.data.cuePurposes
      ? this.data.cuePurposes.find(p => p.id === cue.purpose)
      : null;
    if (lookup && lookup.label) {
      purposePhrase = lookup.label;
    } else {
      const p = String(cue.purpose).trim();
      purposePhrase = /^(for|to)\b/i.test(p) ? p : `for ${p}`;
    }

    let sentence = `${lead} ${cue.type} cues ${purposePhrase}`;
    if (cue.tail) sentence += ` ${String(cue.tail).trim()}`;
    sentence += '.';
    return sentence;
  },

  // ───────────────────────────────────────────────────────────────
  // CLOSER (P9 — generic-progress form only; within-session and
  // cross-session improvement closers deferred)
  // ───────────────────────────────────────────────────────────────

  /**
   * Generic-progress closer:
   *   "The patient continues to make good progress toward therapeutic goals."
   * Other closer types (within-session improvement, cross-session
   * improvement) return null until a later slice.
   *
   * P9 floor, not default: the generic closer is the floor when no
   * specific within-session observation is available. Once
   * _renderSummaryObs / within-session improvement closers land, this
   * renderer should defer to them (i.e. only emit the generic closer
   * when no more specific closing observation has been emitted).
   * Today the deference check is implicit because the only thing
   * competing for the closer slot is this renderer; that changes when
   * P-Obs-Within and the specific-improvement closer ship.
   */
  _renderCloser: function(params) {
    const c = params.closer;
    if (!c || !c.type || c.type === 'none') return null;
    if (c.type === 'generic-progress') {
      return 'The patient continues to make good progress toward therapeutic goals.';
    }
    return null;
  },

  // ───────────────────────────────────────────────────────────────
  // OBSERVATIONS (P-Obs-Pre / P-Obs-Within / P-Obs-Summary)
  //
  // Single renderer; placement is caller-controlled via the
  // observation's `position` field ('pre' | 'within' | 'summary',
  // default 'within' — the most common position in the corpus).
  // The engine never infers position from content. If translation
  // can't decide, it tags 'within' explicitly or omits the
  // observation entirely.
  //
  // Observation kinds (sentence shapes):
  //   'noted'           — "<content> noted [<context>]."
  //                       e.g. "Posterior retropulsion noted when standing from w/c."
  //   'count-instances' — "<count> instance[s] of <content>[ <qualifier>] noted."
  //                       e.g. "1 instance of instability without physical assist to correct noted."
  //                       Pluralization: count starting with "1 " or being
  //                       exactly "1" -> "instance"; everything else
  //                       (including "multiple") -> "instances".
  //   'negation'        — "<phrase>[ <temporal>]."
  //                       e.g. "No loss of balance this session."
  //
  // Causal tail (P12): if obs.cause is set, the renderer asks
  // _renderCausalConnector for the connector phrase. On 'emit', the
  // tail ", <connector> <cause.phrase>" is appended before the period.
  // On 'dedup', the tail is elided (slice 3 simple elision; richer
  // back-reference forms wait for P-BackRef in a later slice).
  // ───────────────────────────────────────────────────────────────

  /**
   * Render observations whose `position` matches the requested slot.
   * Returns string (sentences joined by single space) | null.
   * Per the renderer asymmetry rule: observations are an optional
   * flow slot, so missing/unsupported inputs degrade silently.
   */
  _renderObservationsAt: function(params, position, registry) {
    const all = params.observations;
    if (!all || !Array.isArray(all) || all.length === 0) return null;
    const filtered = all.filter(o => (o && (o.position || 'within')) === position);
    if (filtered.length === 0) return null;

    const sentences = [];
    for (const obs of filtered) {
      const s = this._renderObservation(obs, registry);
      if (s) sentences.push(s);
    }
    if (sentences.length === 0) return null;
    return sentences.join(' ');
  },

  /**
   * Render one observation. Returns string | null.
   */
  _renderObservation: function(obs, registry) {
    if (!obs || !obs.kind) return null;

    if (obs.kind === 'noted') {
      if (!obs.content) return null;
      let s = obs.content + ' noted';
      if (obs.context) s += ' ' + obs.context;
      s = this._appendCausalTail(s, obs, registry);
      return s + '.';
    }

    if (obs.kind === 'count-instances') {
      if (!obs.count || !obs.content) return null;
      const countStr = String(obs.count).trim();
      const word = (countStr === '1' || /^1\s/.test(countStr)) ? 'instance' : 'instances';
      let s = `${countStr} ${word} of ${obs.content}`;
      if (obs.qualifier) s += ' ' + obs.qualifier;
      s += ' noted';
      s = this._appendCausalTail(s, obs, registry);
      return s + '.';
    }

    if (obs.kind === 'negation') {
      if (!obs.phrase) return null;
      let s = obs.phrase;
      if (obs.temporal) s += ' ' + obs.temporal;
      s = this._appendCausalTail(s, obs, registry);
      return s + '.';
    }

    return null;
  },

  /**
   * Append a P12 causal tail to a sentence body (no terminating period
   * yet). Caller adds the period after this returns. Honors dedup —
   * when the connector primitive returns null with reason 'dedup', the
   * tail is elided entirely.
   *
   * Separator: by default a comma joins body and connector
   *   ("X required, secondary to Y") because that's the dominant
   *   form in the corpus. The corpus also contains compact
   *   no-comma attachments ("X required secondary to Y") with no
   *   clean rule distinguishing the two. Caller controls via
   *   obs.tightCause: when true, the separator is a single space
   *   instead of ", ". Default false.
   */
  _appendCausalTail: function(body, obs, registry) {
    if (!obs.cause) return body;
    const result = this._renderCausalConnector(obs.cause, registry, {
      connector: obs.connector
    });
    if (result && result.phrase) {
      const sep = obs.tightCause ? ' ' : ', ';
      return body + sep + result.phrase + ' ' + obs.cause.phrase;
    }
    // dedup or no-emit -> bare elision (no connector tail)
    return body;
  },

  // ───────────────────────────────────────────────────────────────
  // P12 CAUSAL CONNECTOR PRIMITIVE
  //
  // Single point of decision for which connector ("secondary to" /
  // "2/2" / "due to") attaches a cause to a sentence body, and for
  // dedup against the per-note cause registry.
  //
  // Returns one of three shapes (slice 3 only emits the first two;
  // the third is reserved for P-BackRef in a later slice and is
  // included now so the interface doesn't change later):
  //
  //   { phrase: '<connector>', reason: 'emit' }
  //       — caller emits ", <phrase> <cause.phrase>"
  //   { phrase: null, reason: 'dedup' }
  //       — caller elides the connector tail (bare elision in slice 3;
  //         future slices may emit a back-reference form here)
  //   { phrase: null, reason: 'backref', backRef: '<phrase>' }
  //       — caller emits the back-reference phrase. Reserved; not
  //         produced in slice 3.
  //
  // Default rules (when caller doesn't specify options.connector):
  //   functional-state              -> '2/2'
  //   symptom | diagnostic | behavior -> 'secondary to'
  //
  // Caller control: options.connector overrides the default. This is
  // how 'due to' enters the engine — only when caller asks. The
  // engine never picks 'due to' on its own; the corpus has too few
  // instances to lock an attachment rule. If a future slice promotes
  // 'due to' to a default, this comment block must be updated.
  //
  // Dedup uses a normalized cause.phrase as the key (lowercased,
  // whitespace-trimmed). The locked dedup rule says the proximal
  // occurrence wins; this primitive is "first occurrence wins"
  // because callers emit in document order. Anything stricter
  // (re-ordering, scoring) belongs upstream of this primitive.
  // ───────────────────────────────────────────────────────────────

  _renderCausalConnector: function(cause, registry, options) {
    options = options || {};
    if (!cause || !cause.phrase) {
      return { phrase: null, reason: 'no-cause' };
    }

    const key = String(cause.phrase).trim().toLowerCase();
    if (registry && registry.causesNamed && registry.causesNamed.has(key)) {
      return { phrase: null, reason: 'dedup' };
    }

    let phrase;
    if (options.connector) {
      // Caller-controlled — passes 'secondary to', '2/2', or 'due to'.
      phrase = options.connector;
    } else if (cause.kind === 'functional-state') {
      phrase = '2/2';
    } else {
      phrase = 'secondary to';
    }

    if (registry && registry.causesNamed) {
      registry.causesNamed.add(key);
    }
    return { phrase, reason: 'emit' };
  },

  // ───────────────────────────────────────────────────────────────
  // TOLERANCE (P8 — concrete tolerance sentence)
  //
  // Two sentence shapes covering the corpus tolerance forms:
  //
  //   'np-required'      — "<np> required[ <temporal>][, <P12 tail>]."
  //                        e.g. "Short rest period required throughout session."
  //                        e.g. "Multiple trials with short recovery periods required."
  //                        e.g. "2 rest required secondary to decreased activity tolerance."
  //
  //   'patient-required' — "Patient required <np>[, <P12 tail>]."
  //                        e.g. "Patient required multiple short breaks."
  //
  // Both shapes accept an optional `cause` (P12) tail, threaded
  // through _appendCausalTail and the per-note cause registry.
  // Caller controls the connector via t.connector — the corpus
  // counter-example "2 rest required secondary to decreased activity
  // tolerance" attaches 'secondary to' to a bare functional-state
  // noun, contradicting the engine's default ('2/2' for
  // functional-state). The override is how the caller honors the
  // counter-example without changing the default rule.
  //
  // Tolerance is an OPTIONAL flow slot: missing / unsupported inputs
  // return null and the engine emits the rest of the note.
  // ───────────────────────────────────────────────────────────────

  _renderTolerance: function(params, registry) {
    const t = params.tolerance;
    if (!t || !t.kind) return null;

    let body;
    if (t.kind === 'np-required') {
      if (!t.np) return null;
      body = t.np + ' required';
      if (t.temporal) body += ' ' + t.temporal;
    } else if (t.kind === 'patient-required') {
      if (!t.np) return null;
      body = 'Patient required ' + t.np;
    } else {
      return null;
    }

    body = this._appendCausalTail(body, t, registry);
    return body + '.';
  },

  // ───────────────────────────────────────────────────────────────
  // STUBBED RENDERERS (return null until later slices)
  // ───────────────────────────────────────────────────────────────


  // ───────────────────────────────────────────────────────────────
  // ASSEMBLY (dumb: filter, propagate errors, join)
  // ───────────────────────────────────────────────────────────────

  _assembleNote: function(note) {
    // Error propagation: if any required slot returned an error object,
    // bubble it up with whatever partial string we can assemble from the
    // remaining successful slots.
    const slots = ['opener','preObs','activitySentences','withinObs','cues','summaryObs','tolerance','closer'];
    for (const s of slots) {
      if (note[s] && note[s].error) {
        return { error: note[s].error, partial: this._joinPartial(note), slot: s };
      }
    }

    const parts = [];
    if (note.opener) parts.push(note.opener);
    if (note.preObs) parts.push(note.preObs);
    if (Array.isArray(note.activitySentences)) parts.push(...note.activitySentences);
    if (note.withinObs)  parts.push(note.withinObs);
    if (note.cues)       parts.push(note.cues);
    if (note.summaryObs) parts.push(note.summaryObs);
    if (note.tolerance)  parts.push(note.tolerance);
    if (note.closer)     parts.push(note.closer);

    // P2 opener ends with ',' and joins to next part with a space then
    // a lowercase first letter of the next part.
    let out = '';
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (i === 0) { out = p; continue; }
      const prev = parts[i - 1];
      if (typeof prev === 'string' && prev.endsWith(',')) {
        out += ' ' + (p.charAt(0).toLowerCase() + p.slice(1));
      } else {
        out += ' ' + p;
      }
    }
    return out;
  },

  _joinPartial: function(note) {
    const ok = (v) => typeof v === 'string' ? v : (Array.isArray(v) ? v.filter(s => typeof s === 'string').join(' ') : '');
    return [
      ok(note.opener),
      ok(note.preObs),
      ok(note.activitySentences),
      ok(note.withinObs),
      ok(note.cues),
      ok(note.summaryObs),
      ok(note.tolerance),
      ok(note.closer)
    ].filter(Boolean).join(' ');
  },

  /**
   * Generate multiple notes in batch mode
   *
   * @param {Object[]} paramsList - Array of note parameters
   * @returns {string[]} Array of generated notes
   */
  generateBatch: function(paramsList) {
    return paramsList.map(params => this.generate(params));
  },

  /**
   * Generate Part B expansion sentences
   */
  _generatePartB: function(partB) {
    const sentences = [];

    if (partB.skilledService) {
      sentences.push(`Skilled OT services required: ${partB.skilledService}.`);
    }

    if (partB.medicalNecessity) {
      sentences.push(partB.medicalNecessity);
    }

    if (partB.plof) {
      sentences.push(`PLOF: ${partB.plof}.`);
    }

    if (partB.dischargePlan) {
      sentences.push(`D/C plan: ${partB.dischargePlan}.`);
    }

    if (partB.goalWithTimeframe) {
      const { action, assistLevel, timeframe } = partB.goalWithTimeframe;
      if (action && assistLevel && timeframe) {
        const assistData = this.data.assistLevels.find(a => a.id === assistLevel);
        const assistLabel = assistData?.label || assistLevel;
        sentences.push(`Goal: Patient will ${action} ${assistData?.phrase || 'with ' + assistLabel} within ${timeframe}.`);
      }
    }

    return sentences;
  },

  /**
   * Find activity label by ID
   */
  _findActivityLabel: function(activityId) {
    const activity = this.data.findActivity(activityId);
    return activity ? activity.label : null;
  },

  /**
   * Categorize skills by type (motor/process/social)
   */
  _categorizeSkills: function(skillIds) {
    const categories = new Set();

    for (const skillId of skillIds) {
      // Check motor skills
      if (this.data.performanceSkills.motor.skills.some(s => s.id === skillId)) {
        categories.add('motor');
      }
      // Check process skills
      if (this.data.performanceSkills.process.skills.some(s => s.id === skillId)) {
        categories.add('process');
      }
      // Check social skills
      if (this.data.performanceSkills.social.skills.some(s => s.id === skillId)) {
        categories.add('social');
      }
    }

    const categoryList = Array.from(categories);
    if (categoryList.length === 0) return 'performance';
    if (categoryList.length === 1) return categoryList[0];
    if (categoryList.length === 2) return `${categoryList[0]}/${categoryList[1]}`;
    return 'motor/process/social';
  },

  /**
   * Format a list of items with proper grammar
   * @param {string[]} items - Items to format
   * @returns {string} Formatted list
   */
  _formatList: function(items) {
    if (!items || items.length === 0) return '';
    const filtered = items.filter(i => i != null && i !== '');
    if (filtered.length === 0) return '';
    if (filtered.length === 1) return filtered[0];
    if (filtered.length === 2) return `${filtered[0]} and ${filtered[1]}`;
    return `${filtered.slice(0, -1).join(', ')}, and ${filtered[filtered.length - 1]}`;
  },

  /**
   * Generate SOAP format note
   *
   * @param {Object} params - Note parameters plus SOAP-specific fields
   * @returns {Object} { subjective, objective, assessment, plan }
   */
  generateSOAP: function(params) {
    const {
      subjective,
      activities,
      performanceSkills,
      assist,
      location,
      cues,
      goal,
      tolerance,
      progress,
      plan
    } = params;

    // Subjective
    const sSection = subjective || 'Patient reports readiness to participate in therapy.';

    // Objective
    const oSentences = [];
    const activityLabels = (activities || []).map(id =>
      this._findActivityLabel(id)
    ).filter(Boolean);

    if (activityLabels.length > 0) {
      const activityStr = this._formatList(activityLabels);
      const assistData = this.data.assistLevels.find(a => a.id === assist);
      const assistPhrase = assistData?.phrase || '';
      const locationData = this.data.assistLocations.find(l => l.id === location);
      const locationPhrase = locationData?.label || '';

      let objLine = `Patient participated in ${activityStr}`;
      if (assistPhrase) objLine += ` ${assistPhrase}`;
      if (locationPhrase) objLine += ` ${locationPhrase}`;
      objLine += '.';
      oSentences.push(objLine);
    }

    if (cues && cues.length > 0) {
      const cueStrs = cues.map(c => {
        const type = this.data.cueTypes.find(t => t.id === c.type);
        const purpose = this.data.cuePurposes.find(p => p.id === c.purpose);
        return `${type?.label || c.type} cues ${purpose?.label || ''}`.trim();
      });
      oSentences.push(`${this._formatList(cueStrs)} provided.`);
    }

    if (performanceSkills && performanceSkills.length > 0) {
      const skillLabels = performanceSkills.map(id => {
        const skill = this.data.findSkill(id);
        return skill ? skill.label.toLowerCase() : null;
      }).filter(Boolean);

      if (skillLabels.length > 0) {
        oSentences.push(`Addressed: ${this._formatList(skillLabels)}.`);
      }
    }

    if (tolerance) {
      const tolData = this.data.tolerance.find(t => t.id === tolerance);
      if (tolData) oSentences.push(tolData.phrase);
    }

    const oSection = oSentences.join(' ');

    // Assessment
    const aSentences = [];
    if (progress) {
      const progData = this.data.progress.find(p => p.id === progress);
      if (progData) aSentences.push(progData.phrase);
    }
    if (goal) {
      aSentences.push(`Working toward: ${goal}.`);
    }
    const aSection = aSentences.join(' ');

    // Plan
    const pSentences = [];
    if (plan) {
      const planData = this.data.plan.find(p => p.id === plan);
      if (planData) pSentences.push(planData.phrase);
    }
    const pSection = pSentences.join(' ');

    return {
      subjective: sSection,
      objective: oSection,
      assessment: aSection,
      plan: pSection,
      formatted: `S: ${sSection}\nO: ${oSection}\nA: ${aSection}\nP: ${pSection}`
    };
  },

  /**
   * Generate DAP format note
   *
   * @param {Object} params - Note parameters
   * @returns {Object} { data, assessment, plan }
   */
  generateDAP: function(params) {
    const soap = this.generateSOAP(params);

    return {
      data: `${soap.subjective} ${soap.objective}`,
      assessment: soap.assessment,
      plan: soap.plan,
      formatted: `D: ${soap.subjective} ${soap.objective}\nA: ${soap.assessment}\nP: ${soap.plan}`
    };
  },

  /**
   * Parse shorthand input and generate note
   * Example: "sts mina trunk vc safety tw imp cont"
   *
   * @param {string} shorthand - Space-separated shorthand codes
   * @returns {Object} Parsed parameters ready for generate()
   */
  parseShorthand: function(shorthand) {
    const tokens = shorthand.toLowerCase().split(/\s+/);
    const params = {
      activities: [],
      performanceSkills: [],
      assist: null,
      location: null,
      cues: [],
      goal: null,
      tolerance: null,
      progress: null,
      plan: null
    };

    let pendingCueType = null;

    for (const token of tokens) {
      // Check activities
      if (this.data.shortcuts.activities[token]) {
        params.activities.push(this.data.shortcuts.activities[token]);
        continue;
      }

      // Check assist levels
      if (this.data.shortcuts.assist[token]) {
        params.assist = this.data.shortcuts.assist[token];
        continue;
      }

      // Check locations
      const locationMatch = this.data.assistLocations.find(l =>
        l.id === token || l.label.toLowerCase().includes(token)
      );
      if (locationMatch) {
        params.location = locationMatch.id;
        continue;
      }

      // Check cue types
      if (this.data.shortcuts.cueTypes[token]) {
        pendingCueType = this.data.shortcuts.cueTypes[token];
        continue;
      }

      // Check cue purposes (if we have a pending cue type)
      const purposeMatch = this.data.cuePurposes.find(p =>
        p.id === token || p.label.toLowerCase().includes(token)
      );
      if (purposeMatch && pendingCueType) {
        params.cues.push({ type: pendingCueType, purpose: purposeMatch.id });
        pendingCueType = null;
        continue;
      }

      // Check tolerance
      if (this.data.shortcuts.tolerance[token]) {
        params.tolerance = this.data.shortcuts.tolerance[token];
        continue;
      }

      // Check progress
      if (this.data.shortcuts.progress[token]) {
        params.progress = this.data.shortcuts.progress[token];
        continue;
      }

      // Check plan
      if (this.data.shortcuts.plan[token]) {
        params.plan = this.data.shortcuts.plan[token];
        continue;
      }
    }

    // If we have activities but no goal, use smart defaults
    if (params.activities.length > 0 && !params.goal) {
      const firstActivity = params.activities[0];
      const defaults = this.data.smartDefaults[firstActivity];
      if (defaults && defaults.goals && defaults.goals.length > 0) {
        params.goal = defaults.goals[0];
      }
    }

    // If we have activities but no skills, use smart defaults
    if (params.activities.length > 0 && params.performanceSkills.length === 0) {
      const firstActivity = params.activities[0];
      const defaults = this.data.smartDefaults[firstActivity];
      if (defaults && defaults.skills) {
        params.performanceSkills = defaults.skills.slice(0, 3);
      }
    }

    return params;
  },

  /**
   * Generate note from shorthand input
   *
   * @param {string} shorthand - Space-separated shorthand codes
   * @returns {string} Generated clinical note
   */
  generateFromShorthand: function(shorthand) {
    const params = this.parseShorthand(shorthand);
    return this.generate(params);
  }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DockyEngine;
}
if (typeof window !== 'undefined') {
  window.DockyEngine = DockyEngine;
}
