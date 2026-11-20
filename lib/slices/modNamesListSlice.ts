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

export default modNamesListSlice.reducer;
