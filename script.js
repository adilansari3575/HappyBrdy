/* ---------- Floating emoji particles ---------- */
(function createParticles() {
  const container = document.getElementById("particles");
  if (!container) return;
  const emojis = ["❤", "💖", "🌸", "🌺", "💕", "💗", "🌷"];
  const count = Math.min(50, Math.max(30, Math.floor(window.innerWidth / 25)));

  for (let i = 0; i < count; i++) {
    const span = document.createElement("span");
    span.className = "particle";
    span.textContent = emojis[Math.floor(Math.random() * emojis.length)];

    span.style.left = Math.random() * 100 + "%";
    span.style.top = Math.random() * 100 + "%";

    const size = Math.random() * 22 + 12; // 12–34px
    span.style.fontSize = size + "px";
    span.style.opacity = (0.4 + Math.random() * 0.6).toFixed(2);

    const dur = (10 + Math.random() * 14).toFixed(2);
    const delay = (-Math.random() * dur).toFixed(2);
    span.style.animation = `float ${dur}s linear ${delay}s infinite`;

    container.appendChild(span);
  }
})();

/* ---------- Firework + balloon “Happy Birthday” canvas animation ---------- */
const c = document.getElementById("c");
if (!c) throw new Error("Canvas element with id='c' not found.");
const ctx = c.getContext("2d");
let w = (c.width = window.innerWidth);
let h = (c.height = window.innerHeight);
let hw = w / 2,
  hh = h / 2;

const opts = {
  strings: ["HAPPY", "BIRTHDAY!", "to You"],
  charSize: 30,
  charSpacing: 35,
  lineHeight: 40,
  cx: w / 2,
  cy: h / 2,
  fireworkPrevPoints: 10,
  fireworkBaseLineWidth: 5,
  fireworkAddedLineWidth: 8,
  fireworkSpawnTime: 200,
  fireworkBaseReachTime: 30,
  fireworkAddedReachTime: 30,
  fireworkCircleBaseSize: 20,
  fireworkCircleAddedSize: 10,
  fireworkCircleBaseTime: 30,
  fireworkCircleAddedTime: 30,
  fireworkCircleFadeBaseTime: 10,
  fireworkCircleFadeAddedTime: 5,
  fireworkBaseShards: 5,
  fireworkAddedShards: 5,
  fireworkShardPrevPoints: 3,
  fireworkShardBaseVel: 4,
  fireworkShardAddedVel: 2,
  fireworkShardBaseSize: 3,
  fireworkShardAddedSize: 3,
  gravity: 0.1,
  upFlow: -0.1,
  letterContemplatingWaitTime: 360,
  balloonSpawnTime: 20,
  balloonBaseInflateTime: 10,
  balloonAddedInflateTime: 10,
  balloonBaseSize: 20,
  balloonAddedSize: 20,
  balloonBaseVel: 0.4,
  balloonAddedVel: 0.4,
  balloonBaseRadian: -(Math.PI / 2 - 0.5),
  balloonAddedRadian: -1,
};

const Tau = Math.PI * 2;
const TauQuarter = Tau / 4;
ctx.font = opts.charSize + "px Verdana";

const letters = [];
const calc = {
  totalWidth:
    opts.charSpacing *
    Math.max(opts.strings[0].length, opts.strings[1].length),
};

/* ---------- Letter class ---------- */
function Letter(char, x, y) {
  this.char = char;
  this.x = x;
  this.y = y;
  this.dx = -ctx.measureText(char).width / 2;
  this.dy = +opts.charSize / 2;
  this.fireworkDy = this.y - hh;
  const hue = (x / calc.totalWidth) * 360;
  this.color = `hsl(${hue},80%,50%)`;
  // keep the original placeholders; replace() calls later expect "light" and "alp" substrings
  this.lightAlphaColor = `hsla(${hue},80%,light%,alp)`;
  this.lightColor = `hsl(${hue},80%,light%)`;
  this.alphaColor = `hsla(${hue},80%,50%,alp)`;
  this.reset();
}
Letter.prototype.reset = function () {
  this.phase = "firework";
  this.tick = 0;
  this.spawned = false;
  this.spawningTime = (opts.fireworkSpawnTime * Math.random()) | 0;
  this.reachTime =
    (opts.fireworkBaseReachTime +
      opts.fireworkAddedReachTime * Math.random()) |
    0;
  this.lineWidth =
    opts.fireworkBaseLineWidth +
    opts.fireworkAddedLineWidth * Math.random();
  this.prevPoints = [[0, hh, 0]];
};
Letter.prototype.step = function () {
  // --- firework phase ---
  if (this.phase === "firework") {
    if (!this.spawned) {
      if (++this.tick >= this.spawningTime) {
        this.tick = 0;
        this.spawned = true;
      }
    } else {
      ++this.tick;
      const linear = this.tick / this.reachTime,
        armonic = Math.sin(linear * TauQuarter),
        x = linear * this.x,
        y = hh + armonic * this.fireworkDy;

      if (this.prevPoints.length > opts.fireworkPrevPoints)
        this.prevPoints.shift();
      this.prevPoints.push([x, y, linear * this.lineWidth]);

      const lwProp = 1 / (this.prevPoints.length - 1);
      for (let i = 1; i < this.prevPoints.length; ++i) {
        const p = this.prevPoints[i],
          p2 = this.prevPoints[i - 1];
        ctx.strokeStyle = this.alphaColor.replace(
          "alp",
          i / this.prevPoints.length
        );
        ctx.lineWidth = p[2] * lwProp * i;
        ctx.beginPath();
        ctx.moveTo(p[0], p[1]);
        ctx.lineTo(p2[0], p2[1]);
        ctx.stroke();
      }
      if (this.tick >= this.reachTime) {
        this.phase = "contemplate";
        this.circleFinalSize =
          opts.fireworkCircleBaseSize +
          opts.fireworkCircleAddedSize * Math.random();
        this.circleCompleteTime =
          (opts.fireworkCircleBaseTime +
            opts.fireworkCircleAddedTime * Math.random()) |
          0;
        this.circleFadeTime =
          (opts.fireworkCircleFadeBaseTime +
            opts.fireworkCircleFadeAddedTime * Math.random()) |
          0;
        this.circleCreating = true;
        this.circleFading = false;
        this.tick = 0;
        this.tick2 = 0;
        this.shards = [];

        const shardCount =
          (opts.fireworkBaseShards +
            opts.fireworkAddedShards * Math.random()) |
          0,
          angle = Tau / shardCount,
          cos = Math.cos(angle),
          sin = Math.sin(angle);
        let x1 = 1,
          y1 = 0;
        for (let i = 0; i < shardCount; ++i) {
          const x2 = x1;
          x1 = x1 * cos - y1 * sin;
          y1 = y1 * cos + x2 * sin;
          this.shards.push(new Shard(this.x, this.y, x1, y1, this.alphaColor));
        }
      }
    }

    // --- contemplate phase ---
  } else if (this.phase === "contemplate") {
    ++this.tick;
    if (this.circleCreating) {
      ++this.tick2;
      const prop = this.tick2 / this.circleCompleteTime,
        armonic = -Math.cos(prop * Math.PI) / 2 + 0.5;
      ctx.fillStyle = this.lightAlphaColor
        .replace("light", 50 + 50 * prop)
        .replace("alp", prop);
      ctx.beginPath();
      ctx.arc(this.x, this.y, armonic * this.circleFinalSize, 0, Tau);
      ctx.fill();
      if (this.tick2 > this.circleCompleteTime) {
        this.tick2 = 0;
        this.circleCreating = false;
        this.circleFading = true;
      }
    } else if (this.circleFading) {
      ctx.fillStyle = this.lightColor.replace("light", 70);
      ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);
      ++this.tick2;
      const prop = this.tick2 / this.circleFadeTime,
        armonic = -Math.cos(prop * Math.PI) / 2 + 0.5;
      ctx.fillStyle = this.lightAlphaColor
        .replace("light", 100)
        .replace("alp", 1 - armonic);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.circleFinalSize, 0, Tau);
      ctx.fill();
      if (this.tick2 >= this.circleFadeTime) this.circleFading = false;
    } else {
      ctx.fillStyle = this.lightColor.replace("light", 70);
      ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);
    }
    for (let i = 0; i < this.shards.length; ++i) {
      this.shards[i].step();
      if (!this.shards[i].alive) {
        this.shards.splice(i, 1);
        --i;
      }
    }
    if (this.tick > opts.letterContemplatingWaitTime) {
      this.phase = "balloon";
      this.tick = 0;
      this.spawning = true;
      this.spawnTime = (opts.balloonSpawnTime * Math.random()) | 0;
      this.inflating = false;
      this.inflateTime =
        (opts.balloonBaseInflateTime +
          opts.balloonAddedInflateTime * Math.random()) |
        0;
      this.size =
        (opts.balloonBaseSize + opts.balloonAddedSize * Math.random()) | 0;
      const rad =
          opts.balloonBaseRadian +
          opts.balloonAddedRadian * Math.random(),
        vel =
          opts.balloonBaseVel + opts.balloonAddedVel * Math.random();
      this.vx = Math.cos(rad) * vel;
      this.vy = Math.sin(rad) * vel;
    }

    // --- balloon phase ---
  } else if (this.phase === "balloon") {
    ctx.strokeStyle = this.lightColor.replace("light", 80);
    if (this.spawning) {
      ++this.tick;
      ctx.fillStyle = this.lightColor.replace("light", 70);
      ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);
      if (this.tick >= this.spawnTime) {
        this.tick = 0;
        this.spawning = false;
        this.inflating = true;
      }
    } else if (this.inflating) {
      ++this.tick;
      const prop = this.tick / this.inflateTime,
        x = (this.cx = this.x),
        y = (this.cy = this.y - this.size * prop);
      ctx.fillStyle = this.alphaColor.replace("alp", prop);
      ctx.beginPath();
      generateBalloonPath(x, y, this.size * prop);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, this.y);
      ctx.stroke();
      ctx.fillStyle = this.lightColor.replace("light", 70);
      ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);
      if (this.tick >= this.inflateTime) {
        this.tick = 0;
        this.inflating = false;
      }
    } else {
      this.cx += this.vx;
      this.cy += (this.vy += opts.upFlow);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      generateBalloonPath(this.cx, this.cy, this.size);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(this.cx, this.cy);
      ctx.lineTo(this.cx, this.cy + this.size);
      ctx.stroke();
      ctx.fillStyle = this.lightColor.replace("light", 70);
      ctx.fillText(
        this.char,
        this.cx + this.dx,
        this.cy + this.dy + this.size
      );
      if (this.cy + this.size < -hh || this.cx < -hw || this.cy > hw)
        this.phase = "done";
    }
  }
};

function Shard(x, y, vx, vy, color) {
  const vel =
    opts.fireworkShardBaseVel + opts.fireworkShardAddedVel * Math.random();
  this.vx = vx * vel;
  this.vy = vy * vel;
  this.x = x;
  this.y = y;
  this.prevPoints = [[x, y]];
  this.color = color;
  this.alive = true;
  this.size =
    opts.fireworkShardBaseSize +
    opts.fireworkShardAddedSize * Math.random();
}
Shard.prototype.step = function () {
  this.x += this.vx;
  this.y += (this.vy += opts.gravity);
  if (this.prevPoints.length > opts.fireworkShardPrevPoints)
    this.prevPoints.shift();
  this.prevPoints.push([this.x, this.y]);
  const lwProp = this.size / this.prevPoints.length;
  for (let k = 0; k < this.prevPoints.length - 1; ++k) {
    const p = this.prevPoints[k],
      p2 = this.prevPoints[k + 1];
    ctx.strokeStyle = this.color.replace("alp", k / this.prevPoints.length);
    ctx.lineWidth = k * lwProp;
    ctx.beginPath();
    ctx.moveTo(p[0], p[1]);
    ctx.lineTo(p2[0], p2[1]);
    ctx.stroke();
  }
  if (this.prevPoints[0][1] > hh) this.alive = false;
};

function generateBalloonPath(x, y, size) {
  ctx.moveTo(x, y);
  ctx.bezierCurveTo(x - size / 2, y - size / 2, x - size / 4, y - size, x, y - size);
  ctx.bezierCurveTo(x + size / 4, y - size, x + size / 2, y - size / 2, x, y);
}

function anim() {
  requestAnimationFrame(anim);
  ctx.save();
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, w, h);
  ctx.translate(hw, hh);
  let done = true;
  for (let l = 0; l < letters.length; ++l) {
    letters[l].step();
    if (letters[l].phase !== "done") done = false;
  }
  ctx.restore();
  if (done) for (let l = 0; l < letters.length; ++l) letters[l].reset();
}

/* Create all letters */
for (let i = 0; i < opts.strings.length; ++i) {
  for (let j = 0; j < opts.strings[i].length; ++j) {
    letters.push(
      new Letter(
        opts.strings[i][j],
        j * opts.charSpacing +
          opts.charSpacing / 2 -
          (opts.strings[i].length * opts.charSize) / 2,
        i * opts.lineHeight +
          opts.lineHeight / 2 -
          (opts.strings.length * opts.lineHeight) / 2
      )
    );
  }
}

/* Handle resize once */
window.addEventListener("resize", () => {
  w = c.width = window.innerWidth;
  h = c.height = window.innerHeight;
  hw = w / 2;
  hh = h / 2;
  ctx.font = opts.charSize + "px Verdana";
});

/* Show Last Surprise button (safe guard) */
function showLastSurpriseButton() {
  const el = document.getElementById("lastSurprise");
  if (!el) return;
  el.style.display = "block";
}

/* Start on button click */
const cta = document.getElementById("ctaBtn");
if (cta) {
  cta.addEventListener("click", () => {
    cta.style.display = "none";
    c.style.display = "block";
    anim();
    // show "Last Surprise" after 6s (adjust as desired)
    setTimeout(showLastSurpriseButton, 6000);
  });
}

/* ---------- 3D Carousel ---------- */
const carousel = document.getElementById("carousel");
if (carousel) {
  const figures = carousel.getElementsByTagName("figure");
  const numPics = figures.length || 1;
  const angleStep = 360 / Math.max(1, numPics);

  // Arrange images in a circle
  for (let i = 0; i < numPics; i++) {
    figures[i].style.transform = `rotateY(${i * angleStep}deg) translateZ(400px)`;
  }

  let startX = 0;
  let currentRotation = 0;

  const lastBtn = document.getElementById("lastBtn");
  if (lastBtn) {
    lastBtn.addEventListener("click", () => {
      const lastSurprise = document.getElementById("lastSurprise");
      const slideshow = document.getElementById("slideshow");
      if (lastSurprise) lastSurprise.style.display = "none";
      if (slideshow) slideshow.style.display = "flex";
    });
  }

  // Mouse drag
  carousel.addEventListener("mousedown", (e) => {
    startX = e.clientX;
    document.onmousemove = drag;
    document.onmouseup = stopDrag;
  });
  function drag(e) {
    const deltaX = e.clientX - startX;
    carousel.style.transform = `translateZ(-400px) rotateY(${currentRotation + deltaX / 2}deg)`;
  }
  function stopDrag(e) {
    const deltaX = e.clientX - startX;
    currentRotation += deltaX / 2;
    document.onmousemove = null;
    document.onmouseup = null;
  }

  // Touch drag
  carousel.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
  });
  carousel.addEventListener("touchmove", (e) => {
    const deltaX = e.touches[0].clientX - startX;
    carousel.style.transform = `translateZ(-400px) rotateY(${currentRotation + deltaX / 2}deg)`;
  });
  carousel.addEventListener("touchend", (e) => {
    const deltaX = e.changedTouches[0].clientX - startX;
    currentRotation += deltaX / 2;
  });
}
