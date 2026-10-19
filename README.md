# Physics Field Notes

Open Physics-Field-Notes-offline.html directly, or serve dist/ using npm run serve. The standalone file needs no internet connection. Learn & Explore provides step-linked physical diagrams and four teaching-card accordions per lesson; Guided Practice provides staged mapping, numerical and conceptual questions. The app uses the same Field Notes layout and two modes as Orgo, Biology and Biochemistry.

The first full-outline build includes all 12 chapters of the supplied Physics and Math outline: 54 concise lessons, 216 walkthrough steps, 54 workshops, 162 practice stages, 72 numerical questions and 216 teaching cards. Chapters 10–12 cover Mathematics, Research Design and Statistical Reasoning. Numerical problems are original hypothetical scenarios with stated units and model assumptions. Original diagrams are illustrative models, not measured experiments or exact scale drawings.

## Development

- npm install; npx playwright install chromium on a new machine.
- python -m pip install -r testing/requirements.txt for JSON Schema validation.
- npm test validates schemas, builds both outputs, regenerates source-hashed review packets, then runs unit, regression, full-course, accessibility and visual tests.
- npm run packets:check detects source/payload staleness without regeneration.
- npm run report requires every current-source complete software result to pass first.

Edit canonical JSON under dev/chapters. Shared UI/validation/progress code and original SVG scenes live in dev/src. project-layout.json documents dev/testing/review conventions. The private book remains outside this project. No book files, reference figures, third-party fonts or external model output are needed by either build artifact.

## Limits

This is one condensed lesson and one three-stage workshop per declared outline section, not exhaustive textbook or MCAT coverage. Independent physics/statistics/visual review remains pending. Passing tests do not prove scientific correctness. Existing interactivity includes diagram selection, step focus, numerical input and playback in selected physical processes; continuous parameter simulations are a future extension. Additional topic depth, broader free-response reasoning and manual assistive-technology checks remain useful. See SCIENCE_REVIEW.md and PROJECT_PLAN.md.
