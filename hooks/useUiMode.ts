import { useCallback, useEffect, useState } from "react";

export type UiMode = "terminal" | "classic";

const STORAGE_KEY = "rinthloader:ui";

export default function useUiMode(): [UiMode, (mode: UiMode) => void] {
	const [mode, setModeState] = useState<UiMode>("terminal");

	useEffect(() => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored === "classic" || stored === "terminal") {
				// Hydrate the persisted preference after mount to avoid a server/client mismatch.
				// eslint-disable-next-line react-hooks/set-state-in-effect
				setModeState(stored);
			}
			// One-time cleanup of the retired beta flag.
			localStorage.removeItem("isBetaEnabled");
		} catch {
			// Storage unavailable; fall back to the default.
		}
	}, []);

	// Persist only on explicit user choice, so the default can never overwrite a stored value.
	const setMode = useCallback((next: UiMode) => {
		setModeState(next);
		try {
			localStorage.setItem(STORAGE_KEY, next);
		} catch {
			// Ignore storage failures.
		}
	}, []);

	return [mode, setMode];
}
