# Challenge 1 — The Git Time Machine

**Mission:** Learn the one skill that makes AI coding safe: **save points you
can always go back to.** By the end, nothing the AI (or you) breaks will ever
be permanent again.

**Time:** ~60 minutes

---

## 😱 The story

Lisa spent a weekend vibe coding a website for her dog-walking business. It
was beautiful. Then she asked the AI to "make the pricing section nicer," went
to make coffee, came back — and the whole site was broken. The AI had rewritten
half the files. There was no Undo button. There was no going back. She rebuilt
the whole thing from scratch.

Here's the secret: **a save button has existed for 50 years.** It's called
**git**, and it works like save points in a video game. Reached a good moment?
Save. Something breaks later? Load the save. The AI can be as chaotic as it
wants — you can always go back to "the moment it was perfect."

This is the single most important challenge in the course.

## 🧰 What you'll learn

- **Repo** — a folder with time-machine powers
- **Commit** — a named save point ("added the contact form")
- **Restore** — travel back to any save point
- **GitHub** — a copy of your save points in the cloud
- **Branch** — a parallel universe where experiments can't hurt anything

## 📋 Before you start

- [ ] Finished Challenge 0 (you have a project folder with an About Me page)
- [ ] Your AI assistant is open in that folder

---

## Part A — Turn on the time machine (10 min)

Your AI will do the work — but today you'll press the buttons yourself a few
times, so the magic stops being magic.

Type these, one at a time, in your terminal (yes, you — it's 4 words each.
Your AI can watch and cheer):

```
git init
```

You just said: "make this folder a time-machine folder." (Only once per
project. If it says a warning about your name, ask your AI: *"git wants my
name and email, help me set it."*)

```
git status
```

This is the most-used command in software. It just *looks around* and reports:
what's new, what changed, what's about to be saved. Read what it says. Ask
your AI: *"Explain this git status output in plain English, like I'm new."*

## Part B — Make your first save points (10 min)

Now save your About Me page. Two steps, like packing a suitcase:

1. **Pack the suitcase** (choose what to save):

   ```
   git add .
   ```

   (The `.` means "everything in this folder.")

2. **Label and seal it** (create the save point):

   ```
   git commit -m "my first save point: About Me page"
   ```

The `-m` part is a **message** — a note to Future You. Write messages in plain
words you'd actually say: `"pricing section looks good before AI touches it"`,
not `"asdf"`. Future You is often panicking and in a hurry; leave good notes.

Make one more save point: ask the AI for a small change, check the page, then
`git add .` and `git commit -m "..."` again.

> 💡 **Golden Rule #1: Save before you renovate.** Before any big AI change,
> make a save point. It costs 10 seconds. Skipping it is how Lisa lost a weekend.

See your history — all your save points, newest first:

```
git log
```

(To exit the log view, press the `q` key. Everyone gets trapped once. Now you
won't.)

## Part C — The time travel moment (15 min)

This is where it stops being theory. You're going to **let the AI break your
site on purpose**, then travel back in time.

1. **Save first** (Golden Rule #1): `git add .` and commit with a message like
   `"last good version before the disaster drill"`.

2. Now, with a straight face, ask your AI:

   ```
   Make the page as ugly and broken as you can: clashing colors, huge
   chaotic text, and delete one of my sections. This is a drill — do not
   fix anything.
   ```

3. Look at your page in the browser. Enjoy the horror. This is what an
   uncontrolled AI change feels like.

4. Now the superpower. Find the save point you want to return to:

   ```
   git log --oneline
   ```

   (Same list, short and tidy.) Then travel back — ask your AI:

   ```
   Restore my project to the commit that says "last good version before
   the disaster drill" — undo everything that happened after it.
   ```

5. Refresh the browser. Your page is back. **Nothing the AI does is permanent
   anymore.** Say it out loud; it's a big deal.

## Part D — Cloud backup (GitHub) (15 min)

Save points so far live on your computer. If your laptop meets a swimming
pool, they die with it. **GitHub** is a free website that keeps a copy of your
save points in the cloud. It's also where the world stores software — you're
a member now.

1. Create a free account at [github.com](https://github.com) if you don't have one.
2. On GitHub, click **+ → New repository**, name it `vibe-coding-course`, set it
   to **Private**, and create it. (A "repository" — or *repo* — is just a
   time-machine folder. That's the whole definition.)
3. Ask your AI:

   ```
   I made an empty private GitHub repo called vibe-coding-course.
   Connect this folder to it and push my commits. Walk me through any
   login steps — explain everything in plain English.
   ```

4. Open your repo on github.com and see your files and your save-point history.
   That's your work, safe in the cloud.

From now on, after each save point, **push** (upload):

```
git push
```

> ⚠️ **Pay attention on Challenge 2:** GitHub is public-ish. Pushing the wrong
> file there is exactly how people get hacked. One more save point first:
> `git add .` + commit + push.

## Part E — Parallel universes (10 min, optional but fun)

Big idea: sometimes you want to try something wild without risking the good
version. A **branch** is a parallel universe: experiment freely there, and if
it's better, merge it back; if it's terrible, delete it and nobody ever knows.

1. Ask your AI:

   ```
   Create a git branch called wild-idea and switch to it.
   Then change my page's color scheme to neon pink and green.
   ```

2. Look at the page. Bold choice.
3. Now choose your ending — ask your AI for either:

   - *"I hate it. Delete the wild-idea branch and switch me back to the
     main version."* — or —
   - *"Actually it's growing on me. Merge wild-idea into main."*

You just did something professional developers do every day. Conceptually,
you now understand one of the hardest things to teach junior engineers.

---

## 🤖 Prompts worth stealing

- *"Before making changes, check git status and tell me if there are unsaved
  changes."*
- *"Make this change, then create a git commit with a message describing what
  you did, then push."*
- *"Something looks wrong since your last change. Show me what changed since
  the last commit, in plain English."*
- *"Explain this git error like I've never used git."*

## ✅ You passed when…

- [ ] Your project has at least 4 save points (check `git log --oneline`)
- [ ] You restored a deliberately broken page from a save point — with your own eyes
- [ ] Your save points are on GitHub (you can see them in your browser)
- [ ] You created a branch, decided its fate, and returned safely
- [ ] You can explain in one sentence: what's the difference between commit and push?

## 📚 Jargon translator

| Term | Plain English |
|------|---------------|
| Git | The time machine itself — the save-point system |
| Repo (repository) | A folder with the time machine switched on |
| Commit | A named save point; a photo of your project at a good moment |
| `git status` | "What's going on right now?" — look, don't touch |
| `git add .` | Pack the suitcase: choose what goes into the next save point |
| `git commit -m "..."` | Seal and label the suitcase |
| `git push` | Upload save points to the cloud (GitHub) |
| `git log` | The list of all your save points, newest first |
| Branch | A parallel universe for experiments; merge = bring good ideas home |
| GitHub | The cloud home for your save points (not the same thing as git!) |

## 🆘 When it goes wrong

- **"fatal: not a git repository"** — you're in the wrong folder. Ask your AI:
  *"Which folder am I in? Is it the right project?"*
- **`git log` won't let you type.** Press `q`. (Told you.)
- **The AI offers 5 different ways to undo.** Say: *"Use the simplest safe
  option, and tell me what you're about to do before doing it."*
- **GitHub asks for a password and nothing works.** GitHub wants a "Personal
  Access Token" instead of a password — ask your AI: *"Help me create a GitHub
  Personal Access Token and use it."* (And yes — that token is a secret.
  Challenge 2 will teach you where it lives.)
- **"I think I deleted everything!!!"** Breathe. If it was ever committed,
  it's never gone. Ask your AI: *"Show me git log. What's the newest save
  point? Can we go back to it?"*

➡️ **Next:** [Challenge 2 — Secrets: Don't Get Hacked](../02-secrets-and-env/CHALLENGE.md)
