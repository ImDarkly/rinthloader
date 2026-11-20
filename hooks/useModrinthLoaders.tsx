import { ModLoader } from "@/lib/types";
import { useState, useEffect } from "react";
import { toast } from "sonner";

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
      .catch((error: Error) => {
        setError(error);
        toast.error("Couldn't load mod loaders", {
          id: "modrinth-mod-loaders",
          description: "Modrinth may be down. Reload the page to try again.",
        });
      })
      .finally(() => setIsLoading(false));
  }, []);
  return { modLoaders, error, isLoading };
}
