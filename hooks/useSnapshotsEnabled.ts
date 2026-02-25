import { SnapshotsState } from "@/lib/types";
import { useEffect, useState } from "react";

export default function useSnapshotsEnabled(): SnapshotsState {
	const [isSnapshotsEnabled, setIsSnapshotsEnabled] = useState(() => {
		const saved = localStorage.getItem("isSnapshotsEnabled");
		return saved ? JSON.parse(saved) : false;
	});

	useEffect(() => {
		localStorage.setItem(
			"isSnapshotsEnabled",
			JSON.stringify(isSnapshotsEnabled),
		);
	}, [isSnapshotsEnabled]);

	return [isSnapshotsEnabled, setIsSnapshotsEnabled];
}
