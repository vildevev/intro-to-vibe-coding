# Challenge 2 — The Delivery Framework

**Mission:** Install the five-phase delivery framework by watching the four ways 45 minutes dies — each phase budget exists because a candidate died without it — so you always land a complete system instead of a beautiful half-design that "ran out of time."

**Time:** ~60 minutes

---

## 😱 War story: death by deep dive, too early

A candidate gets "Design a news feed." Minute 4, mid-requirements, they're already debating fanout-on-write vs fanout-on-read with themselves. Minute 20 they have the most interesting cache architecture of the day and no entities written down, no API, no working design. The reviewer's note writes itself: "failed to deliver a working system" — which usually shows up in feedback as the vague phrase "time management." It rarely means "work faster." It means "focus on the right things in the right order." The framework below is that order.

## 🧰 What you'll learn

- Why each phase's budget is what it is: the specific death it prevents, named on the clock
- Why Requirements must close in 5 minutes: the wandering list that never ships
- Why the API step is 5 minutes flat: the contract that turns Phase 4 from a blank canvas into a checklist
- Why deep dives wait for minute 35: parked complexity, returned to on purpose — and the seniority dial of who leads them

## The clock — and the four ways it kills you

| Phase | Budget | The one output |
|---|---|---|
| 1. Requirements | ~5 min | Top-3 functional + quantified non-functional requirements |
| 2. Core Entities | ~2 min | A short bullet list of the nouns in the system |
| 3. API | ~5 min | Endpoints that map to the functional requirements |
| 4. High-Level Design | ~10–15 min | Boxes and arrows satisfying every endpoint, end to end |
| 5. Deep Dives | ~10 min | 1–2 bottlenecks hardened, non-functional requirements met |

Structure is not what's being graded directly (it usually lands under Communication) — it's what keeps you from getting stuck and guarantees you finish. Treat it as a track to run on when nerves hit. Each budget below is the answer to a specific way the 45 minutes dies.

## Break 1 — minute 8, requirements never close

**The break, on the clock.** Minute 8: still asking questions. The functional list is 12 items and growing, nothing is ranked, and the reviewer has watched four of them go by. Every minute here is stolen from the only phases that produce a system.

**The obvious fix, and why it fails:** gather everything first — "I'll just be complete." Completeness is the trap: real systems have hundreds of features, a long list hurts you (several companies explicitly score your ability to focus), and the rest of the review is you building whatever this list says. There is no finish line on "complete."

**The fix: two short lists, then close the phase out loud.** Functional requirements — "Users should be able to …" statements — reviewed like a conversation with a product manager ("does the system need X?", "what happens if Y?"), then ranked ruthlessly to the top 3. Non-functional requirements — "The system should …" qualities: availability, scale, latency, consistency, durability — under two rules. Quantify everything: "low latency" is noise (every system wants that); "feed renders in <200ms" is a requirement you can design against. And pick the 3–5 that actually bind this system — a starting checklist: consistency vs availability (CAP — see Challenge 3), scale and its shape (steady or bursty? reads or writes?), latency targets for the slowest operations, durability (can a social like be lost? can a payment?), plus compliance/security if the domain demands it. Capacity estimation: skip it — usually. Don't open with five minutes of QPS arithmetic that concludes "so, a lot." Do the math when it would change the design (Challenge 4 makes you fast at this): "I'll estimate on demand, when a number actually matters" is a senior move, not a dodge.

**The cost:** a top-3 pick might miss the feature the reviewer had in mind. A prioritized, confirmed guess beats a complete list at minute 20 — and you can amend it on the record when a probe changes the picture.

## Break 2 — minute 20, no entities on the board

**The break, on the clock.** The war-story candidate lives here: minute 20, the most interesting cache architecture of the day — and no nouns written down, no endpoints, nothing to build against. Complexity without a skeleton has nowhere to attach, so none of it composes.

**The obvious fix, and why it fails:** jump straight to the interesting part — the fanout debate, the cache design. That is exactly how minute 20 happens. Without entities and an API there is no checklist; every design decision floats free and the reviewer can't see the system taking shape.

**The fix: 2 minutes of nouns, 5 minutes of contract.** Core entities: jot the actors and the resources the functional requirements need — for a Twitter-like system, User, Tweet, Follow. That's it, no columns yet; you don't know what you don't know, and fields get added next to the database box once the design shows you which state changes on each request. Two questions that find them fast: who acts on the system, and what things get created, read, or linked? Pick decent names while you're at it — some reviewers treat it as a naming test. Then the API: pick the protocol in one sentence and move.

| Protocol | When | Cost |
|---|---|---|
| **REST** — resources + HTTP verbs | Default. Say it and go | JSON parsing overhead (rarely matters) |
| **GraphQL** — client shapes the response | Diverse clients, fast-moving frontend needs | Resolver complexity, caching gets harder |
| **gRPC** — binary RPC over HTTP/2 | Internal service-to-service, performance-critical | Poor fit for public/browser-facing APIs |

Then write endpoints against your core entities — plural nouns as resources, current user derived from the auth token, never trusted from the request body:

```text
POST /v1/tweets        { "text": "..." }        -> Tweet
GET  /v1/feed                                   -> Tweet[]
POST /v1/follows       { "user_id": "..." }     -> Follow
```

This contract is your checklist for Phase 4: if an endpoint has no design and a box has no endpoint, one of them is wrong. (Data pipelines like crawlers get an optional "data flow" step here — a numbered list of processing stages. If there's no long sequence of steps, skip it.)

**The cost:** 7 minutes on entities and API feels slow while the design begs to be drawn. It's the cheapest insurance in the review — Phase 4 runs on it.

## Break 3 — minute 35, half a beautiful system

**The break, on the clock.** Minute 35: the high-level design is half-drawn and still widening — six boxes for the read path, nothing connecting the write path, drawn mostly in silence. The note writes itself: "failed to deliver a working system," published in feedback as the vague phrase "time management." It rarely means "work faster." It means "focus on the right things in the right order."

**The obvious fix, and why it fails:** start with the interesting parts — the cache, the queue, the shard — and layer them in as you go. Candidates who layer complexity early routinely never arrive at a working system; the war story is this break wearing a different hat.

**The fix: one endpoint at a time, narrated, complexity parked.** Draw the system — clients, load balancer, services, database, and whatever else the endpoints demand — then walk through how a request flows from API call to database and back, and what state changes where: this turns a scary blank canvas into a sequence. Narrate while drawing; silence is where design reviews die — the diagram is a prop, the story of data flowing through it is the deliverable. Park the complexity you're itching to add: "I see a scaling risk here, I'll come back in deep dives" — mark it, move on. When a request reaches the database, sketch the key fields next to the box — only the ones that matter to the design; the reviewer knows a user table has an email.

**The cost:** a parked risk sits on the board looking like debt. It's scheduled debt — you owe the return in Phase 5, and the visible margin note is how you pay it.

## Break 4 — the deep dive that eats the review

**The break, on the clock.** Two versions. The eager one: deep dives start at minute 4, mid-requirements — the war story. The polite one: deep dives arrive on schedule at minute 35 and the candidate leads by monologuing, talking over the probes. The Communication score they were busy earning burns while they talk — the reviewer has specific signals they still need from you, and talking over them costs exactly that.

**The obvious fix, and why it fails:** dive deep and stay deep — show everything you know, uninterrupted. It converts your best scoring phase into your worst: monologue blocks the probes, and the probes are where Collaboration and adjustment get evidenced.

**The fix: revisit the parked risks, then lead like a senior.** Now the non-functional requirements get met: meet the latency target, handle the burst, fix the bottleneck, address whatever the reviewer probes. One Twitter example: "scale to 100M DAU" becomes a discussion of caching and sharding; "feed in <200ms" becomes fanout-on-read vs fanout-on-write. How proactive you are here is the seniority dial — mid-level candidates can wait for the reviewer to point; senior candidates identify the two most interesting problems themselves and lead. Lead, but don't monologue: leave room to probe.

Lines worth stealing:

- "Let me confirm scope: the three things that matter are X, Y, Z — out of scope today."
- "I'll do estimates on demand — where a number would change the design."
- "These are the endpoints; now I'll build up the system one endpoint at a time."
- "I see two scaling risks here — caching and the write path. Parking both for deep dives."
- "Deep dive one: the feed read path, since our <200ms target lives there."

**The cost:** leading means choosing — your deep dive might not be the reviewer's favorite risk. Leading a defensible choice still fills the Navigation and Solution Design boxes; waiting to be assigned one fills none.

## 🤖 Design-review drill: run it

```text
You are a senior engineer leading my design review at a top tech company for a 45-minute
design-review drill. Your job is to enforce the delivery framework as strictly as
a real reviewer enforces the clock.

SETUP
1. Ask which problem I want: URL shortener, news feed, rate limiter, chat
   app, or "surprise me" (you pick). Confirm before starting.
2. Run real time. Announce each phase with its budget and hold me to it:
   Requirements ~5 min, Core Entities ~2, API ~5, High-Level Design ~10-15,
   Deep Dives ~10.

YOUR JOB DURING EACH PHASE
- Requirements: if my functional list exceeds ~3 items, push: "Pick the top
  3 — which actually matter?" If a non-functional requirement isn't
  quantified, ask "what number?"
- Entities/API: if I exceed the budget, cut me off: "Good enough — let's move."
- High-level design: make me go one endpoint at a time and narrate how data
  flows for each. If I reach for caches and queues early, say: "Park it —
  we'll deep dive later. Finish the happy path first."
- Deep dives: pick the most interesting bottleneck in my design and probe:
  "This endpoint gets hammered — what happens at 100x?" Ask 2-3 follow-ups
  per dive. Do not let me dive into trivia.

RULES
- Stay in character. Never volunteer hints; give the smallest possible nudge
  only if I ask.
- If I add design detail without naming the phase it belongs to, stop me:
  "What phase are you in?"
- If I'm stuck more than 2 minutes, offer a fork: "hint, or next section?"
- At 45 minutes, or when I say "end review", stop and score.

SCORING
Drop character. Score 1-4 on Problem Navigation, Solution Design, Technical
Excellence, Communication — each with one quoted moment as evidence. Then
report: which phase I ran over on, whether I delivered a working end-to-end
system, and the one habit to drill next time.

Start by asking me to pick a problem.
```

## ✅ You own it when

- [ ] You can recite the five phases with their time budgets from memory
- [ ] You've delivered a full design in 45 minutes out loud, with a timer running, and finished the deep dives
- [ ] Your non-functional requirements come out quantified by reflex
- [ ] You can name what you parked and actually return to it in deep dives
- [ ] Your high-level design phase goes endpoint-by-endpoint, not vibe-by-vibe

## 📚 Jargon

| Term | What it means |
|---|---|
| Functional requirement | A "users should be able to…" feature the system must ship |
| Non-functional requirement | A quality target: latency, availability, scale, consistency — quantified or it didn't happen |
| Core entity | The nouns the system stores and exchanges; first draft of the data model |
| Fanout | Writing one post to many feeds (on-write) or assembling a feed per read (on-read) |
| Happy path | The simplest working version of a flow, before edge cases |
| Time management | The polite euphemism for "didn't deliver a working system" |
| Read/write split | Separating read traffic from write traffic so each scales independently |

## 🆘 When it goes wrong

- **You're 8 minutes into requirements and still asking questions.** Cap yourself: pick the best 3 you have, say them out loud, confirm with the reviewer, move. A prioritized guess beats a complete list at minute 20.
- **The high-level design is half-drawn at minute 35.** Stop designing breadth. Pick the single most important endpoint, finish it end to end, and use deep dives to extend — a complete narrow system beats a complete-in-your-head wide one.
- **You parked a risk and never came back.** Keep a visible margin note ("deep dive: feed cache"). At minute 35, read your own note out loud and start there.
- **The reviewer keeps pulling you off your track.** Their probes are the review now — follow them, but narrate how each answer updates the plan: "that changes the write path, let me fold it in."
- **You realize your API can't satisfy a requirement.** Say it and fix it: "Actually, follow needs a delete — I'll add DELETE /follows." Self-correction on the record is Communication signal, not a mistake.

➡️ **Next:** [Challenge 3 — The Toolbox](../03-the-toolbox/)
