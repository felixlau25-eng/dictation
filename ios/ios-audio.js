/* iOS / Safari audio overlay. Loaded after ../app-tts.js and ../app.js */
(function () {
  var SILENT = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
  var keepAlive = null;

  function player() {
    var audio = document.getElementById("ttsPlayer");
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
    audio.preload = "auto";
    audio.muted = false;
    audio.volume = 1;
    audio.controls = true;
    audio.style.cssText = "position:fixed;left:12px;right:12px;bottom:8px;width:auto;z-index:110;height:36px";
    audio.removeAttribute("crossorigin");
    try { audio.disableRemotePlayback = true; } catch (e) {}
    return audio;
  }

  function tapBtn() {
    var btn = document.getElementById("tapPlayBtn");
    if (!btn) {
      btn = document.createElement("button");
      btn.id = "tapPlayBtn";
      btn.type = "button";
      btn.textContent = "聽唔到聲？點我播放";
      btn.style.cssText = "display:none;position:fixed;left:12px;right:12px;bottom:52px;z-index:120;height:48px;border:0;border-radius:14px;background:#0f6b63;color:#fff;font-size:17px;font-weight:700";
      document.body.appendChild(btn);
    }
    return btn;
  }

  function hideTap() {
    var btn = document.getElementById("tapPlayBtn");
    if (btn) { btn.style.display = "none"; btn.onclick = null; }
  }

  async function resumeCtx() {
    try {
      if (typeof getAudioCtx === "function") {
        var ctx = getAudioCtx();
        if (ctx && ctx.state !== "running") await ctx.resume();
        if (ctx && ctx.state === "running" && !keepAlive) {
          try {
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();
            gain.gain.value = 0.00008;
            osc.frequency.value = 20;
            osc.connect(gain); gain.connect(ctx.destination);
            osc.start();
            keepAlive = osc;
          } catch (e) {}
        }
        return ctx;
      }
    } catch (e) {}
    return null;
  }

  unlockAudio = async function () {
    lastSpeakError = "";
    var audio = player();
    activeAudio = audio;
    audio.muted = false;
    audio.volume = 1;
    try {
      audio.src = SILENT;
      await audio.play();
    } catch (e) {}
    await resumeCtx();
    audioUnlocked = true;
  };

  playSrc = function (src, rate, gen) {
    return new Promise(function (resolve, reject) {
      if (gen !== speakGen) { resolve(); return; }
      var audio = player();
      try { audio.pause(); } catch (e) {}
      activeAudio = audio;
      audio.muted = false;
      audio.volume = 1;
      try { audio.playbackRate = Math.min(1.2, Math.max(0.7, rate)); } catch (e) {}
      var settled = false;
      var timer = setTimeout(function () { done(new Error("timeout")); }, 20000);
      function done(err) {
        if (settled) return;
        settled = true;
        audio.onended = audio.onerror = audio.oncanplay = null;
        clearTimeout(timer);
        hideTap();
        err ? reject(err) : resolve();
      }
      audio.onended = function () { done(); };
      audio.onerror = function () { done(new Error("audio")); };
      function tryPlay() {
        var p = audio.play();
        if (!p || !p.then) return;
        p.then(function () { hideTap(); }).catch(function () {
          var btn = tapBtn();
          btn.style.display = "block";
          btn.onclick = function () {
            hideTap();
            resumeCtx().then(function () {
              audio.play().then(function () { hideTap(); }).catch(function (e) { done(e); });
            });
          };
        });
      }
      audio.oncanplay = tryPlay;
      audio.src = src;
      try { audio.load(); } catch (e) {}
      tryPlay();
    });
  };

  playBlob = async function (blob, rate, gen) {
    if (gen !== speakGen) return;
    lastSpeakError = "";
    await resumeCtx();
    var typed = new Blob([blob], { type: "audio/mpeg" });
    var url = URL.createObjectURL(typed);
    objectUrls.push(url);
    try {
      await playSrc(url, rate, gen);
      return;
    } catch (e1) {
      lastSpeakError = String(e1 && e1.message || e1);
    }
    if (typeof playViaWebAudio === "function") {
      await playViaWebAudio(typed, rate, gen);
      return;
    }
    throw new Error(lastSpeakError || "play");
  };

  if (typeof switchMode === "function") {
    var _switchMode = switchMode;
    switchMode = function (mode) {
      _switchMode(mode);
      var el = document.getElementById("modeNotice");
      if (!el) return;
      el.textContent = mode === "paper"
        ? "iPad 紙筆模式：打開側邊靜音控，先撲「測試喇叭」。沒聲請撲底部播放條。"
        : "iPad 打字模式：打開側邊靜音控，先撲「測試喇叭」。沒聲請撲底部播放條。";
    };
  }

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") {
      audioUnlocked = true;
      resumeCtx();
    }
  });

  ["touchstart", "touchend", "pointerdown", "click"].forEach(function (ev) {
    document.addEventListener(ev, function () { unlockAudio(); }, true);
  });
})();
