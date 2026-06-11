# START HERE — Kicking off the build with Claude Code (Fable 5)

*This is the file you open first. It tells you (the human) exactly what to paste, and tells Fable 5 exactly how to work. You do not need to understand the code — just follow the three steps.*

---

## For the human: how to start (3 steps)

1. Open Claude Code and point it at this repository (`a2gfarms/a2g-resiliency-app`).
2. Paste the **opening message** below as your first message.
3. From then on, just answer Fable 5's questions and approve its steps. It will tell you when it needs an account key (Supabase, Anthropic) and walk you through getting it.

That's it. You are the pilot; Fable 5 is the engine.

---

## The opening message — paste this verbatim

> Read `docs/VISION-AND-BUILD-BRIEF.md` in full — it is the source of truth for what we're building. Also read `docs/BUILD-BRIEF.md` (the technical detail), the existing `app/` (working Phase-1 assessment), `app/globals.css` (the approved design system — this is law), the prototypes in `/prototype`, and the authored content in `/content` (especially `core-1.1-water-reserve.md`, which defines the content schema, and `authoring-backlog.md`, which lists all 27 cores with the 9-item launch set marked).
>
> Then build Air2Ground Resilient end to end, deployable on this repo and our existing Netlify site. Honor the design system and the calm, no-fear Air2Ground voice throughout — extend what exists, never replace it. Respect the three-layer content model (authored core is the moat; never label the AI layers in the UI; a subtle "For you" is the only personalization signal) and the coach safety rails.
>
> Work in the order in the "Working agreement" in `docs/START-HERE.md`. Build the **[core]** capabilities for launch and architect cleanly for the **[soon]** ones. Ship something verifiable at each stage and show me. Keep all secrets in env, never committed.
>
> Before you start writing code, give me: (1) a short read-back of the vision in your own words so I know we're aligned, (2) the build order you'll follow, and (3) the first thing you need from me. Then begin with stage 1.

---

## Working agreement (the order Fable 5 should follow)

Build end to end, but ship in verifiable stages. Each stage should deploy green on Netlify and be openable on a phone before moving on.

**Stage 1 — Foundation intact.** Confirm the existing Phase-1 assessment → profile → path still builds and deploys. Don't break what works. *Show: the live app still runs.*

**Stage 2 — Accounts & the living score.** Supabase auth (magic-link, no passwords). Save the profile. Create `score_snapshots` and start recording the baseline. *Show: a user can sign in, and their profile persists across sessions.*

**Stage 3 — Saved progress & the home dashboard.** The "your ground" home screen: current score with its trend line, pillar balance, and "Today's ground" (the one next action). Action cores read from the DB; checking steps persists and raises the pillar score. *Show: complete a step, watch the score rise, return next day and it's still there.*

**Stage 4 — The action-core experience.** Full guided cores from the DB (why / constraint callout / authored steps / budget supplies), starting with core 1.1 across all three profiles. *Show: the water core, fully tailored to an apartment vs. a rural profile.*

**Stage 5 — The coach, live and safe.** Streaming Claude coach, contextual + general, with memory (`coach_threads`/`coach_messages`), profile + completed-actions context, and the safety rails. This is where Next.js moves from static export to the Netlify runtime. *Show: a rural user asking about well water gets a safe, on-voice answer that defers on specifics.*

**Stage 6 — The signature layer.** Seasonal/place-aware intelligence (consented coarse region), the original illustration system (SVG, stored as data), and PWA/offline for active cores. *Show: the app installs to a phone, opens offline, and surfaces a season-right core.*

**Stage 7 — Payments, gated.** Stripe with the founding-member rate, paywall built but DISABLED behind a beta allowlist. *Show: beta members use everything free; one flag flips on founding-member checkout.*

**Then:** the **[soon]** capabilities from the vision brief (household math, gentle community proof, export-to-paper, voice coach, notifications), as time and beta feedback direct.

---

## What Fable 5 will need from the human, and when

- **Stage 2:** access to the **Supabase** account to create a *new, separate* project for Resilient (not the Meats project). Fable 5 will tell you which keys it needs and where they go (env, never committed).
- **Stage 5:** an **Anthropic API key** from the Anthropic Console (console.anthropic.com) for the coach. Rich may already have one from the Meats app.
- **Stage 7:** the **Stripe** account, when you're approaching founding-member launch (deferred until after beta).
- **Netlify** is already connected; auto-deploy on commit should be on. If a deploy doesn't fire by itself, re-link the repo in Netlify → Build & deploy → Continuous deployment.

## Guardrails Fable 5 must never cross

- Never label the AI/personalization layers in the UI. "For you" is the only signal.
- Never let the coach improvise on safety-critical topics (water treatment, food safety, CO/heating, medical). It defers and points to authoritative sources.
- Never ship content flagged ⟦VERIFY⟧ to paying users until it's cleared.
- Never trade the calm, authentic, no-fear tone for engagement mechanics.
- Never commit secrets. Keep the authored content as the moat.

---

## The north star

When someone opens this during the next outage — phone at 20%, power out, a little scared — it opens, it's calm, it knows them, and it tells them the one useful thing to do next. Build toward that moment.
