"use client";

import { useState } from "react";
import { useAppSelector } from "@/hooks/store";
import {
	getBlocker,
	summarizeValidation,
	type LogLine,
} from "@/lib/terminal/logic";
import { validateModSlugs } from "@/lib/modValidation";

function navigateToDownload(mods: string[], gameVersion: string, modLoader: string) {
	const params = new URLSearchParams({
		modsList: mods.join("\n"),
		gameVersion,
		modLoader,
	});
	window.location.href = `/api/download-mods?${params.toString()}`;
}

export function useTerminalDownload() {
	const modsList = useAppSelector((state) => state.modNamesList.modNames);
	const modLoader = useAppSelector((state) => state.modLoader.value);
	const gameVersion = useAppSelector((state) => state.gameVersion.value);
	const [log, setLog] = useState<LogLine[]>([]);
	const [isChecking, setIsChecking] = useState(false);
	const [pendingValid, setPendingValid] = useState<string[] | null>(null);

	const blocker = getBlocker({
		gameVersion,
		modLoader,
		modCount: modsList.length,
	});

	const append = (...lines: LogLine[]) => setLog((prev) => [...prev, ...lines]);

	const download = async () => {
		if (isChecking) return;
		if (blocker || !gameVersion || !modLoader) {
			if (blocker) append({ kind: "warn", text: blocker });
			return;
		}

		setPendingValid(null);
		setIsChecking(true);
		append({
			kind: "info",
			text: `checking ${modsList.length} mods on modrinth for ${modLoader} ${gameVersion}…`,
		});

		try {
			const result = await validateModSlugs(modsList);
			const { lines, proceed } = summarizeValidation(result);
			append(...lines);

			if (proceed === "all") {
				append({
					kind: "ok",
					text: `downloading ${result.valid.length} mods as zip…`,
				});
				navigateToDownload(result.valid, gameVersion, modLoader);
			} else if (proceed === "ask") {
				setPendingValid(result.valid);
			}
		} finally {
			setIsChecking(false);
		}
	};

	const downloadAnyway = () => {
		if (!pendingValid || !gameVersion || !modLoader) return;
		append({
			kind: "ok",
			text: `downloading ${pendingValid.length} mods as zip…`,
		});
		navigateToDownload(pendingValid, gameVersion, modLoader);
		setPendingValid(null);
	};

	return { log, isChecking, blocker, pendingValid, download, downloadAnyway };
}
