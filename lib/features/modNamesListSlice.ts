import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    modNames: [] as string[],
};

const modNamesListSlice = createSlice({
    name: "modNamesList",
    initialState,
    reducers: {
        setModNamesList: (state, action) => {
            state.modNames = action.payload;
        },
        removeModNameFromList: (state, action) => {
            state.modNames = state.modNames.filter(
                (name) => name !== action.payload,
            );
        },
    },
});

export const { setModNamesList, removeModNameFromList } =
    modNamesListSlice.actions;

export default modNamesListSlice.reducer;
