# Challenge 7 — Capstone: Build & Ship Something Real

**Mission:** Use everything. Build something a real human needs, ship it, and
send the link to someone who matters. This one's yours.

**Time:** 2–4 hours (spread over a day or a week — save points make it resumable)

---

## 😱 The story

Everything before this was the dojo. This is the first walk outside.

One warning: the capstone feels different because *nobody hands you the
next step*. That's not a bug — that's the whole skill. From here on, the
course's voice in your head is the checklist at the bottom of this file.
Run it in order, every time, for anything that matters.

## 📋 The menu

Pick something a **specific person** needs — it's more motivating than
"practice project." Good first ships:

- **The personal one-pager** — you, your work, your links. Send it to someone hiring.
- **The small-business page** — a friend's shop, a menu, opening hours, a map link.
- **The event invite** — a birthday, a community dinner, a garage sale: what,
  when, where, RSVP instructions.
- **The useful tool** — a tip calculator, a packing-list generator, a
  "what's-for-dinner decider" button, a countdown to something you dread.

Pick now. Small and real beats big and imaginary: a live tip calculator
outranks an unfinished social network, every time.

---

## The build — phase by phase

### Phase 1 — Intent (10 min, on paper)

Answer in writing before touching the AI:

- Who is this for? (A person, by name if possible)
- What should a visitor **do** on this site? (One primary action: call, buy,
  RSVP, laugh, calculate…)
- What's the vibe? (Three adjectives. "Clean and warm", not "nice")
- What's explicitly **not** included? (No accounts. No payments. Whatever
  you're cutting — write it down, or the scope creep writes it for you.)

### Phase 2 — House rules (10 min)

New folder, new `AGENTS.md`. Steal from Challenge 3, plus your scar tissue:

```
# House rules
- I'm a beginner: explain every change in plain English before doing it
- One small change at a time; ask before anything bigger
- Ask before deleting or renaming files
- Secrets never go in code; use .env
- Before I push, remind me to review the diff
```

### Phase 3 — The brief (15 min)

One good prompt — role, goal, constraints, examples — and let it interview
you. Build v1 as **small bites** (Challenge 3). Nothing else. Resist the
"also add…" avalanche; that's what IDEAS.md is for:

```
Keep a running file called IDEAS.md. Anything I mention that's not
for v1, add it there instead of building it.
```

### Phase 4 — The rhythm (the actual building, 1–2 hrs)

Loop, slowly and deliberately:

**ask (small) → review diff → test in browser → commit → (push)**

- Save point after *every approved change* — this is the muscle, use it.
- Errors: reproduce, paste the exact text, expected-vs-actual (Challenge 4).
- Stuck 20+ minutes on one thing: restore last good commit, re-ask smaller.
  Retries are free; sunk-cost marathons are how weekends die.
- Checkpoint feeling: "could I hand this URL to my person *right now* and not
  apologize?" That's v1. Stop adding. (The rest of the menu is IDEAS.md's job.)

### Phase 5 — The pre-flight check (15 min)

Before shipping, run the full inspection — out loud, like a pilot:

- [ ] `git status` clean; `git log` shows sensible save-point messages
- [ ] Secrets audit: no keys/passwords in code; `.env` in `.gitignore`;
      `git status` doesn't list it
- [ ] No real personal data that shouldn't be public (yours or anyone else's)
- [ ] The 3 review questions on every change since the last good point
- [ ] Opened on a phone. Screens look sane, nothing overflows weirdly
- [ ] Ask your AI for a final pass: *"Review my project like a skeptical
      senior developer: what would embarrass me publicly? Plain English."*

### Phase 6 — Ship it (15 min)

GitHub Pages (Challenge 6). Watch the green check. Open on your phone.

### Phase 7 — The human test (5 min, non-negotiable)

Send the link to the person it's for — or the person who'll be honest.
Watch them use it *without helping*. Every place they hesitate is a real bug
report. Fix the top one, re-run the ship loop, send again.

You have now done the full job. Not "played with AI" — **shipped software,
end to end, responsibly.** That's rarer than you think.

---

## 🏁 Graduation: The Vibe Coder's Checklist

Print this. Run it top-to-bottom on every real project, forever:

1. **One folder per project** — know where you are.
2. **`git init` before anything else.** Save points from minute one.
3. **Save before you renovate.** Commit before every big AI change.
4. **Secrets live in `.env`,** `.env` is in `.gitignore`, and no secret is
   ever pasted into a chat, email, or screenshot.
5. **Leaked? Revoke first, panic second.**
6. **Brief, don't wish:** role, goal, constraints, example — or ask the AI
   to interview you first.
7. **Small bites.** If a request has two things you'd judge separately,
   it's two requests.
8. **Read the receipt:** diff → "did it touch only what I asked?" → does the
   old stuff still work?
9. **Errors are evidence:** reproduce, paste exact text, expected vs. actual.
   Stuck 20 minutes? Restore and re-ask smaller.
10. **Ship the small real thing** — live URL, a human on it — then iterate.
    Perfect lives in IDEAS.md.

## ✅ You passed when…

- [ ] Something you described exists on the public internet at a URL
- [ ] You ran the pre-flight check honestly, before shipping
- [ ] At least one human visited it, and you watched
- [ ] You fixed one thing they found confusing and re-shipped
- [ ] Your repo's `git log` reads like a story of the build
- [ ] The checklist feels like *your* checklist, not the course's

## 🎓 Where to go next

- **Level up secrets:** password managers for humans, "secret managers" for
  apps, two-factor authentication everywhere.
- **Level up shipping:** custom domains; a dynamic host when an idea needs a
  memory; asking your AI to explain "databases" when you're ready.
- **Level up collaboration:** GitHub lets people copy (fork) and improve each
  other's work — you know enough to contribute to a project now.
- **The real secret:** you just learned the *operating system* of building
  software — the tools, the safety habits, the review instincts. Tools will
  change yearly. The loop won't: **brief, small bites, save points, verify,
  ship.**

## 📬 Tell me

You shipped something real — I genuinely want to see it. Post your link and
your hardest-bug story in [the graduation thread](https://github.com/vildevev/intro-to-vibe-coding/discussions/1),
or email me privately at [vildevev.business@gmail.com](mailto:vildevev.business@gmail.com).
Stuck somewhere instead? [Discussions](https://github.com/vildevev/intro-to-vibe-coding/discussions)
is where other beginners hang out. I read everything.

## 🆘 When it goes wrong

- **Mid-project dread: "this is worse than when I started."** Restore your
  best save point and re-brief. The list of commits is your undo history —
  dread is a signal to travel, not to quit.
- **The AI keeps missing the point of the project.** Your Phase-1 intent
  isn't in its context. Paste your written answers into the prompt: "keep
  this in mind for every change: …" (or add it to `AGENTS.md`).
- **Scope creep (yours).** IDEAS.md. Breathe. V1 ships, then v1.1.
- **It's almost good but you can't articulate what's wrong.** Try:
  *"Ask me 5 diagnostic questions about what feels off with this page."*
  Multiple choice is easier than essays.
- **Time's up, it's not done.** Ship the smaller version that IS done.
  A live half-thing beats a perfect imaginary whole thing. Always.
