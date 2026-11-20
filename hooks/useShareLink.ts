import { useEffect } from "react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { readSavedModList } from "@/hooks/usePersistedModList";
import { buildShareLink, readShareLink } from "@/lib/shareLink";
import { setModLoader } from "@/lib/slices/modLoaderSlice";
import { setModNamesList } from "@/lib/slices/modNamesListSlice";

function countMods(count: number) {
	return `${count} ${count === 1 ? "mod" : "mods"}`;
}

function isSameList(a: string[], b: string[]) {
	const sortedB = [...b].sort();
	return (
		a.length === b.length &&
		[...a].sort().every((name, i) => name === sortedB[i])
	);
}

export function useOpenShareLink() {
	const dispatch = useAppDispatch();

	useEffect(() => {
		const { modNames, modLoader } = readShareLink(window.location.search);
		if (!modNames.length) return;

		window.history.replaceState(null, "", window.location.pathname);
		const loadSharedList = () => {
			dispatch(setModNamesList(modNames));
			if (modLoader) dispatch(setModLoader(modLoader));
			toast(`Loaded ${countMods(modNames.length)} from a shared link`, {
				id: "shared-link",
			});
		};

		const saved = readSavedModList();
		const differs =
			saved.modNames.length > 0 &&
			(!isSameList(saved.modNames, modNames) ||
				(modLoader !== null && modLoader !== saved.modLoader));

		// Wait a tick so the Toaster, mounted after the page, is listening.
		setTimeout(() => {
			if (!differs) {
				loadSharedList();
				return;
			}
			toast(
				`Replace your saved list with the ${countMods(modNames.length)} shared?`,
				{
					id: "shared-link",
					description: `Your saved list has ${countMods(saved.modNames.length)}.`,
					duration: Infinity,
					action: { label: "Replace", onClick: loadSharedList },
					cancel: { label: "Keep mine", onClick: () => {} },
				},
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
