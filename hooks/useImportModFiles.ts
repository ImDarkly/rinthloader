import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { setModLoader } from "@/lib/slices/modLoaderSlice";
import { setModNamesList } from "@/lib/slices/modNamesListSlice";

export function useImportModFiles() {
	const dispatch = useAppDispatch();
	const modLoader = useAppSelector((state) => state.modLoader.value);

	return async (files: File[]) => {
		const { detectModFiles, getMostCommonModLoader } = await import(
			"@/lib/mod-detector"
		);
		const detected = await detectModFiles(files);
		dispatch(
			setModNamesList(
				detected.flatMap((result) => (result.modName ? [result.modName] : [])),
			),
		);

		const detectedModLoader = getMostCommonModLoader(detected);
		// Quilt runs Fabric mods, so Fabric jars don't mean the loader is wrong.
		const isCompatible =
			detectedModLoader === modLoader ||
			(detectedModLoader === "fabric" && modLoader === "quilt");
		if (detectedModLoader && !isCompatible) {
			dispatch(setModLoader(detectedModLoader));
			toast(`Mod loader set to ${detectedModLoader}`, {
				description: "Detected from the imported jars.",
			});
		}

		return detected;
	};
}
