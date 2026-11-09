"use client";

import { useModrinthVersions } from "@/hooks/useModrinthVersions";
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
} from "../ui/combobox";
import { cn } from "@/lib/utils";

export default function TerminalSelectGameVersion() {
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
		<Combobox
			items={versions}
			onValueChange={(value) => {
				if (value) dispatch(setGameVersion(value));
			}}
			value={gameVersion}
		>
			<span className="inline-flex items-center text-sm">
				<span className="text-muted-foreground">[</span>
				<ComboboxInput
					id="game-version"
					placeholder="select"
					className={cn(
						"h-auto w-auto border-0 bg-transparent p-0 dark:bg-transparent",
						"has-[[data-slot=input-group-control]:focus-visible]:border-transparent has-[[data-slot=input-group-control]:focus-visible]:ring-0",
						"[&_input]:h-auto [&_input]:w-[9ch] [&_input]:p-0 [&_input]:text-sm",
					)}
				/>
				<span className="text-muted-foreground">]</span>
			</span>
			<ComboboxContent className="min-w-56">
				<ComboboxEmpty>No versions found.</ComboboxEmpty>
				<ComboboxList>
					{releases.length > 0 && (
						<ComboboxGroup items={releases}>
							<ComboboxLabel>Releases</ComboboxLabel>
							<ComboboxCollection>
								{(item) => (
									<ComboboxItem key={item.version} value={item.version}>
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
									<ComboboxItem key={item.version} value={item.version}>
										{item.version}
									</ComboboxItem>
								)}
							</ComboboxCollection>
						</ComboboxGroup>
					)}
				</ComboboxList>
			</ComboboxContent>
		</Combobox>
	);
}
