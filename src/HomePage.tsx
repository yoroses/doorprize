import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  loadHistory,
  loadSettings,
  saveHistory,
  type HistoryEntry,
} from "./storage";

function pickRandom(min: number, max: number, exclude: Set<number>): number | null {
  const pool: number[] = [];
  for (let n = min; n <= max; n++) {
    if (!exclude.has(n)) pool.push(n);
  }
  if (pool.length === 0) return null;
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}

export default function HomePage() {
  const [settings, setSettings] = useState(loadSettings());
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory());
  const [display, setDisplay] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [poolEmpty, setPoolEmpty] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const onFocus = () => {
      setSettings(loadSettings());
      setHistory(loadHistory());
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const drawnSet = useMemo(
    () => new Set(history.map((h) => h.number)),
    [history]
  );

  const totalInRange = Math.max(0, settings.maxNumber - settings.minNumber + 1);
  const remaining = settings.excludePrevious
    ? Math.max(
        0,
        totalInRange -
          history.filter(
            (h) => h.number >= settings.minNumber && h.number <= settings.maxNumber
          ).length
      )
    : totalInRange;

  function handleDraw() {
    if (spinning) return;
    const exclude = settings.excludePrevious ? drawnSet : new Set<number>();
    const winner = pickRandom(settings.minNumber, settings.maxNumber, exclude);
    if (winner == null) {
      setPoolEmpty(true);
      return;
    }
    setPoolEmpty(false);
    setSpinning(true);

    const start = Date.now();
    const duration = 2500;
    intervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - start;
      if (elapsed >= duration) {
        if (intervalRef.current) window.clearInterval(intervalRef.current);
        intervalRef.current = null;
        setDisplay(winner);
        setSpinning(false);
        const entry: HistoryEntry = { number: winner, timestamp: Date.now() };
        const next = [entry, ...history];
        setHistory(next);
        saveHistory(next);
      } else {
        const min = settings.minNumber;
        const max = settings.maxNumber;
        const n = Math.floor(Math.random() * (max - min + 1)) + min;
        setDisplay(n);
      }
    }, 60);
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, []);

  const padWidth = String(settings.maxNumber).length;
  const formatted = (n: number) => String(n).padStart(padWidth, "0");

  return (
    <div className="min-h-screen relative text-islam-cream">
      {/* Gradient background */}
      <div
        className="fixed inset-0 -z-10 bg-gradient-to-br from-islam-deep via-islam-green to-islam-mid"
        aria-hidden
      />
      <div
        className="fixed inset-0 -z-10 opacity-30"
        style={{
          background:
            "radial-gradient(circle at 20% 0%, rgba(240,198,74,0.35), transparent 45%), radial-gradient(circle at 80% 100%, rgba(123,61,168,0.4), transparent 50%)",
        }}
        aria-hidden
      />

      {/* Header */}
      <header className="relative flex items-center justify-between px-6 py-4">
        <div className="font-display font-bold text-islam-cream text-lg tracking-wide drop-shadow">
          🌙 {settings.prizeTitle}
        </div>
        <Link
          to="/admin"
          className="text-xs uppercase tracking-[0.3em] text-islam-cream/70 hover:text-islam-gold transition"
        >
          Admin
        </Link>
      </header>

      {/* Hero - shows the poster art */}
      <section className="relative px-4 pt-2 pb-6 flex justify-center">
        <div className="w-full max-w-5xl rounded-3xl overflow-hidden border-2 border-islam-gold/40 shadow-[0_10px_60px_rgba(0,0,0,0.5)]">
          <img
            src="/halalbihalal-bg.jpg"
            alt="Halal Bi Halal — Healing Renewing Winning"
            className="w-full h-auto block"
          />
        </div>
      </section>

      {/* Door prize card */}
      <main className="relative px-4 pb-6 flex flex-col items-center text-center">
        <div className="text-[10px] sm:text-xs uppercase tracking-[0.5em] text-islam-gold mb-2">
          ✦ Door Prize ✦
        </div>
        <div className="text-sm uppercase tracking-[0.3em] text-islam-cream/80 mb-4">
          Range {settings.minNumber} – {settings.maxNumber}
        </div>

        <div
          className={`relative my-2 px-10 py-8 rounded-3xl bg-islam-deep/80 backdrop-blur border-2 ${
            spinning ? "border-islam-gold animate-pulse" : "border-islam-gold/60"
          } shadow-[0_10px_40px_rgba(0,0,0,0.5)]`}
        >
          {/* corner ornaments */}
          <span className="absolute -top-3 -left-3 text-2xl text-islam-purple drop-shadow">✿</span>
          <span className="absolute -top-3 -right-3 text-2xl text-islam-gold drop-shadow">✦</span>
          <span className="absolute -bottom-3 -left-3 text-2xl text-islam-gold drop-shadow">✦</span>
          <span className="absolute -bottom-3 -right-3 text-2xl text-islam-purple drop-shadow">✿</span>

          <div
            className={`font-display font-black tabular-nums leading-none select-none ${
              spinning ? "text-islam-gold" : "text-islam-cream"
            }`}
            style={{
              fontSize: "clamp(4rem, 16vw, 11rem)",
              letterSpacing: "0.05em",
              textShadow:
                "0 4px 0 rgba(0,0,0,0.35), 0 0 30px rgba(240,198,74,0.45)",
              WebkitTextStroke: "2px rgba(0,0,0,0.45)",
            }}
          >
            {display == null ? "—".padEnd(padWidth, "—") : formatted(display)}
          </div>
        </div>

        {poolEmpty && (
          <div className="text-islam-gold text-sm mt-3">
            Semua angka dalam range sudah keluar. Reset history di admin panel.
          </div>
        )}

        <button
          onClick={handleDraw}
          disabled={spinning || remaining === 0}
          className="mt-6 px-12 py-4 rounded-full bg-gradient-to-r from-islam-gold to-islam-goldDark text-islam-deep font-display font-bold uppercase tracking-[0.25em] text-lg shadow-[0_8px_24px_rgba(0,0,0,0.4)] hover:scale-105 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 border-2 border-islam-cream/30"
        >
          {spinning ? "Mengundi..." : "Draw"}
        </button>

        <div className="mt-3 text-xs uppercase tracking-[0.3em] text-islam-cream/70">
          {settings.excludePrevious
            ? `${remaining} / ${totalInRange} angka tersisa`
            : `Mode: angka boleh berulang`}
        </div>
      </main>

      {/* History */}
      <section className="relative px-4 pb-12">
        <div className="max-w-4xl mx-auto bg-islam-deep/70 backdrop-blur border-2 border-islam-gold/30 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-base uppercase tracking-[0.3em] text-islam-gold">
              ✦ Pemenang ✦
            </h2>
            <span className="text-xs text-islam-cream/70">{history.length} draws</span>
          </div>
          {history.length === 0 ? (
            <div className="text-sm text-islam-cream/70 py-6 text-center italic">
              Belum ada pemenang. Tekan Draw untuk mulai.
            </div>
          ) : (
            <ol className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-2 max-h-56 overflow-y-auto pr-1">
              {history.map((h, i) => (
                <li
                  key={`${h.timestamp}-${i}`}
                  className={`rounded-xl px-2 py-2 flex flex-col items-center border ${
                    i === 0
                      ? "bg-islam-gold text-islam-deep border-islam-cream"
                      : "bg-islam-deep/80 text-islam-cream border-islam-gold/30"
                  }`}
                >
                  <span className="font-display font-bold text-lg">
                    {String(h.number).padStart(padWidth, "0")}
                  </span>
                  <span className="text-[10px] opacity-70">
                    {new Date(h.timestamp).toLocaleTimeString()}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      <footer className="relative pb-6 text-center text-xs text-islam-cream/50 tracking-widest">
        Healing • Renewing • Winning
      </footer>
    </div>
  );
}
