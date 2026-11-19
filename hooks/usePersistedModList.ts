import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { setModLoader } from "@/lib/slices/modLoaderSlice";
import { setModNamesList } from "@/lib/slices/modNamesListSlice";

export default function usePersistedModList() {
	const dispatch = useAppDispatch();
	const modNames = useAppSelector((state) => state.modNamesList.modNames);
	const modLoader = useAppSelector((state) => state.modLoader.value);
	const isFirstWrite = useRef(true);

	useEffect(() => {
		const storedModNames = localStorage.getItem("modNames");
		const storedModLoader = localStorage.getItem("modLoader");
		if (storedModNames) dispatch(setModNamesList(JSON.parse(storedModNames)));
		if (storedModLoader) dispatch(setModLoader(JSON.parse(storedModLoader)));
	}, [dispatch]);

	useEffect(() => {
		// Skip the initial write so hydration cannot overwrite the stored values.
		if (isFirstWrite.current) {
			isFirstWrite.current = false;
			return;
		}
		localStorage.setItem("modNames", JSON.stringify(modNames));
		localStorage.setItem("modLoader", JSON.stringify(modLoader));
	}, [modNames, modLoader]);
}
