import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { setModLoader } from "@/lib/slices/modLoaderSlice";
import { setModNamesList, setModTitles } from "@/lib/slices/modNamesListSlice";

export function useImportModFiles() {
	const dispatch = useAppDispatch();
	const modLoader = useAppSelector((state) => state.modLoader.value);

	return async (
		files: File[],
		options?: {
			// Return false to drop a result that a newer import or edit has replaced.
			isCurrent?: () => boolean;
			// Report a loader switch here instead of with a toast.
			onLoaderChange?: (modLoader: string) => void;
		},
	) => {
		const { detectModFiles, getMostCommonModLoader } = await import(
			"@/lib/mod-detector"
		);
		const detected = await detectModFiles(files);
		if (options?.isCurrent && !options.isCurrent()) return detected;
		dispatch(
			setModNamesList(
				detected.flatMap((result) => (result.modName ? [result.modName] : [])),
			),
		);
		dispatch(
			setModTitles(
				Object.fromEntries(
					detected.flatMap((result) =>
						result.modName && result.title
							? [[result.modName, result.title]]
							: [],
					),
				),
			),
		);

		const detectedModLoader = getMostCommonModLoader(detected);
		// Quilt runs Fabric mods, so Fabric jars don't mean the loader is wrong.
		const isCompatible =
			detectedModLoader === modLoader ||
			(detectedModLoader === "fabric" && modLoader === "quilt");
		if (detectedModLoader && !isCompatible) {
			dispatch(setModLoader(detectedModLoader));
			if (options?.onLoaderChange) {
				options.onLoaderChange(detectedModLoader);
				return detected;
			}
			toast(`Mod loader set to ${detectedModLoader}`, {
				description: "Detected from the imported jars.",
			});
		}

		return detected;
	};
}
