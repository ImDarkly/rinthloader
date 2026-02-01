import { configureStore } from "@reduxjs/toolkit";
import gameVersionReducer from "@/lib/features/gameVersionSlice";
import modLoaderReducer from "@/lib/features/modLoaderSlice";
import modNamesListReducer from "@/lib/features/modNamesListSlice";

export const makeStore = () => {
    return configureStore({
        reducer: {
            gameVersion: gameVersionReducer,
            modLoader: modLoaderReducer,
            modNamesList: modNamesListReducer,
        },
    });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
