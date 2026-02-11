import { Field, FieldDescription, FieldLabel } from "../ui/field";
import Dropzone from "../ui/dropzone";

export default function AutoModsImport() {
	return (
		<Field>
			<FieldLabel htmlFor="mod">Auto Import</FieldLabel>
			<Dropzone />
			<FieldDescription>
				Click or drag to upload. Only Fabric mods supported.
			</FieldDescription>
		</Field>
	);
}
