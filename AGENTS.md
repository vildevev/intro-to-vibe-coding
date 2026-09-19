# AGENTS.md — Intro to Vibe Coding course repo

This repo contains course material, not an app. Challenges are written for
**non-technical learners** using an AI coding agent (like this one) for the
first time.

## Writing rules

- Audience has never used a terminal, git, or a code editor. Assume zero.
- Plain language first; introduce a technical term only with an everyday
  analogy, and collect terms in the challenge's jargon table.
- Every challenge: a story ("why you should care"), hands-on steps, exact
  copy-paste prompts for the AI, a "you passed when" checklist, and a
  recovery section for when it goes wrong.
- The AI does the typing; the learner makes the decisions and verifies.
  Never require memorizing commands.

## Structure

- `README.md` — course home and map (also the website's landing content)
- `NN-slug/CHALLENGE.md` — one challenge per numbered folder
- `CHEATSHEET.md` — printable one-pagers per topic
- `build.mjs` + `site/style.css` — static-site generator and design system
- `docs/` — generated website (committed; GitHub Pages serves this folder)

## Commands

- Build site: `npm install` (once), then `npm run build` (regenerates `docs/`)
- Preview site: `python3 -m http.server 8142 --directory docs`

Edit the markdown sources, never `docs/` — it is generated output. After
changing any course content, run the build and commit both the source and
the regenerated `docs/`.

## Deploying

GitHub Pages: repo Settings → Pages → Deploy from branch → `main` → `/docs`.
No build step runs on GitHub's side; `docs/` is committed pre-built.
Live at `https://vildevev.github.io/intro-to-vibe-coding/`.

⚠️ Do NOT set a custom apex domain on Pages (no `docs/CNAME`) without asking:
`getglod.com` (Cloudflare) already hosts the user's Glod app — attaching it
to Pages hijacks that site and makes the github.io URL redirect away.

## Conventions

- Keep `node_modules/`, `.env`, and `dist/` out of git (already in .gitignore).
- Challenge folders may contain starter files learners practice on; keep them
  deliberately breakable.
