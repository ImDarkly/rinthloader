import assert from "node:assert/strict";
import test from "node:test";
import * as toolkit from "@reduxjs/toolkit";
import { loadTypescript } from "./load-typescript.mjs";

test("blurring an unchanged list with duplicate titles preserves both project slugs", () => {
    const {
        default: reducer,
        setModNamesList,
        setModTitles,
        toDisplayNames,
        toModNames,
    } = loadTypescript("lib/slices/modNamesListSlice.ts", {
        "@reduxjs/toolkit": toolkit,
    });
    const names = ["first-mod", "second-mod"];
    const titles = { "first-mod": "Shared Name", "second-mod": "Shared Name" };
    let state = reducer(undefined, setModNamesList(names));
    state = reducer(state, setModTitles(titles));

    // Both manual inputs render these labels and dispatch the parsed lines on blur.
    const text = toDisplayNames(state.modNames, state.titles).join("\n");
    const parsed = toModNames(text.split("\n"), state.titles);
    state = reducer(state, setModNamesList(parsed));
    assert.deepEqual(Array.from(state.modNames), names);
    assert.equal(Object.keys(state.titles).length, 2);
    assert.notEqual(text.split("\n")[0], text.split("\n")[1]);

    // Persistence and download requests continue to receive the original slugs.
    assert.deepEqual(JSON.parse(JSON.stringify(state.modNames)), names);
    assert.equal(state.modNames.join("\n"), "first-mod\nsecond-mod");
});

test("unique titles remain readable and untitled entries retain their lookup names", () => {
    const { toDisplayNames, toModNames } = loadTypescript(
        "lib/slices/modNamesListSlice.ts",
        { "@reduxjs/toolkit": toolkit },
    );
    const names = ["fabric-api", "sodium"];
    const titles = { "fabric-api": "Fabric API" };
    const displayed = toDisplayNames(names, titles);
    assert.deepEqual(Array.from(displayed), ["Fabric API", "sodium"]);
    assert.deepEqual(Array.from(toModNames(displayed, titles)), names);
});
