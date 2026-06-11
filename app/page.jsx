'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

/* ─────────────────────────────────────────────────────────────
   Air2Ground Resilient — Stage 2
   Assessment → personalized profile → ranked path, now with
   magic-link accounts: the profile persists and every completed
   assessment records a score snapshot (the living score's memory).
   Scoring and ranking remain ported faithfully from the prototype.
   ───────────────────────────────────────────────────────────── */

const ICONS = {
  building:'<path d="M4 21h16M6 21V7l6-3 6 3v14M10 21v-4h4v4M9 10h.01M15 10h.01M9 13h.01M15 13h.01"/>',
  home:'<path d="M3 11.5 12 4l9 7.5M5.5 10v10h13V10"/>',
  trees:'<path d="M12 22v-6M8.5 16c-3.3 0-4.5-2.2-4.5-4.3 2 0 2.2-1 2.2-2.9 0-2.1 2.1-4.3 4.3-4.3M15.5 16c3.3 0 4.5-2.2 4.5-4.3-2 0-2.2-1-2.2-2.9 0-2.1-2.1-4.3-4.3-4.3"/>',
  seed:'<path d="M12 22V10M12 10C9 10 6 8 6 4c4 0 6 2 6 6M12 12c3 0 6-1 6-5-4 0-6 2-6 5"/>',
  spark:'<circle cx="12" cy="12" r="3.2"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.8 5.8l2.1 2.1M15.9 15.9l2.1 2.1M18.2 5.8l-2.1 2.1M8 15.9l-2.1 2.1"/>',
  wrench:'<path d="M15.5 7.5a4 4 0 0 1-5.2 5.2L4 19l1.4 1.4 6.3-6.3a4 4 0 0 1 5.2-5.2l-2.6 2.6 1.6 1.6 2.6-2.6"/>',
  tools:'<path d="M14.7 6.3a3.5 3.5 0 0 0-4.6 4.6l-6.4 6.4 2 2 6.4-6.4a3.5 3.5 0 0 0 4.6-4.6l-2.2 2.2-1.8-.4-.4-1.8z"/><path d="M16 16l4 4"/>',
  coin:'<circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.5 9.5h3a1.5 1.5 0 0 1 0 3h-2a1.5 1.5 0 0 0 0 3h3"/>',
  shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  drop:'<path d="M12 3s6 6 6 11a6 6 0 0 1-12 0c0-5 6-11 6-11z"/>',
  bolt:'<path d="M13 2 4 14h6l-1 8 9-12h-6z"/>',
  lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  heart:'<path d="M12 21s-7-4.5-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 6C19 16.5 12 21 12 21z"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  cart:'<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h3l2.5 13h11l2-9H6"/>',
};

const QUESTIONS = [
  {
    key: 'living', multi: false, eyebrow: 'Your space',
    title: 'Where do you live right now?',
    lede: "This shapes everything — what's possible, what's restricted, where your easy wins are.",
    options: [
      { v: 'apartment', t: 'Apartment or rental', d: 'Limited space, landlord rules', ic: 'building' },
      { v: 'suburb', t: 'House in the suburbs', d: 'Some yard, possible HOA', ic: 'home' },
      { v: 'rural', t: 'Rural or acreage', d: 'Room to work with', ic: 'trees' },
      { v: 'starting', t: 'In between / about to move', d: 'Planning my next place', ic: 'seed' },
    ],
  },
  {
    key: 'skills', multi: false, eyebrow: 'Your starting point',
    title: 'How would you describe your skills?',
    lede: "Be honest — there's no wrong answer. We meet you exactly here.",
    options: [
      { v: 'none', t: 'Total beginner', d: "I've never done any of this — and that's fine", ic: 'spark' },
      { v: 'some', t: 'A few basics', d: 'I can cook, fix small things', ic: 'wrench' },
      { v: 'handy', t: 'Fairly capable', d: 'I garden, repair, improvise', ic: 'tools' },
      { v: 'skilled', t: 'Quite skilled', d: 'I want to go deeper', ic: 'trees' },
    ],
  },
  {
    key: 'budget', multi: false, eyebrow: 'Your runway',
    title: 'What can you put toward this monthly?',
    lede: "Resilience scales to any budget. We'll never tell you to buy what you can't.",
    options: [
      { v: 'tight', t: 'Under $25', d: 'Time over money right now', ic: 'coin' },
      { v: 'modest', t: '$25 – $100', d: 'A little to invest each month', ic: 'coin' },
      { v: 'comfortable', t: '$100 – $300', d: 'Room to build steadily', ic: 'coin' },
      { v: 'flexible', t: '$300+', d: 'Ready to move faster', ic: 'coin' },
    ],
  },
  {
    key: 'constraints', multi: true, eyebrow: 'Your constraints',
    title: 'Anything limiting your options?',
    lede: "Select all that apply — these aren't roadblocks, just facts we plan around.",
    hint: 'Select any that apply, or continue with none.',
    options: [
      { v: 'hoa', t: 'HOA / lease restrictions', d: 'Rules on what I can do outside', ic: 'lock' },
      { v: 'nospace', t: 'Little or no outdoor space', d: 'Balcony at most', ic: 'building' },
      { v: 'health', t: 'Health considerations', d: 'e.g. alpha-gal, allergies, mobility', ic: 'heart' },
      { v: 'time', t: 'Very limited time', d: 'Busy schedule, hard to carve out', ic: 'clock' },
    ],
  },
  {
    key: 'worry', multi: false, eyebrow: 'Your priority',
    title: 'What worries you most?',
    lede: "We'll weight your path toward what keeps you up at night.",
    options: [
      { v: 'food', t: 'Food security', d: 'Supply gaps, rising prices', ic: 'cart' },
      { v: 'water', t: 'Water & utilities', d: 'Outages, contamination', ic: 'drop' },
      { v: 'power', t: 'Power & grid', d: 'Blackouts, storms', ic: 'bolt' },
      { v: 'safety', t: 'General preparedness', d: 'Just want to be ready', ic: 'shield' },
    ],
  },
  {
    key: 'pace', multi: false, eyebrow: 'Your pace',
    title: 'How do you want to move?',
    lede: 'Resilience is a practice, not a panic. Set a pace you’ll actually keep.',
    options: [
      { v: 'gentle', t: 'Gentle & steady', d: 'One small thing at a time', ic: 'seed' },
      { v: 'focused', t: 'Focused', d: 'A real habit, weekly progress', ic: 'spark' },
      { v: 'all-in', t: 'All in', d: 'I want momentum now', ic: 'bolt' },
    ],
  },
];

/* ── scoring engine (unchanged from the prototype — it is the spec) ── */
function computeScores(state) {
  const s = { food: 30, water: 30, power: 30, supply: 30, skill: 30 };
  const map = { apartment: 0, suburb: 8, rural: 16, starting: 4 };
  s.food += map[state.living]; s.water += map[state.living] * 0.6;
  s.power += map[state.living] * 0.5; s.supply += map[state.living] * 0.8;
  const sk = { none: 0, some: 10, handy: 20, skilled: 30 }[state.skills];
  s.skill += sk; s.food += sk * 0.5; s.water += sk * 0.4;
  const bu = { tight: 2, modest: 8, comfortable: 16, flexible: 24 }[state.budget];
  Object.keys(s).forEach((k) => (s[k] += bu * 0.5));
  if (state.constraints.includes('nospace')) s.food -= 8;
  if (state.constraints.includes('time')) Object.keys(s).forEach((k) => (s[k] -= 3));
  Object.keys(s).forEach((k) => (s[k] = Math.max(8, Math.min(92, Math.round(s[k])))));
  const overall = Math.round((s.food + s.water + s.power + s.supply + s.skill) / 5);
  return { pillars: s, overall };
}

function rankActions(state) {
  const a = [];
  const apt = state.living === 'apartment' || state.constraints.includes('nospace');
  const w = state.worry;
  a.push({ t: 'Store a 2-week water reserve', d: apt ? 'Stackable 5-gal containers fit a closet or under a bed — no yard needed.' : 'Set up rotating water storage scaled to your household.', tags: ['Water', 'Week 1', '$'], pri: w === 'water' ? 100 : 60 });
  a.push({ t: apt ? 'Build a 3-shelf rotating pantry' : 'Start a deep pantry system', d: apt ? 'A single shelf unit becomes weeks of food using first-in-first-out rotation.' : 'Layer staples you already eat into a 30-day rotating buffer.', tags: ['Food', 'Week 1', '$$'], pri: w === 'food' ? 100 : 65 });
  if (state.skills === 'none') a.push({ t: 'Learn 3 no-fail pantry meals', d: 'Build confidence with simple, shelf-stable recipes before anything else.', tags: ['Skill', 'This week', 'Free'], pri: 70 });
  if (w === 'power') a.push({ t: 'Set up a tiered power backup', d: apt ? 'A power station + lights covers an apartment outage without a generator.' : 'Layer from lighting to a station to whole-home options.', tags: ['Power', 'Month 1', '$$'], pri: 95 });
  if (apt) a.push({ t: 'Grow food in a 4-pot window kit', d: 'Herbs and greens on a windowsill — zero landlord conflict, real food.', tags: ['Food', 'This week', '$'], pri: 55 });
  else a.push({ t: 'Plant a starter resilience garden', d: state.constraints.includes('hoa') ? 'HOA-friendly raised beds and containers that stay within the rules.' : 'Begin with the highest-calorie, lowest-effort crops for your zone.', tags: ['Food', 'This season', '$$'], pri: 58 });
  if (state.constraints.includes('health')) a.push({ t: 'Build a health-aware supply kit', d: 'Stock around your specific needs — allergy-safe foods, key meds buffer, alpha-gal-safe proteins.', tags: ['Health', 'Week 1', '$$'], pri: 88 });
  a.push({ t: 'Map your home shutoffs & exits', d: 'Know your water, gas, and power shutoffs cold. Free, 30 minutes, huge payoff.', tags: ['Safety', 'Today', 'Free'], pri: 50 });
  a.push({ t: 'Connect with 2 like-minded neighbors', d: 'Resilience is a team sport. The strongest asset is people nearby you trust.', tags: ['Community', 'This month', 'Free'], pri: 48 });
  const n = state.pace === 'gentle' ? 3 : state.pace === 'focused' ? 4 : 5;
  return a.sort((x, y) => y.pri - x.pri).slice(0, n);
}

const TIERS = [
  { min: 0, name: 'Rooted Beginner', d: "You're at the start — and that's exactly the right place to be. Small, steady moves will lift this number fast." },
  { min: 45, name: 'Steady Builder', d: "You've got real footing. A few targeted moves will close your biggest gaps and build momentum." },
  { min: 65, name: 'Resilient Practitioner', d: "You're well ahead of most. Now it's about depth, redundancy, and helping others around you." },
  { min: 82, name: 'Quiet Anchor', d: "You're the person others lean on in a crisis. Focus on community and long-horizon resilience." },
];

function coachIntro(state) {
  const place = { apartment: 'an apartment', suburb: 'a suburban home', rural: 'rural land', starting: 'a place in transition' }[state.living];
  const worry = { food: 'food security', water: 'water and utilities', power: 'power and the grid', safety: 'overall preparedness' }[state.worry];
  let extra = '';
  if (state.constraints.includes('hoa')) extra = " I'll keep every suggestion HOA- and lease-safe.";
  if (state.constraints.includes('health')) extra += " And I'll factor your health considerations into every recommendation.";
  return `Good to meet you. You're working from ${place}, most concerned about ${worry}, and we'll move at a pace you can keep.${extra} Your top move this week is right at the top of your list — want me to break the first step into 10 minutes you could do today?`;
}

const CANNED = [
  "Great question. Given your space and budget, I'd start smaller than you think — pick the one shelf or corner you can fully control, and we build outward from there.",
  "Here's the thing: you don't need to solve it all at once. For your situation, the highest-leverage move costs almost nothing and takes about 20 minutes. Want to start there?",
  "Smart to ask. With your constraints in mind, skip the expensive gear everyone pushes online — it won't fit your life. Let's do the version that actually works where you are.",
  "I'd plan around that directly. It's not a roadblock — it just changes the order we do things. Here's the adjusted next step that respects it.",
];

/* ── persistence (Stage 2) ── */
const STASH_KEY = 'a2g-pending-profile';

async function persistAssessment(session, answers) {
  const { pillars, overall } = computeScores(answers);
  const { error: pErr } = await supabase.from('profiles').upsert({
    user_id: session.user.id,
    living: answers.living,
    skills: answers.skills,
    budget: answers.budget,
    constraints: answers.constraints,
    worry: answers.worry,
    pace: answers.pace,
  });
  if (pErr) throw pErr;
  const { error: sErr } = await supabase.from('score_snapshots').insert({
    user_id: session.user.id,
    overall,
    pillars,
  });
  if (sErr) throw sErr;
}

/* ── small shared pieces ── */
const Svg = ({ d, ...rest }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
    strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: d }} {...rest} />
);

const Flourish = () => (
  <div className="flourish"><span className="ln" /><span className="dia" /><span className="ln" /></div>
);

function OptionCard({ opt, selected, onPick }) {
  return (
    <button type="button" className={`opt${selected ? ' sel' : ''}`} onClick={onPick}>
      <span className="ic"><Svg d={ICONS[opt.ic]} /></span>
      <span><span className="t">{opt.t}</span><span className="d">{opt.d}</span></span>
      <span className="chk"><span className="o" />
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
      </span>
    </button>
  );
}

/* ── keep-your-ground: accounts without passwords ── */
function KeepCard({ session, saveState, onSend, onSignOut }) {
  const [email, setEmail] = useState('');
  const [phase, setPhase] = useState('idle'); // idle · sending · sent · error
  if (!supabase) return null;

  if (session) {
    return (
      <div className="keep">
        <div className="kp-head">
          <div className="kic"><Svg d={ICONS.seed} /></div>
          <div>
            <b>Your ground is kept</b>
            <span>
              {saveState === 'saving' && 'Saving your profile…'}
              {saveState === 'saved' && `Signed in as ${session.user.email} — your profile and baseline are saved.`}
              {saveState === 'error' && "Signed in — we couldn't reach your saved profile just now. It's safe on this device and we'll retry next time."}
              {saveState === 'idle' && `Signed in as ${session.user.email}.`}
            </span>
          </div>
        </div>
        <div className="kp-row">
          <button className="restart" onClick={onSignOut}>Sign out</button>
        </div>
      </div>
    );
  }

  const send = async () => {
    const addr = email.trim();
    if (!addr || !addr.includes('@') || phase === 'sending') return;
    setPhase('sending');
    try { await onSend(addr); setPhase('sent'); }
    catch { setPhase('error'); }
  };

  return (
    <div className="keep">
      <div className="kp-head">
        <div className="kic"><Svg d={ICONS.seed} /></div>
        <div>
          <b>Keep your ground</b>
          <span>Save your profile and your path, and watch your baseline rise as you build. No password — we&rsquo;ll email you a sign-in link.</span>
        </div>
      </div>
      {phase === 'sent' ? (
        <div className="kp-sent">Your link is on the way. Open it on this device and you&rsquo;ll land right back here — everything saved.</div>
      ) : (
        <>
          <div className="ask">
            <input type="email" value={email} placeholder="you@example.com" autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()} />
            <button onClick={send} aria-label="Email me my link" disabled={phase === 'sending'}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" /></svg>
            </button>
          </div>
          {phase === 'error' && <div className="kp-err">That didn&rsquo;t go through — mind checking the address and trying again?</div>}
        </>
      )}
    </div>
  );
}

/* ── screens ── */
function Hero({ onStart }) {
  return (
    <section className="screen active">
      <div className="hero">
        <div className="seal">
          <div className="halo" />
          <img className="a2gmark" src="/a2g-espresso.png" alt="Air2Ground a2g mark" />
        </div>
        <div className="kicker">Air2Ground Resilient</div>
        <h1>Resilience starts <em>where you stand.</em></h1>
        <p className="sub">No bunker. No ten acres. No fear. Just a clear, personal path to becoming more capable — built around your real life, your real space, your real constraints.</p>
        <div className="nav">
          <button className="btn btn-big" onClick={onStart}>Find my resilience baseline <span className="arr">→</span></button>
        </div>
        <div className="stats">
          <div className="stat"><b>6</b><span>questions, ~2 min</span></div>
          <div className="stat"><b>0</b><span>gear to start</span></div>
          <div className="stat"><b>1</b><span>step that fits you</span></div>
        </div>
      </div>
    </section>
  );
}

function QuestionScreen({ q, value, onChange, onBack, onNext, isLast, loading }) {
  const answered = q.multi ? true : !!value;
  return (
    <section className="screen active">
      <div className="qhead">
        <div className="ey">{q.eyebrow}</div>
        <h2>{q.title}</h2>
        <p className="lede">{q.lede}</p>
        <Flourish />
      </div>
      <div className="options">
        {q.options.map((opt) => {
          const selected = q.multi ? (value || []).includes(opt.v) : value === opt.v;
          return (
            <OptionCard key={opt.v} opt={opt} selected={selected}
              onPick={() => {
                if (q.multi) {
                  const set = new Set(value || []);
                  set.has(opt.v) ? set.delete(opt.v) : set.add(opt.v);
                  onChange([...set]);
                } else onChange(opt.v);
              }} />
          );
        })}
      </div>
      {q.hint && <div className="hint">{q.hint}</div>}
      <div className="nav">
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
        <button className={`btn${loading ? ' loading' : ''}`} disabled={!answered} onClick={onNext}>
          <span className="spin" />
          {isLast ? 'See my profile ' : 'Continue '}<span className="arr">→</span>
        </button>
      </div>
    </section>
  );
}

function Results({ state, onRestart, session, welcomeBack, saveState, onSend, onSignOut }) {
  const { pillars, overall } = useMemo(() => computeScores(state), [state]);
  const actions = useMemo(() => rankActions(state), [state]);
  const tier = [...TIERS].reverse().find((t) => overall >= t.min);

  const [shownScore, setShownScore] = useState(0);
  const [barsOn, setBarsOn] = useState(false);
  const [coachMsg, setCoachMsg] = useState(() => coachIntro(state));
  const [askText, setAskText] = useState('');
  const cannedIx = useRef(0);

  useEffect(() => {
    const t0 = setTimeout(() => {
      let n = 0;
      const iv = setInterval(() => {
        n += 1; setShownScore(n);
        if (n >= overall) clearInterval(iv);
      }, 16);
    }, 350);
    const t1 = setTimeout(() => setBarsOn(true), 450);
    return () => { clearTimeout(t0); clearTimeout(t1); };
  }, [overall]);

  const ask = () => {
    if (!askText.trim()) return;
    setCoachMsg(CANNED[cannedIx.current % CANNED.length]);
    cannedIx.current += 1; setAskText('');
  };

  const labels = { food: 'Food', water: 'Water', power: 'Power', supply: 'Supplies', skill: 'Skills' };
  const colors = { food: 'var(--moss)', water: 'var(--water)', power: 'var(--gold)', supply: 'var(--clay)', skill: 'var(--moss-deep)' };

  return (
    <section className="screen active">
      <div className="qhead" style={{ marginTop: 6 }}>
        <div className="ey">{welcomeBack ? 'Welcome back' : 'Your resilience profile'}</div>
        <h2>{welcomeBack ? 'Here’s your ground' : 'Here’s where you stand'}</h2>
      </div>

      <div className="score-card">
        <div className="glow" />
        <div className="lab">Resilience Baseline</div>
        <div className="ring-wrap">
          <div className="ring">
            <svg width="124" height="124">
              <circle cx="62" cy="62" r="54" stroke="rgba(255,255,255,.15)" strokeWidth="11" fill="none" />
              <circle cx="62" cy="62" r="54" stroke="var(--gold)" strokeWidth="11" fill="none"
                strokeLinecap="round" strokeDasharray="339"
                strokeDashoffset={339 - (339 * shownScore) / 100}
                style={{ transition: 'stroke-dashoffset .05s linear' }} />
            </svg>
            <div className="num"><b>{shownScore}</b><span>/ 100</span></div>
          </div>
          <div className="read"><h3>{tier.name}</h3><p>{tier.d}</p></div>
        </div>
      </div>

      <div className="pillars">
        {Object.keys(labels).map((k, i) => (
          <div className="pillar" key={k}>
            <div className="pl"><span>{labels[k]}</span><b>{pillars[k]}</b></div>
            <div className="bar">
              <i style={{ background: colors[k], width: barsOn ? `${pillars[k]}%` : 0, transitionDelay: `${i * 120}ms` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="sec-head">
        <h3>Your next moves</h3>
        <p>Ranked for <em>your</em> situation — start at the top. Each one lifts your baseline.</p>
      </div>

      <div>
        {actions.map((a, i) => (
          <div className="step" key={a.t}>
            <div className="rank">{i + 1}</div>
            <div className="body">
              <h4>{a.t}</h4><p>{a.d}</p>
              <div className="meta">
                {a.tags.map((t, j) => (
                  <span key={t} className={`tag ${j === 1 ? 'gold' : j === 2 ? 'clay' : ''}`}>{t}</span>
                ))}
              </div>
            </div>
            <svg className="go" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
          </div>
        ))}
      </div>

      <KeepCard session={session} saveState={saveState} onSend={onSend} onSignOut={onSignOut} />

      <div className="coach">
        <div className="ch-head">
          <div className="av"><Svg d='<path d="M12 8V4m0 0h-1m1 0h1M5 12H4m16 0h-1M8 16a4 4 0 0 1 8 0v3H8z"/>' style={{ strokeWidth: 1.8 }} /></div>
          <div><b>Your Resilience Coach</b><span>Powered by AI · primed on the Air2Ground way</span></div>
        </div>
        <div className="bubble">{coachMsg}</div>
        <div className="ask">
          <input value={askText} placeholder="Ask anything about your situation…"
            onChange={(e) => setAskText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && ask()} />
          <button onClick={ask} aria-label="Send">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" /></svg>
          </button>
        </div>
        <div className="note">Demo responses for now — the live coach arrives in a later phase, and it will know your full profile.</div>
      </div>

      <div className="restart-row">
        <button className="restart" onClick={onRestart}>↺ Start over</button>
      </div>
      <footer>Air2Ground Resilient</footer>
    </section>
  );
}

/* ── root ── */
const EMPTY = { living: null, skills: null, budget: null, constraints: [], worry: null, pace: null };

export default function Page() {
  const [screen, setScreen] = useState(0); // 0 hero · 1..6 questions · 7 results
  const [answers, setAnswers] = useState(EMPTY);
  const [finishing, setFinishing] = useState(false);

  const [session, setSession] = useState(null);
  const [welcomeBack, setWelcomeBack] = useState(false);
  const [saveState, setSaveState] = useState('idle'); // idle · saving · saved · error
  const sessionRef = useRef(null);
  const restoredOnce = useRef(false);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [screen]);

  useEffect(() => {
    if (!supabase) return;
    const handle = (s) => {
      sessionRef.current = s;
      setSession(s);
      if (s && !restoredOnce.current) {
        restoredOnce.current = true;
        afterSignIn(s);
      }
    };
    supabase.auth.getSession().then(({ data }) => handle(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => handle(s));
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // On sign-in: persist a just-finished assessment if one is stashed,
  // otherwise restore the saved profile from the database.
  const afterSignIn = async (s) => {
    let stash = null;
    try { stash = JSON.parse(localStorage.getItem(STASH_KEY) || 'null'); } catch {}
    if (stash && stash.living) {
      setAnswers(stash);
      setScreen(7);
      setSaveState('saving');
      try {
        await persistAssessment(s, stash);
        localStorage.removeItem(STASH_KEY);
        setSaveState('saved');
      } catch { setSaveState('error'); }
      return;
    }
    const { data } = await supabase
      .from('profiles').select('*').eq('user_id', s.user.id).maybeSingle();
    if (data && data.living) {
      setAnswers({
        living: data.living, skills: data.skills, budget: data.budget,
        constraints: data.constraints || [], worry: data.worry, pace: data.pace,
      });
      setWelcomeBack(true);
      setSaveState('saved');
      setScreen(7);
    }
  };

  const sendLink = async (email) => {
    // Stash the fresh answers so the magic-link round trip can't lose them.
    localStorage.setItem(STASH_KEY, JSON.stringify(answers));
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem(STASH_KEY);
    restoredOnce.current = false;
    setWelcomeBack(false);
    setSaveState('idle');
    setAnswers(EMPTY);
    setScreen(0);
  };

  const goNext = () => {
    if (screen === 6) {
      setFinishing(true);
      setTimeout(() => {
        setFinishing(false);
        setScreen(7);
        setWelcomeBack(false);
        const s = sessionRef.current;
        if (supabase && s) {
          setSaveState('saving');
          persistAssessment(s, answers)
            .then(() => setSaveState('saved'))
            .catch(() => {
              // Keep a copy on-device so a later visit can retry the save.
              localStorage.setItem(STASH_KEY, JSON.stringify(answers));
              setSaveState('error');
            });
        }
      }, 900);
    } else setScreen((s) => s + 1);
  };

  const qIndex = screen - 1;
  const q = QUESTIONS[qIndex];

  return (
    <div className="wrap">
      <div className="top">
        <div className="dots">
          {Array.from({ length: 7 }).map((_, i) => (
            <i key={i} className={
              screen >= 1 && screen <= 6
                ? i < screen - 1 ? 'done' : i === screen - 1 ? 'on' : ''
                : screen === 7 ? 'done' : ''
            } />
          ))}
        </div>
        <div className="step-label">
          {screen === 0 ? '' : screen === 7 ? 'Complete' : `Question ${screen} of 6`}
        </div>
      </div>

      {screen === 0 && <Hero onStart={() => setScreen(1)} />}

      {screen >= 1 && screen <= 6 && (
        <QuestionScreen
          key={q.key}
          q={q}
          value={answers[q.key]}
          onChange={(v) => setAnswers((a) => ({ ...a, [q.key]: v }))}
          onBack={() => setScreen((s) => s - 1)}
          onNext={goNext}
          isLast={screen === 6}
          loading={finishing}
        />
      )}

      {screen === 7 && (
        <Results
          state={answers}
          session={session}
          welcomeBack={welcomeBack}
          saveState={saveState}
          onSend={sendLink}
          onSignOut={signOut}
          onRestart={() => { setAnswers(EMPTY); setWelcomeBack(false); setScreen(0); }}
        />
      )}
    </div>
  );
}
