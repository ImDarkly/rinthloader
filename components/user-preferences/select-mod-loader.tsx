import { useModrinthLoaders } from "@/hooks/useModrinthLoaders";
import { Field, FieldLabel } from "../ui/field";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { setModLoader } from "@/lib/slices/modLoaderSlice";
import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
} from "../ui/combobox";

export function SelectModLoader() {
	const modLoader = useAppSelector((state) => state.modLoader.value);
	const dispatch = useAppDispatch();
	const { modLoaders } = useModrinthLoaders();

	return (
		<Field orientation="horizontal">
			<FieldLabel htmlFor="modLoader" className="whitespace-nowrap">
				Mod loader
			</FieldLabel>
			<Combobox
				items={modLoaders}
				onValueChange={(value) => dispatch(setModLoader(value))}
				value={modLoader}
			>
				<ComboboxInput
					className="max-w-32"
					placeholder="Select a mod loader"
				/>
				<ComboboxContent>
					<ComboboxEmpty>No mod loaders found.</ComboboxEmpty>
					<ComboboxList>
						{(item) => (
							<ComboboxItem key={item.name} value={item.name}>
								{item.name}
							</ComboboxItem>
						)}
					</ComboboxList>
				</ComboboxContent>
			</Combobox>
		</Field>
	);
}
