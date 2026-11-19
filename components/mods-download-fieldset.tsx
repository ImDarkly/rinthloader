"use client";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";
import { Field, FieldGroup, FieldSet } from "./ui/field";
import SelectGameVersion from "./select-game-version";
import SwitchModsInput from "./mods-input/switch-mods-input";
import { useModsDownload } from "@/hooks/useModsDownload";

export default function ModsDownloadFieldset() {
  const { isReady, isDownloading, handleDownload } = useModsDownload();

  return (
    <div className="grid items-center h-full w-full max-w-md px-4">
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
              {isDownloading && <Spinner data-icon="inline-start" aria-hidden />}
              {isDownloading ? "Checking mods…" : "Download"}
            </Button>
          </Field>
        </FieldGroup>
      </FieldSet>
    </div>
  );
}
