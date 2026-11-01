/* Shared layout + page logic. Each block only runs if its elements exist on the page. */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = (s = "") => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const page = document.body.dataset.page;
  const root = document.documentElement;

  const pubs = [...SITE.publications].sort((a, b) => b.year - a.year);
  const count = t => pubs.filter(p => p.type === t).length;
  const TYPES = {
    journal: ["Journal", "#01c501"], conference: ["Conference", "#019ff4"], chapter: ["Book chapter", "#e5bc00"],
    review: ["Under review", "#fd9500"], patent: ["Patent", "#f800fd"]
  };
  // "Heat" colour by year, borrowed from the reflectivity scale: newer = hotter
  const HEAT = { 2026: "#f800fd", 2025: "#fd0000", 2024: "#fd9500", 2023: "#fdf802", 2022: "#02fd02", 2021: "#01c501", 2020: "#019ff4" };
  const heat = y => HEAT[String(y).slice(0, 4)] || "#04e9e7";

  /* ---------- Header: ticker + nav ---------- */
  const PAGES = [
    ["home", "index.html", "Home"],
    ["research", "research.html", "Research"],
    ["publications", "publications.html", "Publications"],
    ["experience", "experience.html", "Education & Experience"],
    ["awards", "awards.html", "Awards &amp; Recognition"],
    ["gallery", "gallery.html", "Gallery"],
    ["contact", "contact.html", "Contact"]
  ];
  const MARK = `<svg class="brand__mark" viewBox="0 0 34 34" aria-hidden="true">
      <rect width="34" height="34" rx="9" fill="#071520"/>
      <circle cx="17" cy="17" r="11" fill="none" stroke="#2ee6d6" stroke-opacity=".35"/>
      <circle cx="17" cy="17" r="5.5" fill="none" stroke="#2ee6d6" stroke-opacity=".35"/>
      <g class="brand__sweep"><path d="M17 17 L17 6 A11 11 0 0 1 26.5 11.5 Z" fill="#2ee6d6" fill-opacity=".45"/></g>
      <circle cx="22.5" cy="12" r="2" fill="#fdf802"/><circle cx="11.5" cy="21.5" r="1.7" fill="#fd0000"/><circle cx="21" cy="23" r="1.3" fill="#02fd02"/>
      <circle cx="17" cy="17" r="1.4" fill="#2ee6d6"/></svg>`;
  // One welcome line, repeated so the scrolling strip never runs out
  const tickerItems = Array(6).fill(
    `<span class="ticker__item"><b>Welcome</b>to the homepage of Dr. Vaibhav Tyagi</span>`
  ).join("");
  $("#site-header").className = "site-head";
  $("#site-header").innerHTML = `
    <div class="ticker" aria-hidden="true"><div class="ticker__track">${tickerItems}${tickerItems}</div></div>
    <div class="nav">
      <div class="nav__inner">
        <a href="index.html" class="brand">${MARK}<span><span class="brand__name">Vaibhav Tyagi</span><span class="brand__sub">Radar meteorologist</span></span></a>
        <nav class="nav__links" id="navLinks" aria-label="Primary">
          ${PAGES.map(([k, href, label]) => `<a href="${href}"${k === page ? ' class="is-active" aria-current="page"' : ""}>${label}</a>`).join("")}
        </nav>
        <div class="nav__actions">
          <button class="icon-btn" id="themeToggle" aria-label="Switch between dark and light mode">
            <svg class="i-moon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
            <svg class="i-sun" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
          </button>
          <button class="icon-btn nav__menu" id="menuToggle" aria-label="Open menu" aria-expanded="false" aria-controls="navLinks">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
          </button>
        </div>
      </div>
      <div class="nav__progress" id="progress"></div>
    </div>`;

  /* ---------- Footer with reflectivity colour bar ---------- */
  $("#site-footer").innerHTML = `
    <div class="footer__scale" aria-hidden="true">${WX.DBZ.map(([, c]) => `<span style="background:${c}"></span>`).join("")}</div>
    <div class="container footer__scale-lbl" aria-hidden="true"><span>5 dBZ</span><span>35</span><span>70 dBZ</span></div>
    <div class="container footer__grid">
      <div>
        <a href="index.html" class="brand">${MARK}<span><span class="brand__name">Vaibhav Tyagi</span><span class="brand__sub">Radar meteorologist</span></span></a>
        <p>Postdoctoral Researcher, Department of Atmospheric and Oceanic Sciences, McGill University, Montréal.</p>
      </div>
      <nav aria-label="Footer"><b>Pages</b>${PAGES.map(([, href, label]) => `<a href="${href}">${label}</a>`).join("")}</nav>
      <nav aria-label="Profiles" class="footer__profiles"><b>Follow on</b>${SITE.links.map(l => `<a href="${l.url}" target="_blank" rel="noopener" title="${esc(l.name)}" aria-label="${esc(l.name)}"><span class="profile-link__ico" style="--brand:${l.color};--icon:url(assets/icons/${l.icon}.svg)"></span></a>`).join("")}</nav>
    </div>
    <div class="container footer__base">
      <span>© ${new Date().getFullYear()} Vaibhav Tyagi · Radar visuals are simulated</span>
      <a href="#" id="toTop">Back to top ↑</a>
    </div>`;
  $("#toTop").addEventListener("click", e => { e.preventDefault(); scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }); });

  /* ---------- Theme (dark by default) ---------- */
  // Dark unless the visitor picks light with the toggle; re-apply if anything else (e.g. an embedding host) changes it
  const THEME_KEY = "vt-theme";
  const wantedTheme = () => { try { return localStorage.getItem(THEME_KEY) || "dark"; } catch (e) { return "dark"; } };
  root.dataset.theme = wantedTheme();
  new MutationObserver(() => { const w = wantedTheme(); if (root.dataset.theme !== w) root.dataset.theme = w; })
    .observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  $("#themeToggle").addEventListener("click", () => {
    const next = root.dataset.theme === "light" ? "dark" : "light";
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
    root.dataset.theme = next;
  });

  /* ---------- Nav behaviour ---------- */
  const links = $("#navLinks"), menuBtn = $("#menuToggle"), progress = $("#progress");
  menuBtn.addEventListener("click", () => menuBtn.setAttribute("aria-expanded", links.classList.toggle("is-open")));
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* ---------- Clocks ---------- */
  const tickClock = () => {
    const d = new Date();
    $$("[data-utc]").forEach(el => el.textContent = d.toISOString().slice(11, 19));
    $$("[data-local]").forEach(el => el.textContent = d.toLocaleTimeString("en-CA", { timeZone: "America/Toronto", hour: "2-digit", minute: "2-digit", hour12: false }) + " EST/EDT");
  };
  tickClock(); setInterval(tickClock, 1000);

  /* ---------- Toast & copy ---------- */
  const toast = msg => {
    const t = $("#toast"); t.textContent = msg; t.classList.add("is-on");
    clearTimeout(toast.id); toast.id = setTimeout(() => t.classList.remove("is-on"), 1800);
  };
  const copy = async (text, msg) => {
    try { await navigator.clipboard.writeText(text); toast(msg); } catch { toast("Couldn't copy — select the text instead"); }
  };
  const citation = p => `${p.authors} (${p.year}). ${p.title}.${p.venue ? " " + p.venue + "." : ""}${p.doi ? " https://doi.org/" + p.doi : ""}`;
  document.addEventListener("click", e => {
    const c = e.target.closest("[data-copy]"); if (c) copy(c.dataset.copy, "Copied " + c.dataset.copy);
    const p = e.target.closest("[data-cite]"); if (p) copy(citation(pubs[+p.dataset.cite]), "Citation copied");
  });

  /* ---------- Shared renderers ---------- */
  const highlightMe = a => esc(a).replace(/Tyagi, V\.?/g, m => `<b>${m}</b>`);
  const pubHTML = (p, i, showYear) => `
    <li class="pub panel" style="animation-delay:${Math.min(i, 10) * 35}ms">
      <div>
        ${showYear ? `<span class="pub__year-inline">${p.year}</span>` : ""}
        <p class="pub__title">${esc(p.title)}</p>
        <p class="pub__authors">${highlightMe(p.authors)}</p>
        ${p.venue ? `<p class="pub__venue">${esc(p.venue)}</p>` : ""}
        <div class="pub__actions">
          ${p.doi ? `<a href="https://doi.org/${esc(p.doi)}" target="_blank" rel="noopener">DOI ↗</a>` : ""}
          <button class="pub__cite" data-cite="${pubs.indexOf(p)}">Copy citation</button>
        </div>
      </div>
      <span class="pub__type" style="--c:${TYPES[p.type][1]}">${TYPES[p.type][0]}</span>
    </li>`;
  const awardHTML = (a, i) => `
    <div class="award panel" style="--heat:${heat(a.year)};animation-delay:${Math.min(i, 12) * 35}ms">
      <span class="award__year">${esc(a.year)}</span>
      <h3>${esc(a.title)}</h3>
      ${a.detail ? `<p>${esc(a.detail)}</p>` : ""}
    </div>`;

  /* Instrument readouts (count up) */
  const readouts = $("#stats");
  if (readouts) {
    const items = [[count("journal"), "Journal", "art"], [count("conference"), "Conference", "pap"], [count("chapter") + count("patent"), "Chapters+IP", "ea"], [SITE.awards.length, "Awards", "rec"]];
    readouts.innerHTML = items.map(([n, l, u]) => `<div class="readout"><dt>${l}</dt><dd><span data-n="${n}">00</span><small>${u}</small></dd></div>`).join("");
    const run = el => {
      const n = +el.dataset.n, pad = v => String(v).padStart(2, "0");
      if (reduceMotion) { el.textContent = pad(n); return; }
      const t0 = performance.now();
      const step = t => { const p = Math.min((t - t0) / 1200, 1); el.textContent = pad(Math.round(n * (1 - (1 - p) ** 3))); if (p < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    };
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { $$("[data-n]", readouts).forEach(run); io.disconnect(); } });
    io.observe(readouts);
  }

  /* ---------- Home ---------- */
  const scopeCv = $("[data-scope]");
  if (scopeCv) {
    const az = $("[data-ro=az]"), legend = $("#legend");
    const setLegend = product => {
      legend.innerHTML = product === "vel"
        ? `<div class="legend__bar" style="background:linear-gradient(90deg,#0aff5a,#0a7a3c,#69737d,#7a1f2a,#ff1f23)"></div>
           <div class="legend__labels"><span>−25 m/s toward</span><span>0</span><span>away +25 m/s</span></div>`
        : `<div class="legend__bar" style="background:var(--dbz)"></div>
           <div class="legend__labels"><span>5</span><span>20</span><span>35</span><span>50</span><span>70 dBZ</span></div>`;
    };
    const sc = WX.scope(scopeCv, st => { az.textContent = "AZ " + st.angle.toFixed(1).padStart(5, "0") + "°"; });
    setLegend("dbz");
    $$("[data-product]").forEach(b => b.addEventListener("click", () => {
      $$("[data-product]").forEach(x => { x.classList.toggle("is-on", x === b); x.setAttribute("aria-pressed", x === b); });
      sc.set("product", b.dataset.product); setLegend(b.dataset.product);
      $("[data-ro=prod]").textContent = b.dataset.product === "vel" ? "VEL" : "DBZ";
    }));
    const qcBtn = $("[data-qc]");
    if (qcBtn) qcBtn.addEventListener("click", () => {
      const on = !qcBtn.classList.contains("is-on");
      qcBtn.classList.toggle("is-on", on); qcBtn.setAttribute("aria-pressed", on);
      sc.set("qc", on);
    });
  }
  if ($("#productCards")) $("#productCards").innerHTML = SITE.areas.map((a, i) => `
    <a class="product panel reveal" href="research.html#area-${i}" style="transition-delay:${i * 80}ms">
      <span class="product__code"><b>${esc(a.code)}</b><span>0${i + 1}</span></span>
      <div class="product__scale scale--${a.scale}"></div>
      ${a.focus ? `<span class="focus-badge">Current research focus</span>` : ""}
      <h3>${esc(a.title)}</h3><p>${esc(a.short)}</p>
      <span class="link-arrow">Read more <span class="arr">→</span></span>
    </a>`).join("");
  if ($("#latestPubs")) $("#latestPubs").innerHTML = pubs.filter(p => p.type === "journal").slice(0, 3).map((p, i) => pubHTML(p, i, true)).join("");
  if ($("#newsList")) $("#newsList").innerHTML = SITE.news.map(n => `<li><time>${esc(n.date)}</time><p>${esc(n.text)}</p></li>`).join("");
  if ($("#highlightAwards")) $("#highlightAwards").innerHTML = SITE.awards.filter(a => a.featured).slice(0, 6).map(awardHTML).join("");

  /* ---------- Research ---------- */
  const DEMOS = {
    qc: () => `
      <div class="demo" data-compare>
        <div class="demo__bar"><span><b>PPI</b> · Reflectivity · 150 km</span><span>Raw ⇆ QC</span></div>
        <div class="compare">
          <canvas data-before aria-label="Raw radar reflectivity with ground clutter"></canvas>
          <canvas data-after aria-label="Radar reflectivity after clutter filtering"></canvas>
          <span class="compare__lbl compare__lbl--l">RAW</span><span class="compare__lbl compare__lbl--r">FILTERED</span>
          <span class="compare__line"></span>
          <input type="range" min="0" max="100" value="50" aria-label="Slide to compare raw and filtered radar images">
        </div>
        <p class="demo__hint">Drag across the scope. Left: raw echoes with ground clutter near the radar and along a ridge. Right: after clutter mitigation.</p>
      </div>`,
    flow: () => `
      <div class="demo demo--flow">
        <div class="demo__bar"><span><b>WIND</b> · Retrieved flow field</span><span>Slow → fast</span></div>
        <div class="demo__stage"><canvas data-flow data-flow-interactive aria-label="Animated wind flow field"></canvas></div>
        <div class="demo__foot"><p class="demo__hint">Move your cursor over the field to spin up a vortex.</p><div class="legend__bar scale--wind" style="width:140px"></div></div>
      </div>`,
    zr: () => `
      <div class="demo demo--zr" data-zr>
        <div class="demo__bar"><span><b>dBZ</b> · What does it mean for rain?</span><span class="formula">Z = 200 R<sup>1.6</sup></span></div>
        <div class="demo__stage"><canvas aria-label="Animated rainfall at the selected intensity"></canvas><span class="zr__ground"></span></div>
        <dl class="zr__panel">
          <div><dt>Radar reflectivity</dt><dd><span data-out="dbz">35</span> dBZ</dd></div>
          <div><dt>Approx. rain rate</dt><dd><span data-out="r">—</span> mm/h</dd></div>
          <div><dt>Intensity</dt><dd data-out="label">—</dd></div>
        </dl>
        <input class="zr__slider" type="range" min="10" max="65" value="35" aria-label="Reflectivity in dBZ">
        <p class="demo__hint">Slide through the dBZ values to get a feel for how heavy the rain is, from light drizzle to torrential downpour. Rates use the classic Marshall–Palmer relation and are approximate.</p>
      </div>`,
    wivern: () => `
      <div class="demo demo--wivern" data-wivern>
        <div class="demo__bar"><span><b>WIVERN</b> · Line-of-sight wind in a storm</span><span>Illustrative</span></div>
        <div class="demo__stage"><canvas aria-label="Side view of a convective storm with a WIVERN satellite measuring line-of-sight Doppler winds"></canvas></div>
        <dl class="wv__panel">
          <div style="--c:#e6f0f8"><dt>Horizontal wind u</dt><dd><span data-w="u">—</span> m/s</dd></div>
          <div style="--c:#ff9a3c"><dt>Vertical air w</dt><dd><span data-w="w">—</span> m/s</dd></div>
          <div style="--c:#4fa8ff"><dt>Fall speed Vt</dt><dd><span data-w="vt">—</span> m/s</dd></div>
          <div style="--c:#f800fd"><dt>WIVERN LOS</dt><dd><span data-w="los">—</span> m/s</dd></div>
        </dl>
        <p class="demo__hint">V<sub>LOS</sub> = u·sinθ − (w − V<sub>t</sub>)·cosθ. Outside the storm the line-of-sight wind is mostly horizontal wind; in the core the updraft dominates. Retrieval separates w from u and V<sub>t</sub>.</p>
      </div>`,
    nowcast: () => `
      <div class="demo demo--nowcast" data-nowcast>
        <div class="demo__bar"><span><b>NOWCAST</b> · Deep learning · 10-min frames</span><span>Illustrative</span></div>
        <div class="nc">
          <div><span class="nc__lbl">Input · last 4 radar frames</span><div class="nc__frames" data-in></div></div>
          <div class="nc__net"><canvas data-net aria-label="Encoder, ConvLSTM and decoder network diagram"></canvas></div>
          <div class="nc__out"><span class="nc__lbl">Output · predicted next 4 frames</span><div class="nc__frames" data-out></div></div>
          <div class="nc__obs" data-obs-row hidden><span class="nc__lbl">Observed · what actually happened</span><div class="nc__frames" data-obs></div></div>
        </div>
        <div class="demo__foot">
          <p class="demo__hint">Predictions blur and weaken with lead time, a known weakness of deep-learning nowcasts. Compare with the observed frames.</p>
          <button class="switch" data-truth aria-pressed="false"><span></span>Show observed</button>
        </div>
      </div>`,
    scatt: () => `
      <div class="demo demo--scatt" data-scatt>
        <div class="demo__bar"><span><b>SCAT</b> · Ku-band ocean winds</span><span>Barbs in knots</span></div>
        <div class="demo__stage"><canvas aria-label="Wind barbs over the ocean with a rain band"></canvas></div>
        <div class="demo__foot">
          <p class="demo__hint">Turn the rain flag off to see how rain corrupts retrieved winds.</p>
          <button class="switch is-on" data-flag aria-pressed="true"><span></span>Rain flag</button>
        </div>
      </div>`
  };
  if ($("#areaDetails")) $("#areaDetails").innerHTML = SITE.areas.map((a, i) => `
      <article class="area" id="area-${i}">
        <div class="area__text reveal">
          <span class="area__num">0${i + 1}</span>
          ${a.focus ? `<span class="focus-badge">Current research focus</span>` : ""}
          <p class="tag">${esc(a.code)}</p>
          <h2>${esc(a.title)}</h2>
          ${[].concat(a.long).map(t => `<p>${esc(t)}</p>`).join("")}
          ${a.points ? `<ul class="area__papers">${a.points.map((p, k) => `<li><span>0${k + 1}</span>${esc(p)}</li>`).join("")}</ul>` : ""}
        </div>
        <div class="area__demos reveal">${[].concat(a.demo).map(d => DEMOS[d]()).join("")}</div>
      </article>`).join("");

  /* ---------- Publications ---------- */
  if ($("#pubGroups")) {
    let filter = "all", query = "";
    $("#pubFilters").innerHTML = [["all", "All", pubs.length, "var(--accent)"], ...Object.entries(TYPES).map(([k, [l, c]]) => [k, l, count(k), c])]
      .map(([k, l, n, c]) => `<button class="chip${k === "all" ? " is-active" : ""}" data-f="${k}" style="--c:${c}"><i></i>${l}<small>${n}</small></button>`).join("");
    const render = () => {
      const q = query.toLowerCase();
      const list = pubs.filter(p => filter === "all" || p.type === filter)
        .filter(p => !q || [p.title, p.authors, p.venue, p.year].join(" ").toLowerCase().includes(q));
      const years = [...new Set(list.map(p => p.year))];
      $("#pubGroups").innerHTML = years.map(y => {
        const items = list.filter(p => p.year === y);
        return `<div class="pub-group">
          <h2 class="pub-group__year" style="--heat:${heat(y)}">${y}<small>${items.length} item${items.length > 1 ? "s" : ""}</small><i></i></h2>
          <ol class="pubs">${items.map((p, i) => pubHTML(p, i)).join("")}</ol>
        </div>`;
      }).join("");
      $("#pubEmpty").hidden = list.length > 0;
    };
    $("#pubFilters").addEventListener("click", e => {
      const b = e.target.closest(".chip"); if (!b) return;
      filter = b.dataset.f; $$(".chip").forEach(c => c.classList.toggle("is-active", c === b)); render();
    });
    $("#pubSearch").addEventListener("input", e => { query = e.target.value.trim(); render(); });
    render();
  }

  /* ---------- Institutions (logos + photos) ---------- */
  const INST = SITE.institutions || {};
  const logoTile = (k, cls = "logo-tile") => {
    const s = INST[k]; if (!s) return "";
    return s.logo
      ? `<span class="${cls}"><img src="${s.logo}" alt="${esc(s.name)} logo" loading="lazy"></span>`
      : `<span class="${cls} ${cls}--txt">${esc(s.short)}</span>`;
  };
  if ($("#instStrip")) $("#instStrip").innerHTML = [...new Set(SITE.journey.map(j => j.inst))].map(k =>
    `<span class="inst-item">${logoTile(k)}<b>${esc(INST[k].short)}</b><small>${esc(INST[k].where || "")}</small></span>`).join("");

  /* ---------- Experience: storm track ---------- */
  const trackEl = $("#track");
  if (trackEl) {
    const J = SITE.journey, W = 1000, H = 300, n = J.length;
    const pts = J.map((_, i) => [80 + i * ((W - 160) / (n - 1)), 150 + Math.sin(i * 1.3 + 0.6) * 40]);
    // Catmull-Rom → cubic Bézier for a smooth track
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < n - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
    }
    const cols = ["#019ff4", "#02fd02", "#fdf802", "#fd9500", "#fd0000", "#f800fd"];
    trackEl.innerHTML = `
      <svg class="track" viewBox="0 0 ${W} ${H}" role="img" aria-label="Career track: ${J.map(j => j.place).join(", ")}">
        <defs><linearGradient id="trackGrad" x1="0" x2="1">${cols.map((c, i) => `<stop offset="${i / (cols.length - 1)}" stop-color="${c}"/>`).join("")}</linearGradient></defs>
        <path class="track__path" d="${d}" stroke-dasharray="2 6"/>
        <path class="track__draw" d="${d}" id="trackDraw"/>
        ${pts.map(([x, y], i) => {
          const up = i % 2 === 0, c = cols[Math.round(i * (cols.length - 1) / (n - 1))], last = i === n - 1, s = INST[J[i].inst];
          return `<g>
            ${last ? `<circle class="track__pulse" cx="${x}" cy="${y}" r="24" style="stroke:${c}"/>` : ""}
            <circle cx="${x}" cy="${y}" r="24" fill="#fff" stroke="${c}" stroke-width="3.5"/>
            ${s && s.logo
              ? `<image href="${s.logo}" x="${x - 16}" y="${y - 16}" width="32" height="32" preserveAspectRatio="xMidYMid meet"><title>${esc(s.name)}</title></image>`
              : `<text class="track__init" x="${x}" y="${y + 4}" text-anchor="middle">${esc(s ? s.short : J[i].place.slice(0, 3))}</text>`}
            <text class="track__place" x="${x}" y="${up ? y - 40 : y + 50}" text-anchor="middle">${esc(J[i].place)}</text>
            <text class="track__what" x="${x}" y="${up ? y - 58 : y + 68}" text-anchor="middle">${esc(J[i].year)} · ${esc(J[i].what)}</text>
          </g>`;
        }).join("")}
      </svg>`;
    const path = $("#trackDraw"), len = path.getTotalLength();
    path.style.strokeDasharray = len; path.style.strokeDashoffset = reduceMotion ? 0 : len;
    if (!reduceMotion) requestAnimationFrame(() => { path.style.transition = "stroke-dashoffset 2.6s cubic-bezier(.4,0,.2,1) .3s"; path.style.strokeDashoffset = 0; });
  }
  /* Education and Experience as two lists, newest first; each entry shows its campus photo and logo */
  const KINDS = { education: ["Education", "#fdf802"], research: ["Research", "#2ee6d6"], teaching: ["Teaching", "#f800fd"] };
  const MONTHS = "janfebmaraprmayjunjulaugsepoctnovdec";
  // Sort key from the end of a date range: "Present" first, then year and month
  const endKey = d => {
    if (/present/i.test(d)) return 1e6;
    const end = d.split(/–|-/).pop(), y = +(end.match(/\d{4}/) || [0])[0], m = end.match(/[A-Za-z]{3}/);
    return y * 100 + (m ? MONTHS.indexOf(m[0].toLowerCase()) / 3 + 1 : 12);
  };
  const cvItem = (x, kind, n) => {
    const s = INST[x.inst] || {};
    return `<li class="cv-item panel reveal" style="--c:${KINDS[kind][1]};transition-delay:${Math.min(n, 6) * 60}ms">
      <div class="cv-item__img">
        ${s.photo ? `<img src="${s.photo}" alt="${esc(s.name)} campus" loading="lazy">` : `<span class="place__ph">${esc(s.short || "")}</span>`}
        ${s.photoLabel ? `<span class="cv-item__label">${esc(s.photoLabel)}</span>` : ""}
        ${s.logo ? logoTile(x.inst, "place__logo") : ""}
      </div>
      <div class="cv-item__body">
        <div class="tl-when">${esc(x.date)} · ${esc(x.place || "")}${kind !== "education" ? `<span class="tl-kind">${KINDS[kind][0]}</span>` : ""}</div>
        <h3>${esc(x.title)}</h3><p class="tl-org">${esc(x.org)}</p>
        ${x.text ? `<p class="tl-text">${esc(x.text)}</p>` : ""}
        ${x.cgpa ? `<div class="gauge"><div class="gauge__bar"><i style="--w:${x.cgpa * 10}%"></i></div><div class="gauge__lbl"><span>CGPA</span><span>${x.cgpa.toFixed(2)} / 10</span></div></div>` : ""}
        ${x.pct ? `<div class="gauge"><div class="gauge__bar"><i style="--w:${x.pct}%"></i></div><div class="gauge__lbl"><span>Percentage</span><span>${x.pct.toFixed(2)}%</span></div></div>` : ""}
        ${s.credit ? `<small class="cv-item__credit">Photo: <a href="${s.source}" target="_blank" rel="noopener">${esc(s.credit)}</a>${(s.via ?? "Wikimedia Commons") ? `, via ${esc(s.via ?? "Wikimedia Commons")}` : ""}</small>` : ""}
      </div>
    </li>`;
  };
  const newestFirst = list => list.map((x, i) => ({ ...x, i })).sort((a, b) => endKey(b.date) - endKey(a.date) || a.i - b.i);
  if ($("#cvEducation")) $("#cvEducation").innerHTML = newestFirst(SITE.education).map((x, n) => cvItem(x, "education", n)).join("");
  if ($("#cvExperience")) $("#cvExperience").innerHTML = newestFirst(SITE.experience)
    .map((x, n) => cvItem(x, x.type || (/teaching/i.test(x.title) ? "teaching" : "research"), n)).join("");

  /* ---------- Awards ---------- */
  if ($("#awardList")) {
    const yearOf = a => a.year.slice(0, 4), years = [...new Set(SITE.awards.map(yearOf))];
    let yf = "all";
    $("#awardFilters").innerHTML = [["all", "All years"], ...years.map(y => [y, y])]
      .map(([k, l]) => `<button class="chip${k === "all" ? " is-active" : ""}" data-y="${k}" style="--c:${k === "all" ? "var(--accent)" : heat(k)}"><i></i>${l}</button>`).join("");
    const render = () => { $("#awardList").innerHTML = SITE.awards.filter(a => yf === "all" || yearOf(a) === yf).map(awardHTML).join(""); };
    $("#awardFilters").addEventListener("click", e => {
      const b = e.target.closest(".chip"); if (!b) return;
      yf = b.dataset.y; $$(".chip").forEach(c => c.classList.toggle("is-active", c === b)); render();
    });
    render();
  }
  if ($("#serviceList")) $("#serviceList").innerHTML = SITE.service.map(s =>
    `<li><div><strong>${esc(s.role)}</strong><br>${esc(s.org)}</div><span>${esc(s.date)}</span></li>`).join("");
  if ($("#memberships")) $("#memberships").innerHTML = SITE.memberships.map(m => {
    const mark = m.logo ? `<img src="${m.logo}" alt="" loading="lazy">` : `<b>${esc(m.short || m.name)}</b>`;
    return `<span class="member"><i class="member__logo${m.dark ? " member__logo--dark" : ""}">${mark}</i>${esc(m.name)}</span>`;
  }).join("");

  /* ---------- Gallery: newest first, filterable, with a lightbox ---------- */
  if ($("#galleryGrid")) {
    const CATS = { award: ["Awards", "#f800fd"], conference: ["Conferences", "#2ee6d6"], phd: ["Ph.D. journey", "#fdf802"], field: ["Field & lab", "#02fd02"] };
    const photos = [...SITE.gallery].reverse();
    let gf = "all", shown = photos;
    $("#galleryFilters").innerHTML = [["all", "All", photos.length, "var(--accent)"], ...Object.entries(CATS).map(([k, [l, c]]) => [k, l, photos.filter(p => p.cat === k).length, c])]
      .map(([k, l, n, c]) => `<button class="chip${k === "all" ? " is-active" : ""}" data-g="${k}" style="--c:${c}"><i></i>${l} <small>${n}</small></button>`).join("");
    const render = () => {
      shown = photos.filter(p => gf === "all" || p.cat === gf);
      $("#galleryGrid").innerHTML = shown.map((p, i) => `
        <li class="gallery__item panel" style="--c:${CATS[p.cat][1]};animation-delay:${Math.min(i, 12) * 40}ms">
          <button class="gallery__img" data-i="${i}" aria-label="Open photo: ${esc(p.title)}">
            <img src="assets/gallery/thumbs/${p.img}" alt="${esc(p.title)}" loading="lazy">
          </button>
          <div class="gallery__cap">
            <span class="gallery__meta">${esc(p.date)}<span>${CATS[p.cat][0]}</span></span>
            <b>${esc(p.title)}</b>
            ${p.place ? `<small>${esc(p.place)}</small>` : ""}
          </div>
        </li>`).join("");
    };
    $("#galleryFilters").addEventListener("click", e => {
      const b = e.target.closest(".chip"); if (!b) return;
      gf = b.dataset.g; $$("#galleryFilters .chip").forEach(c => c.classList.toggle("is-active", c === b)); render();
    });
    render();
    // Lightbox
    const lb = $("#lightbox"), lbImg = $("#lightbox img"), lbCap = $("#lightbox figcaption");
    let cur = 0;
    const open = i => {
      cur = (i + shown.length) % shown.length; const p = shown[cur];
      lbImg.src = `assets/gallery/${p.img}`; lbImg.alt = p.title;
      lbCap.innerHTML = `<b>${esc(p.title)}</b><span>${esc([p.date, p.place].filter(Boolean).join(" · "))}</span>`;
      lb.hidden = false; document.body.style.overflow = "hidden";
    };
    const close = () => { lb.hidden = true; document.body.style.overflow = ""; };
    $("#galleryGrid").addEventListener("click", e => { const b = e.target.closest("[data-i]"); if (b) open(+b.dataset.i); });
    lb.addEventListener("click", e => {
      const a = e.target.closest("[data-lb]")?.dataset.lb;
      if (a === "prev") open(cur - 1); else if (a === "next") open(cur + 1); else if (a === "close" || e.target === lb) close();
    });
    document.addEventListener("keydown", e => {
      if (lb.hidden) return;
      if (e.key === "Escape") close(); else if (e.key === "ArrowLeft") open(cur - 1); else if (e.key === "ArrowRight") open(cur + 1);
    });
  }

  /* ---------- Contact ---------- */
  if ($("#profileLinks")) $("#profileLinks").innerHTML = SITE.links.map(l => `
    <a class="profile-link panel" href="${l.url}" target="_blank" rel="noopener">
      <span class="profile-link__ico" style="--brand:${l.color};--icon:url(assets/icons/${l.icon}.svg)" aria-hidden="true"></span>
      <b>${esc(l.name)}</b>
    </a>`).join("");

  /* ---------- Panel glow follows the cursor ---------- */
  document.addEventListener("pointermove", e => {
    const c = e.target.closest(".panel"); if (!c) return;
    const r = c.getBoundingClientRect();
    c.style.setProperty("--mx", `${e.clientX - r.left}px`); c.style.setProperty("--my", `${e.clientY - r.top}px`);
  });

  /* ---------- Scroll reveal ---------- */
  const revealer = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("is-visible"); revealer.unobserve(e.target); }
  }), { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
  $$(".reveal").forEach(el => revealer.observe(el));

  /* ---------- Start the weather visuals ---------- */
  WX.mountAll();
})();
