import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const initialState = {
    modNames: [] as string[],
    // Display titles for slugs matched by file hash, keyed by slug.
    titles: {} as Record<string, string>,
};

const keepListedTitles = (state: typeof initialState) => {
    state.titles = Object.fromEntries(
        Object.entries(state.titles).filter(([slug]) =>
            state.modNames.includes(slug),
        ),
    );
};

const modNamesListSlice = createSlice({
    name: "modNamesList",
    initialState,
    reducers: {
        setModNamesList: (state, action: PayloadAction<string[]>) => {
            state.modNames = action.payload;
            keepListedTitles(state);
        },
        setModTitles: (state, action: PayloadAction<Record<string, string>>) => {
            state.titles = action.payload;
            keepListedTitles(state);
        },
        removeModNameFromList: (state, action: PayloadAction<string>) => {
            state.modNames = state.modNames.filter(
                (name) => name !== action.payload,
            );
            keepListedTitles(state);
        },
    },
});

export const { setModNamesList, setModTitles, removeModNameFromList } =
    modNamesListSlice.actions;

// Titles aren't unique, so a title two listed projects share also shows its
// slug. Every label then maps back to exactly one slug.
const labelsBySlug = (titles: Record<string, string>) => {
    const counts = new Map<string, number>();
    for (const title of Object.values(titles)) {
        counts.set(title, (counts.get(title) ?? 0) + 1);
    }
    return new Map(
        Object.entries(titles).map(([slug, title]) => [
            slug,
            counts.get(title)! > 1 ? `${title} (${slug})` : title,
        ]),
    );
};

// Show titles in place of slugs, and turn shown titles back into slugs.
export const toDisplayNames = (
    modNames: string[],
    titles: Record<string, string>,
) => {
    const labels = labelsBySlug(titles);
    return modNames.map((name) => labels.get(name) ?? name);
};

export const toModNames = (
    lines: string[],
    titles: Record<string, string>,
) => {
    const slugByLabel = new Map(
        [...labelsBySlug(titles)].map(([slug, label]) => [label, slug]),
    );
    return lines.map((line) => slugByLabel.get(line) ?? line);
};

export default modNamesListSlice.reducer;
