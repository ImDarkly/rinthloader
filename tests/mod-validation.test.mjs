import assert from "node:assert/strict";
import { setImmediate } from "node:timers/promises";
import test from "node:test";
import { loadTypescript } from "./load-typescript.mjs";

test("bulk misses obey the fallback concurrency limit and cache results", async () => {
    let active = 0;
    let peak = 0;
    let searches = 0;
    let bulkCalls = 0;
    const { validateModSlugs } = loadTypescript("lib/modValidation.ts", {
        "@/lib/api": {
            getProjects: async () => {
                bulkCalls++;
                return [];
            },
            findProjectByTitle: async () => {
                searches++;
                active++;
                peak = Math.max(peak, active);
                await setImmediate();
                active--;
            },
            getProject: async () => assert.fail("Bulk misses should use title search"),
        },
    });
    const names = Array.from({ length: 100 }, (_, i) => `missing-${i}`);
    const first = await validateModSlugs(names, 5);
    assert.deepEqual(Array.from(first.invalid), names);
    assert.equal(peak, 5);
    assert.equal(bulkCalls, 1);
    assert.equal(searches, 100);

    await validateModSlugs(names, 5);
    assert.equal(bulkCalls, 1);
    assert.equal(searches, 100);
});

test("bulk lookup retains project titles for dependency notices and honors the off switch", async () => {
    const versionLookups = [];
    const { validateModSlugs } = loadTypescript("lib/modValidation.ts", {
        "@/lib/api": {
            getProjects: async (names) => names.includes("main")
                ? [{ id: "main-id", slug: "main", title: "Main" }]
                : [{ id: "dep-id", slug: "dependency", title: "Dependency title" }],
            getProject: async () => assert.fail("Listed project should be resolved in bulk"),
            getVersion: async (id) => {
                versionLookups.push(id);
                return {
                    file: { url: "https://example.test/mod.jar" },
                    dependencies: id === "main-id"
                        ? [{ project_id: "dep-id", dependency_type: "required" }]
                        : [],
                };
            },
        },
    });
    const target = { gameVersion: "1.21", modLoader: "fabric" };
    const enabled = await validateModSlugs(["main"], 5, target);
    assert.deepEqual(Array.from(enabled.valid), ["main"]);
    assert.deepEqual(Array.from(enabled.dependencies), ["Dependency title"]);

    versionLookups.length = 0;
    const disabled = await validateModSlugs(["main"], 5, {
        ...target,
        includeDependencies: false,
    });
    assert.deepEqual(Array.from(disabled.dependencies), []);
    assert.deepEqual(versionLookups, ["main-id"]);
});
