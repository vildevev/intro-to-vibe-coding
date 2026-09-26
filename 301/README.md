# 🏗️ System Design Interview Prep — 301

*A senior-engineer track: walk into a system design interview with a framework,
the numbers, and the pattern library — and walk out with the hire.*

**Who this is for:** mid-level and senior engineers facing product/infrastructure
design interviews ("Design Uber", "Design a rate limiter"). You already know how
to build; this course is about *delivering* under a 45-minute clock with an
interviewer watching.

**How it works:** 12 challenges. Each one distills one skill or pattern from real
interviews, gives you the framework and the numbers, then makes you *practice out
loud* — every challenge has a copy-paste prompt that turns any AI chat into a
mock interviewer. Reading is not the skill; delivering is. Say it, draw it, get
pushed back on.

**Source note:** the curriculum follows the same arc as
[Hello Interview's system design course](https://www.hellointerview.com/learn/courses/system-design)
— the best material in the field. Explanations here are original; use their site
for the full-depth versions of every topic.

---

## The course map

| # | Challenge | The skill | Time |
|---|-----------|-----------|------|
| 1 | [The Interview, Decoded](challenges/01-the-interview-decoded/) | The rubric, the 45 minutes, what senior actually means | 45 min |
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
| 12 | [Full Designs](challenges/12-full-designs/) | The whole loop, timed, twice — the capstone | 2–3 hrs |

## The Interview Rules

1. **The framework is the track.** Never freestyle a 45-minute interview;
   Requirements → Entities → API → High-level → Deep dives, every time.
2. **Out loud, always.** Silent reading builds recognition; interviews test
   delivery. Every challenge ends with you talking or typing a design *under
   time*.
3. **Numbers before nouns.** "Add a cache" is noise; "at 50k reads/sec with a
   90/10 split, a cache cuts DB load 10x" is a senior signal.
4. **Depth beats breadth.** The rubric rewards one deep dive done well over six
   done shallow. Senior = fast through the basics, deliberate about depth.
5. **Trade-offs are the answer.** Every choice gets its cost stated. If you
   can't name the downside of your own design, the interviewer will do it for
   you — less kindly.

## Before you start

- [ ] An AI chat you like, for mock interviews (any strong model works)
- [ ] A timer you will actually use (your phone; the clock is half the exam)
- [ ] A way to draw: paper, Excalidraw, whiteboard — you'll diagram every challenge

## FAQ

**I'm mid-level, not senior — is this too much?**
No. Mid-level candidates pass the same interviews by covering the basics solidly.
The course marks where senior depth begins; stop there if that's your level.

**Why drills instead of more reading?**
Because the #1 failure mode is candidates who consumed everything and can't
deliver. Every challenge's payoff is a timed, out-loud artifact.

**How does this fit the rest of the campus?**
The [201 track](../../201/) teaches you to *run* small real systems; this track
teaches you to *talk about* systems at interview scale. They reinforce each other.

---

*Start here → [Challenge 1: The Interview, Decoded](challenges/01-the-interview-decoded/)*
