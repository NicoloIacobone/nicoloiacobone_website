/* The stage of the hero: the point cloud and the arm, turned by a drag or the arrow keys.
   From design-system/examples/home.html. */
(function () {
  var root = document.documentElement;
  var stage = document.querySelector('.stage');
  var cv = stage && stage.querySelector('canvas');
  var ctx = cv && cv.getContext && cv.getContext('2d');
  if (!ctx) return;

  var P = JSON.parse(document.getElementById('stage-points').textContent);
  var A = JSON.parse(document.getElementById('stage-arm').textContent);
  var parts = [];   // links cut into short pieces, then joints: each sorts by its own depth
  A.l.forEach(function (l) {
    var a = A.j[l[0]], b = A.j[l[1]];
    var n = Math.max(1, Math.ceil(Math.sqrt(Math.pow(b[0] - a[0], 2) + Math.pow(b[1] - a[1], 2) + Math.pow(b[2] - a[2], 2)) / 90));
    for (var s = 0; s < n; s++) parts.push({
      a: [0, 1, 2].map(function (d) { return a[d] + (b[d] - a[d]) * s / n; }),
      b: [0, 1, 2].map(function (d) { return a[d] + (b[d] - a[d]) * (s + 1) / n; }),
      w: l[2], c: 'link' + l[3] });
  });
  A.j.forEach(function (j) { parts.push({ a: j, r: j[3] }); });
  var M = parts.length;
  var N = P.length / 4, S = 500, CX = 250, CYPX = 262, SC = 226, D = 4.6, CY = 0.6, FR = 1.25;
  var yaw = 0.8, pitch = 0.6;
  var X = new Float32Array(N), Y = new Float32Array(N), Z = new Float32Array(N + M), K = new Float32Array(N);
  var order = [], col = {}, i;
  for (i = 0; i < N + M; i++) order.push(i);

  function readColours() {
    ['near', 'far', 'floor', 'link0', 'link1', 'joint', 'core'].forEach(function (k) {
      var m = getComputedStyle(stage.querySelector('.stage__ink--' + k)).color.match(/[\d.]+/g);
      col[k] = m ? [+m[0], +m[1], +m[2]] : [128, 128, 128];
    });
  }
  function fit() {
    var d = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = cv.height = S * d;
    ctx.setTransform(d, 0, 0, d, 0, 0);
  }
  function draw() {
    var cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch), j;
    function at(q) {   // a point in millimetres to [x, y, depth, scale]
      var x = q[0] / 1000, y = q[1] / 1000 - CY, z = q[2] / 1000;
      var x1 = x * cy + z * sy, z1 = z * cy - x * sy;
      var y2 = y * cp - z1 * sp, z2 = y * sp + z1 * cp, k = D / (D - z2);
      return [CX + x1 * SC * k, CYPX - y2 * SC * k, z2, k];
    }
    function ink(c) { return 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')'; }
    for (j = 0; j < M; j++) {
      var pt = parts[j];
      pt.pa = at(pt.a);
      if (pt.b) { pt.pb = at(pt.b); Z[N + j] = (pt.pa[2] + pt.pb[2]) / 2; } else Z[N + j] = pt.pa[2] + 0.02;
    }
    for (i = 0; i < N; i++) {
      var x = P[4 * i] / 1000, y = P[4 * i + 1] / 1000 - CY, z = P[4 * i + 2] / 1000;
      var x1 = x * cy + z * sy, z1 = z * cy - x * sy;
      var y2 = y * cp - z1 * sp, z2 = y * sp + z1 * cp, k = D / (D - z2);
      X[i] = CX + x1 * SC * k; Y[i] = CYPX - y2 * SC * k; Z[i] = z2; K[i] = k;
    }
    order.sort(function (a, b) { return Z[a] - Z[b]; });
    ctx.clearRect(0, 0, S, S);
    for (j = 0; j < N + M; j++) {
      i = order[j];
      if (i >= N) {
        var t = parts[i - N];
        ctx.globalAlpha = 1;
        if (t.b) {
          ctx.strokeStyle = ink(col[t.c]); ctx.lineCap = 'round';
          ctx.lineWidth = t.w / 1000 * SC * (t.pa[3] + t.pb[3]) / 2;
          ctx.beginPath(); ctx.moveTo(t.pa[0], t.pa[1]); ctx.lineTo(t.pb[0], t.pb[1]); ctx.stroke();
        } else {
          var jr = t.r / 1000 * SC * t.pa[3];
          ctx.fillStyle = ink(col.joint); ctx.beginPath(); ctx.arc(t.pa[0], t.pa[1], jr, 0, 6.2832); ctx.fill();
          ctx.fillStyle = ink(col.core); ctx.beginPath(); ctx.arc(t.pa[0], t.pa[1], jr * 0.4, 0, 6.2832); ctx.fill();
        }
        continue;
      }
      var kind = P[4 * i + 3], near = Math.max(0, Math.min(1, (Z[i] + 1) / 2)), r, a, c;
      if (kind === 1) {
        var q = Math.sqrt(P[4 * i] * P[4 * i] + P[4 * i + 2] * P[4 * i + 2]) / 1000 / FR;
        r = 1.5 * K[i]; a = 0.36 * (1 - q * q * q * q); c = col.floor;
      } else {
        r = (kind === 2 ? 1.0 : kind === 3 ? 0.95 + 0.7 * near : 1.25 + 1.55 * near) * K[i];
        a = (kind === 2 ? 0.5 : kind === 3 ? 0.9 : 1) * (0.38 + 0.62 * near);
        c = [0, 1, 2].map(function (n) { return Math.round(col.far[n] + (col.near[n] - col.far[n]) * near); });
      }
      ctx.globalAlpha = Math.max(0, a);
      ctx.fillStyle = ink(c);
      ctx.beginPath(); ctx.arc(X[i], Y[i], r, 0, 6.2832); ctx.fill();
    }
  }

  var raf = 0, drag = null;
  function ask() { if (!raf) raf = requestAnimationFrame(function () { raf = 0; draw(); }); }
  function tilt(v) { return Math.max(0.14, Math.min(0.95, v)); }

  stage.addEventListener('pointerdown', function (e) {
    drag = { x: e.clientX, y: e.clientY, yaw: yaw, pitch: pitch };
    try { stage.setPointerCapture(e.pointerId); } catch (err) {}
    stage.classList.add('is-dragging');
  });
  stage.addEventListener('pointermove', function (e) {
    if (!drag) return;
    yaw = drag.yaw + (e.clientX - drag.x) * 0.008;
    pitch = tilt(drag.pitch + (e.clientY - drag.y) * 0.004);
    stage.classList.add('has-moved');
    ask();
  });
  ['pointerup', 'pointercancel'].forEach(function (t) {
    stage.addEventListener(t, function () { drag = null; stage.classList.remove('is-dragging'); });
  });
  stage.addEventListener('keydown', function (e) {
    var k = e.key;
    if (k === 'ArrowLeft') yaw -= 0.14; else if (k === 'ArrowRight') yaw += 0.14;
    else if (k === 'ArrowUp') pitch = tilt(pitch + 0.07); else if (k === 'ArrowDown') pitch = tilt(pitch - 0.07);
    else return;
    // the arrows turn the stage while it has focus: a page that also moves with the arrows must not move too
    e.preventDefault(); e.stopPropagation(); stage.classList.add('has-moved'); ask();
  });

  new MutationObserver(function () { readColours(); ask(); }).observe(root, { attributes: true, attributeFilter: ['data-theme', 'class', 'style'] });
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    if (mq.addEventListener) mq.addEventListener('change', function () { readColours(); ask(); });
  }
  window.addEventListener('resize', function () { fit(); ask(); });

  stage.setAttribute('tabindex', '0');
  if (!stage.hasAttribute('data-label-en')) stage.setAttribute('aria-label', stage.getAttribute('aria-label') + ' Drag it, or use the arrow keys, to turn it.');
  readColours(); fit(); draw();
  stage.classList.add('is-live');
})();
