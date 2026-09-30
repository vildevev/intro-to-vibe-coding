# Challenge 1 — Your App Gets a Memory

**Mission:** Break the paper ceiling. Give your app a real database so it
*remembers* what people tell it — after refresh, after closing the tab,
after a week.

**Time:** ~60 minutes

---

## 😱 The story

Maria built a birthday wishlist app in her 101 style: small bites, save
points, nice diff reviews. Her sister added "noise-cancelling headphones."
Maria refreshed the page to admire it. **Gone.** Every item anyone ever
added evaporated, because the data lived *in the page* — and a page is paper.
Close the book, lose the notes.

Everything in the 101 was deliberately paper: fast, free, and forgetful. The
moment your idea needs to *remember* — wishlists, signups, scores, orders,
messages — you've hit the wall every real app hits. The wall has a name:
you need a **database**. And the secret is that in 2026, you rent one in
about four minutes and never operate it yourself.

## 🧰 What you'll learn

- What a **database** is: a spreadsheet that never forgets, never sleeps, and
  every visitor can write to
- Why you **rent** a managed database (Supabase) and never build your own
- The **two kinds of keys**: the badge tier (public by design) and the vault
  tier (secret forever) — and the no-peek drill that trains you for the vault
- The full read–write loop: form → save → list

## 📋 Before you start

- [ ] A simple project you can extend (a page with a form or list is perfect)
- [ ] Git save points working, tests from 101 · Challenge 5 optional but welcome
- [ ] A free [supabase.com](https://supabase.com) account — create one now

---

## Part A — Rent the vault (10 min)

Supabase is a managed database company: they run the computers, you use a
dashboard. (Managed = *someone else loses sleep so you don't have to*.)

1. Create a **new project** in the Supabase dashboard. Name it after your
   app. Pick the region closest to your future users. The free tier is
   genuinely enough for learning and small real apps.
2. While it spins up (a minute or two), notice what you are *not* doing:
   no servers to rent, no disks to size, no backups to schedule. Rented
   vaults come with alarms.
3. In the Supabase sidebar find **Project Settings → API**. You'll see two
   long strings — a **URL** and an **anon key**. Your app will use both.
   Stop here and read Part B before touching them.

## Part B — Two kinds of keys (10 min)

Before the drawer, the honest model. Supabase — like every managed database —
has **two tiers of credentials**, and treating them the same is how people end
up either paranoid about nothing or careless about the wrong thing:

**The badge tier — public by design.** Your project URL and the **anon key**.
They ship to every visitor's browser — anyone can open Dev Tools and read
them — so hiding them is security theater, not security. Think of the anon key
as a **visitor badge**: everyone gets the same badge, and the building decides
which doors it opens. Those door rules are called **Row Level Security (RLS)**,
they live in the Supabase dashboard, and they're where the security actually
comes from. (Challenge 2 is the bouncer's training day.)

**The vault tier — secret forever.** The **service_role key** and the database
**connection string** (the `postgresql://user:password@…` kind). These bypass
every door — full admin access — and you won't use them in this course's apps.
But know the tier exists, because the drawer rule below is *really* about this
one.

So why run the no-peek drill at all? Because you're training the reflex on the
tier where it's merely habit, so it's automatic on the tier where it's the only
thing standing between a stranger and your entire database. Run it:

```
My app is about to talk to Supabase. Create entries in .env for:
SUPABASE_URL= (empty) and SUPABASE_ANON_KEY= (empty), with comments
explaining each. Then write the code that reads them from .env and
connects. Do NOT invent values and don't ask me to paste them — I'll
copy them from my Supabase dashboard myself. Then verify the values
are loaded without printing them.
```

You paste the URL and key into `.env` yourself. Same drawer — and now you know
exactly which tier it's protecting.

> 💡 **The one-line test for any credential:** "If this appeared on a poster,
> what's the worst that happens?" Anon key: strangers walk through your open
> doors — that's what the doors are *for*. Connection string: strangers own
> the building. The tier decides the paranoia level.

## Part C — Teach the vault what to remember (10 min)

A database stores **tables** — think spreadsheet tabs. Columns are the kinds
of things you save; rows are the actual things. For a wishlist: one table,
`wishes`, with columns `id`, `text`, `created_at`.

Ask your AI:

```
Help me create a table called wishes in Supabase with: id (auto), text
(short string), created_at (timestamp). Walk me through doing it in the
Supabase dashboard's Table Editor — I'll click, you guide. Explain what a
table, column, and row are like I've never used a database.
```

Click along in Supabase's **Table Editor**. Add one row by hand ("hello
database") so you've seen a row with your own eyes. That's the vault
holding something.

## Part D — The full loop: save and read (20 min)

Now the app: a form that saves a wish, and a list that shows all wishes.
Small bites, as always:

1. Read first:

   ```
   Show me my page reads wishes from Supabase: fetch all rows, newest
   first, and display them as a list. Explain each piece in plain English
   before writing it.
   ```

2. Then write:

   ```
   Add a small form: a text input and a "Add wish" button. On submit,
   save a new row to the wishes table and refresh the list. Empty input
   shows a friendly message instead of saving.
   ```

3. Then the moment that matters: **add a wish, refresh the page, close the
   tab, come back.** Still there? Your app has a memory. That's the wall,
   gone.

4. **Run the tests** (or ask the AI to add a test that the list shows a
   saved wish — your smoke alarm grows with the app). Green? Save point:

   ```
   git add . && git commit -m "app remembers wishes: supabase table + form + list" && git push
   ```

## Part E — The grown-up blast-radius check (5 min)

New power, new cap. In Supabase: **Settings → Usage** — see the free tier's
limits and where a paid tier would start. Set the habit now: every new
service gets its limits looked at the day you adopt it. (101 · Challenge 2's
spend-cap rule — it applies to free tiers too.)

---

## 🤖 Prompts worth stealing

- *"Explain my database schema in plain English — tables, columns, and how
  they relate."*
- *"Before writing code, tell me which requests will READ and which will
  WRITE, and what could go wrong in each."*
- *"The save worked but the list doesn't show the new item. Walk me through
  checking: was it saved? is the fetch right? (Don't guess — check.)"*

## ✅ You passed when…

- [ ] A Supabase table exists with a row you created by hand
- [ ] Your app saves new rows from a form and lists them
- [ ] A wish survives refresh, tab-close, and your comeback
- [ ] You can say which Supabase credentials are public by design — and where
      the security actually lives (the doors, not the badge)
- [ ] You know where Supabase shows its limits

## 📚 Jargon translator

| Term | Plain English |
|------|---------------|
| Database | A spreadsheet that never forgets, is always on, and many people can write to at once |
| Table / row / column | Spreadsheet tab / one saved thing / a kind of thing you save |
| Managed database | A database someone else runs (and loses sleep over) — you rent it |
| Supabase | A popular managed database with a friendly dashboard; our rented vault |
| Anon key | The public-by-design visitor badge the browser carries; the RLS door rules decide what it opens |
| Schema | The shape of your memory: which tables and columns exist |
| Persist / persistence | "It survives" — the property Maria's wishlist didn't have |

## 🆘 When it goes wrong

- **"Invalid API key" or connection errors.** The `.env` values are wrong or
  the code isn't reading them. Ask: *"The app can't connect — check how .env
  is read first, then whether the values look complete (no stray spaces)."*
- **Saved but not showing.** Two steps failed differently: ask the AI to
  *check* which step broke — the save or the fetch — before fixing anything.
- **You pasted a key into chat by reflex.** First ask: which tier? Anon key:
  public by design — no emergency; reset it at Supabase → Settings → API for
  tidiness. Connection string or service_role key: that's the vault tier —
  rotate immediately. The tier decides the panic level.
- **Supabase asks about "Row Level Security" and it sounds scary.** It's the
  vault's door policy — and it's literally Challenge 2. For now keep the
  default doors open *for practice data only*; no real names or emails yet.

➡️ **Next:** [Challenge 2 — Sign In, Safely](../02-sign-in-safely/)
