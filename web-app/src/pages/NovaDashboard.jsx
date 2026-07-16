import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Sun, Moon, Search, Wallet, Zap, ShieldCheck, Activity,
  ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown,
  ChevronDown, Radio, Globe, Lock
} from "lucide-react";

/* ---------------------------------------------------------
   SEED DATA
--------------------------------------------------------- */


const makeSpark = (up) => {
  const pts = [];
  let v = 50;
  for (let i = 0; i < 20; i++) {
    v += (Math.random() - (up ? 0.38 : 0.62)) * 14;
    v = Math.max(8, Math.min(92, v));
    pts.push(v);
  }
  return pts;
};

/* ---------------------------------------------------------
   THEME TOKENS
--------------------------------------------------------- */
const THEMES = {
  
  light: {
    
  },
};

const clip = "polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)";
const clipSm = "polygon(9px 0, 100% 0, 100% calc(100% - 9px), calc(100% - 9px) 100%, 0 100%, 0 9px)";

/* ---------------------------------------------------------
   CHAMFERED / NEON BORDER CARD
--------------------------------------------------------- */
function NeonPanel({ children, className = "", padded = true, small = false, style = {} }) {
  return (
    <div
      className={`neon-wrap ${className}`}
      style={{ clipPath: small ? clipSm : clip, ...style }}
    >
      <div
        className={`neon-inner ${padded ? (small ? "p-4" : "p-5 sm:p-6") : ""}`}
        style={{ clipPath: small ? clipSm : clip }}
      >
        {children}
      </div>
    </div>
  );
}

function Sparkline({ points, color }) {
  const w = 100, h = 32;
  const step = w / (points.length - 1);
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)},${(h - (p / 100) * h).toFixed(1)}`).join(" ");
  const area = `${path} L${w},${h} L0,${h} Z`;
  const gid = `sg-${color.replace("#", "")}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-8" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} stroke="none" />
      <path d={path} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ---------------------------------------------------------
   MAIN DASHBOARD
--------------------------------------------------------- */
export default function CryptoDashboard() {
  const [theme, setTheme] = useState("dark");
  const [coins, setCoins] = useState(() =>
    SEED_COINS.map((c) => ({ ...c, spark: makeSpark(c.change >= 0) }))
  );
  const [selected, setSelected] = useState("btc");
  const [side, setSide] = useState("buy");
  const [amount, setAmount] = useState("0.25");
  const tickRef = useRef(null);

  // simulate live prices
  useEffect(() => {
    tickRef.current = setInterval(() => {
      setCoins((prev) =>
        prev.map((c) => {
          const drift = (Math.random() - 0.5) * (c.price * 0.0016);
          const newPrice = Math.max(0.001, c.price + drift);
          const newChange = c.change + (Math.random() - 0.5) * 0.06;
          return { ...c, price: newPrice, change: newChange };
        })
      );
    }, 2200);
    return () => clearInterval(tickRef.current);
  }, []);

  const t = THEMES[theme];
  const rootStyle = Object.fromEntries(Object.entries(t));
  const active = coins.find((c) => c.id === selected) || coins[0];

  const fmt = useCallback(
    (n, d = 2) => n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }),
    []
  );

  const totalCap = "2.19T";
  const totalVol = "84.6B";
  const dominance = "51.2%";
  const activePairs = "312";

  return (
    <div className="dash-root" style={rootStyle} data-theme={theme}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;600;700;800;900&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

        .dash-root {
          --font-head: 'Orbitron', sans-serif;
          --font-body: 'Space Grotesk', sans-serif;
          position: relative;
          min-height: 100%;
          background: var(--bg);
          color: var(--text-hi);
          font-family: var(--font-body);
          overflow: hidden;
          padding: 20px;
          isolation: isolate;
        }
        .dash-root * { box-sizing: border-box; }

        /* ---- atmosphere ---- */
        .nebula-field {
          position: absolute; inset: 0; z-index: 0; pointer-events: none; overflow: hidden;
        }
        .nebula-field span {
          position: absolute; border-radius: 999px; filter: blur(70px);
          animation: drift 22s ease-in-out infinite alternate;
        }
        .neb1 { width: 520px; height: 520px; top: -180px; left: -120px; background: var(--nebula-1); }
        .neb2 { width: 460px; height: 460px; bottom: -160px; right: -100px; background: var(--nebula-2); animation-delay: -6s; }
        .neb3 { width: 360px; height: 360px; top: 30%; right: 18%; background: var(--nebula-3); animation-delay: -12s; }
        @keyframes drift {
          0% { transform: translate(0,0) scale(1); }
          100% { transform: translate(40px,-30px) scale(1.12); }
        }
        .grid-overlay {
          position: absolute; inset: 0; z-index: 0; pointer-events: none;
          background-image:
            linear-gradient(var(--grid-line) 1px, transparent 1px),
            linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
          background-size: 42px 42px;
          mask-image: radial-gradient(ellipse 90% 80% at 50% 20%, black 40%, transparent 100%);
        }
        [data-theme="dark"] .stars {
          position: absolute; inset: 0; z-index: 0; pointer-events: none;
          background-image:
            radial-gradient(1.5px 1.5px at 20% 30%, rgba(255,255,255,0.6), transparent),
            radial-gradient(1.5px 1.5px at 70% 65%, rgba(255,255,255,0.5), transparent),
            radial-gradient(1px 1px at 85% 15%, rgba(255,255,255,0.4), transparent),
            radial-gradient(1px 1px at 40% 80%, rgba(255,255,255,0.4), transparent),
            radial-gradient(1.5px 1.5px at 55% 45%, rgba(255,255,255,0.35), transparent);
          background-size: 100% 100%;
          opacity: 0.7;
        }

        .content { position: relative; z-index: 1; max-width: 1280px; margin: 0 auto; }

        h1,h2,h3,h4, .font-head { font-family: var(--font-head); letter-spacing: 0.04em; }

        /* ---- neon chamfered panels ---- */
        .neon-wrap {
          background: linear-gradient(135deg, var(--border-a), var(--border-b));
          padding: 1px;
          transition: filter 0.25s ease, transform 0.2s ease;
        }
        .neon-inner {
          background: var(--card-bg);
          backdrop-filter: blur(6px);
          height: 100%;
        }
        .neon-wrap.hoverable:hover {
          filter: drop-shadow(0 0 10px var(--border-a)) drop-shadow(0 0 18px var(--border-b));
          transform: translateY(-2px);
        }
        .neon-glow {
          box-shadow: 0 0 0 1px rgba(103,232,249,0.15), 0 0 24px -4px var(--border-a);
        }

        /* ---- buttons ---- */
        .btn-neon {
          font-family: var(--font-head);
          letter-spacing: 0.08em;
          font-size: 12px;
          text-transform: uppercase;
          color: var(--btn-text);
          background: linear-gradient(90deg, var(--border-a), var(--border-b));
          border: none;
          padding: 12px 22px;
          clip-path: ${clipSm};
          cursor: pointer;
          transition: box-shadow 0.2s ease, transform 0.15s ease, filter 0.2s ease;
          box-shadow: 0 0 14px -2px var(--border-a);
        }
        .btn-neon:hover { box-shadow: 0 0 10px 1px var(--border-a), 0 0 30px 4px var(--border-b); transform: translateY(-1px); filter: brightness(1.08); }
        .btn-neon:active { transform: translateY(0px) scale(0.98); }

        .btn-ghost {
          font-family: var(--font-body);
          font-size: 13px;
          color: var(--text-mid);
          background: transparent;
          border: 1px solid var(--grid-line);
          padding: 9px 16px;
          clip-path: ${clipSm};
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-ghost:hover { color: var(--text-hi); border-color: var(--border-a); box-shadow: inset 0 0 12px -4px var(--border-a); }

        .pill {
          font-family: var(--font-head);
          font-size: 10.5px;
          letter-spacing: 0.06em;
          padding: 3px 9px;
          border-radius: 3px;
        }
        .pill.up { color: var(--up); background: color-mix(in srgb, var(--up) 14%, transparent); }
        .pill.down { color: var(--down); background: color-mix(in srgb, var(--down) 14%, transparent); }

        .row-hover:hover { background: color-mix(in srgb, var(--border-a) 6%, transparent); }

        .coin-select { transition: all 0.18s ease; cursor: pointer; }
        .coin-select.active { box-shadow: inset 0 0 0 1px var(--border-a), 0 0 16px -6px var(--border-a); }

        .toggle-track {
          position: relative; width: 52px; height: 28px;
          background: var(--card-bg);
          clip-path: ${clipSm};
          border: 1px solid var(--grid-line);
          cursor: pointer;
        }
        .toggle-thumb {
          position: absolute; top: 3px; width: 22px; height: 22px;
          background: linear-gradient(135deg, var(--border-a), var(--border-b));
          clip-path: ${clipSm};
          transition: left 0.22s ease;
          display: flex; align-items: center; justify-content: center;
        }

        .scroll-thin::-webkit-scrollbar { height: 6px; width: 6px; }
        .scroll-thin::-webkit-scrollbar-thumb { background: var(--border-b); }
        .scroll-thin::-webkit-scrollbar-track { background: transparent; }

        input[type="text"].trade-input {
          background: transparent;
          border: 1px solid var(--grid-line);
          color: var(--text-hi);
          font-family: var(--font-body);
          padding: 10px 12px;
          clip-path: ${clipSm};
          outline: none;
          width: 100%;
        }
        input[type="text"].trade-input:focus { border-color: var(--border-a); box-shadow: 0 0 10px -3px var(--border-a); }

        .side-toggle button {
          font-family: var(--font-head);
          font-size: 12px;
          letter-spacing: 0.06em;
          padding: 9px 0;
          flex: 1;
          background: transparent;
          border: 1px solid var(--grid-line);
          color: var(--text-mid);
          cursor: pointer;
          transition: all 0.18s ease;
        }
        .side-toggle button.buy.active { color: var(--up); border-color: var(--up); box-shadow: inset 0 0 14px -6px var(--up); }
        .side-toggle button.sell.active { color: var(--down); border-color: var(--down); box-shadow: inset 0 0 14px -6px var(--down); }
      `}</style>

      <div className="nebula-field"><span className="neb1" /><span className="neb2" /><span className="neb3" /></div>
      <div className="stars" />
      <div className="grid-overlay" />

      <div className="content">
        {/* ---------------- HEADER ---------------- */}
        <header className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center neon-wrap" style={{ clipPath: clipSm }}>
              <div className="neon-inner w-full h-full flex items-center justify-center" style={{ clipPath: clipSm }}>
                <Zap size={16} style={{ color: "var(--accent)" }} />
              </div>
            </div>
            <div>
              <div className="font-head font-bold text-sm sm:text-base" style={{ color: "var(--text-hi)" }}>NOVA<span style={{ color: "var(--accent)" }}>X</span></div>
              <div className="text-[10px] tracking-widest uppercase" style={{ color: "var(--text-lo)" }}>Exchange Protocol</div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1 text-xs font-head tracking-wide" style={{ color: "var(--text-mid)" }}>
            {["Markets", "Trade", "Portfolio", "Earn"].map((label, i) => (
              <span key={label} className={`px-4 py-2 cursor-pointer transition-colors ${i === 1 ? "" : ""}`}
                style={{ color: i === 1 ? "var(--accent)" : "var(--text-mid)" }}>{label}</span>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 neon-wrap" style={{ clipPath: clipSm }}>
              <div className="neon-inner flex items-center gap-2 px-1" style={{ clipPath: clipSm }}>
                <Search size={13} style={{ color: "var(--text-lo)" }} />
                <input placeholder="Search asset..." className="bg-transparent outline-none text-xs w-28" style={{ color: "var(--text-hi)" }} />
              </div>
            </div>

            <div className="toggle-track" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              <div className="toggle-thumb" style={{ left: theme === "dark" ? "26px" : "3px" }}>
                {theme === "dark" ? <Moon size={11} color="#04070d" /> : <Sun size={11} color="#fff" />}
              </div>
            </div>

            <button className="btn-neon flex items-center gap-2"><Wallet size={13} /> Connect</button>
          </div>
        </header>

        {/* ---------------- HERO ---------------- */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Radio size={12} style={{ color: "var(--up)" }} className="animate-pulse" />
            <span className="text-[11px] tracking-[0.2em] uppercase" style={{ color: "var(--text-lo)" }}>Live Network — Signal Locked</span>
          </div>
          <h1 className="font-head font-black text-2xl sm:text-4xl leading-tight" style={{ color: "var(--text-hi)" }}>
            TRADE FROM <span style={{
              background: "linear-gradient(90deg, var(--border-a), var(--border-b))",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
            }}>ANOTHER DIMENSION</span>
          </h1>
          <p className="text-sm mt-2 max-w-xl" style={{ color: "var(--text-mid)" }}>
            Ultra-low latency execution across a deep-liquidity, fully encrypted trading grid.
          </p>
        </div>

        {/* ---------------- HERO STATS ---------------- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Market Cap", value: `$${totalCap}`, icon: Globe, delta: "+1.8%", up: true },
            { label: "24h Volume", value: `$${totalVol}`, icon: Activity, delta: "+6.4%", up: true },
            { label: "BTC Dominance", value: dominance, icon: ShieldCheck, delta: "-0.3%", up: false },
            { label: "Active Pairs", value: activePairs, icon: Lock, delta: "+4", up: true },
          ].map((s) => (
            <NeonPanel key={s.label} className="hoverable" small>
              <div className="flex items-start justify-between mb-3">
                <s.icon size={16} style={{ color: "var(--accent-2)" }} />
                <span className={`pill ${s.up ? "up" : "down"}`}>{s.delta}</span>
              </div>
              <div className="font-head font-bold text-lg sm:text-xl" style={{ color: "var(--text-hi)" }}>{s.value}</div>
              <div className="text-[11px] uppercase tracking-wide mt-1" style={{ color: "var(--text-lo)" }}>{s.label}</div>
            </NeonPanel>
          ))}
        </div>

        {/* ---------------- MAIN GRID ---------------- */}
        <div className="grid grid-cols-1 xl:grid-cols-[1.7fr_1fr] gap-5">
          {/* LIVE MARKET TABLE */}
          <NeonPanel className="neon-glow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-head font-bold text-sm tracking-wide" style={{ color: "var(--text-hi)" }}>LIVE MARKET</h3>
              <div className="flex items-center gap-1 text-[10px]" style={{ color: "var(--text-lo)" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--up)" }} />
                streaming
              </div>
            </div>

            <div className="overflow-x-auto scroll-thin">
              <table className="w-full text-xs sm:text-sm min-w-[560px]">
                <thead>
                  <tr className="text-left" style={{ color: "var(--text-lo)" }}>
                    <th className="font-normal pb-3 font-head text-[10px] tracking-widest uppercase">Asset</th>
                    <th className="font-normal pb-3 font-head text-[10px] tracking-widest uppercase text-right">Price</th>
                    <th className="font-normal pb-3 font-head text-[10px] tracking-widest uppercase text-right">24h</th>
                    <th className="font-normal pb-3 font-head text-[10px] tracking-widest uppercase text-right hidden sm:table-cell">Volume</th>
                    <th className="font-normal pb-3 font-head text-[10px] tracking-widest uppercase text-right hidden md:table-cell">Chart</th>
                  </tr>
                </thead>
                <tbody>
                  {coins.map((c) => {
                    const up = c.change >= 0;
                    return (
                      <tr
                        key={c.id}
                        onClick={() => setSelected(c.id)}
                        className="row-hover cursor-pointer transition-colors"
                        style={{ borderTop: "1px solid var(--grid-line)" }}
                      >
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 flex items-center justify-center font-head text-[10px] font-bold"
                              style={{
                                clipPath: clipSm,
                                background: "linear-gradient(135deg, var(--border-a), var(--border-b))",
                                color: theme === "dark" ? "#04070d" : "#fff"
                              }}>
                              {c.symbol.slice(0, 2)}
                            </div>
                            <div>
                              <div className="font-medium" style={{ color: "var(--text-hi)" }}>{c.symbol}</div>
                              <div className="text-[10px]" style={{ color: "var(--text-lo)" }}>{c.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-right font-head" style={{ color: "var(--text-hi)" }}>
                          ${fmt(c.price, c.price < 5 ? 3 : 2)}
                        </td>
                        <td className="text-right">
                          <span className={`pill ${up ? "up" : "down"} inline-flex items-center gap-1`}>
                            {up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                            {Math.abs(c.change).toFixed(2)}%
                          </span>
                        </td>
                        <td className="text-right hidden sm:table-cell" style={{ color: "var(--text-mid)" }}>${c.vol}</td>
                        <td className="hidden md:table-cell w-24">
                          <Sparkline points={c.spark} color={up ? "var(--up)" : "var(--down)"} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </NeonPanel>

          {/* TRADE WIDGET */}
          <NeonPanel className="neon-glow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-head font-bold text-sm tracking-wide" style={{ color: "var(--text-hi)" }}>TRADE</h3>
              <div className="flex items-center gap-1 text-xs font-head" style={{ color: "var(--text-mid)" }}>
                {active.symbol}/USDT <ChevronDown size={13} />
              </div>
            </div>

            <div className="mb-4 font-head text-2xl font-bold" style={{ color: "var(--text-hi)" }}>
              ${fmt(active.price, active.price < 5 ? 3 : 2)}
              <span className={`ml-2 text-xs align-middle ${active.change >= 0 ? "" : ""}`} style={{ color: active.change >= 0 ? "var(--up)" : "var(--down)" }}>
                {active.change >= 0 ? "▲" : "▼"} {Math.abs(active.change).toFixed(2)}%
              </span>
            </div>

            <div className="side-toggle flex gap-2 mb-4">
              <button className={`buy ${side === "buy" ? "active" : ""}`} onClick={() => setSide("buy")}>BUY</button>
              <button className={`sell ${side === "sell" ? "active" : ""}`} onClick={() => setSide("sell")}>SELL</button>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <div className="text-[10px] uppercase tracking-wide mb-1" style={{ color: "var(--text-lo)" }}>Amount ({active.symbol})</div>
                <input type="text" className="trade-input" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {["25%", "50%", "75%", "MAX"].map((p) => (
                  <button key={p} className="btn-ghost text-[10px] py-1.5">{p}</button>
                ))}
              </div>
              <div className="flex justify-between text-xs pt-1" style={{ color: "var(--text-mid)" }}>
                <span>Est. Total</span>
                <span style={{ color: "var(--text-hi)" }}>
                  ${fmt((parseFloat(amount) || 0) * active.price, 2)}
                </span>
              </div>
            </div>

            <button className="btn-neon w-full" style={{
              background: side === "buy"
                ? "linear-gradient(90deg, var(--up), var(--accent))"
                : "linear-gradient(90deg, var(--down), var(--accent-2))"
            }}>
              {side === "buy" ? `Buy ${active.symbol}` : `Sell ${active.symbol}`}
            </button>

            <div className="mt-5 pt-4 flex items-center justify-between text-[10px]" style={{ borderTop: "1px solid var(--grid-line)", color: "var(--text-lo)" }}>
              <span className="flex items-center gap-1"><ShieldCheck size={11} /> Cold-vault secured</span>
              <span>Fee 0.04%</span>
            </div>
          </NeonPanel>
        </div>
      </div>
    </div>
  );
}
