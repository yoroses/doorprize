import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  clearHistory,
  DEFAULT_SETTINGS,
  loadHistory,
  loadSettings,
  saveSettings,
  type DoorPrizeSettings,
} from "./storage";

const SESSION_KEY = "doorprize.adminAuthed";

export default function AdminPage() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === "1"
  );
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState("");

  const [settings, setSettings] = useState<DoorPrizeSettings>(loadSettings());
  const [historyCount, setHistoryCount] = useState(() => loadHistory().length);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState("");

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
    const next: DoorPrizeSettings = {
      ...settings,
      minNumber: min,
      maxNumber: max,
      prizeTitle: settings.prizeTitle.trim() || DEFAULT_SETTINGS.prizeTitle,
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

  function handleResetDefaults() {
    if (confirm("Reset semua pengaturan ke default?")) {
      saveSettings(DEFAULT_SETTINGS);
      setSettings({ ...DEFAULT_SETTINGS });
      setSavedAt(Date.now());
    }
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center px-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Admin Login</h1>
            <Link to="/" className="text-xs opacity-60 hover:opacity-100">
              ← Kembali
            </Link>
          </div>
          <label className="block text-sm">
            <span className="opacity-80">Password</span>
            <input
              type="password"
              autoFocus
              value={pwInput}
              onChange={(e) => setPwInput(e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-800 border border-white/10 focus:outline-none focus:border-indigo-400"
              placeholder="Masukkan password admin"
            />
          </label>
          {pwError && <div className="text-red-400 text-sm">{pwError}</div>}
          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 font-semibold"
          >
            Login
          </button>
          <p className="text-[11px] opacity-50">
            Default password: <code>admin123</code> (ganti setelah login).
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold">Admin Panel</h1>
          <Link
            to="/"
            className="text-xs uppercase tracking-widest opacity-60 hover:opacity-100"
          >
            ← Door Prize
          </Link>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs uppercase tracking-widest opacity-60 hover:opacity-100"
        >
          Logout
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <form
          onSubmit={handleSave}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5"
        >
          <h2 className="text-sm uppercase tracking-widest opacity-70">
            Pengaturan Door Prize
          </h2>

          <label className="block text-sm">
            <span className="opacity-80">Judul</span>
            <input
              type="text"
              value={settings.prizeTitle}
              onChange={(e) =>
                setSettings({ ...settings, prizeTitle: e.target.value })
              }
              className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-800 border border-white/10 focus:outline-none focus:border-indigo-400"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm">
              <span className="opacity-80">Angka minimum</span>
              <input
                type="number"
                value={settings.minNumber}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    minNumber: Number(e.target.value),
                  })
                }
                className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-800 border border-white/10 focus:outline-none focus:border-indigo-400"
              />
            </label>
            <label className="block text-sm">
              <span className="opacity-80">Angka maksimum</span>
              <input
                type="number"
                value={settings.maxNumber}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    maxNumber: Number(e.target.value),
                  })
                }
                className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-800 border border-white/10 focus:outline-none focus:border-indigo-400"
              />
            </label>
          </div>

          <label className="flex items-center gap-3 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={settings.excludePrevious}
              onChange={(e) =>
                setSettings({ ...settings, excludePrevious: e.target.checked })
              }
              className="h-4 w-4 accent-indigo-400"
            />
            <span>
              Jangan ulang angka yang sudah keluar (eksklusi history pemenang)
            </span>
          </label>

          <label className="block text-sm">
            <span className="opacity-80">Password admin</span>
            <input
              type="text"
              value={settings.adminPassword}
              onChange={(e) =>
                setSettings({ ...settings, adminPassword: e.target.value })
              }
              className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-800 border border-white/10 focus:outline-none focus:border-indigo-400 font-mono"
            />
            <span className="block text-[11px] opacity-50 mt-1">
              Disimpan di localStorage browser ini saja.
            </span>
          </label>

          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 font-semibold"
            >
              Simpan
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-5 py-2 rounded-lg bg-white/10 hover:bg-white/20"
            >
              Lihat Door Prize
            </button>
            {savedAt && (
              <span className="text-xs opacity-60">
                Tersimpan {new Date(savedAt).toLocaleTimeString()}
              </span>
            )}
          </div>
        </form>

        <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
          <h2 className="text-sm uppercase tracking-widest opacity-70">
            History
          </h2>
          <div className="text-sm opacity-80">
            {historyCount} pemenang tersimpan.
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleResetHistory}
              className="px-4 py-2 rounded-lg bg-red-500/80 hover:bg-red-500 text-sm"
            >
              Hapus semua history
            </button>
            <button
              onClick={handleResetDefaults}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm"
            >
              Reset ke default
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
