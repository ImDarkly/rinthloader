"use client";
import Footer from "@/components/footer";
import Header from "@/components/header";
import ModsDownloadFieldset from "@/components/mods-download-fieldset";
import TerminalApp from "@/components/terminal/terminal-app";
import UiModeShortcut from "@/components/ui-mode-shortcut";
import useBetaEnabled, { type BetaState } from "@/hooks/useBetaEnabled";
import useIncludeDependencies, {
	type IncludeDependenciesState,
} from "@/hooks/useIncludeDependencies";
import usePersistedModList from "@/hooks/usePersistedModList";
import { useOpenShareLink } from "@/hooks/useShareLink";
import useSnapshotsEnabled from "@/hooks/useSnapshotsEnabled";
import { SnapshotsState } from "@/lib/types";
import { createContext, useContext } from "react";

const SnapshotsContext = createContext<SnapshotsState>([false, () => {}]);
const BetaContext = createContext<BetaState>([false, () => {}]);
const IncludeDependenciesContext = createContext<IncludeDependenciesState>([
	true,
	() => {},
]);

export function useSnapshotsContext() {
	return useContext(SnapshotsContext);
}

export function useBetaContext() {
	return useContext(BetaContext);
}

export function useIncludeDependenciesContext() {
	return useContext(IncludeDependenciesContext);
}

export default function Home() {
	const snapshotsState = useSnapshotsEnabled();
	const betaState = useBetaEnabled();
	const includeDependenciesState = useIncludeDependencies();
	const [isBetaEnabled] = betaState;
	usePersistedModList();
	useOpenShareLink();

	return (
		<SnapshotsContext.Provider value={snapshotsState}>
			<BetaContext.Provider value={betaState}>
				<IncludeDependenciesContext.Provider value={includeDependenciesState}>
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
				</IncludeDependenciesContext.Provider>
			</BetaContext.Provider>
		</SnapshotsContext.Provider>
	);
}
