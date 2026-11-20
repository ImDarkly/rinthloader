"use client";

import { useEffect, useRef, useState } from "react";
import { useIncludeDependenciesContext } from "@/app/page";
import { useAppSelector, useAppStore } from "@/hooks/store";
import { MAX_MODS_PER_DOWNLOAD } from "@/lib/modsList";
import {
	getBlocker,
	summarizeValidation,
	type LogLine,
} from "@/lib/terminal/logic";
import { validateModSlugs } from "@/lib/modValidation";

function navigateToDownload(
	mods: string[],
	gameVersion: string,
	modLoader: string,
	includeDependencies: boolean,
) {
	const params = new URLSearchParams({
		modsList: mods.join("\n"),
		gameVersion,
		modLoader,
		includeDependencies: String(includeDependencies),
	});
	window.location.assign(`/api/download-mods?${params.toString()}`);
}

export function useTerminalDownload() {
	const store = useAppStore();
	const modsList = useAppSelector((state) => state.modNamesList.modNames);
	const modLoader = useAppSelector((state) => state.modLoader.value);
	const gameVersion = useAppSelector((state) => state.gameVersion.value);
	const [includeDependencies] = useIncludeDependenciesContext();
	// Dependencies live in context, not the store; mirror them for the post-check comparison.
	const dependenciesRef = useRef(includeDependencies);
	useEffect(() => {
		dependenciesRef.current = includeDependencies;
	}, [includeDependencies]);
	const [log, setLog] = useState<LogLine[]>([]);
	const [isChecking, setIsChecking] = useState(false);
	const [isDetecting, setIsDetectingState] = useState(false);
	// Set in the same tick a jar read starts, so a check finishing right after still sees it.
	const detecting = useRef(false);
	// Counts jar reads started; any read starting after a check began makes that check stale,
	// even if the read is later cancelled.
	const readStarts = useRef(0);
	const setIsDetecting = (v: boolean) => {
		if (v) readStarts.current++;
		detecting.current = v;
		setIsDetectingState(v);
	};
	const [pending, setPending] = useState<{
		valid: string[];
		modsList: string[];
		gameVersion: string;
		modLoader: string;
		includeDependencies: boolean;
		reads: number;
	} | null>(null);
	// Ignore a pending prompt once the list, version or loader it was validated against changes.
	const pendingValid =
		pending &&
		pending.modsList === modsList &&
		pending.gameVersion === gameVersion &&
		pending.modLoader === modLoader &&
		pending.includeDependencies === includeDependencies
			? pending.valid
			: null;

	const blocker = getBlocker({
		gameVersion,
		modLoader,
		modCount: modsList.length,
		isDetecting,
		maxMods: MAX_MODS_PER_DOWNLOAD,
	});

	const mounted = useRef(true);
	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);

	// Read the store directly (not render-time values) so a change made a moment ago counts.
	// A jar read dispatches its new list before it clears the detecting flag.
	const setupChangedSince = (s: {
		modsList: string[];
		gameVersion: string;
		modLoader: string;
		includeDependencies: boolean;
		reads: number;
	}) => {
		if (detecting.current || readStarts.current !== s.reads) return true;
		if (dependenciesRef.current !== s.includeDependencies) return true;
		const now = store.getState();
		return (
			now.modNamesList.modNames !== s.modsList ||
			now.gameVersion.value !== s.gameVersion ||
			now.modLoader.value !== s.modLoader
		);
	};

	const append = (...lines: LogLine[]) => {
		setLog((prev) => [...prev, ...lines]);
	};

	const download = async () => {
		if (isChecking) return;
		if (blocker || !gameVersion || !modLoader) {
			if (blocker) append({ kind: "warn", text: blocker });
			return;
		}

		setPending(null);
		setIsChecking(true);
		const reads = readStarts.current;
		append({
			kind: "info",
			text: `checking ${modsList.length} mods on modrinth for ${modLoader} ${gameVersion}…`,
		});

		try {
			const result = await validateModSlugs(modsList, undefined, {
				gameVersion,
				modLoader,
				includeDependencies,
			});
			if (!mounted.current) return;
			if (setupChangedSince({ modsList, gameVersion, modLoader, includeDependencies, reads })) {
				append({ kind: "warn", text: "setup changed during the check. press download again" });
				return;
			}
			const { lines, proceed } = summarizeValidation(result, { gameVersion, modLoader });
			append(...lines);

			if (proceed === "all") {
				append({
					kind: "ok",
					text: `downloading ${result.valid.length} mods as zip…`,
				});
				navigateToDownload(result.valid, gameVersion, modLoader, includeDependencies);
			} else if (proceed === "ask") {
				setPending({
					valid: result.valid,
					modsList,
					gameVersion,
					modLoader,
					includeDependencies,
					reads,
				});
			}
		} finally {
			setIsChecking(false);
		}
	};

	const downloadAnyway = () => {
		if (!pending || !pendingValid || !gameVersion || !modLoader) return;
		if (detecting.current) {
			append({ kind: "warn", text: "wait for the jar files to finish reading" });
			return;
		}
		if (setupChangedSince(pending)) {
			setPending(null);
			append({ kind: "warn", text: "setup changed since the check. press download again" });
			return;
		}
		append({
			kind: "ok",
			text: `downloading ${pendingValid.length} mods as zip…`,
		});
		navigateToDownload(pendingValid, gameVersion, modLoader, pending.includeDependencies);
		setPending(null);
	};

	return {
		log,
		isChecking,
		isDetecting,
		setIsDetecting,
		blocker,
		pendingValid,
		download,
		downloadAnyway,
		append,
	};
}
