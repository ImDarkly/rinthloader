# Terminal setup dialog — design

Date: 2026-11-20
Status: draft, awaiting approval

## Intent

The terminal UI (`components/terminal/*`) is hidden behind Ctrl+Shift+U because it
didn't feel accessible enough to ship. We want a UI that feels like a real
terminal app — not a website in a monospace font — and is still easy for anyone
to use. After prototyping five directions (`/proto/a`–`e`), the one-screen
**setup dialog** (prototype E) was picked: classic installer/BIOS look, but
everything on one screen so a download takes few steps.

## Goals

- Iconic terminal look: double-border dialog, hard offset shadow, `< button >`
  labels, `[ value ▼]` fields, inverse-video focus/hover, no rounded corners.
- Fast: a returning user drops jars (or types names) and presses `< download >`.
- Clear: the line above the button always says what's missing or what happened.
- Accessible: everything clickable *and* keyboard-operable; visible focus;
  screen readers hear status and log changes.

## Non-goals

- New features beyond what the classic UI does (live Modrinth mod search from
  prototype D is out of scope; possible follow-up).
- Changing the download API, validation logic, or Redux shape.

## Anti-goals

- Looking like a modern web form (rounded inputs, soft shadows, pill buttons).
- Requiring the keyboard, or hiding functions behind shortcuts.
- A multi-step wizard (prototype C was rejected as too long).

## Approaches considered

| | Trade-off | Outcome |
|---|---|---|
| A · prompt wizard | Very readable, but a session-log feel, several steps | rejected |
| B · panes (lazygit-like) | Everything visible, dense, cramped on phones | rejected |
| C · multi-step dialog | Most iconic, but 4 screens to download | rejected — too long |
| D · fuzzy finder | Great picker, live mod search; less iconic as a layout | picker reused inside E |
| **E · one-screen setup dialog** | Iconic like C, one screen; dropdown overlays add some complexity | **chosen** |

## Design

One centered dialog, `rinthloader setup` notched into the top border:

```
╔═════════════ rinthloader setup ═════════════╗
║  minecraft  [ 1.21.1        ▼]  [ ] snapshots║
║  loader     [ fabric        ▼]              ║
║  mods       (•) .jar files  ( ) names   ✓ 3 ║
║  ┌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┐  ║
║  ╎ drop .jar files here  < browse >      ╎  ║
║  ╎ ✓ sodium  ✓ lithium  ! foo.jar        ╎  ║
║  └╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┘  ║
║  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  ║
║  ○ add at least one mod first   (status/log) ║
║                 < download >                 ║
╚══════════════════════════════════════════════╝
source · mods by Modrinth · theme:dark
```

- **Version / loader fields** open a boxed fuzzy picker under the field
  (type to filter, ↑↓, ↵ pick, esc close, click works). Focus returns to the
  field on close. Proper combobox/listbox ARIA.
- **Snapshots** is a `[ ]` checkbox beside the version field.
- **Mods**: `( ) .jar files` / `( ) names` radios. Jar mode: dashed drop box with
  `< browse >` and per-file results (✓ name / ! file no name found). Names mode:
  bordered textarea, one per line. Count shown at the right of the row.
- **Status line** above download: idle → what's missing or `✓ ready: N mods for
  fabric 1.21.1`; after pressing download → log lines (checking…, ✓ N found,
  ! N not found: …, `< download N found anyway >`, network errors). Replaces
  toasts. `aria-live="polite"`.
- **Download** is always enabled; pressing it when something's missing prints
  the reason in the status line instead of silently doing nothing.
- **Remembers** last version + loader in localStorage; first visit defaults to
  latest release + fabric.
- **Theme** moves out of the old settings popover to a `theme:dark` toggle in
  the footer (cycles light → dark → system).
- **Mobile**: dialog goes full width; picker overlay spans the dialog width.
- Reduced motion: no blinking/animation.

## Rollout (my calls — please correct)

1. The setup dialog **replaces** the current beta terminal UI and becomes the
   **default** UI.
2. Remove the Ctrl+Shift+U gate. Keep the classic UI reachable via a
   `classic view` link in the footer for one release, then delete it.
3. Delete the `/proto` spike before merging.

## Left to the builder

- Component breakdown and file names under `components/terminal/`.
- Reusing `useModsDownload` vs. a log-returning variant (the toasts must go).
- Exact picker positioning/ clipping on small screens.
- Light-theme contrast check of muted text and the shadow colour.
