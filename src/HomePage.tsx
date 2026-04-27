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

  // Refresh from storage when window regains focus (admin may have changed it)
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
        // Show a fast random ticker
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white flex flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <div className="text-lg font-semibold tracking-wide opacity-90">
          🎉 {settings.prizeTitle}
        </div>
        <Link
          to="/admin"
          className="text-xs uppercase tracking-widest opacity-60 hover:opacity-100 transition"
        >
          Admin
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="mb-3 text-sm uppercase tracking-[0.4em] opacity-70">
          Range {settings.minNumber} – {settings.maxNumber}
        </div>

        <div
          className={`relative my-6 px-10 py-8 rounded-3xl bg-white/10 backdrop-blur border border-white/20 shadow-2xl ${
            spinning ? "ring-4 ring-yellow-300/40" : ""
          }`}
        >
          <div
            className={`font-mono font-black tabular-nums leading-none select-none ${
              spinning ? "text-yellow-200" : "text-white"
            }`}
            style={{
              fontSize: "clamp(4rem, 18vw, 12rem)",
              letterSpacing: "0.05em",
              textShadow: "0 6px 30px rgba(0,0,0,0.4)",
            }}
          >
            {display == null ? "—".padEnd(padWidth, "—") : formatted(display)}
          </div>
        </div>

        {poolEmpty && (
          <div className="text-yellow-200 text-sm mb-3">
            Semua angka dalam range sudah keluar. Reset history di admin panel.
          </div>
        )}

        <button
          onClick={handleDraw}
          disabled={spinning || remaining === 0}
          className="mt-2 px-10 py-4 rounded-full bg-gradient-to-r from-pink-500 to-yellow-400 text-slate-900 font-bold uppercase tracking-widest text-lg shadow-lg hover:scale-105 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {spinning ? "Mengundi..." : "Draw"}
        </button>

        <div className="mt-4 text-xs opacity-70">
          {settings.excludePrevious
            ? `${remaining} / ${totalInRange} angka tersisa`
            : `Mode: angka boleh berulang`}
        </div>
      </main>

      <section className="px-6 pb-8">
        <div className="max-w-3xl mx-auto bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm uppercase tracking-widest opacity-70">
              History Pemenang
            </h2>
            <span className="text-xs opacity-60">{history.length} draws</span>
          </div>
          {history.length === 0 ? (
            <div className="text-sm opacity-60 py-4 text-center">
              Belum ada pemenang. Tekan Draw untuk mulai.
            </div>
          ) : (
            <ol className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto">
              {history.map((h, i) => (
                <li
                  key={`${h.timestamp}-${i}`}
                  className="bg-white/10 rounded-lg px-2 py-2 flex flex-col items-center"
                >
                  <span className="font-mono font-bold text-lg">
                    {String(h.number).padStart(padWidth, "0")}
                  </span>
                  <span className="text-[10px] opacity-60">
                    {new Date(h.timestamp).toLocaleTimeString()}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>
    </div>
  );
}
