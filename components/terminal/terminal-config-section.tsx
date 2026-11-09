"use client";

import TerminalConfigField from "./terminal-config-field";
import TerminalSelectGameVersion from "./terminal-select-game-version";
import { TerminalSelectModLoader } from "./terminal-select-mod-loader";
import TerminalSettingsControl from "./terminal-settings-control";

export default function TerminalConfigSection() {
	return (
		<section className="flex w-full flex-col gap-1">
			<TerminalConfigField label="minecraft" htmlFor="game-version">
				<TerminalSelectGameVersion />
			</TerminalConfigField>
			<TerminalConfigField label="loader" htmlFor="modLoader">
				<TerminalSelectModLoader />
			</TerminalConfigField>
			<TerminalSettingsControl />
		</section>
	);
}
