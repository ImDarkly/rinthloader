"use client";

// THROWAWAY SPIKE: shared pieces for the four terminal-style prototypes under /proto.

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useDropzone } from "react-dropzone";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { useModrinthVersions } from "@/hooks/useModrinthVersions";
import { useModrinthLoaders } from "@/hooks/useModrinthLoaders";
import useSnapshotsEnabled from "@/hooks/useSnapshotsEnabled";
import {
	initializeLatestGameVersion,
	setGameVersion,
} from "@/lib/slices/gameVersionSlice";
import { setModLoader } from "@/lib/slices/modLoaderSlice";
import { setModNamesList } from "@/lib/slices/modNamesListSlice";
import { detectModFiles, type DetectedModFile } from "@/lib/mod-detector";
import getFilesFromEvent from "@/lib/getFilesFromEvent";
import { validateModSlugs } from "@/lib/modValidation";
import { cn } from "@/lib/utils";

export type LogLine = { kind: "info" | "ok" | "warn" | "err"; text: string };

export function useProtoFlow() {
	const dispatch = useAppDispatch();
	const gameVersion = useAppSelector((s) => s.gameVersion.value);
	const modLoader = useAppSelector((s) => s.modLoader.value);
	const mods = useAppSelector((s) => s.modNamesList.modNames);
	const { versions, isLoading } = useModrinthVersions();
	const { modLoaders } = useModrinthLoaders();
	const [snapshots, setSnapshots] = useSnapshotsEnabled();
	const [detected, setDetected] = useState<DetectedModFile[]>([]);
	const [isDetecting, setIsDetecting] = useState(false);
	const [log, setLog] = useState<LogLine[]>([]);
	const [isBusy, setIsBusy] = useState(false);
	const [pendingValid, setPendingValid] = useState<string[] | null>(null);

	useEffect(() => {
		if (!isLoading) dispatch(initializeLatestGameVersion(versions));
	}, [versions, isLoading, dispatch]);

	const versionNames = useMemo(
		() =>
			versions
				.filter((v) => snapshots || v.version_type === "release")
				.map((v) => v.version),
		[versions, snapshots],
	);
	const loaderNames = useMemo(
		() => modLoaders.map((l) => l.name),
		[modLoaders],
	);

	const push = (line: LogLine) => setLog((l) => [...l, line]);

	const detect = async (files: File[]) => {
		if (!files.length) return;
		setIsDetecting(true);
		try {
			const result = await detectModFiles(files);
			setDetected(result);
			dispatch(
				setModNamesList(result.flatMap((r) => (r.modName ? [r.modName] : []))),
			);
		} finally {
			setIsDetecting(false);
		}
	};

	const setManual = (text: string) =>
		dispatch(
			setModNamesList(
				text
					.split("\n")
					.map((s) => s.trim())
					.filter(Boolean),
			),
		);

	const blocker = !gameVersion
		? "pick a minecraft version first"
		: !modLoader
			? "pick a mod loader first"
			: mods.length === 0
				? "add at least one mod first"
				: null;

	const startDownload = (valid: string[]) => {
		if (!gameVersion || !modLoader) return;
		push({ kind: "ok", text: `downloading ${valid.length} mods as zip…` });
		const params = new URLSearchParams({
			modsList: valid.join("\n"),
			gameVersion,
			modLoader,
		});
		window.location.href = `/api/download-mods?${params.toString()}`;
	};

	const download = async () => {
		setPendingValid(null);
		if (blocker) {
			push({ kind: "warn", text: blocker });
			return;
		}
		setIsBusy(true);
		push({
			kind: "info",
			text: `checking ${mods.length} mods on modrinth for ${modLoader} ${gameVersion}…`,
		});
		try {
			const { valid, invalid, errors } = await validateModSlugs(mods);
			if (errors.length) {
				push({
					kind: "err",
					text: `couldn't reach modrinth for: ${errors.join(", ")}. try again`,
				});
				return;
			}
			push({ kind: "ok", text: `${valid.length} found` });
			if (invalid.length) {
				push({
					kind: "warn",
					text: `${invalid.length} not found: ${invalid.join(", ")}`,
				});
				if (valid.length) setPendingValid(valid);
				return;
			}
			startDownload(valid);
		} finally {
			setIsBusy(false);
		}
	};

	return {
		gameVersion,
		modLoader,
		mods,
		versionNames,
		loaderNames,
		snapshots,
		setSnapshots,
		setVersion: (v: string) => dispatch(setGameVersion(v)),
		setLoader: (v: string) => dispatch(setModLoader(v)),
		detected,
		isDetecting,
		detect,
		setManual,
		log,
		isBusy,
		blocker,
		download,
		pendingValid,
		downloadAnyway: () => {
			if (pendingValid) startDownload(pendingValid);
			setPendingValid(null);
		},
	};
}

export type ProtoFlow = ReturnType<typeof useProtoFlow>;

/** Inverse-video key cap, like a TUI key bar. */
export function Key({ children }: { children: ReactNode }) {
	return (
		<span className="bg-foreground px-1 text-background">{children}</span>
	);
}

/** Clickable terminal "button": text in inverse video on focus/hover. */
export function TButton({
	children,
	onClick,
	primary,
	className,
	disabled,
}: {
	children: ReactNode;
	onClick?: () => void;
	primary?: boolean;
	className?: string;
	disabled?: boolean;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			className={cn(
				"cursor-pointer px-1 outline-none hover:bg-foreground hover:text-background focus-visible:bg-foreground focus-visible:text-background disabled:cursor-wait",
				primary && "text-primary hover:bg-primary hover:text-background focus-visible:bg-primary",
				className,
			)}
		>
			{children}
		</button>
	);
}

/** fzf-style filter + list. Type to filter, ↑↓ to move, ↵ to pick, or click. */
export function FuzzyPicker({
	items,
	value,
	onPick,
	prompt,
	rows = 6,
	autoFocus,
	id,
}: {
	items: string[];
	value: string | null;
	onPick: (v: string) => void;
	prompt: string;
	rows?: number;
	autoFocus?: boolean;
	id: string;
}) {
	const [query, setQuery] = useState("");
	const [cursor, setCursor] = useState(0);
	const listRef = useRef<HTMLUListElement>(null);
	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		return q ? items.filter((i) => i.toLowerCase().includes(q)) : items;
	}, [items, query]);

	useEffect(() => {
		// Keep the cursor on the current value when the list first loads.
		const idx = value ? filtered.indexOf(value) : -1;
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setCursor(idx >= 0 ? idx : 0);
	}, [filtered, value]);

	const start = Math.max(0, Math.min(cursor - Math.floor(rows / 2), filtered.length - rows));
	const visible = filtered.slice(start, start + rows);

	return (
		<div className="flex w-full flex-col">
			<div className="flex items-center gap-2">
				<label htmlFor={id} className="text-primary">
					{prompt} ›
				</label>
				<input
					id={id}
					autoFocus={autoFocus}
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "ArrowDown") {
							e.preventDefault();
							setCursor((c) => Math.min(c + 1, filtered.length - 1));
						} else if (e.key === "ArrowUp") {
							e.preventDefault();
							setCursor((c) => Math.max(c - 1, 0));
						} else if (e.key === "Enter" && filtered[cursor]) {
							e.preventDefault();
							onPick(filtered[cursor]);
						}
					}}
					placeholder="type to filter"
					role="combobox"
					aria-expanded="true"
					aria-controls={`${id}-list`}
					aria-activedescendant={filtered[cursor] ? `${id}-${cursor}` : undefined}
					className="min-w-0 flex-1 bg-transparent caret-primary outline-none placeholder:text-muted-foreground"
				/>
			</div>
			<div className="text-muted-foreground">
				{"  "}
				{filtered.length}/{items.length} ────────────
			</div>
			<ul id={`${id}-list`} ref={listRef} role="listbox" className="flex flex-col">
				{visible.map((item, i) => {
					const idx = start + i;
					const active = idx === cursor;
					return (
						<li
							key={item}
							id={`${id}-${idx}`}
							role="option"
							aria-selected={item === value}
							onMouseEnter={() => setCursor(idx)}
							onClick={() => onPick(item)}
							className="flex cursor-pointer gap-2"
						>
							<span className="w-2 text-primary">{active ? "▌" : " "}</span>
							<span className={cn(active && "bg-foreground text-background")}>
								{item}
							</span>
							{item === value && <span className="text-primary">✓</span>}
						</li>
					);
				})}
				{filtered.length === 0 && (
					<li className="text-muted-foreground">  no matches</li>
				)}
			</ul>
		</div>
	);
}

/** Wrap anything to make it a .jar drop target + file chooser. */
export function JarDrop({
	onFiles,
	children,
	className,
}: {
	onFiles: (files: File[]) => void;
	children: (state: { isDragActive: boolean; open: () => void }) => ReactNode;
	className?: string;
}) {
	const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
		onDrop: onFiles,
		getFilesFromEvent,
		accept: { "application/java-archive": [".jar"] },
		multiple: true,
		noClick: true,
		noKeyboard: true,
	});
	return (
		<div {...getRootProps()} className={className}>
			<input {...getInputProps()} aria-label="Jar files" />
			{children({ isDragActive, open })}
		</div>
	);
}

export function DetectedList({ flow }: { flow: ProtoFlow }) {
	if (flow.isDetecting) return <div className="text-muted-foreground">detecting…</div>;
	if (!flow.detected.length) return null;
	return (
		<ul className="flex flex-col">
			{flow.detected.map((d) => (
				<li key={d.fileName} className={d.modName ? "" : "text-amber-600 dark:text-amber-400"}>
					{d.modName ? (
						<>
							<span className="text-primary">✓</span> {d.modName}
						</>
					) : (
						`! ${d.fileName}  no mod name found`
					)}
				</li>
			))}
		</ul>
	);
}

export function LogView({ flow, showPrompt = true }: { flow: ProtoFlow; showPrompt?: boolean }) {
	return (
		<div aria-live="polite" className="flex flex-col">
			{flow.log.map((l, i) => (
				<div
					key={i}
					className={cn(
						l.kind === "ok" && "text-primary",
						l.kind === "warn" && "text-amber-600 dark:text-amber-400",
						l.kind === "err" && "text-destructive",
					)}
				>
					{l.kind === "ok" ? "✓" : l.kind === "warn" ? "!" : l.kind === "err" ? "✗" : ">"} {l.text}
				</div>
			))}
			{flow.isBusy && <div className="text-muted-foreground">  working…</div>}
			{flow.pendingValid && (
				<div>
					<TButton primary onClick={flow.downloadAnyway}>
						[ download {flow.pendingValid.length} found mods anyway ]
					</TButton>
				</div>
			)}
			{showPrompt && (
				<div>
					<span className="text-muted-foreground">$</span>{" "}
					<span aria-hidden="true" className="terminal-cursor inline-block h-4 w-2 translate-y-0.5 bg-foreground" />
				</div>
			)}
		</div>
	);
}

export function ProtoNav({ current }: { current: string }) {
	const items = [
		["a", "wizard"],
		["b", "panes"],
		["c", "dialog"],
		["d", "fuzzy"],
		["e", "setup"],
	];
	return (
		<nav className="flex flex-wrap gap-x-3 text-muted-foreground">
			<span>prototype:</span>
			{items.map(([k, label]) => (
				<Link
					key={k}
					href={`/proto/${k}`}
					className={cn(
						"px-1 hover:bg-foreground hover:text-background",
						current === k && "bg-foreground text-background",
					)}
				>
					{k} {label}
				</Link>
			))}
		</nav>
	);
}
