"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { useDispatch } from "react-redux";
import { useAppSelector } from "@/hooks/store";
import { detectModFiles, type DetectedModFile } from "@/lib/mod-detector";
import getFilesFromEvent from "@/lib/getFilesFromEvent";
import { setModNamesList } from "@/lib/slices/modNamesListSlice";
import { cn } from "@/lib/utils";

export default function TerminalDropzone() {
	const dispatch = useDispatch();
	const modNames = useAppSelector((state) => state.modNamesList.modNames);
	const [results, setResults] = useState<DetectedModFile[]>([]);
	const [fileCount, setFileCount] = useState(0);
	const [isDetecting, setIsDetecting] = useState(false);

	const onDrop = async (files: File[]) => {
		if (!files.length) return;

		setIsDetecting(true);
		try {
			const detected = await detectModFiles(files);
			setResults(detected);
			setFileCount(files.length);
			dispatch(
				setModNamesList(
					detected.flatMap((result) =>
						result.modName ? [result.modName] : [],
					),
				),
			);
		} finally {
			setIsDetecting(false);
		}
	};

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		getFilesFromEvent,
		accept: { "application/java-archive": [".jar"] },
		multiple: true,
	});

	const detectedCount = results.filter((result) => result.modName).length;
	const fileLabel = `${fileCount} ${fileCount === 1 ? "file" : "files"} selected`;
	const modLabel = `${detectedCount} ${
		detectedCount === 1 ? "mod name" : "mod names"
	} detected`;

	return (
		<div className="flex w-full flex-col gap-2 text-sm">
			<div
				{...getRootProps()}
				role="button"
				tabIndex={0}
				className="w-fit cursor-pointer text-primary outline-none hover:underline focus-visible:ring-1 focus-visible:ring-ring"
			>
				<input {...getInputProps()} id="mod" />
				{isDragActive
					? "drop .jar files here"
					: isDetecting
						? "detecting…"
						: "[choose .jar files] or drop them here"}
			</div>
			<p className="text-xs text-muted-foreground">
				automatic detection: Fabric jars only
			</p>

			{fileCount > 0 && (
				<div className="flex flex-col gap-1" aria-live="polite">
					<p className="text-xs text-muted-foreground">
						{fileLabel} · {modLabel}
					</p>
					<ul className="flex flex-col gap-0.5 pl-6">
						{results.map((result) => (
							<li
								key={result.fileName}
								className={cn(
									"break-words",
									result.modName
										? "text-foreground"
										: "text-amber-600 dark:text-amber-400",
								)}
							>
								{result.modName
									? `✓ ${result.modName}`
									: `! ${result.fileName}: no mod name detected`}
							</li>
						))}
					</ul>
				</div>
			)}

			{fileCount === 0 && modNames.length > 0 && (
				<p className="text-xs text-muted-foreground">
					{modNames.length}{" "}
					{modNames.length === 1 ? "mod name" : "mod names"} ready
				</p>
			)}
		</div>
	);
}
