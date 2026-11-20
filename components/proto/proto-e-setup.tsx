"use client";

// THROWAWAY SPIKE — Prototype E: one-screen setup dialog (BIOS / installer style).
// Everything in one double-bordered box; ▼ fields open a fuzzy picker in place.

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
	DetectedList,
	FuzzyPicker,
	JarDrop,
	LogView,
	useProtoFlow,
} from "./shared";
import { cn } from "@/lib/utils";

function DButton({
	children,
	onClick,
	primary,
	disabled,
	className,
}: {
	children: ReactNode;
	onClick: () => void;
	primary?: boolean;
	disabled?: boolean;
	className?: string;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			className={cn(
				"cursor-pointer px-1 outline-none disabled:cursor-wait",
				primary
					? "bg-primary text-background hover:bg-foreground focus-visible:bg-foreground"
					: "hover:bg-foreground hover:text-background focus-visible:bg-foreground focus-visible:text-background",
				className,
			)}
		>
			&lt; {children} &gt;
		</button>
	);
}

/** A `[ value ▼ ]` field that opens a fuzzy picker box right under it. */
function DropField({
	id,
	label,
	value,
	items,
	onPick,
	extra,
}: {
	id: string;
	label: string;
	value: string | null;
	items: string[];
	onPick: (v: string) => void;
	extra?: ReactNode;
}) {
	const [open, setOpen] = useState(false);
	const btn = useRef<HTMLButtonElement>(null);
	const close = () => {
		setOpen(false);
		btn.current?.focus();
	};

	return (
		<div className="relative">
			<div className="flex flex-wrap items-center gap-x-3">
				<span id={`${id}-label`} className="w-24 shrink-0">
					{label}
				</span>
				<button
					ref={btn}
					type="button"
					aria-haspopup="listbox"
					aria-expanded={open}
					aria-labelledby={`${id}-label ${id}-btn`}
					id={`${id}-btn`}
					onClick={() => setOpen((o) => !o)}
					className="cursor-pointer outline-none hover:bg-foreground hover:text-background focus-visible:bg-foreground focus-visible:text-background"
				>
					[ <span className="inline-block w-[14ch] text-left">{value ?? "select"}</span>▼]
				</button>
				{extra}
			</div>
			{open && (
				<div
					onKeyDown={(e) => {
						if (e.key === "Escape") {
							e.stopPropagation();
							close();
						}
					}}
					className="absolute top-full left-0 z-10 mt-1 w-full max-w-xs border-2 border-foreground bg-background p-2 shadow-[6px_6px_0_0_var(--muted-foreground)] sm:left-[calc(6rem+0.75rem)]"
				>
					<FuzzyPicker
						id={id}
						prompt={label}
						autoFocus
						rows={7}
						items={items}
						value={value}
						onPick={(v) => {
							onPick(v);
							close();
						}}
					/>
					<div className="mt-1 text-muted-foreground">esc close</div>
				</div>
			)}
		</div>
	);
}

/** Remember the last version + loader between visits. */
function useRememberTarget(flow: ReturnType<typeof useProtoFlow>) {
	const loaded = useRef(false);
	const { setVersion, setLoader, gameVersion, modLoader } = flow;
	useEffect(() => {
		if (loaded.current) return;
		loaded.current = true;
		try {
			const saved = JSON.parse(localStorage.getItem("proto-target") ?? "null") as {
				v?: string;
				l?: string;
			} | null;
			if (saved?.v) setVersion(saved.v);
			if (saved?.l) setLoader(saved.l);
		} catch {}
	}, [setVersion, setLoader]);
	useEffect(() => {
		if (!loaded.current || !gameVersion) return;
		try {
			localStorage.setItem("proto-target", JSON.stringify({ v: gameVersion, l: modLoader }));
		} catch {}
	}, [gameVersion, modLoader]);
}

export default function ProtoSetup() {
	const flow = useProtoFlow();
	useRememberTarget(flow);
	const [mode, setMode] = useState<"jar" | "names">("jar");
	const [text, setText] = useState("");

	return (
		<div className="flex min-h-[70dvh] items-start justify-center pt-4">
			<div
				role="dialog"
				aria-labelledby="e-title"
				className="relative w-full max-w-xl border-4 border-double border-foreground bg-background px-5 pt-6 pb-4 shadow-[10px_10px_0_0_var(--muted-foreground)]"
			>
				<div id="e-title" className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-background px-2">
					<span className="text-primary">rinth</span>loader setup
				</div>

				<div className="flex flex-col gap-2">
					<DropField
						id="e-version"
						label="minecraft"
						value={flow.gameVersion}
						items={flow.versionNames}
						onPick={flow.setVersion}
						extra={
							<button
								type="button"
								role="checkbox"
								aria-checked={flow.snapshots}
								onClick={() => flow.setSnapshots(!flow.snapshots)}
								className="cursor-pointer px-1 text-muted-foreground outline-none hover:bg-foreground hover:text-background focus-visible:bg-foreground focus-visible:text-background"
							>
								[{flow.snapshots ? "X" : " "}] snapshots
							</button>
						}
					/>
					<DropField
						id="e-loader"
						label="loader"
						value={flow.modLoader}
						items={flow.loaderNames}
						onPick={flow.setLoader}
					/>

					<div className="flex flex-wrap items-center gap-x-3">
						<span className="w-24 shrink-0">mods</span>
						<div role="radiogroup" aria-label="Add mods by" className="flex gap-x-3">
							{([
								["jar", ".jar files"],
								["names", "names"],
							] as const).map(([v, label]) => (
								<button
									key={v}
									type="button"
									role="radio"
									aria-checked={mode === v}
									onClick={() => setMode(v)}
									className="cursor-pointer px-1 outline-none hover:bg-foreground hover:text-background focus-visible:bg-foreground focus-visible:text-background"
								>
									({mode === v ? "•" : " "}) {label}
								</button>
							))}
						</div>
						<span className={cn("ml-auto", flow.mods.length ? "text-primary" : "text-muted-foreground")}>
							{flow.mods.length ? `✓ ${flow.mods.length}` : "○ 0"}
						</span>
					</div>

					{mode === "jar" ? (
						<JarDrop onFiles={(f) => void flow.detect(f)}>
							{({ isDragActive, open }) => (
								<div
									className={cn(
										"min-h-28 border border-dashed border-foreground p-3",
										isDragActive && "border-primary bg-primary/10",
									)}
								>
									<div className="mb-1">
										{isDragActive ? "release to add" : "drop .jar files here"}{" "}
										{!isDragActive && <DButton onClick={open}>browse</DButton>}
									</div>
									<DetectedList flow={flow} />
									{!flow.detected.length && (
										<div className="text-muted-foreground">names are read from Fabric jars</div>
									)}
								</div>
							)}
						</JarDrop>
					) : (
						<textarea
							rows={5}
							value={text}
							onChange={(e) => {
								setText(e.target.value);
								flow.setManual(e.target.value);
							}}
							placeholder={"sodium\nlithium\niris"}
							aria-label="Mod names, one per line"
							className="min-h-28 w-full resize-none border border-foreground bg-transparent p-2 caret-primary outline-none placeholder:text-muted-foreground focus:border-primary"
						/>
					)}

					<div className="min-h-6 border-t border-dashed border-muted-foreground pt-2">
						{flow.log.length === 0 && !flow.isBusy ? (
							<div className="text-muted-foreground">
								{flow.blocker ? `○ ${flow.blocker}` : `✓ ready: ${flow.mods.length} mods for ${flow.modLoader} ${flow.gameVersion}`}
							</div>
						) : (
							<LogView flow={flow} showPrompt={false} />
						)}
					</div>
				</div>

				<div className="mt-4 flex justify-center">
					<DButton primary disabled={flow.isBusy} onClick={() => void flow.download()}>
						download
					</DButton>
				</div>
			</div>
		</div>
	);
}
