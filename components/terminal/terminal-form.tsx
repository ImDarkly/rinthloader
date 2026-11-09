"use client";

import TerminalConfigSection from "./terminal-config-section";
import TerminalImportSection from "./terminal-import-section";
import TerminalDownloadSection from "./terminal-download-section";

export default function TerminalForm() {
	return (
		<main className="flex w-full flex-col gap-6">
			<TerminalConfigSection />
			<TerminalImportSection />
			<TerminalDownloadSection />
		</main>
	);
}
