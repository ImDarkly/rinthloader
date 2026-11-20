# Terminal Setup Dialog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the shortcut-gated beta terminal UI with the one-screen "rinthloader setup" dialog (prototype E) and make it the default UI.

**Architecture:** Pure logic (filtering, blockers, validation summary, mod-name parsing, remembered target) lives in `lib/terminal/` and is unit-tested with Vitest. Two hooks wrap it (`useTerminalDownload`, `useRememberedTarget`). The UI is a small set of focused components in `components/terminal/` composed by `SetupDialog`. `app/page.tsx` picks terminal vs classic from a persisted `ui` preference that defaults to terminal.

**Tech Stack:** Next.js 16 (app router, client components), React 19, Redux Toolkit, Tailwind 4, react-dropzone, next-themes, Vitest 3 (new, dev only).

**Spec:** `docs/superpowers/specs/2026-11-20-terminal-setup-dialog-design.md`. Visual reference: `components/proto/proto-e-setup.tsx` + `components/proto/shared.tsx` (throwaway spike; borrow from it, delete it in Task 7).

## Global Constraints

- No rounded corners, no soft shadows. The dialog uses `border-4 border-double` plus `shadow-[10px_10px_0_0_var(--muted-foreground)]`; overlays use `border-2` plus a `6px` hard shadow.
- Buttons read `< label >`, dropdown fields read `[ value ▼]`, checkboxes `[ ]`/`[X]`, radios `( )`/`(•)`.
- Hover and keyboard focus show inverse video (`bg-foreground text-background`). The primary button uses `bg-primary text-background`. Every interactive element has a visible `focus-visible` state.
- All copy is lowercase terminal style, e.g. `○ add at least one mod first`, `✓ ready: 3 mods for fabric 1.21.1`.
- No toasts in the terminal UI. Status and log changes go to an `aria-live="polite"` region.
- Download is never `disabled` for missing input. It prints the blocker instead. It is only `aria-busy` while checking.
- Everything works by mouse, and everything works by keyboard.
- Animation stops under `prefers-reduced-motion: reduce`.
- localStorage keys: `rinthloader:target` (`{"version": string, "loader": string}`) and `rinthloader:ui` (`"terminal" | "classic"`). Every access is wrapped in try/catch.
- Defaults on a first visit: latest release version, loader `fabric`, ui `terminal`.

## Review Focus

1. **Remembered version not in the current list** (removed version, or a snapshot while snapshots are off). Fall back to the latest release; never leave the field stuck on an unavailable value. Owner: Task 1 (`resolveRememberedVersion`).
2. **Corrupt or blocked localStorage.** Fall back to the defaults with no crash. Owner: Task 1 (`parseRememberedTarget`).
3. **Names mode with blank lines, surrounding spaces or duplicates.** Trim them, ignore blanks, de-duplicate case-insensitively, and count accordingly. Owner: Task 1 (`parseModNames`).
4. **Modrinth unreachable during the check.** An error line is logged, the button works again, and no navigation happens. Owner: Task 1 (`summarizeValidation`) and Task 2.
5. **Picker with zero matches, then ↵.** Nothing is picked, the overlay stays open, and it shows `no matches`. Owner: Task 3.

---

### Task 1: Pure terminal logic + Vitest

**Files:**
- Create: `lib/terminal/logic.ts`
- Create: `lib/terminal/logic.test.ts`
- Create: `vitest.config.mts`
- Modify: `package.json` (devDependency `vitest@^3`, script `"test": "vitest run"`)

**Interfaces:**
- Produces:
  - `type LogLine = { kind: "info" | "ok" | "warn" | "err"; text: string }`
  - `filterItems(items: string[], query: string): string[]` (case-insensitive substring match; an empty or whitespace query returns all items)
  - `parseModNames(text: string): string[]`
  - `getBlocker(s: { gameVersion: string | null; modLoader: string | null; modCount: number }): string | null`
  - `summarizeValidation(r: { valid: string[]; invalid: string[]; errors: string[] }): { lines: LogLine[]; proceed: "all" | "ask" | "none" }`
  - `parseRememberedTarget(raw: string | null): { version?: string; loader?: string }`
  - `resolveRememberedVersion(remembered: string | undefined, available: string[], latestRelease: string | null): string | null`

- [ ] **Step 1: Install Vitest and add config**

Run: `npm i -D vitest@^3`. Then create `vitest.config.mts` with `resolve.alias` mapping `@` to the project root and `test.environment: "node"`. Add `"test": "vitest run"` to the scripts.

- [ ] **Step 2: Write failing tests in `lib/terminal/logic.test.ts`**

```ts
describe("filterItems", () => {
  it("matches case-insensitively", () => expect(filterItems(["1.20.1", "Fabric"], "fab")).toEqual(["Fabric"]));
  it("returns all for blank query", () => expect(filterItems(["a", "b"], "  ")).toEqual(["a", "b"]));
  it("returns [] when nothing matches", () => expect(filterItems(["a"], "zz")).toEqual([]));
});
describe("parseModNames", () => {
  it("trims, drops blanks, dedupes case-insensitively keeping first", () =>
    expect(parseModNames(" sodium \n\nSodium\nlithium\n")).toEqual(["sodium", "lithium"]));
});
describe("getBlocker", () => {
  it("version first", () => expect(getBlocker({ gameVersion: null, modLoader: null, modCount: 0 })).toBe("pick a minecraft version first"));
  it("loader next", () => expect(getBlocker({ gameVersion: "1.21.1", modLoader: null, modCount: 0 })).toBe("pick a mod loader first"));
  it("mods next", () => expect(getBlocker({ gameVersion: "1.21.1", modLoader: "fabric", modCount: 0 })).toBe("add at least one mod first"));
  it("null when ready", () => expect(getBlocker({ gameVersion: "1.21.1", modLoader: "fabric", modCount: 2 })).toBeNull());
});
describe("summarizeValidation", () => {
  it("all valid", () => expect(summarizeValidation({ valid: ["a", "b"], invalid: [], errors: [] }))
    .toEqual({ lines: [{ kind: "ok", text: "2 found" }], proceed: "all" }));
  it("some invalid asks", () => expect(summarizeValidation({ valid: ["a"], invalid: ["x", "y"], errors: [] }))
    .toEqual({ lines: [{ kind: "ok", text: "1 found" }, { kind: "warn", text: "2 not found: x, y" }], proceed: "ask" }));
  it("none valid stops", () => expect(summarizeValidation({ valid: [], invalid: ["x"], errors: [] }).proceed).toBe("none"));
  it("network errors stop", () => expect(summarizeValidation({ valid: ["a"], invalid: [], errors: ["b"] }))
    .toEqual({ lines: [{ kind: "err", text: "couldn't reach modrinth for: b. try again" }], proceed: "none" }));
});
describe("parseRememberedTarget", () => {
  it("parses", () => expect(parseRememberedTarget('{"version":"1.21.1","loader":"fabric"}')).toEqual({ version: "1.21.1", loader: "fabric" }));
  it("null/corrupt/wrong types → {}", () => {
    expect(parseRememberedTarget(null)).toEqual({});
    expect(parseRememberedTarget("{oops")).toEqual({});
    expect(parseRememberedTarget('{"version":5}')).toEqual({});
  });
});
describe("resolveRememberedVersion", () => {
  it("keeps available", () => expect(resolveRememberedVersion("1.20.1", ["1.21.1", "1.20.1"], "1.21.1")).toBe("1.20.1"));
  it("falls back when missing", () => expect(resolveRememberedVersion("25w01a", ["1.21.1"], "1.21.1")).toBe("1.21.1"));
  it("falls back when none remembered", () => expect(resolveRememberedVersion(undefined, ["1.21.1"], "1.21.1")).toBe("1.21.1"));
});
```

- [ ] **Step 3: Run `npm test` and confirm it fails** because the module can't be resolved.

- [ ] **Step 4: Implement the functions in `lib/terminal/logic.ts`** with the exact signatures and copy from the Interfaces block. The file must have no React or browser imports.

- [ ] **Step 5: Run `npm test`.** Expected: all pass. Run `npx tsc --noEmit` and `npm run lint`. Expected: clean.

- [ ] **Step 6: Commit** with `git add package.json package-lock.json vitest.config.mts lib/terminal && git commit -m "feat(terminal): add tested setup-dialog logic"`.

---

### Task 2: Hooks — download log and remembered target

**Files:**
- Create: `hooks/useTerminalDownload.ts`
- Create: `hooks/useRememberedTarget.ts`

**Interfaces:**
- Consumes: Task 1 (`getBlocker`, `summarizeValidation`, `parseRememberedTarget`, `resolveRememberedVersion`, `LogLine`); `validateModSlugs` from `lib/modValidation.ts`; the Redux slices `gameVersion`, `modLoader` and `modNamesList`.
- Produces:
  - `useTerminalDownload(): { log: LogLine[]; isChecking: boolean; blocker: string | null; pendingValid: string[] | null; download(): Promise<void>; downloadAnyway(): void }`
  - `useRememberedTarget(versions: Version[], snapshots: boolean): void`. It sets the Redux version once versions load, using `resolveRememberedVersion` against the visible list (releases only, plus snapshots if enabled) and the latest release. It restores the loader if one was remembered. It writes `rinthloader:target` on every later change.

- [ ] **Step 1: Implement `useTerminalDownload`**

It behaves like `hooks/useModsDownload.ts`, but appends `LogLine`s instead of calling toasts.
- With a blocker, it logs `{kind:"warn", text: blocker}` and returns.
- Before checking, it clears `pendingValid` and logs `{kind:"info", text:"checking N mods on modrinth for <loader> <version>…"}`.
- With `proceed: "all"`, it logs `{kind:"ok", text:"downloading N mods as zip…"}` and navigates to `/api/download-mods?...` with the same params as today.
- With `proceed: "ask"`, it sets `pendingValid`. `downloadAnyway()` then navigates with `pendingValid` and clears it.
- `isChecking` always resets in `finally`.

- [ ] **Step 2: Implement `useRememberedTarget`** as described in Interfaces. The read happens once, after versions are non-empty. This replaces the `initializeLatestGameVersion` effect for the terminal UI only; classic keeps its own.

- [ ] **Step 3: Verify.** Run `npx tsc --noEmit && npm run lint`. Expected: clean.

- [ ] **Step 4: Commit** with `git commit -m "feat(terminal): add download-log and remembered-target hooks"`.

---

### Task 3: Dialog primitives — DialogButton, FuzzyPicker, DropField

**Files:**
- Create: `components/terminal/dialog-button.tsx`
- Create: `components/terminal/fuzzy-picker.tsx`
- Create: `components/terminal/drop-field.tsx`

**Interfaces:**
- Consumes: `filterItems` (Task 1).
- Produces:
  - `DialogButton({ children, onClick, primary?, busy?, className? })`. It renders `&lt; {children} &gt;`, sets `aria-busy` when `busy`, and is never `disabled`.
  - `FuzzyPicker({ id, label, items, value, onPick, rows = 7, autoFocus? })`. It renders a combobox `<input>` and a listbox. ↑ and ↓ move the cursor and ↵ picks the cursor item. Clicking an option picks it. ↵ with zero matches does nothing and the list shows `no matches`. The visible window is `rows` long and keeps the cursor in view. The cursor starts on `value` when present. It sets `aria-activedescendant` and `aria-selected`.
  - `DropField({ id, label, value, items, onPick, extra? })`. A `[ value ▼]` button (`aria-haspopup="listbox"`, `aria-expanded`) toggles an overlay that holds a `FuzzyPicker` and an `esc close` hint. Picking, Escape or a click outside closes the overlay and returns focus to the button. When `items` is empty it shows `loading…` instead of the picker.

Base these on `FuzzyPicker` in `components/proto/shared.tsx` and `DropField`/`DButton` in `components/proto/proto-e-setup.tsx`. Changes from the spike:
- No eslint-disable in `FuzzyPicker`: derive the clamped cursor instead of syncing it in an effect.
- Add the click-outside close.
- Add the empty-items `loading…` state.
- Make the overlay `w-full` on mobile.

- [ ] **Step 1: Implement the three components.**

- [ ] **Step 2: Verify.** Run `npx tsc --noEmit && npm run lint`. Expected: clean. These components get checked in the browser in Task 5.

- [ ] **Step 3: Commit** with `git commit -m "feat(terminal): add dialog button, fuzzy picker, drop field"`.

---

### Task 4: Mods field and status log

**Files:**
- Create: `components/terminal/mods-field.tsx`
- Create: `components/terminal/status-log.tsx`
- Modify: `lib/slices/uiSlice.ts` (keep `ImportMode = "auto" | "manual"`; `auto` = .jar files, `manual` = names)

**Interfaces:**
- Consumes: `parseModNames` (Task 1); `detectModFiles` and `getFilesFromEvent`; `setModNamesList` and `setImportMode`; `DialogButton` (Task 3); `useTerminalDownload` return type (Task 2).
- Produces:
  - `ModsField()`. It has a radiogroup (`aria-label="add mods by"`) with `( ) .jar files` / `( ) names`, and a count at the right of the row: `✓ N` when N > 0, otherwise `○ 0`.
    - In jar mode it shows a dashed react-dropzone box (`noClick`, `noKeyboard`) with `< browse >` calling `open()`.
    - While detecting, it shows `detecting…`. Each detected file then gets a line: `✓ <name>`, or `! <file>  no mod name found` in amber.
    - With no files yet, it shows the hint `names are read from Fabric jars`.
    - In names mode it shows a bordered textarea with the placeholder `sodium\nlithium\niris`, dispatching `setModNamesList(parseModNames(text))`.
  - `StatusLog({ download }: { download: ReturnType<typeof useTerminalDownload> })`. It is an `aria-live="polite"` region.
    - With an empty log and nothing checking, it shows `○ <blocker>` or `✓ ready: N mods for <loader> <version>`.
    - Otherwise it shows the log lines with these prefixes: `>` info, `✓` ok in `text-primary`, `!` warn in amber, `✗` err in `text-destructive`.
    - While checking it adds a `working…` line, and when there are `pendingValid` mods it adds `< download N found anyway >`.

- [ ] **Step 1: Implement both components.**

- [ ] **Step 2: Verify.** Run `npx tsc --noEmit && npm run lint && npm test`. Expected: clean, and Task 1's `parseModNames` tests still pass.

- [ ] **Step 3: Commit** with `git commit -m "feat(terminal): add mods field and status log"`.

---

### Task 5: SetupDialog, footer, and replacing the old terminal UI

**Files:**
- Create: `components/terminal/setup-dialog.tsx`
- Modify: `components/terminal/terminal-app.tsx` (render `SetupDialog` and `TerminalFooter`)
- Modify: `components/terminal/terminal-footer.tsx`
- Delete these files from `components/terminal/`, then grep to confirm nothing else imports them:
  - `terminal-form.tsx`, `terminal-config-section.tsx`, `terminal-config-field.tsx`
  - `terminal-select-game-version.tsx`, `terminal-select-mod-loader.tsx`, `terminal-select-theme.tsx`
  - `terminal-settings-control.tsx`, `terminal-toggle-snapshots.tsx`
  - `terminal-import-section.tsx`, `terminal-auto-import.tsx`, `terminal-dropzone.tsx`, `terminal-manual-input.tsx`
  - `terminal-download-section.tsx`, `terminal-header.tsx`, `blinking-cursor.tsx`

**Interfaces:**
- Consumes: Tasks 2–4; `useModrinthVersions` and `useModrinthLoaders`; `useSnapshotsContext` from `app/page.tsx`; `useTheme` from next-themes.
- Produces:
  - `SetupDialog()`. A `role="dialog"` with `aria-labelledby`, a `rinthloader setup` title notched into the top border, and `rinth` in `text-primary`. Its rows are:
    1. minecraft: `DropField` with the `[ ] snapshots` checkbox (`role="checkbox"`) as `extra`
    2. loader: `DropField`
    3. mods: `ModsField`
    4. a dashed divider, then `StatusLog`
    5. a centered `DialogButton primary busy={isChecking}` labelled `download`
  - The version items are releases, plus snapshots when enabled.
  - `TerminalFooter({ onClassic }: { onClassic?: () => void })` shows `source · mods by Modrinth · theme:<value> · classic view`. Clicking `theme:<value>` cycles light → dark → system. Clicking `classic view` calls `onClassic`. The `classic view` link is hidden when `onClassic` is absent; Task 6 wires it up.

- [ ] **Step 1: Implement `SetupDialog` and update `TerminalApp` and `TerminalFooter`.** `TerminalApp` takes an optional `onClassic` prop and passes it down.

- [ ] **Step 2: Delete the old components** and run `grep -rn "terminal-\(form\|config\|select\|settings\|toggle\|import\|auto-import\|dropzone\|manual-input\|download-section\|header\)\|blinking-cursor" app components hooks lib`. Expected: no matches outside `components/proto`.

- [ ] **Step 3: Check in the browser** with `npm run dev`. With the beta still enabled through the shortcut, check:
  - The version picker opens, filters and closes on ↵, Escape and a click outside, and focus returns to the field.
  - ↵ with no matches does nothing.
  - Snapshots adds snapshot versions.
  - .jar drop and `< browse >` both detect mods, and names mode counts de-duplicated names.
  - Download with no mods prints `! add at least one mod first`.
  - Download with `sodium` and `notarealmod123` prints `1 found` and `1 not found: notarealmod123`, plus the anyway button.
  - The whole flow can be done with tab, ↵ and the arrow keys only.
  - It looks right in both the light and the dark theme, and at 375px width.

- [ ] **Step 4: Verify.** Run `npx tsc --noEmit && npm run lint && npm test`. Expected: clean.

- [ ] **Step 5: Commit** with `git commit -m "feat(terminal): one-screen setup dialog replaces beta terminal UI"`.

---

### Task 6: Terminal as the default UI, with no shortcut gate

**Files:**
- Create: `hooks/useUiMode.ts`
- Delete: `hooks/useBetaEnabled.ts`, `components/ui-mode-shortcut.tsx`
- Modify: `app/page.tsx` (drop `BetaContext`/`useBetaContext` and choose with `useUiMode`)
- Modify: `components/footer.tsx` (add a `terminal view` link next to `UserPreferences`)

**Interfaces:**
- Produces: `useUiMode(): [UiMode, (m: UiMode) => void]`, where `type UiMode = "terminal" | "classic"`. It defaults to `"terminal"`, reads and writes `rinthloader:ui` in try/catch, and hydrates after mount like `useSnapshotsEnabled`. It also removes the old `isBetaEnabled` key.

- [ ] **Step 1: Implement `useUiMode`** and wire up `app/page.tsx`:
  - terminal mode renders `<TerminalApp onClassic={() => setMode("classic")} />`
  - classic mode renders today's layout, with `<Footer onTerminal={() => setMode("terminal")} />`

- [ ] **Step 2: Delete the shortcut and beta hook.** Run `grep -rn "useBetaContext\|UiModeShortcut\|useBetaEnabled\|isBetaEnabled" app components hooks`. Expected: no matches, except the one-time cleanup of the old key in `useUiMode`.

- [ ] **Step 3: Check in the browser** that:
  - A fresh profile (localStorage cleared) lands on the setup dialog.
  - `classic view` switches to classic, `terminal view` switches back, and the choice survives a reload.
  - Ctrl+Shift+U no longer does anything.

- [ ] **Step 4: Verify** with `npx tsc --noEmit && npm run lint && npm test`, then commit with `git commit -m "feat: make terminal setup dialog the default UI"`.

---

### Task 7: Remove the prototype spike and run final checks

**Files:**
- Delete: `app/proto/`, `components/proto/`, `.claude/launch.json` (keep it only if the user wants it)

- [ ] **Step 1: Delete the spike.** Run `grep -rn "components/proto\|/proto/" app components hooks lib`. Expected: no matches.

- [ ] **Step 2: Run the full verification:** `npx tsc --noEmit && npm run lint && npm test && npm run build`. Expected: all succeed.

- [ ] **Step 3: Smoke test in the browser** against the production build (`npm start`). Repeat Task 5 step 3's `sodium` + `notarealmod123` check, and confirm the real zip download starts for `sodium` alone.

- [ ] **Step 4: Commit** with `git commit -m "chore: remove terminal UI prototypes"`.
