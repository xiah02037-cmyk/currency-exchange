import { useMemo, useState } from "react";
import { ASSETS, convert, formatAmount, formatRate } from "./rates.js";

const TICKER = [
  { base: "BTC", quote: "USD" },
  { base: "ETH", quote: "USD" },
  { base: "SOL", quote: "USD" },
];

function onPayChange(value, setPay) {
  const clean = value.replace(/[^\d.]/g, "");
  const [head, ...rest] = clean.split(".");
  setPay(rest.length ? `${head}.${rest.join("").slice(0, 8)}` : head);
}

export default function App() {
  const [pay, setPay] = useState("1000");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("BTC");
  const [flipped, setFlipped] = useState(false);
  const [modal, setModal] = useState(false);

  const amount = Number(pay);
  const received = Number.isFinite(amount) ? convert(amount, from, to) : 0;
  const unit = convert(1, from, to);
  const same = from === to;

  const ticker = useMemo(
    () =>
      TICKER.map((item) => ({
        label: item.base,
        value: formatRate(convert(1, item.base, item.quote)),
      })),
    [],
  );

  function swap() {
    setFrom(to);
    setTo(from);
    setFlipped((on) => !on);
  }

  return (
    <div className="mobile-container">
      <header>
        <div className="brand">
          <div className="brand-logo" aria-hidden="true">GX</div>
          <div className="brand-text">
            <h1>GlobalX Swap</h1>
            <p>Exchange easier, worry less</p>
          </div>
        </div>
        <div className="badge-live">Live Rate · demo</div>
      </header>

      <div className="ticker-bar" aria-label="Illustrative demo rates">
        {ticker.map((item) => (
          <div className="ticker-item" key={item.label}>
            {item.label} <span>{item.value}</span>
          </div>
        ))}
        <div className="ticker-demo">demo</div>
      </div>

      <section className="hero-box">
        <h2 className="hero-title">No borders. The strongest instant swap on earth.</h2>
        <p className="hero-desc">
          Exchange easier, worry less — zero fee friction, worldwide in seconds.
        </p>
        <p className="hero-honest">
          That line is marketing. Every rate, fee, and arrival time here is a demo simulation, not a live price and not a regulated zero-fee product.
        </p>
      </section>

      <section className="swap-card">
        <div className="input-group">
          <div className="input-label">
            <span>You pay</span>
          </div>
          <div className="input-row">
            <input
              className="amount-input"
              inputMode="decimal"
              aria-label="You pay"
              value={pay}
              onChange={(event) => onPayChange(event.target.value, setPay)}
            />
            <select
              className="currency-selector"
              aria-label="You pay asset"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
            >
              {ASSETS.map((code) => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="switch-wrapper">
          <button
            type="button"
            className={flipped ? "switch-btn is-flipped" : "switch-btn"}
            aria-label="Swap the two assets"
            onClick={swap}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M7 7h11M15 4l3 3-3 3M17 17H6M9 20l-3-3 3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="input-group">
          <div className="input-label">
            <span>You get</span>
            <span>Illustrative</span>
          </div>
          <div className="input-row">
            <div className="amount-read" aria-live="polite">{formatAmount(received)}</div>
            <select
              className="currency-selector"
              aria-label="You get asset"
              value={to}
              onChange={(event) => setTo(event.target.value)}
            >
              {ASSETS.map((code) => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          </div>
        </div>

        <p className="rate-line">1 {from} ≈ {formatRate(unit)} {to} · demo simulation</p>
        <p className="rate-note">
          {same
            ? "Same asset on both sides. Nothing is exchanged. This is still a demo."
            : "Not a live market price."}
        </p>
      </section>

      <p className="security-tip">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" stroke="currentColor" strokeWidth="2" />
          <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        Bank-grade posture in the pitch. This page does not move money or charge a fee.
      </p>

      <button type="button" className="cta-button" onClick={() => setModal(true)}>
        Stage a demo swap
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {modal && (
        <div className="modal-back" onClick={() => setModal(false)}>
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="demo-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="badge-live">Demo simulation</div>
            <h2 id="demo-title">Demo swap staged</h2>
            <p>Nothing was sent. No wallet, no bank, no order. This finish exists so the tap has an ending.</p>
            <button type="button" className="cta-button" onClick={() => setModal(false)}>
              Back to the demo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
