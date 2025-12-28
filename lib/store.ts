import { configureStore } from "@reduxjs/toolkit";
import gameVersionReducer from "@/lib/features/gameVersionSlice";
import modLoaderReducer from "@/lib/features/modLoaderSlice";
import modsListReducer from "@/lib/features/modsListSlice";

export const makeStore = () => {
	return configureStore({
		reducer: {
			gameVersion: gameVersionReducer,
			modLoader: modLoaderReducer,
			modsList: modsListReducer,
		},
	});
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
