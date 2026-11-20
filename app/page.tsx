"use client";
import Footer from "@/components/footer";
import Header from "@/components/header";
import ModsDownloadFieldset from "@/components/mods-download-fieldset";
import TerminalApp from "@/components/terminal/terminal-app";
import useIncludeDependencies, {
	type IncludeDependenciesState,
} from "@/hooks/useIncludeDependencies";
import usePersistedModList from "@/hooks/usePersistedModList";
import { useOpenShareLink } from "@/hooks/useShareLink";
import useSnapshotsEnabled from "@/hooks/useSnapshotsEnabled";
import useUiMode from "@/hooks/useUiMode";
import { SnapshotsState } from "@/lib/types";
import { createContext, useContext } from "react";

const SnapshotsContext = createContext<SnapshotsState>([false, () => {}]);
const IncludeDependenciesContext = createContext<IncludeDependenciesState>([
	true,
	() => {},
]);

export function useSnapshotsContext() {
	return useContext(SnapshotsContext);
}

export function useIncludeDependenciesContext() {
	return useContext(IncludeDependenciesContext);
}

export default function Home() {
	const snapshotsState = useSnapshotsEnabled();
	const includeDependenciesState = useIncludeDependencies();
	const [mode, setMode] = useUiMode();
	usePersistedModList();
	useOpenShareLink();

	return (
		<SnapshotsContext.Provider value={snapshotsState}>
			<IncludeDependenciesContext.Provider value={includeDependenciesState}>
				{mode === "terminal" ? (
					<TerminalApp onClassic={() => setMode("classic")} />
				) : (
					<div className="flex flex-col h-full w-full justify-center items-center">
						<Header />
						<ModsDownloadFieldset />
						<Footer onTerminal={() => setMode("terminal")} />
					</div>
				)}
			</IncludeDependenciesContext.Provider>
		</SnapshotsContext.Provider>
	);
}
