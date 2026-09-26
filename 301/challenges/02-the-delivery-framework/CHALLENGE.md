# Challenge 2 — The Delivery Framework

**Mission:** Install the five-phase delivery framework — Requirements, Core Entities, API, High-Level Design, Deep Dives — with its exact timing, so you always land a complete system instead of a beautiful half-design that "ran out of time."

**Time:** ~60 minutes

---

## 😱 War story: death by deep dive, too early

A candidate gets "Design a news feed." Minute 4, mid-requirements, they're already debating fanout-on-write vs fanout-on-read with themselves. Minute 20 they have the most interesting cache architecture of the day and no entities written down, no API, no working design. The interviewer's note writes itself: "failed to deliver a working system" — which usually shows up in feedback as the vague phrase "time management." It rarely means "work faster." It means "focus on the right things in the right order." The framework below is that order.

## 🧰 What you'll learn

- The five phases, their budgets, and the one output each must produce
- How to run Requirements without wandering: top-3 functional, quantified non-functional
- The API step in 5 minutes flat: default REST, justify deviations
- When deep dives start and how to lead them like a senior candidate

## The clock

| Phase | Budget | The one output |
|---|---|---|
| 1. Requirements | ~5 min | Top-3 functional + quantified non-functional requirements |
| 2. Core Entities | ~2 min | A short bullet list of the nouns in the system |
| 3. API | ~5 min | Endpoints that map to the functional requirements |
| 4. High-Level Design | ~10–15 min | Boxes and arrows satisfying every endpoint, end to end |
| 5. Deep Dives | ~10 min | 1–2 bottlenecks hardened, non-functional requirements met |

Structure is not what's being graded directly (it usually lands under Communication) — it's what keeps you from getting stuck and guarantees you finish. Treat it as a track to run on when nerves hit.

## Phase 1 — Requirements (~5 min)

Two lists, both short.

**Functional requirements** — "Users should be able to …" statements. Interview this like a conversation with a product manager: "does the system need X?", "what happens if Y?" Then rank ruthlessly. Real systems have hundreds of features; your job is the top 3. A long list hurts you — the rest of the interview is you building what this list says, and several companies explicitly score your ability to focus.

**Non-functional requirements** — "The system should …" statements about qualities: availability, scale, latency, consistency, durability. Two rules:

- Quantify everything. "Low latency" is noise — every system wants that. "Feed renders in <200ms" is a requirement you can design against.
- Pick the 3–5 that actually bind this system. A starting checklist: consistency vs availability (CAP — see Challenge 3), scale and its shape (steady or bursty? reads or writes?), latency targets for the slowest operations, durability (can a social like be lost? can a payment?), plus compliance/security if the domain demands it.

**Capacity estimation: skip it — usually.** Don't open with five minutes of QPS arithmetic that concludes "so, a lot." Do the math when it would change the design (Challenge 4 makes you fast at this). Saying "I'll estimate on demand during the design, when a number actually matters" is a senior move, not a dodge.

## Phase 2 — Core Entities (~2 min)

Jot the nouns: the actors and the resources the functional requirements need. For a Twitter-like system: User, Tweet, Follow. That's it — no columns yet. You don't know what you don't know; fields get added next to the database box once the design shows you which state changes on each request. Two questions that find them fast: who acts on the system, and what things get created, read, or linked? Pick decent names while you're at it — some interviewers treat it as a naming test.

## Phase 3 — API (~5 min)

Pick the protocol in one sentence and move:

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

This contract is your checklist for Phase 4. If an endpoint has no design and a box has no endpoint, one of them is wrong. (Data pipelines like crawlers get an optional "data flow" step here — a numbered list of processing stages. If there's no long sequence of steps, skip it.)

## Phase 4 — High-Level Design (~10–15 min)

Draw the system: clients, load balancer, services, database, and whatever else the endpoints demand. Three disciplines:

1. **Go one endpoint at a time.** Walk through how a request flows from API call to database and back, and what state changes where. This turns a scary blank canvas into a sequence.
2. **Narrate while drawing.** Silence is where interviews die. The diagram is a prop; the story of data flowing through it is the deliverable.
3. **Park complexity.** The cache you're itching to add, the queue, the shard — say "I see a scaling risk here, I'll come back in deep dives," mark it, move on. Candidates who layer complexity early routinely never arrive at a working system.

When a request reaches the database, sketch the key fields next to the box — only the ones that matter to the design. The interviewer knows a user table has an email.

## Phase 5 — Deep Dives (~10 min)

Now revisit the non-functional requirements and the parked risks. Harden the design: meet the latency target, handle the burst, fix the bottleneck, address whatever the interviewer probes. How proactive you are here is a seniority dial — mid-level candidates can wait for the interviewer to point; senior candidates identify the two most interesting problems themselves and lead.

One Twitter example: "scale to 100M DAU" becomes a discussion of caching and sharding; "feed in <200ms" becomes fanout-on-read vs fanout-on-write. Lead, but don't monologue — leave the interviewer room to probe. They have specific signals they still need from you, and talking over them costs you the Communication score you were busy earning.

## Lines worth stealing

- "Let me confirm scope: the three things that matter are X, Y, Z — out of scope today."
- "I'll do estimates on demand — where a number would change the design."
- "These are the endpoints; now I'll build up the system one endpoint at a time."
- "I see two scaling risks here — caching and the write path. Parking both for deep dives."
- "Deep dive one: the feed read path, since our <200ms target lives there."

Go deeper: [Hello Interview's system design course](https://www.hellointerview.com/learn/courses/system-design) has the full delivery framework with worked video walkthroughs.

## 🤖 Mock interview: run it

```text
You are my system design interviewer at a top tech company for a 45-minute
mock interview. Your job is to enforce the delivery framework as strictly as
a real interviewer enforces the clock.

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
- If I'm stuck more than 2 minutes, offer a fork: "hint, or next section?"
- At 45 minutes, or when I say "end interview", stop and score.

SCORING
Drop character. Score 1-4 on Problem Navigation, Solution Design, Technical
Excellence, Communication — each with one quoted moment as evidence. Then
report: which phase I ran over on, whether I delivered a working end-to-end
system, and the one habit to drill next time.

Start by asking me to pick a problem.
```

## ✅ Interview-ready when

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

- **You're 8 minutes into requirements and still asking questions.** Cap yourself: pick the best 3 you have, say them out loud, confirm with the interviewer, move. A prioritized guess beats a complete list at minute 20.
- **The high-level design is half-drawn at minute 35.** Stop designing breadth. Pick the single most important endpoint, finish it end to end, and use deep dives to extend — a complete narrow system beats a complete-in-your-head wide one.
- **You parked a risk and never came back.** Keep a visible margin note ("deep dive: feed cache"). At minute 35, read your own note out loud and start there.
- **The interviewer keeps pulling you off your track.** Their probes are the interview now — follow them, but narrate how each answer updates the plan: "that changes the write path, let me fold it in."
- **You realize your API can't satisfy a requirement.** Say it and fix it: "Actually, follow needs a delete — I'll add DELETE /follows." Self-correction on the record is Communication signal, not a mistake.

➡️ **Next:** [Challenge 3 — The Toolbox](../03-the-toolbox/)
