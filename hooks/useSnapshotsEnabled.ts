import { SnapshotsState } from "@/lib/types";
import { useEffect, useState } from "react";

export default function useSnapshotsEnabled(): SnapshotsState {
	const [isSnapshotsEnabled, setIsSnapshotsEnabled] = useState(false);

	useEffect(() => {
		const stored = localStorage.getItem("isSnapshotsEnabled");
		if (stored) {
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
