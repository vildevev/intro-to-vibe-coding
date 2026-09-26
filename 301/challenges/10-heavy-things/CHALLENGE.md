# Challenge 10 — Heavy Things

**Mission:** Move big bytes and long jobs without dragging them through your API — blob storage with presigned URLs, multipart/resumable uploads, and the async job pattern of accept, queue, workers, status polling — by building a file-storage upload path and a code-judging submission pipeline.

**Time:** ~60 minutes

---

## 😱 War story: the 50GB POST

A file-storage design where upload flows client → API server → blob storage in a single POST. The interviewer does the math out loud: "50GB at 100Mbps is over an hour of transfer. The connection drops at 99% — now what? And did you know most API gateways cap request bodies at 10MB, so this request never even arrives?" The candidate also just turned every app server into a dumb pipe for terabytes of passthrough bytes. Both halves of this challenge — things too big to move and things too slow to finish — have one shape: take the heavy thing off the request path. Candidates who keep the bytes or the seconds inline fail on follow-ups they could have led themselves.

## 🧰 What you'll learn

- Blob storage vs databases, and presigned URLs that let your servers stop touching bytes
- Multipart uploads: chunking, resumability, trust-but-verify
- The async job pattern: queue, worker pool, job status — and its failure modes
- Isolation for user-submitted code, plus the math that justifies all of it

## Pattern 1: heavy bytes

Rule of thumb: anything over ~10MB that you don't run SQL queries against belongs in blob storage (S3/GCS/Azure), with only metadata in the database. Databases are optimized for structured queries, not gigabyte rows — backups, replication, and query plans all suffer.

**Presigned URLs — the server becomes a ticket booth.** Instead of receiving the file, your API validates the request and signs a URL granting upload to one specific key for a limited time (with constraints like size ranges baked into the signature). The client PUTs bytes directly to blob storage; your fleet never sees them. Signing is local computation — no network call to the store. Downloads mirror it: a presigned GET, usually a CDN-signed URL so global users fetch from an edge. The consequence you must name: metadata and bytes now succeed independently — write the metadata row as `uploading`, and flip it on the store's event notification when the object lands.

**Big files → multipart.** One POST dies on timeouts, gateway limits, and restart-from-zero. The fix: the client chunks the file (5–10MB pieces), gets a presigned URL per part, uploads parts — in parallel, with progress for free — and a completion call assembles them into one object. Resume means tracking which parts landed (the store's part-listing API or your metadata) and re-sending only the missing ones. Two disciplines: verify server-side (client PATCHes progress; you confirm ETags against the store before calling the upload complete — never trust the client's bookkeeping alone), and fingerprint the content (a hash) so "have I uploaded this before?" survives renames and enables dedupe. Assembled objects download normally, with HTTP Range requests for parallel or resumed fetch.

## Pattern 2: heavy time

When work takes more than a few seconds — transcoding, reports, running code — a synchronous request collides with gateway timeouts, wastes a web server, and gives the user a spinner and no feedback. Split the request in two:

```text
POST /jobs  → 202 { "jobId": "..." }          # milliseconds
GET  /jobs/:id  → pending | running | done { result }
```

Validate, persist a job record, enqueue, return the ID. Workers pull jobs, do the work on hardware suited to it (GPUs for video, CPU for code), and update status; the client polls the status endpoint — once per second is fine and needs no WebSocket — or gets notified on completion. Web servers stay fast, workers scale independently, and a crashed worker's job goes back to the queue. The cost: eventual consistency, status-tracking infrastructure, and four new failure modes you should volunteer:

| Failure | Fix |
|---|---|
| Worker dies mid-job | heartbeat / visibility timeout — the queue re-delivers when the worker stops checking in; set the interval just above your worst legitimate pause |
| Job fails forever | dead-letter queue after 3–5 attempts; a growing DLQ is a bug alert, not a landfill |
| Same job submitted twice | idempotency key on submission (user + action + time window); make the job's effects idempotent too |
| Queue grows unbounded | backpressure — reject with "busy" past a depth limit; autoscale on queue depth, not CPU |
| Short and long jobs mixed | separate queues (or chunk big jobs), or short requests wait behind a 5-hour one |

## Worked example: code judge

Submit code, get a verdict in ~5s — and the code is hostile. Execution options, in one line each: run it in your API server (never — one infinite loop takes down the fleet), a VM (safe, heavy, slow to start), a container (fast start, shared kernel — so harden it), or serverless (auto-scaling, but cold starts and execution limits). Container hardening as a single spoken sentence: read-only filesystem, CPU and memory caps, a hard timeout (which doubles as your SLA), no network, restricted system calls.

Scale math justifies the queue: 10k concurrent submissions against ~100 test cases each is CPU-bound work that no single machine absorbs — queue between API and containers (buffer plus free retries), autoscale containers on queue depth. Leaderboard: don't re-aggregate per poll — update a Redis sorted set per accepted submission and answer top-N reads from it; clients poll every few seconds. Note the judgment call out loud: push-based live updates would be overkill at this freshness bar, and saying so is the senior signal.

Go deeper on the full Dropbox and code-judge breakdowns — plus the video-pipeline variant — at [Hello Interview's system design course](https://www.hellointerview.com/learn/courses/system-design).

## 🤖 Mock interview: run it

```text
You are my system design interviewer. This session is a HEAVY-WORKLOAD
design: the problem must hinge on moving big files or running work that
outlasts an HTTP request — either is fine; pick whichever my first answer
suggests I'm weaker on.

SETUP
Offer one of: "Design a file storage service (upload/download/share)",
"Design YouTube video upload + processing", "Design a code-judging
platform", or "Design a bulk CSV export / report generation system" — or
take the problem I name if it's blob- or long-task-shaped. Confirm, then
run 45 minutes in real time with phase clocks (Requirements ~5, Entities
~2, API ~5, High-Level ~10-15, Deep Dives ~10).

MANDATORY DEEP DIVES — pull me into at least two:
1. "Your upload path sends the file through the API server. Redesign so
   the server stops touching the bytes." (Expect presigned URLs, signed
   CDN downloads, and how metadata stays consistent with the object.)
2. "50GB file, flaky connection. Design for resume, progress, and never
   restarting from zero." (Expect client-side chunking, per-part URLs,
   server-side verification, the completion call — and the math on why
   one POST dies.)
3. "The operation takes 4 minutes. Redesign the request/response."
   (Expect async: queue, worker pool, job ID, status polling — and a
   reason NOT to use WebSockets here.)
4. "A worker crashes mid-job. Then: a job fails 5 times in a row. Then:
   10x traffic arrives." (Expect heartbeat/visibility timeout, DLQ,
   idempotency, backpressure and autoscaling on queue depth.)
5. If user code is involved: "How do you isolate submissions from each
   other and from your infrastructure?" (Expect containers with caps:
   read-only FS, no network, CPU/memory limits, hard timeout.)
RULES
Stay in character. If bytes flow through my app servers, stop me: "What
is the server adding to this transfer?" If I queue a job but can't say
how the client learns it finished, make me close the loop. Hints only on
request, smallest nudge possible.

SCORING
After 45 minutes or "end interview": score 1-4 on Problem Navigation,
Solution Design, Technical Excellence, Communication — one quoted moment
each. Then report: did I keep heavy things off the request path (both
bytes and seconds), did I handle the two-sides-of-one-upload consistency
problem, and did I design the queue's failure paths unprompted. Assign me
one drill to repeat.

Ask me to pick a problem to start.
```

## ✅ Interview-ready when

- [ ] Your reflex on files over ~10MB is blob storage plus presigned URLs, stated with the ticket-booth framing
- [ ] You can do the upload-duration math out loud and use it to justify chunking
- [ ] You can design resumable uploads: per-part tracking, server-side verification, completion call
- [ ] You can sketch the async job pattern with its four failure fixes (heartbeat, DLQ, idempotency, backpressure) unprompted
- [ ] You can name the container-hardening checklist in one breath

## 📚 Jargon

| Term | What it means |
|---|---|
| Blob storage | Object storage (S3/GCS) built for large opaque files; the database keeps only metadata |
| Presigned URL | A signed, time-limited URL granting upload or download of one specific object, no server in the data path |
| Multipart upload | Chunked upload API: parts upload independently and a completion call assembles the object |
| ETag | A hash the store returns per uploaded part — the receipt server-side verification checks |
| Fingerprint | A content hash identifying a file regardless of name; powers dedupe and resume |
| CDN signed URL | A time-limited download URL the CDN edge validates itself |
| Job queue | Durable buffer between request acceptance and processing; jobs survive worker crashes |
| Worker pool | Processes that pull jobs, run them on right-sized hardware, and update status |
| Visibility timeout | How long a queue waits before assuming a worker died and re-delivering its job |
| DLQ | Dead-letter queue: where repeatedly failing jobs are parked for inspection |
| Backpressure | Rejecting or slowing new work when the queue is too deep, instead of accepting work you can't run |

## 🆘 When it goes wrong

- **Bytes flow through your app servers.** Uploads and downloads both double-hop and your fleet becomes a bandwidth bill. Presigned URLs move the data path to storage and CDN — say so before the interviewer asks.
- **You chunk on the server.** Chunking only helps if the client does it — server-side chunking still receives the whole file first. It's a client-side operation.
- **The client's progress report is your source of truth.** A malicious or buggy client marks parts uploaded that aren't. Trust but verify against the store's part listing before declaring completion.
- **You return 202 and stop designing.** How does the client learn the outcome? Status endpoint, polling cadence, what the statuses are — close the loop or the design is half a conversation.
- **You never say what happens when the worker dies.** The job must return to the queue on a timer, doomed jobs must stop burning the fleet, and double-submits must dedupe. Volunteer all three.

➡️ **Next:** [Challenge 11 — Proximity Services](../11-proximity-services/)
