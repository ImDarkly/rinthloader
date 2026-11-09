"use client";

import Logo from "@/components/logo";
import packageJson from "@/package.json";

export default function TerminalHeader() {
	return (
		<header className="flex w-full flex-col gap-1">
			<span className="text-base sm:text-lg">
				<Logo />
			</span>
			<span className="text-xs text-muted-foreground">
				v{packageJson.version}
			</span>
		</header>
	);
}
