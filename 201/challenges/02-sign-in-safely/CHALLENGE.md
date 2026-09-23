# Challenge 2 — Sign In, Safely

**Mission:** Give your app **user accounts** — people sign in, see their own
data, and nobody sees anyone else's. Without ever building login yourself.

**Time:** ~60 minutes

---

## 😱 The story

Dave needed logins. He was a vibe coder with a capable intern, so he asked
for "a login system" and got one: a password box, a users table, done. It
worked! For four months. Then his site leaked — and because Dave's code had
saved passwords as plain readable text, the leak handed strangers a
neighbor's key: email + password pairs that people *reuse everywhere*.

Here's the thing nobody tells beginners: **"make a login" is one prompt, but
*a safe login* is thousands of hours of specialist work** — password hashing,
session handling, reset flows, rate limits, breach lists. Nobody, not even
the best companies, build it themselves anymore. They rent it. So will you.
Auth is a **rented lock**: the most important lock you'll ever not-build.

## 🧰 What you'll learn

- The golden rule: **never roll your own auth** — you wire up managed auth
- Sign-in without passwords: **magic links** (email = the key)
- **Ownership**: every user sees only their own rows
- What "hashed password" means, and why you'll never even see one

## 📋 Before you start

- [ ] Challenge 1 done: Supabase connected, a table your app writes to
- [ ] Your test table has no real personal data in it (drill data only)

---

## Part A — Turn on the rented lock (10 min)

Supabase has auth built in (it comes with the vault). In the Supabase
dashboard: **Authentication → Sign In / Up**. Look at the options: email
magic link, Google, GitHub, and a dozen more. You're not *building* any of
these — you're *switching them on*.

1. Enable **Email magic link** for now (no passwords at all — the fewest
   possible things to get wrong). If Supabase asks for a "Site URL" for dev
   work, your local address (e.g. `http://localhost:3000`) is fine for now.
2. Ask your AI to explain what a magic link is, like you're new:

   ```
   Explain magic-link sign-in in plain English: what the user does, what
   Supabase does, and why there's no password to store at all.
   ```

> 💡 Notice what's already true: there is **no password in your database**.
> Nothing to leak, because nothing exists. The best way to protect a secret
> is to not have it.

## Part B — Wire it in, small bites (20 min)

Three bites, testing between each:

1. The sign-in box:

   ```
   Add a small sign-in card to my app: an email field and a "Send me a
   sign-in link" button using Supabase magic links. After the link is
   sent, show a friendly "check your email" message. Explain the flow.
   ```

2. Try it with **your own email**. Click the link that arrives. You just
   created your first user. Look in Supabase → Authentication → Users:
   there you are, row one. That's the vault knowing who someone is.
3. The personal page:

   ```
   Add a "My wishes" view: when signed in, show ONLY the rows this user
   created, and make new wishes remember who created them. When signed
   out, show a "sign in to see your wishes" message instead of the list.
   Explain what changed.
   ```

## Part C — The bouncer at the vault door (15 min)

Right now "only your rows" is a promise the *app* makes — and apps can be
lied to. A bored teenager with the anon key can talk to your database
directly, skipping your polite app entirely. The enforcement has to live
*in the vault*, and Supabase has it built-in: **Row Level Security (RLS)** —
a door policy written as tiny rules.

Ask your AI:

```
Turn on Row Level Security for my wishes table with this policy: anyone
can read rows, but a signed-in user can only INSERT and SELECT rows where
the owner is themselves. Explain each policy in plain English first —
I want to know what the bouncer enforces before you apply it. Then apply
it and help me test it.
```

Then **test the bouncer** — the fun part:

1. Sign in as yourself, add a wish. Fine.
2. In Supabase's Table Editor, hand-edit your wish's `owner` field to some
   other value. Refresh the app: the wish is *gone from your list* — the
   bouncer just refused an impostor row.
3. Try (or ask the AI to try) a database write from *outside* the app while
   signed out. Blocked. That's RLS doing its job against people who skip
   your app.

**You passed the deep test of this challenge:** you didn't just *hope* the
lock worked — you attacked it and it held. (Trust, but verify — even for
locks.)

## Part D — The words you'll hear (5 min, reading only)

You'll never manage these yourself, but you should know the nouns:

- **Hashing**: turning a password into irreversible gibberish before storing.
  With magic links there are no passwords at all — Supabase would hash them
  if there were.
- **Session**: the "you're still you" state after clicking the link — a
  temporary badge the vault issued, which expires.
- **OAuth**: "sign in with Google/GitHub" — another rented lock inside the
  rented lock. Switching it on later is a settings page, not a project.

---

## 🤖 Prompts worth stealing

- *"How would an attacker try to see another user's rows? Check my policies
  against that and fix gaps."*
- *"Sign-out isn't clearing the session properly — walk me through
  verifying what the session state actually is."*
- *"Before I add [new feature], tell me which parts need the signed-in user
  and which are public."*

## ✅ You passed when…

- [ ] You sign in with a magic link and Supabase shows you as a user
- [ ] Signed-in users see only their own rows; signed-out sees no rows
- [ ] You hand-crafted an impostor row and the app refused to show it
- [ ] RLS is ON, with policies you can explain in one sentence each
- [ ] No password — hashed or otherwise — exists anywhere in your project

## 📚 Jargon translator

| Term | Plain English |
|------|---------------|
| Auth | Who you are (sign-in) and what you may do (permissions) |
| Magic link | A one-time sign-in link emailed to you — a password that arrives when needed and expires |
| Row Level Security (RLS) | The database's own bouncer: rules it enforces even against people who skip your app |
| Session | The temporary "still you" badge after sign-in; expires on its own |
| Hashing | Password → irreversible gibberish before storing. (You have none — good) |
| OAuth | "Sign in with Google" — someone else's login, rented like the rest |
| Plain text passwords | Dave's mistake. Never exists in your project, even by accident |

## 🆘 When it goes wrong

- **The magic link email never arrives.** Check spam first; then Supabase →
  Authentication → Email templates/logs — ask your AI: *"Where does Supabase
  show whether the sign-in email was sent?"*
- **After clicking the link, the app doesn't recognize me.** The link's
  destination doesn't match your app's address. Ask: *"Check the Supabase
  redirect URLs in Auth settings against where my app actually runs."*
- **"new row violates row-level security policy."** Celebration, not crisis —
  the bouncer works; your insert just doesn't say *who* is asking. Ask the AI
  to attach the signed-in user to the write.
- **You're tempted to "just add a password box" for simplicity.** Don't.
  Magic links are *less* work and *less* risk. The rule has no small print.

➡️ **Next:** [Challenge 3 — Take Money](../03-take-money/)
