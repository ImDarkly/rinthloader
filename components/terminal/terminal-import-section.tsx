"use client";

import TerminalAutoImport from "./terminal-auto-import";
import TerminalManualInput from "./terminal-manual-input";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { setImportMode, type ImportMode } from "@/lib/slices/uiSlice";
import { cn } from "@/lib/utils";

const modes: { value: ImportMode; label: string }[] = [
	{ value: "auto", label: "auto" },
	{ value: "manual", label: "manual" },
];

export default function TerminalImportSection() {
	const importMode = useAppSelector((state) => state.ui.importMode);
	const dispatch = useAppDispatch();

	return (
		<section className="flex w-full flex-col gap-4">
			<div className="flex flex-wrap items-center gap-2 text-sm">
				<span className="text-muted-foreground">import</span>
				<div
					role="group"
					aria-label="Import mode"
					className="flex items-center gap-2"
				>
					{modes.map(({ value, label }) => {
						const active = importMode === value;

						return (
							<button
								key={value}
								type="button"
								aria-pressed={active}
								onClick={() => dispatch(setImportMode(value))}
								className={cn(
									"cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
									active
										? "text-foreground"
										: "text-foreground/60 hover:text-foreground",
								)}
							>
								{active ? `[${label}]` : label}
							</button>
						);
					})}
				</div>
			</div>

			<div hidden={importMode !== "auto"}>
				<TerminalAutoImport />
			</div>
			<div hidden={importMode !== "manual"}>
				<TerminalManualInput />
			</div>
		</section>
	);
}
