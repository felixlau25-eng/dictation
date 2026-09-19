function $(id) { return document.getElementById(id); }
function sleep(ms) {
  return new Promise((resolve) => {
    const start = Date.now();
    const tick = () => {
      if (!isRunning) return resolve();
      if (isPaused) return setTimeout(tick, 120);
      if (Date.now() - start >= ms) return resolve();
      setTimeout(tick, 80);
    };
    tick();
  });
}
let currentMode = "paper", currentKind = "words", photoBusy = false, activePaperId = null, confirmDeleteId = null;
let units = [], currentIndex = 0, isRunning = false, isPaused = false, skipFlag = false, marks = [];
function switchMode(mode) {
  currentMode = mode;
  $("tabPaper").classList.toggle("active", mode === "paper");
  $("tabTyping").classList.toggle("active", mode === "typing");
  $("intervalGroup").style.display = mode === "paper" ? "block" : "none";
  $("modeNotice").textContent = mode === "paper"
    ? "\u7d19\u7b46\u6a21\u5f0f\uff1a\u53ef\u62cd\u7167\u6216\u5f9e\u9ed8\u66f8\u5eab\u63d0\u53d6\u3002\u7cfb\u7d71\u6703\u5148\u5831\u984c\u865f\u518d\u5831\u8b80\u3002"
    : "\u6253\u5b57\u6a21\u5f0f\uff1a\u807d\u5b8c\u5f8c\u5728\u87a2\u5e55\u8f38\u5165\u7b54\u6848\u3002";
  persistAndCount();
}
function setKind(kind) {
  currentKind = kind;
  ["words","sentences","passage"].forEach((k) => $("kind-" + k).classList.toggle("active", k === kind));
  $("kindHint").textContent = KIND_COPY[kind].hint;
  $("dictText").placeholder = KIND_COPY[kind].ph;
  persistAndCount();
}
function persistAndCount() {
  const parsed = parseItems($("dictText").value, currentKind);
  $("wordCountTip").textContent = parsed.label;
  try {
    localStorage.setItem("dictation-helper-v2", JSON.stringify({
      text: $("dictText").value, kind: currentKind, lang: $("langSelect").value, mode: currentMode,
      rate: $("speedSelect").value, repeats: $("repeatSelect").value, interval: $("intervalSelect").value,
      engine: $("engineSelect").value, charHint: $("charHint").checked, activePaperId: activePaperId
    }));
  } catch (e) {}
  refreshCharHint();
  if ($("libList")) renderLibrary();
}
function refreshCharHint() {
  $("charHintWrap").style.display = (currentKind === "words" && $("langSelect").value === "cantonese") ? "block" : "none";
}
function refreshEngine() {
  const info = inspectEngine($("langSelect").value, $("engineSelect").value);
  $("engineLabel").textContent = info.label;
  $("engineDetail").textContent = info.detail + ($("langSelect").value === "cantonese" ? "\u3000\u7cb5\u8a9e\u5831\u8b80\u5514\u6703\u6539\u7528\u666e\u901a\u8a71\u3002" : "");
  $("engineBox").classList.toggle("warn", !!info.warn);
  refreshCharHint();
}
function loadPreset(id) {
  const p = PRESETS[id]; if (!p) return;
  $("dictText").value = p.text; $("langSelect").value = p.lang; activePaperId = null; setKind(p.kind);
}
function clearText() { $("dictText").value = ""; activePaperId = null; persistAndCount(); renderLibrary(); }
async function testBeep() {
  await unlockAudio(); playBeep(880, 0.25); setTimeout(() => playBeep(660, 0.28), 280);
  $("testStatus").textContent = "\u82e5\u807d\u5230\u5169\u8072\u300c\u5605\u300d\uff0c\u5587\u53ed\u6b63\u5e38\u3002\u807d\u5514\u5230\u8acb\u6253\u958b\u5074\u908a\u975c\u97f3\u63a7\u4e26\u8abf\u9ad8\u97f3\u91cf\u3002";
}
async function testVoice() {
  $("testStatus").textContent = "\u6b63\u5728\u5831\u8b80\u8a66\u807d\u2026";
  await unlockAudio();
  const lang = $("langSelect").value;
  try {
    await speakText(testSample(lang), lang, parseFloat($("speedSelect").value), $("engineSelect").value);
    $("testStatus").textContent = "\u8a66\u807d\u5b8c\u6210 \u00b7 " + inspectEngine(lang, $("engineSelect").value).label;
  } catch (e) {
    $("testStatus").textContent = "\u672a\u80fd\u64ad\u653e\u7cb5\u8a9e\u3002\u8acb\u6aa2\u67e5\uff1a\u2460 \u5074\u908a\u975c\u97f3\u63a7 \u2461 \u97f3\u91cf \u2462 \u7db2\u7d61\u3002\u53ef\u5148\u6309\u300c\u6e2c\u8a66\u5587\u53ed\u300d\u3002";
  }
}
function show(id) { ["setupView","runnerView","reviewView"].forEach((k) => $(k).classList.toggle("hidden", k !== id)); }
function setStatus(text, kind) {
  const el = $("statusBadge"); el.textContent = text;
  el.className = "badge" + (kind === "speak" ? " pulse" : kind === "pause" ? " pause" : " wait");
}
function updateProgress() {
  $("progressFill").style.width = (units.length ? (currentIndex / units.length) * 100 : 0) + "%";
  $("progressText").textContent = (currentIndex + 1) + " / " + units.length;
  $("qNumberDisplay").textContent = units[currentIndex] ? units[currentIndex].label : "";
}
async function startDictation(override) {
  const lang = $("langSelect").value;
  const parsed = parseItems($("dictText").value, currentKind);
  units = override || buildQueue(parsed.items, lang, $("charHint").checked);
  if (!units.length) { $("testStatus").textContent = "\u8acb\u5148\u8f38\u5165\u6216\u8cbc\u4e0a\u9ed8\u66f8\u5167\u5bb9\u3002"; return; }
  await unlockAudio();
  currentIndex = 0; isRunning = true; isPaused = false; skipFlag = false;
  marks = units.map(() => "unset"); persistAndCount(); show("runnerView");
  if (currentMode === "paper") { $("paperCountdownArea").classList.remove("hidden"); $("typingArea").classList.add("hidden"); }
  else { $("paperCountdownArea").classList.add("hidden"); $("typingArea").classList.remove("hidden"); }
  $("pauseBtn").textContent = "\u66ab\u505c";
  try { await speakText(readyPrompt(lang), lang, parseFloat($("speedSelect").value), $("engineSelect").value); } catch (e) {}
  if (currentMode === "paper") runPaper(); else runTyping();
}
async function runPaper() {
  const lang = $("langSelect").value, rate = parseFloat($("speedSelect").value), engine = $("engineSelect").value;
  const repeats = parseInt($("repeatSelect").value, 10) || 2, interval = $("intervalSelect").value;
  while (isRunning && currentIndex < units.length) {
    const unit = units[currentIndex]; skipFlag = false; updateProgress();
    $("preludeNote").textContent = ""; $("countdownSecs").textContent = "\u2014";
    if (unit.prelude && unit.prelude.length) {
      setStatus("\u5168\u6587\u5c0e\u8b80", "speak"); $("preludeNote").textContent = "\u8acb\u5148\u807d\u5168\u6587\uff0c\u66ab\u6642\u4e0d\u7528\u5beb";
      for (const line of unit.prelude) {
        if (!isRunning || skipFlag) break;
        while (isPaused && isRunning) await sleep(120);
        try { await speakText(line, lang, rate, engine); } catch (e) {}
        await sleep(400);
      }
      $("preludeNote").textContent = "";
    }
    if (!isRunning) return;
    playBeep(520, 0.1); setStatus("\u6b63\u5728\u5831\u8b80", "speak");
    try { await speakText(unit.announce, lang, rate, engine); } catch (e) {}
    await sleep(300);
    for (let r = 0; r < repeats; r++) {
      if (!isRunning || skipFlag) break;
      while (isPaused && isRunning) await sleep(120);
      setStatus(repeats > 1 ? ("\u5831\u8b80\u4e2d\uff08\u7b2c " + (r + 1) + " \u6b21\uff09") : "\u5831\u8b80\u4e2d", "speak");
      try { await speakText(unit.speak, lang, rate, engine); }
      catch (e) { setStatus("\u8a9e\u97f3\u672a\u80fd\u64ad\u653e\uff0c\u8acb\u6309\u91cd\u807d\u6216\u6aa2\u67e5\u7db2\u7d61", "wait"); }
      if (r < repeats - 1) await sleep(1100);
    }
    if (isRunning && !skipFlag) {
      const wait = writingSeconds(unit.text, unit.kind, interval);
      setStatus("\u8acb\u5728\u7d19\u4e0a\u66f8\u5beb", "wait");
      for (let s = wait; s >= 1; s--) {
        if (!isRunning || skipFlag) break;
        while (isPaused && isRunning) await sleep(120);
        $("countdownSecs").textContent = s;
        if (s <= 3) playBeep(440, 0.08);
        await sleep(1000);
      }
    }
    currentIndex++;
  }
  if (isRunning) finishDictation();
}
async function runTyping() {
  if (!isRunning) return;
  if (currentIndex >= units.length) { finishDictation(); return; }
  const unit = units[currentIndex], lang = $("langSelect").value;
  const rate = parseFloat($("speedSelect").value), engine = $("engineSelect").value;
  updateProgress(); $("typeAnswerInput").value = ""; $("typeAnswerInput").disabled = false; $("typingFeedback").textContent = ""; $("preludeNote").textContent = "";
  if (unit.prelude && unit.prelude.length) {
    setStatus("\u5168\u6587\u5c0e\u8b80", "speak"); $("preludeNote").textContent = "\u8acb\u5148\u807d\u5168\u6587\uff0c\u66ab\u6642\u4e0d\u7528\u5beb";
    for (const line of unit.prelude) { if (!isRunning) return; try { await speakText(line, lang, rate, engine); } catch (e) {} }
    $("preludeNote").textContent = "";
  }
  playBeep(520, 0.1); setStatus("\u8acb\u4ed4\u7d30\u807d\uff0c\u7136\u5f8c\u8f38\u5165", "speak");
  try { await speakText(unit.announce, lang, rate, engine); await speakText(unit.speak, lang, rate, engine); }
  catch (e) { setStatus("\u8a9e\u97f3\u672a\u80fd\u64ad\u653e\uff0c\u8acb\u6309\u91cd\u807d", "wait"); }
  $("typeAnswerInput").focus();
}
async function checkTypingAnswer() {
  const unit = units[currentIndex]; if (!unit) return;
  const user = $("typeAnswerInput").value.trim();
  const ok = user.toLowerCase() === unit.text.trim().toLowerCase();
  marks[currentIndex] = ok ? "right" : "wrong";
  $("typeAnswerInput").disabled = true;
  $("typingFeedback").style.color = ok ? "var(--ok)" : "var(--seal)";
  $("typingFeedback").textContent = ok ? "\u7b54\u5c0d\u4e86" : ("\u6b63\u78ba\u7b54\u6848\uff1a" + unit.text);
  playBeep(ok ? 880 : 260, ok ? 0.2 : 0.3, ok ? "sine" : "triangle");
  await sleep(1400); currentIndex++; runTyping();
}
function manualReplay() {
  const unit = units[currentIndex]; if (!unit) return;
  speakText(unit.speak, $("langSelect").value, parseFloat($("speedSelect").value), $("engineSelect").value);
}
function togglePause() {
  isPaused = !isPaused; $("pauseBtn").textContent = isPaused ? "\u7e7c\u7e8c" : "\u66ab\u505c";
  if (isPaused) { cancelSpeech(); setStatus("\u5df2\u66ab\u505c", "pause"); } else setStatus("\u7e7c\u7e8c\u6eab\u7fd2", "wait");
}
function skipToNext() { skipFlag = true; cancelSpeech(); if (currentMode === "typing") { currentIndex++; runTyping(); } }
function finishDictationEarly() { finishDictation(); }
function quitRunner() { if (!confirm("\u78ba\u5b9a\u8981\u4e2d\u6b62\u7576\u524d\u9ed8\u66f8\u4e26\u8fd4\u56de\u4e3b\u9078\u55ae\u55ce\uff1f")) return; isRunning = false; cancelSpeech(); backToHome(); }
function escapeHtml(str) { const el = document.createElement("span"); el.textContent = String(str); return el.innerHTML; }
function finishDictation() {
  isRunning = false; cancelSpeech(); playBeep(784, 0.25); show("reviewView");
  const list = $("reviewList"); list.innerHTML = "";
  units.forEach((u, idx) => {
    const item = document.createElement("div");
    item.className = "item" + (marks[idx] === "wrong" ? " wrong" : marks[idx] === "right" ? " right" : "");
    item.id = "rev_" + idx;
    item.innerHTML = "<div><span class=\"item-idx\">" + (idx + 1) + "</span>" +
      (u.group ? "<div class=\"hint\" style=\"color:var(--teal);font-weight:700\">" + escapeHtml(u.group) + "</div>" : "") +
      "<span class=\"item-text\">" + escapeHtml(u.text) + "</span></div>" +
      "<div class=\"judge\"><button class=\"play-mini\" onclick=\"playItem(" + idx + ")\">\u25b6</button>" +
      "<button class=\"" + (marks[idx] === "right" ? "sel-ok" : "") + "\" onclick=\"markResult(" + idx + ", true)\">\u6b63\u78ba</button>" +
      "<button class=\"" + (marks[idx] === "wrong" ? "sel-no" : "") + "\" onclick=\"markResult(" + idx + ", false)\">\u5beb\u932f</button></div>";
    list.appendChild(item);
  });
  updateWrongCountDisplay();
}
function playItem(idx) { speakText(units[idx].text, $("langSelect").value, parseFloat($("speedSelect").value), $("engineSelect").value); }
function markResult(index, isCorrect) {
  marks[index] = isCorrect ? "right" : "wrong";
  const el = $("rev_" + index); el.className = "item " + (isCorrect ? "right" : "wrong");
  const btns = el.querySelectorAll(".judge button"); btns[1].className = isCorrect ? "sel-ok" : ""; btns[2].className = isCorrect ? "" : "sel-no";
  updateWrongCountDisplay();
}
function updateWrongCountDisplay() {
  const count = marks.filter((m) => m === "wrong").length;
  $("wrongCountSpan").textContent = count; $("retryWrongBtn").style.display = count > 0 ? "inline-flex" : "none";
}
function retryWrongQuestions() {
  const wrong = units.filter((_, i) => marks[i] === "wrong"); if (!wrong.length) return;
  const lang = $("langSelect").value;
  startDictation(wrong.map((u, i) => ({ ...u, prelude: null, announce: qAnn(i + 1, lang), label: "\u932f\u984c " + (i + 1) })));
}
function restartAll() { startDictation(units.map((u) => Object.assign({}, u))); }
function backToHome() { isRunning = false; cancelSpeech(); show("setupView"); }
const OCR_HEADER = /^(\u55ae\u5143\s*[\u4e00\u4e8c\u4e09\u56db\u4e94\u516d\u4e03\u516b\u4e5d\u53410-9\uff10-\uff19]+|\u8a5e\u8a9e\u8868|\u751f\u5b57\u8868|\u9ed8\u66f8|\u59d3\u540d|class|name|date)/i;
function cleanOcrText(raw) {
  return raw.replace(/\r/g, "").split("\n").map((line) => line.replace(/[|\uff5c]/g, " ").replace(/\s+/g, " ").trim()).filter(Boolean)
    .filter((line) => !OCR_HEADER.test(line) && !/^[0-9\uff10-\uff19]{1,3}$/.test(line))
    .map((line) => line.replace(/^[0-9\uff10-\uff19]+[\.\uff0e\u3001\)\uff09]\s*/, "").trim()).filter((line) => line.length >= 1).join("\n");
}
function detectKind(text) {
  const lines = text.split("\n").map((s) => s.trim()).filter(Boolean); if (!lines.length) return "words";
  const punct = (text.match(/[\u3002\uff01\uff1f.!?]/g) || []).length;
  const lengths = lines.map((l) => [...l].length);
  const avg = lengths.reduce((n, x) => n + x, 0) / lines.length, max = Math.max.apply(null, lengths);
  if (punct === 0 && avg <= 8) return "words";
  if (max >= 32 || (punct >= 2 && avg >= 18)) return "passage";
  if (punct >= 1 || avg >= 10) return "sentences";
  return "words";
}
function formatOcr(raw, kind) {
  const cleaned = cleanOcrText(raw); if (!cleaned) return "";
  if (kind !== "words") return cleaned;
  const words = [];
  cleaned.split("\n").forEach((line) => {
    const parts = line.split(/[\s,\uff0c\u3001;\uff1b]+/).map((s) => s.trim()).filter(Boolean);
    if (parts.length > 1 && parts.every((p) => [...p].length <= 8)) words.push.apply(words, parts); else words.push(line);
  });
  return words.join("\n");
}
function pickPhoto(which) { if (!photoBusy) $(which === "camera" ? "photoCam" : "photoAlbum").click(); }
function cancelOcr() {
  $("photoPanel").classList.add("hidden"); $("ocrText").classList.add("hidden"); $("photoActions").classList.add("hidden"); $("photoClose").classList.add("hidden");
  $("photoCam").value = ""; $("photoAlbum").value = ""; photoBusy = false; $("btnCam").disabled = false; $("btnAlbum").disabled = false;
}
function applyOcr(mode) {
  const next = $("ocrText").value.trim(); if (!next) return;
  const detected = detectKind(next); if (detected !== currentKind) setKind(detected);
  $("dictText").value = (mode === "append" && $("dictText").value.trim()) ? $("dictText").value.trim() + "\n" + next : next;
  persistAndCount(); refreshEngine(); cancelOcr();
}
function compressImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = function () {
      const max = 1280, scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * scale)); canvas.height = Math.max(1, Math.round(img.height * scale));
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url); resolve(canvas.toDataURL("image/jpeg", 0.78));
    };
    img.onerror = function () { URL.revokeObjectURL(url); reject(new Error("image")); };
    img.src = url;
  });
}
function loadTesseract() {
  if (window.Tesseract) return Promise.resolve(window.Tesseract);
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js";
    script.onload = () => resolve(window.Tesseract);
    script.onerror = () => reject(new Error("tesseract"));
    document.head.appendChild(script);
  });
}
async function onPhotoFile(input) {
  const file = input.files && input.files[0]; if (!file) return;
  photoBusy = true; $("btnCam").disabled = true; $("btnAlbum").disabled = true;
  $("photoPanel").classList.remove("hidden"); $("ocrText").classList.add("hidden"); $("photoActions").classList.add("hidden"); $("photoClose").classList.add("hidden");
  $("photoStatus").textContent = "\u6b63\u5728\u8655\u7406\u76f8\u7247\u2026";
  try {
    const dataUrl = await compressImage(file); $("photoThumb").src = dataUrl;
    $("photoStatus").textContent = "\u9996\u6b21\u4f7f\u7528\u6703\u4e0b\u8f09\u4e2d\u6587\u8fa8\u8b58\u6a94\uff0c\u8acb\u7a0d\u5019\u2026";
    const Tesseract = await loadTesseract();
    const worker = await Tesseract.createWorker("chi_tra+eng", 1, {
      logger: function (m) {
        if (m.status === "loading language traineddata") $("photoStatus").textContent = "\u4e0b\u8f09\u4e2d\u6587\u8fa8\u8b58\u6a94 " + Math.round((m.progress || 0) * 100) + "%";
        else if (m.status === "recognizing text") $("photoStatus").textContent = "\u8fa8\u8b58\u4e2d " + Math.round((m.progress || 0) * 100) + "%";
      }
    });
    let out; try { out = await worker.recognize(dataUrl); } finally { await worker.terminate(); }
    const kindGuess = detectKind(cleanOcrText(out.data.text || ""));
    const formatted = formatOcr(out.data.text || "", kindGuess || currentKind);
    if (!formatted) throw new Error("empty");
    $("ocrText").value = formatted; $("ocrText").classList.remove("hidden"); $("photoActions").classList.remove("hidden");
    $("photoStatus").textContent = "\u8fa8\u8b58\u5b8c\u6210\uff0c\u8acb\u6838\u5c0d\u6587\u5b57";
  } catch (e) {
    $("photoStatus").textContent = "\u672a\u80fd\u8fa8\u8b58\u6587\u5b57\u3002\u8acb\u5f71\u6e05\u695a\uff0c\u6216\u6539\u70ba\u624b\u52d5\u8f38\u5165\u3002";
    $("photoClose").classList.remove("hidden");
  }
  photoBusy = false; $("btnCam").disabled = false; $("btnAlbum").disabled = false;
}
const LIBRARY_KEY = "dictation-library-v1", MAX_PAPERS = 60;
function normalizeName(name) { return String(name || "").replace(/\s+/g, " ").trim().slice(0, 40); }
function newPaperId() { return "p-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8); }
function loadLibrary() {
  try {
    const raw = JSON.parse(localStorage.getItem(LIBRARY_KEY) || "[]");
    const list = Array.isArray(raw) ? raw : (raw && Array.isArray(raw.papers) ? raw.papers : []);
    return list.filter((p) => p && p.id && p.name && typeof p.text === "string").sort((a, b) => b.updatedAt - a.updatedAt);
  } catch (e) { return []; }
}
function persistLibrary(papers) { localStorage.setItem(LIBRARY_KEY, JSON.stringify(papers)); }
function paperMeta(paper) {
  const parsed = parseItems(paper.text, paper.kind || "words");
  if (paper.kind === "sentences") return "\u53e5\u5b50 \u00b7 " + parsed.items.length + " \u53e5";
  if (paper.kind === "passage") return "\u7bc7\u7ae0 \u00b7 " + parsed.items.length + " \u7bc7";
  return "\u8a5e\u8a9e \u00b7 " + parsed.items.length + " \u500b";
}
function formatUpdatedAt(ts) {
  const diff = Date.now() - ts;
  if (diff < 60000) return "\u525b\u525b"; if (diff < 3600000) return Math.max(1, Math.floor(diff / 60000)) + " \u5206\u9418\u524d";
  const d = new Date(ts), n = new Date();
  if (d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate()) return "\u4eca\u5929";
  return (d.getMonth() + 1) + "\u6708" + d.getDate() + "\u65e5";
}
function suggestName(kind, text) {
  const first = text.trim().split("\n").map((s) => s.trim()).filter(Boolean)[0] || "";
  const short = [...first].slice(0, 10).join("");
  const label = kind === "words" ? "\u8a5e\u8a9e" : kind === "sentences" ? "\u53e5\u5b50" : "\u7bc7\u7ae0";
  return normalizeName(short ? (label + " " + short) : label);
}
function upsertPaper(papers, input) {
  const name = normalizeName(input.name), text = (input.text || "").replace(/\r\n/g, "\n").trim();
  if (!name || !text) throw new Error("invalid");
  const byId = input.id ? papers.find((p) => p.id === input.id) : null;
  const byName = papers.find((p) => p.name === name);
  const existing = byId || byName;
  const paper = { id: existing ? existing.id : newPaperId(), name: name, text: text, kind: input.kind, lang: input.lang, updatedAt: Date.now() };
  const next = [paper].concat(papers.filter((p) => p.id !== paper.id && p.name !== paper.name)).sort((a, b) => b.updatedAt - a.updatedAt).slice(0, MAX_PAPERS);
  return { papers: next, paper: paper, replaced: !!existing };
}
function findActivePaper() { return activePaperId ? loadLibrary().find((p) => p.id === activePaperId) || null : null; }
function isDirty(paper) { return paper.text !== $("dictText").value.replace(/\r\n/g, "\n").trim() || paper.kind !== currentKind || paper.lang !== $("langSelect").value; }
function setLibStatus(msg) { $("libStatus").textContent = msg || ""; }
function openSaveForm() {
  if (!$("dictText").value.trim()) { setLibStatus("\u8acb\u5148\u8f38\u5165\u9ed8\u66f8\u5167\u5bb9\u3002"); return; }
  const active = findActivePaper();
  $("libName").value = active ? active.name : suggestName(currentKind, $("dictText").value);
  $("saveForm").classList.remove("hidden"); $("libName").focus(); $("libName").select();
}
function closeSaveForm() { $("saveForm").classList.add("hidden"); }
function confirmSavePaper() {
  try {
    const result = upsertPaper(loadLibrary(), { name: $("libName").value, text: $("dictText").value, kind: currentKind, lang: $("langSelect").value });
    persistLibrary(result.papers); activePaperId = result.paper.id; closeSaveForm(); persistAndCount(); renderLibrary();
    setLibStatus((result.replaced ? "\u5df2\u66f4\u65b0\u300c" : "\u5df2\u5132\u5b58\u300c") + result.paper.name + "\u300d");
  } catch (e) { setLibStatus("\u8acb\u5148\u8f38\u5165\u540d\u7a31\u548c\u9ed8\u66f8\u5167\u5bb9\u3002"); }
}
function updateActivePaper() { const active = findActivePaper(); if (!active) return; $("libName").value = active.name; confirmSavePaper(); }
function usePaper(id) {
  const paper = loadLibrary().find((p) => p.id === id); if (!paper) return;
  $("dictText").value = paper.text; $("langSelect").value = paper.lang; activePaperId = paper.id; confirmDeleteId = null;
  setKind(paper.kind || "words"); refreshEngine(); renderLibrary(); setLibStatus("\u5df2\u8f09\u5165\u300c" + paper.name + "\u300d，\u53ef\u958b\u59cb\u9ed8\u66f8");
}
function deletePaper(id) {
  if (confirmDeleteId !== id) { confirmDeleteId = id; renderLibrary(); return; }
  const papers = loadLibrary(); const paper = papers.find((p) => p.id === id);
  persistLibrary(papers.filter((p) => p.id !== id));
  if (activePaperId === id) activePaperId = null; confirmDeleteId = null; persistAndCount(); renderLibrary();
  setLibStatus(paper ? ("\u5df2\u522a\u9664\u300c" + paper.name + "\u300d") : "\u5df2\u522a\u9664");
}
function renderLibrary() {
  const papers = loadLibrary(); const active = findActivePaper(); const dirty = !!(active && isDirty(active));
  $("btnUpdatePaper").classList.toggle("hidden", !dirty);
  $("btnUpdatePaper").textContent = active && dirty ? ("\u66f4\u65b0\u300c" + active.name + "\u300d") : "\u66f4\u65b0\u9019\u4efd";
  $("btnSavePaper").disabled = !$("dictText").value.trim();
  $("libSearch").classList.toggle("hidden", papers.length < 6);
  const q = ($("libSearch").value || "").trim();
  const visible = q ? papers.filter((p) => p.name.indexOf(q) >= 0) : papers;
  const list = $("libList");
  if (!papers.length) { list.innerHTML = "<p class=\"hint\">\u5c1a\u672a\u5132\u5b58\u3002\u8cbc\u4e0a\u3001\u62cd\u7167\u6216\u7528\u7bc4\u4f8b\u5f8c\uff0c\u6309\u300c\u5132\u5b58\u9019\u4efd\u300d\u3002</p>"; return; }
  if (q && !visible.length) { list.innerHTML = "<p class=\"hint\">\u6c92\u6709\u7b26\u5408\u7684\u6e05\u55ae\u3002</p>"; return; }
  list.innerHTML = visible.map((p) => {
    const current = p.id === activePaperId, loaded = current && !isDirty(p);
    return "<div class=\"lib-item" + (current ? " active" : "") + "\"><div><div class=\"lib-name\">" + escapeHtml(p.name) + "</div>" +
      "<div class=\"lib-meta\">" + escapeHtml(paperMeta(p)) + " \u00b7 " + formatUpdatedAt(p.updatedAt) + (current ? " \u00b7 \u4f7f\u7528\u4e2d" : "") + "</div></div>" +
      "<div class=\"lib-actions\"><button type=\"button\" class=\"btn btn-main\" " + (loaded ? "disabled" : "") + " onclick=\"usePaper('" + String(p.id).replace(/'/g, "") + "')\">" + (loaded ? "\u5df2\u8f09\u5165" : "\u4f7f\u7528") + "</button>" +
      (confirmDeleteId === p.id
        ? "<button type=\"button\" class=\"btn btn-seal\" onclick=\"deletePaper('" + String(p.id).replace(/'/g, "") + "')\">\u78ba\u5b9a\u522a\u9664</button><button type=\"button\" class=\"btn btn-ghost\" onclick=\"confirmDeleteId=null;renderLibrary()\">\u53d6\u6d88</button>"
        : "<button type=\"button\" class=\"btn btn-ghost\" onclick=\"deletePaper('" + String(p.id).replace(/'/g, "") + "')\">\u522a\u9664</button>") +
      "</div></div>";
  }).join("");
}
if (window.speechSynthesis) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.addEventListener("voiceschanged", refreshEngine);
}
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    audioUnlocked = false;
    try { if (audioCtx && audioCtx.state === "suspended") audioCtx.resume(); } catch (e) {}
  }
});
window.addEventListener("DOMContentLoaded", () => {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem("dictation-helper-v2") || "null"); } catch (e) {}
  if (saved && saved.text) {
    $("dictText").value = saved.text;
    $("langSelect").value = saved.lang || "cantonese";
    $("speedSelect").value = saved.rate || "0.85";
    $("repeatSelect").value = saved.repeats || "2";
    $("intervalSelect").value = saved.interval || "auto";
    $("engineSelect").value = saved.engine || "auto";
    $("charHint").checked = saved.charHint !== false;
    activePaperId = saved.activePaperId || null;
    switchMode(saved.mode || "paper"); setKind(saved.kind || "words");
  } else loadPreset("cn-words");
  refreshEngine(); persistAndCount(); renderLibrary();
});
