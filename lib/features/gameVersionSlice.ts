import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	value: "",
};

export const gameVersionSlice = createSlice({
	name: "gameVersion",
	initialState,
	reducers: {
		setGameVersion: (state, action) => {
			state.value = action.payload;
		},
	},
});

export const { setGameVersion } = gameVersionSlice.actions;

export default gameVersionSlice.reducer;
