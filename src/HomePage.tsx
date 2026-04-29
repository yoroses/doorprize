import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  loadHistory,
  loadParticipants,
  loadSettings,
  saveHistory,
  type HistoryEntry,
} from "./storage";
import { chooseRandomWinners } from "./draw";
import { chooseRandomItems, type Participant } from "./participants";

type RevealPhase = "idle" | "rolling" | "flash" | "revealed";

export default function HomePage() {
  const [settings, setSettings] = useState(loadSettings());
  const [participants, setParticipants] = useState<Participant[]>(loadParticipants());
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory());
  const [displayValues, setDisplayValues] = useState<number[]>([]);
  const [displayParticipants, setDisplayParticipants] = useState<Participant[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [drawError, setDrawError] = useState("");
  const [revealPhase, setRevealPhase] = useState<RevealPhase>("idle");
  const timeoutRef = useRef<number | null>(null);

  function clearTimers() {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  function getRollDelay(progress: number) {
    if (progress < 0.45) return 40;
    if (progress < 0.75) return 70;
    if (progress < 0.92) return 110;
    return 170;
  }

  useEffect(() => {
    const onFocus = () => {
      setSettings(loadSettings());
      setParticipants(loadParticipants());
      setHistory(loadHistory());
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const drawnSet = useMemo(
    () => new Set(history.map((h) => h.participantId)),
    [history]
  );

  const participantMode = participants.length > 0;
  const totalInRange = participantMode
    ? participants.length
    : Math.max(0, settings.maxNumber - settings.minNumber + 1);
  const remaining = settings.excludePrevious
    ? Math.max(0, totalInRange - history.length)
    : totalInRange;

  function handleDraw() {
    if (spinning) return;
    if (participantMode) {
      const winners = chooseRandomItems(
        participants,
        settings.excludePrevious ? drawnSet : new Set<string>(),
        settings.winnersPerDraw
      );
      if (winners.length === 0) {
        setDrawError("Semua peserta sudah pernah menang. Reset history di admin panel.");
        return;
      }

      setDrawError("");
      setSpinning(true);
      setRevealPhase("rolling");
      setDisplayValues([]);
      setDisplayParticipants([]);

      const start = Date.now();
      const duration = Math.round(settings.spinDurationSeconds * 1000);
      const flashAt = duration - 140;
      const tick = () => {
        const elapsed = Date.now() - start;
        if (elapsed >= flashAt && revealPhase !== "flash") {
          setRevealPhase("flash");
        }
        if (elapsed >= duration) {
          clearTimers();
          setDisplayParticipants(winners);
          setSpinning(false);
          setRevealPhase("revealed");
          const timestamp = Date.now();
          const entries: HistoryEntry[] = winners.map((winner, index) => ({
            participantId: winner.employeeId,
            participantName: winner.employeeName,
            dinas: winner.dinas,
            workLocation: winner.workLocation,
            timestamp: timestamp + index,
          }));
          const next = [...entries, ...history];
          setHistory(next);
          saveHistory(next);
        } else {
          setDisplayParticipants(
            chooseRandomItems(participants, new Set(), Math.max(winners.length, 1))
          );
          timeoutRef.current = window.setTimeout(
            tick,
            getRollDelay(elapsed / duration)
          );
        }
      };
      tick();
      return;
    }

    const winners = chooseRandomWinners(
      settings.minNumber,
      settings.maxNumber,
      new Set(
        settings.excludePrevious
          ? history
              .map((entry) => Number(entry.participantId))
              .filter((value) => Number.isFinite(value))
          : []
      ),
      settings.winnersPerDraw
    );
    if (winners.length === 0) {
      setDrawError("Semua angka dalam range sudah keluar. Reset history di admin panel.");
      return;
    }

    setDrawError("");
    setSpinning(true);
    setRevealPhase("rolling");
    setDisplayValues([]);
    setDisplayParticipants([]);

    const start = Date.now();
    const duration = Math.round(settings.spinDurationSeconds * 1000);
    const flashAt = duration - 140;
    const tick = () => {
      const elapsed = Date.now() - start;
      if (elapsed >= flashAt && revealPhase !== "flash") {
        setRevealPhase("flash");
      }
      if (elapsed >= duration) {
        clearTimers();
        setDisplayValues(winners);
        setSpinning(false);
        setRevealPhase("revealed");
        const timestamp = Date.now();
        const entries: HistoryEntry[] = winners.map((winner, index) => ({
          participantId: String(winner),
          participantName: `Nomor ${winner}`,
          dinas: "",
          workLocation: "",
          timestamp: timestamp + index,
        }));
        const next = [...entries, ...history];
        setHistory(next);
        saveHistory(next);
      } else {
        const min = settings.minNumber;
        const max = settings.maxNumber;
        const randomValues = Array.from(
          { length: Math.max(winners.length, 1) },
          () => Math.floor(Math.random() * (max - min + 1)) + min
        );
        setDisplayValues(randomValues);
        timeoutRef.current = window.setTimeout(
          tick,
          getRollDelay(elapsed / duration)
        );
      }
    };
    tick();
  }

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, []);

  useEffect(() => {
    if (!spinning && revealPhase === "revealed") {
      const timeout = window.setTimeout(() => {
        setRevealPhase("idle");
      }, 900);
      return () => window.clearTimeout(timeout);
    }
  }, [revealPhase, spinning]);

  const padWidth = String(settings.maxNumber).length;
  const formatted = (n: number) => String(n).padStart(padWidth, "0");
  const winnerSlots = Math.max(
    settings.winnersPerDraw,
    participantMode ? displayParticipants.length : displayValues.length,
    1
  );
  const multiWinnerMode = winnerSlots > 1;

  return (
    <div className="min-h-screen relative text-islam-cream">
      {/* Gradient background */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/background-wa-2026-04-28-230136.jpeg')" }}
        aria-hidden
      />
      <div
        className="fixed inset-0 -z-10 bg-islam-deep/35"
        aria-hidden
      />
      <div
        className="fixed inset-0 -z-10 opacity-12"
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

      {/* Door prize card */}
      <main className="relative px-4 pb-6 flex flex-col items-center text-center">
        <div
          className="font-display font-black uppercase mb-3"
          style={{
            fontSize: "clamp(2rem, 6vw, 4.25rem)",
            letterSpacing: "0.12em",
            color: "#f6d777",
            textShadow:
              "0 3px 0 rgba(15,23,15,0.72), 0 8px 24px rgba(0,0,0,0.38), 0 0 30px rgba(240,198,74,0.45)",
            WebkitTextStroke: "1.5px rgba(15,23,15,0.78)",
          }}
        >
          ✦ Door Prize ✦
        </div>
        <div className="text-sm uppercase tracking-[0.3em] text-islam-cream/80 mb-4">
          {participantMode
            ? `${participants.length} peserta siap diundi`
            : `Range ${settings.minNumber} – ${settings.maxNumber}`}
        </div>
        {settings.winnersPerDraw > 1 && (
          <div className="mb-4 rounded-full border border-islam-gold/40 bg-islam-gold/10 px-4 py-2 text-xs uppercase tracking-[0.25em] text-islam-gold">
            Sekali draw akan langsung memilih {settings.winnersPerDraw} pemenang acak
          </div>
        )}

        <div
          className={`draw-panel relative my-2 px-10 py-8 rounded-3xl bg-islam-deep/80 backdrop-blur border-2 ${
            spinning ? "border-islam-gold animate-pulse" : "border-islam-gold/60"
          } ${
            revealPhase === "rolling" ? "draw-panel--rolling" : ""
          } ${
            revealPhase === "flash" ? "draw-panel--flash" : ""
          } ${
            revealPhase === "revealed" ? "draw-panel--revealed" : ""
          } shadow-[0_10px_40px_rgba(0,0,0,0.5)]`}
        >
          <div
            className={`pointer-events-none absolute inset-0 rounded-3xl ${
              revealPhase === "flash" ? "draw-flash" : "opacity-0"
            }`}
          />
          {/* corner ornaments */}
          <span className="absolute -top-3 -left-3 text-2xl text-islam-purple drop-shadow">✿</span>
          <span className="absolute -top-3 -right-3 text-2xl text-islam-gold drop-shadow">✦</span>
          <span className="absolute -bottom-3 -left-3 text-2xl text-islam-gold drop-shadow">✦</span>
          <span className="absolute -bottom-3 -right-3 text-2xl text-islam-purple drop-shadow">✿</span>

          {multiWinnerMode ? (
            participantMode ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {(displayParticipants.length > 0
                  ? displayParticipants
                  : Array.from({ length: winnerSlots }, () => null)
                ).map((winner, index) => (
                  <div
                    key={winner ? winner.employeeId : `placeholder-${index}`}
                    className={`winner-card rounded-2xl border border-islam-gold/30 bg-islam-green/30 p-4 text-left shadow-[0_6px_20px_rgba(0,0,0,0.25)] ${
                      revealPhase === "revealed" ? "winner-card--revealed" : ""
                    }`}
                    style={{ animationDelay: `${index * 90}ms` }}
                  >
                    <div className="font-display text-2xl text-islam-gold">
                      {winner ? winner.employeeId : "—".padEnd(6, "—")}
                    </div>
                    <div className="mt-1 text-base font-semibold text-islam-cream">
                      {winner ? winner.employeeName : "Menunggu peserta"}
                    </div>
                    <div className="mt-2 text-xs uppercase tracking-[0.2em] text-islam-cream/70">
                      {winner ? winner.dinas || "Tanpa dinas" : " "}
                    </div>
                    <div className="mt-1 text-sm text-islam-cream/70">
                      {winner ? winner.workLocation || "Tanpa lokasi" : " "}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {(displayValues.length > 0
                  ? displayValues
                  : Array.from({ length: winnerSlots }, () => -1)
                ).map((winner, index) => (
                  <div
                    key={`${winner}-${index}`}
                    className={`winner-card font-display font-black tabular-nums leading-none select-none ${
                      spinning ? "text-islam-gold" : "text-islam-cream"
                    } ${revealPhase === "revealed" ? "winner-card--revealed" : ""}`}
                    style={{ animationDelay: `${index * 90}ms` }}
                    {...{
                      fontSize: "clamp(2.4rem, 8vw, 5rem)",
                      letterSpacing: "0.05em",
                      textShadow:
                        "0 4px 0 rgba(0,0,0,0.35), 0 0 30px rgba(240,198,74,0.45)",
                      WebkitTextStroke: "2px rgba(0,0,0,0.45)",
                    }}
                  >
                    {winner < 0 ? "—".padEnd(padWidth, "—") : formatted(winner)}
                  </div>
                ))}
              </div>
            )
          ) : (
            participantMode ? (
              <div className="rounded-2xl border border-islam-gold/30 bg-islam-green/30 p-6 text-left shadow-[0_6px_20px_rgba(0,0,0,0.25)]">
                <div className="font-display text-4xl text-islam-gold">
                  {displayParticipants[0]?.employeeId ?? "—".padEnd(6, "—")}
                </div>
                <div className="mt-2 text-xl font-semibold text-islam-cream">
                  {displayParticipants[0]?.employeeName ?? "Menunggu peserta"}
                </div>
                <div className="mt-3 text-xs uppercase tracking-[0.2em] text-islam-cream/70">
                  {displayParticipants[0]?.dinas ?? " "}
                </div>
                <div className="mt-1 text-sm text-islam-cream/70">
                  {displayParticipants[0]?.workLocation ?? " "}
                </div>
              </div>
            ) : (
              <div
                className={`winner-card font-display font-black tabular-nums leading-none select-none ${
                  spinning ? "text-islam-gold" : "text-islam-cream"
                } ${revealPhase === "revealed" ? "winner-card--revealed" : ""}`}
                style={{
                  fontSize: "clamp(4rem, 16vw, 11rem)",
                  letterSpacing: "0.05em",
                  textShadow:
                    "0 4px 0 rgba(0,0,0,0.35), 0 0 30px rgba(240,198,74,0.45)",
                  WebkitTextStroke: "2px rgba(0,0,0,0.45)",
                }}
              >
                {displayValues.length === 0
                  ? "—".padEnd(padWidth, "—")
                  : formatted(displayValues[0])}
              </div>
            )
          )}
        </div>

        {drawError && (
          <div className="text-islam-gold text-sm mt-3">
            {drawError}
          </div>
        )}

        <button
          onClick={handleDraw}
          disabled={spinning || remaining === 0}
          className="mt-6 px-12 py-4 rounded-full bg-gradient-to-r from-islam-gold to-islam-goldDark text-islam-deep font-display font-bold uppercase tracking-[0.25em] text-lg shadow-[0_8px_24px_rgba(0,0,0,0.4)] hover:scale-105 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 border-2 border-islam-cream/30"
        >
          {spinning ? "Mengundi..." : settings.winnersPerDraw > 1 ? `Draw ${settings.winnersPerDraw}` : "Draw"}
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
            <span className="text-xs text-islam-cream/70">{history.length} winners</span>
          </div>
          {history.length === 0 ? (
            <div className="text-sm text-islam-cream/70 py-6 text-center italic">
              Belum ada pemenang. Tekan Draw untuk mulai.
            </div>
          ) : (
            <ol className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-2 max-h-56 overflow-y-auto pr-1">
              {history.map((h, i) => (
                <li
                  key={`${h.participantId}-${h.timestamp}-${i}`}
                  className={`rounded-xl px-3 py-3 flex flex-col items-start border ${
                    i === 0
                      ? "bg-islam-gold text-islam-deep border-islam-cream"
                      : "bg-islam-deep/80 text-islam-cream border-islam-gold/30"
                  }`}
                >
                  <span className="font-display font-bold text-lg">
                    {participantMode ? h.participantId : String(h.participantId).padStart(padWidth, "0")}
                  </span>
                  <span className="text-xs font-semibold">{h.participantName}</span>
                  {participantMode && h.dinas && (
                    <span className="text-[10px] opacity-70">{h.dinas}</span>
                  )}
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
