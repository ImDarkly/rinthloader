import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { setModLoader } from "@/lib/slices/modLoaderSlice";
import { setModNamesList } from "@/lib/slices/modNamesListSlice";

export function readSavedModList() {
	const storedModNames = localStorage.getItem("modNames");
	const storedModLoader = localStorage.getItem("modLoader");
	return {
		modNames: (storedModNames ? JSON.parse(storedModNames) : []) as string[],
		modLoader: (storedModLoader ? JSON.parse(storedModLoader) : null) as
			| string
			| null,
	};
}

export default function usePersistedModList() {
	const dispatch = useAppDispatch();
	const modNames = useAppSelector((state) => state.modNamesList.modNames);
	const modLoader = useAppSelector((state) => state.modLoader.value);
	const isFirstWrite = useRef(true);

	useEffect(() => {
		const saved = readSavedModList();
		if (saved.modNames.length) dispatch(setModNamesList(saved.modNames));
		if (saved.modLoader) dispatch(setModLoader(saved.modLoader));
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
