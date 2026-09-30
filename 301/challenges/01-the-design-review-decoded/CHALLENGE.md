# Challenge 1 — The Design Review, Decoded

**Mission:** Watch four candidates fail before you sit down — one per rubric box, each with solid knowledge and a written no — so your 45 minutes produce evidence instead of vibes. Every habit this course drills exists because a candidate broke without it.

**Time:** ~45 minutes

---

## 😱 War story: the flawless design that got a no

A strong mid-level candidate gets "Design Instagram" and asks zero questions. Forty minutes of beautiful drawing: photo service, feed service, CDN, done. Nothing technical is wrong — and that is the problem. They never scoped the problem, never ranked features, never stated a trade-off, never left the reviewer a door to walk through. The rubric has four boxes; the reviewer could fill in evidence for one. Written feedback: "executes a known design well; can't yet lead an ambiguous one." The candidate didn't lack knowledge. They lacked signal. This challenge is about what signal looks like from the other side of the table.

## 🧰 What you'll learn

- Why the review formats matter: they decide what "delivered a working system" even means — the first break is shipping the wrong artifact
- Why the 4-competency rubric exists: four boxes, four distinct ways candidates with solid knowledge still fail
- Why reviewers probe the way they do: every question aims at a box they can't fill yet
- What "senior" means mechanically: fast through the basics, deliberate about depth — because waiting to be led is itself the break

## The scorecard, from the other side of the table

System design design reviews test one thing: can you take an ambiguously stated, high-level problem and decompose it into working infrastructure? There is rarely a single right answer — what's being tested is navigation, trade-off reasoning, and communication. Where you'll sit in the loop:

| Format | The prompt sounds like | You'll draw |
|---|---|---|
| **Product design** (most common) | "Design Uber", "Design a news feed" | Services, datastores, caches — a whole system |
| **Infrastructure design** (most common) | "Design a rate limiter", "Design a distributed message queue" | One focused component, deeper internals |
| Low-level design / OOP | "Design a parking garage" (class model) | Objects and interfaces — different review, different prep |
| ML system design | "Design a recommendation ranking service" | Model + data pipelines, not just infra |
| Frontend design | "Design a collaborative editor UI" | Components and state, not servers |

Entry-level roles usually skip this review entirely. Mid-level: it's common. Senior: it's the norm, and it carries disproportionate weight in the hiring decision — for senior candidates, this is the review where the level gets decided.

Companies rename the rubric constantly. Underneath, every rubric touches the same four things — and each box is a distinct way to break:

| Competency | What they're watching for | Fastest way to fail it |
|---|---|---|
| **Problem Navigation** | Scope a vague problem, rank what matters, keep moving | Grinding trivial parts; freezing on one piece; never delivering a working system |
| **Solution Design** | Each piece solved coherently; the pieces fit together | Spaghetti design; ignoring scale and performance entirely |
| **Technical Excellence** | Current tech, applied with recognized patterns | Antiquated assumptions ("databases die at 100GB"); tech dropped in with no reason |
| **Communication** | Clear narration, collaborative under challenge | Silence; talking over probes; getting defensive when pushed |

The reviewer's behavior is a compass for which box is unfilled right now: clarifying questions = they're testing Communication. "Why not X?" = Solution Design under challenge. "How does it behave at 100x?" = Technical Excellence. "We're at minute 20" = Navigation just failed.

## Break 1 — the candidate who designs for 40 minutes and never ships

**The break, on the clock.** "Design Instagram," minute 0: no questions asked — ambiguity reads like an invitation to execute. Minute 40: a beautiful diagram, photo service to CDN, and evidence for exactly one rubric box. The candidate answered everything they were asked and decided nothing about what the system *was*.

**The obvious fix, and why it fails:** work harder — build everything, grind each part to completion. The clock kills it: navigation is scored on what you *cut*, and it's the least taught, most evaluated competency — where most candidates lose the offer. Twenty minutes on authentication for a news feed fails navigation no matter how good the auth design was.

**The fix: scope, rank, keep moving.** Interrogate the prompt like a conversation with a product manager — "does the system need X?", "what happens if Y?" — then rank ruthlessly: real systems have hundreds of features, your job is the top 3, and several companies explicitly score your ability to focus. A long list hurts you; the rest of the review is you building what this list says. What "shipping" means depends on the format you drew — a whole system for product design, one component's internals for infrastructure design (table above).

**The cost:** out-loud scoping means an reviewer favorite gets parked. Park it visibly — "out of scope today; I'd extend with X" — and the cut reads as judgment, not omission.

## Break 2 — the candidate who dies on the first probe

**The break, on the clock.** Minute 31, the reviewer asks "are you sure?" The candidate defends the fortress — or goes silent. Either way the Communication box stays empty: silence produces no rubric evidence, and defensiveness reads as immature judgment.

**The obvious fix, and why it fails:** rehearse harder, pre-write answers. It fails on contact — pre-written answers shatter exactly when a probe deviates from the script, and the probe was asked *because* the delivery sounded rehearsed (that's Break 3's break). Rehearsal doesn't survive being pushed.

**The fix: narrate reasoning and treat probes as collaboration.** The diagram is a prop; the story of data flowing through it is the deliverable — narrated reasoning is what rubric evidence is made of. When "why not X?" lands, that's Solution Design under challenge: answer with reasoning, then adjust the design live. A probe you incorporate is worth more than an answer you defended.

**The cost:** narrating exposes wrong turns in real time. A wrong turn corrected on the record is Communication *signal*; the risk was never being wrong, it was being silent while right.

## Break 3 — the candidate who sounds rehearsed

**The break, on the clock.** The candidate recognizes the question and recites a polished solution. The reviewer deploys the doubt-probe: "Are you sure?", "What if I told you it's 10x that?" The rehearsed answer has no 10x branch — so now they're hunting for the seam, and every confident sentence is one.

**The obvious fix, and why it fails:** polish the recitation further. It compounds the problem: when you sound rehearsed, expect doubt-the-answer probes. The antidote reviewers are listening for is reasoning out loud from first principles.

**The fix: current tech, applied with recognized patterns, with reasons attached.** "Databases die at 100GB" fails Technical Excellence on delivery — antiquated assumptions get probed until they crack. So does any tool dropped in with no reason. Say what pattern you're applying and why it fits this problem; reasoning from scratch survives the 10x probe, because the probe just extends your reasoning.

**The cost:** reasoning live is slower than reciting, and it maps your actual ceiling. That's the point — the reviewer needs the ceiling located; a recited answer hides it and gets probed until it breaks.

## Break 4 — the candidate who waits to be led

**The break, on the clock.** A complete design lands at minute 40 — and the level comes back mid-level. The deep dives waited for the reviewer to point at weaknesses, trade-offs were named only when asked, probes were survived instead of used. Both levels are expected to deliver a complete working design; pacing and ownership decide the level.

**The obvious fix, and why it fails:** be more thorough on the basics. Thoroughness is the mid-level tell — the senior show starts *after* the basics are routine.

| | Mid-level | Senior |
|---|---|---|
| Basics (requirements → API → design) | Solid and thorough — that's the whole show | Fast, almost routine; the show starts after |
| Deep dives | Waits for the reviewer to point at weaknesses | Finds bottlenecks unprompted and leads 1–2 of them |
| Trade-offs | Names them when asked | States the cost of every choice without being asked |
| Probes | Responds well | Treats probes as collaboration and adjusts the design live |

**The fix: lead the last 10 minutes.** Everything in this course hangs on one skeleton — Requirements ~5 min, core entities ~2, API ~5, high-level design ~10–15, deep dives ~10 (Challenge 2 turns it into a drill) — and the deep dives are where seniority is decided: identify the two most interesting problems yourself and lead. If you're **staff+**: the game changes again. Pure depth reads as mid-level dressed up; staff signal is judgment about what *not* to build, non-obvious trade-offs, production-operation concerns (failure modes, migrations, cost), and steering the review itself. Read a dedicated staff-level guide before a staff loop — the standard playbook can undersell you.

**The cost:** leading means choosing your deep dive — you might pick the "wrong" bottleneck. Picking one at all is the senior signal; waiting to be assigned one is the break.

## 🤖 Design-review drill: run it

```text
You are an experienced design-review leader at a large tech company.
Today you are running a RUBRIC DIAGNOSTIC, not a full review: a compressed
15-minute design conversation used to measure my baseline on the four
competencies — Problem Navigation, Solution Design, Technical Excellence,
Communication.

SETUP
1. Ask me to confirm I'm ready, then give me ONE of these prompts (your pick):
   "Design a bike-share service", "Design a pastebin", or
   "Design a rate limiter for a public API".
2. Compress the clock: say "We have 15 minutes — I care about how you think,
   not a complete system."
3. Keep me talking. You should speak less than 20% of the time.

DURING — run these moves, in this order, once each:
- After my first minute, ask: "What are you choosing NOT to build today?"
- Challenge one decision: "Why that over the obvious alternative?"
- Inject one constraint: "Footnote: it needs to handle 10x traffic on Mondays."
- If I make a choice without naming what it costs, stop me: "What does that
  choice cost?"
- If I go silent or wander, just ask: "What's the most important open question
  right now?"
- Never give hints unless I explicitly ask for one.

SCORING (after 15 minutes, or when I say "end")
Drop character. Score each competency 1-4 with one quoted moment as evidence:
- Problem Navigation: did I scope, prioritize, and keep moving?
- Solution Design: were the pieces coherent and complete enough to ship?
- Technical Excellence: were tech choices justified and current?
- Communication: did I narrate reasoning, take feedback, adjust?
Then tell me: my weakest competency, the single highest-leverage habit to
build, and which challenge of this course I should run next. Offer to re-run
the diagnostic with a different problem for a second data point.

Begin by asking if I'm ready to start the clock.
```

## ✅ You own it when

- [ ] You can name the 4 competencies and one failure mode of each, unprompted
- [ ] You can say in one sentence how a senior run differs from a mid-level one
- [ ] You've read or watched one real system design review and could name which competency each phase demonstrated
- [ ] You've run the diagnostic drill and know your weakest competency
- [ ] You can decode an reviewer probe ("are you sure?") as a signal, not an insult

## 📚 Jargon

| Term | What it means |
|---|---|
| Rubric | The scored checklist your reviewer fills in; usually maps to the 4 competencies |
| Signal | Observable evidence a rubric box can be checked. Silence produces none |
| Deep dive | The last ~10 minutes, where one hard sub-problem gets full treatment |
| Hire signal | A behavior that moves a rubric score up; reviewers write these down as quotes |
| Yellow flag | A behavior suggesting memorized material or immature judgment — probed, not always fatal |
| LLD | Low-level design review: class structures and code-level modeling, not this |
| Staff+ | Levels above senior; the review expectations change, not just increase |
| DAU | Daily active users — the unit most scale requirements are quoted in |

## 🆘 When it goes wrong

- **The reviewer gives no feedback the whole time.** Normal — they're scoring, not coaching. Don't fish for validation; narrate your reasoning instead so the rubric fills itself.
- **You get a question you've literally seen before.** Don't recite the memorized solution — that's exactly what they probe for. Deliver it as if reasoning from scratch, and let them redirect you.
- **The reviewer interrupts you mid-sentence.** That's a redirect, not an attack: they're managing the clock or steering to a signal they still need. Take it, adjust, keep moving.
- **You felt great and still got a no.** Self-assessed comfort isn't rubric evidence. Re-run the diagnostic drill below and score yourself against the four boxes, not against how the conversation felt.

➡️ **Next:** [Challenge 2 — The Delivery Framework](../02-the-delivery-framework/)
