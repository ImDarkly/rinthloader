"use client";

import { Field, FieldLabel } from "../ui/field";
import { Switch } from "../ui/switch";
import { useIncludeDependenciesContext } from "@/app/page";

export default function TerminalToggleDependencies({
	compact = false,
}: {
	compact?: boolean;
}) {
	const [includeDependencies, setIncludeDependencies] =
		useIncludeDependenciesContext();

	return (
		<Field
			orientation="horizontal"
			className={compact ? "items-center" : undefined}
		>
			<FieldLabel
				htmlFor="toggleDependencies"
				className={compact ? "text-muted-foreground" : "text-sm"}
			>
				Dependencies
			</FieldLabel>
			<Switch
				id="toggleDependencies"
				checked={includeDependencies}
				onCheckedChange={setIncludeDependencies}
			/>
		</Field>
	);
}
