import { Version } from "@/lib/types";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export function useModrinthVersions() {
  const [versions, setVersions] = useState<Version[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    void fetch("https://api.modrinth.com/v2/tag/game_version")
      .then((response) => {
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        return response.json();
      })
      .then((data: Version[]) => setVersions(data))
      .catch((error: Error) => {
        setError(error);
        toast.error("Couldn't load game versions", {
          id: "modrinth-game-versions",
          description: "Modrinth may be down. Reload the page to try again.",
        });
      })
      .finally(() => setIsLoading(false));
  }, []);
  return { versions, error, isLoading };
}
