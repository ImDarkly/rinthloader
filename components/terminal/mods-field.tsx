"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { detectModFiles, type DetectedModFile } from "@/lib/mod-detector";
import getFilesFromEvent from "@/lib/getFilesFromEvent";
import { parseModNames } from "@/lib/terminal/logic";
import { setModNamesList } from "@/lib/slices/modNamesListSlice";
import { setImportMode, type ImportMode } from "@/lib/slices/uiSlice";
import { cn } from "@/lib/utils";
import { DialogButton } from "./dialog-button";

const MODES: [ImportMode, string][] = [
	["auto", ".jar files"],
	["manual", "names"],
];

export function ModsField() {
	const dispatch = useAppDispatch();
	const importMode = useAppSelector((state) => state.ui.importMode);
	const modNames = useAppSelector((state) => state.modNamesList.modNames);
	const [results, setResults] = useState<DetectedModFile[]>([]);
	const [isDetecting, setIsDetecting] = useState(false);
	const [text, setText] = useState("");

	const onDrop = async (files: File[]) => {
		if (!files.length) return;
		setIsDetecting(true);
		try {
			const detected = await detectModFiles(files);
			setResults(detected);
			dispatch(
				setModNamesList(
					detected.flatMap((r) => (r.modName ? [r.modName] : [])),
				),
			);
		} finally {
			setIsDetecting(false);
		}
	};

	const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
		onDrop,
		getFilesFromEvent,
		accept: { "application/java-archive": [".jar"] },
		multiple: true,
		noClick: true,
		noKeyboard: true,
	});

	const pickMode = (mode: ImportMode) => {
		if (mode === importMode) return;
		// Switching modes never touches the mod list; only edits do.
		if (mode === "manual" && !text.trim() && modNames.length > 0) {
			setText(modNames.join("\n"));
		}
		dispatch(setImportMode(mode));
	};

	const count = modNames.length;

	return (
		<div className="flex flex-col gap-2">
			<div className="flex flex-wrap items-center gap-x-3">
				<span className="w-24 shrink-0">mods</span>
				<div
					role="radiogroup"
					aria-label="add mods by"
					className="flex gap-x-3"
				>
					{MODES.map(([value, label]) => (
						<button
							key={value}
							type="button"
							role="radio"
							aria-checked={importMode === value}
							onClick={() => pickMode(value)}
							className="cursor-pointer px-1 outline-none hover:bg-foreground hover:text-background focus-visible:bg-foreground focus-visible:text-background"
						>
							({importMode === value ? "•" : " "}) {label}
						</button>
					))}
				</div>
				<span
					className={cn(
						"ml-auto",
						count > 0 ? "text-primary" : "text-muted-foreground",
					)}
				>
					{count > 0 ? `✓ ${count}` : "○ 0"}
				</span>
			</div>

			{importMode === "auto" ? (
				<div
					{...getRootProps()}
					className={cn(
						"min-h-28 border border-dashed border-foreground p-3",
						isDragActive && "border-primary bg-primary/10",
					)}
				>
					<input {...getInputProps()} />
					<div className="mb-1">
						{isDragActive ? "release to add" : "drop .jar files here"}{" "}
						{!isDragActive && <DialogButton onClick={open}>browse</DialogButton>}
					</div>
					{isDetecting && <div aria-live="polite">detecting…</div>}
					{!isDetecting && results.length > 0 && (
						<ul className="flex flex-col gap-0.5">
							{results.map((r) => (
								<li
									key={r.fileName}
									className={cn(
										"break-words",
										!r.modName && "text-amber-600 dark:text-amber-400",
									)}
								>
									{r.modName
										? `✓ ${r.modName}`
										: `! ${r.fileName}  no mod name found`}
								</li>
							))}
						</ul>
					)}
					{!isDetecting && results.length === 0 && (
						<div className="text-muted-foreground">
							names are read from Fabric jars
						</div>
					)}
				</div>
			) : (
				<textarea
					rows={5}
					value={text}
					onChange={(e) => {
						setText(e.target.value);
						dispatch(setModNamesList(parseModNames(e.target.value)));
					}}
					placeholder={"sodium\nlithium\niris"}
					aria-label="mod names, one per line"
					className="min-h-28 w-full resize-none border border-foreground bg-transparent p-2 caret-primary outline-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
				/>
			)}
		</div>
	);
}
