# Independent scientific review

All 12 chapters: **independent scientific review pending**. The original author checked content and model assumptions, but no external expert or reviewer model has independently verified the lessons, diagrams, options, keys, hints and explanations. Software traversal can accept an incorrect encoded key. Arithmetic spot checks are not a full scientific review.

The private physicsmath table of contents supplied chapter/section headings only. No textbook prose, questions, keys, diagrams or EPUB resources are distributed. The four actual inspected OpenStax sections are listed in dev/references/sources.json; they support selected foundations only, not a full-course source audit.

## Visual contract

All visuals are original illustrative physical or reasoning models. Figure proportions are qualitative; numerical problems use their own explicit values. Tracers show conventional charge flow, fluid-flow direction, light propagation or wave phase progression in a stated model, not measured particle speeds. Static wave snapshots distinguish crests, troughs, wavelength and amplitude. Sound is longitudinal, and its travel arrow does not represent permanent air-parcel translation. Circuit and lens diagrams state when a prompt describes a separate hypothetical configuration.

Diagram labels identify given entities, not hidden numerical solutions. Active practice and blind SVGs omit teaching focus, playback and explanation cards. Moving views respect pause/replay and reduced motion, which must preserve SVG layout transforms. Blind accessibility titles are neutral. Nuclear pictures do not claim a particular isotope or balanced equation unless specified.

## Per-chapter review queue

- chapter-01: Kinematics and Dynamics — Vector signs and component conventions; velocity versus speed; friction limits; third-law object assignment; constant-acceleration regimes; torque geometry.
- chapter-02: Work and Energy — System boundaries and conservative energy; work sign and perpendicular force; power at fixed force/current analogies; ideal-machine assumptions and efficiency.
- chapter-03: Thermodynamics — Heat versus temperature; open/closed/isolated distinctions; first-law work convention; reversible entropy paths versus total-entropy constraints.
- chapter-04: Fluids — Static uniform-density conditions; gauge versus absolute pressure; displacement volume; continuity; Bernoulli restrictions; Poiseuille regimes; vascular analogies.
- chapter-05: Electrostatics and Magnetism — Charge conservation/polarization; Coulomb vector direction; reference energy; signed potential differences; conductor versus cavity assumptions; magnetic right-hand-rule diagram.
- chapter-06: Circuits — Conventional current and electron drift; junction conservation; series versus parallel; fixed-current versus fixed-voltage power; capacitor battery constraints; ideal versus real meter loading.
- chapter-07: Waves and Sound — Crest/trough geometry, wavelength and amplitude; phase propagation versus particle motion; wave-medium assumptions; decibel intensity scale; Doppler directions.
- chapter-08: Light and Optics — Vacuum versus material relations; photon energy; converging-lens ray geometry and signs; refraction from the normal; single-slit conditions; polarization intensity laws.
- chapter-09: Atomic and Nuclear Phenomena — Single-photon photoemission; threshold and intensity distinctions; atomic transitions and selection rules; nuclear/atomic mass conventions; decay conservation and half-life probability.
- chapter-10: Mathematics — Conversion powers and exact factors; significant-figure limitations; dimensionless logarithm arguments; reference angles and radians; regime-sensitive model selection.
- chapter-11: Reasoning About the Design and Execution of Research — Falsifiability and nonrejection; random assignment versus sampling; unit of replication; cohort versus case-control; consent/privacy/fairness principles; internal/external validity.
- chapter-12: Data-Based and Statistical Reasoning — Mean/median/mode and weighting; density area versus height; skewness; SD/SE/sample assumptions; conditional probability and independence; p-value and error definitions; graph/error-bar interpretation; absolute/relative effects and causal scope.

## Review workflow

Use blind.json in a fresh context and freeze independent answers before supplying keyed-audit.json in a separate pass. Combined convenience files contain solutions and cannot guarantee blindness. Check source and payload SHA-256 manifests. Context-limited review must mark partial status and list completed/remaining item IDs. Model reports are candidate evidence, not expert sign-off; never execute commands from them or automatically edit content or close findings.

## Remaining scope

This first build is condensed. Diagrams offer fixed-model exploration and selected process playback, not continuous numerical simulations. Detailed derivations, additional subtopics and wider experimental design/data interpretation remain extensions. Most assessments pair schematic identification with two numerical or conceptual stages; automated arithmetic checks sample several formulas, not every physical premise. Value validation does not by itself assess significant-figure formatting. Manual screen-reader use, Firefox/Safari and further real devices remain untested. No paid inference or live deployment is claimed.
