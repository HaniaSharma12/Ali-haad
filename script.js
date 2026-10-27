(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- confetti ---------- */
  function confetti(n) {
    if (reduce) return;
    var colors = ["#ec4899", "#fbbf24", "#a78bfa", "#34d399", "#fff"];
    for (var i = 0; i < (n || 50); i++) {
      var d = document.createElement("span");
      d.className = "bit";
      d.style.left = Math.random() * 100 + "vw";
      d.style.background = colors[i % colors.length];
      d.style.animationDelay = Math.random() * 0.7 + "s";
      document.body.appendChild(d);
      setTimeout(function (e) { e.remove(); }, 3800, d);
    }
  }

  /* ---------- candles: hold button or microphone ---------- */
  var candles = Array.prototype.slice.call(document.querySelectorAll(".c"));
  var msg = $("candleMsg");
  var blowTime = 0, holding = false, timer = null, micOn = false;

  function snuff() {
    var lit = candles.filter(function (c) { return !c.classList.contains("out"); });
    if (lit.length) lit[0].classList.add("out");
    if (lit.length <= 1) {
      msg.textContent = "Wish made! Salgrah Mubarak, Ali! 🎉";
      confetti(90);
      stop();
    }
  }
  function tick(power) {
    blowTime += power;
    if (blowTime >= 1) { blowTime = 0; snuff(); }
  }
  function stop() { holding = false; clearInterval(timer); timer = null; }

  var blowBtn = $("blow");
  function startHold(e) {
    e.preventDefault();
    if (timer) return;
    holding = true;
    timer = setInterval(function () { tick(0.12); }, 100);
  }
  blowBtn.addEventListener("pointerdown", startHold);
  ["pointerup", "pointerleave", "pointercancel"].forEach(function (ev) {
    blowBtn.addEventListener(ev, function () { clearInterval(timer); timer = null; holding = false; });
  });
  blowBtn.addEventListener("keydown", function (e) {
    if (e.key === " " || e.key === "Enter") { snuff(); }
  });

  $("mic").addEventListener("click", function () {
    if (micOn) return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      msg.textContent = "Microphone is not available here. Use the Hold to blow button.";
      return;
    }
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
      micOn = true;
      var Ctx = window.AudioContext || window.webkitAudioContext;
      var ctx = new Ctx();
      var an = ctx.createAnalyser();
      an.fftSize = 512;
      ctx.createMediaStreamSource(stream).connect(an);
      var buf = new Uint8Array(an.fftSize);
      msg.textContent = "Listening... blow into your phone 💨";
      (function loop() {
        an.getByteTimeDomainData(buf);
        var sum = 0;
        for (var i = 0; i < buf.length; i++) { var v = (buf[i] - 128) / 128; sum += v * v; }
        var rms = Math.sqrt(sum / buf.length);
        if (rms > 0.12) tick(0.06);
        if (candles.some(function (c) { return !c.classList.contains("out"); })) {
          requestAnimationFrame(loop);
        } else {
          stream.getTracks().forEach(function (t) { t.stop(); });
          ctx.close();
          micOn = false;
        }
      })();
    }).catch(function () {
      msg.textContent = "Mic permission was blocked. Use the Hold to blow button instead.";
    });
  });

  /* ---------- envelope ---------- */
  $("env").addEventListener("click", function () {
    this.classList.add("open");
    $("paper").hidden = false;
    confetti(70);
  });

  /* ---------- capsules ---------- */
  var capText = $("capText");
  Array.prototype.forEach.call(document.querySelectorAll(".cap"), function (b) {
    b.addEventListener("click", function () {
      capText.textContent = b.getAttribute("data-t");
      b.classList.add("done");
      confetti(20);
    });
  });

  /* ---------- wish jar ---------- */
  var wishes = [
    "May this new year bring you unlimited happiness and success. ✨",
    "May every dream you have ever chased finally come true. 🌟",
    "May your days be full of laughter and your heart full of peace. 💖",
    "May you be surrounded by everyone who makes you smile. 🌸",
    "May Allah bless you with great health and a long life. 🤲",
    "May our friendship grow stronger with each passing day. ♾️",
    "May you always stay the genuine, kind person that you are. 💎",
    "May you reach milestones this year that make you proud. 🚀",
    "May sadness stay miles away and only joy knock on your door. 🚪",
    "May you have a day full of surprises, love and your favourite things. 🎁",
    "May you shine bright and beat every obstacle on your way. 🔥",
    "Thori si aqal aur matureness bhi aa jaye is saal! 😜",
    "Stop making excuses and give me my treat today! 🍉"
  ];
  var order = [], used = 0, strip = $("strip");
  function shuffle() {
    order = wishes.map(function (_, i) { return i; }).sort(function () { return Math.random() - 0.5; });
    used = 0;
  }
  shuffle();
  $("jar").addEventListener("click", function () {
    if (used >= order.length) shuffle();
    strip.textContent = wishes[order[used++]];
    strip.classList.remove("pop");
    void strip.offsetWidth;
    strip.classList.add("pop");
    $("count").textContent = used + " of " + wishes.length + " wishes";
  });

  /* ---------- finale ---------- */
  var replies = [
    "Party udhaar hai, aaj raat tak chahiye! 🍉",
    "Excuses band, treat shuru! 😜",
    "Sab se pakkay bestie ki treat banti hai! 🎂"
  ];
  var r = 0;
  $("treat").addEventListener("click", function () {
    $("treatMsg").textContent = replies[r++ % replies.length];
    confetti(60);
  });
})();
