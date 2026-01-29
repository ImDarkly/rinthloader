import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	modNames: [] as string[],
};

const modNamesListSlice = createSlice({
	name: "modNamesList",
	initialState,
	reducers: {
		addModToList: (state, action) => {
			const newMod = action.payload;
			if (state.modNames.includes(newMod)) return;

			state.modNames.push(newMod);
		},
	},
});

export const { addModToList } = modNamesListSlice.actions;

export default modNamesListSlice.reducer;
