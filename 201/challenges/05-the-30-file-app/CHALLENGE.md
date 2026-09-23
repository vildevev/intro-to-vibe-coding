# Challenge 5 — The 30-File App

**Mission:** Keep the map in your head when the project stops being "a
folder with a page" and becomes thirty files, three folders, and one AI that
sometimes edits the wrong one.

**Time:** ~45 minutes

---

## 😱 The story

Everything was fine until it was thirty files. Then this started happening:
you'd ask for a small fix, the AI would dash off confidently — and change
the *wrong file*. Not because it got stupid, but because at thirty files,
*you* couldn't say which file was the right one. So it guessed. Confident
guessing without a map is how apps rot.

Here's the adult truth about "no-code": at 201 level, you now maintain a
**codebase**. Not by reading all of it — by owning its **map**. A city you
know by neighborhoods, not by every brick. The map is a file (your README
and `AGENTS.md`), it's written in plain English, and the AI reads it every
single time before touching anything. From now on, the map is the project.

## 🧰 What you'll learn

- The **project tour**: a plain-English map of every neighborhood and what
  lives there — generated once, kept current forever
- **README-driven development**: update the map *before* wandering
- Dependency sanity: what's in your project, why, and what it costs you
- Structure changes done safely: moves, renames, and green tests

## 📋 Before you start

- [ ] Your 201 project (challenges 1–4 give you a properly grown one)
- [ ] Tests exist and are green (101 · Challenge 5 — your safety net today)

---

## Part A — Commission the map (10 min)

Ask the cartographer for the full tour:

```
Give me a tour of this project in plain English: draw the neighborhoods
(pages, server functions, database code, styles, configuration), name
the important files in each, and for each one say what it does and what
BREAKS if it disappears. Then write this tour into README.md under a
heading "Project map", and add a short version to AGENTS.md so you
re-read it before future changes.
```

Read the map it wrote. This is the moment the project stops being a fog and
becomes a city. Fix anything that reads wrong — you're the editor, it's your
city. Then save-point it:

```
git add . && git commit -m "project map: the city, named"
```

## Part B — Use the map: the tour-before-changes rule (10 min)

New standing rule for every non-trivial request from now on:

```
Before making changes: check the project map in AGENTS.md, tell me which
neighborhood(s) and files this task touches, and which it must NOT
touch. Then make the change.
```

Watch the difference. "Fix the buy button" used to get a confident dart
into the fog. Now it gets: *"Touches challenges/03 checkout code and
.env usage; must not touch the wishes table code"* — then the change. You
just made the AI smarter by making the map mandatory.

**Dependency sanity** — the second half of the map. Your project has a
shopping list of borrowed parts (in `package.json`):

```
List every dependency in package.json: what it does for us in one
sentence, and which feature dies without it. Flag any you think we
don't actually use.
```

Unused packages aren't just clutter — they're doors you're not watching. If
the list finds dead weight: remove one at a time, run the tests, commit.
(Green between every removal — that's the net holding.)

## Part C — The moving-day drill (15 min)

Structure changes — renaming files, moving things into folders — are where
unmapped projects fall apart, because one move breaks every reference to the
old address. With a map and tests, it's a controlled drill:

```
Moving-day drill: rename the file that holds my checkout code to
payments.js, moving it into a new folder called server/. Update every
reference. Run the tests. If anything goes red, fix it and tell me what
broke. Commit when green with the message "moving day: checkout lives
in server/payments.js".
```

What you're watching for: the AI updating *references* (the addresses), not
just moving the file (the furniture). If tests stayed green, the city's
addresses all got updated — real maintenance, safely. Then update the map:

```
Moving day done. Update the project map in README.md and AGENTS.md to
match reality — and tell me what would have broken if we'd skipped the
map update.
```

That last question is the lesson: a stale map is worse than no map, because
it lies with confidence.

---

## 🤖 Prompts worth stealing

- *"Which files does this task touch? What must it NOT touch?"* (before
  every non-trivial change)
- *"Explain how data flows through this app, end to end, in plain English."*
- *"What in this project would be hardest for a stranger to understand?
  Improve the map or the naming — your choice, show me first."*
- *"Is anything in this project unused? Dependencies, files, functions?"*

## ✅ You passed when…

- [ ] README.md has a project map that's true right now
- [ ] AGENTS.md has the short version, and the AI reads it before changes
- [ ] "Which files does this touch?" precedes your non-trivial requests
- [ ] Every dependency can be explained in one sentence; dead ones removed
- [ ] You completed a moving-day drill with green tests the whole way

## 📚 Jargon translator

| Term | Plain English |
|------|---------------|
| Codebase | The whole project as a living thing to maintain, not just files |
| Architecture | The neighborhood plan: what lives where, and what talks to what |
| Project map | Plain-English tour of the neighborhoods, written down where the AI reads it |
| Dependency | A borrowed part from the public shelf (npm) — on your shopping list, costs updates |
| `package.json` | The shopping list: every borrowed part, with versions |
| Refactor | Rearranging the house without changing what it does — safe only with a map and tests |
| Moving day | Renaming/moving a file: furniture moves, addresses must all update |

## 🆘 When it goes wrong

- **The map drifted from reality.** Re-commission it: *"Regenerate the
  project tour from the actual files — flag anything that contradicts the
  old map."* The drill at the end of Part C is why.
- **A change touched three neighborhoods you didn't expect.** That's the map
  doing its job: stop, read the diff (101 · Challenge 5), reject if it's
  scope creep.
- **Tests went red mid-moving-day.** Good — the net works. Don't hand-fix
  blindly: ask *"which reference is still pointing at the old address?"*
- **The AI keeps editing the wrong neighborhood anyway.** Your AGENTS.md map
  isn't being read. Make the tour-before-changes rule a house rule (101 ·
  Challenge 3) — the map only works if reading it is law.

➡️ **Next:** [Challenge 6 — Deep Debugging](../06-deep-debugging/)
