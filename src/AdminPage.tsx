import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  clearParticipants,
  clearHistory,
  DEFAULT_SETTINGS,
  loadHistory,
  loadParticipants,
  loadSettings,
  saveParticipants,
  saveSettings,
  type DoorPrizeSettings,
} from "./storage";
import { normalizeImportedParticipants } from "./participants";
import * as XLSX from "xlsx";

const SESSION_KEY = "doorprize.adminAuthed";

function Bg({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative text-islam-cream">
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/background-wa-2026-04-28-230136.jpeg')" }}
        aria-hidden
      />
      <div
        className="fixed inset-0 -z-10 bg-islam-deep/42"
        aria-hidden
      />
      <div
        className="fixed inset-0 -z-10 opacity-10"
        style={{
          background:
            "radial-gradient(circle at 20% 0%, rgba(240,198,74,0.35), transparent 45%), radial-gradient(circle at 80% 100%, rgba(123,61,168,0.4), transparent 50%)",
        }}
        aria-hidden
      />
      {children}
    </div>
  );
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === "1"
  );
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState("");

  const [settings, setSettings] = useState<DoorPrizeSettings>(loadSettings());
  const [historyCount, setHistoryCount] = useState(() => loadHistory().length);
  const [participantCount, setParticipantCount] = useState(
    () => loadParticipants().length
  );
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const current = loadSettings();
    if (pwInput === current.adminPassword) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setAuthed(true);
      setPwError("");
      setPwInput("");
    } else {
      setPwError("Password salah");
    }
  }

  function handleLogout() {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthed(false);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const min = Math.floor(Number(settings.minNumber));
    const max = Math.floor(Number(settings.maxNumber));
    const winnersPerDraw = Math.floor(Number(settings.winnersPerDraw));
    const spinDurationSeconds = Number(settings.spinDurationSeconds);
    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      setError("Min dan max harus angka.");
      return;
    }
    if (min < 0 || max < 0) {
      setError("Min dan max tidak boleh negatif.");
      return;
    }
    if (min > max) {
      setError("Min tidak boleh lebih besar dari max.");
      return;
    }
    if (max - min > 1000000) {
      setError("Range terlalu besar (max 1.000.000 angka).");
      return;
    }
    if (!settings.adminPassword) {
      setError("Password admin tidak boleh kosong.");
      return;
    }
    if (!Number.isFinite(winnersPerDraw) || winnersPerDraw < 1) {
      setError("Jumlah pemenang per draw minimal 1.");
      return;
    }
    if (!Number.isFinite(spinDurationSeconds)) {
      setError("Durasi spin harus berupa angka.");
      return;
    }
    if (spinDurationSeconds < 1.5 || spinDurationSeconds > 8) {
      setError("Durasi spin harus di antara 1.5 sampai 8 detik.");
      return;
    }
    if (winnersPerDraw > max - min + 1) {
      setError("Jumlah pemenang per draw tidak boleh melebihi total angka dalam range.");
      return;
    }
    const next: DoorPrizeSettings = {
      ...settings,
      minNumber: min,
      maxNumber: max,
      prizeTitle: settings.prizeTitle.trim() || DEFAULT_SETTINGS.prizeTitle,
      winnersPerDraw,
      spinDurationSeconds,
    };
    saveSettings(next);
    setSettings(next);
    setSavedAt(Date.now());
  }

  function handleResetHistory() {
    if (confirm("Hapus semua history pemenang?")) {
      clearHistory();
      setHistoryCount(0);
    }
  }

  async function handleUploadParticipants(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    setError("");
    setUploadMessage("");

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheet = workbook.SheetNames[0];
      if (!firstSheet) {
        setError("File Excel tidak punya sheet yang bisa dibaca.");
        return;
      }

      const sheet = workbook.Sheets[firstSheet];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: "",
      });
      const participants = normalizeImportedParticipants(rows);
      if (participants.length === 0) {
        setError("Tidak ada data peserta valid. Pastikan kolom Employee ID dan Employee Name terisi.");
        return;
      }

      saveParticipants(participants);
      setParticipantCount(participants.length);
      setUploadMessage(
        `${participants.length} peserta berhasil diimport dari ${file.name}.`
      );
    } catch {
      setError("Gagal membaca file Excel. Pastikan format file .xlsx benar.");
    } finally {
      e.target.value = "";
    }
  }

  function handleClearParticipants() {
    if (confirm("Hapus semua data peserta yang sudah diupload?")) {
      clearParticipants();
      setParticipantCount(0);
      setUploadMessage("");
    }
  }

  function handleResetDefaults() {
    if (confirm("Reset semua pengaturan ke default?")) {
      saveSettings(DEFAULT_SETTINGS);
      setSettings({ ...DEFAULT_SETTINGS });
      setSavedAt(Date.now());
    }
  }

  if (!authed) {
    return (
      <Bg>
        <div className="min-h-screen flex items-center justify-center px-4">
          <form
            onSubmit={handleLogin}
            className="w-full max-w-sm bg-islam-deep/80 backdrop-blur border-2 border-islam-gold/40 rounded-2xl p-6 space-y-4 shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
          >
            <div className="flex items-center justify-between">
              <h1 className="font-display text-xl font-bold text-islam-gold">Admin Login</h1>
              <Link to="/" className="text-xs text-islam-cream/60 hover:text-islam-gold uppercase tracking-widest">
                ← Kembali
              </Link>
            </div>
            <label className="block text-sm">
              <span className="text-islam-cream/80">Password</span>
              <input
                type="password"
                autoFocus
                value={pwInput}
                onChange={(e) => setPwInput(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg bg-islam-deep border border-islam-gold/30 focus:outline-none focus:border-islam-gold text-islam-cream"
                placeholder="Masukkan password admin"
              />
            </label>
            {pwError && <div className="text-red-300 text-sm">{pwError}</div>}
            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-gradient-to-r from-islam-gold to-islam-goldDark text-islam-deep font-display font-bold uppercase tracking-widest"
            >
              Login
            </button>
            <p className="text-[11px] text-islam-cream/50">
              Default password: <code className="text-islam-gold">admin123</code> (ganti setelah login).
            </p>
          </form>
        </div>
      </Bg>
    );
  }

  return (
    <Bg>
      <header className="flex items-center justify-between px-6 py-4 border-b border-islam-gold/20">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-lg font-bold text-islam-gold">Admin Panel</h1>
          <Link
            to="/"
            className="text-xs uppercase tracking-[0.3em] text-islam-cream/60 hover:text-islam-gold"
          >
            ← Door Prize
          </Link>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs uppercase tracking-[0.3em] text-islam-cream/60 hover:text-islam-gold"
        >
          Logout
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <form
          onSubmit={handleSave}
          className="bg-islam-deep/80 backdrop-blur border-2 border-islam-gold/40 rounded-2xl p-6 space-y-5 shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
        >
          <h2 className="font-display text-sm uppercase tracking-[0.3em] text-islam-gold">
            Pengaturan Door Prize
          </h2>

          <label className="block text-sm">
            <span className="text-islam-cream/80">Judul</span>
            <input
              type="text"
              value={settings.prizeTitle}
              onChange={(e) =>
                setSettings({ ...settings, prizeTitle: e.target.value })
              }
              className="mt-1 w-full px-3 py-2 rounded-lg bg-islam-deep border border-islam-gold/30 focus:outline-none focus:border-islam-gold text-islam-cream"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm">
              <span className="text-islam-cream/80">Angka minimum</span>
              <input
                type="number"
                value={settings.minNumber}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    minNumber: Number(e.target.value),
                  })
                }
                className="mt-1 w-full px-3 py-2 rounded-lg bg-islam-deep border border-islam-gold/30 focus:outline-none focus:border-islam-gold text-islam-cream"
              />
            </label>
            <label className="block text-sm">
              <span className="text-islam-cream/80">Angka maksimum</span>
              <input
                type="number"
                value={settings.maxNumber}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    maxNumber: Number(e.target.value),
                  })
                }
                className="mt-1 w-full px-3 py-2 rounded-lg bg-islam-deep border border-islam-gold/30 focus:outline-none focus:border-islam-gold text-islam-cream"
              />
            </label>
          </div>

          <label className="flex items-center gap-3 text-sm cursor-pointer select-none text-islam-cream/90">
            <input
              type="checkbox"
              checked={settings.excludePrevious}
              onChange={(e) =>
                setSettings({ ...settings, excludePrevious: e.target.checked })
              }
              className="h-4 w-4 accent-islam-gold"
            />
            <span>
              Jangan ulang angka yang sudah keluar (eksklusi history pemenang)
            </span>
          </label>

          <label className="block text-sm">
            <span className="text-islam-cream/80">Password admin</span>
            <input
              type="text"
              value={settings.adminPassword}
              onChange={(e) =>
                setSettings({ ...settings, adminPassword: e.target.value })
              }
              className="mt-1 w-full px-3 py-2 rounded-lg bg-islam-deep border border-islam-gold/30 focus:outline-none focus:border-islam-gold font-mono text-islam-cream"
            />
            <span className="block text-[11px] text-islam-cream/50 mt-1">
              Disimpan di localStorage browser ini saja.
            </span>
          </label>

          <label className="block text-sm">
            <span className="text-islam-cream/80">Jumlah pemenang per draw</span>
            <input
              type="number"
              min={1}
              value={settings.winnersPerDraw}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  winnersPerDraw: Number(e.target.value),
                })
              }
              className="mt-1 w-full px-3 py-2 rounded-lg bg-islam-deep border border-islam-gold/30 focus:outline-none focus:border-islam-gold text-islam-cream"
            />
            <span className="block text-[11px] text-islam-cream/50 mt-1">
              Sekali klik Draw akan langsung mengeluarkan jumlah pemenang ini secara acak dan serentak.
            </span>
          </label>

          <label className="block text-sm">
            <span className="text-islam-cream/80">Durasi spin (detik)</span>
            <input
              type="number"
              min={1.5}
              max={8}
              step={0.1}
              value={settings.spinDurationSeconds}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  spinDurationSeconds: Number(e.target.value),
                })
              }
              className="mt-1 w-full px-3 py-2 rounded-lg bg-islam-deep border border-islam-gold/30 focus:outline-none focus:border-islam-gold text-islam-cream"
            />
            <span className="block text-[11px] text-islam-cream/50 mt-1">
              Atur lama animasi draw. Batas aman: 1.5 sampai 8 detik.
            </span>
          </label>

          <div className="rounded-xl border border-islam-gold/25 bg-islam-cream/5 p-4">
            <div className="text-sm text-islam-cream/90">Upload Data Peserta</div>
            <div className="mt-1 text-[11px] text-islam-cream/60">
              Upload file `.xlsx` dengan kolom `Employee ID`, `Employee Name`, `Dinas`, dan `Work Location`.
            </div>
            <input
              type="file"
              accept=".xlsx"
              onChange={handleUploadParticipants}
              className="mt-3 block w-full text-sm text-islam-cream file:mr-4 file:rounded-lg file:border-0 file:bg-islam-gold file:px-4 file:py-2 file:font-semibold file:text-islam-deep"
            />
            <div className="mt-3 text-sm text-islam-cream/80">
              {participantCount > 0
                ? `${participantCount} peserta siap diundi`
                : "Belum ada data peserta diupload"}
            </div>
            {uploadMessage && (
              <div className="mt-2 text-sm text-emerald-300">{uploadMessage}</div>
            )}
            <button
              type="button"
              onClick={handleClearParticipants}
              className="mt-3 px-4 py-2 rounded-lg bg-islam-cream/10 hover:bg-islam-cream/20 text-islam-cream text-sm"
            >
              Hapus data peserta
            </button>
          </div>

          {error && (
            <div className="text-red-300 text-sm bg-red-900/30 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-islam-gold to-islam-goldDark text-islam-deep font-display font-bold uppercase tracking-widest"
            >
              Simpan
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-5 py-2 rounded-lg bg-islam-cream/10 hover:bg-islam-cream/20 text-islam-cream"
            >
              Lihat Door Prize
            </button>
            {savedAt && (
              <span className="text-xs text-islam-cream/60">
                Tersimpan {new Date(savedAt).toLocaleTimeString()}
              </span>
            )}
          </div>
        </form>

        <div className="mt-6 bg-islam-deep/80 backdrop-blur border-2 border-islam-gold/40 rounded-2xl p-6 space-y-3 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
          <h2 className="font-display text-sm uppercase tracking-[0.3em] text-islam-gold">
            History
          </h2>
          <div className="text-sm text-islam-cream/80">
            {historyCount} pemenang tersimpan.
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleResetHistory}
              className="px-4 py-2 rounded-lg bg-islam-purple/80 hover:bg-islam-purple text-islam-cream text-sm font-semibold"
            >
              Hapus semua history
            </button>
            <button
              onClick={handleResetDefaults}
              className="px-4 py-2 rounded-lg bg-islam-cream/10 hover:bg-islam-cream/20 text-islam-cream text-sm"
            >
              Reset ke default
            </button>
          </div>
        </div>
      </main>
    </Bg>
  );
}
