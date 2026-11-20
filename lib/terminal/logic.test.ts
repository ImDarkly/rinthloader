import { describe, it, expect } from "vitest";
import {
  filterItems,
  parseModNames,
  getBlocker,
  summarizeValidation,
  parseRememberedTarget,
  resolveRememberedVersion,
} from "./logic";

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
  it("none valid still reports why", () => expect(summarizeValidation({ valid: [], invalid: ["x"], errors: [] }).lines)
    .toEqual([{ kind: "ok", text: "0 found" }, { kind: "warn", text: "1 not found: x" }]));
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
