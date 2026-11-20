export type LogLine = { kind: "info" | "ok" | "warn" | "err"; text: string };

export function filterItems(items: string[], query: string): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((i) => i.toLowerCase().includes(q));
}

export function parseModNames(text: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of text.split("\n")) {
    const name = raw.trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(name);
  }
  return out;
}

export function getBlocker(s: {
  gameVersion: string | null;
  modLoader: string | null;
  modCount: number;
  isDetecting?: boolean;
}): string | null {
  if (!s.gameVersion) return "pick a minecraft version first";
  if (!s.modLoader) return "pick a mod loader first";
  if (s.isDetecting) return "wait for the jar files to finish reading";
  if (s.modCount < 1) return "add at least one mod first";
  return null;
}

export function summarizeValidation(r: {
  valid: string[];
  invalid: string[];
  errors: string[];
}): { lines: LogLine[]; proceed: "all" | "ask" | "none" } {
  if (r.errors.length > 0) {
    return {
      lines: [
        { kind: "err", text: `couldn't reach modrinth for: ${r.errors.join(", ")}. try again` },
      ],
      proceed: "none",
    };
  }
  const lines: LogLine[] = [{ kind: "ok", text: `${r.valid.length} found` }];
  if (r.invalid.length > 0) {
    lines.push({ kind: "warn", text: `${r.invalid.length} not found: ${r.invalid.join(", ")}` });
  }
  const proceed = r.valid.length === 0 ? "none" : r.invalid.length > 0 ? "ask" : "all";
  return { lines, proceed };
}

export function parseRememberedTarget(raw: string | null): { version?: string; loader?: string } {
  if (!raw) return {};
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data !== "object" || data === null) return {};
    const { version, loader } = data as Record<string, unknown>;
    const out: { version?: string; loader?: string } = {};
    if (typeof version === "string") out.version = version;
    if (typeof loader === "string") out.loader = loader;
    return out;
  } catch {
    return {};
  }
}

export function resolveRememberedVersion(
  remembered: string | undefined,
  available: string[],
  latestRelease: string | null,
): string | null {
  if (remembered && available.includes(remembered)) return remembered;
  return latestRelease;
}

/** Version to select on restore: keep what's already chosen, else remembered, else latest. */
export function resolveRestoredVersion(
  current: string | null,
  remembered: string | undefined,
  available: string[],
  latestRelease: string | null,
): string | null {
  if (current && available.includes(current)) return current;
  return resolveRememberedVersion(remembered, available, latestRelease);
}
