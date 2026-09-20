# Challenge 5 — Trust, But Verify

**Mission:** Learn to *see* what the AI changed before you accept it — the
10-second habit that turns "why is everything broken?" into "ah, I see what
you did there." Then automate it with tests: a robot that re-checks your old
features so you don't have to.

**Time:** ~60 minutes

---

## 😱 The story

Priya asked her AI for one button. It helpfully rewrote 6 files, "modernized"
her design, and renamed her main page. She said "yes" to the changes without
looking — why would she? She can't read code. Two hours later her site was a
stranger.

The trap for non-coders is thinking review isn't for you: *"I can't read code,
so why look?"* Because **you don't review code — you review *behavior*.** What
changed? Where? Did it touch what you asked for, or extra things? Does the
result still do what it did before? That's a director watching dailies, not a
cinematographer.

And the tool for watching is wonderfully visual: the **diff** — a before/after
photo of your files, deletions in red, additions in green.

## 🧰 What you'll learn

- What a **diff** is and how to read one (yes, you — it's made for humans)
- Reviewing at three levels: *what changed*, *is it what I asked*, *does it still work*
- **Tests** — how to have the AI build a smoke alarm that re-checks your old
  features automatically, so "does it still work" stops relying on memory
- How to reject changes gracefully (and why rejecting is a *feature*)
- Why small requests make review trivial (and big ones make it impossible)

## 📋 Before you start

- [ ] Challenges 1–4 done (save points + a page + the debugging loop)
- [ ] A save point made — you're about to generate changes on purpose

---

## Part A — Read your first diff (10 min)

1. Ask your AI for one small, visible change:

   ```
   Add a footer to my page: "© 2026 — made with vibes". Change nothing else.
   ```

2. Now *watch the receipt*. Type it yourself:

   ```
   git diff
   ```

   You'll see something like:

   ```diff
   + <footer>© 2026 — made with vibes</footer>
   ```

   Green `+` lines = added. Red `−` lines = removed. That's the whole skill of
   reading a diff. You just reviewed a change like an engineer.
3. Before you accept *anything* in your AI tool, you can also just ask:

   ```
   Show me the diff of what you're about to do, and explain each change
   in one plain-English sentence.
   ```

   Make this your default. The AI should always show its receipt *before*
   charging the card.

## Part B — The three review questions (15 min)

For every change, ask — in order:

1. **What changed?** (the diff: which files, added vs. removed)
2. **Is it what I asked for — and nothing else?** This is the big one. A
   request for "one button" that also "improves" your CSS and renames files is
   scope creep from an intern who got excited. Extra changes = unreviewed risk.
3. **Does everything still work?** Not just the new thing — the old things.
   Click the buttons. Does the page still load? (Pros call this "not breaking
   the other stuff." The AI rarely checks on its own; it moves fast.)

Practice the play on each of these, reviewing the diff *before* looking at
the page:

```
Add a dark mode toggle button to my page.
```

```
Change all my headings to a different font.
```

```
Add a "guestbook" section where visitors could leave a name and message.
```

For each: read the diff → ask "did it touch anything besides the ask?" →
check the page → check an *old* feature too.

## Part C — Reject like a boss (10 min)

Rejection is a tool, not a failure. It's the moment you're the director.

1. Ask for something you'll deliberately refuse:

   ```
   Redesign my whole page in a minimalist style.
   ```

2. Review the diff. Now, choose your response from the pro menu:

   - **Full reject** — *"Undo all of that, back to the last commit. We're not
     doing the redesign."*
   - **Partial accept** — *"Keep the spacing changes, undo everything else."*
   - **Defer** — *"Save this as an idea for later — note it in a file called
     IDEAS.md and undo it for now."*

3. Verify the rejection actually happened: `git status` (or `git diff`) should
   show a clean project; the page should look like before. Then commit the
   state you're happy with.

> 💡 The diff + the time machine make rejection *free*. This combo is why
> vibe coders get to be picky.

## Part D — Why small requests are a review strategy (10 min)

Think about what you just did. For a one-line footer, review took ~15 seconds
and you caught everything. Now imagine reviewing "redesign everything" —
hundreds of changed lines, no chance.

**Small requests aren't a style preference — they're the only way review
stays possible.** The math:

| Request size | Diff size | Can you actually review it? |
|---|---|---|
| One button | ~5 lines | Yes, in seconds |
| One feature | ~30–100 lines | Yes, with the 3 questions |
| "Make it better" | ~everything | No. This is how sites become strangers |

Make a save point after every reviewed-and-approved change. Then your
rejection menu always works, and one bad change never compounds into another.

---

## Part E — The smoke alarm: let a robot re-check old features (15 min)

Review question 3 — *"does everything still work?"* — has a hidden weakness:
it relies on your memory and your patience. Humans check the shiny new thing
and forget the six old things. Software has a boring miracle for exactly this:
**tests** — tiny automated checks that re-verify old features in seconds,
every time you ask.

And here's the part that matters for you: **you will never write one.** Your
job is the director's job — say what "working" means in plain words. The AI
translates each sentence into a check. That translation is a task computers
are good at; deciding what *should* be true is the task only you can do.

1. **Build the alarm while everything is calm.** Before any new change, ask:

   ```
   Before making any changes: write a few simple automated checks (tests)
   for this project — the things that must ALWAYS work: the page loads,
   my name is in the heading, the Now section shows 3 cards, the footer
   line appears. Pick the simplest test setup that runs in my environment,
   zero new dependencies if possible. Explain each check in plain English.
   Then run them and show me everything passing.
   ```

2. **Look at the green.** Every check passing is a snapshot of "working" —
   your baseline. From now on, green means nothing broke; red means question 3
   got answered for you, precisely, in plain words.

3. **Watch it catch a crime.** The regression drill — ask your AI:

   ```
   This is a drill: quietly break ONE old feature (not the new stuff),
   do not tell me which, and do not fix anything. Then run the tests.
   ```

   Red. And not just red — *named*: which check failed, describing which old
   behavior broke. That's a regression caught without you clicking through
   anything. Now have it fix the break and watch the green come back.

4. **The habit, from now on:** after every accepted change, three words —

   ```
   Run the tests.
   ```

   Green? Commit (Golden Rule #1). Red? You just got the *evidence* half of
   the debugging loop (Challenge 4) handed to you. **No green, no commit.**

Two honest limits, so the alarm stays trustworthy:

- Tests only check what you thought to ask. Your list of checks is only as
  good as your plain-English spec — add a check whenever you notice a "must
  always work" you forgot ("also check the contact section still exists").
- Tests are a smoke alarm, not a guarantee. Green doesn't mean perfect; it
  means *nothing you cared about broke*. That's exactly the promise of this
  challenge — trust, but verify, cheaply.

---

## 🤖 Prompts worth stealing

- *"Show me the diff and explain each change in one sentence before applying."*
- *"Did you change anything beyond what I asked for? Show me if so."*
- *"What could this change break? Which existing features should I re-test?"*
- *"Before changing anything, write simple tests for the features that must
  always work — simplest setup that runs here, no new dependencies if
  possible."*
- *"Run the tests and tell me plainly: all green, or what went red and why."*
- *"A test went red after your change. Explain which behavior broke in plain
  English, then fix it in the smallest possible way."*
- *"Undo that completely — restore to the last commit."*
- *"Change exactly one thing: X. Touch nothing else, and confirm that when
  you're done."*

## ✅ You passed when…

- [ ] You read a diff with your own eyes and could say what was added/removed
- [ ] You caught (on purpose or by luck) the AI doing more than you asked — and named it
- [ ] You rejected a change fully or partially, and verified the rejection
- [ ] Your project has a small test suite, and you've seen it all green
- [ ] You watched a test catch a deliberately broken old feature — and trusted it
- [ ] "Run the tests" is now part of your loop after every accepted change
- [ ] You can recite the 3 review questions without looking
- [ ] You know why "make it better" is an unreviewable request

## 📚 Jargon translator

| Term | Plain English |
|------|---------------|
| Diff | Before/after photo of your files: red = removed, green = added |
| Scope creep | The AI doing extra things you didn't ask for |
| Review | Reading the receipt before paying: what changed, is it right, what breaks? |
| Reject / revert | Undo a change — free and shameless when you have save points |
| Test (unit test) | A tiny automated check that one piece of behavior still works. You specify it in plain words; the AI writes it |
| Test suite | The whole set of checks, run together in seconds |
| Green / red | All checks passing / at least one failing. No green, no commit |
| Refactor | Rewriting how code works without changing what it does. Occasionally needed; rarely urgent; always worth asking "why now?" |

## 🆘 When it goes wrong

- **The diff is enormous and unreadable.** That's the signal, not a problem to
  push through: reject it, and re-ask in smaller bites (Challenge 3).
- **The AI says "trust me, this is better."** No intern gets "trust me" past
  the director. Same three questions.
- **You approved, and now something else broke.** Find your last good save
  point (`git log --oneline`), restore, re-do the change smaller. This is the
  system working, not failing.
- **You can't tell what a changed line *means*.** You don't need to. Ask:
  *"In plain English, what does this line make the page do?"* Behavior, not
  syntax — that's the level you review at.
- **A test went red and the output looks like soup.** Paste it into the
  Challenge 4 evidence template — expected vs. actual, exact text, how to
  reproduce. Red tests are the best evidence you'll ever have.
- **The AI wants to install 40 packages to run tests.** Say: *"Use the
  simplest possible setup that runs in my environment — zero new dependencies
  if possible."* If the tests cost more than they protect, they're wrong.
- **All the tests suddenly go red after one small change.** Usually the tests
  broke, not the app (they can drift). Ask: *"Did the app break, or did the
  tests break? Check the app first, by hand."*

➡️ **Next:** [Challenge 6 — Ship It](../06-ship-it/CHALLENGE.md)
