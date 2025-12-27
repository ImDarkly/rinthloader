import { useState, useEffect } from "react";

interface Loader {
	name: string;
}

export function useModrinthLoaders() {
	const [loaders, setLoaders] = useState<Loader[]>([]);
	const [error, setError] = useState<Error | null>(null);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		fetch("https://api.modrinth.com/v2/tag/loader")
			.then((response) => response.json())
			.then((data: Loader[]) => {
				setLoaders(data);
			})
			.catch((error: Error) => setError(error))
			.finally(() => setLoading(false));
	}, []);
	return { loaders, error, loading };
}
