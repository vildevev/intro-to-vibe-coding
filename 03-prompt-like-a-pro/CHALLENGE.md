# Challenge 3 — Prompt Like a Pro

**Mission:** Learn the difference between *telling* the AI what you want and
*communicating* it — the skill that decides whether you get a generic page or
**your** page.

**Time:** ~45 minutes

---

## 😱 The story

Two people ask their AI for "a website for my bakery." One gets a beige,
generic template with stock everything. The other gets a warm site with
handwriting fonts, a Tuesday-specials banner, and a photo of the actual
cinnamon rolls. Same AI. Same five minutes.

The difference was never talent. The first person ordered like it's a vending
machine. The second gave a proper brief — like they'd brief a designer.

Here's the model that fixes everything: **the AI is a brilliant intern with
total amnesia.** World-class skills, zero memory of yesterday, no idea what's
in your head, no idea what "make it pop" means. It will confidently build
*whatever it guessed you meant.* Your job is to remove the guessing.

## 🧰 What you'll learn

- The 4 parts of a prompt that works: **role, goal, constraints, examples**
- Why **small requests** beat big ones
- **AGENTS.md** — a house-rules file the AI reads every time, so you stop
  repeating yourself
- How to let the AI interview *you*

## 📋 Before you start

- [ ] Challenge 0 done (a working page)
- [ ] A save point made (Golden Rule #1 — you're practicing it now, right?)

---

## Part A — The two-bakery experiment (15 min)

You'll build the same thing twice. First, badly:

1. In a **new folder** (ask your AI: *"Create a folder called bakery-bad
   inside my course folder and work there"*), type:

   ```
   make a website for a bakery
   ```

2. Look at the result. Fine. Beige. Could be anyone's bakery in any city.

Now, properly. In another new folder, `bakery-good`, type:

```
You are a web designer who specializes in cozy neighborhood shops.
Build a one-page website for my bakery, "Flour & Fog", in a rainy
coastal town.

The vibe: warm, handmade, a little foggy. Handwriting-style headings,
cream and deep-teal colors. NOT corporate, no stock-photo smiles.

It must include:
- a hero section: "Fresh from the oven since 2021"
- a "Today's specials" section with 3 items and prices
- an "Our story" paragraph (I'll give you details if you ask)
- opening hours and a fake address

Rules: ask me up to 3 questions before you start. Use placeholder
photos with captions, not real images. Keep it to one page.
```

3. Notice what happens: it asks you questions. Answer them. That's the
   intern interviewing the boss — encourage it forever.
4. Compare the two bakeries. Same AI, same intern. You were the difference.

**The 4 parts, named:**

| Part | Bakery example |
|------|----------------|
| **Role** — who the AI is being | "web designer who specializes in cozy shops" |
| **Goal** — what to build, for whom | "one-page site for Flour & Fog" |
| **Constraints** — the guardrails | colors, sections, one page, placeholders, "no corporate" |
| **Examples / context** — what "good" looks like | the exact hero line, "rainy coastal town" |

You don't need all 4 every time. But when a result disappoints you, the
missing part is almost always one of them.

## Part B — Small bites (10 min)

Now rebuild your own page — but this time watch request size.

1. Ask for a big vague renovation:

   ```
   Make my About Me page way better.
   ```

2. Look at what came back. When you ask for "better," the AI invents a
   definition of better. Sometimes it's nice! Often it's *its* taste, not
   yours. Save point, then undo it if you like (`git` — Challenge 1 pays off).

3. Now ask the same thing as three small, concrete bites, one at a time:

   ```
   Add a "Now" section: 3 things I'm currently into, as a list.
   ```

   ```
   Make the Now section a horizontal row of cards, each with an emoji.
   ```

   ```
   Add one sentence at the bottom in italics: "Built with vibe coding,
   no hand-written code."
   ```

4. Small bites give you a decision after every bite: *keep, tweak, or undo.*
   Big bites give you one giant "surprise or undo." Which would you rather
   manage?

> 💡 Rule of thumb: if your prompt has an "and" joining two things you'd want
> to judge separately, make it two prompts.

## Part C — House rules: AGENTS.md (15 min)

Tired of retyping "keep it simple, explain changes in plain English, don't
delete my sections"? Every serious AI tool reads a settings file in your
project — usually named **`AGENTS.md`** — before every task. It's the standing
instructions / house rules. Write once, benefit forever.

1. Ask your AI:

   ```
   Create an AGENTS.md file in my project with these house rules:
   - I'm a beginner; explain every change in plain English before doing it
   - Ask before deleting or renaming any file or section
   - Make one small change at a time; no big rewrites without asking
   - This project is for learning vibe coding — prefer simple over clever
   - Never put secrets or API keys in code; use .env (Challenge 2 rule)
   Then show me the file.
   ```

2. Open it and edit the rules to taste. It's *your* house. (You're reading
   one right now, actually — this course repo has an `AGENTS.md` that tells
   every AI how to treat this course.)
3. Test it. Ask for something your rules should intercept:

   ```
   Reorganize all my files into new folders and rename everything.
   ```

   If it pauses and checks with you first — your house rules just worked.
   If it plows ahead: say *"Undo that — my AGENTS.md says ask first. Follow
   the house rules."*

---

## 🤖 Prompts worth stealing

- *"Ask me 3–5 questions before you build this, so you get it right the first
  time."*
- *"Give me 3 options with different trade-offs before you build."*
- *"Here's what I wanted: X. Here's what I got: Y. What should I have said?"*
  (the single best prompt for learning)
- *"Update AGENTS.md with the rule we just agreed on."* (recurring lessons
  become house rules)

## ✅ You passed when…

- [ ] You built the same thing twice and *saw* what a real brief changes
- [ ] You asked for a change as 3 small bites instead of 1 vague renovation
- [ ] Your project has an `AGENTS.md` with at least 3 house rules
- [ ] The AI asked you questions before building, at least once, because you told it to

## 📚 Jargon translator

| Term | Plain English |
|------|---------------|
| Prompt | Your instruction to the AI. A brief, not a wish |
| Role | Who the AI should act as ("you are a web designer…") |
| Constraint | A guardrail: colors, sizes, "don't touch X" |
| AGENTS.md | The house-rules file your AI reads every time it works in this folder |
| Context | What the AI can currently see. If it can't see it, it doesn't know it |
| Hallucination | When the AI confidently makes things up — the amnesia acting up |

## 🆘 When it goes wrong

- **The result is bland / generic.** Your prompt was missing *context* and
  *constraints*. Add: who it's for, the vibe, one concrete example.
- **The AI built something huge you didn't ask for.** Your AGENTS.md rules
  weren't followed — remind it, and make smaller requests.
- **You keep repeating the same instructions.** Move them into `AGENTS.md`.
- **The AI misunderstands "simple."** Show, don't tell: paste a screenshot
  description or point at a site you like ("like the feel of strapya-world.com,
  but cleaner" — any reference helps).

➡️ **Next:** [Challenge 4 — The Red Text](../04-debug-red-text/CHALLENGE.md)
