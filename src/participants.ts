export interface Participant {
  employeeId: string;
  employeeName: string;
  dinas: string;
  workLocation: string;
}

export function normalizeImportedParticipants(
  rows: Record<string, unknown>[]
): Participant[] {
  return rows
    .map((row) => ({
      employeeId: String(row["Employee ID"] ?? "").trim(),
      employeeName: String(row["Employee Name"] ?? "").trim(),
      dinas: String(row["Dinas"] ?? "").trim(),
      workLocation: String(row["Work Location"] ?? "").trim(),
    }))
    .filter((participant) => participant.employeeId && participant.employeeName);
}

export function chooseRandomItems<T extends { employeeId: string }>(
  items: T[],
  excludeIds: Set<string>,
  count: number,
  random: () => number = Math.random
): T[] {
  const pool = items.filter((item) => !excludeIds.has(item.employeeId));
  const target = Math.max(0, Math.min(count, pool.length));
  const winners: T[] = [];

  for (let i = 0; i < target; i += 1) {
    const idx = Math.floor(random() * pool.length);
    const [winner] = pool.splice(idx, 1);
    winners.push(winner);
  }

  return winners;
}
