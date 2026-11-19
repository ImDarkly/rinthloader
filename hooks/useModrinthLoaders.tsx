import { ModLoader } from "@/lib/types";
import { useState, useEffect } from "react";

export function useModrinthLoaders() {
  const [modLoaders, setModLoaders] = useState<ModLoader[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    void fetch("https://api.modrinth.com/v2/tag/loader")
      .then((response) => {
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        return response.json();
      })
      .then((data: ModLoader[]) => {
        setModLoaders(
          data.filter((loader) => loader.supported_project_types.includes("mod")),
        );
      })
      .catch((error: Error) => setError(error))
      .finally(() => setIsLoading(false));
  }, []);
  return { modLoaders, error, isLoading };
}
