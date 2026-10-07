const midiToFreq = (midi) => 440 * 2 ** ((midi - 69) / 12);

function addNote(list, beat, midi, dur, voice, gain) {
  list.push({ beat, midi, dur, voice, gain });
}

function roll(list, bars, meter, pattern, gain = 0.13) {
  const step = 0.5;
  const steps = Math.round(meter / step);
  for (let m = 0; m < bars; m += 1) {
    for (let i = 0; i < steps; i += 1) {
      addNote(list, m * meter + i * step, pattern[i % pattern.length], 0.38, "pluck", gain);
    }
  }
}

function boom(list, bars, meter, root, fifth, gain = 0.2) {
  for (let m = 0; m < bars; m += 1) {
    addNote(list, m * meter, root, meter * 0.42, "bass", gain);
    if (meter >= 4) addNote(list, m * meter + 2, fifth, meter * 0.36, "bass", gain * 0.72);
  }
}

function chops(list, bars, meter, beats, gain = 0.09) {
  for (let m = 0; m < bars; m += 1) {
    beats.forEach((beat) => addNote(list, m * meter + beat, 0, 0.07, "chop", gain));
  }
}

function repeatForm(notes, bars, meter, times) {
  const span = bars * meter;
  const out = [];
  for (let i = 0; i < times; i += 1) {
    notes.forEach((note) => out.push({ ...note, beat: note.beat + i * span }));
  }
  return out;
}

function creekNotes() {
  const notes = [];
  roll(notes, 8, 4, [62, 59, 55, 62, 59, 67, 62, 59]);
  boom(notes, 8, 4, 43, 50);
  [
    [0, 67, 1.6],
    [2, 69, 0.7],
    [3, 71, 0.9],
    [4, 74, 1.4],
    [5.5, 71, 0.7],
    [6.5, 69, 1.3],
    [8, 67, 1.8],
    [10, 64, 1.7],
    [12, 62, 0.9],
    [13, 67, 2.4],
    [16, 71, 0.9],
    [17, 74, 0.9],
    [18, 71, 1.8],
    [20, 69, 1.3],
    [21.5, 67, 1.8],
    [24, 64, 0.9],
    [25, 62, 0.9],
    [26, 59, 1.8],
    [28, 62, 0.8],
    [29, 67, 2.6],
  ].forEach(([beat, midi, dur]) => addNote(notes, beat, midi, dur, "fiddle", 0.1));
  return notes;
}

function sunshineNotes() {
  const notes = [];
  roll(notes, 8, 4, [62, 69, 66, 69, 74, 69, 66, 69], 0.12);
  boom(notes, 8, 4, 38, 45, 0.18);
  chops(notes, 8, 4, [1, 3], 0.08);
  [
    [0, 66, 0.9],
    [1, 69, 0.9],
    [2, 74, 1.7],
    [4, 73, 0.4],
    [4.5, 74, 1.4],
    [6, 69, 1.6],
    [8, 71, 0.8],
    [9, 69, 0.8],
    [10, 66, 1.7],
    [12, 64, 0.9],
    [13, 66, 0.9],
    [14, 62, 1.8],
    [16, 66, 0.8],
    [17, 69, 0.8],
    [18, 74, 1.8],
    [20, 71, 0.8],
    [21, 69, 0.8],
    [22, 67, 0.8],
    [23, 66, 0.8],
    [24, 64, 1.6],
    [26, 62, 1.8],
  ].forEach(([beat, midi, dur]) => addNote(notes, beat, midi, dur, "fiddle", 0.095));
  return notes;
}

function hymnNotes() {
  const notes = [];
  for (let m = 0; m < 8; m += 1) {
    const low = m === 6 ? 35 : 40;
    addNote(notes, m * 4, low, 3.2, "bass", 0.18);
    addNote(notes, m * 4, [52, 55, 59, 64][m % 4], 1.3, "pluck", 0.07);
    addNote(notes, m * 4 + 2, [59, 55, 64, 52][m % 4], 1.2, "pluck", 0.06);
  }
  [
    [0, 64, 3.4],
    [4, 67, 3.4],
    [8, 71, 2.2],
    [10.5, 69, 1.3],
    [12, 67, 3.4],
    [16, 64, 3.4],
    [20, 62, 1.6],
    [22, 64, 1.6],
    [24, 59, 3.4],
    [28, 64, 3.6],
  ].forEach(([beat, midi, dur]) => addNote(notes, beat, midi, dur, "fiddle", 0.1));
  return notes;
}

function porchNotes() {
  const notes = [];
  for (let m = 0; m < 8; m += 1) {
    addNote(notes, m * 3, 36, 2.1, "bass", 0.18);
    addNote(notes, m * 3, 60, 0.7, "pluck", 0.09);
    addNote(notes, m * 3 + 1, 64, 0.55, "pluck", 0.08);
    addNote(notes, m * 3 + 2, 67, 0.55, "pluck", 0.08);
    addNote(notes, m * 3 + 1, 0, 0.06, "chop", 0.06);
    addNote(notes, m * 3 + 2, 0, 0.06, "chop", 0.05);
  }
  [
    [0, 64, 1.8],
    [2, 67, 0.9],
    [3, 69, 1.8],
    [5, 67, 0.9],
    [6, 64, 2.6],
    [9, 65, 1.7],
    [11, 64, 0.9],
    [12, 62, 1.7],
    [14, 60, 0.9],
    [15, 64, 1.7],
    [17, 67, 0.9],
    [18, 72, 2.6],
    [21, 67, 1.6],
    [23, 64, 0.9],
  ].forEach(([beat, midi, dur]) => addNote(notes, beat, midi, dur, "fiddle", 0.095));
  return notes;
}

function salmonNotes() {
  const notes = [];
  roll(notes, 8, 4, [62, 59, 55, 62, 67, 64, 62, 59], 0.12);
  boom(notes, 8, 4, 43, 50, 0.18);
  chops(notes, 8, 4, [1, 3], 0.065);
  [
    [0, 67, 0.8],
    [1, 69, 0.8],
    [2, 65, 1.3],
    [3.5, 67, 0.45],
    [4, 62, 1.7],
    [6, 67, 1.5],
    [8, 71, 0.8],
    [9, 69, 0.8],
    [10, 67, 1.7],
    [12, 65, 0.8],
    [13, 64, 0.8],
    [14, 62, 1.7],
    [16, 67, 2.6],
    [20, 69, 0.8],
    [21, 71, 0.8],
    [22, 74, 1.7],
    [24, 71, 0.8],
    [25, 69, 0.8],
    [26, 67, 1.8],
    [28, 62, 0.7],
    [29, 67, 2.4],
  ].forEach(([beat, midi, dur]) => addNote(notes, beat, midi, dur, "fiddle", 0.095));
  return notes;
}

function farewellNotes() {
  const notes = [];
  for (let m = 0; m < 8; m += 1) {
    addNote(notes, m * 4, 43, 1.7, "bass", 0.16);
    addNote(notes, m * 4 + 2, 50, 1.4, "bass", 0.12);
    addNote(notes, m * 4, 55, 0.8, "pluck", 0.09);
    addNote(notes, m * 4 + 2, m % 2 ? 62 : 59, 0.8, "pluck", 0.08);
  }
  [
    [0, 62, 1.8],
    [2, 67, 1.8],
    [4, 71, 1.8],
    [6, 69, 0.8],
    [7, 67, 0.9],
    [8, 64, 1.8],
    [10, 62, 1.8],
    [12, 59, 1.8],
    [14, 62, 0.8],
    [15, 67, 2.6],
    [18, 71, 1.6],
    [20, 74, 1.6],
    [22, 71, 1.6],
    [24, 69, 1.8],
    [26, 67, 1.8],
    [28, 62, 0.8],
    [29, 67, 2.6],
  ].forEach(([beat, midi, dur]) => addNote(notes, beat, midi, dur, "fiddle", 0.1));
  return notes;
}

function makeSong(partial, formNotes, repeats) {
  const notes = repeatForm(formNotes, partial.bars, partial.meter, repeats);
  const measures = partial.bars * repeats;
  const seconds = measures * partial.meter * (60 / partial.bpm);
  return { ...partial, measures, seconds, notes };
}

export function createSongs() {
  return [
    makeSong(
      {
        id: "creek",
        title: "Creek Street Rain",
        short: "Creek Street",
        blurb: "The boardwalk keeps the beat. The creek plays the rest.",
        verse: "The boards remember every boot.\nThe creek keeps talking underfoot.\nI tune to whatever the roof is drumming\nand let the whole street do the humming.",
        bpm: 104,
        meter: 4,
        bars: 8,
        label: "#9c4030",
        ink: "#f3ead7",
      },
      creekNotes(),
      2,
    ),
    makeSong(
      {
        id: "sunshine",
        title: "Liquid Sunshine",
        short: "Liquid Sunshine",
        blurb: "A break in the weather, named more kindly than it deserves.",
        verse: "They named the rain like it was kind.\nI keep a towel and an open mind.\nWhen the clouds tear a little at the seam,\nthe harbor flashes like a dream.",
        bpm: 118,
        meter: 4,
        bars: 8,
        label: "#e7b15a",
        ink: "#1c1612",
      },
      sunshineNotes(),
      2,
    ),
    makeSong(
      {
        id: "mountain",
        title: "Deer Mountain Hymn",
        short: "Deer Mountain",
        blurb: "Up above the harbor until the boats go small.",
        verse: "Above the harbor, spruce and stone,\na hymn the weather plays alone.\nI climb until the boats are small\nand the town is just a light, that's all.",
        bpm: 64,
        meter: 4,
        bars: 8,
        label: "#1c3330",
        ink: "#f3ead7",
      },
      hymnNotes(),
      1,
    ),
    makeSong(
      {
        id: "porch",
        title: "Porch Light Left On",
        short: "Porch Light",
        blurb: "Leave the light on. The channel's dark and the tune is not.",
        verse: "If the plane is late and the tide is wrong,\nthe porch light knows the words to the song.\nLeave it burning. I'll be along.\nThe channel's dark, but the tune is strong.",
        bpm: 96,
        meter: 3,
        bars: 8,
        label: "#6b4228",
        ink: "#f3ead7",
      },
      porchNotes(),
      2,
    ),
    makeSong(
      {
        id: "salmon",
        title: "Salmon After Dark",
        short: "Salmon",
        blurb: "Night work, silver in the water, nobody narrating it.",
        verse: "Silver in the black water, late,\nworking the creek against the gate.\nWe keep the quiet, we keep the oar,\nand we don't talk about the score.",
        bpm: 112,
        meter: 4,
        bars: 8,
        label: "#c4654a",
        ink: "#f8efe4",
      },
      salmonNotes(),
      2,
    ),
    makeSong(
      {
        id: "farewell",
        title: "First City Farewell",
        short: "First City",
        blurb: "Last lights when you head south. First lights when you come home.",
        verse: "First lights you see when you come from the south,\nlast lights you lose when the weather moves out.\nI'm only going as far as the song.\nI'll be on the porch before long.",
        bpm: 78,
        meter: 4,
        bars: 8,
        label: "#243f3b",
        ink: "#f3ead7",
      },
      farewellNotes(),
      1,
    ),
  ];
}

export function createEngine() {
  const songs = createSongs();
  let ctx = null;
  let master = null;
  let comp = null;
  let slap = null;
  let analyser = null;
  let noise = null;
  let nodes = [];
  let timers = [];
  let retain = true;
  let endTimer = 0;
  let songIndex = 0;
  let playing = false;
  let startTime = 0;
  let offsetBeat = 0;
  let loop = true;
  let volume = 0.82;
  let raf = 0;
  const listeners = new Set();
  const noteListeners = new Set();

  function emit() {
    const state = getState();
    listeners.forEach((fn) => fn(state));
  }

  function totalBeats(song = songs[songIndex]) {
    return song.measures * song.meter;
  }

  function currentBeat() {
    if (!playing || !ctx) return offsetBeat;
    const elapsed = ctx.currentTime - startTime;
    const beat = offsetBeat + Math.max(0, elapsed / (60 / songs[songIndex].bpm));
    return Math.min(totalBeats(), beat);
  }

  function getState() {
    const song = songs[songIndex];
    const beat = currentBeat();
    const beats = totalBeats(song);
    return {
      song,
      index: songIndex,
      playing,
      loop,
      volume,
      current: (beat / song.bpm) * 60,
      duration: song.seconds,
      progress: beats ? beat / beats : 0,
    };
  }

  function unlock() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    if (!ctx) {
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = volume;
      comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -16;
      comp.knee.value = 18;
      comp.ratio.value = 3.2;
      comp.attack.value = 0.004;
      comp.release.value = 0.18;
      slap = ctx.createDelay();
      slap.delayTime.value = 0.12;
      const slapGain = ctx.createGain();
      slapGain.gain.value = 0.2;
      analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      slap.connect(slapGain);
      slapGain.connect(comp);
      comp.connect(master);
      master.connect(ctx.destination);
      master.connect(analyser);
    }
    if (ctx.state === "suspended") ctx.resume();
    return true;
  }

  function noiseBuffer() {
    if (noise) return noise;
    const length = Math.floor(ctx.sampleRate * 0.4);
    noise = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
    return noise;
  }

  function track(node) {
    if (retain) nodes.push(node);
    return node;
  }

  function env(t, attack, dur, peak) {
    const g = ctx.createGain();
    const safe = Math.max(0.0008, peak);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(safe, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(dur, attack + 0.03));
    return g;
  }

  function playPluck(midi, t, dur, gain) {
    const freq = midiToFreq(midi);
    const osc = track(ctx.createOscillator());
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq * 0.975), t + 0.09);
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2600, t);
    filter.frequency.exponentialRampToValueAtTime(700, t + dur);
    const g = env(t, 0.005, dur, gain);
    osc.connect(filter);
    filter.connect(g);
    g.connect(comp);
    g.connect(slap);
    osc.start(t);
    osc.stop(t + dur + 0.04);

    const click = track(ctx.createBufferSource());
    click.buffer = noiseBuffer();
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 1400;
    const cg = env(t, 0.002, 0.04, gain * 0.45);
    click.connect(hp);
    hp.connect(cg);
    cg.connect(comp);
    click.start(t);
    click.stop(t + 0.05);
  }

  function playBass(midi, t, dur, gain) {
    const freq = midiToFreq(midi);
    const osc = track(ctx.createOscillator());
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, t);
    const body = track(ctx.createOscillator());
    body.type = "triangle";
    body.frequency.setValueAtTime(freq * 2, t);
    const g = env(t, 0.018, dur, gain);
    const g2 = env(t, 0.01, Math.min(dur, 0.28), gain * 0.22);
    osc.connect(g);
    body.connect(g2);
    g.connect(comp);
    g2.connect(comp);
    osc.start(t);
    body.start(t);
    osc.stop(t + dur + 0.05);
    body.stop(t + dur + 0.05);
  }

  function playFiddle(midi, t, dur, gain) {
    const freq = midiToFreq(midi);
    const osc = track(ctx.createOscillator());
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(freq, t);
    const lfo = track(ctx.createOscillator());
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 5.2;
    lfoGain.gain.value = freq * 0.007;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1500;
    const g = env(t, 0.045, dur, gain * 0.5);
    osc.connect(filter);
    filter.connect(g);
    g.connect(comp);
    g.connect(slap);
    lfo.start(t);
    osc.start(t);
    lfo.stop(t + dur + 0.05);
    osc.stop(t + dur + 0.05);
  }

  function playChop(t, gain) {
    const src = track(ctx.createBufferSource());
    src.buffer = noiseBuffer();
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1700;
    bp.Q.value = 0.7;
    const g = env(t, 0.002, 0.055, gain);
    src.connect(bp);
    bp.connect(g);
    g.connect(comp);
    src.start(t);
    src.stop(t + 0.07);
  }

  function clearPerformance() {
    window.clearTimeout(endTimer);
    timers.forEach((id) => window.clearTimeout(id));
    timers = [];
    nodes.forEach((node) => {
      if (typeof node.stop === "function") {
        try {
          node.stop();
        } catch {
          /* already stopped */
        }
      }
      try {
        node.disconnect();
      } catch {
        /* already disconnected */
      }
    });
    nodes = [];
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  function pump() {
    if (!playing) return;
    emit();
    raf = requestAnimationFrame(pump);
  }

  function schedule(note, t) {
    if (t < ctx.currentTime - 0.02) return;
    if (note.voice === "pluck") playPluck(note.midi, t, note.dur, note.gain);
    else if (note.voice === "bass") playBass(note.midi, t, note.dur, note.gain);
    else if (note.voice === "fiddle") playFiddle(note.midi, t, note.dur, note.gain);
    else if (note.voice === "chop") playChop(t, note.gain);
    const wait = (t - ctx.currentTime) * 1000;
    const id = window.setTimeout(() => {
      noteListeners.forEach((fn) => fn(note));
    }, Math.max(0, wait));
    timers.push(id);
  }

  function startSchedule() {
    if (!unlock()) return;
    clearPerformance();
    const song = songs[songIndex];
    const beatDur = 60 / song.bpm;
    const beats = totalBeats(song);
    offsetBeat = Math.min(offsetBeat, beats - 0.05);
    startTime = ctx.currentTime + 0.05;
    song.notes.forEach((note) => {
      if (note.beat < offsetBeat - 0.001) return;
      const t = startTime + (note.beat - offsetBeat) * beatDur;
      schedule(note, t);
    });
    const remain = (beats - offsetBeat) * beatDur;
    endTimer = window.setTimeout(() => {
      if (!playing) return;
      if (loop) {
        offsetBeat = 0;
        startSchedule();
        return;
      }
      playing = false;
      offsetBeat = 0;
      clearPerformance();
      emit();
    }, Math.max(30, remain * 1000));
    playing = true;
    emit();
    pump();
  }

  function pause() {
    if (!playing) return;
    offsetBeat = currentBeat();
    playing = false;
    clearPerformance();
    emit();
  }

  function play() {
    startSchedule();
  }

  function toggle() {
    if (playing) pause();
    else play();
  }

  function playId(id) {
    const index = songs.findIndex((song) => song.id === id);
    if (index < 0) return;
    songIndex = index;
    offsetBeat = 0;
    play();
  }

  function step(dir) {
    songIndex = (songIndex + dir + songs.length) % songs.length;
    offsetBeat = 0;
    if (playing) play();
    else emit();
  }

  function seekRatio(ratio) {
    const clamped = Math.min(0.995, Math.max(0, ratio));
    offsetBeat = clamped * totalBeats();
    if (playing) startSchedule();
    else emit();
  }

  function setLoop(next) {
    loop = next;
    emit();
  }

  function setVolume(next) {
    volume = Math.min(1, Math.max(0, next));
    if (master && ctx) master.gain.setTargetAtTime(volume, ctx.currentTime, 0.02);
    emit();
  }

  function pluck(midi, { when = 0, gain = 0.34, dur = 1.15 } = {}) {
    if (!unlock()) return;
    const t = ctx.currentTime + 0.02 + when;
    retain = false;
    playPluck(midi, t, dur, gain);
    retain = true;
  }

  function strum(midis) {
    midis.forEach((midi, index) => pluck(midi, { when: index * 0.03, gain: 0.28, dur: 1.25 }));
  }

  function readSpectrum(target) {
    if (!analyser) return false;
    analyser.getByteFrequencyData(target);
    return true;
  }

  return {
    songs,
    getState,
    subscribe(fn) {
      listeners.add(fn);
      fn(getState());
      return () => listeners.delete(fn);
    },
    onNote(fn) {
      noteListeners.add(fn);
      return () => noteListeners.delete(fn);
    },
    toggle,
    play,
    pause,
    playId,
    next: () => step(1),
    prev: () => step(-1),
    seekRatio,
    setLoop,
    setVolume,
    pluck,
    strum,
    readSpectrum,
    supported: Boolean(window.AudioContext || window.webkitAudioContext),
  };
}
