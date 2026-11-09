import { configureStore } from "@reduxjs/toolkit";
import gameVersionReducer from "@/lib/slices/gameVersionSlice";
import modLoaderReducer from "@/lib/slices/modLoaderSlice";
import modNamesListReducer from "@/lib/slices/modNamesListSlice";
import uiReducer from "@/lib/slices/uiSlice";

export const makeStore = () => {
	return configureStore({
		reducer: {
			gameVersion: gameVersionReducer,
			modLoader: modLoaderReducer,
			modNamesList: modNamesListReducer,
			ui: uiReducer,
		},
	});
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
