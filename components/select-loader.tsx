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
import { setLoader } from "@/lib/features/loaderSlice";

export function SelectLoader() {
	const loader = useAppSelector((state) => state.loader.value);
	const dispatch = useAppDispatch();
	const { loaders } = useModrinthLoaders();

	return (
		<Field>
			<FieldLabel htmlFor="loader">Mod loader</FieldLabel>
			<Select
				onValueChange={(value) => dispatch(setLoader(value))}
				value={loader}
			>
				<SelectTrigger id="loader">
					<SelectValue placeholder="Select loader" />
				</SelectTrigger>

				<SelectContent>
					<SelectGroup>
						<SelectLabel>Releases</SelectLabel>
						{loaders.map((loader) => (
							<SelectItem value={loader.name} key={loader.name}>
								{loader.name}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
		</Field>
	);
}
