# Air2Ground Resilient — Vision & End-to-End Build Brief
### *For Claude Code (Fable 5). Build the whole thing. This document is the source of truth.*

---

## 0. Read this first — what kind of build this is

You are not assembling a form with a chatbot bolted on. You are building a **living resilience companion** — a calm, beautiful, genuinely intelligent web app that meets a person exactly where they live and walks beside them as they become more capable over time. The feeling target is closer to a thoughtful coach who happens to live in your pocket than to a "prepper app." Reject every cliché of the category: no camo, no doom clocks, no fear, no gear-worship.

The existing repo already contains a working Phase-1 app (Next.js assessment → profile → path) and the approved design system in `app/globals.css`. **That design language is law** — warm paper, field green, terracotta, espresso; Fraunces / Newsreader / Spline Sans; centered hierarchy; depth-styled buttons; the hand-drawn a2g mark; gentle motion. Extend it; never replace it. The prototypes in `/prototype` and the authored content in `/content` show the voice and the bar.

Build end to end: database, auth, payments, the live AI coach, the illustration system, and every capability below. Ship it deployable on the existing GitHub repo and Netlify site.

---

## 1. Purpose (the one sentence)

**Help anyone — apartment renter to acreage owner — become measurably more resilient right where they are, through a personalized path of small authored actions, a coach that knows their life, and a sense of calm, capable momentum.**

Every feature is judged against that sentence. If it adds anxiety, complexity, or gear-lust, it's wrong for this product.

## 2. Who it's for

Adults (the core audience skews 45+, practical, often women, many in the alpha-gal community) who feel a quiet pull toward being more prepared but are turned off by the existing prepper world. They live in apartments, suburbs, and on land. They have constraints — leases, HOAs, budgets, health conditions, limited time — and they want to be *met*, not lectured.

---

## 3. The experience, start to finish

**3.1 Arrival & assessment.** The hero (already built) into a 6-question assessment that produces a resilience baseline score, a five-pillar breakdown (Water, Food, Power, Supplies, Skills), and a *ranked, personalized* action path. Keep the existing flow; deepen the personalization (see §6).

**3.2 The home / "your ground."** After the assessment, the app's home is a calm dashboard — not a feed. It shows: their resilience score with its trend over time, their current pillar balance, the one next action they should take ("Today's ground"), and a quiet sense of seasonal context. This is the screen they return to.

**3.3 Action cores.** The heart of the product. Each authored action (e.g. "Store a two-week water reserve") opens into a guided, checkable, personalized experience: a profile-aware *why*, a constraint callout (lease-safe / HOA / alpha-gal / no-space), fixed authored steps with checkboxes, a budget-scaled supply list, and an "ask the coach about this step" affordance. Completing steps raises the relevant pillar score. Content model in §5.

**3.4 The coach.** A live, streaming AI coach primed on the Air2Ground philosophy and the user's full profile, available both contextually (inside a step) and generally. Safety-railed (§7).

**3.5 Progress & return.** Saved progress, a gently rising score, streaks-without-pressure, and seasonal nudges keep them coming back. The emotional job: make resilience feel like a practice they're *keeping*, not a test they're failing.

---

## 4. Capabilities you may have missed — the "2027, not 2018" layer

These are what separate a living companion from a static course. Build the ones marked **[core]** for launch; architect for the **[soon]** ones so they slot in without a rewrite.

**4.1 Adaptive, conversational assessment [core].** The intake shouldn't feel like a form. Let the AI ask one smart follow-up when an answer is ambiguous ("You said limited outdoor space — balcony, shared yard, or none?"), so the resulting profile is genuinely precise. The six questions are the floor, not the ceiling.

**4.2 A living resilience score with memory [core].** The score isn't a one-time number — it's a tracked line that rises as they complete actions, with a small history sparkline on the home screen. Seeing the line go up is the core motivational loop. Store score snapshots over time.

**4.3 Seasonal & place-aware intelligence [core].** The app should know it's hurricane season on the Gulf, fire season in the West, deep winter in the North — and quietly resurface the right cores at the right time. With user consent to a coarse location (region, not address), "Today's ground" becomes genuinely timely. *This is a signature capability — most apps are season-blind.*

**4.4 Original illustration system [core].** Commission/generate a cohesive set of warm, hand-drawn-feeling illustrations — one per action core, plus pillar emblems and empty-states — in the a2g palette and line-quality (think the hand-drawn circle logo extended into a whole visual language). These are a brand moat and make the app feel crafted, not templated. Build an `illustrations` table so art is data, swappable without code changes. (See §8 for the art direction and how to produce them.)

**4.5 "Resilience for your household," not just you [soon].** Let a profile include the people and animals under their roof — kids, elders, pets, someone with a medical need — and have the path and supply math account for them. Resilience is rarely solo.

**4.6 Gentle community proof, not a social feed [soon].** No comments, no likes, no doomscrolling. Instead: quiet, aggregate signal — "312 people in apartments started here this month," anonymized "what others in your situation tackled next." Belonging without the toxicity. The Air2Ground community is the warm context; never recreate Facebook.

**4.7 The coach remembers [core].** Conversations persist and the coach has continuity — it knows what they've completed, what they asked last week, what worried them. Memory is what makes it feel like *their* coach, not a fresh stranger each session.

**4.8 Offline-capable, installable (PWA) [core].** When the power's out is exactly when a resilience app must still open. Cache the user's active cores and core content for offline reading. Installable to the home screen, works on a plane or in an outage. *For this product specifically, offline isn't a nice-to-have — it's thematically essential.*

**4.9 Export & "go-bag" artifacts [soon].** Let people generate a clean printable/PDF of their plan, their supply checklist, their household emergency sheet — because paper survives a dead battery. A resilience app that can put its plan on paper understands its own mission.

**4.10 Founding-member identity [core].** Early community members get a visible, quiet founding-member mark and locked pricing — belonging and gratitude, not a growth hack.

**4.11 Voice-friendly coach [soon].** Hands busy filling water jugs? Let the coach take voice input and read answers aloud. Resilience work is physical; the interface should meet that.

**4.12 Quiet, respectful notifications [soon].** Seasonal and progress nudges via email (and optional push) that are warm and rare — "It's getting cold; your power core is worth ten minutes this week." Never engagement-bait.

---

## 5. The content model (the brand moat — handle with care)

Three layers, **never labeled in the UI** (no "AI-generated" tags; a subtle "For you" is the only personalization signal):

1. **Authored core (fixed):** the steps themselves. On-brand, trustworthy, identical for everyone, written by Rich & Shelley. *This is what competitors can't copy.* Stored in the DB, seeded from `/content`.
2. **Personalized layer:** the *why*, constraint callout, and supply list, adapted to the user's profile (living situation, budget tier, constraints, household).
3. **Live coach:** contextual Q&A, streaming, profile- and history-aware.

Content lives in the database so new cores publish without a deploy. The catalog is 27 cores across five pillars (see `/content/authoring-backlog.md`); the 9-item launch set is marked there. Core 1.1 (water) is fully authored across three profiles in `/content/core-1.1-water-reserve.md` — use it as the schema-defining example.

---

## 6. Data model (Postgres / Supabase — design it richly)

Go beyond the minimum. Suggested tables:

```
users                (Supabase auth)
profiles             living, skills, budget, constraints[], worry, pace,
                     region (coarse, consented), household JSONB, founding BOOL,
                     created_at, updated_at
score_snapshots      user_id, captured_at, overall, pillars JSONB   ← powers the trend line
cores                id, pillar, title, promise, steps JSONB, a2g_note,
                     profiles JSONB {apt,suburb,rural}, illustration_id,
                     season_tags[], verify_clear BOOL, published BOOL
core_progress        user_id, core_id, checked_steps[], completed_at, PK(user,core)
coach_threads        id, user_id, core_id NULL, created_at
coach_messages       thread_id, role, content, created_at        ← coach memory
illustrations        id, slug, alt, palette_ok BOOL, svg_or_url, role(core|pillar|empty)
subscriptions        user_id, stripe ids, status, price_id, period_end
community_stats       (materialized/aggregated, anonymized) for §4.6
```

Row-level security on everything user-owned. The new Supabase project is separate from the Meats app (clean separation).

## 7. The coach — system prompt & safety

Use the system prompt in `/content` / the prior build brief as the base. Non-negotiable safety rails: authored steps are fixed and never contradicted; on water treatment, food safety, CO/heating, and medical topics the coach gives only well-established guidance and defers ("I'd want to be exact here") rather than improvising; emergencies → direct to emergency services first; never a salesperson. Inject profile + completed actions + recent thread history for continuity. Server-side only; key in env. Rate-limit during beta.

Content flagged **⟦VERIFY⟧** in `/content` must not reach paying users until cleared against an authoritative source.

## 8. Art direction for the illustration system (§4.4)

- **Feel:** hand-drawn, warm, slightly imperfect — the visual cousin of the a2g circle. Single- or two-tone line work in the palette (espresso/moss line on paper, occasional terracotta or gold accent). Calm, human, never clip-art, never AI-glossy.
- **Set:** one illustration per launch core (9), five pillar emblems, ~3 empty/celebration states. Subjects drawn from the real content — water jugs in a closet, a windowsill of herbs, a labeled shelf, a hand on a shutoff valve — concrete and grounded, never abstract "preparedness."
- **Production:** generate as SVG where possible (crisp, tiny, themeable via currentColor), store in the `illustrations` table keyed by slug, render by reference so art swaps without code. Keep a consistent stroke weight and corner feel across the set so it reads as one hand.
- **Guardrail:** no fear imagery, no weapons, no disaster-porn. A person feels *capable* looking at these.

## 9. Build approach for Fable 5

Build end to end, but ship in a sane order so each stage is verifiable: keep the working Phase-1 assessment; add Supabase auth + profiles + score snapshots; wire saved progress and the rising score; build the home/"your ground" dashboard; add the action-core experience reading from the DB; add the streaming coach with memory and rails; layer in seasonal intelligence, the illustration system, and PWA/offline; add Stripe with the founding-member rate **built but gated** behind the beta. Then the [soon] capabilities.

Deploy target: existing GitHub repo (`a2gfarms/a2g-resiliency-app`) and Netlify site. Note: introducing the coach API means moving from static export to Netlify's Next.js runtime — handle that adapter change. Secrets in env, never committed; `.gitignore` covers it.

## 10. Definition of done (launch)

A person can: arrive, take a conversational assessment, see a living resilience score, work through beautifully illustrated authored cores tailored to their exact situation, ask a coach that remembers them and stays safe, watch their score rise over time, use it offline in an outage, install it to their phone, and (post-beta) become a founding member — all in an interface so calm and warm it doesn't feel like any prepper app they've seen. The authored content stays the moat; the AI makes it personal; nothing ever sells fear.

---

## 11. What stays out of scope (on purpose)

Native app-store apps · a social feed · home-canning content (expert-review gated) · anything that trades the calm, authentic tone for engagement metrics · any feature that can't be justified against the one sentence in §1.

---
*Build it like it matters — because for the person reading it during the next outage, it does.*
