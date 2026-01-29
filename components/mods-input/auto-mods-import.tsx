import { useState } from "react";
import { Field, FieldDescription, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { getModNames } from "@/lib/mod-detector";
import { Item, ItemActions, ItemContent, ItemTitle } from "../ui/item";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";

export default function AutoModsImport() {
	const [modNames, setModNames] = useState<string[]>([]);

	const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files ? Array.from(e.target.files) : [];
		if (!files.length) return;

		const result = await getModNames(files);
		setModNames(result);
	};

	return (
		<Field>
			<FieldLabel htmlFor="mod">Auto Import</FieldLabel>
			<Input
				id="mod"
				type="file"
				accept=".jar"
				multiple
				onChange={handleFile}
			/>
			<FieldDescription>
				Click to upload. Only Fabric mods supported.
			</FieldDescription>
			<ScrollArea className="h-48">
				<div className="flex flex-col gap-1">
					{modNames.map((mod) => (
						<Item key={mod} variant="muted">
							<ItemContent>
								<ItemTitle>{mod}</ItemTitle>
							</ItemContent>
							<ItemActions>
								<Button variant="destructive">Remove</Button>
							</ItemActions>
						</Item>
					))}
				</div>
			</ScrollArea>
		</Field>
	);
}
