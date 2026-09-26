# Challenge 1 — The Interview, Decoded

**Mission:** Know what the interviewer is actually scoring before you open your mouth: the two formats you'll face, the four competencies on every rubric, and what mechanically separates a senior hire from a mid-level one — so your 45 minutes produce evidence instead of vibes.

**Time:** ~45 minutes

---

## 😱 War story: the flawless design that got a no

A strong mid-level candidate gets "Design Instagram" and asks zero questions. Forty minutes of beautiful drawing: photo service, feed service, CDN, done. Nothing technical is wrong — and that is the problem. They never scoped the problem, never ranked features, never stated a trade-off, never left the interviewer a door to walk through. The rubric has four boxes; the interviewer could fill in evidence for one. Written feedback: "executes a known design well; can't yet lead an ambiguous one." The candidate didn't lack knowledge. They lacked signal. This challenge is about what signal looks like from the other side of the table.

## 🧰 What you'll learn

- The two formats that cover most system design loops (and the three that don't)
- The 4-competency rubric hiding behind every company's "internal rubric"
- What "senior" means mechanically: fast through the basics, deliberate about depth
- How to tell which competency the interviewer is probing right now

## The formats

System design interviews test one thing: can you take an ambiguously stated, high-level problem and decompose it into working infrastructure? There is rarely a single right answer — what's being tested is navigation, trade-off reasoning, and communication. Where you'll sit in the loop:

| Format | The prompt sounds like | You'll draw |
|---|---|---|
| **Product design** (most common) | "Design Uber", "Design a news feed" | Services, datastores, caches — a whole system |
| **Infrastructure design** (most common) | "Design a rate limiter", "Design a distributed message queue" | One focused component, deeper internals |
| Low-level design / OOP | "Design a parking garage" (class model) | Objects and interfaces — different interview, different prep |
| ML system design | "Design a recommendation ranking service" | Model + data pipelines, not just infra |
| Frontend design | "Design a collaborative editor UI" | Components and state, not servers |

Entry-level roles usually skip this interview entirely. Mid-level: it's common. Senior: it's the norm, and it carries disproportionate weight in the hiring decision — for senior candidates, this is the interview where the level gets decided.

## The 4-competency rubric

Companies rename these constantly. Underneath, every rubric touches the same four things:

| Competency | What they're watching for | Fastest way to fail it |
|---|---|---|
| **Problem Navigation** | Scope a vague problem, rank what matters, keep moving | Grinding trivial parts; freezing on one piece; never delivering a working system |
| **Solution Design** | Each piece solved coherently; the pieces fit together | Spaghetti design; ignoring scale and performance entirely |
| **Technical Excellence** | Current tech, applied with recognized patterns | Antiquated assumptions ("databases die at 100GB"); tech dropped in with no reason |
| **Communication** | Clear narration, collaborative under challenge | Silence; talking over probes; getting defensive when pushed |

Reading it live:

- **Navigation is where most candidates lose the offer.** It's the least taught and most evaluated competency. Spend 20 minutes on authentication for a news feed and you failed navigation, no matter how good the auth design was.
- **They are hunting for memorized answers.** When you sound rehearsed, expect doubt-the-answer probes: "Are you sure?", "What if I told you it's 10x that?" Reasoning out loud is the antidote.
- Interviewer behavior is a compass. Clarifying questions = they're testing Communication. "Why not X?" = Solution Design under challenge. "How does it behave at 100x?" = Technical Excellence. "We're at minute 20" = Navigation just failed.

## What "senior" means here

Both levels are expected to deliver a complete working design. The difference is pacing and ownership:

| | Mid-level | Senior |
|---|---|---|
| Basics (requirements → API → design) | Solid and thorough — that's the whole show | Fast, almost routine; the show starts after |
| Deep dives | Waits for the interviewer to point at weaknesses | Finds bottlenecks unprompted and leads 1–2 of them |
| Trade-offs | Names them when asked | States the cost of every choice without being asked |
| Probes | Responds well | Treats probes as collaboration and adjusts the design live |

If you're **staff+**: the game changes again. Pure depth reads as mid-level dressed up. Staff signal is judgment about what *not* to build, non-obvious trade-offs, production-operation concerns (failure modes, migrations, cost), and steering the interview itself. Read a dedicated staff-level guide before a staff loop — the standard playbook can undersell you.

## The 45-minute shape (preview)

Everything after this challenge hangs on one skeleton: Requirements ~5 min, core entities ~2, API ~5, high-level design ~10–15, deep dives ~10. Challenge 2 turns it into a drill.

Go deeper on any of this at [Hello Interview's system design course](https://www.hellointerview.com/learn/courses/system-design) — the closest public material to what interviewers are actually trained on.

## 🤖 Mock interview: run it

```text
You are an experienced system design interviewer at a large tech company.
Today you are running a RUBRIC DIAGNOSTIC, not a full interview: a compressed
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

## ✅ Interview-ready when

- [ ] You can name the 4 competencies and one failure mode of each, unprompted
- [ ] You can say in one sentence how a senior run differs from a mid-level one
- [ ] You've read or watched one real system design interview and could name which competency each phase demonstrated
- [ ] You've run the mock diagnostic and know your weakest competency
- [ ] You can decode an interviewer probe ("are you sure?") as a signal, not an insult

## 📚 Jargon

| Term | What it means |
|---|---|
| Rubric | The scored checklist your interviewer fills in; usually maps to the 4 competencies |
| Signal | Observable evidence a rubric box can be checked. Silence produces none |
| Deep dive | The last ~10 minutes, where one hard sub-problem gets full treatment |
| Hire signal | A behavior that moves a rubric score up; interviewers write these down as quotes |
| Yellow flag | A behavior suggesting memorized material or immature judgment — probed, not always fatal |
| LLD | Low-level design interview: class structures and code-level modeling, not this |
| Staff+ | Levels above senior; the interview expectations change, not just increase |
| DAU | Daily active users — the unit most scale requirements are quoted in |

## 🆘 When it goes wrong

- **The interviewer gives no feedback the whole time.** Normal — they're scoring, not coaching. Don't fish for validation; narrate your reasoning instead so the rubric fills itself.
- **You get a question you've literally seen before.** Don't recite the memorized solution — that's exactly what they probe for. Deliver it as if reasoning from scratch, and let them redirect you.
- **The interviewer interrupts you mid-sentence.** That's a redirect, not an attack: they're managing the clock or steering to a signal they still need. Take it, adjust, keep moving.
- **You felt great and still got a no.** Self-assessed comfort isn't rubric evidence. Re-run the mock diagnostic below and score yourself against the four boxes, not against how the conversation felt.

➡️ **Next:** [Challenge 2 — The Delivery Framework](../02-the-delivery-framework/)
