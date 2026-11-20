"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { setGameVersion } from "@/lib/slices/gameVersionSlice";
import { setModLoader } from "@/lib/slices/modLoaderSlice";
import {
	parseRememberedTarget,
	resolveRememberedVersion,
} from "@/lib/terminal/logic";
import type { Version } from "@/lib/types";

const STORAGE_KEY = "rinthloader:target";

export function useRememberedTarget(versions: Version[], snapshots: boolean) {
	const dispatch = useAppDispatch();
	const gameVersion = useAppSelector((state) => state.gameVersion.value);
	const modLoader = useAppSelector((state) => state.modLoader.value);
	const [restored, setRestored] = useState(false);

	// Restore once, after the versions have loaded.
	useEffect(() => {
		if (restored || versions.length === 0) return;

		let raw: string | null = null;
		try {
			raw = localStorage.getItem(STORAGE_KEY);
		} catch {
			// storage unavailable; fall back to defaults
		}
		const remembered = parseRememberedTarget(raw);

		const available = versions
			.filter((v) => v.version_type === "release" || (snapshots && v.version_type === "snapshot"))
			.map((v) => v.version);
		const latestRelease =
			versions.find((v) => v.version_type === "release")?.version ?? null;

		const version = resolveRememberedVersion(remembered.version, available, latestRelease);
		if (version) dispatch(setGameVersion(version));
		if (remembered.loader) dispatch(setModLoader(remembered.loader));

		// Gate writes until the saved value has been read.
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setRestored(true);
	}, [restored, versions, snapshots, dispatch]);

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
