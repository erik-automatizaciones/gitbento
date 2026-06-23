// gitbento — fetch GitHub data, render a bento card, export as PNG.
// Vanilla ES module. Only external dependency: html-to-image (loaded in index.html).

const API = "https://api.github.com";
const THEMES = ["aurora", "midnight", "sunset"];
const STORE_THEME = "gitbento-theme";
const FALLBACK_ORIGIN = "https://erik-automatizaciones.github.io/gitbento/";

// GitHub Linguist colors for the most common languages (fallback: accent).
const LANG_COLORS = {
  JavaScript: "#f1e05a", TypeScript: "#3178c6", Python: "#3572A5",
  Java: "#b07219", "C++": "#f34b7d", C: "#555555", "C#": "#178600",
  Go: "#00ADD8", Rust: "#dea584", Ruby: "#701516", PHP: "#4F5D95",
  Swift: "#F05138", Kotlin: "#A97BFF", Dart: "#00B4AB", Scala: "#c22d40",
  HTML: "#e34c26", CSS: "#563d7c", SCSS: "#c6538c", Vue: "#41b883",
  Svelte: "#ff3e00", Shell: "#89e051", Lua: "#000080", Haskell: "#5e5086",
  Elixir: "#6e4a7e", Clojure: "#db5855", R: "#198CE7", Julia: "#a270ba",
  "Objective-C": "#438eff", Perl: "#0298c3", Solidity: "#AA6746",
  Zig: "#ec915c", Nim: "#ffc200", "Jupyter Notebook": "#DA5B0B",
  Astro: "#ff5a03", Markdown: "#083fa1", PowerShell: "#012456",
  MATLAB: "#e16737", "Vim Script": "#199f4b", Assembly: "#6E4C13",
};

// --- inline SVG icons (crisp in PNG export, unlike color emoji) ---
const ICON = {
  star: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5l2.95 5.98 6.6.96-4.78 4.66 1.13 6.57L12 17.56l-5.9 3.1 1.13-6.56L2.45 9.44l6.6-.96L12 2.5z"/></svg>',
  fork: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="6" cy="5" r="2.4"/><circle cx="18" cy="5" r="2.4"/><circle cx="12" cy="19" r="2.4"/><path d="M6 7.4v3.1a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V7.4M12 13.5v3.1"/></svg>',
  repo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H19v15H7.5A2.5 2.5 0 0 0 5 19.5z"/><path d="M5 19.5A2.5 2.5 0 0 1 7.5 17H19v4H7.5A2.5 2.5 0 0 1 5 19.5z"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="3.2"/><path d="M22 20v-2a4 4 0 0 0-3-3.87M16 3.5a4 4 0 0 1 0 7"/></svg>',
  pin: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  link: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>',
  langs: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
};

// --- DOM ---
const form = document.getElementById("gen-form");
const input = document.getElementById("username");
const generateBtn = document.getElementById("generate");
const statusEl = document.getElementById("status");
const card = document.getElementById("card");
const bento = document.getElementById("bento");
const actions = document.getElementById("actions");
const downloadBtn = document.getElementById("download");
const copyBtn = document.getElementById("copy");

let currentUser = null;

/* ============================ helpers ============================ */

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

function formatNumber(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n % 1_000_000 ? 1 : 0) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(n % 1_000 >= 100 ? 1 : 0).replace(/\.0$/, "") + "k";
  return String(n);
}

// Lighten very dark language colors (e.g. C's #555) so bars/dots stay legible
// on the dark card.
function ensureVisible(hex) {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(String(hex).trim());
  if (!m) return hex;
  let r = parseInt(m[1].slice(0, 2), 16);
  let g = parseInt(m[1].slice(2, 4), 16);
  let b = parseInt(m[1].slice(4, 6), 16);
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b; // 0–255
  if (lum < 95) {
    const t = ((95 - lum) / 95) * 0.72; // mix toward white
    r = Math.round(r + (255 - r) * t);
    g = Math.round(g + (255 - g) * t);
    b = Math.round(b + (255 - b) * t);
  }
  return `rgb(${r}, ${g}, ${b})`;
}

function langColor(name) {
  const fallback = getComputedStyle(card).getPropertyValue("--accent").trim() || "#7c3aed";
  return ensureVisible(LANG_COLORS[name] || fallback);
}

function setStatus(message, isError = false) {
  statusEl.textContent = message || "";
  statusEl.classList.toggle("is-error", Boolean(isError));
}

/* ============================ theming ============================ */

function setTheme(name) {
  const theme = THEMES.includes(name) ? name : "aurora";
  document.documentElement.dataset.theme = theme;
  document.querySelectorAll(".theme-dot").forEach((dot) => {
    dot.classList.toggle("is-active", dot.dataset.theme === theme);
  });
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", getComputedStyle(document.body).backgroundColor);
  try { localStorage.setItem(STORE_THEME, theme); } catch (_) {}
}

/* ============================ fetching ============================ */

class GitHubError extends Error {
  constructor(message) { super(message); this.name = "GitHubError"; }
}

function rateLimited(res) {
  return res.status === 403 && res.headers.get("X-RateLimit-Remaining") === "0";
}

function rateLimitMessage(res) {
  const reset = Number(res.headers.get("X-RateLimit-Reset")) * 1000;
  const mins = reset ? Math.max(1, Math.ceil((reset - Date.now()) / 60000)) : 1;
  return `GitHub API rate limit reached, try again in ${mins} min.`;
}

async function fetchUser(username) {
  const res = await fetch(`${API}/users/${encodeURIComponent(username)}`, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (res.status === 404) throw new GitHubError(`No GitHub user named “${username}”.`);
  if (rateLimited(res)) throw new GitHubError(rateLimitMessage(res));
  if (!res.ok) throw new GitHubError("Couldn’t reach GitHub. Try again in a moment.");
  return res.json();
}

async function fetchRepos(username) {
  const all = [];
  for (let page = 1; page <= 5; page++) {
    const res = await fetch(
      `${API}/users/${encodeURIComponent(username)}/repos?per_page=100&page=${page}&sort=updated`,
      { headers: { Accept: "application/vnd.github+json" } }
    );
    if (rateLimited(res)) throw new GitHubError(rateLimitMessage(res));
    if (!res.ok) break;
    const chunk = await res.json();
    all.push(...chunk);
    if (chunk.length < 100) break;
  }
  return all;
}

/* ============================ stats ============================ */

function computeStats(user, repos) {
  // Own work only — exclude forks so stars/forks/languages reflect the user.
  const owned = repos.filter((r) => !r.fork);

  const totalStars = owned.reduce((s, r) => s + (r.stargazers_count || 0), 0);
  const totalForks = owned.reduce((s, r) => s + (r.forks_count || 0), 0);

  const counts = {};
  for (const repo of owned) {
    if (repo.language) counts[repo.language] = (counts[repo.language] || 0) + 1;
  }
  const ranked = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const top3Total = ranked.reduce((s, [, n]) => s + n, 0) || 1;
  const languages = ranked.map(([name, n]) => ({
    name,
    pct: Math.round((n / top3Total) * 100),
    color: langColor(name),
  }));

  const topRepo = owned.slice().sort((a, b) => b.stargazers_count - a.stargazers_count)[0] || null;

  const created = new Date(user.created_at);
  const year = created.getFullYear();
  const years = Math.max(0, new Date().getFullYear() - year);

  return { totalStars, totalForks, languages, topRepo, year, years };
}

/* ============================ rendering ============================ */

function statCell(area, icon, value, label) {
  return `
    <div class="cell cell--stat cell--${area}">
      <span class="stat__icon">${icon}</span>
      <div>
        <div class="stat__value">${value}</div>
        <div class="stat__label">${label}</div>
      </div>
    </div>`;
}

function languagesCell(languages) {
  const body = languages.length
    ? `<div class="langs__list">${languages.map((l) => `
        <div class="lang">
          <span class="lang__name"><span class="lang__dot" style="background:${l.color}"></span>${escapeHtml(l.name)}</span>
          <span class="lang__pct">${l.pct}%</span>
          <span class="lang__track"><span class="lang__fill" style="--pct:${l.pct}%;background:${l.color}"></span></span>
        </div>`).join("")}</div>`
    : `<div class="lang__pct" style="padding:0.4rem 0">No public languages yet.</div>`;

  return `
    <div class="cell cell--langs">
      <div class="langs__head">${ICON.langs} Top languages</div>
      ${body}
    </div>`;
}

function renderCard(user, stats) {
  const name = escapeHtml(user.name || user.login);
  const bio = user.bio ? `<p class="profile__bio">${escapeHtml(user.bio)}</p>` : "";
  const location = user.location
    ? `<span>${ICON.pin}${escapeHtml(user.location)}</span>` : "";

  bento.className = "bento";
  bento.innerHTML = `
    <div class="cell cell--profile">
      <div class="profile__top">
        <img class="profile__avatar" src="${escapeHtml(user.avatar_url)}&s=200"
             alt="${name}" crossorigin="anonymous" referrerpolicy="no-referrer" />
        <div class="profile__id">
          <div class="profile__name">${name}</div>
          <div class="profile__login">@${escapeHtml(user.login)}</div>
        </div>
      </div>
      ${bio}
      <div class="profile__meta">
        ${location}
        <span>${ICON.link}github.com/${escapeHtml(user.login)}</span>
      </div>
    </div>
    ${statCell("stars", ICON.star, formatNumber(stats.totalStars), "Stars")}
    ${statCell("forks", ICON.fork, formatNumber(stats.totalForks), "Forks")}
    ${statCell("repos", ICON.repo, formatNumber(user.public_repos), "Repos")}
    ${statCell("followers", ICON.users, formatNumber(user.followers), "Followers")}
    ${languagesCell(stats.languages)}
    <div class="cell cell--since">
      <div class="since__label">Coding since</div>
      <div class="since__year">${stats.year}</div>
      <div class="since__sub">${stats.years} year${stats.years === 1 ? "" : "s"} on GitHub</div>
    </div>`;

  // re-trigger entrance animation
  card.classList.remove("is-empty");
  card.classList.remove("is-ready");
  void card.offsetWidth;
  card.classList.add("is-ready");
}

function renderSkeleton() {
  card.classList.remove("is-ready", "is-empty");
  bento.className = "bento";
  const areas = ["profile", "stars", "forks", "repos", "followers", "langs", "since"];
  bento.innerHTML = areas
    .map((a) => `<div class="cell cell--${a} cell--skeleton" style="min-height:${a === "profile" || a === "langs" ? "120px" : "92px"}"></div>`)
    .join("");
}

function renderPlaceholder() {
  card.classList.add("is-empty");
  card.classList.remove("is-ready");
  bento.className = "bento bento--placeholder";
  bento.innerHTML = `
    <div class="placeholder">
      <div>
        <strong>Your bento card appears here</strong>
        Type a GitHub username above and hit Generate.
      </div>
    </div>`;
}

/* ============================ flow ============================ */

function updateMeta(login) {
  document.title = `${login}'s GitHub Card — gitbento`;
  try {
    const url = new URL(location.href);
    url.searchParams.set("user", login);
    history.replaceState(null, "", url);
  } catch (_) {
    // file:// or restricted context — title update is enough
  }
}

async function generateCard(rawName) {
  const username = String(rawName || "").trim().replace(/^@/, "");
  if (!username) { setStatus("Enter a GitHub username to start.", true); input.focus(); return; }
  if (!/^[a-zA-Z0-9-]{1,39}$/.test(username)) {
    setStatus("That doesn’t look like a valid GitHub username.", true);
    return;
  }

  generateBtn.disabled = true;
  setStatus(`Fetching @${username}…`);
  renderSkeleton();
  actions.hidden = true;

  try {
    const user = await fetchUser(username);
    const repos = await fetchRepos(user.login);
    const stats = computeStats(user, repos);

    currentUser = user;
    renderCard(user, stats);
    actions.hidden = false;
    setStatus("");
    updateMeta(user.login);
    input.value = user.login;
  } catch (err) {
    currentUser = null;
    renderPlaceholder();
    actions.hidden = true;
    setStatus(err instanceof GitHubError ? err.message : "Something went wrong. Try again.", true);
  } finally {
    generateBtn.disabled = false;
  }
}

/* ============================ export ============================ */

async function downloadPNG() {
  if (!currentUser) return;
  if (!window.htmlToImage) {
    setStatus("Image export failed to load. Check your connection and refresh.", true);
    return;
  }

  const label = downloadBtn.querySelector("span");
  const original = label.textContent;
  downloadBtn.disabled = true;
  label.textContent = "Rendering…";

  const options = {
    pixelRatio: 2, // retina-quality
    cacheBust: true,
    backgroundColor: getComputedStyle(card).backgroundColor,
  };

  try {
    // First pass warms up font/image embedding; second pass is reliably complete.
    await window.htmlToImage.toPng(card, options);
    const dataUrl = await window.htmlToImage.toPng(card, options);
    const link = document.createElement("a");
    link.download = `${currentUser.login}-gitbento.png`;
    link.href = dataUrl;
    link.click();
    confettiBurst();
  } catch (_) {
    setStatus("Couldn’t render the PNG. Try again, or take a screenshot.", true);
  } finally {
    downloadBtn.disabled = false;
    label.textContent = original;
  }
}

async function copyMarkdown() {
  if (!currentUser) return;
  const base = location.protocol.startsWith("http")
    ? location.origin + location.pathname
    : FALLBACK_ORIGIN;
  const markdown = `![${currentUser.login}'s GitHub card](${base}?user=${currentUser.login})`;

  try {
    await navigator.clipboard.writeText(markdown);
  } catch (_) {
    const ta = document.createElement("textarea");
    ta.value = markdown;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }

  const label = copyBtn.querySelector(".action__label");
  const original = label.textContent;
  copyBtn.classList.add("is-success");
  label.textContent = "Copied!";
  setTimeout(() => {
    copyBtn.classList.remove("is-success");
    label.textContent = original;
  }, 1600);
}

/* ============================ confetti ============================ */

function confettiBurst() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const canvas = document.getElementById("confetti");
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  ctx.scale(dpr, dpr);

  const root = getComputedStyle(document.documentElement);
  const colors = ["--aurora-1", "--aurora-2", "--aurora-3", "--accent"]
    .map((v) => root.getPropertyValue(v).trim() || "#7c3aed");

  const rect = card.getBoundingClientRect();
  const originX = rect.left + rect.width / 2;
  const originY = rect.top + rect.height / 2;

  const particles = Array.from({ length: 120 }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 9;
    return {
      x: originX, y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 4,
      size: 4 + Math.random() * 6,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      color: colors[(Math.random() * colors.length) | 0],
      life: 1,
    };
  });

  let frame = 0;
  (function tick() {
    frame++;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    let alive = false;
    for (const p of particles) {
      p.vy += 0.22;          // gravity
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life -= 0.012;
      if (p.life <= 0) continue;
      alive = true;
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    }
    if (alive && frame < 240) requestAnimationFrame(tick);
    else ctx.clearRect(0, 0, innerWidth, innerHeight);
  })();
}

/* ============================ init ============================ */

function init() {
  // theme
  let saved = "aurora";
  try { saved = localStorage.getItem(STORE_THEME) || "aurora"; } catch (_) {}
  setTheme(saved);

  document.querySelectorAll(".theme-dot").forEach((dot) => {
    dot.addEventListener("click", () => setTheme(dot.dataset.theme));
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    generateCard(input.value);
  });
  downloadBtn.addEventListener("click", downloadPNG);
  copyBtn.addEventListener("click", copyMarkdown);

  // direct link support: ?user=username
  const fromUrl = new URLSearchParams(location.search).get("user");
  if (fromUrl) {
    input.value = fromUrl;
    generateCard(fromUrl);
  } else {
    renderPlaceholder();
  }
}

init();
