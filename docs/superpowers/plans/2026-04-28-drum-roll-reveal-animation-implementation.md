# Drum Roll Reveal Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dramatic drum roll plus flash reveal animation to the draw panel for both participant and number modes.

**Architecture:** Extend the draw flow in `HomePage.tsx` with explicit animation phases so timing and visual states are predictable. Add focused CSS classes in the app styles for zoom, glow, shake, flash, and reveal entrance without changing the winner selection logic.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS, existing app CSS

---

### Task 1: Add animation phase state to the draw flow

**Files:**
- Modify: `src/HomePage.tsx`

- [ ] **Step 1: Write the failing behavior expectation**

```ts
type RevealPhase = "idle" | "rolling" | "flash" | "revealed";
```

- [ ] **Step 2: Run verification command to capture current baseline**

Run: `npm run build`
Expected: PASS before the animation refactor.

- [ ] **Step 3: Write minimal implementation**

```tsx
const [revealPhase, setRevealPhase] = useState<RevealPhase>("idle");
```

```tsx
setRevealPhase("rolling");
window.setTimeout(() => setRevealPhase("flash"), duration - 140);
window.setTimeout(() => setRevealPhase("revealed"), duration);
```

- [ ] **Step 4: Run build to verify it passes**

Run: `npm run build`
Expected: PASS with no type errors.

### Task 2: Apply animation classes and flash overlay

**Files:**
- Modify: `src/HomePage.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Add UI hooks for animation states**

```tsx
className={`
  draw-panel
  ${revealPhase === "rolling" ? "draw-panel--rolling" : ""}
  ${revealPhase === "flash" ? "draw-panel--flash" : ""}
  ${revealPhase === "revealed" ? "draw-panel--revealed" : ""}
`}
```

- [ ] **Step 2: Add CSS effects**

```css
.draw-panel--rolling {
  animation: drawPanelPulse 0.8s ease-in-out infinite;
}

.draw-flash {
  animation: drawFlash 180ms ease-out forwards;
}
```

- [ ] **Step 3: Run lint and build**

Run: `npm run lint`
Expected: PASS

Run: `npm run build`
Expected: PASS

### Task 3: Add final reveal entrance for winner cards

**Files:**
- Modify: `src/HomePage.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Add reveal class to winner blocks**

```tsx
className={`winner-card ${revealPhase === "revealed" ? "winner-card--revealed" : ""}`}
style={{ animationDelay: `${index * 90}ms` }}
```

- [ ] **Step 2: Add CSS entrance**

```css
.winner-card--revealed {
  animation: winnerRiseIn 320ms ease-out both;
}
```

- [ ] **Step 3: Run full verification**

Run: `npm test`
Expected: PASS

Run: `npm run lint`
Expected: PASS

Run: `npm run build`
Expected: PASS
