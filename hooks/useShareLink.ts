import { useEffect } from "react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { buildShareLink, readShareLink } from "@/lib/shareLink";
import { setModLoader } from "@/lib/slices/modLoaderSlice";
import { setModNamesList } from "@/lib/slices/modNamesListSlice";

export function useOpenShareLink() {
	const dispatch = useAppDispatch();

	useEffect(() => {
		const { modNames, modLoader } = readShareLink(window.location.search);
		if (!modNames.length) return;

		dispatch(setModNamesList(modNames));
		if (modLoader) dispatch(setModLoader(modLoader));
		window.history.replaceState(null, "", window.location.pathname);
		// Wait a tick so the Toaster, mounted after the page, is listening.
		setTimeout(() => {
			toast(
				`Loaded ${modNames.length} ${modNames.length === 1 ? "mod" : "mods"} from a shared link`,
				{ id: "shared-link" },
			);
		}, 0);
	}, [dispatch]);
}

export function useCopyShareLink() {
	const modNames = useAppSelector((state) => state.modNamesList.modNames);
	const modLoader = useAppSelector((state) => state.modLoader.value);

	const copyShareLink = async () => {
		try {
			await navigator.clipboard.writeText(buildShareLink(modNames, modLoader));
			toast("Link copied", {
				description: "Anyone who opens it gets this mod list.",
			});
		} catch {
			toast.error("Couldn't copy the link");
		}
	};

	return { canShare: modNames.length > 0, copyShareLink };
}
