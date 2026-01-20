"use client";
import { Button } from "./ui/button";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldSet,
} from "./ui/field";
import { Textarea } from "./ui/textarea";
import { useState } from "react";
import { SelectModLoader } from "./select-mod-loader";
import SelectGameVersion from "./select-game-version";
import { useAppSelector } from "@/hooks/store";

export default function ModsDownloadFieldset() {
	const [modsList, setModsList] = useState("");
	const modLoader = useAppSelector((state) => state.modLoader.value);
	const gameVersion = useAppSelector((state) => state.gameVersion.value);
	const isReady = modsList && gameVersion && modLoader;

	return (
		<div className="w-full max-w-md min-w-xs px-4">
			<FieldSet>
				<FieldGroup>
					<Field>
						<FieldLabel htmlFor="mods-list">Mods List</FieldLabel>
						<Textarea
							id="mods-list"
							rows={10}
							className="h-24 max-h-48"
							value={modsList}
							onChange={(e) => setModsList(e.target.value)}
						/>
						<FieldDescription>
							Enter the list of mods you want to include, one per
							line.
						</FieldDescription>
					</Field>
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
