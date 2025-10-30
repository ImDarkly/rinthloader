"use client";
import { useModrinthVersions } from "@/hooks/use-modrinth-versions";
import { Button } from "./ui/button";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldSet,
} from "./ui/field";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { useState } from "react";

export default function ModsDownloadFieldset() {
	const [modsList, setModsList] = useState("");
	const [gameVersion, setGameVersion] = useState("");
	const { versions } = useModrinthVersions();

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
					<Field>
						<FieldLabel htmlFor="game-version">
							Game Version
						</FieldLabel>
						<Select
							onValueChange={setGameVersion}
							value={gameVersion}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select version" />
							</SelectTrigger>

							<SelectContent>
								<SelectGroup>
									<SelectLabel>Releases</SelectLabel>
									{versions.map((version) => (
										<SelectItem
											value={version.version}
											key={version.version}
										>
											{version.version}
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>
					</Field>
					<Field orientation="horizontal">
						<Button
							type="button"
							onClick={() => {
								const params = new URLSearchParams({
									modsList: modsList,
									gameVersion: gameVersion,
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
