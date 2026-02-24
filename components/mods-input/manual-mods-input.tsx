import { Field, FieldDescription, FieldLabel } from "../ui/field";
import { Textarea } from "../ui/textarea";
import { setModNamesList } from "@/lib/slices/modNamesListSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { useEffect, useState } from "react";

export default function ManualModsInput() {
	const dispatch = useAppDispatch();
	const modsList = useAppSelector((state) => state.modNamesList.modNames);
	const [localValue, setLocalValue] = useState(modsList.join("\n"));

	useEffect(() => {
		setLocalValue(modsList.join("\n"));
	}, [modsList]);

	const handleBlur = () => {
		const lines = localValue
			.split("\n")
			.map((line) => line.trim())
			.filter(Boolean);

		dispatch(setModNamesList(lines));
	};

	return (
		<Field>
			<FieldLabel htmlFor="mods-list">Manual Input</FieldLabel>
			<Textarea
				id="mods-list"
				rows={10}
				className="h-24 resize-none"
				value={localValue}
				onChange={(e) => setLocalValue(e.target.value)}
				onBlur={handleBlur}
			/>
			<FieldDescription>
				Enter the list of mods you want to include, one per line.
			</FieldDescription>
		</Field>
	);
}
