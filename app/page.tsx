"use client";
import Footer from "@/components/footer";
import Header from "@/components/header";
import ModsDownloadFieldset from "@/components/mods-download-fieldset";
import TerminalApp from "@/components/terminal/terminal-app";
import UiModeShortcut from "@/components/ui-mode-shortcut";
import useBetaEnabled, { type BetaState } from "@/hooks/useBetaEnabled";
import useSnapshotsEnabled from "@/hooks/useSnapshotsEnabled";
import { SnapshotsState } from "@/lib/types";
import { createContext, useContext } from "react";

const SnapshotsContext = createContext<SnapshotsState>([false, () => {}]);
const BetaContext = createContext<BetaState>([false, () => {}]);

export function useSnapshotsContext() {
	return useContext(SnapshotsContext);
}

export function useBetaContext() {
	return useContext(BetaContext);
}

export default function Home() {
	const snapshotsState = useSnapshotsEnabled();
	const betaState = useBetaEnabled();
	const [isBetaEnabled] = betaState;

	return (
		<SnapshotsContext.Provider value={snapshotsState}>
			<BetaContext.Provider value={betaState}>
				<UiModeShortcut />
				{isBetaEnabled ? (
					<TerminalApp />
				) : (
					<div className="flex flex-col h-full w-full justify-center items-center">
						<Header />
						<ModsDownloadFieldset />
						<Footer />
					</div>
				)}
			</BetaContext.Provider>
		</SnapshotsContext.Provider>
	);
}
