# Challenge 5 — Trust, But Verify

**Mission:** Learn to *see* what the AI changed before you accept it — the
10-second habit that turns "why is everything broken?" into "ah, I see what
you did there."

**Time:** ~45 minutes

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

## 🤖 Prompts worth stealing

- *"Show me the diff and explain each change in one sentence before applying."*
- *"Did you change anything beyond what I asked for? Show me if so."*
- *"What could this change break? Which existing features should I re-test?"*
- *"Undo that completely — restore to the last commit."*
- *"Change exactly one thing: X. Touch nothing else, and confirm that when
  you're done."*

## ✅ You passed when…

- [ ] You read a diff with your own eyes and could say what was added/removed
- [ ] You caught (on purpose or by luck) the AI doing more than you asked — and named it
- [ ] You rejected a change fully or partially, and verified the rejection
- [ ] You can recite the 3 review questions without looking
- [ ] You know why "make it better" is an unreviewable request

## 📚 Jargon translator

| Term | Plain English |
|------|---------------|
| Diff | Before/after photo of your files: red = removed, green = added |
| Scope creep | The AI doing extra things you didn't ask for |
| Review | Reading the receipt before paying: what changed, is it right, what breaks? |
| Reject / revert | Undo a change — free and shameless when you have save points |
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

➡️ **Next:** [Challenge 6 — Ship It](../06-ship-it/CHALLENGE.md)
