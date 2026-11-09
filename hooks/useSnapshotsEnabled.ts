import { SnapshotsState } from "@/lib/types";
import { useEffect, useState } from "react";

export default function useSnapshotsEnabled(): SnapshotsState {
	const [isSnapshotsEnabled, setIsSnapshotsEnabled] = useState(false);

	useEffect(() => {
		const stored = localStorage.getItem("isSnapshotsEnabled");
		if (stored) {
			// Hydrate the persisted preference after mount to avoid a server/client mismatch.
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setIsSnapshotsEnabled(JSON.parse(stored));
		}
	}, []);

	useEffect(() => {
		localStorage.setItem(
			"isSnapshotsEnabled",
			JSON.stringify(isSnapshotsEnabled),
		);
	}, [isSnapshotsEnabled]);

	return [isSnapshotsEnabled, setIsSnapshotsEnabled];
}
