import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	value: null,
};

export const gameVersionSlice = createSlice({
	name: "gameVersion",
	initialState,
	reducers: {
		setGameVersion: (state, action) => {
			state.value = action.payload;
		},
		initializeLatestGameVersion: (state, action) => {
			const versions = action.payload;
			if (versions?.length > 0 && !state.value) {
				state.value = versions[0].version;
			}
		},
	},
});

export const { setGameVersion, initializeLatestGameVersion } =
	gameVersionSlice.actions;

export default gameVersionSlice.reducer;
