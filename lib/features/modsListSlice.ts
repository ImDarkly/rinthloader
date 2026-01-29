import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	value: "",
};

const modsListSlice = createSlice({
	name: "modsList",
	initialState,
	reducers: {
		setModsList: (state, action) => {
			state.value = action.payload;
		},
	},
});

export const { setModsList } = modsListSlice.actions;

export default modsListSlice.reducer;
