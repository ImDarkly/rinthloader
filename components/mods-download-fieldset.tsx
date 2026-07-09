"use client";
import { Button } from "./ui/button";
import { Field, FieldGroup, FieldSet } from "./ui/field";
import SelectGameVersion from "./select-game-version";
import { useAppSelector } from "@/hooks/store";
import SwitchModsInput from "./mods-input/switch-mods-input";
import { validateModSlugs } from "@/lib/modValidation";
import { toast } from "sonner";

export default function ModsDownloadFieldset() {
  const modsList = useAppSelector((state) => state.modNamesList.modNames);
  const modLoader = useAppSelector((state) => state.modLoader.value);
  const gameVersion = useAppSelector((state) => state.gameVersion.value);
  const isReady = modsList && gameVersion && modLoader;

  const handleDownload = async () => {
    if (!isReady) return;

    const { invalid, errors } = await validateModSlugs(modsList);

    if (errors.length > 0) {
      toast.error("Network error", {
        description:
          "Failed to connect to Modrinth to validate: " + errors.join(", "),
      });
      return;
    }

    if (invalid.length > 0) {
      toast.warning("Some mods not found", {
        description: `Skipping: ${invalid.join(", ")}`,
      });
    }

    const params = new URLSearchParams({
      modsList: modsList.join("\n"),
      gameVersion: gameVersion,
      modLoader: modLoader,
    });
    window.location.href = `/api/download-mods?${params.toString()}`;
  };

  return (
    <div className="grid items-center h-full w-md px-4">
      <FieldSet>
        <FieldGroup>
          <SwitchModsInput />
          <SelectGameVersion />

          <Field orientation="horizontal">
            <Button type="button" disabled={!isReady} onClick={handleDownload}>
              Download
            </Button>
          </Field>
        </FieldGroup>
      </FieldSet>
    </div>
  );
}
