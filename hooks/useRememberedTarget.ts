"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { setGameVersion } from "@/lib/slices/gameVersionSlice";
import { setModLoader } from "@/lib/slices/modLoaderSlice";
import {
	parseRememberedTarget,
	resolveRestoredVersion,
} from "@/lib/terminal/logic";
import type { Version } from "@/lib/types";

const STORAGE_KEY = "rinthloader:target";

// Restore only once per page load: SetupDialog remounts on classic <-> terminal,
// and a later restore would overwrite what the user picked in the classic view.
// Version and loader restore separately so a failed loader list can't block the version.
let versionRestored = false;
let loaderRestored = false;
// Read storage once, before any write, so a late loader restore sees the saved value.
let remembered: ReturnType<typeof parseRememberedTarget> | null = null;

function readRemembered() {
	if (remembered) return remembered;
	let raw: string | null = null;
	try {
		raw = localStorage.getItem(STORAGE_KEY);
	} catch {
		// storage unavailable; fall back to defaults
	}
	remembered = parseRememberedTarget(raw);
	return remembered;
}

export function useRememberedTarget(
	versions: Version[],
	snapshots: boolean,
	loaders: string[],
) {
	const dispatch = useAppDispatch();
	const gameVersion = useAppSelector((state) => state.gameVersion.value);
	const modLoader = useAppSelector((state) => state.modLoader.value);
	const [restored, setRestored] = useState(versionRestored);

	// Restore the version once, after the versions have loaded.
	useEffect(() => {
		if (versionRestored || versions.length === 0) return;
		const saved = readRemembered();

		const available = versions
			.filter((v) => v.version_type === "release" || (snapshots && v.version_type === "snapshot"))
			.map((v) => v.version);
		const latestRelease =
			versions.find((v) => v.version_type === "release")?.version ?? null;

		const version = resolveRestoredVersion(
			gameVersion,
			saved.version,
			available,
			latestRelease,
		);
		if (version && version !== gameVersion) dispatch(setGameVersion(version));
		versionRestored = true;

		// Gate writes until the saved value has been read.
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setRestored(true);
	}, [versions, snapshots, gameVersion, dispatch]);

	// Restore the loader once, after the loaders have loaded.
	useEffect(() => {
		if (loaderRestored || loaders.length === 0) return;
		const saved = readRemembered();
		if (saved.loader && loaders.includes(saved.loader)) {
			dispatch(setModLoader(saved.loader));
		}
		loaderRestored = true;
	}, [loaders, dispatch]);

	// Persist every change after the initial restore.
	useEffect(() => {
		if (!restored || !gameVersion || !modLoader) return;
		try {
			localStorage.setItem(
				STORAGE_KEY,
				JSON.stringify({ version: gameVersion, loader: modLoader }),
			);
		} catch {
			// storage unavailable; ignore
		}
	}, [restored, gameVersion, modLoader]);
}
