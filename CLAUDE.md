# gitbento — GitHub Bento Card Generator

## What This Is

A single-page web app where anyone enters their GitHub username and instantly gets a beautiful **bento grid card** with their GitHub stats — animated, glassmorphic, aesthetic. The card can be downloaded as PNG or copied as Markdown embed for GitHub profile READMEs.

No backend. No database. No login. Pure HTML + CSS + JS deployed on GitHub Pages.

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Structure | HTML5 (single `index.html`) | Zero build step, opens anywhere |
| Styles | CSS3 (custom properties, grid, animations) | No framework = no bloat |
| Logic | Vanilla JS (ES modules) | No dependencies except html2canvas |
| Data | GitHub REST API v3 (public, no auth) | Free, no token needed for public profiles |
| Image export | html2canvas 1.4.1 (CDN) | One script tag, converts DOM → PNG |
| Hosting | GitHub Pages | Free, auto-deploy on push |
| Analytics | None | Keep it simple |

---

## Project File Structure

```
gitbento/
├── index.html          # Main app (everything lives here)
├── style.css           # All styles
├── app.js              # All logic (fetch, render, export)
├── themes/
│   ├── aurora.css      # Purple/teal aurora gradient theme
│   ├── midnight.css    # Dark blue/black theme
│   └── sunset.css      # Orange/pink theme
├── assets/
│   └── og-image.png    # Social preview (1200x630)
└── README.md           # Project README with demo GIF
```

---

## Features (Build in This Order)

### Phase 1 — Core (must ship)
1. Input field: GitHub username + "Generate" button
2. Fetch from `https://api.github.com/users/{username}` and `https://api.github.com/users/{username}/repos`
3. Render bento grid with:
   - Avatar + name + bio + location
   - Total stars (sum across all repos)
   - Total forks
   - Public repos count
   - Top 3 languages (with colored progress bars)
   - Profile URL
   - Account age ("coding since 2019")
4. Download as PNG button (html2canvas)
5. Copy Markdown embed button

### Phase 2 — Polish (makes it go viral)
6. 3 theme switcher: Aurora (default), Midnight, Sunset
7. Animated aurora gradient background on the card
8. Glassmorphism card panels (backdrop-filter: blur)
9. Entrance animation when card appears
10. Loading skeleton while fetching
11. Error state (user not found)
12. Confetti animation on download

### Phase 3 — Extras (post-launch)
13. GitHub contribution streak (from `https://github-contributions-api.jogruber.de/v4/{username}`)
14. Most starred repo showcase panel
15. Custom accent color picker

---

## Design Requirements

### Color Palette — Aurora Theme (default)
```css
--bg: #0a0a0f;
--card-bg: rgba(255, 255, 255, 0.04);
--card-border: rgba(255, 255, 255, 0.08);
--aurora-1: #7c3aed;   /* violet */
--aurora-2: #06b6d4;   /* cyan */
--aurora-3: #10b981;   /* emerald */
--text-primary: #f8fafc;
--text-muted: #94a3b8;
--accent: #7c3aed;
```

### Bento Grid Layout
```
┌──────────────────────┬────────┬────────┐
│                      │ ⭐ 234 │ 🍴 89  │
│  Avatar + Name + Bio │ stars  │ forks  │
│                      ├────────┴────────┤
│                      │ Languages       │
├──────────┬───────────│ TS ████ 67%     │
│ 📦 42    │ 📅 since  │ Py ██   20%     │
│  repos   │   2020    │ JS █    13%     │
└──────────┴───────────┴─────────────────┘
```

### CSS Rules
- `border-radius: 16px` on all bento cells
- `backdrop-filter: blur(12px)` on card panels
- `border: 1px solid var(--card-border)` on all panels
- Aurora gradient animated via `@keyframes` on `::before` pseudo-element
- Font: `Inter` from Google Fonts
- All text in `rem` units

---

## Code Guidelines

- No frameworks (no React, Vue, Angular)
- No build tools (no webpack, vite, esbuild) — files load directly in browser
- No TypeScript — plain JS with JSDoc comments where helpful
- CSS custom properties for ALL colors and spacing
- Mobile-first responsive (card looks great on phone screenshots too)
- `async/await` for all fetch calls with try/catch
- Handle rate limiting: show "GitHub API rate limit reached, try again in 1 min" error

---

## Critical UX Details

- Auto-generate card on page load if `?user=username` query param exists (for direct links)
- Copy button copies `![gitbento](https://gitbento.vercel.app/?user=USERNAME)` format
- PNG export has 2x resolution (retina quality)
- Card max-width: 680px, looks good as a screenshot
- Page title changes to "username's GitHub Card — gitbento" after generation

---

## README Requirements

The README.md must include:
1. A GIF demo showing the app in action (record with Peek or Kooha on Linux)
2. Live demo link badge
3. "Used by X developers" badge (update manually or via shields.io)
4. Clear one-line description: "Generate beautiful bento-style GitHub profile cards in seconds"
5. Screenshot of each theme
6. "Add to your profile" quick-start in 3 steps
7. Contributing guide
8. License: MIT

---

## Deployment

1. Push to GitHub repo named `gitbento`
2. Go to Settings → Pages → Deploy from `main` branch `/root`
3. Custom domain optional: gitbento.dev (buy on Namecheap ~$10/yr)
4. Add `CNAME` file with domain if using custom domain

---

## Content Strategy — Road to 5000 GitHub Stars

### The Core Principle
Stars come from **distribution**, not just quality. Build in public, ship fast, share everywhere. One viral post > 100 good posts.

---

### Week 1 — Launch (target: 50-200 stars)

**Day 1 — Launch Day**
- Post on **Reddit** simultaneously:
  - r/github (2.1M members) — title: "I made a free tool to generate aesthetic GitHub profile cards"
  - r/webdev (1.2M members) — title: "Built this bento-style GitHub card generator in a weekend"
  - r/programming (6.3M members) — title: "Open source GitHub profile card generator"
- Post on **Hacker News** Show HN: "Show HN: gitbento – Generate aesthetic GitHub bento cards (github.com/yourname/gitbento)"
- Post on **X/Twitter**: Screenshot of YOUR card + "Just shipped gitbento — generate your aesthetic GitHub bento card for free. Link in bio 🧵"
- Post on **LinkedIn**: Professional angle — "I built an open source tool to make GitHub profiles more visual"
- Submit to **Product Hunt** (schedule for Tuesday 12:01 AM PST — highest traffic day)

**Day 2-3 — Follow Up**
- Reply to EVERY comment on all platforms
- Post your own card as your GitHub profile README and tweet it
- DM 10 developers you follow: "Hey, built this tool, would love your feedback"

**Day 4-7 — Maintain Momentum**
- Post a "48 hours later" update with user count on Twitter
- Share someone else's card that was generated (ask permission)
- Post a behind-the-scenes thread: "How I built gitbento in 2 hours with Claude"

---

### Month 1 — Growth (target: 500-1000 stars)

**Submit to Awesome Lists (highest ROI action)**
These lists drive consistent organic stars for months:
- `awesome-github-profile-readme` (10k+ stars) — open a PR adding gitbento
- `awesome-web` — submit via PR
- `awesome-css` — submit the CSS animation techniques
- Search GitHub for `awesome github tools` and submit to all with >1k stars
- Each approved PR = 10-50 stars passively per month

**SEO — GitHub itself is a search engine**
- Repository description: "✨ Generate beautiful bento-style GitHub profile cards. Animated, glassmorphic, free."
- Add topics/tags: `github-profile`, `bento`, `css`, `javascript`, `github-readme`, `profile-generator`, `open-source`
- Pin the repo on your GitHub profile

**YouTube Shorts / TikTok / Reels**
- Record a 30-second screen recording: type username → card generates → download PNG
- Post with caption: "Your GitHub profile deserves this 🔥 #github #coding #webdev #opensource"
- Post 3x per week for 2 weeks
- These drive traffic that doesn't know GitHub → introduces new audience

**Dev.to & Hashnode Articles**
- Write: "How I built a viral GitHub profile generator in 2 hours"
- Write: "The CSS tricks behind gitbento's aurora animation"
- Cross-post on both platforms
- Each article = 100-300 views = 10-30 stars

---

### Month 2-3 — Compounding (target: 1000-2500 stars)

**Newsletter Mentions**
Email these newsletters directly (they accept community submissions):
- **JavaScript Weekly** (javascriptweekly.com/submissions) — huge reach
- **CSS Weekly** (cssweekly.com)
- **TLDR Newsletter** (tldr.tech/tech/submit)
- **Bytes.dev** — submit via their website
- Each newsletter mention = 200-500 stars in one day

**GitHub Trending**
- If you get 50+ stars in one day, you appear on GitHub Trending
- Trending = snowball effect (more visibility → more stars → stay trending)
- Coordinate a "star drop" with friends/community on Product Hunt launch day
- Aim for GitHub Trending in "HTML" or "CSS" category (lower competition than general)

**Influencer Outreach**
DM these types of accounts on X:
- Dev influencers with 10k-100k followers who post about tools
- Message: "Hey [name], built this open source tool [gitbento] — think your audience would like it. No strings, just sharing"
- Target 20 accounts, expect 2-3 to share = 500+ stars each if they have 50k+ followers

---

### Month 4-6 — Sustained Growth (target: 2500-5000 stars)

**Add Features That Create New Viral Moments**
Each new feature = new launch opportunity:
- Add "dark/light/colorful" themes → new screenshots → new posts
- Add contribution graph visualization → new demo
- Add team cards (multiple usernames) → companies start using it
- Each feature update = tweet + Reddit post = 50-200 more stars

**GitHub Star History Badge**
- Add star history chart to README using star-history.com
- Shows growth = social proof = more stars

**"Featured Users" Gallery**
- Create a `SHOWCASE.md` where people can submit their card
- Developers open PRs to add themselves → they share the PR → their followers discover the project
- 50 showcase PRs = 50 people who each told their network

**Dev Community Posts**
- Post in **Dev.to** weekly challenge threads
- Post in **Hashnode** Writeathon events
- Submit to **daily.dev** community posts
- Answer GitHub-profile related questions on Stack Overflow and link to gitbento

---

### The 3 Rules for 5000 Stars

1. **Ship fast, iterate publicly** — Every update is a new post. Don't wait for perfect.
2. **Make it easy to share** — The PNG download exists specifically so people tweet screenshots. Your tool markets itself.
3. **Go where devs already are** — Reddit r/github, Hacker News, JavaScript Weekly, GitHub Trending. Don't build an audience, tap existing ones.

---

## Star Milestone Checklist

- [ ] 50 stars — Launch day Reddit + HN posts
- [ ] 100 stars — Submit to 5 awesome lists
- [ ] 250 stars — First newsletter mention
- [ ] 500 stars — Post YouTube Short demo
- [ ] 1000 stars — Influencer outreach campaign
- [ ] 2000 stars — New feature launch (themes)
- [ ] 3000 stars — Team cards feature launch
- [ ] 5000 stars — You're on GitHub Trending ✨
