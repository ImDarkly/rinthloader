import { Field, FieldLabel } from "../ui/field";
import { Switch } from "../ui/switch";
import { useSnapshotsContext } from "@/app/page";

export default function ToggleSnapshots() {
	const [isSnapshotsEnabled, setIsSnapshotsEnabled] = useSnapshotsContext();

	return (
		<Field orientation="horizontal">
			<FieldLabel htmlFor="toggleSnapshot">Snapshots enabled</FieldLabel>
			<Switch
				id="toggleSnapshot"
				checked={isSnapshotsEnabled}
				onCheckedChange={setIsSnapshotsEnabled}
			/>
		</Field>
	);
}
