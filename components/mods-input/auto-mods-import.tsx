import { useState } from "react";
import { Field, FieldDescription, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { getModNames } from "@/lib/mod-detector";

export default function AutoModsImport() {
	const [mods, setMods] = useState();

	const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setMods(result);
	};

	return (
		<Field>
			<FieldLabel htmlFor="mod">Auto Import</FieldLabel>
			<div className="h-24">
				<Input
					id="mod"
					type="file"
					accept=".jar"
					onChange={handleFile}
				/>
				{mods}
			</div>
			<FieldDescription>
				Click to upload. Only Fabric mods supported.
			</FieldDescription>
		</Field>
	);
}
