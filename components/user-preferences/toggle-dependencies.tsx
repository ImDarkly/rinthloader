import { Field, FieldLabel } from "../ui/field";
import { Switch } from "../ui/switch";
import { useIncludeDependenciesContext } from "@/app/page";

export default function ToggleDependencies() {
	const [includeDependencies, setIncludeDependencies] =
		useIncludeDependenciesContext();

	return (
		<Field orientation="horizontal">
			<FieldLabel htmlFor="toggleDependencies">Include dependencies</FieldLabel>
			<Switch
				id="toggleDependencies"
				checked={includeDependencies}
				onCheckedChange={setIncludeDependencies}
			/>
		</Field>
	);
}
