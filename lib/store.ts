import { configureStore } from "@reduxjs/toolkit";
import gameVersionReducer from "@/lib/features/gameVersionSlice";
import loaderReducer from "@/lib/features/loaderSlice";

export const makeStore = () => {
	return configureStore({
		reducer: {
			gameVersion: gameVersionReducer,
			loader: loaderReducer,
		},
	});
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
