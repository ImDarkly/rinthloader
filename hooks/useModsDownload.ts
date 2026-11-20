"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAppSelector } from "@/hooks/store";
import { validateModSlugs } from "@/lib/modValidation";

export function useModsDownload() {
	const modsList = useAppSelector((state) => state.modNamesList.modNames);
	const modLoader = useAppSelector((state) => state.modLoader.value);
	const gameVersion = useAppSelector((state) => state.gameVersion.value);
	const [isDownloading, setIsDownloading] = useState(false);
	const isReady = Boolean(modsList.length && gameVersion && modLoader);

	const handleDownload = async () => {
		if (!isReady || !gameVersion || !modLoader || isDownloading) return;

		setIsDownloading(true);

		try {
			const { valid, invalid, unavailable, errors, dependencies } =
				await validateModSlugs(modsList, undefined, { gameVersion, modLoader });

			if (errors.length > 0) {
				toast.error("Network error", {
					description:
						"Failed to connect to Modrinth to validate: " +
						errors.join(", "),
				});
				return;
			}

			if (invalid.length > 0) {
				toast.warning("Some mods not found", {
					description: `Skipping: ${invalid.join(", ")}`,
				});
			}

			if (unavailable.length > 0) {
				toast.warning(`No ${modLoader} build for ${gameVersion}`, {
					description: `Skipping: ${unavailable.join(", ")}`,
				});
			}

			if (valid.length === 0) return;

			if (dependencies.length > 0) {
				toast.info(
					`${dependencies.length} required ${dependencies.length === 1 ? "dependency" : "dependencies"} added`,
					{ description: dependencies.join(", ") },
				);
			}

			const params = new URLSearchParams({
				modsList: valid.join("\n"),
				gameVersion,
				modLoader,
			});
			window.location.href = `/api/download-mods?${params.toString()}`;
		} finally {
			setIsDownloading(false);
		}
	};

	return {
		modsList,
		isReady,
		isDownloading,
		handleDownload,
	};
}
