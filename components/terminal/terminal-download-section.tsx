"use client";

import { useModsDownload } from "@/hooks/useModsDownload";
import { cn } from "@/lib/utils";

export default function TerminalDownloadSection() {
	const { modsList, isReady, isDownloading, handleDownload } =
		useModsDownload();
	const count = modsList.length;
	const label = `${count} ${count === 1 ? "mod" : "mods"}`;

	return (
		<div className="flex w-full flex-col gap-2">
			<button
				type="button"
				disabled={!isReady || isDownloading}
				aria-busy={isDownloading}
				onClick={() => void handleDownload()}
				className={cn(
					"w-fit cursor-pointer text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed",
					isReady && !isDownloading
						? "text-foreground hover:underline"
						: "text-muted-foreground",
				)}
			>
				[{isDownloading ? "checking mods…" : `download ${label}`}]
			</button>
		</div>
	);
}
