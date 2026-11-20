"use client";
import Footer from "@/components/footer";
import Header from "@/components/header";
import ModsDownloadFieldset from "@/components/mods-download-fieldset";
import TerminalApp from "@/components/terminal/terminal-app";
import useSnapshotsEnabled from "@/hooks/useSnapshotsEnabled";
import useUiMode from "@/hooks/useUiMode";
import { SnapshotsState } from "@/lib/types";
import { createContext, useContext } from "react";

const SnapshotsContext = createContext<SnapshotsState>([false, () => {}]);

export function useSnapshotsContext() {
	return useContext(SnapshotsContext);
}

export default function Home() {
	const snapshotsState = useSnapshotsEnabled();
	const [mode, setMode] = useUiMode();

	return (
		<SnapshotsContext.Provider value={snapshotsState}>
			{mode === "terminal" ? (
				<TerminalApp onClassic={() => setMode("classic")} />
			) : (
				<div className="flex flex-col h-full w-full justify-center items-center">
					<Header />
					<ModsDownloadFieldset />
					<Footer onTerminal={() => setMode("terminal")} />
				</div>
			)}
		</SnapshotsContext.Provider>
	);
}
