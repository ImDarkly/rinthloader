import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";

export type BetaState = [boolean, Dispatch<SetStateAction<boolean>>];

export default function useBetaEnabled(): BetaState {
	const [isBetaEnabled, setIsBetaEnabled] = useState(false);
	const isFirstWrite = useRef(true);

	useEffect(() => {
		const stored = localStorage.getItem("isBetaEnabled");
		if (stored) {
			// Hydrate the persisted preference after mount to avoid a server/client mismatch.
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setIsBetaEnabled(JSON.parse(stored));
		}
	}, []);

	useEffect(() => {
		// Skip the initial write so hydration cannot overwrite the stored value.
		if (isFirstWrite.current) {
			isFirstWrite.current = false;
			return;
		}
		localStorage.setItem("isBetaEnabled", JSON.stringify(isBetaEnabled));
	}, [isBetaEnabled]);

	return [isBetaEnabled, setIsBetaEnabled];
}
