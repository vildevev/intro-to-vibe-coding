# Challenge 7 — Real-Time Updates

**Mission:** Add live push to any design — choosing among polling, long-polling, SSE, and WebSockets by trade-off rather than reflex, then solving the second hop of getting each event from its source to every connected client — by building live comments on a video stream, end to end.

**Time:** ~60 minutes

---

## 😱 War story: the WebSocket reflex

"Design live comments for a streaming platform." The candidate hears "real-time," draws a WebSocket between every client and the comment service, and stops. The design dies on two follow-ups. First: "most viewers never type a comment — why pay for a two-way channel to deliver a one-way message?" Second: "your comment lands on server 3, its viewers sit on servers 1 through 40 — now what?" Real-time designs lose points less on protocol trivia than on that second question: fan-out, routing each event to whichever servers hold the connections. This challenge builds both hops deliberately, starting from the cheapest mechanism that meets the latency bar.

## 🧰 What you'll learn

- The delivery ladder: polling, long-polling, SSE, WebSockets — and the one table that picks between them
- The two-hop model: client↔server transport vs source→server propagation
- Fan-out at scale: pub/sub with connection co-location vs a dispatcher
- Reconnections, catch-up, and what breaks when one stream goes mega-viral

## The delivery ladder

| Mechanism | How it works | The catch | Reach for it when |
|---|---|---|---|
| Polling | client asks every N seconds | latency ≈ the interval; 1M clients at 5s = 200k QPS answering "nothing new" | latency bar is seconds, not ms — most products |
| Long polling | server holds the request open until data, then answers; client re-requests | a reconnect gap between events; every LB in the path needs a matching timeout | near-real-time on plain HTTP, infrequent updates |
| SSE | one HTTP response that never ends; server writes chunks | one-way only; some proxies buffer streams; long-lived requests are awkward to monitor | read-heavy live feeds — the interview default |
| WebSockets | HTTP upgrades to a full-duplex TCP connection | stateful connections; every hop must support it; deploys sever them; reconnection is yours | write frequency ≈ read frequency (chat, games) |

Ground rules worth saying out loud. Humans read ~200ms as "instant" — that's the number your non-functional requirement should carry. Start at polling unless a number says otherwise; proposing it first is a senior move, not a dodge. Escalate only when the traffic shape demands it: SSE for read-dominated feeds (send writes over ordinary POST), WebSockets only when clients write as often as they read. WebRTC — peer-to-peer, signaling servers, NAT traversal — is for audio/video, name it and move on.

## Worked example: live comments on a video

Requirements: viewers post comments; new comments appear within ~200ms; comments from before you joined can be scrolled (infinite scroll). Scale: millions of concurrent streams, thousands of comments/second on hot ones. Availability over consistency — a comment arriving a beat late is fine.

Entities: User, Stream, Comment. API:

```text
POST /comments/:streamId   { "message": "..." }        # userId from the auth header
GET  /comments/:streamId?cursor={lastId}&limit=20      # history + infinite scroll
```

The history requirement quietly decides your pagination. Offset pages (`?offset=40`) break on a fast feed: rows shift as comments arrive, so you re-read or skip them, and the database counts through the offset every request. Cursor pages ("20 comments before ID X") are stable under inserts and hit an index. State that contrast in one breath and move on — the interview is in the push path.

Write path: comment service validates, persists to a key-value store, done. Now the deep dives.

## Deep dive 1: pushing to viewers

Polling can't meet 200ms without absurd frequency — meeting it means asking "anything new?" 20x per second, almost always for no. So push. For this traffic shape the choice writes itself: every viewer reads, a tiny fraction write, so per-viewer two-way sockets buy nothing. SSE delivers push over plain HTTP; comment creation stays a boring POST. Capacity math: a tuned server holds on the order of 100k concurrent connections (memory, CPU, and file descriptors give out long before any hard limit — the "65,535 connections" figure is a myth about port numbers, not connections per port). Millions of viewers means horizontal scaling, which surfaces the real problem.

## Deep dive 2: the second hop

Viewers of one stream scatter across servers. A comment hitting server A must reach viewers attached to B, C, D. Three shapes:

| Approach | How | The catch |
|---|---|---|
| Broadcast pub/sub | every realtime server subscribes to every comment channel | every server processes every comment for every stream — wasted compute that grows with total traffic, not yours |
| Partitioned pub/sub + co-location | hash(streamId) % N channels; an L7 load balancer routes viewers of the same stream to the same server | subscriptions churn as viewers come and go; routing and subscriptions must stay in sync |
| Dispatcher service | a router tracks which servers hold which streams and forwards each comment directly | a dynamic mapping to keep accurate during viral spikes; coordination cache invalidation |

Separate the realtime messaging servers from the write path — connection handling scales differently than persistence. One line on technology choice scores: Redis pub/sub handles dynamic subscriptions well and its fire-and-forget delivery is acceptable because comments are persisted anyway and catch-up covers gaps; Kafka's partition model fights user-driven subscribe/unsubscribe.

## Deep dive 3: mega-streams

When one stream runs thousands of comments per second, per-message delivery stops being the point — nobody can read at that rate; the audience is absorbing the crowd, not the comments. Two escalations. First, sample: an adaptive rate delivers each viewer a roughly constant trickle regardless of true velocity (weight followed users and high-reaction comments upward). Second, flip the delivery model: keep a ring buffer of the last ~100 comments server-side, snapshot it to the CDN every second, and have clients poll the snapshot and animate the new arrivals — a 1–2s delay nobody perceives, riding infrastructure built for exactly this. Optimistic local echo preserves read-your-own-write. Add hysteresis to the threshold so a stream hovering near the cutoff doesn't flap between modes.

## Deep dive 4: reconnections

Mobile networks drop; apps background. SSE ships Last-Event-ID: on reconnect the client sends the last event it saw and the server replays the gap. Production needs more than the header: bound the replay (five minutes, not an hour), let the client track its own position and fetch catch-up over HTTP, dedupe when the live stream and the catch-up response overlap, and disconnect proactively on backgrounding (mobile OSes throttle you anyway). Replay demands shared state — recent comments in a cache so any server can serve any reconnect.

Go deeper on the full live-comments walkthrough plus the WhatsApp and Google Docs variants at [Hello Interview's system design course](https://www.hellointerview.com/learn/courses/system-design).

## 🤖 Mock interview: run it

```text
You are my system design interviewer. This session is a REAL-TIME design:
the problem must hinge on pushing live updates to many clients.

SETUP
Offer one of: "Design live comments on a video platform", "Design a
live-score sports app", "Design a collaborative whiteboard (presence and
cursors only)", or "Design live bidding updates for an auction app" — or
take the problem I name if it's live-updates-shaped. Confirm, then run 45
minutes in real time with phase clocks (Requirements ~5, Entities ~2,
API ~5, High-Level ~10-15, Deep Dives ~10).

MANDATORY DEEP DIVES — pull me into at least two:
1. "Defend your choice among polling, long-polling, SSE, and WebSockets."
   (Push until I state the read/write pattern and latency number driving
   the pick — not vibes.)
2. "A comment is created on server A. Its viewers are on 40 servers. How
   does it reach them?" (Expect pub/sub or dispatcher, a co-location or
   routing story, and what happens when servers join or leave.)
3. "One stream goes mega-viral: 500k concurrent viewers. What breaks
   first and what do you change?" (Expect connection capacity limits,
   then sampling or CDN snapshots — and an honest word on latency.)
4. "A viewer loses signal for 30 seconds. What do they see on return?"
   (Expect Last-Event-ID or cursor catch-up, bounded replay, dedupe.)
Hold me to my own numbers: if I claim "real-time", make me state the
millisecond target and design to it.

RULES
Stay in character. If I reach for WebSockets without justification, stop
me: "Who writes, and how often?" If I solve client delivery but never
address source-to-server propagation, ask where the event originates.
Hints only on request, smallest nudge possible.

SCORING
After 45 minutes or "end interview": score 1-4 on Problem Navigation,
Solution Design, Technical Excellence, Communication — one quoted moment
each. Then report: did I pick the cheapest mechanism meeting the latency
bar, did I solve the second hop unprompted, and did I name a mega-scale
or reconnection consequence on my own. Assign me one drill to repeat.

Ask me to pick a problem to start.
```

## ✅ Interview-ready when

- [ ] You can justify SSE vs WebSockets from the read/write ratio in two sentences
- [ ] Your default is polling until a number says otherwise — and you can give that number
- [ ] You can solve the second hop two ways and name a failure mode of each
- [ ] You know ~100k connections per server is practical, and why the 65k figure is a myth
- [ ] You can design catch-up end to end: resume ID, bounded replay, dedupe

## 📚 Jargon

| Term | What it means |
|---|---|
| SSE | Server-Sent Events: a never-ending HTTP response the server writes chunks to; one-way push |
| Long polling | The server holds a request open until there's data, answers, and the client immediately asks again |
| Fan-out | Delivering one event to many recipients — assembled per read or pushed on write |
| Pub/sub | Publishers write to channels, subscribers receive; decouples event producers from connection holders |
| Connection co-location | Routing clients of the same stream to the same server so fan-out stays local |
| Second hop | Getting an event from where it's produced to the server(s) holding the client connections |
| Last-Event-ID | SSE reconnect header carrying the last event seen, so the gap can be replayed |
| Mega-stream | One stream so hot that per-message delivery stops being the goal |
| Cursor pagination | "N items before X" — stable under concurrent inserts, unlike offset pages |

## 🆘 When it goes wrong

- **You draw WebSockets for a read-dominated feed.** Ask who writes and how often. Rare writes: SSE plus plain POSTs is simpler and survives more middleboxes.
- **You solved client delivery and stopped.** The follow-up is always the second hop. Say where events originate, who knows which server holds which viewer, and how that mapping stays current.
- **Your pub/sub has every server subscribed to everything.** Works in a demo, dies at total-traffic scale. Partition channels and co-locate viewers, or invert into a dispatcher.
- **You promise sub-200ms to 500k concurrent viewers.** Walk it back as a product decision: at that velocity nobody reads individual comments — sample, or snapshot to the CDN and defend 1–2s.
- **A dropped connection means lost comments.** Resume needs three things said together: an ID to resume from, a replay bound, and dedupe against the live stream.

➡️ **Next:** [Challenge 8 — Contention](../08-contention/)
