# Challenge 12 — Full Designs

**Mission:** Run the entire 45 minutes like a senior candidate — full pacing, deliberate deep-dive selection from the pattern library you built in Challenges 2–11, two complete timed mocks, and a self-review rubric — because knowledge you can't deliver inside the format scores zero in the room.

**Time:** ~2–3 hours

---

## 😱 War story: the candidate who knew everything

They had read every breakdown in existence. Given "Design a news feed," they spent 12 minutes on requirements — thorough, quantified, genuinely excellent — 8 more polishing the API, and started drawing the system at minute 22. At "five minutes left" they were still on the happy path. Not one deep dive happened. The feedback wrote the archetype: "strong knowledge, weak delivery." The arithmetic of the format is brutal: one 45-minute take, a rubric that scores what you said rather than what you know, and every minute overspent on phases 1–3 is stolen from the deep dives where the senior signals live. This challenge is the dress rehearsal — same clock, same format, twice, with a rubric in between.

## 🧰 What you'll learn

- The senior pacing plan, minute by minute, and what "fast through the basics" actually means
- A signal table mapping problem phrases to the deep dive they're begging for
- Two full timed mocks — how to run them and what to fix between them
- A self-review rubric mapped to the four scored competencies

## The 45 minutes, senior pacing

| Minutes | Phase | The senior note |
|---|---|---|
| 0–5 | Requirements | top-3 functional, quantified non-functional; ask about scale early |
| 5–7 | Entities | nouns only; names count as a mini naming test |
| 7–12 | API | one sentence of protocol justification; endpoints become your checklist |
| 12–25 | High-level | endpoint by endpoint, narrating data flow; park risks visibly |
| 25–40 | Deep dives | the interview is won here — two dives, led by you |
| 40–45 | Wrap | monitoring, next steps, "with more time I'd..." |

The senior delta over Challenge 2's framework isn't new phases — it's velocity. Basics at recall speed, zero deliberation, so the deep dives inherit 15 protected minutes. Two tripwires: if you're past minute 25 without a complete happy path, cut scope rather than speed up; and if an interviewer probe derails you, fold it back in aloud ("that changes the write path — let me update the plan") instead of abandoning your structure.

## Choosing your deep dives: the signal table

Listen for the phrases — each names its pattern:

| The problem says | Your deep dive | From |
|---|---|---|
| "live", "real-time", "instantly", presence | delivery mechanism + the second hop + fan-out | Challenge 7 |
| "two users", "only one", "simultaneously", limited stock | locks, versioning, TTL reservations | Challenge 8 |
| "if step X fails", refunds, multi-service flows | saga, idempotency keys, outbox/CDC | Challenge 9 |
| files, video, "might take minutes", untrusted code | presigned URLs, multipart, async workers | Challenge 10 |
| "near me", drivers, maps, delivery zones | spatial index + post-filter | Challenge 11 |
| reads dwarf writes, "viral" | cache ladder, hot keys, stampedes | Challenge 5 |
| write firehose, "10M events/sec" | partitioning, batching, queues | Challenge 6 |
| numbers that would change the design | back-of-envelope, spoken out loud | Challenge 4 |

Take two: one you're strong on, one the problem is visibly about. Announce the choice — "the two interesting problems here are the write path and the hot-key problem" — that single sentence is Communication signal and invites the interviewer into the part you prepared for.

## A synthesis sketch: the news feed in 25 minutes

One design to see the whole library at work. Entities User, Follow, Post; API covers post, follow, paged feed. The naive read assembles a feed from every followed user's posts — say it won't scale and park it. Deep dive one, fan-out: precompute feeds on write with async workers behind a queue, then go hybrid — mega-accounts skip the fan-out entirely and their posts merge in at read time, because per-account choice beats one-size-fits-all. Deep dive two, hot keys: a viral post hammers one cache shard; replicate cache instances instead of sharding so N instances share the heat with no coordination. Storage math stays quiet unless it changes a decision. Notice every fix arrived from a numbered challenge — that's what the library is for.

## The two timed mocks

Run them at least a day apart; each is a full 45 minutes plus 15 minutes of review. **Mock A — product-style:** a feed, a ticketing system, a chat app, ride-hailing. **Mock B — infra-style:** metrics monitoring, a rate limiter, a web crawler — note the framing shifts there: data-flow step first, APIs second. Use the mock prompt below; it picks problems you won't have rehearsed. After each mock, score yourself against the rubric before reading the AI's scores, then fix exactly one habit before the next — not five. The goal is for the second mock to feel boring.

## Self-review rubric

| Competency | Ask yourself | A pass looks like |
|---|---|---|
| Problem Navigation | Did I confirm scope and pick a top-3, or try to design everything? | explicit in/out of scope; each functional requirement maps to an endpoint |
| Solution Design | Could someone implement from my drawing alone? | complete happy path before complexity; every box and arrow justified |
| Technical Excellence | Did every choice carry a trade-off and, where relevant, a number? | "X because Y, costing Z"; estimates only where they'd change a decision |
| Communication | Did I narrate while drawing and lead the deep dives? | no silent stretches; parked risks actually returned to; probes answered, structure kept |

Score 1–4 per competency per mock and track the trajectory. One consistent weakness across both mocks is a drill with a numbered challenge, not a mystery — go back and re-run that challenge's mock.

Go deeper: [Hello Interview's system design course](https://www.hellointerview.com/learn/courses/system-design) has full-length video walkthroughs of complete designs — watch them after your first mock, never before, so you calibrate against your own take rather than memorizing someone else's.

## 🤖 Mock interview: run it

```text
You are my system design interviewer at a top tech company. This is a
FULL 45-minute mock — the capstone rehearsal. You own the clock absolutely.

SETUP
1. Ask my target level (mid / senior / staff) and a product vs infra
   preference. Then YOU pick the problem — something level-appropriate you
   have a strong opinion about (feed, chat, ticketing, payments, file
   storage, ride-hailing, metrics monitoring, crawler, rate limiter...).
   Do not reveal which patterns it tests. Confirm the problem, start the
   clock, and enforce it hard: announce elapsed time at 5, 15, 25, 35 and
   43 minutes ("5 minutes in — requirements should be wrapping"). At 45
   minutes, or when I say "end interview", stop immediately, mid-sentence
   if needed.

DURING THE INTERVIEW
- Requirements: if my functional list exceeds top-3, push me to cut. If
  any non-functional is unquantified, ask "what number?"
- Entities/API: hold me to ~2 and ~5 minutes respectively.
- High-level design: make me go endpoint by endpoint and narrate data
  flow. If I reach for caches, queues, or shards before a complete happy
  path: "Park it — deep dives later."
- Deep dives (from ~minute 25): choose the 2 most interesting problems in
  MY design and probe hard, 2-3 escalating follow-ups each ("what breaks
  at 100x?", "what happens if this crashes?", "what did that choice
  cost?"). If I stall 2 minutes, offer: "hint, or move on?" Hints only on
  request, smallest possible nudge.
- Stay in character. No coaching, no confirming correctness beyond a
  poker-faced "go on" or "hm, what about when X?"

AFTER THE CLOCK
Drop character. Score 1-4 on each competency, each with one quoted moment
of mine as evidence:
- Problem Navigation: scoping, prioritization, requirement-to-endpoint map
- Solution Design: complete working system, justified components
- Technical Excellence: trade-offs stated, numbers where they matter,
  depth on 2+ deep dives
- Communication: narration, structure, responsiveness under probing
Then debrief: (1) which phases ran over and what it cost, (2) which deep
dives I took vs which the problem was begging for, (3) the ONE habit to
drill before my next mock, (4) a verdict — hire / lean hire / lean no /
no — plus the two sentences you'd write in real interview feedback.
Finally, show me the self-review rubric (scope, implementability,
trade-offs-with-numbers, narration) and make me score myself on the same
four competencies before revealing your scores and any gaps.

Start by asking my level and product-vs-infra preference.
```

## ✅ Interview-ready when

- [ ] You've delivered two complete 45-minute designs under a hard timer, out loud, and finished the deep dives both times
- [ ] You can name a problem's two deep dives within the first 10 minutes — and say why those two
- [ ] Your requirements-to-endpoints mapping has no gaps in either mock
- [ ] You scored yourself on the rubric before reading the AI's scores, and know your one recurring weakness
- [ ] The second mock felt boring — you ran the track instead of improvising

## 📚 Jargon

| Term | What it means |
|---|---|
| Pacing plan | The minute-by-minute budget that guarantees deep dives get 15 protected minutes |
| Signal | A phrase in the problem statement that names the pattern the interviewer wants probed |
| Deep-dive selection | Choosing two problems in your own design to harden — breadth was phases 1–4, this is depth |
| Hybrid design | Mixing strategies per account or per case (fan-out on write for most, on read for mega-accounts) |
| Mock loop | Mock, self-score, fix one habit, repeat — the only cycle that moves the verdict |
| Rubric | The four scored competencies: Problem Navigation, Solution Design, Technical Excellence, Communication |
| Lean hire / lean no | The interviewer's actual output: a recommendation plus evidence, not a grade |
| Calibrate | Comparing your delivered design against a full worked take — after you've done your own |

## 🆘 When it goes wrong

- **You're drawing the happy path at minute 25.** Cut scope, don't rush: finish the single most important endpoint end to end, then deep-dive it. A complete narrow system beats a wide sketch.
- **The interviewer's probe blew up your plan.** Fold it back in aloud and keep the structure — "that changes the write path; updating the plan" is a Communication score, not a loss.
- **You took zero deep dives because time evaporated.** Audit where it went; it's almost always requirements or API polish. Next mock, cap those phases visibly and write the minute marks down.
- **You can't tell which patterns a problem wants.** Run the signal table against the problem statement out loud in your prep — the phrases nearly always announce the deep dives.
- **Both mocks exposed the same weakness.** Stop mocking; go re-run the numbered challenge that owns that skill, including its own mock prompt, then come back.

➡️ **Next:** [Coding Interview Patterns — 401](../../../401/)
