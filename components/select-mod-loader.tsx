import { useModrinthLoaders } from "@/hooks/useModrinthLoaders";
import { Field, FieldLabel } from "./ui/field";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { setModLoader } from "@/lib/slices/modLoaderSlice";

export function SelectModLoader() {
	const modLoader = useAppSelector((state) => state.modLoader.value);
	const dispatch = useAppDispatch();
	const { modLoaders } = useModrinthLoaders();

	return (
		<Field>
			<FieldLabel htmlFor="modLoader">Mod loader</FieldLabel>
			<Select
				onValueChange={(value) => {
					dispatch(setModLoader(value));
				}}
				value={modLoader}
			>
				<SelectTrigger id="modLoader">
					<SelectValue data-placeholder="Select mod loader" />
				</SelectTrigger>

				<SelectContent>
					<SelectGroup>
						{modLoaders.map((modLoader) => (
							<SelectItem
								value={modLoader.name}
								key={modLoader.name}
							>
								{modLoader.name}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
		</Field>
	);
}
