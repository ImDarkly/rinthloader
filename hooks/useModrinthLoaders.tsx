import { ModLoader } from "@/lib/types";
import { useState, useEffect } from "react";

export function useModrinthLoaders() {
	const [modLoaders, setModLoaders] = useState<ModLoader[]>([]);
	const [error, setError] = useState<Error | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	useEffect(() => {
		fetch("https://api.modrinth.com/v2/tag/loader")
			.then((response) => response.json())
			.then((data: ModLoader[]) => {
				setModLoaders(data);
			})
			.catch((error: Error) => setError(error))
			.finally(() => setIsLoading(false));
	}, []);
	return { modLoaders, error, isLoading };
}
