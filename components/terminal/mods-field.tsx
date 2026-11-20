"use client";

import { useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { useImportModFiles } from "@/hooks/useImportModFiles";
import type { DetectedModFile } from "@/lib/mod-detector";
import getFilesFromEvent from "@/lib/getFilesFromEvent";
import { parseModNames } from "@/lib/terminal/logic";
import {
	setModNamesList,
	toDisplayNames,
	toModNames,
} from "@/lib/slices/modNamesListSlice";
import { setImportMode, type ImportMode } from "@/lib/slices/uiSlice";
import { cn } from "@/lib/utils";
import { DialogButton } from "./dialog-button";

const MODES: [ImportMode, string][] = [
	["auto", ".jar files"],
	["manual", "names"],
];

export function ModsField({
	isDetecting,
	setIsDetecting,
}: {
	isDetecting: boolean;
	setIsDetecting: (v: boolean) => void;
}) {
	const dispatch = useAppDispatch();
	const importMode = useAppSelector((state) => state.ui.importMode);
	const modNames = useAppSelector((state) => state.modNamesList.modNames);
	const titles = useAppSelector((state) => state.modNamesList.titles);
	const importModFiles = useImportModFiles();
	const [results, setResults] = useState<DetectedModFile[]>([]);
	const [loaderNote, setLoaderNote] = useState<string | null>(null);
	const [text, setText] = useState(() => toDisplayNames(modNames, titles).join("\n"));
	const [error, setError] = useState<string | null>(null);

	// Keep the names box in step with list changes from elsewhere (a jar drop, a shared
	// link, the saved list), but never rewrite what the user is typing.
	const [ownList, setOwnList] = useState<string[] | null>(null);
	const [seenList, setSeenList] = useState(modNames);
	if (modNames !== seenList) {
		setSeenList(modNames);
		if (modNames !== ownList) setText(toDisplayNames(modNames, titles).join("\n"));
	}
	const radioRefs = useRef<Map<ImportMode, HTMLButtonElement>>(new Map());
	// Only the latest import may write results; edits, mode switches and newer drops bump it.
	const importId = useRef(0);

	// Leaving the dialog abandons any read still in flight.
	useEffect(() => {
		const ids = importId;
		return () => {
			ids.current++;
		};
	}, []);

	const cancelDetection = () => {
		importId.current++;
		setIsDetecting(false);
	};

	const onDrop = async (files: File[]) => {
		if (!files.length) return;
		const id = ++importId.current;
		setIsDetecting(true);
		setError(null);
		setLoaderNote(null);
		try {
			const detected = await importModFiles(files, {
				isCurrent: () => id === importId.current,
				onLoaderChange: setLoaderNote,
			});
			if (id !== importId.current) return;
			setResults(detected);
		} catch {
			if (id !== importId.current) return;
			setResults([]);
			setError("could not read files");
		} finally {
			if (id === importId.current) setIsDetecting(false);
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
		cancelDetection();
		// Switching modes never touches the mod list; only edits do.
		dispatch(setImportMode(mode));
	};

	const onRadioKeyDown = (e: React.KeyboardEvent) => {
		if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
		e.preventDefault();
		const other = MODES.find(([v]) => v !== importMode)?.[0];
		if (!other) return;
		pickMode(other);
		radioRefs.current.get(other)?.focus();
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
							tabIndex={importMode === value ? 0 : -1}
							ref={(el) => {
								if (el) radioRefs.current.set(value, el);
								else radioRefs.current.delete(value);
							}}
							onKeyDown={onRadioKeyDown}
							onClick={() => {
								pickMode(value);
							}}
							className="cursor-pointer px-1 outline-none hover:bg-foreground hover:text-background focus-visible:bg-foreground focus-visible:text-background"
						>
							<span aria-hidden="true">({importMode === value ? "•" : " "}) </span>
							{label}
						</button>
					))}
				</div>
				<span
					className={cn(
						"ml-auto",
						count > 0 ? "text-primary" : "text-muted-foreground",
					)}
				>
					<span aria-hidden="true">{count > 0 ? "✓ " : "○ "}</span>
					{count}
					<span className="sr-only"> {count === 1 ? "mod" : "mods"}</span>
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
					<div aria-live="polite">
						{isDetecting && <div>detecting…</div>}
						{!isDetecting && error && (
							<div className="text-destructive">
								<span aria-hidden="true">✗ </span>
								<span className="sr-only">error: </span>
								{error}
							</div>
						)}
						{!isDetecting && !error && results.length > 0 && (
							<ul className="flex flex-col gap-0.5">
								{results.map((r) => (
									<li
										key={r.fileName}
										className={cn(
											"break-words",
											!r.modName && "text-amber-700 dark:text-amber-400",
										)}
									>
										<span aria-hidden="true">{r.modName ? "✓ " : "! "}</span>
										{!r.modName && <span className="sr-only">warning: </span>}
										{r.modName ? (r.title ?? r.modName) : `${r.fileName}  no mod name found`}
									</li>
								))}
							</ul>
						)}
						{!isDetecting && loaderNote && (
							<div className="mt-1 text-muted-foreground">
								<span aria-hidden="true">&gt; </span>
								loader set to {loaderNote} to match the jars
							</div>
						)}
					</div>
					{!isDetecting && !error && results.length === 0 && (
						<div className="text-muted-foreground">
							names are read from Fabric, Quilt, Forge and NeoForge jars
						</div>
					)}
				</div>
			) : (
				<textarea
					rows={5}
					value={text}
					onChange={(e) => {
						cancelDetection();
						setText(e.target.value);
						setResults([]);
						setError(null);
						const list = toModNames(parseModNames(e.target.value), titles);
						setOwnList(list);
						dispatch(setModNamesList(list));
					}}
					placeholder={"sodium\nlithium\niris"}
					aria-label="mod names, one per line"
					className="min-h-28 w-full resize-none border border-foreground bg-transparent p-2 caret-primary outline-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
				/>
			)}
		</div>
	);
}
