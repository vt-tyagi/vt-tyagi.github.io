/*
  Weather visualisations used across the site.
  Everything here is a synthetic, illustrative simulation — not real radar data.
*/
const WX = (() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const TAU = Math.PI * 2, DEG = Math.PI / 180;

  /* ---------- Colour scales ---------- */
  // NWS base reflectivity scale (dBZ)
  const DBZ = [[5, "#04e9e7"], [10, "#019ff4"], [15, "#0300f4"], [20, "#02fd02"], [25, "#01c501"], [30, "#008e00"],
    [35, "#fdf802"], [40, "#e5bc00"], [45, "#fd9500"], [50, "#fd0000"], [55, "#d40000"], [60, "#bc0000"],
    [65, "#f800fd"], [70, "#9854c6"]];
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const DBZ_RGB = DBZ.map(([v, c]) => [v, hex(c)]);
  const dbzRGB = z => {
    if (z < 5) return null;
    let c = DBZ_RGB[0][1];
    for (const [v, rgb] of DBZ_RGB) { if (z >= v) c = rgb; else break; }
    return c;
  };
  // Doppler velocity: green = toward the radar, red = away
  const velRGB = v => {
    if (Math.abs(v) < 1) return [105, 115, 125];
    const a = Math.min(Math.abs(v) / 25, 1);
    return v < 0 ? [10, (70 + 185 * a) | 0, (40 + 50 * a) | 0] : [(90 + 165 * a) | 0, 25, (35 + 20 * (1 - a)) | 0];
  };
  // Wind speed (Windy-style)
  const WIND = ["#3b6fd8", "#1fb5c9", "#3ccf7a", "#c6e04a", "#f5b83d", "#f0643a"];

  /* ---------- Noise ---------- */
  const makeNoise = () => {
    const N = 64, g = new Float32Array(N * N).map(Math.random);
    const at = (i, j) => g[(((j % N) + N) % N) * N + (((i % N) + N) % N)];
    const s = t => t * t * (3 - 2 * t);
    const n = (x, y) => {
      const xi = Math.floor(x), yi = Math.floor(y), xf = s(x - xi), yf = s(y - yi);
      const a = at(xi, yi), b = at(xi + 1, yi), c = at(xi, yi + 1), d = at(xi + 1, yi + 1);
      return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
    };
    return (x, y) => n(x, y) * 0.55 + n(x * 2.03 + 7, y * 2.03) * 0.3 + n(x * 4.1, y * 4.1 + 3) * 0.15;
  };
  const fbm = makeNoise(), fbm2 = makeNoise();

  /* ---------- Synthetic storm (normalised coords, radar at 0,0, radius 1) ---------- */
  const cells = [];
  for (let i = 0; i < 7; i++) cells.push({ x: -0.95 + i * 0.24 + Math.random() * 0.08, y: 0.45 - i * 0.2 + Math.random() * 0.1, r: 0.07 + Math.random() * 0.06, peak: 52 + Math.random() * 18 });
  for (let i = 0; i < 6; i++) cells.push({ x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, r: 0.05 + Math.random() * 0.05, peak: 30 + Math.random() * 20 });
  const DRIFT = [0.014, -0.009];
  const wrap = v => ((v + 1.3) % 2.6 + 2.6) % 2.6 - 1.3;

  function dbzAt(x, y, t) {
    const mx = x - DRIFT[0] * t, my = y - DRIFT[1] * t;
    // Domain warp so cells look ragged rather than circular
    const wx = x + (fbm(mx * 3 + 11, my * 3) - 0.5) * 0.32, wy = y + (fbm(mx * 3, my * 3 + 17) - 0.5) * 0.32;
    let z = 0;
    for (const c of cells) {
      const dx = wx - wrap(c.x + DRIFT[0] * t), dy = wy - wrap(c.y + DRIFT[1] * t);
      // stretch cells along the squall-line axis
      const a = (dx * 0.8 - dy * 0.6), b = (dx * 0.6 + dy * 0.8);
      const d2 = (a * a * 0.55 + b * b * 1.6) / (c.r * c.r);
      if (d2 < 12) z = Math.max(z, c.peak * Math.exp(-d2 * 0.45));
    }
    z *= 0.7 + 0.45 * fbm(mx * 6, my * 6);
    // Trailing stratiform rain, kept patchy and weak
    const strat = (fbm(mx * 2.2 + 20, my * 2.2) - 0.55) * 95;
    return Math.max(z, Math.min(strat, 32));
  }
  // Static ground clutter near the radar, plus a "ridge" to the south-west
  function clutterAt(x, y) {
    const r = Math.hypot(x, y);
    if (r > 0.45) return 0;
    const az = Math.atan2(x, -y);
    const ridge = r > 0.15 && r < 0.42 ? Math.exp(-((az + 2.3) ** 2) / 0.12) : 0;
    const v = (fbm2(x * 22, y * 22) - 0.5) * 3 + Math.max(0, 1 - r / 0.18) * 1.2 + ridge * 0.9;
    return v > 0.55 ? 35 + Math.min(v, 1.5) * 18 : 0;
  }
  // Environmental wind + a mesocyclone embedded in one of the line cells
  const meso = cells[3];
  function windAt(x, y, t) {
    let u = 13, v = -9;
    const dx = x - wrap(meso.x + DRIFT[0] * t), dy = y - wrap(meso.y + DRIFT[1] * t);
    const d2 = dx * dx + dy * dy, a = 0.07, k = 20 * 2 * a / (d2 + a * a);
    u += -dy * k; v += dx * k;
    return [u, v];
  }
  function paintPixel(data, i, x, y, t, o) {
    const z = dbzAt(x, y, t), cl = o.qc ? 0 : clutterAt(x, y);
    let rgb;
    if (o.product === "vel") {
      if (Math.max(z, cl) < 12) rgb = null;
      else if (cl > z) rgb = velRGB(0);
      else { const [u, v] = windAt(x, y, t), r = Math.hypot(x, y) || 1; rgb = velRGB((u * x + v * y) / r); }
    } else rgb = dbzRGB(Math.max(z, cl));
    const p = i * 4;
    if (!rgb) { data[p + 3] = 0; return; }
    data[p] = rgb[0]; data[p + 1] = rgb[1]; data[p + 2] = rgb[2]; data[p + 3] = 235;
  }

  /* ---------- Radar scope face (rings, ticks, labels) ---------- */
  function face(ctx, W, src, angle) {
    const c = W / 2, R = W / 2 - 6;
    ctx.clearRect(0, 0, W, W);
    ctx.fillStyle = "#03111b";
    ctx.beginPath(); ctx.arc(c, c, R, 0, TAU); ctx.fill();
    ctx.save();
    ctx.beginPath(); ctx.arc(c, c, R, 0, TAU); ctx.clip();
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(src, c - R, c - R, 2 * R, 2 * R);
    if (angle != null && ctx.createConicGradient) {
      const a = (angle - 90) * DEG, g = ctx.createConicGradient(a - 0.6, c, c);
      g.addColorStop(0, "rgba(46,230,214,0)");
      g.addColorStop(0.0954, "rgba(46,230,214,.22)");
      g.addColorStop(0.0955, "rgba(46,230,214,0)");
      ctx.fillStyle = g; ctx.fillRect(c - R, c - R, 2 * R, 2 * R);
    }
    ctx.restore();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(170,225,240,.2)";
    for (let k = 1; k <= 3; k++) { ctx.beginPath(); ctx.arc(c, c, (R * k) / 3, 0, TAU); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(c - R, c); ctx.lineTo(c + R, c); ctx.moveTo(c, c - R); ctx.lineTo(c, c + R); ctx.stroke();
    ctx.strokeStyle = "rgba(170,225,240,.5)";
    for (let d = 0; d < 360; d += 10) {
      const t = (d - 90) * DEG, l = d % 30 ? 4 : 9;
      ctx.beginPath(); ctx.moveTo(c + Math.cos(t) * R, c + Math.sin(t) * R);
      ctx.lineTo(c + Math.cos(t) * (R - l), c + Math.sin(t) * (R - l)); ctx.stroke();
    }
    ctx.fillStyle = "rgba(205,238,248,.75)";
    ctx.font = `${W < 300 ? 9 : 10}px "JetBrains Mono", ui-monospace, monospace`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    [["N", 0], ["E", 90], ["S", 180], ["W", 270]].forEach(([s, d]) => {
      const t = (d - 90) * DEG; ctx.fillText(s, c + Math.cos(t) * (R - 18), c + Math.sin(t) * (R - 18));
    });
    ctx.textAlign = "left";
    for (let k = 1; k <= 3; k++) {
      const t = -60 * DEG; ctx.fillText(`${k * 50}`, c + Math.cos(t) * (R * k) / 3 + 4, c + Math.sin(t) * (R * k) / 3 - 2);
    }
    if (angle != null) {
      const a = (angle - 90) * DEG;
      ctx.strokeStyle = "rgba(46,230,214,.95)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(c, c); ctx.lineTo(c + Math.cos(a) * R, c + Math.sin(a) * R); ctx.stroke();
    }
    ctx.fillStyle = "#2ee6d6"; ctx.beginPath(); ctx.arc(c, c, 2.5, 0, TAU); ctx.fill();
    ctx.strokeStyle = "rgba(170,225,240,.4)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(c, c, R, 0, TAU); ctx.stroke();
  }

  const fitCanvas = (cv, h) => {
    const dpr = Math.min(devicePixelRatio || 1, 2), W = cv.clientWidth, H = h ?? cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    const ctx = cv.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return [W, H, ctx];
  };
  // rAF timestamps can be slightly earlier than performance.now(), so never let time run backwards
  const clampDt = (now, last) => Math.max(0, Math.min((now - last) / 1000, 0.05));
  const whenVisible = (el, cb) => new IntersectionObserver(([e]) => cb(e.isIntersecting)).observe(el);

  /* ---------- Live PPI radar scope ---------- */
  function scope(canvas, onTick) {
    const S = 240, off = document.createElement("canvas"); off.width = off.height = S;
    const octx = off.getContext("2d"), img = octx.createImageData(S, S);
    const bins = Array.from({ length: 360 }, () => []), px = new Float32Array(S * S * 2);
    for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) {
      const x = ((i + 0.5) / S) * 2 - 1, y = ((j + 0.5) / S) * 2 - 1, k = j * S + i;
      px[k * 2] = x; px[k * 2 + 1] = y;
      if (x * x + y * y > 1) continue;
      let az = Math.atan2(x, -y) / DEG; if (az < 0) az += 360;
      bins[Math.min(359, az | 0)].push(k);
    }
    const st = { product: "dbz", qc: true, angle: 0, t: 30 };
    const paintBin = b => { for (const k of bins[b]) paintPixel(img.data, k, px[k * 2], px[k * 2 + 1], st.t, st); };
    const paintAll = () => { for (let b = 0; b < 360; b++) paintBin(b); };
    let W = 0, ctx;
    const resize = () => { [W, , ctx] = fitCanvas(canvas, canvas.clientWidth); };
    const draw = () => { octx.putImageData(img, 0, 0); face(ctx, W, off, reduce ? null : st.angle); };
    resize(); paintAll(); draw();
    addEventListener("resize", () => { resize(); draw(); });
    if (!reduce) {
      let last = performance.now(), visible = true;
      whenVisible(canvas, v => visible = v);
      const tick = now => {
        const dt = clampDt(now, last); last = now;
        if (visible && !document.hidden) {
          const prev = Math.floor(st.angle);
          st.angle = (st.angle + dt * 52) % 360; st.t += dt;
          const steps = (Math.floor(st.angle) - prev + 360) % 360;
          for (let s = 1; s <= steps; s++) paintBin((prev + s) % 360);
          draw(); onTick && onTick(st);
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
    return { set(k, v) { st[k] = v; paintAll(); draw(); } };
  }

  /* ---------- Raw vs QC comparison slider ---------- */
  function compare(root) {
    const S = 280, render = qc => {
      const cv = document.createElement("canvas"); cv.width = cv.height = S;
      const c = cv.getContext("2d"), img = c.createImageData(S, S);
      for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) {
        const x = ((i + 0.5) / S) * 2 - 1, y = ((j + 0.5) / S) * 2 - 1;
        if (x * x + y * y <= 1) paintPixel(img.data, j * S + i, x, y, 30, { qc, product: "dbz" });
      }
      c.putImageData(img, 0, 0); return cv;
    };
    const raw = render(false), clean = render(true);
    const before = root.querySelector("[data-before]"), after = root.querySelector("[data-after]");
    const paint = () => {
      const [W1, , c1] = fitCanvas(before, before.clientWidth); face(c1, W1, raw, null);
      const [W2, , c2] = fitCanvas(after, after.clientWidth); face(c2, W2, clean, null);
    };
    paint(); addEventListener("resize", paint);
    // Drag (mouse, pen or touch) anywhere on the scope; the hidden range input keeps keyboard access
    const range = root.querySelector("input"), box = root.querySelector(".compare");
    const set = () => root.style.setProperty("--split", range.value + "%");
    const fromPointer = e => {
      const r = box.getBoundingClientRect();
      range.value = Math.round(Math.min(100, Math.max(0, (e.clientX - r.left) / r.width * 100)));
      set();
    };
    let dragging = false;
    box.addEventListener("pointerdown", e => {
      dragging = true; try { box.setPointerCapture(e.pointerId); } catch (err) {}
      fromPointer(e); e.preventDefault();
    });
    box.addEventListener("pointermove", e => { if (dragging) fromPointer(e); });
    const stop = () => { dragging = false; };
    box.addEventListener("pointerup", stop); box.addEventListener("pointercancel", stop);
    range.addEventListener("input", set); set();
  }

  /* ---------- Wind flow particles ---------- */
  function flow(canvas, o = {}) {
    let W, H, ctx, parts = [], mouse = null, t = Math.random() * 100;
    const seed = Math.random() * 10, density = o.sparse ? 1500 : 700;
    const field = (x, y) => {
      const s = 1 / 220;
      let u = 0.55 + Math.cos(y * s * 1.7 + seed + t * 0.07) * 0.8 + Math.sin((x + y) * s * 0.9 - t * 0.05) * 0.3;
      let v = Math.sin(x * s * 1.3 + seed * 2 - t * 0.06) * 0.7;
      if (mouse) {
        const dx = x - mouse.x, dy = y - mouse.y, d2 = dx * dx + dy * dy, a = 80, k = 2.6 * 2 * a / (d2 + a * a);
        u += -dy * k; v += dx * k;
      }
      return [u * 42, v * 42];
    };
    const spawn = p => { p.x = Math.random() * W; p.y = Math.random() * H; p.age = 0; p.life = 50 + Math.random() * 120; return p; };
    const resize = () => {
      [W, H, ctx] = fitCanvas(canvas);
      parts = Array.from({ length: Math.min(1800, Math.round((W * H) / density)) }, () => spawn({}));
    };
    const step = (dt, fade) => {
      if (fade) {
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = "rgba(0,0,0,0.07)"; ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = "source-over";
      }
      const buckets = WIND.map(() => []);
      for (const p of parts) {
        const [u, v] = field(p.x, p.y), nx = p.x + u * dt, ny = p.y + v * dt;
        buckets[Math.min(5, (Math.hypot(u, v) / 42 / 0.4) | 0)].push(p.x, p.y, nx, ny);
        p.x = nx; p.y = ny;
        if (++p.age > p.life || nx < 0 || ny < 0 || nx > W || ny > H) spawn(p);
      }
      ctx.lineWidth = o.sparse ? 1 : 1.3; ctx.globalAlpha = o.alpha ?? 0.85;
      buckets.forEach((b, i) => {
        if (!b.length) return;
        ctx.strokeStyle = WIND[i]; ctx.beginPath();
        for (let k = 0; k < b.length; k += 4) { ctx.moveTo(b[k], b[k + 1]); ctx.lineTo(b[k + 2], b[k + 3]); }
        ctx.stroke();
      });
      ctx.globalAlpha = 1;
    };
    resize();
    addEventListener("resize", resize);
    if (o.interactive) {
      const host = canvas.parentElement;
      host.addEventListener("pointermove", e => { const r = canvas.getBoundingClientRect(); mouse = { x: e.clientX - r.left, y: e.clientY - r.top }; });
      host.addEventListener("pointerleave", () => mouse = null);
    }
    if (reduce) { for (let i = 0; i < 40; i++) step(1 / 30, false); return; }
    let last = performance.now(), visible = true;
    whenVisible(canvas, v => visible = v);
    const tick = now => {
      const dt = clampDt(now, last); last = now;
      if (visible && !document.hidden) { t += dt; step(dt, true); }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- Z–R relationship: reflectivity → rain rate ---------- */
  function zr(root) {
    const cv = root.querySelector("canvas"), range = root.querySelector("input"), out = k => root.querySelector(`[data-out="${k}"]`);
    let W, H, ctx, drops = [], R = 0, col = "#fff";
    const resize = () => { [W, H, ctx] = fitCanvas(cv); };
    const label = r => r < 1 ? "Drizzle" : r < 2.5 ? "Light rain" : r < 10 ? "Moderate rain" : r < 50 ? "Heavy rain" : "Torrential";
    const update = () => {
      const dbz = +range.value, Z = 10 ** (dbz / 10);
      R = (Z / 200) ** (1 / 1.6); // Marshall–Palmer
      const rgb = dbzRGB(dbz); col = `rgb(${rgb})`;
      out("dbz").textContent = dbz;
      out("r").textContent = R < 10 ? R.toFixed(1) : Math.round(R);
      out("label").textContent = label(R);
      root.style.setProperty("--zr", col);
    };
    const spawn = (d, top) => { d.x = Math.random() * W; d.y = top ? -Math.random() * H : Math.random() * H; d.s = 0.7 + Math.random() * 0.6; return d; };
    const draw = dt => {
      ctx.clearRect(0, 0, W, H);
      const target = Math.min(520, Math.round(8 + R * 6));
      while (drops.length < target) drops.push(spawn({}, drops.length > 10));
      if (drops.length > target) drops.length = target;
      const v = (420 + R * 5), len = 7 + Math.min(R, 100) * 0.18;
      ctx.strokeStyle = col; ctx.globalAlpha = 0.85; ctx.lineWidth = 1.4; ctx.beginPath();
      for (const d of drops) {
        d.y += v * d.s * dt; d.x -= v * d.s * dt * 0.12;
        if (d.y > H) spawn(d, true);
        ctx.moveTo(d.x, d.y); ctx.lineTo(d.x + len * 0.12, d.y - len * d.s);
      }
      ctx.stroke(); ctx.globalAlpha = 1;
    };
    resize(); update();
    addEventListener("resize", resize);
    range.addEventListener("input", update);
    if (reduce) { draw(0); range.addEventListener("input", () => draw(0)); return; }
    let last = performance.now(), visible = true;
    whenVisible(cv, x => visible = x);
    const tick = now => {
      const dt = clampDt(now, last); last = now;
      if (visible && !document.hidden) draw(dt);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- Scatterometer wind barbs with rain contamination ---------- */
  function barb(ctx, x, y, u, v, len) {
    const kt = Math.min(Math.hypot(u, v) * 1.944, 49), ang = Math.atan2(v, u);
    const dx = -Math.cos(ang), dy = -Math.sin(ang), px = -dy, py = dx;
    const ex = x + dx * len, ey = y + dy * len;
    ctx.moveTo(x, y); ctx.lineTo(ex, ey);
    let k = Math.round(kt / 5) * 5, s = 0;
    const bl = len * 0.5, gap = len * 0.2;
    while (k >= 10) { const bx = ex - dx * s, by = ey - dy * s; ctx.moveTo(bx, by); ctx.lineTo(bx + px * bl + dx * bl * 0.35, by + py * bl + dy * bl * 0.35); k -= 10; s += gap; }
    if (k >= 5) { if (s === 0) s = gap; const bx = ex - dx * s, by = ey - dy * s; ctx.moveTo(bx, by); ctx.lineTo(bx + px * bl * 0.5 + dx * bl * 0.18, by + py * bl * 0.5 + dy * bl * 0.18); }
  }
  function scatt(root) {
    const cv = root.querySelector("canvas"), btn = root.querySelector("[data-flag]");
    let W, H, ctx, flag = true, t = 0;
    const rainLow = document.createElement("canvas"), rctx = rainLow.getContext("2d");
    const resize = () => { [W, H, ctx] = fitCanvas(cv); };
    const rainAt = (x, y) => {
      let r = 0;
      const blobs = [[0.62 + Math.sin(t * 0.15) * 0.05, 0.38, 0.11], [0.7, 0.55 + Math.cos(t * 0.12) * 0.04, 0.08], [0.32, 0.7, 0.06]];
      for (const [bx, by, br] of blobs) {
        const dx = x / W - bx, dy = (y / H - by) * (H / W);
        r = Math.max(r, Math.exp(-(dx * dx + dy * dy) / (br * br)));
      }
      return r * (0.7 + 0.5 * fbm(x / 40 + t * 0.1, y / 40));
    };
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      // rain field (low-res, smoothed)
      const gx = Math.ceil(W / 8), gy = Math.ceil(H / 8);
      rainLow.width = gx; rainLow.height = gy;
      const img = rctx.createImageData(gx, gy);
      for (let j = 0; j < gy; j++) for (let i = 0; i < gx; i++) {
        const z = rainAt(i * 8, j * 8) * 55, rgb = dbzRGB(z), p = (j * gx + i) * 4;
        if (rgb && z > 15) { img.data[p] = rgb[0]; img.data[p + 1] = rgb[1]; img.data[p + 2] = rgb[2]; img.data[p + 3] = 95; }
      }
      rctx.putImageData(img, 0, 0);
      ctx.imageSmoothingEnabled = true; ctx.drawImage(rainLow, 0, 0, W, H);
      // wind barbs
      const step = W < 500 ? 30 : 34, cx = W * 0.48, cy = H * 0.52;
      const buckets = WIND.map(() => []), flagged = [];
      for (let y = step / 2; y < H; y += step) for (let x = step / 2; x < W; x += step) {
        const dx = x - cx, dy = y - cy, d2 = dx * dx + dy * dy, a = Math.min(W, H) * 0.28, k = 16 * 2 * a / (d2 + a * a);
        let u = 4 + (-dy) * k * 0.9, v = 1 + dx * k * 0.9;
        const rain = rainAt(x, y);
        if (rain > 0.45) {
          if (flag) { flagged.push(x, y); continue; }
          // Rain contamination: inflated speed, distorted direction
          const sp = Math.hypot(u, v) + 14 * rain, dir = Math.atan2(v, u) + (fbm2(x / 30, y / 30 + t * 0.2) - 0.5) * 3;
          u = Math.cos(dir) * sp; v = Math.sin(dir) * sp;
        }
        buckets[Math.min(5, (Math.hypot(u, v) / 4.5) | 0)].push([x, y, u, v]);
      }
      ctx.lineWidth = 1.4; ctx.lineCap = "round";
      buckets.forEach((b, i) => {
        if (!b.length) return;
        ctx.strokeStyle = WIND[i]; ctx.beginPath();
        for (const [x, y, u, v] of b) barb(ctx, x, y, u, v, step * 0.5);
        ctx.stroke();
      });
      ctx.strokeStyle = "rgba(220,235,245,.55)"; ctx.lineWidth = 1.2; ctx.beginPath();
      for (let i = 0; i < flagged.length; i += 2) {
        const x = flagged[i], y = flagged[i + 1], s = 3.5;
        ctx.moveTo(x - s, y - s); ctx.lineTo(x + s, y + s); ctx.moveTo(x + s, y - s); ctx.lineTo(x - s, y + s);
      }
      ctx.stroke();
    };
    resize(); draw();
    addEventListener("resize", () => { resize(); draw(); });
    btn.addEventListener("click", () => {
      flag = !flag; btn.setAttribute("aria-pressed", flag); btn.classList.toggle("is-on", flag); draw();
    });
    if (reduce) return;
    let last = performance.now(), acc = 0, visible = true;
    whenVisible(cv, x => visible = x);
    const tick = now => {
      const dt = clampDt(now, last); last = now; acc += dt;
      if (visible && !document.hidden && acc > 1 / 15) { t += acc; acc = 0; draw(); }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- Deep-learning nowcast: 4 past frames in → 4 future frames out ---------- */
  function nowcast(root) {
    const inEl = root.querySelector("[data-in]"), outEl = root.querySelector("[data-out]"), obsEl = root.querySelector("[data-obs]");
    const obsRow = root.querySelector("[data-obs-row]"), netCv = root.querySelector("[data-net]"), truthBtn = root.querySelector("[data-truth]");
    const STEP = 7; // storm-clock seconds per 10-minute radar frame
    const mk = (host, labels) => labels.map(l => {
      const f = document.createElement("figure"); f.className = "nc__f";
      f.innerHTML = `<canvas></canvas><figcaption>${l}</figcaption>`; host.appendChild(f); return f;
    });
    const ins = mk(inEl, ["T−30 min", "T−20 min", "T−10 min", "T0 (now)"]);
    const outs = mk(outEl, ["T+10 min", "T+20 min", "T+30 min", "T+40 min"]);
    const obs = mk(obsEl, ["T+10 min", "T+20 min", "T+30 min", "T+40 min"]);
    // Render a Cartesian composite tile; lower resolution + damping mimic how DL nowcasts blur and weaken with lead time
    const tile = (t, res, damp) => {
      const c = document.createElement("canvas"); c.width = c.height = res;
      const x = c.getContext("2d"), img = x.createImageData(res, res);
      for (let j = 0; j < res; j++) for (let i = 0; i < res; i++) {
        const rgb = dbzRGB(dbzAt(-0.7 + 1.4 * (i + 0.5) / res, -0.7 + 1.4 * (j + 0.5) / res, t) * damp), p = (j * res + i) * 4;
        if (rgb) { img.data[p] = rgb[0]; img.data[p + 1] = rgb[1]; img.data[p + 2] = rgb[2]; img.data[p + 3] = 255; }
      }
      x.putImageData(img, 0, 0); return c;
    };
    const canFilter = "filter" in document.createElement("canvas").getContext("2d");
    const paint = (fig, src, blur = 0) => {
      const cv = fig.querySelector("canvas"), [W, H, ctx] = fitCanvas(cv, cv.clientWidth);
      ctx.fillStyle = "#03111b"; ctx.fillRect(0, 0, W, H);
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
      if (blur && canFilter) ctx.filter = `blur(${(blur * W) / 100}px)`;
      ctx.drawImage(src, 0, 0, W, H);
      ctx.filter = "none";
      ctx.strokeStyle = "rgba(170,225,240,.12)"; ctx.lineWidth = 1;
      for (let k = 1; k < 4; k++) { const v = (W * k) / 4; ctx.beginPath(); ctx.moveTo(v, 0); ctx.lineTo(v, H); ctx.moveTo(0, v); ctx.lineTo(W, v); ctx.stroke(); }
    };
    let t0 = 40, tiles = null;
    const build = () => {
      const S = 72;
      tiles = {
        ins: [3, 2, 1, 0].map(k => tile(t0 - k * STEP, S, 1)),
        // where canvas blur isn't supported, a lower-resolution tile stands in for it
        outs: [1, 2, 3, 4].map(k => tile(t0 + k * STEP, canFilter ? S : Math.round(S / (1 + 0.6 * k)), 1 - 0.06 * k)),
        obs: [1, 2, 3, 4].map(k => tile(t0 + k * STEP, S, 1))
      };
    };
    const paintAll = () => {
      ins.forEach((f, i) => paint(f, tiles.ins[i]));
      outs.forEach((f, i) => paint(f, tiles.outs[i], canFilter ? 0.9 + i * 0.9 : 0));
      obs.forEach((f, i) => paint(f, tiles.obs[i]));
    };
    // Encoder → ConvLSTM → decoder schematic
    const LAYERS = [[1, "in"], [0.78, ""], [0.56, "Encoder"], [0.42, "ConvLSTM"], [0.42, ""], [0.56, "Decoder"], [0.78, ""], [1, "out"]];
    const drawNet = p => {
      const [W, H, ctx] = fitCanvas(netCv);
      ctx.clearRect(0, 0, W, H);
      const n = LAYERS.length, gap = W / n, mid = H / 2 - 6, hMax = H - 34;
      const xs = LAYERS.map((_, i) => gap * (i + 0.5));
      ctx.strokeStyle = "rgba(170,225,240,.25)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(xs[0], mid); ctx.lineTo(xs[n - 1], mid); ctx.stroke();
      // skip connections (U-Net)
      ctx.setLineDash([3, 4]);
      [[1, 6], [2, 5]].forEach(([a, b], k) => {
        const y = mid - (hMax * LAYERS[a][0]) / 2 - 4 - k * 2;
        ctx.beginPath(); ctx.moveTo(xs[a], y); ctx.quadraticCurveTo((xs[a] + xs[b]) / 2, y - 14, xs[b], y); ctx.stroke();
      });
      ctx.setLineDash([]);
      const active = p == null ? -1 : p * (n - 1);
      LAYERS.forEach(([s, label], i) => {
        const h = hMax * s, w = Math.max(10, gap * 0.34), glow = active < 0 ? 0 : Math.max(0, 1 - Math.abs(active - i));
        ctx.fillStyle = `rgba(${i === 3 || i === 4 ? "248,0,253" : "46,230,214"},${0.12 + glow * 0.5})`;
        ctx.strokeStyle = `rgba(${i === 3 || i === 4 ? "248,0,253" : "46,230,214"},${0.45 + glow * 0.5})`;
        ctx.beginPath(); ctx.roundRect ? ctx.roundRect(xs[i] - w / 2, mid - h / 2, w, h, 3) : ctx.rect(xs[i] - w / 2, mid - h / 2, w, h);
        ctx.fill(); ctx.stroke();
        if (label) {
          ctx.fillStyle = "#8fb3c6"; ctx.font = '9.5px "JetBrains Mono", monospace'; ctx.textAlign = "center";
          ctx.fillText(label, xs[i] + (i === 3 ? gap / 2 : 0), H - 6);
        }
      });
      if (p != null && p >= 0 && p <= 1) {
        const x = xs[0] + (xs[n - 1] - xs[0]) * p;
        ctx.fillStyle = "#fff"; ctx.shadowColor = "#2ee6d6"; ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.arc(x, mid, 4, 0, TAU); ctx.fill(); ctx.shadowBlur = 0;
      }
    };
    const show = (figs, count) => figs.forEach((f, i) => f.classList.toggle("is-on", i < count));
    truthBtn.addEventListener("click", () => {
      const on = !truthBtn.classList.contains("is-on");
      truthBtn.classList.toggle("is-on", on); truthBtn.setAttribute("aria-pressed", on); obsRow.hidden = !on;
      if (on) paintAll();
    });
    build(); paintAll(); drawNet(null);
    addEventListener("resize", () => { paintAll(); drawNet(null); });
    if (reduce) { show(ins, 4); show(outs, 4); show(obs, 4); return; }
    // Loop: inputs arrive → network runs → predictions appear → hold → roll forward 10 minutes
    let start = null, visible = false;
    whenVisible(root, v => { visible = v; });
    const tick = now => {
      if (visible && !document.hidden) {
        if (start == null) start = now;
        const e = (now - start) / 1000;
        show(ins, Math.min(4, Math.floor(e / 0.45) + 1));
        const p = e < 1.9 ? null : e < 3.5 ? (e - 1.9) / 1.6 : null;
        drawNet(p);
        const nOut = e < 3.5 ? 0 : Math.min(4, Math.floor((e - 3.5) / 0.5) + 1);
        show(outs, nOut); show(obs, nOut);
        if (e > 8) { t0 += STEP; build(); paintAll(); start = now; show(outs, 0); show(obs, 0); }
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- Radar network growing from ~47 to 150+ (schematic) ---------- */
  function network(root) {
    const cv = root.querySelector("canvas"), countEl = root.querySelector("[data-count]"), replay = root.querySelector("[data-replay]");
    const N = 152, NOW = 47;
    // Abstract landmass: a wobbly blob, deliberately not a real map
    const inside = (x, y) => {
      const dx = x - 0.5, dy = (y - 0.5) * 1.1, th = Math.atan2(dy, dx);
      const r = 0.43 * (1 + 0.13 * Math.sin(3 * th + 1) + 0.07 * Math.sin(5 * th - 0.5) + 0.04 * Math.sin(9 * th));
      return Math.hypot(dx, dy) < r;
    };
    // Best-candidate sampling gives evenly spread sites
    const pts = [];
    while (pts.length < N) {
      let best = null, bestD = -1;
      for (let k = 0; k < 14; k++) {
        const x = Math.random(), y = Math.random();
        if (!inside(x, y)) continue;
        const d = pts.reduce((m, p) => Math.min(m, Math.hypot(p[0] - x, p[1] - y)), 1);
        if (d > bestD) { bestD = d; best = [x, y]; }
      }
      if (best) pts.push(best);
    }
    for (let i = pts.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [pts[i], pts[j]] = [pts[j], pts[i]]; }
    let W, H, ctx, p = reduce ? 1 : 0, t0 = null, born = [];
    const resize = () => { [W, H, ctx] = fitCanvas(cv); draw(performance.now()); };
    const draw = now => {
      ctx.clearRect(0, 0, W, H);
      const S = Math.min(W, H), ox = (W - S) / 2, oy = (H - S) / 2;
      ctx.fillStyle = "rgba(160,215,235,.13)";
      for (let y = 0; y < 1; y += 0.022) for (let x = 0; x < 1; x += 0.022) if (inside(x, y)) ctx.fillRect(ox + x * S, oy + y * S, 1.4, 1.4);
      const shown = NOW + Math.round((N - NOW) * (1 - (1 - p) ** 2));
      if (countEl) countEl.textContent = p >= 1 ? "150+" : shown;
      for (let i = 0; i < shown; i++) {
        const [x, y] = pts[i], X = ox + x * S, Y = oy + y * S, old = i < NOW;
        const col = old ? "46,230,214" : "248,0,253";
        if (born[i] == null) born[i] = now;
        const age = Math.min((now - born[i]) / 600, 1);
        ctx.fillStyle = `rgba(${col},${old ? 0.07 : 0.06})`;
        ctx.beginPath(); ctx.arc(X, Y, S * 0.055 * (old ? 1 : age), 0, TAU); ctx.fill();
        if (!old && age < 1) {
          ctx.strokeStyle = `rgba(${col},${0.8 * (1 - age)})`;
          ctx.beginPath(); ctx.arc(X, Y, 3 + age * 18, 0, TAU); ctx.stroke();
        }
        ctx.fillStyle = `rgb(${col})`;
        ctx.beginPath(); ctx.arc(X, Y, old ? 2.6 : 2.2, 0, TAU); ctx.fill();
      }
    };
    // Grow slowly, hold the full network, then start again (loops while on screen)
    const GROW = 6500, HOLD = 3500;
    let visible = false, looping = false;
    const run = now => {
      if (t0 == null) t0 = now;
      if (now - t0 > GROW + HOLD) { t0 = now; born = []; }
      p = Math.min((now - t0) / GROW, 1);
      draw(now);
      if (visible) requestAnimationFrame(run); else looping = false;
    };
    const start = () => {
      if (reduce) return;
      p = 0; t0 = null; born = [];
      if (!looping) { looping = true; requestAnimationFrame(run); }
    };
    resize();
    addEventListener("resize", resize);
    whenVisible(cv, v => { visible = v; if (v && !looping) { looping = true; requestAnimationFrame(run); } });
    replay.addEventListener("click", start);
  }

  /* ---------- One storm, three viewpoints: ground radar vs satellites (pseudo-3D) ---------- */
  function storm3d(root) {
    const cv = root.querySelector("canvas"), btns = [...root.querySelectorAll("[data-sensor]")];
    // Synthetic cumulonimbus as reflectivity voxels: precipitation core + anvil sheared downwind
    const V = [], tops = new Map();
    for (let iz = 0; iz < 18; iz++) for (let iy = -11; iy <= 11; iy++) for (let ix = -10; ix <= 16; ix++) {
      const x = ix * 0.06, y = iy * 0.06, z = 0.02 + iz * 0.05;
      const xc = 0.05 + z * 0.12, r = Math.hypot(x - xc, y * 1.1) / (0.2 + 0.08 * z);
      let d = r < 1 && z < 0.74 ? 22 + 38 * (1 - r * r) * (1 - 0.65 * Math.max(0, z - 0.3) / 0.44) : 0;
      const ra = Math.hypot((x - 0.32) / 0.62, y / 0.48);
      if (ra < 1 && z > 0.66 + 0.08 * ra && z < 0.86) d = Math.max(d, 10 + 14 * (1 - ra * ra));
      if (d < 8) continue;
      const v = { x: x + (Math.random() - 0.5) * 0.025, y: y + (Math.random() - 0.5) * 0.025, z, d };
      const k = ix + "," + iy;
      if (!tops.has(k) || tops.get(k).z < z) tops.set(k, v);
      V.push(v);
    }
    tops.forEach(v => { v.top = true; });
    // Ground radar site, volume scan elevations (as beam slopes, vertically exaggerated)
    const RX = -1.05, RY = 0.45, EL = [0.02, 0.06, 0.11, 0.17, 0.25, 0.35, 0.48, 0.64], SWEEP = 1.1;
    const beamZ = (dist, s) => dist * s + 0.05 * dist * dist; // beam rises with range (Earth curvature, exaggerated)
    V.forEach(v => { v.dist = Math.hypot(v.x - RX, v.y - RY); v.az = Math.atan2(v.y - RY, v.x - RX); });
    // Low-Earth-orbit radar pass (GPM-like swath) and a geostationary imager
    const TRACK = 0.15, HALF = 0.28, PASS = 6.5;
    const hitD = new Uint8Array(V.length), hitL = new Uint8Array(V.length), hitG = new Uint8Array(V.length);
    const order = V.map((_, i) => i), depth = new Float32Array(V.length);
    let W, H, ctx, S, cx, cy, mode = "all", t = 0, last = null, visible = false, lastVol = -1, lastPass = -1;
    let yaw = 0.25, beam = null, satY = -2, scanY = -2;
    const proj = (x, y, z) => {
      const c = Math.cos(yaw), s = Math.sin(yaw), xr = x * c - y * s, yr = x * s + y * c;
      return [cx + xr * S, cy + yr * S * 0.32 - z * S * 0.62, yr];
    };
    const resize = () => {
      [W, H, ctx] = fitCanvas(cv);
      S = Math.min(W / 2.6, H / 1.6); cx = W * 0.5; cy = H * 0.76;
      draw();
    };
    const line = (pts, style, width = 1, dash) => {
      ctx.strokeStyle = style; ctx.lineWidth = width; ctx.setLineDash(dash || []);
      ctx.beginPath(); pts.forEach(([x, y, z], i) => { const [X, Y] = proj(x, y, z); i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }); ctx.stroke();
      ctx.setLineDash([]);
    };
    const poly = (pts, fill) => {
      ctx.fillStyle = fill; ctx.beginPath();
      pts.forEach(([x, y, z], i) => { const [X, Y] = proj(x, y, z); i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }); ctx.closePath(); ctx.fill();
    };
    const label = (X, Y, txt, col) => { ctx.font = "600 10px 'JetBrains Mono', monospace"; ctx.fillStyle = col; ctx.fillText(txt, X, Y); };
    const step = dt => {
      t += dt;
      yaw = 0.25 + 0.4 * Math.sin(t * 0.11);
      // Ground radar: one elevation per SWEEP seconds, short pause, then a fresh volume
      const vol = EL.length * SWEEP + 1.2, tv = t % vol, nVol = Math.floor(t / vol);
      if (nVol !== lastVol) { hitD.fill(0); lastVol = nVol; }
      const ei = Math.floor(tv / SWEEP);
      beam = ei < EL.length ? { s: EL[ei], az: (tv % SWEEP) / SWEEP * TAU - Math.PI } : null;
      // LEO radar: a pass across the scene, then a new pass
      const tp = t % (PASS + 1), nPass = Math.floor(t / (PASS + 1));
      if (nPass !== lastPass) { hitL.fill(0); lastPass = nPass; }
      satY = tp < PASS ? -1.2 + 2.6 * tp / PASS : 9;
      // GEO imager: repeated north-to-south scans of the cloud tops
      scanY = -0.8 + 1.6 * ((t % 3) / 2.2);
      V.forEach((v, i) => {
        if (beam) {
          let da = beam.az - v.az; da -= TAU * Math.floor(da / TAU);
          if (da < 0.3 && Math.abs(v.z - beamZ(v.dist, beam.s)) < 0.018 + 0.03 * v.dist) hitD[i] = 1;
        }
        if (Math.abs(v.x - TRACK) < HALF && v.y < satY && v.z > 0.06) hitL[i] = 1; // nadir clutter hides the lowest levels
        if (v.top && v.y < scanY) hitG[i] = 1;
      });
    };
    const draw = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      const sD = mode === "all" || mode === "dwr", sL = mode === "all" || mode === "leo", sG = mode === "all" || mode === "geo";
      for (let g = -1.2; g <= 1.21; g += 0.3) {
        line([[g, -1.2, 0], [g, 1.2, 0]], "rgba(120,175,205,.13)");
        line([[-1.2, g, 0], [1.2, g, 0]], "rgba(120,175,205,.13)");
      }
      const leoOn = sL && satY < 2;
      if (leoOn) {
        poly([[TRACK - HALF, -1.2, 0], [TRACK + HALF, -1.2, 0], [TRACK + HALF, satY, 0], [TRACK - HALF, satY, 0]], "rgba(248,0,253,.07)");
        poly([[TRACK - HALF, satY, 0], [TRACK + HALF, satY, 0], [TRACK + HALF, satY, 0.95], [TRACK - HALF, satY, 0.95]], "rgba(248,0,253,.06)");
      }
      V.forEach((v, i) => { depth[i] = proj(v.x, v.y, v.z)[2]; });
      order.sort((a, b) => depth[a] - depth[b]);
      for (const i of order) {
        const v = V[i], [X, Y, yr] = proj(v.x, v.y, v.z), sz = S * 0.03 * (1 + yr * 0.12);
        if ((sD && hitD[i]) || (sL && hitL[i])) {
          const c = dbzRGB(v.d); ctx.fillStyle = `rgba(${c},.88)`;
        } else if (sG && hitG[i]) {
          const g = (120 + 135 * v.z / 0.86) | 0; ctx.fillStyle = `rgba(${g},${g},${g},.9)`; // IR: colder (higher) tops are brighter
        } else ctx.fillStyle = "rgba(150,185,205,.11)"; // not observed by the selected sensor(s)
        ctx.fillRect(X - sz / 2, Y - sz / 2, sz, sz);
      }
      if (sD) {
        const [X, Y] = proj(RX, RY, 0);
        ctx.fillStyle = "#2ee6d6"; ctx.fillRect(X - 1.5, Y - 12, 3, 12);
        ctx.beginPath(); ctx.arc(X, Y - 14, 5, 0, TAU); ctx.fill();
        if (beam) {
          // Fan of the sector swept in the last moment, then the beam itself
          const fan = [[RX, RY, 0]];
          for (let k = 0; k <= 6; k++) { const a = beam.az - 0.3 + 0.05 * k; fan.push([RX + 2 * Math.cos(a), RY + 2 * Math.sin(a), beamZ(2, beam.s)]); }
          poly(fan, "rgba(46,230,214,.1)");
          const pts = [];
          for (let r = 0; r <= 2.0; r += 0.1) pts.push([RX + r * Math.cos(beam.az), RY + r * Math.sin(beam.az), beamZ(r, beam.s)]);
          line(pts, "rgba(46,230,214,.85)", 1.6);
        }
        label(Math.max(6, X - 34), Y + 16, "GROUND RADAR", "#2ee6d6");
      }
      if (leoOn) {
        const [X, Y] = proj(TRACK, satY, 1.3);
        line([[TRACK, satY, 1.3], [TRACK - HALF, satY, 0]], "rgba(248,0,253,.5)", 1, [3, 3]);
        line([[TRACK, satY, 1.3], [TRACK + HALF, satY, 0]], "rgba(248,0,253,.5)", 1, [3, 3]);
        ctx.fillStyle = "#f800fd"; ctx.fillRect(X - 5, Y - 4, 10, 8);
        ctx.fillStyle = "rgba(248,0,253,.55)"; ctx.fillRect(X - 19, Y - 2, 12, 4); ctx.fillRect(X + 7, Y - 2, 12, 4);
        label(X + 22, Y + 4, "SATELLITE RADAR", "#f800fd");
      }
      if (sG) {
        const GX = W - 34, GY = 22;
        ctx.fillStyle = "#fdf802"; ctx.fillRect(GX - 5, GY - 4, 10, 8);
        ctx.fillStyle = "rgba(253,248,2,.55)"; ctx.fillRect(GX - 19, GY - 2, 12, 4); ctx.fillRect(GX + 7, GY - 2, 12, 4);
        label(GX - 76, GY + 4, "GEO IMAGER", "#fdf802");
        if (scanY < 0.8) {
          line([[-0.35, scanY, 0.88], [0.95, scanY, 0.88]], "rgba(253,248,2,.55)", 1.4);
          const [X, Y] = proj(0.3, scanY, 0.88);
          ctx.strokeStyle = "rgba(253,248,2,.35)"; ctx.setLineDash([3, 4]);
          ctx.beginPath(); ctx.moveTo(GX, GY + 6); ctx.lineTo(X, Y); ctx.stroke(); ctx.setLineDash([]);
        }
      }
      // Height scale beside the storm (anvil top ≈ 15 km)
      const AX = 0.85, AY = -0.8, KM = 0.86 / 15;
      line([[AX, AY, 0], [AX, AY, 15 * KM]], "rgba(180,210,225,.45)");
      ctx.font = "500 9px 'JetBrains Mono', monospace"; ctx.fillStyle = "rgba(180,210,225,.75)";
      for (const km of [0, 5, 10, 15]) {
        const [X, Y] = proj(AX, AY, km * KM);
        ctx.fillRect(X - 3, Y, 6, 1);
        ctx.textAlign = "right"; ctx.fillText(km + (km === 15 ? " km" : ""), X - 6, Y + 3); ctx.textAlign = "left";
      }
      // Reflectivity colour bar
      const bx = 12, by = H - 18, bw = Math.min(150, W * 0.3);
      for (let i = 0; i < bw; i++) { const c = dbzRGB(10 + 55 * i / bw); ctx.fillStyle = `rgb(${c})`; ctx.fillRect(bx + i, by, 1, 6); }
      ctx.fillStyle = "rgba(180,210,225,.8)";
      ctx.fillText("10", bx, by - 4); ctx.fillText("65 dBZ", bx + bw - 34, by - 4);
    };
    // One line under the figure says what the selected sensor measures
    const hud = root.querySelector("[data-hud]");
    const NOTES = {
      all: ["#d9ecf5", "All sensors:", "each lights up only the part of the storm it measures. Together they complete the picture."],
      dwr: ["#2ee6d6", "Ground radar:", "scans cones at rising angles for a full 3D view, but the beam climbs with range and leaves gaps aloft."],
      leo: ["#f800fd", "Satellite radar (GPM, EarthCARE):", "full vertical profiles along its track, even over oceans, but only when it passes."],
      geo: ["#fdf802", "Geostationary imager (INSAT):", "cloud tops over the whole region every few minutes, but not inside the storm."]
    };
    const setMode = m => {
      mode = m;
      btns.forEach(o => { const on = o.dataset.sensor === m; o.classList.toggle("is-on", on); o.setAttribute("aria-pressed", on); });
      const [c, head, txt] = NOTES[m];
      if (hud) { hud.style.setProperty("--hud", c); hud.innerHTML = `<b>${head}</b> ${txt}`; }
      draw();
    };
    // Guided tour through the sensors until the visitor picks one
    const TOUR = ["dwr", "leo", "geo", "all"];
    let touring = !reduce, tourT = 0, tourI = 3;
    btns.forEach(b => b.addEventListener("click", () => { touring = false; setMode(b.dataset.sensor); }));
    setMode("all");
    resize();
    addEventListener("resize", resize);
    if (reduce) { hitD.fill(1); hitL.fill(1); hitG.fill(1); satY = 9; scanY = 9; draw(); return; }
    whenVisible(cv, v => { visible = v; });
    const tick = now => {
      const dt = last == null ? 0 : clampDt(now, last); last = now;
      if (visible && !document.hidden) {
        if (touring && (tourT += dt) > 9) { tourT = 0; tourI = (tourI + 1) % TOUR.length; setMode(TOUR[tourI]); }
        step(dt); draw();
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- WIVERN: line-of-sight Doppler wind inside a convective storm (side view) ---------- */
  function wivern(root) {
    const cv = root.querySelector("canvas"), out = k => root.querySelector(`[data-w="${k}"]`);
    const TH = 42 * DEG; // beam incidence angle (from vertical)
    // Idealised fields; x and z run 0..1 (z = 1 ≈ 16 km). Speeds in m/s.
    const U = z => -4 + 22 * z;                                         // horizontal wind, sheared with height
    const Wv = (x, z) => z > 0.9 ? 0 :
      16 * Math.exp(-(((x - 0.45) / 0.09) ** 2)) * Math.sin(Math.PI * z / 0.9)  // updraft core
      - 4 * Math.exp(-(((x - 0.6) / 0.06) ** 2)) * (z < 0.45 ? 1 : 0);          // downdraft beside it
    const smooth = (a, b, v) => { const s = Math.min(1, Math.max(0, (v - a) / (b - a))); return s * s * (3 - 2 * s); };
    const dbz = (x, z) => { // soft-edged tower leaning downshear, capped by an anvil
      const tower = 58 * Math.exp(-(((x - 0.45 - 0.08 * z) / (0.1 + 0.04 * z)) ** 2)) * (1 - 0.45 * z) * (1 - smooth(0.7, 0.86, z));
      const anvil = 30 * Math.exp(-(((x - 0.66) / 0.2) ** 4)) * Math.exp(-(((z - 0.74) / 0.06) ** 2));
      return Math.max(tower, anvil);
    };
    const MELT = 0.28; // melting layer: rain below, ice above
    const VT = (x, z) => { const d = dbz(x, z); if (d < 8) return 0; const f = Math.min(1, (d - 8) / 47); return z < MELT ? 2 + 7 * f : 1 + 0.6 * f; };
    let W, H, ctx, img, t = 0, last = null, visible = false, parts = [], satX = -0.1, wasIn = false;
    const X = x => 12 + x * (W - 24), Z = z => H - 18 - z * (H - 64);
    const resize = () => {
      [W, H, ctx] = fitCanvas(cv);
      // Pre-render the storm's reflectivity field once
      const nx = 160, nz = 100; img = document.createElement("canvas"); img.width = nx; img.height = nz;
      const c = img.getContext("2d"), id = c.createImageData(nx, nz);
      for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
        const rgb = dbzRGB(dbz(i / nx, 1 - j / nz)); if (!rgb) continue;
        const k = (j * nx + i) * 4; id.data[k] = rgb[0]; id.data[k + 1] = rgb[1]; id.data[k + 2] = rgb[2]; id.data[k + 3] = 95;
      }
      c.putImageData(id, 0, 0);
      parts = Array.from({ length: 160 }, () => spawn({}));
    };
    function spawn(p) { // hydrometeors start somewhere inside the cloud
      for (let k = 0; k < 40; k++) { p.x = Math.random(); p.z = Math.random() * 0.85; if (dbz(p.x, p.z) > 12) break; }
      return p;
    }
    const arrow = (x0, y0, dx, dy, col, w = 2) => {
      const len = Math.hypot(dx, dy); if (len < 2) return;
      const ux = dx / len, uy = dy / len, x1 = x0 + dx, y1 = y0 + dy;
      ctx.strokeStyle = ctx.fillStyle = col; ctx.lineWidth = w;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - ux * 7 - uy * 4, y1 - uy * 7 + ux * 4); ctx.lineTo(x1 - ux * 7 + uy * 4, y1 - uy * 7 - ux * 4); ctx.closePath(); ctx.fill();
    };
    const txt = (s, x, y, col, align = "left") => { ctx.font = "600 10px 'JetBrains Mono', monospace"; ctx.fillStyle = col; ctx.textAlign = align; ctx.fillText(s, x, y); ctx.textAlign = "left"; };
    const draw = dt => {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      // Ground, melting layer and storm
      ctx.fillStyle = "rgba(120,175,205,.18)"; ctx.fillRect(0, H - 18, W, 18);
      ctx.drawImage(img, X(0), Z(1), X(1) - X(0), Z(0) - Z(1));
      ctx.strokeStyle = "rgba(180,210,225,.4)"; ctx.setLineDash([4, 5]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(X(0), Z(MELT)); ctx.lineTo(X(1), Z(MELT)); ctx.stroke(); ctx.setLineDash([]);
      txt("0 °C", X(0) + 2, Z(MELT) - 4, "rgba(180,210,225,.75)");
      // Horizontal wind profile on the left edge, updraft / downdraft arrows inside the storm
      for (let z = 0.1; z < 0.95; z += 0.12) arrow(X(0.02), Z(z), U(z) * 2.2, 0, "rgba(230,240,248,.55)", 1.5);
      txt("u(z)", X(0.02), Z(0.95), "rgba(230,240,248,.7)");
      for (let z = 0.15; z < 0.8; z += 0.13) for (const x of [0.4, 0.47, 0.6]) {
        const w = Wv(x, z); if (Math.abs(w) > 2) arrow(X(x), Z(z), 0, -w * 2.4, w > 0 ? "rgba(255,154,60,.75)" : "rgba(120,190,255,.7)", 2);
      }
      txt("UPDRAFT", X(0.47), Z(0.86), "rgba(255,154,60,.9)", "center");
      // Hydrometeors move with the air (u, w) and fall at their terminal speed
      const sx = 0.00025, sz = 0.0006; // per frame, per m/s
      for (const p of parts) {
        const vt = VT(p.x, p.z);
        p.x += U(p.z) * sx * dt; p.z += (Wv(p.x, p.z) - vt) * sz * dt;
        if (p.x < 0 || p.x > 1 || p.z < 0 || p.z > 0.9 || dbz(p.x, p.z) < 6) spawn(p);
        ctx.fillStyle = p.z < MELT ? "rgba(90,170,255,.9)" : "rgba(235,245,255,.85)";
        ctx.fillRect(X(p.x) - 1, Z(p.z) - (p.z < MELT ? 3 : 1), 2, p.z < MELT ? 4 : 2);
      }
      // WIVERN flies left → right; its slant beam samples the storm at mid-levels
      // Fly slower while the beam is inside the storm, so the decomposition can be read
      satX += (dt / 60) * (wasIn ? 0.04 : 0.12); if (satX > 0.95) satX = -0.25;
      const Ys = 18;
      const sxp = X(satX), zs = 0.45, Yp = Z(zs), tt = (Yp - Ys) / Math.cos(TH), Xp = sxp + tt * Math.sin(TH);
      const xs = (Xp - 12) / (W - 24);
      ctx.strokeStyle = "rgba(248,0,253,.35)"; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(sxp, Ys); ctx.lineTo(sxp + (H - Ys) / Math.cos(TH) * Math.sin(TH), H); ctx.stroke();
      ctx.fillStyle = "#f800fd"; ctx.fillRect(sxp - 6, Ys - 5, 12, 10);
      ctx.fillStyle = "rgba(248,0,253,.55)"; ctx.fillRect(sxp - 22, Ys - 2, 14, 4); ctx.fillRect(sxp + 8, Ys - 2, 14, 4);
      txt("WIVERN", sxp + 26, Ys + 4, "#f800fd");
      // Decompose the line-of-sight velocity at the sampled point
      const inStorm = xs > 0 && xs < 1 && dbz(xs, zs) > 8; wasIn = inStorm;
      const u = U(zs), w = inStorm ? Wv(xs, zs) : 0, vt = inStorm ? VT(xs, zs) : 0;
      const los = u * Math.sin(TH) - (w - vt) * Math.cos(TH); // positive = away from the satellite
      if (xs > -0.05 && xs < 1.05) {
        const k = 3.2;
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(Xp, Yp, 4, 0, TAU); ctx.fill();
        arrow(Xp, Yp, u * k, 0, "#e6f0f8"); txt("u", Xp + u * k + (u > 0 ? 6 : -12), Yp + 4, "#e6f0f8");
        if (inStorm) {
          arrow(Xp - 10, Yp, 0, -w * k, "#ff9a3c"); txt("w", Xp - 22, Yp - w * k, "#ff9a3c");
          arrow(Xp + 10, Yp, 0, vt * k, "#4fa8ff"); txt("Vt", Xp + 14, Yp + vt * k, "#4fa8ff");
        }
        arrow(Xp, Yp, los * k * Math.sin(TH), los * k * Math.cos(TH), "#f800fd", 3);
      }
      const set = (key, v) => { const e = out(key); if (e) e.textContent = inStorm || key === "u" || key === "los" ? v.toFixed(1) : "—"; };
      set("u", u); set("w", w); set("vt", vt); set("los", los);
    };
    resize(); addEventListener("resize", resize);
    if (reduce) { satX = 0.14; draw(0); return; }
    whenVisible(cv, v => { visible = v; });
    const tick = now => {
      const dt = last == null ? 0 : clampDt(now, last); last = now;
      if (visible && !document.hidden) { t += dt; draw(dt * 60); }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- Mount everything found on the page ---------- */
  function mountAll() {
    document.querySelectorAll("canvas[data-flow]").forEach(cv =>
      flow(cv, { sparse: cv.hasAttribute("data-flow-sparse"), interactive: cv.hasAttribute("data-flow-interactive"), alpha: cv.hasAttribute("data-flow-sparse") ? 0.75 : 0.9 }));
    document.querySelectorAll("[data-compare]").forEach(compare);
    document.querySelectorAll("[data-zr]").forEach(zr);
    document.querySelectorAll("[data-scatt]").forEach(scatt);
    document.querySelectorAll("[data-network]").forEach(network);
    document.querySelectorAll("[data-nowcast]").forEach(nowcast);
    document.querySelectorAll("[data-storm3d]").forEach(storm3d);
    document.querySelectorAll("[data-wivern]").forEach(wivern);
  }

  return { DBZ, WIND, scope, mountAll, dbzRGB };
})();
