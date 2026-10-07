import { createEngine } from "./audio.js";

const BASE_TITLE = "Eli Roundy — Bluegrass & Country from Ketchikan";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const chords = {
  g: [50, 55, 59, 62, 67],
  c: [48, 55, 60, 64, 67],
  d: [50, 57, 62, 66, 69],
  e: [52, 59, 64, 67, 71],
  a: [45, 52, 57, 61, 64],
};

const rollPattern = [62, 59, 55, 62, 59, 67, 62, 59];

const ports = [
  {
    id: "ketchikan",
    t: 0.02,
    kicker: "Home port",
    title: "Ketchikan",
    text: "Rain on the roof and a creek under the floor. The banjo lives here, on a porch above the harbor. When the cruise ships leave, the town gets its voice back.",
    href: "https://www.visitktn.com/plan/places-to-discover/creek-street/",
    link: "Walk Creek Street",
  },
  {
    id: "wrangell",
    t: 0.27,
    kicker: "A short hop",
    title: "Wrangell",
    text: "Narrows, docks, and somebody's kitchen. One guitar is enough if the coffee is strong and the door stays shut against the wet.",
  },
  {
    id: "petersburg",
    t: 0.5,
    kicker: "Halfway",
    title: "Petersburg",
    text: "A fishing town with Norwegian bones. Songs before the tide turns, boots by the heater, halibut weather outside.",
  },
  {
    id: "juneau",
    t: 0.74,
    kicker: "Folk week",
    title: "Juneau",
    text: "Up the passage, fiddles gather in April and the whole thing is free. Centennial Hall fills up. You play your fifteen minutes like you mean them, then you go dance.",
    href: "https://akfolkfest.org/",
    link: "Alaska Folk Festival",
  },
  {
    id: "home",
    t: 0.98,
    kicker: "Southbound",
    title: "The channel home",
    text: "You know Ketchikan by the rain before you see the lights. First City coming back. Porch light still on.",
  },
];

const $ = (sel) => document.querySelector(sel);
const engine = createEngine();
const spectrum = new Uint8Array(32);

let scrubbing = false;
let activePort = ports[0].id;
let driftFrame = 0;
let drifting = false;

function formatTime(sec) {
  const safe = Number.isFinite(sec) ? Math.max(0, sec) : 0;
  const mins = Math.floor(safe / 60);
  const secs = Math.floor(safe % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function flash(el) {
  if (!el) return;
  el.classList.remove("is-hot");
  void el.offsetWidth;
  el.classList.add("is-hot");
}

function flashMidi(midi) {
  document.querySelectorAll(".string").forEach((el) => {
    if (Number(el.dataset.midi) === midi) flash(el);
  });
}

function setupDurations() {
  engine.songs.forEach((song) => {
    const slot = document.querySelector(`.track[data-song="${song.id}"] .time`);
    if (slot) slot.textContent = formatTime(song.seconds);
  });
}

function paintSong(state) {
  const { song, playing } = state;
  $("#lyric-title").textContent = song.title;
  $("#lyric-blurb").textContent = song.blurb;
  $("#lyrics").textContent = song.verse;
  $("#label-title").textContent = song.short;
  $("#label-kicker").textContent = playing ? "Live" : "Porch";
  const label = $(".label");
  label.style.background = song.label;
  label.style.color = song.ink;
  $("#dock-title").textContent = song.title;
  $("#dock-sub").textContent = `${song.blurb}`;
  $("#dock-dot").style.background = song.label;
  document.querySelectorAll(".track").forEach((btn) => {
    const on = btn.dataset.song === song.id;
    if (on) btn.setAttribute("aria-current", "true");
    else btn.removeAttribute("aria-current");
  });
  const playBtn = $("#play");
  playBtn.querySelector(".when-playing").hidden = !playing;
  playBtn.querySelector(".when-paused").hidden = playing;
  playBtn.setAttribute("aria-label", playing ? "Pause" : "Play");
  $("#turntable").setAttribute("aria-label", playing ? `Pause ${song.title}` : `Play ${song.title}`);
  $("#turntable").classList.toggle("is-spinning", playing);
  document.body.classList.toggle("is-playing", playing);
  document.title = playing ? `▶ ${song.title} — Eli Roundy` : BASE_TITLE;
}

function paintTransport(state) {
  if (!scrubbing) {
    const nextValue = String(Math.round(state.progress * 1000));
    const scrub = $("#scrub");
    if (scrub.value !== nextValue) scrub.value = nextValue;
    $("#time-now").textContent = formatTime(state.current);
  }
  $("#time-dur").textContent = formatTime(state.duration);
  $("#scrub").setAttribute("aria-valuetext", `${formatTime(state.current)} of ${formatTime(state.duration)}`);
  const bars = document.querySelectorAll("#viz span");
  if (state.playing && engine.readSpectrum(spectrum)) {
    bars.forEach((bar, i) => {
      const amount = spectrum[i] / 255;
      bar.style.transform = `scaleY(${0.15 + amount})`;
    });
  } else {
    bars.forEach((bar) => {
      bar.style.transform = "scaleY(0.15)";
    });
  }
}

let paintedId = "";
let paintedPlaying = null;

engine.subscribe((state) => {
  if (state.song.id !== paintedId || state.playing !== paintedPlaying) {
    paintedId = state.song.id;
    paintedPlaying = state.playing;
    paintSong(state);
    const status = $("#player-status");
    status.textContent = state.playing ? `Playing ${state.song.title}` : `${state.song.title} paused`;
  }
  paintTransport(state);
});

engine.onNote((note) => {
  const voice = document.querySelector(`.voices [data-voice="${note.voice}"]`);
  flash(voice);
  if (note.voice === "pluck") flashMidi(note.midi);
});

function setupPlayer() {
  document.querySelectorAll(".track").forEach((btn) => {
    btn.addEventListener("click", () => {
      const state = engine.getState();
      if (state.song.id === btn.dataset.song && state.playing) engine.pause();
      else engine.playId(btn.dataset.song);
    });
  });
  $("#turntable").addEventListener("click", () => engine.toggle());
  $("#play").addEventListener("click", () => engine.toggle());
  $("#prev").addEventListener("click", () => engine.prev());
  $("#next").addEventListener("click", () => engine.next());
  $("#loop").addEventListener("click", () => {
    const next = $("#loop").getAttribute("aria-pressed") !== "true";
    $("#loop").setAttribute("aria-pressed", next ? "true" : "false");
    engine.setLoop(next);
  });
  $("#volume").addEventListener("input", (event) => {
    engine.setVolume(Number(event.target.value) / 100);
  });
  const scrub = $("#scrub");
  scrub.addEventListener("pointerdown", () => {
    scrubbing = true;
  });
  scrub.addEventListener("input", () => {
    const ratio = Number(scrub.value) / 1000;
    $("#time-now").textContent = formatTime(ratio * engine.getState().duration);
  });
  scrub.addEventListener("change", () => {
    engine.seekRatio(Number(scrub.value) / 1000);
    scrubbing = false;
  });
  scrub.addEventListener("blur", () => {
    scrubbing = false;
    paintTransport(engine.getState());
  });
}

function setupKeys() {
  document.addEventListener("keydown", (event) => {
    const tag = document.activeElement?.tagName;
    const typing = ["INPUT", "TEXTAREA", "SELECT", "BUTTON", "A"].includes(tag) || document.activeElement?.isContentEditable;
    if (typing) return;
    if (document.activeElement?.id === "passage-chart") return;
    if (event.code === "Space") {
      event.preventDefault();
      engine.toggle();
      return;
    }
    if (event.key === "ArrowRight" && !event.metaKey && document.activeElement?.id !== "scrub") {
      engine.next();
      return;
    }
    if (event.key === "ArrowLeft" && document.activeElement?.id !== "scrub" && document.activeElement?.id !== "course-slider") {
      const chart = document.activeElement?.closest?.("#passage-chart");
      if (!chart) engine.prev();
      return;
    }
    const key = event.key.toLowerCase();
    if (key >= "1" && key <= "5") {
      const string = document.querySelector(`.string[data-key="${key}"]`);
      if (!string) return;
      event.preventDefault();
      const midi = Number(string.dataset.midi);
      engine.pluck(midi);
      flash(string);
      return;
    }
    if (chords[key]) {
      event.preventDefault();
      engine.strum(chords[key]);
      document.querySelectorAll(".string").forEach((el) => flash(el));
      flash(document.querySelector(`.chord[data-chord="${key}"]`));
      return;
    }
    if (key === "f") {
      event.preventDefault();
      rollPattern.forEach((midi, index) => {
        window.setTimeout(() => {
          engine.pluck(midi, { gain: 0.3, dur: 0.45 });
          flashMidi(midi);
        }, index * 115);
      });
      flash($("#roll"));
    }
  });
}

function setupPorch() {
  document.querySelectorAll(".string").forEach((btn) => {
    btn.addEventListener("click", () => {
      engine.pluck(Number(btn.dataset.midi));
      flash(btn);
    });
  });
  document.querySelectorAll(".chord[data-chord]").forEach((btn) => {
    btn.addEventListener("click", () => {
      engine.strum(chords[btn.dataset.chord]);
      document.querySelectorAll(".string").forEach((el) => flash(el));
      flash(btn);
    });
  });
  $("#roll").addEventListener("click", () => {
    rollPattern.forEach((midi, index) => {
      window.setTimeout(() => {
        engine.pluck(midi, { gain: 0.3, dur: 0.45 });
        flashMidi(midi);
      }, index * 115);
    });
    flash($("#roll"));
  });
}

function setupWeather() {
  const buttons = document.querySelectorAll(".weather-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const mode = btn.dataset.weather;
      document.body.dataset.weather = mode;
      buttons.forEach((other) => other.setAttribute("aria-checked", other === btn ? "true" : "false"));
      window.dispatchEvent(new Event("resize"));
    });
  });
}

function setupRain() {
  const canvas = $("#rain");
  if (!canvas) return;
  const scene = canvas.parentElement;
  const ctx = canvas.getContext("2d");
  let drops = [];
  let running = !reduceMotion;

  function resize() {
    const rect = scene.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, rect.width * dpr);
    canvas.height = Math.max(1, rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const weather = document.body.dataset.weather;
    const divisor = weather === "gale" ? 8 : 16;
    const count = Math.max(12, Math.floor(rect.width / divisor));
    drops = Array.from({ length: count }, () => ({
      x: Math.random() * rect.width,
      y: Math.random() * rect.height,
      len: 12 + Math.random() * 16,
      v: 0.55 + Math.random() * 1,
    }));
  }

  let last = performance.now();
  function frame(now) {
    if (!running) return;
    const dt = Math.min(34, now - last);
    last = now;
    const rect = scene.getBoundingClientRect();
    const weather = document.body.dataset.weather;
    ctx.clearRect(0, 0, rect.width, rect.height);
    if (weather !== "break") {
      const gale = weather === "gale";
      ctx.strokeStyle = gale ? "rgba(28, 36, 40, 0.55)" : "rgba(36, 44, 48, 0.38)";
      ctx.lineWidth = gale ? 1.4 : 1;
      const wind = gale ? 0.55 : 0.18;
      const speed = gale ? 1.15 : 0.62;
      ctx.beginPath();
      drops.forEach((drop) => {
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x + wind * drop.len, drop.y + drop.len);
        drop.y += drop.v * speed * dt;
        drop.x += wind * dt * 0.35;
        if (drop.y > rect.height || drop.x > rect.width + 30) {
          drop.y = -24;
          drop.x = Math.random() * rect.width;
        }
      });
      ctx.stroke();
    }
    requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => {
    const visible = document.visibilityState === "visible";
    if (visible && !running && !reduceMotion) {
      running = true;
      last = performance.now();
      requestAnimationFrame(frame);
    }
    if (!visible) running = false;
  });
  if (running) requestAnimationFrame(frame);
}

function setupSalmon() {
  const salmon = $("#salmon");
  salmon.addEventListener("click", () => {
    salmon.classList.remove("is-jumping");
    void salmon.offsetWidth;
    salmon.classList.add("is-jumping");
    engine.pluck(79, { gain: 0.22, dur: 0.35 });
    window.setTimeout(() => engine.pluck(76, { gain: 0.12, dur: 0.25 }), 90);
  });
  salmon.addEventListener("animationend", () => salmon.classList.remove("is-jumping"));
}

function nearestPort(t) {
  return ports.reduce((best, port) => (Math.abs(port.t - t) < Math.abs(best.t - t) ? port : best));
}

function setupPassage() {
  const svg = $("#passage-chart");
  const course = $("#course");
  const boat = $("#boat");
  const markers = $("#port-markers");
  const length = course.getTotalLength();
  const samples = Array.from({ length: 120 }, (_, i) => {
    const t = i / 119;
    const point = course.getPointAtLength(t * length);
    return { t, x: point.x, y: point.y };
  });

  function pointAt(t) {
    const clamped = Math.min(1, Math.max(0, t));
    return course.getPointAtLength(clamped * length);
  }

  function placeBoat(t, angle) {
    const point = pointAt(t);
    const ahead = pointAt(Math.min(1, t + 0.01));
    const deg = angle ?? (Math.atan2(ahead.y - point.y, ahead.x - point.x) * 180) / Math.PI;
    boat.setAttribute("transform", `translate(${point.x} ${point.y}) rotate(${deg})`);
    svg.setAttribute("aria-valuenow", String(Math.round(t * 100)));
    svg.setAttribute("aria-valuetext", nearestPort(t).title);
  }

  function showPort(port, { sound = false } = {}) {
    activePort = port.id;
    $("#port-kicker").textContent = port.kicker;
    $("#port-title").textContent = port.title;
    $("#port-text").textContent = port.text;
    const link = $("#port-link");
    if (port.href) {
      link.hidden = false;
      link.href = port.href;
      link.textContent = port.link;
    } else {
      link.hidden = true;
    }
    document.querySelectorAll(".port-btn").forEach((btn) => {
      btn.setAttribute("aria-pressed", btn.dataset.port === port.id ? "true" : "false");
    });
    markers.querySelectorAll("circle").forEach((circle) => {
      circle.classList.toggle("is-active", circle.dataset.port === port.id);
    });
    if (sound && engine.getState().playing) engine.pluck(67, { gain: 0.16, dur: 0.4 });
  }

  function go(t, { sound = false } = {}) {
    const port = nearestPort(t);
    placeBoat(t);
    if (port.id !== activePort) showPort(port, { sound });
    else placeBoat(t);
  }

  ports.forEach((port) => {
    const point = pointAt(port.t);
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", point.x);
    circle.setAttribute("cy", point.y);
    circle.setAttribute("r", "7");
    circle.dataset.port = port.id;
    circle.setAttribute("class", port.id === activePort ? "port-dot is-active" : "port-dot");
    circle.addEventListener("click", (event) => {
      event.stopPropagation();
      stopDrift();
      placeBoat(port.t);
      showPort(port, { sound: true });
    });
    markers.appendChild(circle);
  });

  document.querySelectorAll(".port-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const port = ports.find((item) => item.id === btn.dataset.port);
      stopDrift();
      placeBoat(port.t);
      showPort(port, { sound: true });
    });
  });

  function tFromEvent(event) {
    const rect = svg.getBoundingClientRect();
    const box = svg.viewBox.baseVal;
    const x = ((event.clientX - rect.left) / rect.width) * box.width;
    const y = ((event.clientY - rect.top) / rect.height) * box.height;
    let best = samples[0];
    let bestDist = Infinity;
    samples.forEach((sample) => {
      const dist = (sample.x - x) ** 2 + (sample.y - y) ** 2;
      if (dist < bestDist) {
        best = sample;
        bestDist = dist;
      }
    });
    return best.t;
  }

  let dragging = false;
  svg.addEventListener("pointerdown", (event) => {
    if (event.target.closest?.(".port-dot") || event.target.classList?.contains("port-dot")) return;
    dragging = true;
    stopDrift();
    svg.setPointerCapture(event.pointerId);
    go(tFromEvent(event));
  });
  svg.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    go(tFromEvent(event));
  });
  svg.addEventListener("pointerup", () => {
    dragging = false;
  });
  svg.addEventListener("keydown", (event) => {
    const current = ports.find((port) => port.id === activePort) ?? nearestPort(0);
    let t = current.t;
    if (event.key === "ArrowRight") t = Math.min(1, t + 0.04);
    else if (event.key === "ArrowLeft") t = Math.max(0, t - 0.04);
    else if (event.key === "Home") t = 0;
    else if (event.key === "End") t = 1;
    else return;
    event.preventDefault();
    event.stopPropagation();
    stopDrift();
    go(t, { sound: true });
  });

  function stopDrift() {
    drifting = false;
    cancelAnimationFrame(driftFrame);
    const drift = $("#drift");
    drift.setAttribute("aria-pressed", "false");
    drift.textContent = reduceMotion ? "Next port" : "Run north";
  }

  $("#drift").addEventListener("click", () => {
    if (drifting) {
      stopDrift();
      return;
    }
    const startPort = ports.find((port) => port.id === activePort) ?? ports[0];
    if (reduceMotion) {
      const index = ports.findIndex((port) => port.id === startPort.id);
      const next = ports[(index + 1) % ports.length];
      placeBoat(next.t);
      showPort(next, { sound: true });
      return;
    }
    if (startPort.t > 0.97) {
      placeBoat(ports[0].t);
      showPort(ports[0], { sound: true });
      return;
    }
    drifting = true;
    $("#drift").setAttribute("aria-pressed", "true");
    $("#drift").textContent = "Drop anchor";
    const from = startPort.t;
    const began = performance.now();
    const duration = 14000 * (1 - from);
    const step = (now) => {
      if (!drifting) return;
      const amount = Math.min(1, (now - began) / duration);
      const t = from + (1 - from) * amount;
      go(t, { sound: true });
      if (amount < 1) driftFrame = requestAnimationFrame(step);
      else stopDrift();
    };
    driftFrame = requestAnimationFrame(step);
  });

  if (reduceMotion) $("#drift").textContent = "Next port";
  placeBoat(ports[0].t);
  showPort(ports[0]);
}

function setupNav() {
  const nav = $("#nav");
  const toggle = $("#nav-toggle");
  const menu = $("#nav-menu");
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.textContent = open ? "Close" : "Menu";
  });
  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.textContent = "Menu";
    });
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.textContent = "Menu";
    }
  });

  const links = [...menu.querySelectorAll("a[href^='#']")].filter((link) => !link.classList.contains("nav-book"));
  const sections = links.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: "-45% 0px -48% 0px", threshold: 0.01 },
  );
  sections.forEach((section) => observer.observe(section));
}

function setupTickets() {
  document.querySelectorAll(".ticket").forEach((ticket) => {
    ticket.addEventListener("click", () => {
      const form = $("#booking-form");
      form.hidden = false;
      $("#postcard").hidden = true;
      const occasion = form.querySelector('[name="occasion"]');
      const when = form.querySelector('[name="when"]');
      const message = form.querySelector('[name="message"]');
      occasion.value = "show";
      if (ticket.dataset.when) when.value = ticket.dataset.when;
      const full = ticket.dataset.full === "true";
      message.value = full
        ? `If a chair opens at ${ticket.dataset.venue} in ${ticket.dataset.place}, I'd like it. Otherwise put me on the next porch.`
        : `Hold me a chair at ${ticket.dataset.venue} in ${ticket.dataset.place}.`;
      document.getElementById("booking").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      window.setTimeout(() => form.querySelector('[name="name"]').focus(), reduceMotion ? 0 : 400);
    });
  });
}

function setupBooking() {
  const form = $("#booking-form");
  const postcard = $("#postcard");
  const fields = ["name", "email", "occasion", "message"];

  function setError(name, text) {
    const field = form.querySelector(`[name="${name}"]`);
    const error = form.querySelector(`[data-error="${name}"]`);
    error.textContent = text;
    field.setAttribute("aria-invalid", text ? "true" : "false");
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    let ok = true;
    fields.forEach((name) => setError(name, ""));
    if (data.name.trim().length < 2) {
      setError("name", "A name helps.");
      ok = false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      setError("email", "That email doesn't look seaworthy.");
      ok = false;
    }
    if (!data.occasion) {
      setError("occasion", "Pick an occasion.");
      ok = false;
    }
    if (data.message.trim().length < 8) {
      setError("message", "Give him a sentence or two.");
      ok = false;
    }
    if (!ok) return;

    const when = data.when ? new Date(`${data.when}T12:00:00`) : null;
    const whenLabel = when && !Number.isNaN(when.getTime())
      ? when.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
      : "Date still loose";
    const occasionLabel = form.querySelector(`[name="occasion"] option[value="${data.occasion}"]`).textContent;
    $("#pc-from").textContent = data.name.trim();
    $("#pc-email").textContent = data.email.trim();
    $("#pc-occasion").textContent = occasionLabel;
    $("#pc-when").textContent = whenLabel;
    $("#pc-message").textContent = data.message.trim();
    postcard.dataset.note = [
      "For Eli Roundy, Ketchikan",
      `From: ${data.name.trim()}`,
      `Email: ${data.email.trim()}`,
      `Occasion: ${occasionLabel}`,
      `When: ${whenLabel}`,
      "",
      data.message.trim(),
    ].join("\n");
    form.hidden = true;
    postcard.hidden = false;
    $("#copy-note").focus();
  });

  $("#copy-note").addEventListener("click", async () => {
    const note = postcard.dataset.note || "";
    const button = $("#copy-note");
    try {
      await navigator.clipboard.writeText(note);
      button.textContent = "Copied";
    } catch {
      const area = document.createElement("textarea");
      area.value = note;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
      button.textContent = "Copied";
    }
    window.setTimeout(() => {
      button.textContent = "Copy the note";
    }, 1600);
  });

  $("#write-another").addEventListener("click", () => {
    form.reset();
    fields.forEach((name) => setError(name, ""));
    postcard.hidden = true;
    form.hidden = false;
    form.querySelector('[name="name"]').focus();
  });
}

setupDurations();
setupPlayer();
setupKeys();
setupPorch();
setupWeather();
setupRain();
setupSalmon();
setupPassage();
setupNav();
setupTickets();
setupBooking();

if (!engine.supported) {
  $("#player-status").textContent = "This browser can't tune the porch player. The set list is still here.";
}
