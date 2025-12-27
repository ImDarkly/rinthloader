import { useModrinthVersions } from "@/hooks/useModrinthVersions";
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
import { setGameVersion } from "@/lib/features/gameVersionSlice";

export default function SelectGameVersion() {
	const gameVersion = useAppSelector((state) => state.gameVersion.value);
	const dispatch = useAppDispatch();
	const { versions } = useModrinthVersions();

	return (
		<Field>
			<FieldLabel htmlFor="game-version">Game Version</FieldLabel>
			<Select
				onValueChange={(value) => dispatch(setGameVersion(value))}
				value={gameVersion}
			>
				<SelectTrigger id="game-version">
					<SelectValue placeholder="Select version" />
				</SelectTrigger>

				<SelectContent>
					<SelectGroup>
						<SelectLabel>Releases</SelectLabel>
						{versions.map((version) => (
							<SelectItem
								value={version.version}
								key={version.version}
							>
								{version.version}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
		</Field>
	);
}
