"use client";

import { useTheme } from "next-themes";
import {
	Popover,
	PopoverContent,
	PopoverHeader,
	PopoverTitle,
	PopoverTrigger,
} from "../ui/popover";
import TerminalSelectTheme from "./terminal-select-theme";
import TerminalToggleDependencies from "./terminal-toggle-dependencies";
import TerminalToggleSnapshots from "./terminal-toggle-snapshots";
import { useIncludeDependenciesContext, useSnapshotsContext } from "@/app/page";

export default function TerminalSettingsControl() {
	const [isSnapshotsEnabled] = useSnapshotsContext();
	const [includeDependencies] = useIncludeDependenciesContext();
	const { theme } = useTheme();
	const currentTheme = theme ?? "system";

	return (
		<div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
			<span>snapshots {isSnapshotsEnabled ? "on" : "off"}</span>
			<span aria-hidden="true">·</span>
			<span>dependencies {includeDependencies ? "on" : "off"}</span>
			<span aria-hidden="true">·</span>
			<span>theme {currentTheme}</span>
			<Popover>
				<PopoverTrigger
					render={
						<button
							type="button"
							className="cursor-pointer text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
						>
							[settings]
						</button>
					}
				/>
				<PopoverContent className="w-64">
					<PopoverHeader>
						<PopoverTitle>settings</PopoverTitle>
					</PopoverHeader>
					<TerminalToggleSnapshots compact />
					<TerminalToggleDependencies compact />
					<TerminalSelectTheme compact />
				</PopoverContent>
			</Popover>
		</div>
	);
}
