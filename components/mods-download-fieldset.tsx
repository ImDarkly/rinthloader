"use client";
import { Button } from "./ui/button";
import { Field, FieldGroup, FieldSet } from "./ui/field";
import { SelectModLoader } from "./select-mod-loader";
import SelectGameVersion from "./select-game-version";
import { useAppSelector } from "@/hooks/store";
import SwitchModsInput from "./mods-input/switch-mods-input";

export default function ModsDownloadFieldset() {
	const modsList = useAppSelector((state) => state.modsList.value);
	const modLoader = useAppSelector((state) => state.modLoader.value);
	const gameVersion = useAppSelector((state) => state.gameVersion.value);
	const isReady = modsList && gameVersion && modLoader;

	return (
		<div className="w-full max-w-md min-w-xs px-4">
			<FieldSet>
				<FieldGroup>
					<SwitchModsInput />
					<SelectGameVersion />
					<SelectModLoader />
					<Field orientation="horizontal">
						<Button
							type="button"
							disabled={!isReady}
							onClick={() => {
								if (!isReady) return;

								const params = new URLSearchParams({
									modsList: modsList,
									gameVersion: gameVersion,
									modLoader: modLoader,
								});
								window.location.href = `/api/download-mods?${params.toString()}`;
							}}
						>
							Download
						</Button>
					</Field>
				</FieldGroup>
			</FieldSet>
		</div>
	);
}
