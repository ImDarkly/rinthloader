"use client";

import { SetupDialog } from "./setup-dialog";
import TerminalFooter from "./terminal-footer";

export default function TerminalApp({ onClassic }: { onClassic?: () => void }) {
	return (
		<div className="flex min-h-dvh w-full flex-col items-center gap-8 px-4 py-10 font-mono sm:px-6">
			<SetupDialog />
			<TerminalFooter onClassic={onClassic} />
		</div>
	);
}
