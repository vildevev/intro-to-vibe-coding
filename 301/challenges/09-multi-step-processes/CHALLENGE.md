# Challenge 9 — Multi-Step Processes

**Mission:** Make a sequence of steps spanning services, waits, and flaky networks survive crashes and retries — sagas with compensations, durable execution, exactly-once effects, outbox/CDC, and dead-letter queues — by building a payment system that never loses or double-charges a cent.

**Time:** ~60 minutes

---

## 😱 War story: charged, then gone

An order flow written as one function: charge the card, reserve inventory, create the shipping label, email the confirmation. It passes every demo. Then a deploy lands mid-request: a customer is charged, the process dies before reserving inventory, and on restart nothing remembers the charge happened. Support issues a refund, engineering ships a "stuck orders" dashboard, and the oncall rotation starts reconciling rows by hand at 2am. Multi-step failure is not an edge case — it's the everyday case for any workflow touching more than one system, and interviewers probe it because it separates candidates who have operated such systems from candidates who have only drawn them.

## 🧰 What you'll learn

- Why multi-step processes break: crashes mid-flow, callbacks landing anywhere, the dual-write problem
- Sagas: compensations, choreography vs orchestration, and why two-phase commit loses across service boundaries
- Durable execution: deterministic workflows, idempotent activities, recovery by replay
- The payment system: idempotency keys, timeouts that aren't failures, webhooks, DLQs

## Why multi-step is hard

Two failure classes break the innocent version. First, a crash mid-sequence: the server dies between steps, in-memory progress evaporates, and nobody can say whether to retry, continue, or unwind. Second, callback routing: external systems answer minutes later via webhook, which lands on whichever stateless server happens to be free — a host that knows nothing about this in-flight order. Patching each ad hoc (checkpoint rows after every step, hand-rolled claim logic, pollers) interleaves infrastructure concerns into business logic and still misses the big one: compensation — undoing steps that already committed when a later step fails.

## The saga

A saga is a sequence of local steps, each with a matching compensating action. Run forward; on failure, walk backward firing compensations — shipping failed after the charge? Release inventory, refund. The guarantee is not "all or nothing," it's "whatever happened can be undone," with a visible window of inconsistency (the order sits in `pending` while charged-but-not-shipped). That window is the price, and it's cheap, because the alternative doesn't exist across services you don't control.

**Why not two-phase commit?** 2PC holds every participant locked while the slowest one decides, a stalled coordinator stalls everyone, and — fatal for real flows — the payment network will not run prepare/commit on your command. Interview shorthand: 2PC when atomicity stays inside systems you control; the saga the moment external systems or long waits appear.

**The dual-write problem and the outbox.** "Write to the database, then publish an event" is two writes that can fail independently — and usually the event is the one that gets lost. Fix: write the event to an outbox table in the same transaction and publish from there, or skip the app entirely and let change data capture stream every committed change out of the database's own log. Either way, if the state change committed, the event exists.

**Coordination:** choreography (no coordinator — workers react to events on a log and emit the next ones; the flow is implicit, great for loosely-coupled teams, hard to see or change past mid-complexity) vs orchestration (one coordinator owns the sequence and calls the steps — central visibility, and the coordinator must be crash-safe, which is the hard part).

## Durable execution

Workflow engines (Temporal, AWS Step Functions) sell you a crash-safe orchestrator instead of a hand-built one. The model is two rules: workflow code must be *deterministic*; activities — the steps that touch the world — must be *idempotent*. Recovery is replay: every activity result is recorded to a history, and a crashed workflow re-executes from the top with recorded results handed back instead of re-firing side effects. Determinism makes replay land exactly where the crash interrupted. Long waits (a human approving, a webhook) use signals: the persisted workflow holds no thread while waiting days. Versioning matters too — in-flight executions pinned to old code run old logic, or changes gate behind a deterministic patch check.

## Worked example: the payment system

Entities: Merchant; PaymentIntent — the intention plus its state machine (`created → processing → succeeded/failed`); Transaction — one money-movement attempt, many per intent (retries, refunds). API: create intent, submit a charge, poll status — plus webhooks pushing status changes to merchant servers.

The deep dives that decide the interview:

1. **Idempotency keys.** Networks retry, users double-click, webhooks re-deliver. The client sends a key per logical operation; the server stores it and returns the original result on repeats. The check-then-act still has a crack — record `IN_PROGRESS` before the side effect and `COMPLETED` after, and route the ambiguous middle to reconciliation rather than blind retry.
2. **Timeouts don't mean failure.** A timed-out charge may still succeed at the bank. Mark it `pending_verification`, persist every attempt with the network's reference ID, and reconcile later against the network's API or its daily settlement files. Treating timeout as failure double-charges; treating it as success ships goods nobody paid for.
3. **Durability as an event stream.** Mutable rows overwrite history; application-written audit records get forgotten by whichever code path has the bug. CDC from the operational database into an append-only log gives an immutable, complete history — audit, reconciliation, and webhook delivery all become consumers of the same stream.
4. **Webhooks are server-to-server push** — not SSE or WebSockets, which serve clients. Delivery means exponential-backoff retries, signed payloads the merchant verifies, and a dead-letter queue: after a handful of failed attempts, park the event for inspection instead of retrying forever. A growing DLQ is an alert, not a landfill.
5. **Exactly-once, precisely stated.** Delivery across a network is at-least-once, full stop. Exactly-once *effects* come from at-least-once attempts plus idempotent handling. Saying it that exactly is itself a senior signal.

Go deeper on the full payment-system walkthrough — and webhook delivery as its own design problem — at [Hello Interview's system design course](https://www.hellointerview.com/learn/courses/system-design).

## 🤖 Mock interview: run it

```text
You are my system design interviewer. This session is a WORKFLOW /
MULTI-STEP design: the problem must hinge on coordinating several flaky
steps where partial failure matters — payments, fulfillment, or anything
where "if step X fails, undo step Y" is the core challenge.

SETUP
Offer one of: "Design a payment system (Stripe-like)", "Design order
fulfillment for an e-commerce platform", "Design a money-transfer system",
or "Design a document-signing flow with human approval steps" — or take
the problem I name if it's workflow-shaped. Confirm, then run 45 minutes
in real time with phase clocks (Requirements ~5, Entities ~2, API ~5,
High-Level ~10-15, Deep Dives ~10).

MANDATORY DEEP DIVES — pull me into at least two:
1. "Your server crashes after step 2 of 4. On restart, what does it know,
   and what happens next?" (Push for durable progress and either resume-
   forward or compensate-backward — not a shrug.)
2. "The external network call times out. Did the payment happen or not?"
   (Expect: timeout is not failure, a pending state, a recorded attempt
   with a reference ID, later reconciliation.)
3. "Walk me through your retry story end to end. What prevents a customer
   being charged twice?" (Expect idempotency keys, at-least-once attempts
   plus idempotent effects, and DLQs for jobs that keep failing.)
4. "How do you undo a completed charge when a later step fails?" (Expect
   compensations treated as seriously as forward steps: retries,
   idempotency, human escape hatch.)
5. If I hand-roll state machines: "What would a workflow engine do for
   you, and when would you NOT use one?" (Expect deterministic workflows,
   idempotent activities, replay — and when a simple queue is enough.)
RULES
Stay in character. If I say "exactly-once delivery", make me restate it
precisely. If my flow has three or more steps and no failure story, ask
"what happens if this step crashes?" Hints only on request, smallest
nudge possible.

SCORING
After 45 minutes or "end interview": score 1-4 on Problem Navigation,
Solution Design, Technical Excellence, Communication — one quoted moment
each. Then report: did I give a failure story for every step unprompted,
did I handle ambiguous outcomes (timeouts) explicitly, and did I know
when NOT to reach for a workflow engine. Assign me one drill to repeat.

Ask me to pick a problem to start.
```

## ✅ Interview-ready when

- [ ] You can name the two multi-step failure classes unprompted: crash mid-flow and callback routing
- [ ] You can explain why 2PC loses across service boundaries in under a minute
- [ ] You can trace a crash-and-replay: recorded steps skipped, side effects not re-fired
- [ ] Your timeouts produce a pending state plus reconciliation, never an assumed failure
- [ ] You say "at-least-once attempts, exactly-once effects" without being corrected

## 📚 Jargon

| Term | What it means |
|---|---|
| Saga | A sequence of local steps, each with a compensating action that undoes it on later failure |
| Compensation | The reverse of a committed step — refund the charge, release the inventory |
| Choreography | Coordination by events: each worker reacts and emits the next event; no coordinator exists |
| Orchestration | One coordinator owns the sequence and invokes each step |
| Durable execution | Workflows that persist state and resume after crashes via replay of recorded results |
| Idempotency key | A client-supplied identifier making repeated requests return the original result |
| Outbox pattern | Writing the event to publish inside the same transaction as the state change, so neither exists without the other |
| CDC | Change data capture: streaming every committed database change from its log to consumers |
| Webhook | A server-to-server HTTP callback delivering status changes, with retries |
| DLQ | Dead-letter queue: where jobs/events go after repeated failure, for inspection instead of infinite retry |
| Exactly-once effect | The guarantee that matters: duplicate attempts are harmless because handling is idempotent |

## 🆘 When it goes wrong

- **Your workflow lives in memory.** The first crash erases it. Progress must be persisted — by hand or by an engine — or there is nothing to resume.
- **You treat a timeout as a failure and mark it failed.** The charge may still land; the user retries; double charge. Uncertainty is a state: pending, recorded, reconciled later.
- **You publish events after committing.** Two independent writes means one gets lost eventually. Outbox or CDC — if it committed, the event exists.
- **Your compensations are afterthoughts.** A refund can fail exactly like a charge. Give them retries, idempotency, and a human path for the ones that still won't go through.
- **You bolt a workflow engine onto a two-step flow.** Engines cost operations overhead and a learning curve. A queue and one worker is the right answer for single-step async work — knowing when NOT to is the seniority signal.

➡️ **Next:** [Challenge 10 — Heavy Things](../10-heavy-things/)
