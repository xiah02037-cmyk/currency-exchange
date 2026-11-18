import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import HeroArt from "./HeroArt.jsx";
import { COUNTRY, LANGS, PACKS } from "./i18n.js";
import { ASSETS, PAIRS, convert, formatAmount, formatRate } from "./rates.js";

const MANUAL = "gx-lang-manual";
const LEGACY = "fx-lang-manual";

function readManual() {
  try {
    let id = localStorage.getItem(MANUAL) || localStorage.getItem(LEGACY);
    if (id === "zh") id = "zh-CN";
    return PACKS[id] ? id : null;
  } catch {
    return null;
  }
}

async function lookupCountry() {
  const pull = async (url, pick) => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4500);
    try {
      const res = await fetch(url, { signal: ctrl.signal });
      if (!res.ok) return null;
      const data = await res.json();
      const code = pick(data);
      return typeof code === "string" ? code.toUpperCase() : null;
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  };
  return (
    (await pull("https://get.geojs.io/v1/ip/country.json", (d) => d && d.country)) ||
    (await pull("https://ipwho.is/", (d) => d && d.country_code))
  );
}

function fill(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? "");
}

export default function App() {
  const reduce = useReducedMotion();
  const [lang, setLang] = useState(() => readManual() || "en");
  const [source, setSource] = useState(() => (readManual() ? "manual" : "pending"));
  const [sheet, setSheet] = useState(false);
  const [pay, setPay] = useState("1000");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("BTC");
  const [turns, setTurns] = useState(0);
  const [modal, setModal] = useState(false);

  const copy = PACKS[lang] || PACKS.en;
  const meta = LANGS.find((item) => item.id === lang) || LANGS[0];

  useEffect(() => {
    document.documentElement.lang = meta.html;
    document.documentElement.dir = meta.dir;
  }, [meta]);

  useEffect(() => {
    if (readManual()) return undefined;
    let stop = false;
    lookupCountry().then((code) => {
      if (stop || readManual()) return;
      const mapped = code && COUNTRY[code];
      if (mapped && PACKS[mapped]) {
        setLang(mapped);
        setSource("ip");
      } else {
        setLang("en");
        setSource("fallback");
      }
    });
    return () => {
      stop = true;
    };
  }, []);

  function choose(id) {
    try {
      localStorage.setItem(MANUAL, id);
    } catch {
      /* demo still switches in memory */
    }
    setLang(id);
    setSource("manual");
    setSheet(false);
  }

  function onPay(value) {
    const clean = value.replace(/[^\d.]/g, "");
    const [head, ...rest] = clean.split(".");
    setPay(rest.length ? `${head}.${rest.join("").slice(0, 8)}` : head);
  }

  function swap() {
    setFrom(to);
    setTo(from);
    setTurns((n) => n + 1);
  }

  const amount = Number(pay);
  const received = Number.isFinite(amount) ? convert(amount, from, to) : 0;
  const unit = convert(1, from, to);
  const same = from === to;

  const ticker = useMemo(() => {
    return PAIRS.map((pair) => {
      const rate = formatRate(convert(1, pair.base, pair.quote));
      return `1 ${pair.base} ≈ ${rate} ${pair.quote}`;
    });
  }, []);

  const status =
    source === "manual"
      ? copy.statusManual
      : source === "ip"
        ? copy.statusIp
        : source === "fallback"
          ? copy.statusFallback
          : copy.statusPending;

  const tap = reduce ? undefined : { scale: 0.97 };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f9fc_0%,#e7edf5_100%)] text-[#102033]">
      <div dir={meta.dir} className="relative mx-auto min-h-screen w-full max-w-[480px] bg-white shadow-[0_12px_40px_rgba(16,32,51,0.08)]">
        <div className="sticky top-0 z-40 bg-white/85 px-4 pt-3 pb-2 backdrop-blur">
          <button
            type="button"
            className="flex min-h-14 w-full items-center justify-between gap-3 rounded-full border border-[#d5deea] bg-white px-4 text-start shadow-sm"
            aria-expanded={sheet}
            aria-haspopup="listbox"
            onClick={() => setSheet((open) => !open)}
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-[#184e9e]">{copy.langLabel}</span>
            <span className="min-w-0 flex-1 truncate text-base font-bold">{meta.label}</span>
            <span className="text-sm font-semibold text-[#5c6b80]">{meta.short}</span>
          </button>
          {sheet && (
            <div className="mt-2 max-h-[62vh] overflow-auto rounded-3xl border border-[#d5deea] bg-white p-2 shadow-lg" role="listbox" aria-label={copy.langLabel}>
              <p className="px-3 py-2 text-sm leading-snug text-[#3d4d63]">{status}</p>
              {LANGS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={item.id === lang}
                  className={`flex min-h-12 w-full items-center justify-between rounded-2xl px-3 text-start ${item.id === lang ? "bg-[#e8f0fb] text-[#184e9e]" : "bg-white"}`}
                  onClick={() => choose(item.id)}
                >
                  <span className="text-base font-semibold">{item.label}</span>
                  <span className="text-sm font-semibold text-[#5c6b80]">{item.short}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <header className="flex items-center gap-3 px-5 pt-2">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[linear-gradient(145deg,#184e9e,#3c7ad6)] text-sm font-black text-white" aria-hidden="true">GX</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-black tracking-tight">{copy.brand}</p>
            <p className="truncate text-sm font-semibold text-[#a67c2d]">{copy.themeLine}</p>
          </div>
          <span className="rounded-full bg-[#e8f0fb] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#184e9e]">{copy.demoChip}</span>
        </header>

        <div className="mt-4 overflow-hidden border-y border-[#e6edf5] bg-[#f7fafc]" dir="ltr">
          <div className="ticker-track flex w-max">
            {[0, 1].map((copyIndex) => (
              <div className="flex" key={copyIndex}>
                {ticker.map((bit) => (
                  <span key={`${copyIndex}-${bit}`} dir="ltr" className="px-4 py-2 text-sm font-semibold whitespace-nowrap text-[#3d4d63]">
                    {bit}
                    <span className="ms-2 text-xs font-bold uppercase text-[#a67c2d]">{copy.tickerDemo}</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <section className="px-4 pt-4">
          <div className="relative overflow-hidden rounded-[28px]">
            <HeroArt />
            <div className="absolute inset-0 bg-white/50" />
            <div className="relative z-10 flex items-center justify-between px-5 pt-4">
              {["$", "€", "₿", "₮"].map((mark, index) => (
                <motion.span
                  key={mark}
                  aria-hidden="true"
                  className="grid h-11 w-11 place-items-center rounded-full border border-[#ead9a8] bg-white/90 text-lg font-black text-[#a67c2d] shadow-sm"
                  animate={reduce ? undefined : { y: [0, -8, 0] }}
                  transition={reduce ? undefined : { duration: 3.2 + index * 0.4, repeat: Infinity, ease: "easeInOut" }}
                >
                  {mark}
                </motion.span>
              ))}
            </div>
            <div className="relative z-10 mx-3 mt-3 mb-3 rounded-3xl bg-white/90 p-4 shadow-sm backdrop-blur-sm">
              <h1 className="text-[1.7rem] font-black leading-[1.15] tracking-tight">{copy.heroTitle}</h1>
              <p className="mt-3 text-base font-bold leading-snug text-[#184e9e]">{copy.heroSub}</p>
              <p className="mt-3 text-sm leading-relaxed text-[#3d4d63]">{copy.honestLine}</p>
            </div>
          </div>
        </section>

        <section className="px-4 pt-4">
          <div className="rounded-[28px] border border-[#e3ebf4] bg-[linear-gradient(180deg,#ffffff,#f6f8fb)] p-4 shadow-sm">
            <div>
              <span className="text-xs font-bold uppercase tracking-wide text-[#5c6b80]">{copy.payLabel}</span>
              <div className="mt-2 flex items-center gap-2">
                <input
                  inputMode="decimal"
                  value={pay}
                  onChange={(event) => onPay(event.target.value)}
                  className="min-h-14 w-full rounded-2xl border border-[#d5deea] bg-white px-4 text-2xl font-black outline-none"
                  aria-label={copy.payLabel}
                />
                <AssetSelect value={from} onChange={setFrom} copy={copy} label={copy.payLabel} />
              </div>
            </div>

            <div className="relative z-[1] my-3 flex justify-center">
              <motion.button
                type="button"
                aria-label={copy.swapAria}
                onClick={swap}
                whileTap={tap}
                animate={{ rotate: turns * 180 }}
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 18 }}
                className="grid h-14 w-14 place-items-center rounded-full bg-[#184e9e] text-xl font-black text-white shadow-md"
              >
                ⇅
              </motion.button>
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wide text-[#5c6b80]">{copy.getLabel}</span>
              <div className="mt-2 flex items-center gap-2">
                <div className="min-h-14 flex-1 rounded-2xl border border-[#d7efe4] bg-[#f3fbf7] px-4 py-3">
                  <p className="text-2xl font-black text-[#0c8a5a]">{formatAmount(received)}</p>
                  <p className="text-xs font-semibold text-[#3d4d63]">{copy.illustrative}</p>
                </div>
                <AssetSelect value={to} onChange={setTo} copy={copy} label={copy.getLabel} />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <motion.span
                className="rounded-full bg-[#102033] px-3 py-1 text-xs font-bold text-white"
                animate={reduce ? undefined : { opacity: [1, 0.55, 1] }}
                transition={reduce ? undefined : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              >
                {copy.rateBadge}
              </motion.span>
              <p className="text-sm font-semibold">
                {fill(copy.rateTemplate, { from, to, rate: formatRate(unit) })}
              </p>
            </div>
            <p className="mt-2 text-sm text-[#3d4d63]">{same ? copy.sameAsset : copy.notLive}</p>
          </div>
        </section>

        <section className="px-4 pt-8">
          <h2 className="px-1 text-xl font-black">{copy.featuresTitle}</h2>
          <div className="mt-3 grid gap-3">
            {[
              [copy.f1t, copy.f1b, "#184e9e"],
              [copy.f2t, copy.f2b, "#0c8a5a"],
              [copy.f3t, copy.f3b, "#a67c2d"],
            ].map(([title, body, color]) => (
              <article key={title} className="rounded-3xl border border-[#e6edf5] bg-white p-4 shadow-sm">
                <h3 className="text-lg font-black" style={{ color }}>{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-[#3d4d63]">{body}</p>
              </article>
            ))}
          </div>
          <p className="mt-3 px-1 text-sm leading-relaxed text-[#3d4d63]">{copy.featureNote}</p>
        </section>

        <section className="px-4 pt-8">
          <h2 className="px-1 text-xl font-black">{copy.pairsTitle}</h2>
          <p className="mt-1 px-1 text-sm text-[#3d4d63]">{copy.pairsNote}</p>
          <ul className="mt-3 grid gap-2">
            {PAIRS.map((pair) => {
              const up = pair.dir === "up";
              return (
                <li key={`${pair.base}${pair.quote}`} className="flex min-h-14 items-center justify-between rounded-2xl border border-[#e6edf5] bg-white px-4">
                  <span className="font-black">{pair.base}/{pair.quote}</span>
                  <span className="flex items-center gap-2">
                    <span className="rounded-full bg-[#f4efe4] px-2 py-1 text-[11px] font-bold uppercase text-[#a67c2d]">{copy.simBadge}</span>
                    <span className={`text-sm font-black ${up ? "text-[#0c8a5a]" : "text-[#b42318]"}`}>
                      {up ? "▲" : "▼"} {pair.pct}%
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="px-4 pt-8 pb-32">
          <div className="rounded-[28px] bg-[linear-gradient(160deg,#f8f1de,#ffffff_55%,#e8f0fb)] p-5">
            <p className="text-4xl font-black tracking-tight text-[#184e9e]">{copy.socialFigure}</p>
            <h2 className="mt-2 text-xl font-black">{copy.socialTitle}</h2>
            <p className="mt-2 text-base font-semibold text-[#3d4d63]">{copy.socialBody}</p>
            <p className="mt-3 text-sm leading-relaxed text-[#3d4d63]">{copy.socialNote}</p>
          </div>
        </section>

        <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-[480px] -translate-x-1/2 border-t border-[#e6edf5] bg-white/95 px-4 pt-2 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur">
          <motion.button
            type="button"
            whileTap={tap}
            onClick={() => setModal(true)}
            className="min-h-14 w-full rounded-full bg-[#184e9e] text-base font-black text-white shadow-lg"
          >
            {copy.cta}
          </motion.button>
        </div>

        {modal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#102033]/40" onClick={() => setModal(false)}>
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="demo-title"
              className="w-full max-w-[480px] rounded-t-[28px] bg-white p-6"
              onClick={(event) => event.stopPropagation()}
              initial={reduce ? false : { y: 48, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <p className="text-xs font-bold uppercase tracking-wide text-[#a67c2d]">{copy.demoChip}</p>
              <h2 id="demo-title" className="mt-2 text-2xl font-black">{copy.modalTitle}</h2>
              <p className="mt-3 text-base leading-relaxed text-[#3d4d63]">{copy.modalBody}</p>
              <button
                type="button"
                className="mt-5 min-h-14 w-full rounded-full bg-[#102033] text-base font-black text-white"
                onClick={() => setModal(false)}
              >
                {copy.modalClose}
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

function AssetSelect({ value, onChange, copy, label }) {
  return (
    <label className="flex w-[7.75rem] shrink-0 flex-col">
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-14 rounded-2xl border border-[#d5deea] bg-white px-2 text-base font-black"
      >
        {ASSETS.map((code) => (
          <option key={code} value={code}>
            {code}
          </option>
        ))}
      </select>
      <span className="mt-1 truncate text-center text-[11px] font-semibold text-[#3d4d63]">{copy.assets[value]}</span>
    </label>
  );
}
