const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const canHover = matchMedia("(hover: hover) and (pointer: fine)").matches;

/* ---------- Home: melt the photo and intro as you scroll ---------- */
const hero = document.querySelector(".hero");
const topbar = document.getElementById("topbar");
const melters = [...document.querySelectorAll(".melt")];
let ticking = false;

// Blocks below the home screen melt the same way once their top passes under the top bar
function meltAway() {
  const line = topbar.offsetHeight + 20;
  for (const el of melters) {
    const r = el.getBoundingClientRect();
    const m = Math.min(Math.max((line - r.top) / r.height, 0), 1);
    el.style.setProperty("--m", m.toFixed(4));
  }
}

function onScroll() {
  const range = hero.offsetHeight - innerHeight;
  const p = Math.min(Math.max(scrollY / Math.max(range, 1), 0), 1);
  if (!reduceMotion) { hero.style.setProperty("--p", p.toFixed(4)); meltAway(); }
  topbar.classList.toggle("solid", scrollY > range * 0.85);
  ticking = false;
}
addEventListener("scroll", () => {
  if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
}, { passive: true });
addEventListener("resize", onScroll);
onScroll();

/* ---------- Fade sections in as they arrive ---------- */
const revealer = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) { e.target.classList.add("in"); revealer.unobserve(e.target); }
  }
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((el, i) => {
  // stagger the grid cards a little
  if (el.classList.contains("card")) el.style.transitionDelay = `${(i % 3) * 80}ms`;
  revealer.observe(el);
});

/* ---------- Projects: hover panel on desktop, dialog on tap or Enter ---------- */
const cards = document.querySelectorAll(".card");
const peek = document.getElementById("peek");
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modal-body");
let openTimer, closeTimer, litCard = null;

function detailHTML(card) {
  return `<h3>${card.querySelector("h3").textContent}</h3>${card.querySelector(".detail").innerHTML}`;
}

function openPeek(card) {
  clearTimeout(closeTimer);
  if (litCard && litCard !== card) litCard.classList.remove("lit");
  litCard = card;
  card.classList.add("lit");
  peek.innerHTML = detailHTML(card);

  const r = card.getBoundingClientRect();
  const w = peek.offsetWidth, h = peek.offsetHeight, m = 16;
  const left = Math.min(Math.max(r.left + r.width / 2 - w / 2, m), innerWidth - w - m);
  let top = r.top - 14;
  if (top + h > innerHeight - m) top = Math.max(m, innerHeight - m - h);
  if (top < m) top = m;
  peek.style.left = `${left}px`;
  peek.style.top = `${top}px`;
  peek.style.setProperty("--ox", `${r.left + r.width / 2 - left}px`);
  peek.style.setProperty("--oy", `${r.top - top}px`);
  peek.classList.add("open");
}

function closePeek() {
  clearTimeout(openTimer);
  peek.classList.remove("open");
  if (litCard) { litCard.classList.remove("lit"); litCard = null; }
}

function openModal(card) {
  closePeek();
  modalBody.innerHTML = detailHTML(card);
  modal.showModal();
}

cards.forEach((card) => {
  if (canHover) {
    card.addEventListener("mouseenter", () => {
      clearTimeout(closeTimer);
      openTimer = setTimeout(() => openPeek(card), 110);
    });
    card.addEventListener("mouseleave", () => {
      clearTimeout(openTimer);
      closeTimer = setTimeout(closePeek, 160);
    });
  }
  card.addEventListener("click", (e) => {
    if (e.target.closest("a")) return;
    openModal(card);
  });
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openModal(card); }
  });
});

peek.addEventListener("mouseenter", () => clearTimeout(closeTimer));
peek.addEventListener("mouseleave", () => { closeTimer = setTimeout(closePeek, 120); });
addEventListener("scroll", () => { if (peek.classList.contains("open") && !peek.matches(":hover")) closePeek(); }, { passive: true });

document.getElementById("modal-close").addEventListener("click", () => modal.close());
modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });

/* ---------- About: crossfade the school photos ---------- */
const slides = [...document.querySelectorAll("#slides img")];
const caption = document.getElementById("slide-caption");
const dots = document.getElementById("slide-dots");
let current = 0, slideTimer;

function show(i) {
  slides[current].classList.remove("active");
  dots.children[current].classList.remove("on");
  current = (i + slides.length) % slides.length;
  slides[current].classList.add("active");
  dots.children[current].classList.add("on");
  caption.textContent = slides[current].dataset.caption;
}
function autoplay() {
  clearInterval(slideTimer);
  if (!reduceMotion) slideTimer = setInterval(() => show(current + 1), 4800);
}
slides.forEach((img, i) => {
  const b = document.createElement("button");
  b.setAttribute("aria-label", `Show ${img.dataset.caption}`);
  if (i === 0) b.classList.add("on");
  b.addEventListener("click", () => { show(i); autoplay(); });
  dots.appendChild(b);
});
autoplay();

/* ---------- About: the vault graph ---------- */
const svg = document.getElementById("vault-graph");
const NS = "http://www.w3.org/2000/svg";

const nodes = [
  { id: "sj", label: "Scientia Juria", x: 175, y: 195, type: "hub" },
  { id: "rj", label: "Ratio Juris", x: 320, y: 245, type: "hub" },
  { id: "civ", label: "Civil Law", x: 85, y: 95, type: "subject" },
  { id: "crim", label: "Criminal Law", x: 250, y: 70, type: "subject" },
  { id: "rem", label: "Remedial Law", x: 405, y: 115, type: "subject" },
  { id: "pol", label: "Political Law", x: 415, y: 330, type: "subject" },
  { id: "lab", label: "Labor Law", x: 235, y: 365, type: "subject" },
  { id: "tax", label: "Taxation", x: 70, y: 310, type: "subject" },
  { id: "obl", label: "Oblicon", x: 30, y: 180, type: "note" },
  { id: "pfr", label: "Persons & Family", x: 150, y: 30, type: "note" },
  { id: "crim1", label: "Crim Law I", x: 345, y: 30, type: "note" },
  { id: "civpro", label: "Civil Procedure", x: 455, y: 205, type: "note" },
  { id: "evid", label: "Evidence", x: 470, y: 60, type: "note" },
  { id: "consti", label: "Consti I", x: 470, y: 400, type: "note" },
  { id: "briefs", label: "Case briefs", x: 235, y: 280, type: "note" },
  { id: "doct", label: "Doctrine briefs", x: 365, y: 395, type: "note" },
  { id: "rev", label: "Reviewers", x: 120, y: 245, type: "note" },
  { id: "moc", label: "MOCs", x: 290, y: 155, type: "note" },
];
const links = [
  ["sj", "civ"], ["sj", "crim"], ["sj", "rem"], ["sj", "pol"], ["sj", "lab"], ["sj", "tax"],
  ["sj", "rj"], ["sj", "rev"], ["sj", "moc"], ["sj", "briefs"],
  ["rj", "briefs"], ["rj", "doct"], ["rj", "moc"], ["rj", "civpro"], ["rj", "pol"],
  ["civ", "obl"], ["civ", "pfr"], ["crim", "crim1"], ["rem", "civpro"], ["rem", "evid"],
  ["pol", "consti"], ["pol", "doct"], ["lab", "briefs"], ["tax", "rev"], ["civ", "rev"],
  ["crim", "moc"], ["obl", "rev"],
];

// Unlabeled specks around the edges, each tied to its nearest named note, for texture
let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
for (let i = 0; i < 22; i++) {
  const x = 20 + rand() * 440, y = 20 + rand() * 380;
  const near = nodes.filter((n) => n.type !== "speck")
    .map((n) => ({ n, d: Math.hypot(n.x - x, n.y - y) }))
    .sort((a, b) => a.d - b.d)[0];
  if (near.d < 32) continue;
  const id = `s${i}`;
  nodes.push({ id, label: "", x, y, type: "speck" });
  links.push([near.n.id, id]);
}

const radius = { hub: 9, subject: 6, note: 4, speck: 2.2 };
const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
const neighbours = Object.fromEntries(nodes.map((n) => [n.id, new Set([n.id])]));
links.forEach(([a, b]) => { neighbours[a].add(b); neighbours[b].add(a); });

const lineEls = links.map(([a, b]) => {
  const l = document.createElementNS(NS, "line");
  l.dataset.a = a; l.dataset.b = b;
  svg.appendChild(l);
  return l;
});

nodes.forEach((n, i) => {
  n.phase = i * 1.7;
  n.amp = n.type === "hub" ? 3 : n.type === "speck" ? 6 : 5;
  const g = document.createElementNS(NS, "g");
  g.setAttribute("class", `node ${n.type}`);
  const c = document.createElementNS(NS, "circle");
  c.setAttribute("r", radius[n.type]);
  g.appendChild(c);
  if (n.label) {
    const t = document.createElementNS(NS, "text");
    t.textContent = n.label;
    g.appendChild(t);
    n.text = t;
  }
  n.g = g; n.c = c;
  svg.appendChild(g);

  g.addEventListener("mouseenter", () => {
    svg.classList.add("focus");
    nodes.forEach((m) => m.g.classList.toggle("hot", neighbours[n.id].has(m.id)));
    lineEls.forEach((l) => l.classList.toggle("hot", l.dataset.a === n.id || l.dataset.b === n.id));
  });
  g.addEventListener("mouseleave", () => {
    svg.classList.remove("focus");
    nodes.forEach((m) => m.g.classList.remove("hot"));
    lineEls.forEach((l) => l.classList.remove("hot"));
  });
});

function draw(t) {
  for (const n of nodes) {
    n.cx = n.x + Math.sin(t / 2300 + n.phase) * n.amp;
    n.cy = n.y + Math.cos(t / 2900 + n.phase) * n.amp;
    n.c.setAttribute("cx", n.cx);
    n.c.setAttribute("cy", n.cy);
    if (n.text) {
      n.text.setAttribute("x", n.cx);
      n.text.setAttribute("y", n.cy + radius[n.type] + (n.type === "hub" ? 17 : 13));
    }
  }
  lineEls.forEach((l) => {
    const a = byId[l.dataset.a], b = byId[l.dataset.b];
    l.setAttribute("x1", a.cx); l.setAttribute("y1", a.cy);
    l.setAttribute("x2", b.cx); l.setAttribute("y2", b.cy);
  });
}

draw(0);
if (!reduceMotion) {
  let visible = false, frame;
  const loop = (t) => { draw(t); if (visible) frame = requestAnimationFrame(loop); };
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    cancelAnimationFrame(frame);
    if (visible) frame = requestAnimationFrame(loop);
  }).observe(svg);
}
