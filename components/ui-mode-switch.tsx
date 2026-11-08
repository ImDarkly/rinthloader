"use client";

import { useBetaContext } from "@/app/page";
import { cn } from "@/lib/utils";

const modes = [
	{ value: "terminal", label: "terminal" },
	{ value: "readable", label: "readable" },
] as const;

export default function UiModeSwitch() {
	const [isBetaEnabled, setIsBetaEnabled] = useBetaContext();

	return (
		<div
			role="group"
			aria-label="View mode"
			className="flex w-fit items-center gap-1.5 text-xs text-muted-foreground"
		>
			{modes.map(({ value, label }, index) => {
				const active =
					value === "terminal" ? isBetaEnabled : !isBetaEnabled;

				return (
					<span key={value} className="flex items-center gap-1.5">
						{index > 0 && (
							<span aria-hidden="true" className="text-muted-foreground/40">
								/
							</span>
						)}
						<button
							type="button"
							aria-pressed={active}
							onClick={() => setIsBetaEnabled(value === "terminal")}
							className={cn(
								"cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
								active
									? "text-foreground"
									: "text-muted-foreground/70 hover:text-foreground",
							)}
						>
							{label}
						</button>
					</span>
				);
			})}
		</div>
	);
}
