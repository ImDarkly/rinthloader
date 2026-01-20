import { useState, useEffect } from "react";

interface Version {
	version: string;
	version_type: string;
	date: string;
	major: boolean;
}

export function useModrinthVersions() {
	const [versions, setVersions] = useState<Version[]>([]);
	const [error, setError] = useState<Error | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	useEffect(() => {
		fetch("https://api.modrinth.com/v2/tag/game_version")
			.then((response) => response.json())
			.then((data: Version[]) => {
				setVersions(
					data.filter((version) => version.version_type === "release")
				);
			})
			.catch((error: Error) => setError(error))
			.finally(() => setIsLoading(false));
	}, []);
	return { versions, error, isLoading };
}
