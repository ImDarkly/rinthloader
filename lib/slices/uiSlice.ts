import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type ImportMode = "auto" | "manual";

const initialState = {
	importMode: "auto" as ImportMode,
};

const uiSlice = createSlice({
	name: "ui",
	initialState,
	reducers: {
		setImportMode: (state, action: PayloadAction<ImportMode>) => {
			state.importMode = action.payload;
		},
	},
});

export const { setImportMode } = uiSlice.actions;

export default uiSlice.reducer;
