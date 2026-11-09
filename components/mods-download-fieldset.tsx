"use client";
import { Button } from "./ui/button";
import { Field, FieldGroup, FieldSet } from "./ui/field";
import SelectGameVersion from "./select-game-version";
import SwitchModsInput from "./mods-input/switch-mods-input";
import { useModsDownload } from "@/hooks/useModsDownload";

export default function ModsDownloadFieldset() {
  const { isReady, isDownloading, handleDownload } = useModsDownload();

  return (
    <div className="grid items-center h-full w-md px-4">
      <FieldSet>
        <FieldGroup>
          <SwitchModsInput />
          <SelectGameVersion />

          <Field orientation="horizontal">
            <Button
              type="button"
              disabled={!isReady || isDownloading}
              aria-busy={isDownloading}
              onClick={() => void handleDownload()}
            >
              Download
            </Button>
          </Field>
        </FieldGroup>
      </FieldSet>
    </div>
  );
}
