const PRESETS = {
  "cn-words": { kind: "words", lang: "cantonese", text: "\u6625\u5929\n\u5b78\u6821\n\u7f8e\u9e97\n\u540c\u5b78\n\u8a8d\u771f\n\u79ae\u8c8c\n\u5065\u5eb7\n\u5feb\u6a02\n\u6eab\u6696\n\u967d\u5149\n\u8001\u5e2b\n\u529f\u8ab2" },
  "cn-idioms": { kind: "words", lang: "cantonese", text: "\u767e\u82b1\u9f4a\u653e\n\u6b23\u6b23\u5411\u69ae\n\u5c08\u5fc3\u81f4\u5fd7\n\u9f4a\u5fc3\u5354\u529b\n\u77e5\u932f\u80fd\u6539\n\u5b88\u671b\u76f8\u52a9\n\u52e4\u6709\u529f\n\u6232\u7121\u76ca" },
  "cn-sentences": { kind: "sentences", lang: "cantonese", text: "\u6625\u5929\u4f86\u4e86\uff0c\u5929\u6c23\u6f38\u6f38\u6696\u548c\u3002\n\u540c\u5b78\u5011\u5728\u6821\u5712\u88cf\u5feb\u6a02\u5730\u73a9\u800d\u3002\n\u6211\u5011\u61c9\u8a72\u990a\u6210\u826f\u597d\u7684\u95b1\u8b80\u7fd2\u6163\u3002\n\u8001\u5e2b\u6559\u5c0e\u6211\u5011\u8981\u8aa0\u5be6\u6709\u79ae\u3002\n\u505a\u5b8c\u529f\u8ab2\u4ee5\u5f8c\uff0c\u6211\u559c\u6b61\u5230\u516c\u5712\u6563\u6b65\u3002" },
  "cn-passage": { kind: "passage", lang: "cantonese", text: "\u6625\u5929\u4f86\u4e86\uff0c\u5c0f\u8349\u5f9e\u6ce5\u571f\u88cf\u63a2\u51fa\u982d\u4f86\u3002\u6a39\u4e0a\u7684\u8449\u5b50\u6162\u6162\u5730\u9577\u51fa\u4f86\uff0c\u82b1\u5152\u4e5f\u5f35\u958b\u4e86\u7b11\u81c9\u3002\n\n\u5c0f\u9ce5\u5728\u679d\u982d\u4e0a\u5feb\u6a02\u5730\u5531\u6b4c\uff0c\u540c\u5b78\u5011\u5728\u6821\u5712\u88cf\u8dd1\u6b65\u3001\u904a\u6232\u3002\u9019\u500b\u6625\u5929\uff0c\u5145\u6eff\u4e86\u751f\u6c23\u548c\u6b61\u6a02\u3002" },
  "en-words": { kind: "words", lang: "english_uk", text: "pencil\nteacher\nschool\nlibrary\nfriend\nsubject\nlisten\npractice\nbeautiful\ncarefully" },
  "en-sentences": { kind: "sentences", lang: "english_uk", text: "Good morning, teacher.\nI like reading storybooks.\nWe should keep the classroom clean.\nMy friends play football after school." },
  "en-passage": { kind: "passage", lang: "english_uk", text: "Today is a sunny day. The children are playing in the playground. Some boys are playing football, and some girls are skipping. Everyone is happy.\n\nAfter playtime, we go back to the classroom. Our teacher reads us a story. We listen carefully and smile." }
};
const KIND_COPY = {
  words: { hint: "\u751f\u5b57\u3001\u8a5e\u5f59\u3001\u6210\u8a9e\u3002\u4e00\u884c\u4e00\u500b\uff0c\u6216\u7528\u9017\u865f\u5206\u9694\u3002", ph: "\u8acb\u8cbc\u4e0a\u8a5e\u8a9e\uff0c\u4e00\u884c\u4e00\u500b" },
  sentences: { hint: "\u5b8c\u6574\u53e5\u5b50\u3002\u4e00\u884c\u4e00\u53e5\u3002", ph: "\u8acb\u8cbc\u4e0a\u53e5\u5b50\uff0c\u4e00\u884c\u4e00\u53e5\u3002" },
  passage: { hint: "\u77ed\u6587\u9ed8\u5beb\u3002\u5148\u5168\u6587\u5c0e\u8b80\uff0c\u518d\u9010\u53e5\u5831\u8b80\u3002", ph: "\u8acb\u8cbc\u4e0a\u77ed\u6587\u3002" }
};
const DIGITS = ["\u96f6","\u4e00","\u4e8c","\u4e09","\u56db","\u4e94","\u516d","\u4e03","\u516b","\u4e5d"];
function chineseNumeral(n) {
  n = Math.floor(Math.abs(n));
  if (n < 10) return DIGITS[n];
  if (n === 10) return "\u5341";
  if (n < 20) return "\u5341" + DIGITS[n % 10];
  if (n < 100) return DIGITS[Math.floor(n/10)] + "\u5341" + (n % 10 ? DIGITS[n % 10] : "");
  return String(n);
}
function isEn(lang) { return lang === "english_uk" || lang === "english_us"; }
function qAnn(n, lang) { return isEn(lang) ? ("Question " + n + ".") : ("\u7b2c" + chineseNumeral(n) + "\u984c\u3002"); }
function sAnn(n, lang) { return isEn(lang) ? ("Sentence " + n + ".") : ("\u7b2c" + chineseNumeral(n) + "\u53e5\u3002"); }
function pAnn(n, lang) { return isEn(lang) ? ("Passage " + n + ".") : ("\u7b2c" + chineseNumeral(n) + "\u7bc7\u3002"); }
function passageIntro(lang) {
  if (isEn(lang)) return "Please listen to the whole passage first. Do not write yet.";
  if (lang === "mandarin") return "\u73fe\u5728\u5148\u807d\u4e00\u6b21\u5168\u6587\uff0c\u66ab\u6642\u4e0d\u7528\u5beb\u3002";
  return "\u800c\u5bb6\u5148\u807d\u4e00\u6b21\u5168\u6587\uff0c\u66ab\u6642\u5514\u4f7f\u5beb\u3002";
}
function passageBegin(lang) {
  if (isEn(lang)) return "Now write sentence by sentence.";
  if (lang === "mandarin") return "\u958b\u59cb\u9010\u53e5\u9ed8\u5beb\u3002";
  return "\u800c\u5bb6\u958b\u59cb\u9010\u53e5\u9ed8\u66f8\u3002";
}
function readyPrompt(lang) {
  if (isEn(lang)) return "Are you ready? We will begin dictation.";
  if (lang === "mandarin") return "\u6e96\u5099\u597d\u4e86\u55ce\uff1f\u6211\u5011\u958b\u59cb\u9ed8\u5beb\u3002";
  return "\u6e96\u5099\u597d\u672a\uff1f\u6211\u54cb\u800c\u5bb6\u958b\u59cb\u9ed8\u66f8\u3002";
}
function testSample(lang) {
  if (lang === "cantonese") return "\u6625\u5929\u4f86\u4e86\uff0c\u540c\u5b78\u5011\u5728\u6821\u5712\u88cf\u8a8d\u771f\u6eab\u7fd2\u3002\u5462\u500b\u4fc2\u9999\u6e2f\u7cb5\u8a9e\u9ed8\u66f8\u5831\u8b80\u3002";
  if (lang === "mandarin") return "\u6625\u5929\u4f86\u4e86\uff0c\u540c\u5b78\u5011\u5728\u6821\u5712\u88cf\u8a8d\u771f\u6eab\u7fd2\u3002\u9019\u662f\u666e\u901a\u8a71\u9ed8\u5beb\u5831\u8b80\u3002";
  return "Good morning. This is a dictation voice test.";
}
function wordHint(text) {
  const chars = [...text].filter((ch) => /[\u3400-\u9FFF\uF900-\uFAFF]/.test(ch));
  if (chars.length >= 2 && chars.length <= 8 && chars.join("") === text.replace(/\s+/g, "")) {
    return chars.join("\u3001") + "\u3002" + text + "\u3002";
  }
  return /[\u3002\uff0e.!\uff01?\uff1f]$/.test(text) ? text : text + "\u3002";
}
function splitSentences(text) {
  const src = text.replace(/\r\n/g, "\n").trim();
  if (!src) return [];
  const parts = []; let buf = "";
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (ch === "\n") continue;
    buf += ch;
    const next = src[i + 1] || "";
    if (/[\u3002\uff01\uff1f!?\u2026]/.test(ch) || (ch === "." && (next === "" || /\s/.test(next)))) {
      const t = buf.trim(); if (t) parts.push(t); buf = "";
    }
  }
  if (buf.trim()) parts.push(buf.trim());
  return parts;
}
function parseItems(text, kind) {
  const raw = text.replace(/\r\n/g, "\n").trim();
  if (!raw) return { items: [], label: kind === "words" ? "\u5171 0 \u500b\u8a5e\u8a9e" : kind === "sentences" ? "\u5171 0 \u53e5" : "\u5171 0 \u7bc7" };
  if (kind === "words") {
    const words = raw.split(/[\n,\uff0c\u3001;\uff1b]+/).map((s) => s.trim()).filter(Boolean);
    return { items: words.map((t) => ({ kind: "word", text: t })), label: "\u5171 " + words.length + " \u500b\u8a5e\u8a9e" };
  }
  if (kind === "sentences") {
    const sentences = [];
    for (const line of raw.split("\n")) {
      const t = line.trim(); if (!t) continue;
      const sub = splitSentences(t);
      if (sub.length > 1) sentences.push.apply(sentences, sub); else sentences.push(t);
    }
    return { items: sentences.map((t) => ({ kind: "sentence", text: t })), label: "\u5171 " + sentences.length + " \u53e5" };
  }
  const blocks = raw.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  const passages = blocks.map((block) => {
    const compact = block.replace(/\s*\n\s*/g, "");
    let sentences = splitSentences(compact);
    if (sentences.length <= 1) {
      const byLine = block.split("\n").map((s) => s.trim()).filter(Boolean);
      if (byLine.length > 1) sentences = byLine;
      else if (!sentences.length) sentences = [compact];
    }
    return { kind: "passage", full: compact, sentences: sentences };
  });
  const n = passages.reduce((a, p) => a + p.sentences.length, 0);
  return { items: passages, label: "\u5171 " + passages.length + " \u7bc7 \u00b7 " + n + " \u53e5" };
}
function writingSeconds(text, kind, interval) {
  if (interval !== "auto") return parseInt(interval, 10);
  const chars = [...text].filter((c) => c.trim()).length;
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  if (kind === "words") return clamp(Math.ceil(chars * 1.3) + 5, 6, 16);
  if (kind === "sentences") return clamp(Math.ceil(chars * 1.5) + 6, 10, 28);
  return clamp(Math.ceil(chars * 1.7) + 8, 12, 36);
}
function buildQueue(items, lang, charHint) {
  const units = []; let q = 0, passageNo = 0;
  for (const item of items) {
    if (item.kind === "word") {
      q++; units.push({ text: item.text, speak: (lang === "cantonese" && charHint) ? wordHint(item.text) : item.text, announce: qAnn(q, lang), label: "\u7b2c " + q + " \u984c", kind: "words" });
    } else if (item.kind === "sentence") {
      q++; units.push({ text: item.text, speak: item.text, announce: qAnn(q, lang), label: "\u7b2c " + q + " \u984c", kind: "sentences" });
    } else {
      passageNo++;
      const group = items.length > 1 ? ("\u7b2c " + passageNo + " \u7bc7") : "\u7bc7\u7ae0";
      item.sentences.forEach((sentence, si) => {
        q++;
        units.push({ text: sentence, speak: sentence, announce: sAnn(si + 1, lang), label: group + " \u00b7 \u7b2c " + (si + 1) + " \u53e5", kind: "passage", group: group, prelude: si === 0 ? [pAnn(passageNo, lang), passageIntro(lang), item.full, passageBegin(lang)] : null });
      });
    }
  }
  return units;
}

const PROXY_TTS = "https://tts-api.netlify.app/";
const GOOGLE_ENDPOINTS = [
  "https://translate.googleapis.com/translate_tts",
  "https://translate.google.com/translate_tts",
  "https://translate.google.com.hk/translate_tts"
];
const YUE_TLS = ["yue", "yue-HK", "zh-yue"];
const SILENT = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
let activeAudio = null, speakGen = 0, audioUnlocked = false, objectUrls = [], bufferSource = null, audioCtx = null, lastSpeakError = "";

function voices() { return window.speechSynthesis ? window.speechSynthesis.getVoices() : []; }
function isYueVoice(v) {
  const b = (v.lang + " " + v.name).toLowerCase();
  if (/hiu\s*maan|hiumaan|hiu\s*gaai|hiugaai|wan\s*lung|wanlung|sinji/.test(b)) return true;
  if (/yue|cantonese|\u7cb5\u8a9e|\u7ca4\u8bed|hong kong|hongkong/.test(b)) return true;
  if (/zh-hk|zh_hk/.test(b) && !/mandarin|putonghua|\u666e\u901a\u8a71|\u666e\u901a\u8bdd/.test(b)) return true;
  return false;
}
function pickVoice(lang) {
  const list = voices();
  if (lang === "cantonese") return list.find(isYueVoice) || null;
  if (lang === "mandarin") return list.find((v) => /zh-tw|zh-cn|cmn|mandarin|meijia/.test((v.lang + v.name).toLowerCase()) && !isYueVoice(v)) || null;
  const code = lang === "english_uk" ? "en-gb" : "en-us";
  return list.find((v) => v.lang.toLowerCase().startsWith(code)) || list.find((v) => v.lang.toLowerCase().startsWith("en")) || null;
}
function inspectEngine(lang, pref) {
  const native = pickVoice(lang);
  if (lang === "cantonese") {
    if (pref === "system" && native) return { label: "\u672c\u6a5f\u9999\u6e2f\u7cb5\u8a9e", detail: native.name, source: "system" };
    if (pref === "system" && !native) return { label: "\u96f2\u7aef\u9999\u6e2f\u7cb5\u8a9e\uff08\u5f8c\u5099\uff09", detail: "\u6b64\u88dd\u7f6e\u6c92\u6709\u7cb5\u8a9e\u8a9e\u97f3\uff0c\u4e0d\u6703\u6539\u7528\u666e\u901a\u8a71", source: "cloud", warn: true };
    if (pref === "auto" && native) return { label: "\u672c\u6a5f\u9999\u6e2f\u7cb5\u8a9e", detail: native.name, source: "system" };
    return { label: "\u96f2\u7aef\u9999\u6e2f\u7cb5\u8a9e", detail: "Chrome / Samsung \u7528\u89e3\u9396\u5f8c\u7684 Web Audio \u64ad\u653e", source: "cloud" };
  }
  if (native) return { label: lang === "mandarin" ? "\u672c\u6a5f\u666e\u901a\u8a71" : "\u672c\u6a5f\u82f1\u8a9e", detail: native.name, source: "system" };
  return { label: "\u96f2\u7aef\u8a9e\u97f3", detail: lang, source: "cloud" };
}
function cancelSpeech() {
  speakGen++;
  try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {}
  if (bufferSource) { try { bufferSource.stop(); } catch (e) {} bufferSource = null; }
  if (activeAudio) { try { activeAudio.pause(); activeAudio.removeAttribute("src"); activeAudio.load(); } catch (e) {} }
  while (objectUrls.length) { try { URL.revokeObjectURL(objectUrls.pop()); } catch (e) {} }
  hideTapPlay();
}
function chunkText(text, max) {
  const t = text.trim();
  if ([...t].length <= max) return [t];
  const pieces = []; let buf = "";
  for (const ch of t) {
    buf += ch;
    if ([...buf].length >= max && /[\u3002\uff01\uff1f!?,;\uff0c\u3001\uff1b\s]/.test(ch)) { pieces.push(buf.trim()); buf = ""; }
  }
  if (buf.trim()) pieces.push(buf.trim());
  return pieces.length ? pieces : [t];
}
function langCode(lang) {
  if (lang === "cantonese") return "yue";
  if (lang === "mandarin") return "zh-TW";
  return "en";
}
function getAudioCtx() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!audioCtx) audioCtx = new AC();
  return audioCtx;
}
function getPlayer() {
  let audio = document.getElementById("ttsPlayer");
  if (!audio) {
    audio = document.createElement("audio");
    audio.id = "ttsPlayer";
    document.body.appendChild(audio);
  }
  audio.setAttribute("referrerpolicy", "no-referrer");
  audio.referrerPolicy = "no-referrer";
  audio.setAttribute("playsinline", "");
  audio.setAttribute("webkit-playsinline", "");
  audio.playsInline = true;
  try { audio.disableRemotePlayback = true; } catch (e) {}
  audio.preload = "auto";
  audio.muted = false;
  audio.volume = 1;
  audio.removeAttribute("crossorigin");
  return audio;
}
function getTapPlayBtn() {
  let btn = document.getElementById("tapPlayBtn");
  if (!btn) {
    btn = document.createElement("button");
    btn.id = "tapPlayBtn";
    btn.type = "button";
    btn.textContent = "\u807d\u5514\u5230\u8072\uff1f\u9ede\u6211\u64ad\u653e";
    btn.style.cssText = "display:none;position:fixed;left:12px;right:12px;bottom:16px;z-index:120;height:52px;border:0;border-radius:14px;background:#0f6b63;color:#fff;font-size:18px;font-weight:700";
    document.body.appendChild(btn);
  }
  return btn;
}
function hideTapPlay() {
  const btn = document.getElementById("tapPlayBtn");
  if (btn) { btn.style.display = "none"; btn.onclick = null; }
  const audio = document.getElementById("ttsPlayer");
  if (audio) { audio.removeAttribute("controls"); audio.style.display = "none"; }
}
function showTapPlay(onTap) {
  const btn = getTapPlayBtn();
  btn.style.display = "block";
  btn.onclick = function () {
    hideTapPlay();
    onTap();
  };
}

async function unlockAudio() {
  lastSpeakError = "";
  const ctx = getAudioCtx();
  try { if (ctx && ctx.state !== "running") await ctx.resume(); } catch (e) {}
  try {
    const audio = getPlayer();
    activeAudio = audio;
    audio.muted = false;
    audio.volume = 1;
    audio.src = SILENT;
    await audio.play();
    audio.pause();
  } catch (e) {}
  try {
    if (ctx && ctx.state === "running") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      gain.gain.value = 0.0001;
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.05);
    }
  } catch (e) {}
  audioUnlocked = true;
}

function playSrc(src, rate, gen) {
  return new Promise((resolve, reject) => {
    if (gen !== speakGen) { resolve(); return; }
    const audio = getPlayer();
    try { audio.pause(); } catch (e) {}
    activeAudio = audio;
    audio.muted = false;
    audio.volume = 1;
    audio.playbackRate = Math.min(1.25, Math.max(0.6, rate));
    let settled = false;
    const timer = setTimeout(() => done(new Error("timeout")), 18000);
    const done = (err) => {
      if (settled) return;
      settled = true;
      audio.onended = audio.onerror = audio.oncanplaythrough = audio.onloadeddata = null;
      clearTimeout(timer);
      hideTapPlay();
      err ? reject(err) : resolve();
    };
    audio.onended = () => done();
    audio.onerror = () => done(new Error("audio"));
    const tryPlay = function () {
      const p = audio.play();
      if (!p || !p.then) return;
      p.then(function () {
        audio.style.display = "none";
        audio.removeAttribute("controls");
        hideTapPlay();
      }).catch(function () {
        showTapPlay(function () {
          audio.play().then(function () { hideTapPlay(); }).catch(function (e) { done(e); });
        });
      });
    };
    audio.oncanplaythrough = tryPlay;
    audio.src = src;
    try { audio.load(); } catch (e) {}
    tryPlay();
  });
}

async function playViaWebAudio(blob, rate, gen) {
  const ctx = getAudioCtx();
  if (!ctx) throw new Error("no-ctx");
  if (ctx.state !== "running") {
    try { await ctx.resume(); } catch (e) {}
  }
  if (ctx.state !== "running") throw new Error("ctx-" + ctx.state);
  const typed = (blob && blob.type && String(blob.type).indexOf("audio") === 0) ? blob : new Blob([blob], { type: "audio/mpeg" });
  const raw = await typed.arrayBuffer();
  const decoded = await ctx.decodeAudioData(raw.slice(0));
  if (gen !== speakGen) return;
  await new Promise((resolve, reject) => {
    try { if (bufferSource) bufferSource.stop(); } catch (e) {}
    const src = ctx.createBufferSource();
    const gain = ctx.createGain();
    bufferSource = src;
    src.buffer = decoded;
    try { src.playbackRate.value = Math.min(1.25, Math.max(0.6, rate)); } catch (e) {}
    gain.gain.value = 1;
    src.connect(gain); gain.connect(ctx.destination);
    const wait = (decoded.duration / Math.max(0.5, rate)) * 1000 + 280;
    const timer = setTimeout(resolve, wait);
    src.onended = () => { clearTimeout(timer); resolve(); };
    try { src.start(); }
    catch (e) { clearTimeout(timer); reject(e); }
  });
}

async function playBlob(blob, rate, gen) {
  if (gen !== speakGen) return;
  lastSpeakError = "";
  try {
    await playViaWebAudio(blob, rate, gen);
    return;
  } catch (e1) { lastSpeakError = String(e1 && e1.message || e1); }
  const typed = (blob && blob.type && String(blob.type).indexOf("audio") === 0) ? blob : new Blob([blob], { type: "audio/mpeg" });
  const url = URL.createObjectURL(typed);
  objectUrls.push(url);
  await playSrc(url, rate, gen);
}

async function fetchAudio(url) {
  const res = await fetch(url, { referrerPolicy: "no-referrer", cache: "no-store", mode: "cors" });
  if (!res.ok) throw new Error("http-" + res.status);
  const blob = await res.blob();
  if (!blob || blob.size < 400) throw new Error("empty");
  return blob;
}

async function fetchProxyAudio(chunk, lang) {
  const url = PROXY_TTS + "?text=" + encodeURIComponent(chunk) + "&lang=" + encodeURIComponent(langCode(lang));
  return fetchAudio(url);
}

async function fetchGoogleAudio(chunk, lang) {
  const tls = lang === "cantonese" ? YUE_TLS : [langCode(lang)];
  let last = null;
  for (const tl of tls) {
    for (const ep of GOOGLE_ENDPOINTS) {
      const client = ep.indexOf("googleapis") >= 0 ? "gtx" : "tw-ob";
      const url = ep + "?ie=UTF-8&client=" + client + "&tl=" + encodeURIComponent(tl) + "&q=" + encodeURIComponent(chunk);
      try { return await fetchAudio(url); }
      catch (e) { last = e; }
    }
  }
  throw last || new Error("google");
}

async function speakCloud(text, lang, rate, gen) {
  const chunks = chunkText(text, lang.indexOf("english") === 0 ? 160 : 80);
  for (const chunk of chunks) {
    if (gen !== speakGen) return;
    let blob = null, last = null;
    try { blob = await fetchProxyAudio(chunk, lang); }
    catch (e) { last = e; }
    if (!blob) {
      try { blob = await fetchGoogleAudio(chunk, lang); }
      catch (e) { last = e; }
    }
    if (!blob) throw last || new Error("cloud");
    await playBlob(blob, rate, gen);
  }
}

let lastUtterance = null;
function speakSystem(text, lang, rate, gen) {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) { resolve(); return; }
    const synth = window.speechSynthesis;
    try { synth.cancel(); } catch (e) {}
    const u = new SpeechSynthesisUtterance(text);
    lastUtterance = u;
    const voice = pickVoice(lang);
    if (lang === "cantonese" && !voice) { resolve(); return; }
    if (voice) u.voice = voice;
    u.lang = voice ? voice.lang : (lang === "cantonese" ? "zh-HK" : lang === "mandarin" ? "zh-TW" : lang === "english_uk" ? "en-GB" : "en-US");
    u.rate = Math.min(1.1, Math.max(0.55, rate));
    u.onend = u.onerror = () => resolve();
    setTimeout(function () {
      if (gen !== speakGen) { resolve(); return; }
      try { synth.speak(u); } catch (e) { resolve(); }
    }, 60);
    setTimeout(resolve, Math.max(1800, [...text].length * (420 / Math.max(0.5, u.rate))) + 2000);
  });
}

async function speakText(text, lang, rate, enginePref) {
  const value = (text || "").trim();
  if (!value) return;
  const gen = ++speakGen;
  await unlockAudio();
  const native = pickVoice(lang);
  const forceSystem = enginePref === "system" && !!native;
  if (!forceSystem) {
    try { await speakCloud(value, lang, rate, gen); return; }
    catch (e) {
      lastSpeakError = String(e && e.message || e);
      if (lang === "cantonese" && !native) throw e;
    }
  }
  if (lang === "cantonese" && !native) {
    await speakCloud(value, lang, rate, gen);
    return;
  }
  await speakSystem(value, lang, rate, gen);
}

function playBeep(freq, dur, type) {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + dur);
  } catch (e) {}
}

function bindUnlock() {
  const once = function () { unlockAudio(); };
  document.addEventListener("touchstart", once, true);
  document.addEventListener("pointerdown", once, true);
  document.addEventListener("click", once, true);
}
bindUnlock();
