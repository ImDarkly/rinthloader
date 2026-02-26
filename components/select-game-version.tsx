import { useModrinthVersions } from "@/hooks/useModrinthVersions";
import { Field, FieldLabel } from "./ui/field";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import {
	initializeLatestGameVersion,
	setGameVersion,
} from "@/lib/slices/gameVersionSlice";
import { useEffect } from "react";
import { useSnapshotsContext } from "@/app/page";
import {
	Combobox,
	ComboboxCollection,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxGroup,
	ComboboxInput,
	ComboboxItem,
	ComboboxLabel,
	ComboboxList,
} from "./ui/combobox";

export default function SelectGameVersion() {
	const gameVersion = useAppSelector((state) => state.gameVersion.value);
	const dispatch = useAppDispatch();
	const { versions, isLoading } = useModrinthVersions();
	const [isSnapshotsEnabled] = useSnapshotsContext();
	const releases = versions.filter((v) => v.version_type === "release");
	const snapshots = versions.filter((v) => v.version_type === "snapshot");

	useEffect(() => {
		if (!isLoading) {
			dispatch(initializeLatestGameVersion(versions));
		}
	}, [versions, isLoading, dispatch]);

	return (
		<Field>
			<FieldLabel htmlFor="game-version">Game Version</FieldLabel>
			<Combobox
				items={versions}
				onValueChange={(value) => dispatch(setGameVersion(value))}
				value={gameVersion}
			>
				<ComboboxInput placeholder="Select a game version" />
				<ComboboxContent>
					<ComboboxEmpty>No verions found.</ComboboxEmpty>
					<ComboboxList>
						{releases.length > 0 && (
							<ComboboxGroup items={releases}>
								<ComboboxLabel>Releases</ComboboxLabel>
								<ComboboxCollection>
									{(item) => (
										<ComboboxItem
											key={item.version}
											value={item.version}
										>
											{item.version}
										</ComboboxItem>
									)}
								</ComboboxCollection>
							</ComboboxGroup>
						)}

						{snapshots.length > 0 && isSnapshotsEnabled && (
							<ComboboxGroup items={snapshots}>
								<ComboboxLabel>Snapshots</ComboboxLabel>
								<ComboboxCollection>
									{(item) => (
										<ComboboxItem
											key={item.version}
											value={item.version}
										>
											{item.version}
										</ComboboxItem>
									)}
								</ComboboxCollection>
							</ComboboxGroup>
						)}
					</ComboboxList>
				</ComboboxContent>
			</Combobox>
		</Field>
	);
}
