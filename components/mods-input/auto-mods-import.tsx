import { useState } from "react";
import { Field, FieldDescription, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { getModNames } from "@/lib/mod-detector";

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
			<div className="h-24">
				<Input
					id="mod"
					type="file"
					accept=".jar"
					multiple
					onChange={handleFile}
				/>
				{modNames}
			</div>
			<FieldDescription>
				Click to upload. Only Fabric mods supported.
			</FieldDescription>
		</Field>
	);
}
