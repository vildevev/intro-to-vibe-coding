# Challenge 7 — Real-Time Updates

**Mission:** Add live push to any design — polling, long-polling, SSE, WebSockets, and the second hop that routes each event from its source to every connected client — the only way it sticks: by breaking live comments on a video stream at each hop and letting the break force the next move. Start from the cheapest mechanism that meets the latency bar; every escalation happens because a named break demands it, and every escalation names its cost.

**Time:** ~60 minutes

---

## 😱 War story: the WebSocket reflex

"Design live comments for a streaming platform." The candidate hears "real-time," draws a WebSocket between every client and the comment service, and stops. The design dies on two follow-ups. First: "most viewers never type a comment — why pay for a two-way channel to deliver a one-way message?" Second: "your comment lands on server 3, its viewers sit on servers 1 through 40 — now what?" Real-time designs lose points less on protocol trivia than on that second question: fan-out, routing each event to whichever servers hold the connections. This challenge builds both hops deliberately, starting from the cheapest mechanism that meets the latency bar.

## 🧰 What you'll learn

- Why polling has a ceiling: latency equals the interval and the cost lands on empty answers — the delivery ladder exists because each rung hits that ceiling with a name
- Why the WebSocket reflex loses points: the read/write ratio picks the protocol, not the word "real-time"
- Why client delivery is only half the design: the second hop — source to the servers holding the connections — is where real-time designs actually die
- What happens when one stream goes mega-viral, and how a dropped connection loses comments: sampling, snapshots, and catch-up

## The system that works (until it doesn't)

Requirements: viewers post comments on live streams; new comments appear within ~200ms (humans read ~200ms as "instant" — that's the non-functional number); comments from before you joined can be scrolled (infinite scroll). Scale: millions of concurrent streams, thousands of comments/second on hot ones. Availability over consistency — a comment arriving a beat late is fine.

Entities: User, Stream, Comment. API:

```text
POST /comments/:streamId   { "message": "..." }        # userId from the auth header
GET  /comments/:streamId?cursor={lastId}&limit=20      # history + infinite scroll
```

The history requirement quietly decides your pagination. Offset pages (`?offset=40`) break on a fast feed: rows shift as comments arrive, so you re-read or skip them, and the database counts through the offset every request. Cursor pages ("20 comments before ID X") are stable under inserts and hit an index. State that contrast in one breath and move on — the breaks are all in the push path.

Day one: clients poll the GET every few seconds; the comment service validates, persists to a key-value store, done. It works — on streams nobody watches.

## Break 1 — the chat is a minute behind the video

The moment: launch week, and the support channel fills with the same ticket — comments appear 30+ seconds after the words are spoken on stream. The graph: every viewer polls `GET /comments` every 5 seconds. One million concurrent viewers polling at 5s is 200k QPS, and almost every response says "nothing new."

**The obvious fix, and why it fails:** poll faster. Meeting 200ms means asking "anything new?" five times a second per viewer — 5M QPS, 99%+ of them empty answers, all fanned onto the same comment store that a trickle of writes would have touched. And the best case is still latency equal to the interval: polling doesn't scale toward real-time; its cost grows exactly as its staleness shrinks.

**The fix: push — and the ladder that picks the mechanism.**

| Mechanism | How it works | The catch | Reach for it when |
|---|---|---|---|
| Polling | client asks every N seconds | latency ≈ the interval; 1M clients at 5s = 200k QPS answering "nothing new" | latency bar is seconds, not ms — most products |
| Long polling | server holds the request open until data, then answers; client re-requests | a reconnect gap between events; every LB in the path needs a matching timeout | near-real-time on plain HTTP, infrequent updates |
| SSE | one HTTP response that never ends; server writes chunks | one-way only; some proxies buffer streams; long-lived requests are awkward to monitor | read-heavy live feeds — the review default |
| WebSockets | HTTP upgrades to a full-duplex TCP connection | stateful connections; every hop must support it; deploys sever them; reconnection is yours | write frequency ≈ read frequency (chat, games) |

Ground rules worth saying out loud. Humans read ~200ms as "instant" — that's the number your non-functional requirement should carry. Start at polling unless a number says otherwise; proposing it first is a senior move, not a dodge. Escalate only when the traffic shape demands it: SSE for read-dominated feeds (send writes over ordinary POST), WebSockets only when clients write as often as they read. WebRTC — peer-to-peer, signaling servers, NAT traversal — is for audio/video, name it and move on.

For this traffic shape the choice writes itself: every viewer reads, a tiny fraction write, so per-viewer two-way sockets buy nothing. SSE delivers push over plain HTTP; comment creation stays a boring POST. Capacity math: a tuned server holds on the order of 100k concurrent connections (memory, CPU, and file descriptors give out long before any hard limit — the "65,535 connections" figure is a myth about port numbers, not connections per port). Millions of viewers means horizontal scaling — which surfaces the next break.

**The cost:** you traded empty requests for open ones. Long-lived connections are stateful: deploys sever them, some proxies buffer streams, and they're awkward to monitor. And push only reaches clients already attached to the right server — where the comment originates is still unsolved.

## Break 2 — one comment, forty servers

The moment: a viewer posts; viewers attached to the same server see it instantly, everyone else sees it on refresh — or never. Trace it: the POST landed on server A; this stream's SSE connections sit spread across servers 1–40; server A doesn't know any of them exist. Client delivery was hop one. Hop two — source to the connection holders — has no path yet.

**The obvious fix, and why it fails:** broadcast pub/sub — every realtime server subscribes to every comment channel. Works in the demo, dies at total-traffic scale: every server processes every comment for every stream, so wasted compute grows with the whole platform's traffic, not the traffic you're serving.

**The fix: partition, co-locate, or dispatch.**

| Approach | How | The catch |
|---|---|---|
| Broadcast pub/sub | every realtime server subscribes to every comment channel | every server processes every comment for every stream — wasted compute that grows with total traffic, not yours |
| Partitioned pub/sub + co-location | hash(streamId) % N channels; an L7 load balancer routes viewers of the same stream to the same server | subscriptions churn as viewers come and go; routing and subscriptions must stay in sync |
| Dispatcher service | a router tracks which servers hold which streams and forwards each comment directly | a dynamic mapping to keep accurate during viral spikes; coordination cache invalidation |

Separate the realtime messaging servers from the write path — connection handling scales differently than persistence. One line on technology choice scores: Redis pub/sub handles dynamic subscriptions well and its fire-and-forget delivery is acceptable because comments are persisted anyway and catch-up covers gaps; Kafka's partition model fights user-driven subscribe/unsubscribe.

**The cost:** subscription and routing state must track reality as viewers come and go — a stale mapping silently drops events. And when one stream concentrates all of it, even this shape buckles.

## Break 3 — 500k viewers on one stream

The moment: a mega-viral stream. 500k concurrent viewers, thousands of comments per second. Per-message fan-out now means each comment is delivered up to 500k times: message volume × connection count — a load that melts every server you add, for a product nobody could use even if it survived, because nobody reads at thousands of comments per second. The audience is absorbing the crowd, not the comments.

**The obvious fix, and why it fails:** more realtime servers behind the same delivery model. The bottleneck isn't server count; it's the promise itself. Scaling the plumbing to a rate no human reads at is spend without a product.

**The fix: stop promising per-message delivery.** Two escalations. First, sample: an adaptive rate delivers each viewer a roughly constant trickle regardless of true velocity (weight followed users and high-reaction comments upward). Second, flip the delivery model: keep a ring buffer of the last ~100 comments server-side, snapshot it to the CDN every second, and have clients poll the snapshot and animate the new arrivals — a 1–2s delay nobody perceives, riding infrastructure built for exactly this. Optimistic local echo preserves read-your-own-write. Add hysteresis to the threshold so a stream hovering near the cutoff doesn't flap between modes.

**The cost:** real-time stops being a guarantee and becomes a product decision — sampled content, 1–2s latency. Say it as a decision, with the number, not as an apology.

## Break 4 — the subway: thirty seconds of silence

The moment: a viewer loses signal in a tunnel. The SSE connection drops with everything they missed, and on resurfacing they see either a dead feed — nothing since they left — or, with naive replay, an hour of backlog and duplicates stacked on the live stream.

**The obvious fix, and why it fails:** "the client reconnects, so nothing is lost." Reconnection restores the pipe, not the content — anything pushed while disconnected is gone. And replaying unboundedly floods both the client and the server that must hold the history.

**The fix: resume with an ID, a bound, and dedupe.** SSE ships Last-Event-ID: on reconnect the client sends the last event it saw and the server replays the gap. Production needs more than the header: bound the replay (five minutes, not an hour), let the client track its own position and fetch catch-up over HTTP, dedupe when the live stream and the catch-up response overlap, and disconnect proactively on backgrounding (mobile OSes throttle you anyway).

**The cost:** replay demands shared state — recent comments in a cache so any server can serve any reconnect — and the replay bound is a product choice about how much history "live" includes.

## 🤖 Design-review drill: run it

```text
You are a senior engineer leading my design review. This session is a REAL-TIME design:
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
Stay in character. If I add a component without naming the break it
fixes, stop me: "What breaks without it?" If I reach for WebSockets
without justification, stop me: "Who writes, and how often?" If I solve
client delivery but never address source-to-server propagation, ask
where the event originates. Hints only on request, smallest nudge
possible.

SCORING
After 45 minutes or "end review": score 1-4 on Problem Navigation,
Solution Design, Technical Excellence, Communication — one quoted moment
each. Then report: did I pick the cheapest mechanism meeting the latency
bar, did I solve the second hop unprompted, and did I name a mega-scale
or reconnection consequence on my own. Assign me one drill to repeat.

Ask me to pick a problem to start.
```

## ✅ You own it when

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
