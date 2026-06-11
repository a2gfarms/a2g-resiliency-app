# Air2Ground Resilient — Build Brief
### *The hand-off document for Claude Code. Read fully before writing code.*

---

## 1. What we're building

A subscription web app that coaches people toward practical resilience **right where they are** — apartment renter to acreage owner. Assessment → personalized resilience profile → ranked action path → guided, checkable action cores → live AI coach.

**Non-negotiable principles:**
- **Calm, not fear.** No prepper aesthetics, no urgency manipulation. The design and copy stay warm, grounded, capable.
- **Three content layers, never labeled.** (1) Authored fixed steps — the brand moat, never AI-improvised. (2) Profile-personalized elements (why, constraint callout, supplies). (3) Live contextual coach. The UI must NOT expose this architecture — no "AI-generated" labels. A subtle "For you" touch is the only personalization signal.
- **Safety discipline.** Content flagged ⟦VERIFY⟧ in the content files must not ship to paying customers until cleared. The coach must never improvise on safety-critical topics (water treatment, food safety, CO/heat, medical) — it follows the guardrails in §6.
- **The prototypes are the spec for look and feel.** `/prototype/index.html` and `/prototype/action-detail.html` define the design tokens, motion, and component patterns. Reuse their CSS custom properties as the design system.

## 2. Stack (chosen for speed, low cost, and the team's Claude Code workflow)

- **Framework:** Next.js (App Router) — one codebase, server routes for the coach API. NOTE: we deploy to **Netlify**, not Vercel — configure the Netlify Next.js adapter from the start. (If a simpler framework better suits Netlify at Phase 1, builder's call — "deploys cleanly to Netlify" is the constraint.)
- **Database + Auth:** Supabase — Postgres, email/magic-link auth, row-level security. (Existing **paid** team account — create a **new, separate project** for Resilient; do not reuse the Meats app project. Separate data, separate keys, clean business separation.)
- **Hosting:** **Netlify** (existing team account from the Meats app — free tier is fine through beta). Connect the GitHub repo for auto-deploys.
- **Payments:** Stripe — subscription product, `founding` price (~$9/mo or ~$79/yr) created but NOT enforced until after beta
- **AI:** Anthropic API (Claude) for the coach — server-side only, key in env, never client-side
- **PWA:** installable manifest + icons (use `/assets/a2g_v2_espresso.png` derivatives) so it lives on phone home screens

## 3. Data model (Postgres / Supabase)

```
users                    (Supabase auth)
profiles                 user_id PK→users, living TEXT, skills TEXT, budget TEXT,
                         constraints TEXT[], worry TEXT, pace TEXT,
                         scores JSONB {food,water,power,supply,skill,overall},
                         created_at, updated_at
cores                    id TEXT PK (e.g. '1.1'), pillar TEXT, title TEXT,
                         promise TEXT, steps JSONB, a2g_note TEXT,
                         profiles JSONB {apt:{why,callout,supplies,chips},suburb:{...},rural:{...}},
                         verify_clear BOOL DEFAULT false, published BOOL DEFAULT false
core_progress            user_id, core_id, checked_steps INT[], completed_at NULL,
                         PK (user_id, core_id)
coach_messages           id, user_id, core_id NULL, role TEXT, content TEXT, created_at
subscriptions            user_id PK, stripe_customer_id, stripe_sub_id, status, price_id, current_period_end
```

Content lives in the DB (seeded from `/content/*.md`), not hardcoded — so new cores publish without deploys. `published=false` and `verify_clear=false` gate what users see.

## 4. Screens (mapping to prototypes)

1. **Landing / hero** → prototype index hero. CTA into assessment. Espresso logo.
2. **Assessment (6 questions)** → prototype exactly: option cards, progress dots, loading CTA.
3. **Results / path** → score ring, pillar bars, ranked action tiles. Tiles now LINK to action detail.
4. **Action detail** → prototype action-detail minus the profile toggle (profile comes from the user's saved assessment). Checkable steps persist to `core_progress`; completing all steps raises the relevant pillar score (+8 per completed core, capped 92) and shows a quiet celebratory moment.
5. **Coach (contextual + general)** → chat UI per prototype coach card. Seeded chips per core/profile.
6. **Account** → email, subscription status, restart assessment.
7. **Auth** → magic-link sign-in (no passwords to manage).
8. **Paywall (post-beta)** → after assessment + first core free, subscribe to unlock full path. Founding-member framing, warm copy, never fear-based.

## 5. Coach API design

`POST /api/coach` (server route):
- Auth required. Inputs: `message`, optional `core_id`.
- Server assembles: system prompt (§6) + user profile summary + current core's authored content (if core_id) + last ~10 messages.
- Calls Anthropic API, streams response, persists both messages.
- Rate limit: 30 messages/day/user during beta (protects cost; revisit later).

## 6. Coach system prompt (use verbatim as the base)

```
You are the Air2Ground Resilience Coach, built by Rich and Shelley of Air2Ground
Farms. You help people build practical resilience right where they live — an
apartment, a suburb, or rural land. You speak in the Air2Ground voice: warm,
direct, capable, and calm. Mostly "you," occasionally "we" for warmth. Short
paragraphs. No fear, no doom, no prepper jargon, no shaming anyone for being
a beginner. The philosophy: start where you stand; one small step beats a
perfect plan; resilience is a practice, not a panic.

You will be given the user's profile (living situation, skills, budget,
constraints, top concern, pace) and, when relevant, the authored content of
the action they're working on. Personalize to their reality. Never recommend
purchases beyond their stated budget tier without acknowledging the honest
cheap path first. Respect stated constraints absolutely (lease/HOA rules,
health flags like alpha-gal, limited space or time).

SAFETY RULES — these override everything else:
- The authored steps are fixed. You may explain, sequence, and adapt them to
  the user's situation; you may not contradict them or invent alternative
  methods for safety-critical procedures.
- For water treatment/purification, food preservation and food safety,
  heating/generator/carbon-monoxide topics, and anything medical (including
  medication storage and alpha-gal specifics): give only well-established,
  authoritative guidance. If the user's situation requires specifics beyond
  the authored content (e.g., treating well water for storage), say plainly
  that this step needs exact guidance, give the safe general principle, and
  direct them to the authoritative source or professional rather than
  improvising details.
- Never present uncertain information as certain. "I'd want to be exact here"
  is an Air2Ground answer.
- If someone describes an emergency in progress, tell them to contact
  emergency services first.

You are a coach, not a salesperson. Never pressure anyone to buy gear or to
upgrade their subscription.
```

## 7. Build phases & acceptance criteria

**Phase 1 — Scaffold + assessment (no auth).**
Next.js app, design tokens ported from prototypes, assessment flow working end-to-end with the scoring engine (port the JS from `/prototype/index.html` — it's the spec). *Done when:* a visitor completes the assessment and sees their personalized results, pixel-spirit faithful to the prototype.

**Phase 2 — Auth + persistence.**
Magic-link sign-in; profile + scores saved; results page loads from DB; action tiles link to action-detail; step checks persist; completing a core lifts the pillar score. *Done when:* a user returns next day and everything is where they left it.

**Phase 3 — Live coach.**
Coach API route with the §6 system prompt, profile + core context injection, streaming UI, seeded chips, rate limiting. *Done when:* a rural-profile user asking about well water gets a safe, on-voice answer that defers on treatment specifics.

**Phase 4 — Content pipeline.**
Cores seeded from `/content/` into DB; admin-only publish flags; core 1.1 live across all three profiles. *Done when:* publishing core 5.1 requires no code deploy.

**Phase 5 — Stripe + beta gate.**
Stripe products created; paywall built but DISABLED; beta-invite allowlist (10 emails). *Done when:* beta members use everything free; flipping one flag enables founding-member checkout.

## 8. Beta plan (2 weeks, ~10 community members)

- Invite warm, personal, from Shelley. Free access, asked for honest reactions.
- Watch: where people stall in assessment, whether they check steps, what they ask the coach (read every coach transcript — it's the roadmap), whether they return after day 3.
- Mid-beta nudge at day 7; close with 3 questions: What felt most valuable? What felt confusing or off? Would you pay $9/month — and if not, what would make it worth it?
- Exit criteria to flip on founding-member pricing: ≥6 of 10 active in week two AND no unresolved safety/content issues AND the three 1.1 ⟦VERIFY⟧ items cleared.

## 9. Env & secrets

`.env.local` (never committed; `.gitignore` already covers it):
ANTHROPIC_API_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_FOUNDING_MONTHLY, STRIPE_PRICE_FOUNDING_ANNUAL.

## 10. Out of scope for launch (deliberately)

Native app-store apps · community features · push notifications · admin CMS UI (publish via SQL/seed scripts is fine) · canning/preservation content (expert-review gated) · any feature that delays the beta.

---
*First Claude Code session: Phase 1 only. Resist building ahead — each phase ships something testable.*
