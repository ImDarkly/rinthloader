import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";

// Load the real module with isolated dependencies and a fresh module cache.
export function loadTypescript(path, dependencies) {
    const source = readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
    const { outputText } = ts.transpileModule(source, {
        compilerOptions: {
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2020,
        },
    });
    const exports = {};
    runInNewContext(outputText, {
        exports,
        require(name) {
            if (!(name in dependencies)) throw new Error(`Unexpected import: ${name}`);
            return dependencies[name];
        },
    });
    return exports;
}
