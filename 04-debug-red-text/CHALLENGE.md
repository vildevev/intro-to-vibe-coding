# Challenge 4 — The Red Text

**Mission:** Turn error messages from panic fuel into the most useful thing
your AI can receive. Fix 3 planted bugs without breaking a sweat.

**Time:** ~45 minutes

---

## 😱 The story

Everyone remembers their first wall of red text. Heart rate up, stomach down,
the sure feeling that you broke something irreplaceable and everyone can tell.

Here's the reframe that changes everything: **an error message is a clue, not
a verdict.** It's the program saying, as precisely as it can, "I stopped
*here*, because of *this*." Programs can't lie and can't be sarcastic — the
red text is the most honest thing in your project. And no creature on Earth is
better at reading honest clues than your AI… *if you hand it the clue.*

Non-technical vibe coders fail at debugging for exactly one reason: they
describe their feelings ("it's just broken??") instead of delivering the
evidence. Today you learn to deliver evidence.

## 🧰 What you'll learn

- How to *read* the shape of an error (which file, which line, what complaint)
- The debugging loop: **reproduce → capture → describe → fix → verify → save**
- What "reproducing" means and why it's 80% of debugging
- When to fix, and when to time-travel back (Challenge 1)

## 📋 Before you start

- [ ] Challenges 0–1 done (a page, and save points)
- [ ] **Make a save point right now.** You're about to invite bugs in.

---

## Part A — Release the bugs (5 min)

Ask your AI:

```
This is a debugging drill. Secretly plant exactly 3 bugs in my project
that will cause visible errors or obvious breakage when I open the page.
Do NOT tell me what they are or where. Keep them different in kind:
one crash-style error, one thing that looks fine but is wrong, one
styling break. Commit the bugged version with the message "debug drill:
3 bugs planted".
```

1. Open the page. Find what breaks. That first part — *making the problem
   show up on demand* — is called **reproducing**, and it's the step
   professionals never skip. A bug you can trigger at will is a solved bug;
   a bug that "happens sometimes" is a horror movie.
2. Refresh the page (or reopen it) and watch it break again. That's a
   reproducible bug. Congratulations, you're debugging now.

## Part B — Deliver the evidence (15 min)

For each bug, you'll run the same play. Where the error text lives:

- **On the page itself** (crash-style errors)
- **In the browser console**: press `F12` (Mac: `Cmd+Option+J`) → **Console**
  tab. Red text there is the program's private diary. (If that sounds scary:
  you're only *reading* it, never typing in it. Closing it is also safe.)
- **In your AI's terminal area**, if it was running something

Then use the template — this exact shape, every time:

```
A bug: [what you expected] — but instead [what actually happened].

The error message says:
[paste the exact red text, all of it]

Here's how I make it happen: [open the page, click X, …]

Explain the error in plain English first. Then propose the smallest
possible fix and show me before applying it.
```

Notice what you're doing: **expected vs. actual** (the gap *is* the bug),
**the raw evidence** (exact words, not your summary of them), and **the
recipe** (how to reproduce). Plus two guardrails: *plain English first, show
me before applying.* You're the detective's client, not the suspect.

Fix all three bugs this way. One at a time. Verify each fix *before* asking
for the next one (that's "verify" — the step everyone skips).

## Part C — Save the wins (10 min)

After each confirmed fix, the ritual (it's three lines now, not a mystery):

```
git add .
git commit -m "fixed: button did nothing — missing click handler"
git push
```

(`git push` if you set up GitHub.) Write the commit message as **what was
wrong, in plain words** — Future You will search these one day.

Then ask your AI to reveal:

```
Drill over. Where were the 3 bugs? Explain each in one plain-English
sentence.
```

Compare your commits to its answers. You just documented 3 real bugs like a
professional.

## Part D — Know when not to fix (5 min)

Some bugs you *fix* (the red text, clear cause, small change). Some you
*time-travel past*:

- The AI broke something and neither of you can see why → go back to your
  last good save point and re-ask for the change differently. **Re-asking is
  cheaper than fixing.** Vibe coders have unlimited retries; use them.
- The "fix" is getting complicated (your AI starts saying things like "we'll
  need to refactor") → stop. Restore, simplify the request.

---

## 🤖 Prompts worth stealing

- *"Explain this error in plain English before fixing anything."*
- *"What are the 3 most likely causes, and how would we test which one it is?"*
- *"Fix it, then tell me how you'd double-check the fix works."*
- *"This error happened after your last change. What did you change that
  could have caused it?"*
- *"We've tried this twice and it still breaks. Stop fixing — restore my last
  good commit, and let's re-ask in a different way."*

## ✅ You passed when…

- [ ] You found all 3 bugs (or made an honest attempt at each, with evidence)
- [ ] You pasted exact error text at least once — not a summary, the text itself
- [ ] You committed after a fix, with a "fixed: ___" message
- [ ] You can name the loop: reproduce → capture → describe → fix → verify → save
- [ ] You know where the console lives (F12) and that reading it is safe

## 📚 Jargon translator

| Term | Plain English |
|------|---------------|
| Bug | When the program does something other than what was intended |
| Error / exception | The program stopping and explaining why — the red text |
| Reproduce | Make the bug happen on demand. Solvable bugs are reproducible bugs |
| Console | The browser's backstage diary (F12). Read-only for you |
| Stack trace | The error's longer "how I got here" story — paste it all |
| Debugging | Detective work: evidence → hypothesis → test → fix |
| Regression | Something that used to work, broke again. Save points catch these |

## 🆘 When it goes wrong

- **There's no error message — it's just wrong.** Describe expected vs. actual
  anyway ("I expected the photo left of the text; it's below"). Vague bugs just
  need sharper descriptions, not different tools.
- **The red text mentions files you've never heard of.** Normal — those are
  the program's internal files. Paste everything anyway; your AI reads the
  noise fluently.
- **The AI "fixed" it and now there are two new errors.** Happens. Time-travel
  to your last good commit and re-ask smaller. No feelings, just retries.
- **You feel genuinely overwhelmed.** Close the laptop. Seriously. Errors have
  no deadline; the time machine means nothing is lost. Return with tea.

➡️ **Next:** [Challenge 5 — Trust, But Verify](../05-review-the-diff/CHALLENGE.md)
