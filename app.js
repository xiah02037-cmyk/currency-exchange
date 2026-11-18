/* Language packs live in packs.js. Switching replaces copy in place.
   Every theme line means: explore global currency exchange at factual mid-market rates.
   fx-lang-manual is the user's choice and is never overwritten by IP.
   If the region lookup fails, the page stays in English. */
(function () {
  "use strict";

  var MANUAL_KEY = "fx-lang-manual";
  var LANG_KEY = "fx-lang";
  var LANGS = FX_LANGS;
  var COUNTRY_LANG = FX_COUNTRY_LANG;
  var PACKS = FX_PACKS;
  var CODES = ["USD", "EUR", "GBP", "JPY", "CNY", "HKD", "AUD", "CAD", "SGD", "CHF", "KRW", "THB"];
  /* Checklist order: mid-market, spread apart, fees apart, arrival window, lock or refresh.
     1 means the public description usually shows it. These are not prices. */
  var PROVIDERS = [
    { id: "bank", ticks: [0, 0, 1, 1, 0] },
    { id: "airport", ticks: [0, 0, 0, 1, 0] },
    { id: "wise", ticks: [1, 1, 1, 1, 0] },
    { id: "remitly", ticks: [0, 0, 1, 1, 0] },
    { id: "xe", ticks: [1, 0, 0, 0, 0] },
    { id: "page", ticks: [1, 1, 1, 1, 1] }
  ];

  var state = {
    lang: "",
    source: "pending",
    from: "USD",
    to: "EUR",
    pct: 3,
    wall: "USD",
    openFaq: {},
    langOpen: false
  };

  var motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var tweens = new WeakMap();
  var compareSeen = false;
  var heroMedia = document.getElementById("heroMedia");
  var scrollQueued = false;

  function reducedMotion() {
    return motionQuery.matches;
  }

  function pack() {
    return PACKS[state.lang] || PACKS.en;
  }

  function fill(str, map) {
    return String(str).replace(/\{(\w+)\}/g, function (_, key) {
      return Object.prototype.hasOwnProperty.call(map, key) ? String(map[key]) : "";
    });
  }

  function formatAmount(n) {
    var rounded = Math.round(n * 100) / 100;
    return new Intl.NumberFormat("en", { maximumFractionDigits: 2 }).format(rounded);
  }

  function langMeta(id) {
    for (var i = 0; i < LANGS.length; i += 1) {
      if (LANGS[i].id === id) return LANGS[i];
    }
    return LANGS[0];
  }

  function storageGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  function storageSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) {}
  }

  function node(tag, className, text) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (text != null) el.textContent = text;
    return el;
  }

  function scoreOf(ticks) {
    return ticks.reduce(function (sum, bit) { return sum + (bit ? 1 : 0); }, 0);
  }

  function readAmount() {
    var raw = document.getElementById("amount").value;
    if (raw == null || String(raw).trim() === "") return { kind: "invalid" };
    var n = Number(raw);
    if (!isFinite(n) || n <= 0) return { kind: "invalid" };
    if (n > 1000000000) return { kind: "big" };
    return { kind: "ok", value: n };
  }

  function currentNumber(el) {
    var text = String(el.textContent || "").replace(/[^\d.-]/g, "");
    var n = Number(text);
    return isFinite(n) ? n : 0;
  }

  function tweenFormatted(el, to, ms) {
    var prev = tweens.get(el);
    if (prev) cancelAnimationFrame(prev);
    if (!(ms > 0)) {
      el.textContent = formatAmount(to);
      return;
    }
    var from = currentNumber(el);
    var t0 = performance.now();
    function frame(now) {
      var t = Math.min(1, (now - t0) / ms);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = formatAmount(from + (to - from) * eased);
      if (t < 1) tweens.set(el, requestAnimationFrame(frame));
      else tweens.delete(el);
    }
    tweens.set(el, requestAnimationFrame(frame));
  }

  function tweenInteger(el, to, ms) {
    var prev = tweens.get(el);
    if (prev) cancelAnimationFrame(prev);
    if (!(ms > 0)) {
      el.textContent = String(to);
      return;
    }
    var t0 = performance.now();
    function frame(now) {
      var t = Math.min(1, (now - t0) / ms);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(to * eased));
      if (t < 1) tweens.set(el, requestAnimationFrame(frame));
      else tweens.delete(el);
    }
    tweens.set(el, requestAnimationFrame(frame));
  }

  function applyStatic() {
    var copy = pack();
    var meta = langMeta(state.lang);
    document.documentElement.lang = meta.html;
    document.documentElement.dir = meta.dir;
    document.documentElement.setAttribute("data-lang", state.lang);
    document.title = copy.metaTitle;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (typeof copy[key] === "string") el.textContent = copy[key];
    });
  }

  function fillSelect(select, value) {
    var copy = pack();
    select.replaceChildren();
    CODES.forEach(function (code) {
      var opt = document.createElement("option");
      opt.value = code;
      opt.textContent = code + "  " + copy.currencies[code].name;
      select.appendChild(opt);
    });
    select.value = value;
  }

  function syncScenario() {
    document.querySelectorAll(".seg button").forEach(function (btn) {
      var on = Number(btn.getAttribute("data-pct")) === state.pct;
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function renderDemo() {
    var copy = pack();
    var from = state.from;
    var to = state.to;
    var fromInfo = copy.currencies[from];
    var toInfo = copy.currencies[to];
    document.getElementById("pairLine").textContent = fill(copy.pairLine, {
      fromName: fromInfo.name,
      from: from,
      toName: toInfo.name,
      to: to
    });
    var math = document.getElementById("mathBlock");
    var same = document.getElementById("sameMsg");
    var amount = readAmount();
    if (from === to) {
      math.hidden = true;
      same.hidden = false;
      same.textContent = copy.samePair;
      return;
    }
    if (amount.kind !== "ok") {
      math.hidden = true;
      same.hidden = false;
      same.textContent = amount.kind === "big" ? copy.tooBig : copy.invalidAmount;
      return;
    }
    math.hidden = false;
    same.hidden = true;
    var gap = amount.value * state.pct / 100;
    var keep = amount.value - gap;
    var ms = reducedMotion() ? 0 : 700;
    tweenFormatted(document.getElementById("keepValue"), keep, ms);
    tweenFormatted(document.getElementById("gapValue"), gap, ms);
    document.getElementById("keepUnit").textContent = from;
    document.getElementById("gapUnit").textContent = from;
    document.getElementById("gapBar").style.width = state.pct + "%";
    document.getElementById("gapCaption").textContent = fill(copy.gapCaption, {
      pct: String(state.pct),
      amount: formatAmount(amount.value),
      code: from
    });
    document.getElementById("noQuote").textContent = fill(copy.noQuote, {
      name: toInfo.name,
      code: to
    });
  }

  function renderFacts() {
    var box = document.getElementById("factList");
    box.replaceChildren();
    pack().facts.forEach(function (fact) {
      var card = node("article", "fact");
      card.appendChild(node("h3", "", fact.title));
      card.appendChild(node("span", "tag", fact.tag));
      card.appendChild(node("p", "", fact.body));
      box.appendChild(card);
    });
  }

  function renderRails() {
    var box = document.getElementById("rails");
    box.replaceChildren();
    pack().rails.forEach(function (rail) {
      var row = node("div", "rail");
      var left = node("div");
      left.appendChild(node("span", "", rail.name));
      left.appendChild(node("small", "", rail.note));
      row.appendChild(left);
      row.appendChild(node("b", "", rail.when));
      box.appendChild(row);
    });
  }

  function renderPains() {
    var list = document.getElementById("pains");
    list.replaceChildren();
    pack().pains.forEach(function (line) {
      list.appendChild(node("li", "", line));
    });
  }

  function renderLegend() {
    var list = document.getElementById("tickLegend");
    list.replaceChildren();
    pack().tickNames.forEach(function (name) {
      list.appendChild(node("li", "", name));
    });
  }

  function renderRows() {
    var copy = pack();
    var box = document.getElementById("rows");
    box.replaceChildren();
    var instant = reducedMotion();
    PROVIDERS.forEach(function (provider) {
      var meta = copy.providers[provider.id];
      var score = scoreOf(provider.ticks);
      var row = node("article", "row" + (provider.id === "page" ? " is-claim" : ""));
      var head = document.createElement("header");
      head.appendChild(node("h3", "", meta.name));
      var scoreEl = node("p", "score");
      var num = node("span", "score-num", instant ? String(score) : "0");
      num.setAttribute("data-to", String(score));
      scoreEl.appendChild(num);
      scoreEl.appendChild(node("span", "score-den", " / 5"));
      head.appendChild(scoreEl);
      row.appendChild(head);
      var bar = node("div", "bar");
      bar.setAttribute("aria-hidden", "true");
      var fillBar = node("span", "bar-fill");
      fillBar.style.setProperty("--p", String(score / 5));
      bar.appendChild(fillBar);
      row.appendChild(bar);
      var dots = node("p", "dots");
      var labelParts = provider.ticks.map(function (bit, index) {
        return copy.tickNames[index] + " " + (bit ? copy.yes : copy.no);
      });
      dots.setAttribute("aria-label", labelParts.join(", "));
      provider.ticks.forEach(function (bit) {
        dots.appendChild(node("span", bit ? "dot on" : "dot"));
      });
      row.appendChild(dots);
      row.appendChild(node("p", "blurb", meta.blurb));
      box.appendChild(row);
    });
  }

  function renderWallChips() {
    var copy = pack();
    var scroller = document.getElementById("wallScroll");
    scroller.setAttribute("aria-label", copy.wallScroller);
    scroller.replaceChildren();
    CODES.forEach(function (code) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip";
      btn.setAttribute("data-code", code);
      btn.appendChild(node("strong", "", code));
      btn.appendChild(node("span", "", copy.currencies[code].name));
      scroller.appendChild(btn);
    });
    syncWall();
  }

  function syncWall() {
    var copy = pack();
    var info = copy.currencies[state.wall];
    document.querySelectorAll("#wallScroll .chip").forEach(function (btn) {
      var on = btn.getAttribute("data-code") === state.wall;
      btn.classList.toggle("is-on", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    var detail = document.getElementById("wallDetail");
    detail.replaceChildren();
    detail.appendChild(node("p", "wall-code", state.wall));
    detail.appendChild(node("h3", "", info.name));
    detail.appendChild(node("p", "where", info.where));
    detail.appendChild(node("p", "read", fill(copy.wallRead, { name: info.name, code: state.wall })));
    var selected = document.querySelector('#wallScroll .chip.is-on');
    if (selected) revealChip(selected);
  }

  function revealChip(btn) {
    var scroller = document.getElementById("wallScroll");
    var btnRect = btn.getBoundingClientRect();
    var box = scroller.getBoundingClientRect();
    var pad = 36;
    if (btnRect.width === 0) return;
    if (btnRect.left < box.left + 12) {
      scroller.scrollLeft -= (box.left + 12 - btnRect.left);
    } else if (btnRect.right > box.right - pad) {
      scroller.scrollLeft += btnRect.right - (box.right - pad);
    }
  }

  function renderSteps() {
    var list = document.getElementById("stepList");
    list.replaceChildren();
    pack().steps.forEach(function (step, index) {
      var item = node("li", "step");
      item.appendChild(node("div", "step-num", String(index + 1)));
      var text = node("div");
      text.appendChild(node("h3", "", step.title));
      text.appendChild(node("p", "", step.body));
      item.appendChild(text);
      list.appendChild(item);
    });
  }

  function renderPoints() {
    var copy = pack();
    var box = document.getElementById("pointList");
    box.replaceChildren();
    copy.points.forEach(function (point) {
      var card = node("article", "card point");
      card.appendChild(node("h3", "", point.title));
      card.appendChild(node("p", "body", point.body));
      var check = node("p", "check");
      check.appendChild(node("b", "", copy.checkLabel + "  "));
      check.appendChild(document.createTextNode(point.check));
      card.appendChild(check);
      box.appendChild(card);
    });
  }

  function renderSafety() {
    var list = document.getElementById("safetyList");
    list.replaceChildren();
    pack().safetyItems.forEach(function (item) {
      list.appendChild(node("li", "", item));
    });
  }

  function renderFaq() {
    var box = document.getElementById("faqList");
    box.replaceChildren();
    pack().faqs.forEach(function (item, index) {
      var id = String(index);
      var open = !!state.openFaq[id];
      var wrap = node("div", "faq-item" + (open ? " is-open" : ""));
      wrap.setAttribute("data-id", id);
      var btn = document.createElement("button");
      btn.type = "button";
      btn.id = "faq-btn-" + id;
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.setAttribute("aria-controls", "faq-panel-" + id);
      var q = node("span", "", item.q);
      btn.appendChild(q);
      btn.appendChild(node("span", "chev"));
      var panel = node("div", "faq-a");
      panel.id = "faq-panel-" + id;
      panel.setAttribute("role", "region");
      panel.setAttribute("aria-labelledby", btn.id);
      panel.setAttribute("aria-hidden", open ? "false" : "true");
      var inner = node("div", "faq-a-inner");
      inner.appendChild(node("p", "", item.a));
      panel.appendChild(inner);
      wrap.appendChild(btn);
      wrap.appendChild(panel);
      box.appendChild(wrap);
    });
  }

  function renderLangList() {
    var list = document.getElementById("langList");
    if (list.childElementCount) return;
    LANGS.forEach(function (meta) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "lang-option";
      btn.setAttribute("role", "option");
      btn.setAttribute("data-pick", meta.id);
      btn.lang = meta.html;
      btn.dir = meta.dir;
      btn.appendChild(node("span", "lang-option-name", meta.label));
      btn.appendChild(node("span", "lang-option-code", meta.short));
      list.appendChild(btn);
    });
  }

  function renderLang() {
    renderLangList();
    var meta = langMeta(state.lang);
    var current = document.getElementById("langCurrent");
    current.textContent = meta.label;
    current.lang = meta.html;
    document.getElementById("langToggle").lang = meta.html;
    document.querySelectorAll(".lang-option").forEach(function (btn) {
      var on = btn.getAttribute("data-pick") === state.lang;
      btn.classList.toggle("is-on", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    var copy = pack();
    var status = document.getElementById("langStatus");
    if (state.source === "manual") status.textContent = copy.statusManual;
    else if (state.source === "ip") status.textContent = copy.statusIp;
    else if (state.source === "fallback") status.textContent = copy.statusFallback;
    else status.textContent = copy.statusPending;
  }

  function setLangOpen(open) {
    state.langOpen = open;
    document.getElementById("langBar").classList.toggle("is-open", open);
    document.getElementById("langToggle").setAttribute("aria-expanded", open ? "true" : "false");
    var panel = document.getElementById("langPanel");
    panel.setAttribute("aria-hidden", open ? "false" : "true");
    panel.inert = !open;
    if (!open) return;
    var list = document.getElementById("langList");
    var selected = list.querySelector(".lang-option.is-on");
    if (!selected) return;
    var top = selected.offsetTop - list.offsetTop - 8;
    list.scrollTop = top < 0 ? 0 : top;
  }

  function playCompare() {
    var section = document.getElementById("compare");
    var ms = reducedMotion() ? 0 : 900;
    section.querySelectorAll(".score-num").forEach(function (el) {
      tweenInteger(el, Number(el.getAttribute("data-to")) || 0, ms);
    });
    section.classList.remove("is-in");
    if (reducedMotion()) {
      section.classList.add("is-in");
      return;
    }
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        section.classList.add("is-in");
      });
    });
  }

  function armCompare() {
    compareSeen = false;
    var section = document.getElementById("compare");
    section.classList.remove("is-in");
    requestAnimationFrame(function () {
      var rect = section.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      if (rect.top < vh * 0.92 && rect.bottom > 80) {
        compareSeen = true;
        playCompare();
      }
    });
  }

  function apply(lang) {
    var same = state.lang === lang && document.documentElement.getAttribute("data-ready") === "1";
    state.lang = lang;
    if (same) {
      renderLang();
      return;
    }
    applyStatic();
    var fromSelect = document.getElementById("fromCcy");
    var toSelect = document.getElementById("toCcy");
    fillSelect(fromSelect, state.from);
    fillSelect(toSelect, state.to);
    state.from = fromSelect.value;
    state.to = toSelect.value;
    syncScenario();
    renderFacts();
    renderRails();
    renderPains();
    renderLegend();
    renderRows();
    renderWallChips();
    renderSteps();
    renderPoints();
    renderSafety();
    renderFaq();
    renderDemo();
    renderLang();
    document.documentElement.setAttribute("data-ready", "1");
    armCompare();
  }

  function canonicalManual(value) {
    if (value === "zh") return "zh-CN";
    return value && PACKS[value] ? value : "";
  }

  function readManual() {
    var stored = storageGet(MANUAL_KEY);
    var manual = canonicalManual(stored);
    if (manual && stored !== manual) storageSet(MANUAL_KEY, manual);
    return manual;
  }

  function choose(lang) {
    if (!PACKS[lang]) return;
    storageSet(MANUAL_KEY, lang);
    storageSet(LANG_KEY, lang);
    state.source = "manual";
    apply(lang);
    setLangOpen(false);
  }

  function codeOf(data) {
    if (!data || typeof data !== "object") return "";
    var candidates = [data.country_code, data.countryCode, data.country];
    for (var i = 0; i < candidates.length; i += 1) {
      var raw = String(candidates[i] || "").trim().toUpperCase();
      if (/^[A-Z]{2}$/.test(raw)) return raw;
    }
    return "";
  }

  function fetchJson(url) {
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, 4500);
    return fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: "application/json" }
    }).then(function (res) {
      if (!res.ok) throw new Error("status");
      return res.json();
    }).finally(function () {
      clearTimeout(timer);
    });
  }

  function detectCountry() {
    return fetchJson("https://get.geojs.io/v1/ip/country.json").then(function (data) {
      var code = codeOf(data);
      if (!code) throw new Error("shape");
      return code;
    }).catch(function () {
      return fetchJson("https://ipwho.is/").then(function (data) {
        if (data && data.success === false) throw new Error("geo");
        var code = codeOf(data);
        if (!code) throw new Error("shape");
        return code;
      });
    });
  }

  function initLanguage() {
    var manual = readManual();
    if (manual) {
      state.source = "manual";
      apply(manual);
      return;
    }
    state.source = "pending";
    apply("en");
    detectCountry().then(function (code) {
      if (readManual()) return;
      var mapped = COUNTRY_LANG[code];
      var lang = mapped && PACKS[mapped] ? mapped : "en";
      storageSet(LANG_KEY, lang);
      state.source = "ip";
      apply(lang);
    }).catch(function () {
      if (readManual()) return;
      storageSet(LANG_KEY, "en");
      state.source = "fallback";
      apply("en");
    });
  }

  function onScroll() {
    if (reducedMotion()) {
      heroMedia.style.transform = "";
      return;
    }
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || document.documentElement.scrollTop || 0;
      var shift = Math.max(-36, Math.min(48, y * 0.12));
      heroMedia.style.transform = "translate3d(0," + shift.toFixed(2) + "px,0)";
      scrollQueued = false;
    });
  }

  function bind() {
    document.getElementById("demoForm").addEventListener("submit", function (event) {
      event.preventDefault();
    });
    document.getElementById("amount").addEventListener("input", renderDemo);
    document.getElementById("fromCcy").addEventListener("change", function (event) {
      state.from = event.target.value;
      renderDemo();
    });
    document.getElementById("toCcy").addEventListener("change", function (event) {
      state.to = event.target.value;
      renderDemo();
    });
    document.querySelector(".seg").addEventListener("click", function (event) {
      var btn = event.target.closest("button[data-pct]");
      if (!btn) return;
      state.pct = Number(btn.getAttribute("data-pct"));
      syncScenario();
      renderDemo();
    });
    document.getElementById("wallScroll").addEventListener("click", function (event) {
      var btn = event.target.closest("button[data-code]");
      if (!btn) return;
      state.wall = btn.getAttribute("data-code");
      syncWall();
    });
    document.getElementById("faqList").addEventListener("click", function (event) {
      var btn = event.target.closest("button");
      if (!btn) return;
      var item = btn.closest(".faq-item");
      var id = item.getAttribute("data-id");
      var open = !state.openFaq[id];
      state.openFaq[id] = open;
      item.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      document.getElementById("faq-panel-" + id).setAttribute("aria-hidden", open ? "false" : "true");
    });
    document.getElementById("langToggle").addEventListener("click", function () {
      setLangOpen(!state.langOpen);
    });
    document.getElementById("langList").addEventListener("click", function (event) {
      var btn = event.target.closest("button[data-pick]");
      if (!btn) return;
      choose(btn.getAttribute("data-pick"));
    });
    document.addEventListener("click", function (event) {
      if (!state.langOpen) return;
      if (document.getElementById("langBar").contains(event.target)) return;
      setLangOpen(false);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && state.langOpen) setLangOpen(false);
    });
    window.addEventListener("scroll", onScroll, { passive: true });
    if (motionQuery.addEventListener) {
      motionQuery.addEventListener("change", function () {
        if (reducedMotion()) heroMedia.style.transform = "";
        renderRows();
        if (compareSeen || reducedMotion()) playCompare();
      });
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || compareSeen) return;
        compareSeen = true;
        playCompare();
      });
    }, { threshold: 0.22 });
    io.observe(document.getElementById("compare"));
  }

  bind();
  initLanguage();
})();
