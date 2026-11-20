"use client";

// THROWAWAY SPIKE — Prototype B: pane-based TUI (lazygit / btop style).

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
	DetectedList,
	FuzzyPicker,
	JarDrop,
	Key,
	LogView,
	TButton,
	useProtoFlow,
} from "./shared";
import { cn } from "@/lib/utils";

function Pane({
	n,
	title,
	status,
	active,
	onFocus,
	children,
	className,
}: {
	n: number;
	title: string;
	status?: ReactNode;
	active: boolean;
	onFocus: () => void;
	children: ReactNode;
	className?: string;
}) {
	return (
		<section
			onFocusCapture={onFocus}
			onMouseDown={onFocus}
			aria-label={title}
			className={cn(
				"relative border px-3 pt-4 pb-3",
				active ? "border-primary" : "border-muted-foreground/60",
				className,
			)}
		>
			<div className="absolute -top-3 left-2 bg-background px-1">
				<span className={active ? "text-primary" : ""}>
					{n} {title}
				</span>
			</div>
			{status && (
				<div className="absolute -top-3 right-2 bg-background px-1">{status}</div>
			)}
			{children}
		</section>
	);
}

export default function ProtoPanes() {
	const flow = useProtoFlow();
	const [active, setActive] = useState(1);
	const [mode, setMode] = useState<"jar" | "names">("jar");
	const [text, setText] = useState("");
	const ref1 = useRef<HTMLDivElement>(null);
	const ref2 = useRef<HTMLDivElement>(null);
	const ref3 = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			const t = e.target as HTMLElement;
			if (t.tagName === "TEXTAREA" || (t.tagName === "INPUT" && (t as HTMLInputElement).value)) return;
			if (e.ctrlKey || e.metaKey || e.altKey) return;
			if (["1", "2", "3"].includes(e.key)) {
				e.preventDefault();
				const n = Number(e.key);
				setActive(n);
				[ref1, ref2, ref3][n - 1].current?.querySelector<HTMLElement>("input,textarea,button")?.focus();
			}
			if (e.key === "d" && t.tagName !== "INPUT") {
				e.preventDefault();
				setActive(3);
				void flow.download();
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	});

	const ok = (cond: boolean, yes: string, no: string) => (
		<span className={cond ? "text-primary" : "text-muted-foreground"}>
			{cond ? `✓ ${yes}` : `○ ${no}`}
		</span>
	);

	return (
		<div className="flex flex-col gap-5">
			<div className="flex flex-wrap justify-between gap-2">
				<span>
					<span className="text-primary">rinth</span>loader{" "}
					<span className="text-muted-foreground">— {flow.modLoader} {flow.gameVersion ?? "?"}</span>
				</span>
				<TButton className="text-muted-foreground" onClick={() => flow.setSnapshots(!flow.snapshots)}>
					snapshots:{flow.snapshots ? "on" : "off"}
				</TButton>
			</div>

			<div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
				<Pane
					n={1}
					title="target"
					active={active === 1}
					onFocus={() => setActive(1)}
					status={ok(!!flow.gameVersion && !!flow.modLoader, "ready", "pick")}
				>
					<div ref={ref1} className="flex flex-col gap-3">
						<FuzzyPicker
							id="b-version"
							prompt="minecraft"
							rows={5}
							items={flow.versionNames}
							value={flow.gameVersion}
							onPick={flow.setVersion}
						/>
						<div>
							<div className="text-muted-foreground">loader</div>
							<div className="flex flex-wrap gap-x-1">
								{flow.loaderNames.slice(0, 12).map((l) => (
									<TButton
										key={l}
										onClick={() => flow.setLoader(l)}
										className={cn(l === flow.modLoader && "bg-foreground text-background")}
									>
										{l}
									</TButton>
								))}
							</div>
						</div>
					</div>
				</Pane>

				<Pane
					n={2}
					title="mods"
					active={active === 2}
					onFocus={() => setActive(2)}
					status={ok(flow.mods.length > 0, `${flow.mods.length}`, "empty")}
				>
					<div ref={ref2} className="flex flex-col gap-2">
						<div className="flex gap-1">
							<TButton onClick={() => setMode("jar")} className={cn(mode === "jar" && "bg-foreground text-background")}>
								.jar files
							</TButton>
							<TButton onClick={() => setMode("names")} className={cn(mode === "names" && "bg-foreground text-background")}>
								names
							</TButton>
						</div>
						{mode === "jar" ? (
							<JarDrop onFiles={(f) => void flow.detect(f)}>
								{({ isDragActive, open }) => (
									<div className={cn("flex min-h-32 flex-col gap-1", isDragActive && "bg-primary/10")}>
										<div className="text-muted-foreground">
											{isDragActive ? "release to add" : "drop .jar files on this pane or"}{" "}
											{!isDragActive && (
												<TButton primary onClick={open}>
													[ browse ]
												</TButton>
											)}
										</div>
										<DetectedList flow={flow} />
									</div>
								)}
							</JarDrop>
						) : (
							<textarea
								rows={7}
								value={text}
								onChange={(e) => {
									setText(e.target.value);
									flow.setManual(e.target.value);
								}}
								placeholder={"sodium\nlithium\niris"}
								aria-label="Mod names, one per line"
								className="w-full resize-none bg-transparent caret-primary outline-none placeholder:text-muted-foreground"
							/>
						)}
					</div>
				</Pane>
			</div>

			<Pane
				n={3}
				title="download"
				active={active === 3}
				onFocus={() => setActive(3)}
				status={ok(!flow.blocker, "ready", flow.blocker ?? "")}
			>
				<div ref={ref3} className="flex flex-col gap-1">
					<TButton primary className="w-fit" disabled={flow.isBusy} onClick={() => void flow.download()}>
						[ d download {flow.mods.length} mods ]
					</TButton>
					<LogView flow={flow} />
				</div>
			</Pane>

			<div className="flex flex-wrap gap-x-3 gap-y-1 text-muted-foreground">
				<span><Key>1</Key> target</span>
				<span><Key>2</Key> mods</span>
				<span><Key>3</Key> log</span>
				<span><Key>d</Key> download</span>
				<span><Key>↑↓</Key> move</span>
				<span><Key>↵</Key> pick</span>
			</div>
		</div>
	);
}
