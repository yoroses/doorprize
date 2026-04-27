export interface DoorPrizeSettings {
  minNumber: number;
  maxNumber: number;
  excludePrevious: boolean;
  prizeTitle: string;
  adminPassword: string;
}

export interface HistoryEntry {
  number: number;
  timestamp: number;
}

const SETTINGS_KEY = "doorprize.settings";
const HISTORY_KEY = "doorprize.history";

export const DEFAULT_SETTINGS: DoorPrizeSettings = {
  minNumber: 1,
  maxNumber: 500,
  excludePrevious: true,
  prizeTitle: "Halal Bi Halal Door Prize",
  adminPassword: "admin123",
};

export function loadSettings(): DoorPrizeSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<DoorPrizeSettings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: DoorPrizeSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveHistory(history: HistoryEntry[]): void {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}
