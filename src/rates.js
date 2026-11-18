/** Illustrative demo ratios only. Not market prices. */
export const USD_VALUE = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.27,
  JPY: 0.0067,
  CAD: 0.74,
  AUD: 0.66,
  CHF: 1.13,
  AED: 0.27,
  CNY: 0.14,
  USDT: 1,
  BTC: 64000,
  ETH: 3200,
  SOL: 150,
  BNB: 580,
  XRP: 0.6,
  ADA: 0.45,
};

export const FIAT = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "AED", "CNY"];
export const CRYPTO = ["USDT", "BTC", "ETH", "SOL", "BNB", "XRP", "ADA"];
export const ASSETS = FIAT.concat(CRYPTO);

export const PAIRS = [
  { base: "BTC", quote: "USDT", dir: "up", pct: "2.4" },
  { base: "ETH", quote: "USD", dir: "down", pct: "1.1" },
  { base: "EUR", quote: "USD", dir: "up", pct: "0.3" },
  { base: "SOL", quote: "USDT", dir: "up", pct: "4.1" },
  { base: "XRP", quote: "USD", dir: "down", pct: "0.8" },
];

export function convert(amount, from, to) {
  const a = USD_VALUE[from];
  const b = USD_VALUE[to];
  if (!a || !b || !Number.isFinite(amount)) return 0;
  return (amount * a) / b;
}

export function formatAmount(n) {
  if (!Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  const digits = abs >= 100 ? 2 : abs >= 1 ? 4 : 6;
  return new Intl.NumberFormat("en", {
    minimumFractionDigits: Math.min(2, digits),
    maximumFractionDigits: digits,
  }).format(n);
}

export function formatRate(n) {
  if (!Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  const digits = abs >= 100 ? 2 : abs >= 1 ? 4 : abs >= 0.01 ? 6 : 8;
  return new Intl.NumberFormat("en", { maximumFractionDigits: digits }).format(n);
}
