export function chooseRandomWinners(
  min: number,
  max: number,
  exclude: Set<number>,
  count: number,
  random: () => number = Math.random
): number[] {
  const pool: number[] = [];
  for (let n = min; n <= max; n += 1) {
    if (!exclude.has(n)) {
      pool.push(n);
    }
  }

  const target = Math.max(0, Math.min(count, pool.length));
  const winners: number[] = [];
  for (let i = 0; i < target; i += 1) {
    const idx = Math.floor(random() * pool.length);
    const [winner] = pool.splice(idx, 1);
    winners.push(winner);
  }

  return winners;
}
