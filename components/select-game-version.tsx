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
import {
	initializeLatestGameVersion,
	setGameVersion,
} from "@/lib/slices/gameVersionSlice";
import { Spinner } from "./ui/spinner";
import { useEffect } from "react";
import useSnapshotsEnabled from "@/hooks/useSnapshotsEnabled";
import { useSnapshotsContext } from "@/app/page";

export default function SelectGameVersion() {
	const gameVersion = useAppSelector((state) => state.gameVersion.value);
	const dispatch = useAppDispatch();
	const { versions, isLoading } = useModrinthVersions();
	const [isSnapshotsEnabled] = useSnapshotsContext();

	useEffect(() => {
		if (!isLoading) {
			dispatch(initializeLatestGameVersion(versions));
		}
	}, [versions, isLoading, dispatch]);

	return (
		<Field>
			<FieldLabel htmlFor="game-version">Game Version</FieldLabel>
			<Select
				onValueChange={(value) => dispatch(setGameVersion(value))}
				value={gameVersion}
			>
				<SelectTrigger id="game-version">
					<SelectValue>
						{gameVersion || (isLoading ? <Spinner /> : gameVersion)}
					</SelectValue>
				</SelectTrigger>

				<SelectContent>
					<SelectGroup>
						<SelectLabel>Releases</SelectLabel>
						{versions.map(
							(version) =>
								version.version_type === "release" && (
									<SelectItem
										value={version.version}
										key={version.version}
										className={`${version.major ? "font-bold" : null}`}
									>
										{version.version}
									</SelectItem>
								),
						)}
					</SelectGroup>
					{isSnapshotsEnabled && (
						<SelectGroup>
							<SelectLabel>Snapshots</SelectLabel>
							{versions.map(
								(version) =>
									version.version_type === "snapshot" && (
										<SelectItem
											value={version.version}
											key={version.version}
										>
											{version.version}
										</SelectItem>
									),
							)}
						</SelectGroup>
					)}
				</SelectContent>
			</Select>
		</Field>
	);
}
