# Step Down Draw Speed Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the rolling draw animation start fast and slow down before the final reveal.

**Architecture:** Replace the fixed 60ms interval loop in `HomePage.tsx` with a staged timeout scheduler that derives delay from elapsed progress. Keep winner selection, flash timing, and reveal logic unchanged.

**Tech Stack:** React 19, TypeScript, Vite

---

### Task 1: Replace fixed rolling interval with staged delays

**Files:**
- Modify: `src/HomePage.tsx`

- [ ] **Step 1: Capture current verification baseline**

Run: `npm run build`
Expected: PASS

- [ ] **Step 2: Implement staged rolling scheduler**

```tsx
function getRollDelay(progress: number) {
  if (progress < 0.45) return 40;
  if (progress < 0.75) return 70;
  if (progress < 0.92) return 110;
  return 170;
}
```

```tsx
function scheduleNextTick() {
  const elapsed = Date.now() - start;
  const progress = elapsed / duration;
  const delay = getRollDelay(progress);
  timeoutRef.current = window.setTimeout(scheduleNextTick, delay);
}
```

- [ ] **Step 3: Run full verification**

Run: `npm test`
Expected: PASS

Run: `npm run lint`
Expected: PASS

Run: `npm run build`
Expected: PASS
