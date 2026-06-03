(function () {
  "use strict";

  // ── Collections ───────────────────────────────────────
  const COLLECTIONS = [
    { id: "agents", label: "AI Agents", noun: "agent", data: window.AGENTS || [] },
    { id: "skills", label: "Agent Skills", noun: "skill", data: window.SKILLS || [] },
    { id: "mcp", label: "MCP Servers", noun: "server", data: window.MCP || [] },
  ];

  const grid = document.getElementById("grid");
  const filters = document.getElementById("filters");
  const tabsEl = document.getElementById("tabs");
  const search = document.getElementById("search");
  const resultsCount = document.getElementById("results-count");
  const empty = document.getElementById("empty");
  const reset = document.getElementById("reset");

  let activeTab = "agents";
  let activeCategory = "All";
  let query = "";
  let sortMode = "default";

  const totalCount = COLLECTIONS.reduce((n, c) => n + c.data.length, 0);
  document.getElementById("stat-count").textContent = totalCount;

  function current() { return COLLECTIONS.find((c) => c.id === activeTab); }

  function categoriesFor(coll) {
    const counts = {};
    coll.data.forEach((a) => (counts[a.category] = (counts[a.category] || 0) + 1));
    const cats = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    return { counts, cats };
  }

  // ── Helpers ───────────────────────────────────────────
  function domainOf(url) {
    try { return new URL(url).hostname.replace(/^www\./, ""); }
    catch { return url; }
  }
  // Real favicons/avatars from live sources: GitHub org avatars for repos,
  // DuckDuckGo favicons for product domains, Google as a secondary fallback.
  function logoSources(url) {
    try {
      const u = new URL(url);
      const host = u.hostname.replace(/^www\./, "");
      if (host === "github.com") {
        const owner = u.pathname.split("/").filter(Boolean)[0];
        if (owner) return [`https://github.com/${owner}.png?size=128`, `https://icons.duckduckgo.com/ip3/github.com.ico`];
      }
      return [`https://icons.duckduckgo.com/ip3/${host}.ico`, `https://www.google.com/s2/favicons?domain=${host}&sz=128`];
    } catch { return []; }
  }
  function shortLabel(url) {
    try {
      const u = new URL(url);
      const host = u.hostname.replace(/^www\./, "");
      if (host === "github.com") {
        const parts = u.pathname.split("/").filter(Boolean);
        return parts.length ? "github.com/" + parts[0] : host;
      }
      return host;
    } catch { return url; }
  }
  function fmtStars(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "k";
    return "" + n;
  }
  function colorFor(name) {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
    return `linear-gradient(135deg, hsl(${h} 70% 52%), hsl(${(h + 40) % 360} 70% 42%))`;
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }
  function highlight(text, q) {
    const safe = escapeHtml(text);
    if (!q) return safe;
    const re = new RegExp("(" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig");
    return safe.replace(re, "<mark>$1</mark>");
  }

  // ── Tabs ──────────────────────────────────────────────
  function renderTabs() {
    tabsEl.innerHTML = "";
    COLLECTIONS.forEach((c) => {
      const btn = document.createElement("button");
      btn.className = "tab" + (c.id === activeTab ? " active" : "");
      btn.innerHTML = `<span class="tab-label">${c.label}</span><span class="tab-count">${c.data.length}</span>`;
      btn.addEventListener("click", () => {
        if (activeTab === c.id) return;
        activeTab = c.id;
        activeCategory = "All";
        query = "";
        search.value = "";
        search.placeholder = `Search ${c.data.length} ${c.label}…`;
        renderTabs();
        renderFilters();
        renderGrid();
        document.getElementById("directory").scrollIntoView({ behavior: "smooth", block: "start" });
      });
      tabsEl.appendChild(btn);
    });
  }

  // ── Category sidebar ──────────────────────────────────
  function renderFilters() {
    const coll = current();
    const { counts, cats } = categoriesFor(coll);
    filters.innerHTML = "";
    const make = (label, count, value) => {
      const btn = document.createElement("button");
      btn.className = "filter-item" + (value === activeCategory ? " active" : "");
      btn.innerHTML = `<span class="filter-label">${escapeHtml(label)}</span><span class="filter-count">${count}</span>`;
      btn.addEventListener("click", () => { activeCategory = value; renderFilters(); renderGrid(); });
      filters.appendChild(btn);
    };
    make("All", coll.data.length, "All");
    cats.forEach((cat) => make(cat, counts[cat], cat));
  }

  // ── Cards ─────────────────────────────────────────────
  function renderGrid() {
    const coll = current();
    const q = query.trim().toLowerCase();
    let list = coll.data.filter((a) => {
      const inCat = activeCategory === "All" || a.category === activeCategory;
      const inSearch = !q ||
        a.name.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q);
      return inCat && inSearch;
    });

    if (sortMode === "stars") list = list.slice().sort((a, b) => (b.stars || 0) - (a.stars || 0));
    else if (sortMode === "az") list = list.slice().sort((a, b) => a.name.localeCompare(b.name));

    grid.innerHTML = "";
    empty.hidden = list.length > 0;

    const frag = document.createDocumentFragment();
    list.forEach((a) => {
      const [primary, fallback] = logoSources(a.url);
      const card = document.createElement("a");
      card.className = "card";
      card.href = a.url;
      card.target = "_blank";
      card.rel = "noopener noreferrer";

      const letter = a.name.charAt(0).toUpperCase();
      card.innerHTML = `
        <div class="card-top">
          <div class="logo" style="background:${colorFor(a.name)}">
            <span class="logo-mono">${escapeHtml(letter)}</span>
            <img class="logo-img" src="${escapeHtml(primary || "")}" alt="" loading="lazy"
              data-fallback="${escapeHtml(fallback || "")}"
              onload="this.classList.add('loaded')"
              onerror="(function(i){if(i.dataset.fallback&&i.src!==i.dataset.fallback){i.src=i.dataset.fallback;i.dataset.fallback='';}else{i.remove();}})(this)" />
          </div>
          <div class="card-head">
            <div class="card-name">${highlight(a.name, query.trim())}${a.tag ? `<span class="tag">${escapeHtml(a.tag)}</span>` : ""}</div>
            <div class="card-cat">${escapeHtml(a.category)}</div>
          </div>
          ${typeof a.stars === "number" ? `<span class="card-stars" title="${a.stars.toLocaleString()} GitHub stars"><svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true"><path d="m12 17.27 6.18 3.73-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>${fmtStars(a.stars)}</span>` : ""}
        </div>
        <p class="card-desc">${highlight(a.description, query.trim())}</p>
        <div class="card-foot">
          Open
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg>
          <span class="card-domain">${escapeHtml(shortLabel(a.url))}</span>
        </div>`;

      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", e.clientX - r.left + "px");
        card.style.setProperty("--my", e.clientY - r.top + "px");
      });
      frag.appendChild(card);
    });
    grid.appendChild(frag);

    const noun = list.length === 1 ? coll.noun : coll.noun + "s";
    let label = `Showing ${list.length} ${noun}`;
    if (activeCategory !== "All") label += ` in ${activeCategory}`;
    if (q) label += ` matching “${query.trim()}”`;
    resultsCount.textContent = label;
  }

  // ── Events ────────────────────────────────────────────
  search.addEventListener("input", (e) => { query = e.target.value; renderGrid(); });
  const sortEl = document.getElementById("sort");
  if (sortEl) sortEl.addEventListener("change", (e) => { sortMode = e.target.value; renderGrid(); });
  reset.addEventListener("click", () => {
    query = ""; activeCategory = "All"; search.value = "";
    renderFilters(); renderGrid();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== search) { e.preventDefault(); search.focus(); }
    if (e.key === "Escape" && document.activeElement === search) {
      search.value = ""; query = ""; renderGrid(); search.blur();
    }
  });

  // ── Init ──────────────────────────────────────────────
  search.placeholder = `Search ${current().data.length} ${current().label}…`;
  renderTabs();
  renderFilters();
  renderGrid();
})();
