/* The track of the home page: the stops, the bar, the six ways to move, the theme switch, NI.goStop.
   From design-system/examples/home.html. Load before ds/components.js. */
(function () {
  var root = document.documentElement, track = document.querySelector('.track');
  root.classList.add('js');
  var NI = window.NI = window.NI || {};   // NI.posters, NI.lang and NI.dossiers come from ds/components.js, loaded after this file
  var all = Array.prototype.slice.call(document.querySelectorAll('.stop')), stops = [], ticks = [];
  var list = document.querySelector('.ticks');
  function collect() {
    stops = all.filter(function (s) { return getComputedStyle(s).scrollSnapAlign.indexOf('none') < 0; });
    list.textContent = '';
    ticks = stops.map(function (s, i) {
      var li = document.createElement('li');
      if (i && s.getAttribute('data-sec') !== stops[i - 1].getAttribute('data-sec')) li.className = 'gap';
      list.appendChild(li); return li;
    });
  }
  collect();
  var items = Array.prototype.slice.call(document.querySelectorAll('.ni-nav__item'));
  var prev = document.querySelector('[data-prev]'), next = document.querySelector('[data-next]');
  var here = 0;
  function centre(el) { var m = parseFloat(getComputedStyle(el).scrollMarginLeft) || 0; return el.offsetLeft + el.offsetWidth / 2 - m / 2; }
  function nearest() {
    var mid = track.scrollLeft + track.clientWidth / 2, best = 0, d = Infinity;
    stops.forEach(function (s, i) { var x = Math.abs(centre(s) - mid); if (x < d) { d = x; best = i; } });
    return best;
  }
  function go(i) {
    i = Math.max(0, Math.min(stops.length - 1, i));
    track.scrollTo({ left: centre(stops[i]) - track.clientWidth / 2 });
  }
  function mark() {
    var was = here;
    here = nearest();
    if (was !== here && window.NI && NI.closePosters) NI.closePosters();
    all.forEach(function (s) { s.classList.toggle('is-here', s === stops[here] || (s.classList.contains('stop--label') && s.getAttribute('data-sec') === stops[here].getAttribute('data-sec'))); });
    ticks.forEach(function (t, i) { t.classList.toggle('is-here', i === here); });
    var sec = stops[here].getAttribute('data-sec');
    items.forEach(function (a) { if (a.getAttribute('data-go') === sec) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    prev.disabled = here === 0; next.disabled = here === stops.length - 1;
  }
  var raf = 0;
  track.addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(function () { raf = 0; mark(); }); });
  prev.addEventListener('click', function () { go(here - 1); });
  next.addEventListener('click', function () { go(here + 1); });
  var OLD = { hero: 'top', projects: 'work', research: 'work', path: 'about' };   // addresses of the old site still lead to their section
  function first(sec) { sec = OLD[sec] || sec; for (var i = 0; i < stops.length; i++) if (stops[i].getAttribute('data-sec') === sec) return i; return 0; }
  Array.prototype.forEach.call(document.querySelectorAll('[data-go]'), function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); go(first(a.getAttribute('data-go'))); });
  });
  // a click or a tap on a card beside the middle one brings that card to the middle. It does not open the card
  // or follow its links: that takes a second click, once the card is in the middle.
  track.addEventListener('click', function (e) {
    if (!e.detail || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;   // keyboard activation and modified clicks act as usual
    var s = e.target.closest('.stop');
    if (!s || s === e.target || s.classList.contains('is-here')) return;   // the empty margin of a stop, or the stop in the middle
    var i = stops.indexOf(s);
    if (i < 0) i = first(s.getAttribute('data-sec'));   // on wide screens the title of Beyond is not a stop: go to its first tile
    e.preventDefault(); e.stopPropagation();
    go(i);
  }, true);
  document.addEventListener('keydown', function (e) {
    if (document.querySelector('dialog[open]')) return;   // a dossier is open: the arrows are its own
    if (e.key === 'ArrowRight') { e.preventDefault(); go(here + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(here - 1); }
  });
  // a mouse wheel moves the track, unless the card under it still has something to scroll.
  // A sideways gesture (two fingers on a trackpad) belongs to the browser for its whole length, its first events
  // included: the axis is decided once per gesture, and nothing is prevented or scrolled before it is clear.
  // A swipe often starts with a small diagonal event; preventing it and scrolling the track by it started a
  // smooth scroll against the browser's own, and Safari makes a gesture whose first event was prevented wait
  // for the script at every event. Anything unclear goes to the browser.
  var last = -1e9, axis = '', sx = 0, sy = 0;
  function fine(e) { return e.deltaMode === 0 && typeof e.wheelDeltaY === 'number' && Math.abs(e.wheelDeltaY + 3 * e.deltaY) < 3; }   // a trackpad, not the notches of a wheel
  track.addEventListener('wheel', function (e) {
    var x = Math.abs(e.deltaX), y = Math.abs(e.deltaY);
    if (e.timeStamp - last > 200) { axis = ''; sx = sy = 0; }   // after a pause: a new gesture, or a new turn of the wheel
    last = e.timeStamp;
    if (!x && !y) return;
    sx += x; sy += y;
    if (!axis) {
      if (sy < 3 * sx) axis = 'x';                    // it moves sideways, even in part: the browser's
      else if (sy >= 8 || !fine(e)) axis = 'y';       // a wheel notch decides at once, a trackpad after a few pixels
      else return;
    }
    if (axis === 'y' && x > y) axis = 'x';           // the gesture turned sideways: the browser's until it ends
    if (axis === 'x') return;
    var s = e.target.closest('.stop');
    if (s && s.scrollHeight > s.clientHeight + 1) {
      var up = e.deltaY < 0;
      if ((up && s.scrollTop > 0) || (!up && s.scrollTop + s.clientHeight < s.scrollHeight - 1)) return;
    }
    e.preventDefault();
    track.scrollBy({ left: e.deltaY, behavior: 'auto' });
  }, { passive: false });
  document.querySelector('[data-theme-switch]').addEventListener('click', function () {
    var dark = root.getAttribute('data-theme') ? root.getAttribute('data-theme') === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-theme', dark ? 'light' : 'dark');
    try { localStorage.setItem('theme', dark ? 'light' : 'dark'); } catch (e) {}   // the same key as the current site
  });


  function fromHash() { if (NI.skipHash) { NI.skipHash = false; return; } var h = location.hash.slice(1); if (h && !(NI.isDossier && NI.isDossier(h))) { track.style.scrollBehavior = 'auto'; go(first(h)); track.style.scrollBehavior = ''; } }
  // bring one stop to the middle at once: a dossier opened from its address needs its card under it
  NI.goStop = function (el) { var i = stops.indexOf(el); if (i < 0) return; track.style.scrollBehavior = 'auto'; go(i); track.style.scrollBehavior = ''; mark(); };

  window.addEventListener('hashchange', fromHash);
  window.addEventListener('resize', function () { var cur = stops[here]; collect(); here = Math.max(0, stops.indexOf(cur)); go(here); mark(); });
  fromHash(); mark();
})();
