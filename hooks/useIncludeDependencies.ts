import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";

export type IncludeDependenciesState = [
	boolean,
	Dispatch<SetStateAction<boolean>>,
];

export default function useIncludeDependencies(): IncludeDependenciesState {
	const [includeDependencies, setIncludeDependencies] = useState(true);
	const isFirstWrite = useRef(true);

	useEffect(() => {
		const stored = localStorage.getItem("includeDependencies");
		if (stored) {
			// Hydrate the persisted preference after mount to avoid a server/client mismatch.
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setIncludeDependencies(JSON.parse(stored));
		}
	}, []);

	useEffect(() => {
		// Skip the initial write so hydration cannot overwrite the stored value.
		if (isFirstWrite.current) {
			isFirstWrite.current = false;
			return;
		}
		localStorage.setItem(
			"includeDependencies",
			JSON.stringify(includeDependencies),
		);
	}, [includeDependencies]);

	return [includeDependencies, setIncludeDependencies];
}
