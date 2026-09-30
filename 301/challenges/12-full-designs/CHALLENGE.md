# Challenge 12 — Full Designs

**Mission:** Run the entire 45 minutes like a senior candidate — because this challenge exists for the three ways the whole review breaks at once: knowledge that can't deliver, deep dives chosen by accident, and practice that reads instead of performs. Two complete timed drills, a pacing plan, and a self-review rubric are the fixes.

**Time:** ~2–3 hours

---

## 😱 War story: the candidate who knew everything

They had read every breakdown in existence. Given "Design a news feed," they spent 12 minutes on requirements — thorough, quantified, genuinely excellent — 8 more polishing the API, and started drawing the system at minute 22. At "five minutes left" they were still on the happy path. Not one deep dive happened. The feedback wrote the archetype: "strong knowledge, weak delivery." The arithmetic of the format is brutal: one 45-minute take, a rubric that scores what you said rather than what you know, and every minute overspent on phases 1–3 is stolen from the deep dives where the senior signals live. This challenge is the dress rehearsal — same clock, same format, twice, with a rubric in between.

## 🧰 What you'll learn

- Why the pacing plan exists: each minute budget prevents a named way the 45 dies
- How deep dives get chosen — by you, out loud, from the problem's own signal phrases
- Why one drill teaches nothing: the drill loop (drill → self-score → fix one habit → repeat)
- A self-review rubric mapped to the four scored competencies

## Break 1 — the 12-minute requirements phase

**The break, in full:** excellent, quantified requirements through minute 12. API polish through 20. A beautiful high-level drawing started at 22 — and a clock that ends the review before a single deep dive begins. Nothing was wrong with the knowledge; the *allocation* was fatal, and it's the most common senior-candidate failure because the phases it over-feeds are the ones that feel productive.

**The obvious fix, and why it fails:** "be faster." Rushing phases 1–3 trades a slow failure for a sloppy one — missed requirements resurface as rework at minute 30, and a rushed API becomes a checklist you can't map entities to. Speed isn't the fix; allocation is.

**The fix: the pacing plan, with tripwires.** Basics at recall speed — zero deliberation — so the deep dives inherit 15 protected minutes:

| Minutes | Phase | The senior note |
|---|---|---|
| 0–5 | Requirements | top-3 functional, quantified non-functional; ask about scale early |
| 5–7 | Entities | nouns only; names count as a mini naming test |
| 7–12 | API | one sentence of protocol justification; endpoints become your checklist |
| 12–25 | High-level | endpoint by endpoint, narrating data flow; park risks visibly |
| 25–40 | Deep dives | the review is won here — two dives, led by you |
| 40–45 | Wrap | monitoring, next steps, "with more time I'd..." |

Two tripwires, because even good plans break: past minute 25 without a complete happy path — cut scope rather than speed up (a complete narrow system beats a wide sketch); an reviewer probe derails you — fold it back in aloud ("that changes the write path — let me update the plan") instead of abandoning your structure.

**The cost:** a top-3 scoping pass might skip the feature the reviewer cared about — recoverable, because you announce scope and can amend on the record. An unmanaged clock is not recoverable; nothing after minute 40 gets scored.

## Break 2 — the deep dives that happen by accident

**The break:** the clock reaches minute 25 and the candidate... follows the reviewer. Whichever probe comes first gets the depth; the other 20 minutes wander. The rubric's Technical Excellence line — *depth on 2+ deep dives, led by you* — goes unscored, and "led by you" was the whole senior signal.

**The obvious fix, and why it fails:** prepare deep-dive answers for every pattern. You have a library of eight; rehearsing all of them per problem produces neither depth nor recall speed — it's the 500-problems mistake in system-design form.

**The fix: read the problem for its signal phrases, then pick two and announce them.** Each phrase names the pattern it's begging for:

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

Take two: one you're strong on, one the problem is visibly about. Announce the choice — "the two interesting problems here are the write path and the hot-key problem" — that single sentence is Communication signal and invites the reviewer into the part you prepared for.

**The cost:** an announced pick commits you — if the reviewer wanted a different deep dive, you've built an expectation to redirect ("happy to go there — one level deeper on this first?"). Unannounced wandering commits you to nothing and scores as nothing.

## The whole library under one clock: the news feed in 25 minutes

One synthesis sketch, to see every challenge arrive as a fix inside a single design. Entities User, Follow, Post; API covers post, follow, paged feed. The naive read assembles a feed from every followed user's posts — say it won't scale and park it. Deep dive one, fan-out: precompute feeds on write with async workers behind a queue, then go hybrid — mega-accounts skip the fan-out entirely and their posts merge in at read time, because per-account choice beats one-size-fits-all. Deep dive two, hot keys: a viral post hammers one cache shard; replicate cache instances instead of sharding so N instances share the heat with no coordination. Storage math stays quiet unless it changes a decision. Notice every fix arrived from a numbered challenge — that's what the library is for.

## Break 3 — one drill, read solutions, feel ready

**The break:** a single drill, some reading, and the confident feeling of preparation — the same feeling as the candidate in the war story. One rehearsal measures nothing: there's no trajectory, so no habit gets fixed, and drill day is the first time delivery is tested.

**The obvious fix, and why it fails:** many drills, back to back. Volume without review engrains the same habits — including the broken ones — and burns the problems you'll want fresh later.

**The fix: the drill loop — two drills, a day apart, one habit each.** **Drill A — product-style:** a feed, a ticketing system, a chat app, ride-hailing. **Drill B — infra-style:** metrics monitoring, a rate limiter, a web crawler — note the framing shifts there: data-flow step first, APIs second. Use the prompt below; it picks problems you won't have rehearsed and owns the clock absolutely. After each: score yourself against the rubric *before* reading the AI's scores, then fix exactly one habit before the next — not five. The goal is for the second drill to feel boring.

**The cost:** two drills is a floor, not a ceiling — and it costs real hours. That's the honest price of the format: delivery is a skill, and skills price themselves in reps, not reading.

## Self-review rubric

| Competency | Ask yourself | A pass looks like |
|---|---|---|
| Problem Navigation | Did I confirm scope and pick a top-3, or try to design everything? | explicit in/out of scope; each functional requirement maps to an endpoint |
| Solution Design | Could someone implement from my drawing alone? | complete happy path before complexity; every box and arrow justified |
| Technical Excellence | Did every choice carry a trade-off and, where relevant, a number? | "X because Y, costing Z"; estimates only where they'd change a decision |
| Communication | Did I narrate while drawing and lead the deep dives? | no silent stretches; parked risks actually returned to; probes answered, structure kept |

Score 1–4 per competency per drill and track the trajectory. One consistent weakness across both drills is a drill with a numbered challenge, not a mystery — go back and re-run that challenge's drill.

## 🤖 Design-review drill: run it

```text
You are a senior engineer leading my design review. This is a
FULL 45-minute design-review drill — the capstone rehearsal. You own the clock absolutely.

SETUP
1. Ask my target level (mid / senior / staff) and a product vs infra
   preference. Then YOU pick the problem — something level-appropriate you
   have a strong opinion about (feed, chat, ticketing, payments, file
   storage, ride-hailing, metrics monitoring, crawler, rate limiter...).
   Do not reveal which patterns it tests. Confirm the problem, start the
   clock, and enforce it hard: announce elapsed time at 5, 15, 25, 35 and
   43 minutes ("5 minutes in — requirements should be wrapping"). At 45
   minutes, or when I say "end review", stop immediately, mid-sentence
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
  cost?"). If I add a component without naming the break it fixes, stop
  me: "What breaks without it?" If I stall 2 minutes, offer: "hint, or
  move on?" Hints only on request, smallest possible nudge.
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
drill before my next drill, (4) an assessment — hire / lean hire / lean no /
no — plus the two sentences you'd write in real review feedback.
Finally, show me the self-review rubric (scope, implementability,
trade-offs-with-numbers, narration) and make me score myself on the same
four competencies before revealing your scores and any gaps.

Start by asking my level and product-vs-infra preference.
```

## ✅ You own it when

- [ ] You've delivered two complete 45-minute designs under a hard timer, out loud, and finished the deep dives both times
- [ ] You can name a problem's two deep dives within the first 10 minutes — and say why those two
- [ ] Your requirements-to-endpoints mapping has no gaps in either drill
- [ ] You scored yourself on the rubric before reading the AI's scores, and know your one recurring weakness
- [ ] The second drill felt boring — you ran the track instead of improvising

## 📚 Jargon

| Term | What it means |
|---|---|
| Pacing plan | The minute-by-minute budget that guarantees deep dives get 15 protected minutes |
| Signal | A phrase in the problem statement that names the pattern the reviewer wants probed |
| Deep-dive selection | Choosing two problems in your own design to harden — breadth was phases 1–4, this is depth |
| Hybrid design | Mixing strategies per account or per case (fan-out on write for most, on read for mega-accounts) |
| Drill loop | Drill, self-score, fix one habit, repeat — the only cycle that moves the verdict |
| Rubric | The four scored competencies: Problem Navigation, Solution Design, Technical Excellence, Communication |
| Verdict | The reviewer's actual output: an assessment plus evidence, not a grade |
| Calibrate | Comparing your delivered design against a full worked take — after you've done your own |

## 🆘 When it goes wrong

- **You're drawing the happy path at minute 25.** Cut scope, don't rush: finish the single most important endpoint end to end, then deep-dive it. A complete narrow system beats a wide sketch.
- **The reviewer's probe blew up your plan.** Fold it back in aloud and keep the structure — "that changes the write path; updating the plan" is a Communication score, not a loss.
- **You took zero deep dives because time evaporated.** Audit where it went; it's almost always requirements or API polish. Next drill, cap those phases visibly and write the minute marks down.
- **You can't tell which patterns a problem wants.** Run the signal table against the problem statement out loud in your prep — the phrases nearly always announce the deep dives.
- **Both drills exposed the same weakness.** Stop drilling; go re-run the numbered challenge that owns that skill, including its own drill prompt, then come back.

➡️ **Next:** [Coding Patterns — 401](../../../401/)
