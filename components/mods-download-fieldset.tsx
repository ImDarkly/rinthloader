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
import { SelectLoader } from "./select-loader";
import SelectGameVersion from "./select-game-version";
import { useAppSelector } from "@/hooks/store";

export default function ModsDownloadFieldset() {
	const [modsList, setModsList] = useState("");
	const loader = useAppSelector((state) => state.loader.value);
	const gameVersion = useAppSelector((state) => state.gameVersion.value);

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
					<SelectLoader />
					<Field orientation="horizontal">
						<Button
							type="button"
							disabled={!modsList || !gameVersion}
							onClick={() => {
								const params = new URLSearchParams({
									modsList: modsList,
									gameVersion: gameVersion,
									loader: loader,
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
