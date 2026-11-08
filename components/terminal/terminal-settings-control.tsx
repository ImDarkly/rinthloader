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
import TerminalToggleSnapshots from "./terminal-toggle-snapshots";
import UiModeSwitch from "../ui-mode-switch";
import { Field, FieldLabel } from "../ui/field";
import { useSnapshotsContext } from "@/app/page";

export default function TerminalSettingsControl() {
	const [isSnapshotsEnabled] = useSnapshotsContext();
	const { theme } = useTheme();
	const currentTheme = theme ?? "system";

	return (
		<div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
			<span>snapshots {isSnapshotsEnabled ? "on" : "off"}</span>
			<span aria-hidden="true">·</span>
			<span>theme {currentTheme}</span>
			<Popover>
				<PopoverTrigger
					render={
						<button
							type="button"
							className="cursor-pointer underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
					<TerminalSelectTheme compact />
					<Field orientation="horizontal" className="items-center">
						<FieldLabel className="text-muted-foreground text-xs">
							interface
						</FieldLabel>
						<UiModeSwitch />
					</Field>
				</PopoverContent>
			</Popover>
		</div>
	);
}
