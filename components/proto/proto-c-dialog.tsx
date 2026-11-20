"use client";

// THROWAWAY SPIKE — Prototype C: classic dialog (whiptail / old installer style).

import { useState, type ReactNode } from "react";
import {
	DetectedList,
	FuzzyPicker,
	JarDrop,
	LogView,
	useProtoFlow,
} from "./shared";
import { cn } from "@/lib/utils";

const steps = ["minecraft version", "mod loader", "mods", "download"] as const;

function DButton({
	children,
	onClick,
	primary,
	disabled,
}: {
	children: ReactNode;
	onClick: () => void;
	primary?: boolean;
	disabled?: boolean;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			className={cn(
				"cursor-pointer px-1 outline-none disabled:cursor-not-allowed disabled:opacity-50",
				primary
					? "bg-primary text-background hover:bg-foreground focus-visible:bg-foreground"
					: "hover:bg-foreground hover:text-background focus-visible:bg-foreground focus-visible:text-background",
			)}
		>
			&lt; {children} &gt;
		</button>
	);
}

export default function ProtoDialog() {
	const flow = useProtoFlow();
	const [i, setI] = useState(0);
	const [mode, setMode] = useState<"jar" | "names">("jar");
	const [text, setText] = useState("");
	const canNext =
		(i === 0 && !!flow.gameVersion) ||
		(i === 1 && !!flow.modLoader) ||
		(i === 2 && flow.mods.length > 0);
	const bar = "█".repeat((i + 1) * 3) + "░".repeat((steps.length - i - 1) * 3);

	return (
		<div className="flex min-h-[70dvh] items-center justify-center">
			<div
				role="dialog"
				aria-labelledby="c-title"
				className="relative w-full max-w-lg border-4 border-double border-foreground bg-background px-5 pt-6 pb-4 shadow-[10px_10px_0_0_var(--muted-foreground)]"
			>
				<div
					id="c-title"
					className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-background px-2"
				>
					<span className="text-primary">rinth</span>loader setup
				</div>

				<div className="mb-3 flex justify-between text-muted-foreground">
					<span>
						step {i + 1}/{steps.length}: {steps[i]}
					</span>
					<span aria-hidden="true">{bar}</span>
				</div>

				<div className="min-h-56">
					{i === 0 && (
						<>
							<p className="mb-2">Which Minecraft version are you playing?</p>
							<div className="border border-foreground p-2">
								<FuzzyPicker
									id="c-version"
									prompt="version"
									autoFocus
									rows={6}
									items={flow.versionNames}
									value={flow.gameVersion}
									onPick={(v) => {
										flow.setVersion(v);
										setI(1);
									}}
								/>
							</div>
							<button
								type="button"
								onClick={() => flow.setSnapshots(!flow.snapshots)}
								className="mt-2 cursor-pointer px-1 text-muted-foreground outline-none hover:bg-foreground hover:text-background focus-visible:bg-foreground focus-visible:text-background"
							>
								[{flow.snapshots ? "X" : " "}] show snapshots
							</button>
						</>
					)}

					{i === 1 && (
						<>
							<p className="mb-2">Which mod loader do you use?</p>
							<div className="border border-foreground p-2">
								<FuzzyPicker
									id="c-loader"
									prompt="loader"
									autoFocus
									rows={6}
									items={flow.loaderNames}
									value={flow.modLoader}
									onPick={(v) => {
										flow.setLoader(v);
										setI(2);
									}}
								/>
							</div>
						</>
					)}

					{i === 2 && (
						<>
							<p className="mb-2">Add the mods you want:</p>
							<div role="radiogroup" aria-label="Import mode" className="mb-2 flex flex-col">
								{([
									["jar", "( ) drop .jar files", "(•) drop .jar files"],
									["names", "( ) type mod names", "(•) type mod names"],
								] as const).map(([v, off, on]) => (
									<button
										key={v}
										type="button"
										role="radio"
										aria-checked={mode === v}
										onClick={() => setMode(v)}
										className="w-fit cursor-pointer px-1 text-left outline-none hover:bg-foreground hover:text-background focus-visible:bg-foreground focus-visible:text-background"
									>
										{mode === v ? on : off}
									</button>
								))}
							</div>
							{mode === "jar" ? (
								<JarDrop onFiles={(f) => void flow.detect(f)}>
									{({ isDragActive, open }) => (
										<div className={cn("border border-dashed border-foreground p-3", isDragActive && "bg-primary/10")}>
											<div className="mb-1">
												{isDragActive ? "release to add" : "drop files here"}{" "}
												{!isDragActive && <DButton onClick={open}>browse</DButton>}
											</div>
											<DetectedList flow={flow} />
										</div>
									)}
								</JarDrop>
							) : (
								<textarea
									autoFocus
									rows={6}
									value={text}
									onChange={(e) => {
										setText(e.target.value);
										flow.setManual(e.target.value);
									}}
									placeholder={"sodium\nlithium\niris"}
									aria-label="Mod names, one per line"
									className="w-full resize-none border border-foreground bg-transparent p-2 caret-primary outline-none placeholder:text-muted-foreground"
								/>
							)}
						</>
					)}

					{i === 3 && (
						<>
							<p className="mb-2">Ready to build your mod pack:</p>
							<pre className="mb-2 font-mono">
								{`  minecraft  ${flow.gameVersion}\n  loader     ${flow.modLoader}\n  mods       ${flow.mods.length}`}
							</pre>
							<LogView flow={flow} showPrompt={false} />
						</>
					)}
				</div>

				<div className="mt-4 flex justify-center gap-6">
					<DButton onClick={() => setI((x) => Math.max(0, x - 1))} disabled={i === 0}>
						back
					</DButton>
					{i < 3 ? (
						<DButton primary disabled={!canNext} onClick={() => setI((x) => x + 1)}>
							next
						</DButton>
					) : (
						<DButton primary disabled={flow.isBusy} onClick={() => void flow.download()}>
							download
						</DButton>
					)}
				</div>
				{!canNext && i < 3 && (
					<div className="mt-2 text-center text-muted-foreground">
						{i === 2 ? "add at least one mod to continue" : "pick one to continue"}
					</div>
				)}
			</div>
		</div>
	);
}
