/* Nicolò Iacobone design system: the scripts of the components.
   PosterCard and MiniCard: a tap, a click or Enter on the round button opens a card and closes the others.
   LangSwitch: Italian or English, from the saved choice or from the language of the browser.
   Load this file at the end of <body>. After adding cards to the page, call NI.posters() again: a card is never bound twice.
   Put the short script of tools/lang.py (HEAD) in <head> too, so the wrong language never flashes. */
(function () {
  // PosterCard: a tap, a click or Enter on the button opens one card and closes the others
  var NI = window.NI = window.NI || {};
  NI.posters = function (scope) {
    var all = Array.prototype.slice.call((scope || document).querySelectorAll('.ni-poster, .ni-mini'));
    function setOpen(f, on) {
      f.classList.toggle('is-open', on);
      f.querySelector('.ni-poster__toggle').setAttribute('aria-expanded', on ? 'true' : 'false');
    }
    all.forEach(function (f) {
      if (f.hasAttribute('data-ni-bound')) return;
      f.setAttribute('data-ni-bound', '');
      f.addEventListener('click', function (e) {
        if (e.target.closest('a')) return;
        var on = !f.classList.contains('is-open');
        all.forEach(function (g) { if (g !== f) setOpen(g, false); });
        setOpen(f, on);
        if (!on && document.activeElement && f.contains(document.activeElement)) document.activeElement.blur();
      });
    });
    NI.closePosters = function () { all.forEach(function (g) { setOpen(g, false); }); };
    NI.openPoster = function (f) { all.forEach(function (g) { setOpen(g, g === f); }); };   // the card under a dossier stays open on its details
  };
  NI.posters();

  // LangSwitch: the saved choice, or the language of the browser. The two buttons change it and save it.
  var NI = window.NI = window.NI || {};
  NI.lang = function () {
    var root = document.documentElement, buttons = Array.prototype.slice.call(document.querySelectorAll('.ni-lang__btn'));
    function detect() {
      var l = null;
      try { l = localStorage.getItem('lang'); } catch (e) {}
      if (l === 'it' || l === 'en') return l;
      var n = (navigator.languages && navigator.languages[0]) || navigator.language || 'en';
      return n.toLowerCase().indexOf('it') === 0 ? 'it' : 'en';
    }
    function apply(l) {
      root.setAttribute('lang', l);
      Array.prototype.forEach.call(document.querySelectorAll('[data-label-' + l + ']'), function (e) { e.setAttribute('aria-label', e.getAttribute('data-label-' + l)); });
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === l)); });
    }
    buttons.forEach(function (b) {
      if (b.hasAttribute('data-ni-bound')) return;
      b.setAttribute('data-ni-bound', '');
      b.addEventListener('click', function () {
        var l = b.getAttribute('data-lang');
        try { localStorage.setItem('lang', l); } catch (e) {}
        apply(l);
      });
    });
    apply(detect());
  };
  NI.lang();
})();

(function () {
  // Dossier: the third state of a card. The card grows to the whole screen and holds the page of its project.
  // The address decides: #p-… opens a dossier and anything else closes it. The button of the card, the round
  // button, Esc, Back and a link from one dossier to another all end in sync().
  var NI = window.NI = window.NI || {};
  NI.dossiers = function () {
    var D = {}, list = Array.prototype.slice.call(document.querySelectorAll('dialog.ni-dossier'));
    list.forEach(function (d) { D[d.id] = d; });
    NI.isDossier = function (id) { return Object.prototype.hasOwnProperty.call(D, id); };
    if (!list.length || !list[0].showModal) return;
    var T = 650, EASE = 'cubic-bezier(.2,.8,.2,1)';   // the time and the curve of the PosterCard
    var still = window.matchMedia('(prefers-reduced-motion: reduce)');
    var cur = null, card = null, parts = [], pushed = false, busy = false;
    var framed = false;   // inside a frame the history belongs to the page around it: the dossier never steps back in it
    try { framed = window.top !== window; } catch (e) { framed = true; }

    function each(scope, sel, fn) { Array.prototype.forEach.call(scope.querySelectorAll(sel), fn); }
    function cardOf(id) { return document.querySelector('[data-dossier="' + id + '"]'); }
    // the rectangle a drawing really covers inside its box
    function drawn(el) {
      var r = el.getBoundingClientRect(), svg = el.querySelector('svg'), vb = svg.viewBox.baseVal;
      var par = svg.getAttribute('preserveAspectRatio') || 'xMidYMid';
      var k = Math.min(r.width / vb.width, r.height / vb.height), w = vb.width * k, h = vb.height * k;
      return { x: /xMin/.test(par) ? r.left : /xMax/.test(par) ? r.right - w : r.left + (r.width - w) / 2,
               y: /YMin/.test(par) ? r.top : /YMax/.test(par) ? r.bottom - h : r.top + (r.height - h) / 2, w: w, h: h };
    }
    // the transform that puts a drawing, from where it is now, on the rectangle `on`
    function place(el, on) {
      var b = el.getBoundingClientRect(), now = drawn(el), s = on.w / now.w;
      return 'translate(' + (on.x - b.left - s * (now.x - b.left)) + 'px,' + (on.y - b.top - s * (now.y - b.top)) + 'px) scale(' + s + ')';
    }
    function inset(r, d, radius) {
      return 'inset(' + (r.top - d.top) + 'px ' + (d.right - r.right) + 'px ' + (d.bottom - r.bottom) + 'px ' + (r.left - d.left) + 'px round ' + radius + ')';
    }
    function moves(d) { return !still.matches && !!d.animate; }

    function open(id, move) {
      var d = D[id];
      card = cardOf(id);
      var stop = card && card.closest('.stop');
      if (!move && stop && NI.goStop) NI.goStop(stop);   // a direct address: the card is brought under its dossier first
      move = move && card && moves(d);
      var first = {}, box, radius, tb;
      parts = [];
      if (card) {
        box = card.getBoundingClientRect(); radius = getComputedStyle(card).borderTopLeftRadius;
        tb = card.querySelector('.ni-poster__toggle').getBoundingClientRect();
        [['name', '.ni-poster__name, .ni-mini__name'], ['cover', '.ni-poster__cover']].forEach(function (p) {
          var el = card.querySelector(p[1]), slot = d.querySelector('.ni-dossier__' + p[0]);
          if (!el || !slot) return;
          first[p[0]] = drawn(el);
          var vb = el.querySelector('svg').viewBox.baseVal;
          slot.style.setProperty('--ar', vb.width / vb.height);
          parts.push({ key: p[0], el: el, slot: slot, home: el.parentNode, next: el.nextSibling });
        });
        if (NI.openPoster) NI.openPoster(card);
        card.classList.add('is-away');
      }
      cur = d;
      d.showModal();
      d.scrollTop = 0;
      parts.forEach(function (p) { p.slot.appendChild(p.el); });
      if (!move) return;
      busy = true;
      var o = { duration: T, easing: EASE }, db = d.getBoundingClientRect();
      parts.forEach(function (p) { p.el.animate([{ transform: place(p.el, first[p.key]) }, { transform: 'none' }], o); });
      var x = d.querySelector('.ni-dossier__close'), xb = x.getBoundingClientRect();
      x.animate([{ transform: 'translate(' + (tb.left - xb.left) + 'px,' + (tb.top - xb.top) + 'px)' }, { transform: 'none' }], o);
      each(d, '.ni-dossier__in', function (e) { e.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 380, delay: 240, easing: 'ease', fill: 'backwards' }); });
      d.animate([{ clipPath: inset(box, db, radius) }, { clipPath: inset(db, db, '0px') }], o).onfinish = function () { busy = false; };
    }

    function shut(move) {
      var d = cur, c = card;
      if (!d) return;
      function end() {
        if (d.getAnimations) d.getAnimations({ subtree: true }).forEach(function (a) { a.cancel(); });
        parts.forEach(function (p) { p.home.insertBefore(p.el, p.next); });
        parts = [];
        each(d, 'video', function (v) { v.pause(); });
        d.close();
        cur = card = null; busy = false;
        if (c) {
          requestAnimationFrame(function () { c.classList.remove('is-away'); });
          var m = c.querySelector('.ni-more');
          if (m) m.focus({ preventScroll: true });
        }
      }
      if (!(move && c && moves(d))) return end();
      busy = true;
      var o = { duration: T, easing: EASE, fill: 'forwards' }, db = d.getBoundingClientRect(), last = {};
      // where the drawings go back to: they are put home for a moment, measured, and brought back to move
      parts.forEach(function (p) { p.home.insertBefore(p.el, p.next); });
      parts.forEach(function (p) { last[p.key] = drawn(p.el); });
      parts.forEach(function (p) { p.slot.appendChild(p.el); });
      parts.forEach(function (p) { p.el.animate([{ transform: 'none' }, { transform: place(p.el, last[p.key]) }], o); });
      var x = d.querySelector('.ni-dossier__close'), xb = x.getBoundingClientRect(), tb = c.querySelector('.ni-poster__toggle').getBoundingClientRect();
      x.animate([{ transform: 'none' }, { transform: 'translate(' + (tb.left - xb.left) + 'px,' + (tb.top - xb.top) + 'px)' }], o);
      each(d, '.ni-dossier__in', function (e) { e.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, easing: 'ease', fill: 'forwards' }); });
      d.animate([{ clipPath: inset(db, db, '0px') }, { clipPath: inset(c.getBoundingClientRect(), db, getComputedStyle(c).borderTopLeftRadius) }], o).onfinish = end;
    }

    function wanted() { var h = location.hash.slice(1); return NI.isDossier(h) ? h : null; }
    function sync() {
      var id = wanted();
      if (id && cur && cur.id === id) return;
      if (id) { if (cur) shut(false); open(id, false); }
      else if (cur) { pushed = false; shut(true); }
    }
    function clear() {   // the address without the dossier
      try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
      if (wanted()) { NI.skipHash = true; location.hash = 'work'; }
      sync();
    }
    // the reader asks to close. A dossier opened from its card goes back one step in the history, so Back never reopens it
    function leave() {
      if (busy) return;
      if (!pushed || framed) { pushed = false; return clear(); }
      pushed = false; NI.skipHash = true;
      history.back();
      setTimeout(function () { NI.skipHash = false; if (cur && wanted()) clear(); }, 350);
    }

    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest ? e.target.closest('a') : null;
      if (!a) return;
      if (a.hasAttribute('data-dossier-close')) { e.preventDefault(); leave(); return; }
      var href = a.getAttribute('href') || '', id = href.slice(1);
      if (href.charAt(0) !== '#' || !NI.isDossier(id)) return;
      e.preventDefault();
      if (busy) return;
      var from = a.closest('[data-dossier]');
      if (!cur && from && from.getAttribute('data-dossier') === id) { pushed = true; open(id, true); }
      // from one dossier to another the address is replaced, so the round button and Back always lead out to the cards
      if (cur && cur.id !== id) location.replace('#' + id); else location.hash = id;
    });
    list.forEach(function (d) {
      d.addEventListener('cancel', function (e) { e.preventDefault(); leave(); });   // Esc
      each(d, '.ni-video', function (f) {
        var v = f.querySelector('video');
        f.querySelector('.ni-video__play').addEventListener('click', function () {
          f.classList.add('is-playing'); v.controls = true;
          var p = v.play();
          if (p && p.catch) p.catch(function () { f.classList.remove('is-playing'); v.controls = false; });
        });
      });
      each(d, '.ni-code__copy', function (b) {
        b.addEventListener('click', function () {
          var code = b.closest('.ni-code').querySelector('code').cloneNode(true);
          each(code, '.p, .c', function (n) { n.remove(); });
          var text = code.textContent.replace(/^\n+|\n+$/g, '').replace(/\n{2,}/g, '\n');
          try { navigator.clipboard.writeText(text).then(function () { b.classList.add('is-done'); setTimeout(function () { b.classList.remove('is-done'); }, 1600); }, function () {}); } catch (err) {}
        });
      });
    });
    window.addEventListener('hashchange', sync);
    sync();
  };
  NI.dossiers();
})();
