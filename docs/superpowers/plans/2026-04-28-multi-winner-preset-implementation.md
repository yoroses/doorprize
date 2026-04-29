# Multi Winner Batch Draw Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow admin to configure how many winners a single draw should reveal so one click can produce multiple random winners at once.

**Architecture:** Replace the single or preset winner settings with a simple `winnersPerDraw` number stored in local settings. Add a focused helper that pulls unique random winners from the available pool, then update the home page to animate once and reveal a winner grid simultaneously.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, ESLint, localStorage

---

### Task 1: Add failing tests for multi-winner helpers

**Files:**
- Modify: `src/draw.test.ts`
- Modify: `src/draw.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { chooseWinner, chooseWinners, shuffleNumbers } from "./draw";

describe("chooseWinners", () => {
  it("returns the preset winners when all are valid", () => {
    expect(chooseWinners(1, 100, new Set(), [6, 42, 11])).toEqual([6, 42, 11]);
  });

  it("returns null when a preset winner is outside the range", () => {
    expect(chooseWinners(1, 10, new Set(), [6, 42])).toBeNull();
  });

  it("returns null when a preset winner is excluded", () => {
    expect(chooseWinners(1, 10, new Set([6]), [6, 7])).toBeNull();
  });
});

describe("shuffleNumbers", () => {
  it("keeps the same members after shuffling", () => {
    const input = [6, 42, 11, 88, 3, 57];
    const shuffled = shuffleNumbers(input, () => 0.3);

    expect([...shuffled].sort((a, b) => a - b)).toEqual([...input].sort((a, b) => a - b));
    expect(shuffled).toHaveLength(input.length);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL because `chooseWinners` and `shuffleNumbers` do not exist yet.

- [ ] **Step 3: Write minimal implementation**

```ts
export function chooseWinners(
  min: number,
  max: number,
  exclude: Set<number>,
  forcedWinners: number[]
): number[] | null {
  if (forcedWinners.length === 0) {
    return null;
  }
  for (const winner of forcedWinners) {
    if (winner < min || winner > max || exclude.has(winner)) {
      return null;
    }
  }
  return [...forcedWinners];
}

export function shuffleNumbers(
  values: number[],
  random: () => number = Math.random
): number[] {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS for the new helper tests.

- [ ] **Step 5: Commit**

```bash
git add src/draw.ts src/draw.test.ts
git commit -m "test: cover multi-winner draw helpers"
```

### Task 2: Move settings from single winner to preset list

**Files:**
- Modify: `src/storage.ts`
- Modify: `src/AdminPage.tsx`

- [ ] **Step 1: Write the failing test**

```ts
it("returns null for empty preset lists", () => {
  expect(chooseWinners(1, 100, new Set(), [])).toBeNull();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL because empty preset handling is not defined yet.

- [ ] **Step 3: Write minimal implementation**

```ts
export interface DoorPrizeSettings {
  minNumber: number;
  maxNumber: number;
  excludePrevious: boolean;
  prizeTitle: string;
  adminPassword: string;
  forcedWinners: number[];
}

export const DEFAULT_SETTINGS: DoorPrizeSettings = {
  minNumber: 1,
  maxNumber: 500,
  excludePrevious: true,
  prizeTitle: "Halal Bi Halal Door Prize",
  adminPassword: "admin123",
  forcedWinners: [],
};
```

```tsx
const parsedForcedWinners = settings.forcedWinnersInput
  .split(",")
  .map((part) => part.trim())
  .filter(Boolean)
  .map((part) => Number(part));
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS with empty preset behavior handled.

- [ ] **Step 5: Commit**

```bash
git add src/storage.ts src/AdminPage.tsx src/draw.test.ts
git commit -m "feat: store multi-winner preset settings"
```

### Task 3: Update draw execution and UI for simultaneous winner reveal

**Files:**
- Modify: `src/HomePage.tsx`
- Modify: `src/draw.ts`

- [ ] **Step 1: Write the failing test**

```ts
it("returns the single random winner when no preset list exists", () => {
  expect(chooseWinner(4, 4, new Set(), null)).toBe(4);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL only if refactoring broke existing single winner logic.

- [ ] **Step 3: Write minimal implementation**

```tsx
const presetWinners = chooseWinners(
  settings.minNumber,
  settings.maxNumber,
  exclude,
  settings.forcedWinners
);
const winners = presetWinners
  ? shuffleNumbers(presetWinners)
  : [chooseWinner(settings.minNumber, settings.maxNumber, exclude, null)].filter(
      (value): value is number => value != null
    );
```

```tsx
{revealedWinners.length > 1 ? (
  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
    {revealedWinners.map((winner) => (
      <div key={winner}>{formatted(winner)}</div>
    ))}
  </div>
) : (
  <div>{display == null ? "—".padEnd(padWidth, "—") : formatted(display)}</div>
)}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS for helper coverage after the UI refactor.

- [ ] **Step 5: Commit**

```bash
git add src/HomePage.tsx src/draw.ts src/draw.test.ts
git commit -m "feat: reveal preset multi-winner draws at once"
```

### Task 4: Verify the integrated app behavior

**Files:**
- Modify: `src/AdminPage.tsx`
- Modify: `src/HomePage.tsx`
- Modify: `src/storage.ts`
- Modify: `src/draw.ts`
- Modify: `src/draw.test.ts`

- [ ] **Step 1: Run the focused test suite**

Run: `npm test`
Expected: PASS with all helper tests green.

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: PASS with zero errors.

- [ ] **Step 3: Run production build**

Run: `npm run build`
Expected: PASS with generated `dist/` output.

- [ ] **Step 4: Commit**

```bash
git add src/AdminPage.tsx src/HomePage.tsx src/storage.ts src/draw.ts src/draw.test.ts
git commit -m "feat: add admin-configured multi-winner preset draws"
```
