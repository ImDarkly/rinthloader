"use client";

import TerminalHeader from "./terminal-header";
import TerminalFooter from "./terminal-footer";
import TerminalForm from "./terminal-form";
import BlinkingCursor from "./blinking-cursor";

export default function TerminalApp() {
	return (
		<div className="flex min-h-dvh w-full flex-col items-start px-4 py-6 font-mono sm:px-6 sm:py-8">
			<div className="flex w-full max-w-2xl flex-col gap-6">
				<TerminalHeader />
				<TerminalForm />
				<TerminalFooter />
				<BlinkingCursor />
			</div>
		</div>
	);
}
