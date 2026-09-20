#!/usr/bin/env node
/**
 * Build the course website into docs/ (GitHub Pages serves this folder).
 * Sources: README.md (landing), the CHALLENGE.md files, CHEATSHEET.md.
 * Run: npm install (once), then `node build.mjs` or `npm run build`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';

const ROOT = new URL('.', import.meta.url).pathname;
const DOCS = path.join(ROOT, 'docs');

const CHALLENGES = [
  '00-setup', '01-git-time-machine', '02-secrets-and-env', '03-prompt-like-a-pro',
  '04-debug-red-text', '05-review-the-diff', '06-ship-it', '07-capstone',
].map((slug, i) => ({ slug, num: String(i).padStart(2, '0') }));

// pre-pass: every challenge's title, so pagers can reference neighbors
for (const ch of CHALLENGES) {
  const src = fs.readFileSync(path.join(ROOT, ch.slug, 'CHALLENGE.md'), 'utf8');
  ch.title = src.match(/^# Challenge \d+ — (.+)$/m)[1];
}

marked.use({ gfm: true });

// ---------- markdown post-processing ----------

const SECTION_CLASS = {
  '😱': 'story', '🧰': 'learn', '📋': 'before', '🤖': 'prompts',
  '✅': 'pass', '📚': 'jargon', '🆘': 'help', '🎓': 'next',
  '🏁': 'finish', '💾': 'sheet', '🔐': 'sheet', '🗣': 'sheet',
  '🐞': 'sheet', '🔍': 'sheet', '🚀': 'sheet',
};

function wrapSections(html) {
  return html
    .split(/(?=<h2>)/g)
    .map((chunk) => {
      if (!chunk.startsWith('<h2>')) return chunk;
      const key = Object.keys(SECTION_CLASS).find((e) => chunk.slice(4, 12).startsWith(e));
      const cls = key ? `sec sec-${SECTION_CLASS[key]}` : 'sec';
      return `<section class="${cls}">${chunk}</section>`;
    })
    .join('');
}

// rewrite links that point at the repo's markdown sources to their site pages
function fixLinks(html, rel) {
  return html.replace(/href="([^"]+\.md)"/g, (_, href) => {
    const challenge = href.match(/^(?:\.\.\/)?(\d\d-[^/]+)\/CHALLENGE\.md$/);
    if (challenge) return `href="${rel}challenges/${challenge[1]}/"`;
    if (href.endsWith('CHEATSHEET.md')) return `href="${rel}cheatsheet/"`;
    if (href.endsWith('README.md')) return `href="${rel}index.html"`;
    return `href="${href}"`;
  });
}

function convert(src, rel = '') {
  let html = marked.parse(src);
  html = html.replace(
    /<input (?:checked="" )?disabled="" type="checkbox"> ?/g,
    '<span class="cb" aria-hidden="true"></span>',
  );
  html = html.replace(/<table>/g, '<div class="tw"><table>').replace(/<\/table>/g, '</table></div>');
  html = html.replace(/<p>➡️ (.*?)<\/p>/gs, '<div class="next-card"><p>$1</p></div>');
  html = html.replace(
    /<code class="language-diff">([\s\S]*?)<\/code>/g,
    (_, code) => `<code class="language-diff">${code
      .split('\n')
      .map((l) => l.startsWith('+') ? `<span class="add">${l}</span>` : l.startsWith('-') ? `<span class="del">${l}</span>` : l)
      .join('\n')}</code>`,
  );
  return fixLinks(wrapSections(html), rel);
}

// ---------- page chrome ----------

function page({ rel, title, description, body, scripts = [] }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="${description}">
<title>${title}</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect x='3' y='3' width='26' height='26' rx='7' fill='%23237A50'/%3E%3Crect x='9' y='9' width='14' height='14' rx='3' fill='%23FFE86B'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Spline+Sans+Mono:wght@400;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${rel}assets/style.css?v=2">
<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "5e824f8c303e4285b5124f2aa119da17"}'></script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="topbar">
  <a class="brand" href="${rel}index.html"><span class="brand-mark" aria-hidden="true"></span>Intro to Vibe Coding</a>
  <nav class="topnav">
    <a href="${rel}index.html#course-map">Course map</a>
    <a href="${rel}cheatsheet/">Cheat sheets</a>
  </nav>
</header>
<main id="main">
${body}
</main>
<footer class="foot">
  <p>Intro to Vibe Coding — a course for people who have never written code, and never need to.</p>
  <p>Questions, wins, or feedback? <a href="mailto:vildevev.business@gmail.com">vildevev.business@gmail.com</a> · or <a href="https://github.com/vildevev/intro-to-vibe-coding/discussions">post in Discussions</a></p>
  <p>Built with vibe coding, obviously.</p>
</footer>
${scripts.map((s) => `<script src="${rel}assets/${s}" defer></script>`).join('\n')}
</body>
</html>
`;
}

// ---------- home ----------

// the loop demo: a simulated challenge run that pauses twice and waits for
// the reader to make the call (review the diff, try it for real). Powered by
// assets/sim.js; the script quotes the course's real rules — no invented claims.
const SIM_HTML = `
  <h2>The loop you'll run in every challenge</h2>
  <p>Every challenge runs on the same rhythm: <strong>save point → ask →
  build → review → try it → save.</strong> Press play to watch a simulated
  run — and notice who the buttons belong to. When the transcript pauses,
  <strong>you're the decision.</strong></p>
  <p class="sim-legend">In the transcript:
    <span class="key key-you">you</span>
    <span class="key key-ai">the AI</span>
    <span class="key key-err">errors</span>
    <span class="key key-gate">your call</span>
  </p>
  <div class="sim">
    <ol class="sim-track" aria-label="The challenge loop, step by step">
      <li class="sim-phase"><span class="ph-dot" aria-hidden="true"></span>Save point</li>
      <li class="sim-phase"><span class="ph-dot" aria-hidden="true"></span>Ask</li>
      <li class="sim-phase"><span class="ph-dot" aria-hidden="true"></span>Build</li>
      <li class="sim-phase" data-gate><span class="ph-dot" aria-hidden="true"></span>Review</li>
      <li class="sim-phase" data-gate><span class="ph-dot" aria-hidden="true"></span>Try it</li>
      <li class="sim-phase"><span class="ph-dot" aria-hidden="true"></span>Saved</li>
    </ol>
    <div class="sim-term">
      <div class="term-bar">a simulated challenge — the loop</div>
      <div class="sim-log" aria-live="polite">
        <p class="sim-wait">Press ▶ and the transcript of a challenge run will appear here.</p>
      </div>
      <div class="sim-gate" hidden>
        <p class="gate-name"></p>
        <p class="gate-prompt"></p>
        <div class="gate-actions"></div>
      </div>
      <div class="sim-ctrl">
        <button type="button" class="btn sim-run">▶ Run the loop</button>
        <button type="button" class="btn btn-ghost sim-step">Step ▸</button>
      </div>
    </div>
    <div class="sim-info" aria-live="polite"><p>Press <strong>▶ Run the loop</strong>. This card keeps up with the transcript and points out the rule behind each move.</p></div>
  </div>
  <p class="micro sim-note">A 60-second simulation — nothing here touches your computer. The words are the course's real rules: Golden Rules #1, #3, #4 and #5, from Challenges 1, 3, 4 and 5.</p>
  <noscript><p class="micro">This demo needs JavaScript — everything else in the course works fine without it.</p></noscript>
`;

function buildHome() {
  let src = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
  src = src.slice(src.indexOf('## How this works'));

  // pull the course-map table out and rebuild it as the level list
  const heading = '## The course map';
  const mapStart = src.indexOf(heading);
  const mapEnd = src.indexOf('## The 5 Golden Rules');
  const mapSrc = src.slice(mapStart, mapEnd);
  src = src.slice(0, mapStart + heading.length) + '\n' + src.slice(mapEnd);

  const rows = [...mapSrc.matchAll(/^\| (\d+) \| \[(.+?)\]\((.+?)\) \| (.+?) \| (.+?) \|$/gm)];
  const levels = `<ol class="levels" id="course-map">
${rows.map((r) => `  <li><a href="challenges/${r[3].replace('/CHALLENGE.md', '')}/">
    <span class="lvl-num" aria-hidden="true">${r[1].padStart(2, '0')}</span>
    <span class="lvl-main"><span class="lvl-title">${r[2]}</span>
    <span class="lvl-skill">${r[4]}</span></span>
    <span class="lvl-time">${r[5]}</span>
  </a></li>`).join('\n')}
</ol>`;

  const hero = `<section class="hero gridbg">
  <div class="hero-copy">
    <h1>Build software by describing&nbsp;it.</h1>
    <p class="lede">Vibe coding for people who have never coded: eight hands-on
    challenges that teach you to never lose your work, keep your secrets safe,
    and put something real on the internet.</p>
    <div class="cta-row">
      <a class="btn" href="challenges/00-setup/">Start Challenge 0</a>
      <a class="btn btn-ghost" href="#course-map">Browse the course map</a>
    </div>
    <p class="micro">Free. No experience needed. About six hours, spread over as many days as you like.</p>
  </div>
  <div class="hero-term" aria-hidden="true">
    <div class="term-bar">git log --oneline</div>
    <pre>c0ffee1  shipped my first website
b4d4555  fixed all three planted bugs
5e3d10c  moved the api key into .env
a11ce5d  reviewed the diff, said no
8badf00d survived the disaster drill
1234567  turned on the time machine
<span class="cursor">▊</span></pre>
  </div>
</section>`;

  let html = convert(src);
  // slot the loop demo in between "How this works" and the course map
  html = html.replace(
    '<section class="sec"><h2>The course map</h2>',
    `<section class="sec sec-sim">${SIM_HTML}</section><section class="sec"><h2>The course map</h2>`,
  );
  html = html.replace(
    /<p><strong>(.*?)\?<\/strong>([\s\S]*?)<\/p>/g,
    '<details class="faq"><summary>$1?</summary><div class="faq-a">$2</div></details>',
  );
  html = html.replace('<h2>The course map</h2>', `<h2>The course map</h2>\n${levels}`);

  return page({
    rel: '',
    title: 'Intro to Vibe Coding — build software by describing it',
    description: 'A free course for non-technical people: eight hands-on challenges covering git, secrets, prompting, debugging, code review and shipping to the web.',
    body: `${hero}\n<div class="prose">\n${html}\n</div>`,
    scripts: ['sim.js?v=6'],
  });
}

// ---------- challenges ----------

function buildChallenge(ch, idx) {
  let src = fs.readFileSync(path.join(ROOT, ch.slug, 'CHALLENGE.md'), 'utf8');
  // the Mission paragraph may wrap across lines
  const mission = src.match(/^\*\*Mission:\*\* ([\s\S]*?)\n\n/m)[1].replace(/\n/g, ' ');
  const time = src.match(/^\*\*Time:\*\* (.+)$/m)[1];
  src = src
    .replace(/^# .+$/m, '')
    .replace(/^\*\*Mission:\*\* [\s\S]*?\n\n/m, '')
    .replace(/^\*\*Time:\*\* .+$/m, '')
    .replace(/^---\n/m, '');

  const prev = CHALLENGES[idx - 1];
  const next = CHALLENGES[idx + 1];
  const href = (c) => `../../challenges/${c.slug}/`;
  const pager = `<nav class="pager">
    ${prev
      ? `<a class="prev" href="${href(prev)}"><span>Previous</span><strong>${prev.title}</strong></a>`
      : `<a class="prev" href="../../index.html"><span>Previous</span><strong>Course home</strong></a>`}
    ${next
      ? `<a class="next" href="${href(next)}"><span>Next</span><strong>${next.title}</strong></a>`
      : `<a class="next" href="../../cheatsheet/"><span>Next</span><strong>The cheat sheets</strong></a>`}
  </nav>`;

  const head = `<div class="level-head gridbg">
  <div class="level-num" aria-hidden="true">${ch.num}</div>
  <div class="level-meta">
    <p class="level-chips"><span class="chip">Challenge ${ch.num}</span><span class="chip">${time.replace('~', 'about ')}</span></p>
    <h1>${ch.title}</h1>
    <p class="mission"><strong>Mission.</strong> ${marked.parseInline(mission)}</p>
  </div>
</div>`;

  return page({
    rel: '../../',
    title: `Challenge ${ch.num}: ${ch.title} — Intro to Vibe Coding`,
    description: mission.replace(/[*_]/g, ''),
    body: `${head}\n<div class="prose">\n${convert(src, '../../')}\n${pager}\n</div>`,
  });
}

// ---------- write ----------

fs.rmSync(DOCS, { recursive: true, force: true });
fs.mkdirSync(path.join(DOCS, 'assets'), { recursive: true });
fs.writeFileSync(path.join(DOCS, '.nojekyll'), '');
// custom domain for GitHub Pages — only push this once learn.getglod.com DNS exists
fs.writeFileSync(path.join(DOCS, 'CNAME'), 'learn.getglod.com\n');
fs.copyFileSync(path.join(ROOT, 'site', 'style.css'), path.join(DOCS, 'assets', 'style.css'));
fs.copyFileSync(path.join(ROOT, 'site', 'sim.js'), path.join(DOCS, 'assets', 'sim.js'));

fs.writeFileSync(path.join(DOCS, 'index.html'), buildHome());

CHALLENGES.forEach((ch, i) => {
  const html = buildChallenge(ch, i);
  const dir = path.join(DOCS, 'challenges', ch.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
});

let sheet = fs.readFileSync(path.join(ROOT, 'CHEATSHEET.md'), 'utf8');
sheet = sheet.replace(/^# .+$/m, '').replace(/^---\n/m, '');
fs.mkdirSync(path.join(DOCS, 'cheatsheet'), { recursive: true });
fs.writeFileSync(
  path.join(DOCS, 'cheatsheet', 'index.html'),
  page({
    rel: '../',
    title: 'Cheat Sheets — Intro to Vibe Coding',
    description: 'Printable one-page cheat sheets: git, secrets, prompting, debugging, reviewing and shipping.',
    body: `<div class="level-head gridbg"><div class="level-meta">
      <p class="level-chips"><span class="chip">Reference</span><span class="chip">Print me</span></p>
      <h1>The Cheat Sheets</h1>
      <p class="mission"><strong>Mission.</strong> One page per topic. Print them, tape them to your monitor, survive anything.</p>
    </div></div>
    <div class="prose sheet">${convert(sheet, '../')}</div>`,
  }),
);

console.log(`built: docs/ (${1 + CHALLENGES.length + 1} pages)`);
