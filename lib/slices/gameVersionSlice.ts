import { createSlice } from "@reduxjs/toolkit";
import { Version } from "../types";

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
			if (!versions?.length || state.value) return;

			const latestRelease = versions.find(
				(version: Version) => version.version_type === "release",
			);
			if (latestRelease) {
				state.value = latestRelease.version;
			}
		},
	},
});

export const { setGameVersion, initializeLatestGameVersion } =
	gameVersionSlice.actions;

export default gameVersionSlice.reducer;
