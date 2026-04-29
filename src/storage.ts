import type { Participant } from "./participants";

export interface DoorPrizeSettings {
  minNumber: number;
  maxNumber: number;
  excludePrevious: boolean;
  prizeTitle: string;
  adminPassword: string;
  winnersPerDraw: number;
  spinDurationSeconds: number;
}

export interface HistoryEntry {
  participantId: string;
  participantName: string;
  dinas: string;
  workLocation: string;
  timestamp: number;
}

const SETTINGS_KEY = "doorprize.settings";
const HISTORY_KEY = "doorprize.history";
const PARTICIPANTS_KEY = "doorprize.participants";

export const DEFAULT_SETTINGS: DoorPrizeSettings = {
  minNumber: 1,
  maxNumber: 500,
  excludePrevious: true,
  prizeTitle: "Halal Bi Halal Door Prize",
  adminPassword: "admin123",
  winnersPerDraw: 1,
  spinDurationSeconds: 3.2,
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
    const parsed = JSON.parse(raw) as Array<
      HistoryEntry & { number?: number }
    >;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((entry) => {
        if (
          typeof entry.participantId === "string" &&
          typeof entry.participantName === "string"
        ) {
          return {
            participantId: entry.participantId,
            participantName: entry.participantName,
            dinas: entry.dinas ?? "",
            workLocation: entry.workLocation ?? "",
            timestamp: entry.timestamp,
          };
        }
        if (typeof entry.number === "number") {
          return {
            participantId: String(entry.number),
            participantName: `Nomor ${entry.number}`,
            dinas: "",
            workLocation: "",
            timestamp: entry.timestamp,
          };
        }
        return null;
      })
      .filter((entry): entry is HistoryEntry => entry != null);
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

export function loadParticipants(): Participant[] {
  try {
    const raw = localStorage.getItem(PARTICIPANTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Participant[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (participant) =>
        typeof participant?.employeeId === "string" &&
        typeof participant?.employeeName === "string"
    );
  } catch {
    return [];
  }
}

export function saveParticipants(participants: Participant[]): void {
  localStorage.setItem(PARTICIPANTS_KEY, JSON.stringify(participants));
}

export function clearParticipants(): void {
  localStorage.removeItem(PARTICIPANTS_KEY);
}
