# Air2Ground Resilient

A mobile app that coaches people toward practical resilience **right where they are** — apartment renter to acreage owner. Not a homesteading or gear-heavy prepper product: it meets people in their actual living situation, with their actual constraints and budget.

Built on three pillars: beautiful, calm design · an AI coach primed on the Air2Ground philosophy · a personalized experience that feels human, not technical.

---

## Project status

**Stage:** Interactive prototype + first authored content core. Pre-build.

**What exists:**
- A working, tappable proof-of-concept (assessment → personalized resilience profile → ranked action path)
- A matching action-detail page (the experience "behind the tap" for a single action)
- The first flagship content core fully authored in the Air2Ground voice (1.1 — Water Reserve), across all three living-situation profiles
- A complete authoring backlog: 27 cores across five pillars, with a 9-item launch set identified
- The a2g logo cut out clean and tinted to the palette

**Phase 1 is built:** the real Next.js app (assessment → profile → path) lives in `app/`, deploys to Netlify as a static export via `netlify.toml`. Phases 2–5 (auth, persistence, live coach, payments) build on this foundation per `docs/BUILD-BRIEF.md`.

**What's next:** see [`docs/NEXT-STEPS.md`](docs/NEXT-STEPS.md).

---

## Repo structure

```
a2g-resilient/
├── prototype/          Interactive HTML prototypes (open in any browser)
│   ├── index.html              Main flow: assessment → profile → path
│   └── action-detail.html      Single-action detail experience (3 profiles)
├── content/            Authored coaching content
│   ├── core-1.1-water-reserve.md   First flagship core (the template/mold)
│   └── authoring-backlog.md        All 27 cores, launch set marked
├── assets/             Brand assets
│   └── a2g_v2_*.png            Logo, transparent, in 5 palette tints
└── docs/               Reference + planning
    ├── design-pass-reference.html  Design system / button-state gallery
    └── NEXT-STEPS.md               Where to pick up
```

## Running the prototype

No build step. Open `prototype/index.html` in any browser — desktop or mobile. It's fully self-contained (logo embedded, no external dependencies). Tap through the assessment and watch the profile and action path personalize to the answers.

---

## Design system (for the real build)

The look is defined by CSS custom properties at the top of each prototype file — reuse these as the design tokens so every new screen stays consistent:

- **Palette:** warm paper background, field-green (`--moss`) primary, terracotta (`--clay`) accent, wheat-gold (`--gold`), espresso for the logo
- **Type:** Fraunces (display headings), Newsreader (warm body/serif moments), Spline Sans (UI)
- **Patterns:** centered heading hierarchy (eyebrow → display → lede → flourish), depth-styled buttons with rest/hover/press/selected/loading states, gradient hairline borders, gentle motion (no spinning)

## Content model (important)

The app blends three content layers — keep them distinct in the build:
1. **Authored core (fixed):** the steps themselves. On-brand, trustworthy, the same for everyone. *This is the moat — written by people who actually live this.*
2. **AI-personalized (per profile):** the "why," the constraint callout, the budget-scaled supplies — adapted to the user's situation.
3. **Contextual coach (live):** the "ask about this step" Q&A, powered by the Claude API, primed on the Air2Ground philosophy.

Note: the customer-facing UI deliberately **does not** label these layers ("AI-personalized," etc.) — that breaks the spell. A subtle "For you" touch signals personalization without naming the technology.

## ⚠️ Content accuracy

Resilience content can carry real safety stakes. Cores are authored to well-established standards, and any item that needs source verification before going in front of a paying customer is flagged **⟦VERIFY⟧** in the content files. Do not remove those flags without clearing them against an authoritative source. (Core 1.1 has three open verify items — see the bottom of `content/core-1.1-water-reserve.md`.)

---

*Air2Ground — building self-sufficiency, deepening the customer relationship, staying authentic to the brand.*
