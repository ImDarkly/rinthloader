"use client";

import { useAppSelector } from "@/hooks/store";
import type { useTerminalDownload } from "@/hooks/useTerminalDownload";
import type { LogLine } from "@/lib/terminal/logic";
import { cn } from "@/lib/utils";
import { DialogButton } from "./dialog-button";

const PREFIX: Record<LogLine["kind"], string> = {
	info: ">",
	ok: "✓",
	warn: "!",
	err: "✗",
};

const SR: Record<LogLine["kind"], string> = {
	info: "",
	ok: "",
	warn: "warning: ",
	err: "error: ",
};

const COLOR: Record<LogLine["kind"], string> = {
	info: "",
	ok: "text-primary",
	warn: "text-amber-700 dark:text-amber-400",
	err: "text-destructive",
};

export function StatusLog({
	download,
}: {
	download: ReturnType<typeof useTerminalDownload>;
}) {
	const { log, isChecking, blocker, pendingValid, downloadAnyway } = download;
	const modCount = useAppSelector((state) => state.modNamesList.modNames.length);
	const modLoader = useAppSelector((state) => state.modLoader.value);
	const gameVersion = useAppSelector((state) => state.gameVersion.value);

	const hasLog = log.length > 0 || isChecking;
	const showReadiness = !isChecking;

	return (
		<div className="min-h-6 border-t border-dashed border-muted-foreground pt-2">
			{/* Only run output is live; the readiness line below must not re-announce on every edit. */}
			<div aria-live="polite" className="flex flex-col gap-0.5">
				{log.map((line, i) => (
					<div key={i} className={cn("break-words", COLOR[line.kind])}>
						<span aria-hidden="true">{PREFIX[line.kind]} </span>
						{SR[line.kind] && <span className="sr-only">{SR[line.kind]}</span>}
						{line.text}
					</div>
				))}
				{isChecking && <div className="text-muted-foreground">working…</div>}
				{pendingValid && pendingValid.length > 0 && (
					<div>
						<DialogButton onClick={downloadAnyway}>
							download {pendingValid.length} found anyway
						</DialogButton>
					</div>
				)}
			</div>
			{showReadiness && (
				<div className={cn("text-muted-foreground", hasLog && "mt-0.5")}>
					<span aria-hidden="true">{blocker ? "○ " : "✓ "}</span>
					{blocker ??
						`ready: ${modCount} ${modCount === 1 ? "mod" : "mods"} for ${modLoader} ${gameVersion}`}
				</div>
			)}
		</div>
	);
}
