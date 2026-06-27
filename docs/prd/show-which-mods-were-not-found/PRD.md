## Problem Statement

When users download mods from rinthloader, they don't know which mod names failed to be found on Modrinth until after the download is complete (or crashes). This creates friction: users paste a list of mod names, hit download, and only discover typos or non-existent mods too late. They have no opportunity to fix the names before attempting the download.

## Solution

Implement real-time validation of mod names against the Modrinth API. When users blur the textarea (finish typing), validate all mod names and show a toast notification if any are invalid. Re-validate again on Download click to catch last-minute changes. If invalid mods are found on download, block the download and show which mods failed, allowing users to fix typos before retrying.

## User Stories

1. As a user, I want to know which mod names don't exist on Modrinth as I'm typing, so I can fix typos immediately without wasting time
2. As a user, I want validation feedback after I blur the textarea, so I'm not distracted during active typing
3. As a user, I want to see a clear list of which mods weren't found, so I know exactly what to fix
4. As a user, I want the validation to be fast and non-blocking, so I can proceed with download even if some mods are invalid
5. As a user, I want to re-validate on the Download button click, so I catch any last-minute changes I made
6. As a user, I want the download to be blocked if invalid mods are found at download time, so I don't waste bandwidth downloading a partial set
7. As a user, I want to see a final confirmation of which mods will be downloaded (the valid ones), so I'm confident in the download
8. As a developer, I want a reusable validation utility, so I don't duplicate API logic
9. As a developer, I want validation to be debounced, so I don't spam the Modrinth API while the user is typing
10. As a developer, I want the download logic to gracefully skip invalid mods, so the app doesn't crash if validation is bypassed

## Implementation Decisions

**Validation timing (Blur + Download)**

- Validate on textarea blur with debounce (~500ms) for immediate feedback while editing
- Re-validate on Download button click to catch changes made after the last blur
- This balances real-time feedback with API efficiency

**Validation utility module**

- Create a standalone `validateMods(modNames: string[]): { valid: string[], invalid: string[] }` function
- This function makes parallel API calls to Modrinth's `/v2/search` endpoint
- Reused by both blur validation and download validation, avoiding duplication
- Returns separate arrays for valid and invalid mods for clarity

**Debounce strategy**

- Implement a custom debounce hook that waits ~500ms after the last blur event
- Prevents excessive API calls during active typing
- Toast only shows if invalid mods exist (silent success)

**Toast notifications**

- Show toast on blur validation if invalid mods found: "3 mods not found: ModName1, ModName2, ModName3"
- Show toast on download validation if invalid mods found, blocking the download
- User can fix typos and retry, or dismiss and proceed (validation is non-blocking during blur)

**Download flow modification**

- Before triggering `downloadMods()`, re-validate all mods in the list
- If invalid mods found, show toast and return (don't call downloadMods)
- If all valid, proceed with download as normal
- Existing `downloadMods()` logic already silently skips invalid mods (via `if (!projectId) continue`), so no changes needed there

**No textarea UI changes**

- Keep textarea plain (no syntax highlighting or inline red text)
- Validation feedback comes via toast notifications, not UI modifications
- Keeps the tool simple and lightweight

## Testing Decisions

**What makes a good test:**

- Test the external behavior of validation (given a list of mods, return valid/invalid arrays)
- Don't test implementation details like "did we make 10 API calls" — test "did we correctly identify the valid mods"
- Mock the Modrinth API to avoid external dependencies in tests

**Modules to test:**

- `validateMods()` utility function: test with mocks of the Modrinth API
    - Valid mods (exist on Modrinth)
    - Invalid mods (don't exist)
    - Mixed lists
    - Edge cases (empty strings, special characters)
- Debounce hook: test that validation is delayed and only called once after blur events stop
- Integration test: blur textarea → validation runs → toast appears (if needed)

**Prior art:**

- Hook tests already exist in the codebase for `useSnapshotsEnabled` and `useModrinthVersions` (similar pattern of fetching data on mount/change and caching state)
- Use similar async testing patterns

## Out of Scope

- Caching validated mod names (validation happens fresh on each blur/download)
- Showing invalid mods visually in the textarea (would require a code editor component)
- Auto-correcting typos or suggesting similar mod names
- Analytics or logging which mods fail most often
- Offline mode (validation requires Modrinth API access)
- Rate limiting handling (assume Modrinth API is available and responsive)

## Further Notes

- The feature prioritizes **simplicity and lightweight design** over visual polish (no fancy highlighting, no heavy dependencies)
- The debounce timing (500ms) can be adjusted later if users find it too aggressive or too lenient
- Toast notifications use the existing toast system in the codebase (if one exists) or a simple imperative API
- This feature is backward compatible — the Download button remains enabled even with invalid mods, allowing users to proceed if they want (validation is advisory, not enforced at blur time)
- Re-validation on Download click is the hard requirement to prevent partial downloads
