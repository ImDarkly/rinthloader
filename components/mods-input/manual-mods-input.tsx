import { Field, FieldDescription, FieldLabel } from "../ui/field";
import { Textarea } from "../ui/textarea";
import { setModsList } from "@/lib/features/modNamesListSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/store";

export default function ManualModsInput() {
	const dispatch = useAppDispatch();
	const modsList = useAppSelector((state) => state.modsList.value);

	function handleTextarea(e: React.ChangeEvent<HTMLTextAreaElement>) {
		const value = e.target.value;
		const array = value.split("\n");
	}

	return (
		<Field>
			<FieldLabel htmlFor="mods-list">Manual Input</FieldLabel>
			<Textarea
				id="mods-list"
				rows={10}
				className="h-24 resize-none"
				value={modsList}
				onChange={(e) => dispatch(setModsList(e.target.value))}
			/>
			<FieldDescription>
				Enter the list of mods you want to include, one per line.
			</FieldDescription>
		</Field>
	);
}
