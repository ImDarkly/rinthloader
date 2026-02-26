import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	value: "fabric",
};

export const modLoaderSlice = createSlice({
	name: "modLoader",
	initialState,
	reducers: {
		setModLoader: (state, action) => {
			state.value = action.payload;
		},
	},
});

export const { setModLoader } = modLoaderSlice.actions;

export default modLoaderSlice.reducer;
