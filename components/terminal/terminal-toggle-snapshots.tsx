"use client";

import { Field, FieldLabel } from "../ui/field";
import { Switch } from "../ui/switch";
import { useSnapshotsContext } from "@/app/page";

export default function TerminalToggleSnapshots({
	compact = false,
}: {
	compact?: boolean;
}) {
	const [isSnapshotsEnabled, setIsSnapshotsEnabled] = useSnapshotsContext();

	return (
		<Field
			orientation="horizontal"
			className={compact ? "items-center" : undefined}
		>
			<FieldLabel
				htmlFor="toggleSnapshot"
				className={compact ? "text-muted-foreground" : "text-sm"}
			>
				Snapshots
			</FieldLabel>
			<Switch
				id="toggleSnapshot"
				checked={isSnapshotsEnabled}
				onCheckedChange={setIsSnapshotsEnabled}
			/>
		</Field>
	);
}
