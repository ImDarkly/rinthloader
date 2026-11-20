"use client";

import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { useModrinthLoaders } from "@/hooks/useModrinthLoaders";
import { useModrinthVersions } from "@/hooks/useModrinthVersions";
import { useRememberedTarget } from "@/hooks/useRememberedTarget";
import { useTerminalDownload } from "@/hooks/useTerminalDownload";
import { useSnapshotsContext } from "@/app/page";
import { setGameVersion } from "@/lib/slices/gameVersionSlice";
import { setModLoader } from "@/lib/slices/modLoaderSlice";
import { DialogButton } from "./dialog-button";
import { DropField } from "./drop-field";
import { ModsField } from "./mods-field";
import { StatusLog } from "./status-log";

export function SetupDialog() {
	const dispatch = useAppDispatch();
	const gameVersion = useAppSelector((state) => state.gameVersion.value);
	const modLoader = useAppSelector((state) => state.modLoader.value);
	const { versions, isLoading: versionsLoading } = useModrinthVersions();
	const { modLoaders, isLoading: loadersLoading } = useModrinthLoaders();
	const [isSnapshotsEnabled, setIsSnapshotsEnabled] = useSnapshotsContext();
	const download = useTerminalDownload();

	const versionItems = versions
		.filter(
			(v) =>
				v.version_type === "release" ||
				(isSnapshotsEnabled && v.version_type === "snapshot"),
		)
		.map((v) => v.version);
	const loaderItems = modLoaders.map((l) => l.name);

	useRememberedTarget(versions, isSnapshotsEnabled, loaderItems);

	const toggleSnapshots = () => {
		const next = !isSnapshotsEnabled;
		setIsSnapshotsEnabled(next);
		// Hiding snapshots must not leave a hidden snapshot selected.
		const current = versions.find((v) => v.version === gameVersion);
		if (!next && current?.version_type === "snapshot") {
			const latestRelease = versions.find((v) => v.version_type === "release");
			if (latestRelease) dispatch(setGameVersion(latestRelease.version));
		}
	};

	return (
		<section
			aria-labelledby="setup-title"
			className="relative w-full max-w-xl border-4 border-double border-foreground bg-background px-5 pt-6 pb-4 shadow-[10px_10px_0_0_var(--muted-foreground)]"
		>
			<div
				id="setup-title"
				className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-background px-2 whitespace-nowrap"
			>
				<span className="text-primary">rinth</span>loader setup
			</div>

			<div className="flex flex-col gap-2">
				<DropField
					id="setup-version"
					label="minecraft"
					value={gameVersion}
					items={versionItems}
					failed={!versionsLoading && versions.length === 0}
					onPick={(v) => dispatch(setGameVersion(v))}
					extra={
						<button
							type="button"
							role="checkbox"
							aria-checked={isSnapshotsEnabled}
							onClick={toggleSnapshots}
							className="cursor-pointer px-1 text-muted-foreground outline-none hover:bg-foreground hover:text-background focus-visible:bg-foreground focus-visible:text-background"
						>
							<span aria-hidden="true">[{isSnapshotsEnabled ? "X" : " "}] </span>
							snapshots
						</button>
					}
				/>
				<DropField
					id="setup-loader"
					label="loader"
					value={modLoader}
					items={loaderItems}
					failed={!loadersLoading && modLoaders.length === 0}
					onPick={(v) => dispatch(setModLoader(v))}
				/>
				<ModsField
					isDetecting={download.isDetecting}
					setIsDetecting={download.setIsDetecting}
				/>
				<StatusLog download={download} />
			</div>

			<div className="mt-4 flex justify-center">
				<DialogButton
					primary
					busy={download.isChecking}
					onClick={() => void download.download()}
				>
					download
				</DialogButton>
			</div>
		</section>
	);
}
