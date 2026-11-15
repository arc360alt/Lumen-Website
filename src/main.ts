import '@fontsource-variable/inter';
import './style.css';
import { DOWNLOAD_URL, DOWNLOAD_API, TRY_URL, LIQUID_REPO, drop, featureGroups, shots, terminalScript } from './content';

const $ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector(sel) as T;
const el = (html: string) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild as HTMLElement; };
const mobile = () => matchMedia('(max-width: 760px)').matches;
const shotUrl = (n: string) => `${import.meta.env.BASE_URL}shots/${n}.png`;
const dark = matchMedia('(prefers-color-scheme: dark)');

/* ---------------------------------------------------------------- wallpaper */
// Layered, softly shaded waves (in the spirit of LiquidDesktop's procedural "Lagoon").
function paintWallpaper() {
  const c = $<HTMLCanvasElement>('#wallpaper');
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const w = innerWidth, h = innerHeight;
  c.width = w * dpr; c.height = h * dpr;
  const g = c.getContext('2d')!;
  g.scale(dpr, dpr);
  const night = dark.matches;
  const sky = night ? ['#0b1a3f', '#0a2259', '#06143a'] : ['#8ec5ff', '#3d7fe0', '#1d4fb8'];
  const waves = night
    ? ['#2b5bbf', '#1f47a3', '#173a8c', '#102c70', '#0b1f55', '#06133a']
    : ['#7fd1ff', '#4aa3f5', '#2f7be6', '#1f5fd0', '#1640a8', '#0e2c80'];
  const bg = g.createLinearGradient(0, 0, 0, h);
  sky.forEach((s, i) => bg.addColorStop(i / (sky.length - 1), s));
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  const glow = g.createRadialGradient(w * 0.72, h * 0.3, 0, w * 0.72, h * 0.3, Math.max(w, h) * 0.55);
  glow.addColorStop(0, night ? 'rgba(93,140,255,.45)' : 'rgba(216,241,255,.85)');
  glow.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = glow; g.fillRect(0, 0, w, h);
  waves.forEach((col, i) => {
    const base = h * (0.38 + i * 0.1), amp = h * (0.05 + i * 0.008), f = (1.2 + i * 0.35) / w * Math.PI * 2, ph = i * 1.7;
    g.beginPath(); g.moveTo(0, h);
    for (let x = 0; x <= w + 8; x += 8) g.lineTo(x, base + Math.sin(x * f + ph) * amp + Math.sin(x * f * 0.37 + ph * 2) * amp * 0.6);
    g.lineTo(w, h); g.closePath();
    const lg = g.createLinearGradient(0, base - amp, 0, base + h * 0.3);
    lg.addColorStop(0, col); lg.addColorStop(1, waves[Math.min(i + 2, waves.length - 1)]);
    g.fillStyle = lg; g.shadowColor = 'rgba(0,0,0,.18)'; g.shadowBlur = 30; g.shadowOffsetY = -6;
    g.fill();
  });
}

/* ---------------------------------------------------------------- apps */
interface App { id: string; name: string; icon: string; w: number; h: number; render: (win: HTMLElement) => HTMLElement; cls?: string; href?: string }

const ico = (bg: string, svg: string) => `<span class="ico" style="background:${bg}">${svg}</span>`;
const sv = (d: string, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${extra}>${d}</svg>`;

const apps: App[] = [
  { id: 'welcome', name: 'Welcome', w: 660, h: 520, icon: ico('linear-gradient(#fff,#e6eefa)', drop), render: welcome },
  { id: 'features', name: 'Features', w: 820, h: 560, icon: ico('linear-gradient(#a1a1aa,#5a5a62)', sv('<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>')), render: features },
  { id: 'gallery', name: 'Screenshots', w: 760, h: 560, cls: 'win-dark-chrome', icon: ico('linear-gradient(#ffd36b,#ff8a3d)', sv('<rect x="3.5" y="5" width="17" height="14" rx="2.5"/><circle cx="9" cy="10" r="1.6"/><path d="m4 17 5-4.5 4 3.5 3-2.5 4 3.5"/>')), render: gallery },
  { id: 'terminal', name: 'Terminal', w: 640, h: 360, cls: 'win-terminal', icon: ico('linear-gradient(#3a3a40,#0d0d10)', sv('<path d="m6 8 4 4-4 4M12.5 16.5H18"/>')), render: terminal },
  { id: 'download', name: 'Download', w: 600, h: 620, icon: ico('linear-gradient(#5ac8fa,#0a6cff)', sv('<path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19.5h14"/>')), render: download },
  { id: 'try', name: 'Try LiquidDesktop', w: 0, h: 0, href: TRY_URL, icon: ico('linear-gradient(#34d3ff,#2a6cf0)', sv('<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.6 2.6 2.6 14.4 0 17M12 3.5c-2.6 2.6-2.6 14.4 0 17"/>')), render: () => el('<div/>') },
];
const appById = (id: string) => apps.find((a) => a.id === id)!;

/* ---------------------------------------------------------------- window manager */
const open = new Map<string, HTMLElement>();
let z = 10;
let active = '';

function focus(id: string) {
  const win = open.get(id); if (!win) return;
  win.style.zIndex = String(++z);
  open.forEach((w) => w.classList.toggle('inactive', w !== win));
  active = id;
  $('#mb-app').textContent = mobile() ? 'Lumen' : appById(id).name;
}

function placement(app: App, i: number) {
  const top = 44, bottom = 100;
  const w = Math.min(app.w, innerWidth - 32), h = Math.min(app.h, innerHeight - top - bottom);
  const spots: Record<string, [number, number]> = { features: [0.04, 0], gallery: [0.96, 0.22], terminal: [0.08, 0.9], download: [0.5, 0.4], welcome: [0.5, 0.45] };
  const [fx, fy] = spots[app.id] ?? [0.5, 0.5];
  const x = (innerWidth - w) * fx + i * 0, y = top + (innerHeight - top - bottom - h) * fy;
  return { x: Math.max(8, x), y: Math.max(top, y), w, h };
}

function openApp(id: string) {
  const app = appById(id);
  if (app.href) { window.open(app.href, '_blank', 'noopener'); return; }
  let win = open.get(id);
  if (win) {
    win.classList.remove('minimized');
    focus(id);
    if (mobile()) win.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  const p = placement(app, open.size);
  win = el(`<section class="win ${app.cls ?? ''} opening" data-app="${id}" aria-label="${app.name}">
    <div class="win-bar">
      <div class="lights"><button class="l-close" aria-label="Close"></button><button class="l-min" aria-label="Minimize"></button><button class="l-max" aria-label="Zoom"></button></div>
      <div class="win-title">${app.name}</div>
    </div>
    <div class="win-body"></div>
  </section>`);
  Object.assign(win.style, { left: p.x + 'px', top: p.y + 'px', width: p.w + 'px', height: p.h + 'px' });
  win.querySelector('.win-body')!.append(app.render(win));
  applyDownload(win);
  $('#desktop').append(win);
  open.set(id, win);
  setTimeout(() => win!.classList.remove('opening'), 400);
  wireWindow(win, id);
  focus(id);
  syncDock();
  if (mobile()) win.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeApp(id: string) {
  const win = open.get(id); if (!win) return;
  win.classList.add('closing');
  open.delete(id);
  setTimeout(() => win.remove(), 220);
  syncDock();
  const next = [...open.entries()].filter(([, w]) => !w.classList.contains('minimized')).sort((a, b) => +b[1].style.zIndex - +a[1].style.zIndex)[0];
  if (next) focus(next[0]); else $('#mb-app').textContent = 'Lumen';
}

function minimizeApp(id: string) {
  const win = open.get(id); if (!win) return;
  const icon = $(`#dock [data-app="${id}"]`).getBoundingClientRect(), r = win.getBoundingClientRect();
  win.style.setProperty('--gx', `${icon.left + icon.width / 2 - (r.left + r.width / 2)}px`);
  win.style.setProperty('--gy', `${icon.top - (r.top + r.height / 2)}px`);
  win.classList.add('minimized');
}

function wireWindow(win: HTMLElement, id: string) {
  win.addEventListener('pointerdown', () => focus(id));
  $('.l-close', win).onclick = () => closeApp(id);
  $('.l-min', win).onclick = () => minimizeApp(id);
  $('.l-max', win).onclick = () => win.classList.toggle('max');
  const bar = $('.win-bar', win);
  bar.ondblclick = (e) => { if (!(e.target as HTMLElement).closest('button')) win.classList.toggle('max'); };
  bar.addEventListener('pointerdown', (e) => {
    if (mobile() || (e.target as HTMLElement).closest('button,a,input') || win.classList.contains('max')) return;
    const sx = e.clientX - win.offsetLeft, sy = e.clientY - win.offsetTop;
    bar.setPointerCapture(e.pointerId);
    win.classList.add('dragging');
    const move = (ev: PointerEvent) => {
      win.style.left = Math.min(innerWidth - 80, Math.max(80 - win.offsetWidth, ev.clientX - sx)) + 'px';
      win.style.top = Math.min(innerHeight - 60, Math.max(32, ev.clientY - sy)) + 'px';
    };
    const up = () => { bar.removeEventListener('pointermove', move); win.classList.remove('dragging'); };
    bar.addEventListener('pointermove', move);
    bar.addEventListener('pointerup', up, { once: true });
  });
}

/* ---------------------------------------------------------------- dock */
function buildDock() {
  const dock = $('#dock');
  apps.forEach((a, i) => {
    if (i === apps.length - 1) dock.append(el('<span class="dock-sep"></span>'));
    const b = el(`<button class="dock-item" data-app="${a.id}" aria-label="${a.name}">${a.icon}<span class="tip">${a.name}${a.href ? ' ↗' : ''}</span><span class="dot"></span></button>`);
    b.onclick = () => {
      b.classList.remove('bounce'); void b.offsetWidth; b.classList.add('bounce');
      const win = open.get(a.id);
      if (win && active === a.id && !win.classList.contains('minimized') && !mobile()) minimizeApp(a.id); else openApp(a.id);
    };
    dock.append(b);
  });
  dock.append(el('<span class="dock-sep"></span>'));
  dock.append(el(`<a class="dock-cta" href="${DOWNLOAD_URL}" data-dl target="_blank" rel="noopener">${sv('<path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19.5h14"/>')}Download Lumen</a>`));
}
function syncDock() { document.querySelectorAll<HTMLElement>('.dock-item').forEach((b) => b.classList.toggle('running', open.has(b.dataset.app!))); }

/* ---------------------------------------------------------------- menubar */
type Item = { label: string; act: () => void } | '-';
const menus: Record<string, Item[]> = {
  Lumen: [{ label: 'About Lumen', act: () => openApp('welcome') }, '-', { label: 'Download Lumen…', act: () => openApp('download') }, { label: 'Try LiquidDesktop in the browser ↗', act: () => openApp('try') }],
  Go: [{ label: 'Features', act: () => openApp('features') }, { label: 'Screenshots', act: () => openApp('gallery') }, { label: 'Terminal', act: () => openApp('terminal') }],
  Window: [{ label: 'Minimize', act: () => active && minimizeApp(active) }, { label: 'Zoom', act: () => open.get(active)?.classList.toggle('max') }, '-', { label: 'Open All Windows', act: () => apps.filter((a) => !a.href).forEach((a) => openApp(a.id)) }, { label: 'Close All Windows', act: () => [...open.keys()].forEach(closeApp) }],
  Help: [{ label: 'LiquidDesktop on GitHub ↗', act: () => window.open(LIQUID_REPO, '_blank', 'noopener') }, { label: 'arc360alt on GitHub ↗', act: () => window.open('https://github.com/arc360alt', '_blank', 'noopener') }],
};

function buildMenubar() {
  const mb = $('#menubar');
  mb.innerHTML = `<div class="mb-left"><button class="mb-item mb-logo" data-menu="Lumen" aria-label="Lumen menu">${drop}</button><span class="mb-item mb-app" id="mb-app">Lumen</span></div><div class="mb-right"><a class="mb-item" href="${TRY_URL}" target="_blank" rel="noopener">Live demo</a><span class="mb-item" id="mb-clock"></span></div>`;
  const left = $('.mb-left', mb);
  Object.keys(menus).slice(1).forEach((m) => left.append(el(`<button class="mb-item mb-menu" data-menu="${m}">${m}</button>`)));
  let openMenu: HTMLElement | null = null;
  const closeMenu = () => { openMenu?.remove(); openMenu = null; mb.querySelectorAll('.on').forEach((n) => n.classList.remove('on')); };
  mb.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-menu]'); if (!btn) return;
    e.stopPropagation();
    const was = btn.classList.contains('on'); closeMenu(); if (was) return;
    btn.classList.add('on');
    const r = btn.getBoundingClientRect();
    openMenu = el('<div class="menu glass" role="menu"></div>');
    menus[btn.dataset.menu!].forEach((it) => {
      if (it === '-') { openMenu!.append(el('<hr>')); return; }
      const b = el(`<button role="menuitem">${it.label}</button>`); b.onclick = () => { closeMenu(); it.act(); }; openMenu!.append(b);
    });
    openMenu.style.left = Math.min(r.left, innerWidth - 260) + 'px';
    document.body.append(openMenu);
  });
  addEventListener('pointerdown', (e) => { if (openMenu && !(e.target as HTMLElement).closest('.menu,#menubar')) closeMenu(); });
  const tick = () => { $('#mb-clock').textContent = new Date().toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).replace(/,/g, ''); };
  tick(); setInterval(tick, 15000);
}

/* ---------------------------------------------------------------- window contents */
function welcome() {
  const n = el(`<div class="welcome">
    <div class="hero-drop">${drop}</div>
    <h1>Lumen</h1>
    <p class="tag">Arch Linux, poured into glass.</p>
    <p class="lede">Lumen is Arch Linux with <b>LiquidDesktop</b>, a Liquid Glass desktop written from scratch in HTML and JavaScript. Flathub, a login screen that matches the desktop, and a friendly installer are already set up.</p>
    <div class="cta-row">
      <a class="btn primary" href="${DOWNLOAD_URL}" data-dl target="_blank" rel="noopener">Download Lumen</a>
      <a class="btn" href="${TRY_URL}" target="_blank" rel="noopener">Try LiquidDesktop in your browser ↗</a>
    </div>
    <div class="chips"><button data-go="features">Explore features →</button><button data-go="gallery">See screenshots →</button><button data-go="terminal">Build it yourself →</button></div>
    <p class="fine">Based on Arch Linux · x86_64 · UEFI &amp; legacy BIOS</p>
  </div>`);
  n.querySelectorAll<HTMLElement>('[data-go]').forEach((b) => (b.onclick = () => openApp(b.dataset.go!)));
  return n;
}

function features() {
  const n = el(`<div class="settings"><aside class="side glass-side"></aside><div class="pane"></div></div>`);
  const side = $('.side', n), pane = $('.pane', n);
  const show = (id: string) => {
    const g = featureGroups.find((f) => f.id === id)!;
    side.querySelectorAll('button').forEach((b) => b.classList.toggle('sel', b.dataset.id === id));
    pane.innerHTML = `<div class="pane-head"><span class="tile big" style="background:${g.color}">${g.glyph}</span><h2>${g.name}</h2><p>${g.blurb}</p></div>
      <div class="group">${g.items.map((it) => `<div class="row"><b>${it.title}</b><span>${it.body}</span></div>`).join('')}</div>`;
    pane.scrollTop = 0;
  };
  featureGroups.forEach((g) => {
    const b = el(`<button data-id="${g.id}"><span class="tile" style="background:${g.color}">${g.glyph}</span>${g.name}</button>`);
    b.onclick = () => show(g.id); side.append(b);
  });
  show('lumen');
  return n;
}

function gallery() {
  let i = 0;
  const n = el(`<div class="gallery"><figure><button class="nav prev" aria-label="Previous">‹</button><img alt=""><button class="nav next" aria-label="Next">›</button><figcaption></figcaption></figure><div class="thumbs"></div></div>`);
  const img = $<HTMLImageElement>('img', n), cap = $('figcaption', n), thumbs = $('.thumbs', n);
  const show = (k: number) => {
    i = (k + shots.length) % shots.length;
    img.src = shotUrl(shots[i].src); img.alt = shots[i].caption; cap.textContent = shots[i].caption;
    thumbs.querySelectorAll('img').forEach((t, j) => t.classList.toggle('sel', j === i));
  };
  shots.forEach((s, j) => { const t = el(`<img src="${shotUrl(s.src)}" alt="${s.caption}" loading="lazy">`); t.onclick = () => show(j); thumbs.append(t); });
  $('.prev', n).onclick = () => show(i - 1);
  $('.next', n).onclick = () => show(i + 1);
  img.onclick = () => show(i + 1);
  addEventListener('keydown', (e) => { if (active !== 'gallery') return; if (e.key === 'ArrowRight') show(i + 1); if (e.key === 'ArrowLeft') show(i - 1); });
  show(0);
  return n;
}

function terminal() {
  const n = el(`<pre class="term" tabindex="0" title="Click to replay"></pre>`);
  let run = 0;
  const play = async () => {
    const me = ++run; n.innerHTML = '';
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    for (const [p, text] of terminalScript) {
      if (me !== run) return;
      const line = el(`<div><span class="p">${p}</span><span class="t"></span></div>`);
      if (p === '# ') line.classList.add('cmt'); else if (!p) line.classList.add('out');
      n.append(line);
      const t = $('.t', line);
      if (p === '$ ') { for (const ch of text) { if (me !== run) return; t.textContent += ch; await sleep(14 + Math.random() * 30); } await sleep(350); }
      else { t.textContent = text; await sleep(260); }
      n.scrollTop = n.scrollHeight;
    }
    n.append(el('<div><span class="p">$ </span><span class="cursor"></span></div>'));
  };
  n.onclick = play;
  setTimeout(play, 300);
  return n;
}

function download() {
  return el(`<div class="store">
    <div class="store-head">
      <div class="app-ico">${drop}</div>
      <div><h2>Lumen</h2><p>Arch Linux · LiquidDesktop</p><a class="btn primary get" href="${DOWNLOAD_URL}" data-dl target="_blank" rel="noopener">Download ISO</a><p class="dl-meta fine">Checking for the latest build…</p></div>
    </div>
    <div class="facts"><div><small>Version</small><b class="dl-version">…</b></div><div><small>Arch</small><b>x86_64</b></div><div><small>Boot</small><b>UEFI · BIOS</b></div><div><small>Apps</small><b>Flathub</b></div></div>
    <h3>Getting started</h3>
    <ol class="steps">
      <li><b>Download the ISO</b><span>Then write it to a USB stick with Ventoy, Fedora Media Writer or <code>dd</code>.</span></li>
      <li><b>Boot it</b><span>You're logged straight into LiquidDesktop and <i>Install Lumen</i> opens. If you need them, the live login is <code>lumen</code> / <code>lumen</code>.</span></li>
      <li><b>Install</b><span>Choose a language, time zone, keyboard and disk, create your account, and you're done. No internet needed.</span></li>
      <li><b>Update</b><span>You may need to update the OS when its installed, as I'm not rebuilding the .ISO every time an update to the destktop or OS is made.</span></li>
    </ol>
    <p class="fine">Not ready to switch? <a href="${TRY_URL}" target="_blank" rel="noopener">Try LiquidDesktop in your browser</a> or <a href="${LIQUID_REPO}" target="_blank" rel="noopener">install it on your current distro</a>.</p>
  </div>`);
}

/* ---------------------------------------------------------------- download API */
// GET DOWNLOAD_API → { available, version, fileName, downloadUrl, size }
interface Latest { available: boolean; version?: string; fileName?: string; downloadUrl?: string; size?: number }
type DlState = { kind: 'loading' } | { kind: 'ready'; info: Latest } | { kind: 'unavailable' } | { kind: 'error' };
let dl: DlState = { kind: 'loading' };
const fmtSize = (b?: number) => (b ? `${(b / 1024 ** 3).toFixed(1)} GB` : '');

function applyDownload(root: ParentNode = document) {
  const ready = dl.kind === 'ready' ? dl.info : null;
  root.querySelectorAll<HTMLAnchorElement>('[data-dl]').forEach((a) => {
    a.href = ready?.downloadUrl ?? DOWNLOAD_URL;
    a.classList.toggle('soon', dl.kind === 'unavailable');
    // a direct ISO link downloads in place; the GitHub fallback opens in a new tab
    if (ready) { a.removeAttribute('target'); a.setAttribute('download', ready.fileName ?? ''); }
    else { a.target = '_blank'; a.removeAttribute('download'); }
    if (dl.kind === 'unavailable' && !a.dataset.label) { a.dataset.label = a.lastChild!.textContent!; a.lastChild!.textContent = 'ISO coming soon'; }
    if (dl.kind !== 'unavailable' && a.dataset.label) { a.lastChild!.textContent = a.dataset.label; delete a.dataset.label; }
    a.title = ready ? `${ready.fileName} · ${fmtSize(ready.size)}` : dl.kind === 'unavailable' ? 'No ISO yet: follow progress on GitHub' : '';
  });
  root.querySelectorAll<HTMLElement>('.dl-meta').forEach((m) => {
    m.textContent = ready ? `${ready.fileName} · ${fmtSize(ready.size)}`
      : dl.kind === 'unavailable' ? 'No ISO is available right now. Check back soon.'
      : dl.kind === 'error' ? 'Couldn’t reach the download server. The button opens GitHub instead.'
      : 'Checking for the latest build…';
  });
  root.querySelectorAll<HTMLElement>('.dl-version').forEach((v) => (v.textContent = ready?.version ?? '—'));
}

async function loadLatest() {
  try {
    const res = await fetch(DOWNLOAD_API, { cache: 'no-store' });
    if (!res.ok) throw new Error(String(res.status));
    const info = (await res.json()) as Latest;
    dl = info.available && info.downloadUrl ? { kind: 'ready', info } : { kind: 'unavailable' };
  } catch {
    dl = { kind: 'error' };
  }
  applyDownload();
}

/* ---------------------------------------------------------------- boot */
buildMenubar();
loadLatest();
buildDock();
paintWallpaper();
let rz = 0;
addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(paintWallpaper); });
dark.addEventListener('change', paintWallpaper);
(mobile() ? ['welcome', 'features', 'gallery', 'terminal', 'download'] : ['features', 'gallery', 'welcome']).forEach((id, k) => setTimeout(() => openApp(id), mobile() ? 0 : 120 * k));
if (mobile()) setTimeout(() => scrollTo(0, 0), 50);
