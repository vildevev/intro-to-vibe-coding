# 🏗️ System Design — 301

*A senior-engineer track: how big systems actually work — and how to design one
at a whiteboard pace, with every choice carrying a named cost.*

**Who this is for:** engineers who already build software and now want to think
at scale — "Design Uber", "Design a rate limiter", "how would you handle 600k
requests a second?" Not theory: every idea here is introduced the way it
actually earns its place — **a system breaks, and the technique arrives as the
fix.**

**How it works:** 12 challenges, taught failure-first. No component appears
because it's on a list; each one solves a failure you've just watched happen,
with numbers on it ("the database melts at 600k QPS → replicas; repeats are
Zipfian → cache; the cache's expiry storms the DB → stampede defenses"). And
because fixes cost something, every challenge names the cost — knowing what you
traded is the whole difference between following patterns and understanding
them. Then you *practice out loud*: every challenge ends with a copy-paste
prompt that turns any AI chat into a **design-review drill** whose reviewer
won't let you add a component without naming the break it fixes.

---

## The course map

| # | Challenge | The skill | Time |
|---|-----------|-----------|------|
| 1 | [The Design Review, Decoded](challenges/01-the-design-review-decoded/) | How designs get judged: the rubric, the clock, what senior actually means | 45 min |
| 2 | [The Delivery Framework](challenges/02-the-delivery-framework/) | Requirements → entities → API → design → deep dives, on a clock | 60 min |
| 3 | [The Toolbox](challenges/03-the-toolbox/) | Networking, LBs, databases, caches — the pieces everything is made of | 60 min |
| 4 | [Thinking in Scale](challenges/04-thinking-in-scale/) | The numbers to know and back-of-envelope math that anchors decisions | 60 min |
| 5 | [Scaling Reads](challenges/05-scaling-reads/) | Cache hierarchies, CDNs, replicas — designed via a URL shortener | 60 min |
| 6 | [Scaling Writes](challenges/06-scaling-writes/) | Write-heavy systems, partitioning, log-structured storage, Kafka | 60 min |
| 7 | [Real-Time Updates](challenges/07-real-time-updates/) | Polling vs SSE vs WebSockets — designed via live comments | 60 min |
| 8 | [Contention](challenges/08-contention/) | Race conditions, locks, idempotency — designed via Ticketmaster | 60 min |
| 9 | [Multi-Step Processes](challenges/09-multi-step-processes/) | Distributed workflows: sagas, outboxes, exactly-once — via payments | 60 min |
| 10 | [Heavy Things](challenges/10-heavy-things/) | Blobs, uploads, and long-running tasks — via Dropbox and LeetCode | 60 min |
| 11 | [Proximity Services](challenges/11-proximity-services/) | Geospatial at scale — designed via Yelp/Uber | 60 min |
| 12 | [Full Designs](challenges/12-full-designs/) | The whole 45 minutes, twice, timed — the capstone | 2–3 hrs |

## The Rules

1. **The framework is the track.** Never freestyle a 45-minute design;
   Requirements → Entities → API → High-level → Deep dives, every time.
2. **Out loud, always.** Silent reading builds recognition; reviews test
   delivery. Every challenge ends with you talking or typing a design *under
   time*.
3. **Numbers before nouns.** "Add a cache" is noise; "at 50k reads/sec with a
   90/10 split, a cache cuts DB load 10x" is a senior signal.
4. **Depth beats breadth.** Reviews reward one deep dive done well over six
   done shallow. Senior = fast through the basics, deliberate about depth.
5. **Trade-offs are the answer.** Every choice gets its cost stated. If you
   can't name the downside of your own design, the reviewer will do it for
   you — less kindly.

## Before you start

- [ ] An AI chat you like, for the design-review drills (any strong model works)
- [ ] A timer you will actually use (your phone; the clock is half the discipline)
- [ ] A way to draw: paper, Excalidraw, whiteboard — you'll diagram every challenge

## FAQ

**I'm mid-level, not senior — is this too much?**
No. The early challenges are the mid-level bar; the course marks where senior
depth begins, and you can stop there for now.

**Why drills instead of more reading?**
Because the #1 failure mode is people who consumed everything and can't
deliver under a clock. Every challenge's payoff is a timed, out-loud artifact.

**How does this fit the rest of the campus?**
The [201 track](../../201/) teaches you to *run* small real systems; this track
teaches you to *design* systems at scale. They reinforce each other.

---

*Start here → [Challenge 1: The Design Review, Decoded](challenges/01-the-design-review-decoded/)*
