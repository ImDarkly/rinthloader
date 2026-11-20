"use client";

// THROWAWAY SPIKE — Prototype A: prompt wizard (create-vite / gum style).

import { useState } from "react";
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

type Step = "version" | "loader" | "source" | "mods" | "download";
const order: Step[] = ["version", "loader", "source", "mods", "download"];

export default function ProtoWizard() {
	const flow = useProtoFlow();
	const [step, setStep] = useState<Step>("version");
	const [source, setSource] = useState<"jar" | "names" | null>(null);
	const [text, setText] = useState("");
	const at = order.indexOf(step);
	const next = () => setStep(order[Math.min(at + 1, order.length - 1)]);

	const answered = (s: Step, question: string, answer: string) =>
		order.indexOf(s) < at && (
			<div className="flex flex-wrap gap-x-2">
				<span className="text-primary">✔</span>
				<span>{question}</span>
				<span className="text-muted-foreground">·</span>
				<span>{answer}</span>
				<TButton className="text-muted-foreground" onClick={() => setStep(s)}>
					[edit]
				</TButton>
			</div>
		);

	const ask = (question: string, hint?: string) => (
		<div>
			<span className="text-primary">?</span> {question}{" "}
			{hint && <span className="text-muted-foreground">› {hint}</span>}
		</div>
	);

	return (
		<div className="flex flex-col gap-1">
			<div>
				<span className="text-muted-foreground">~/mods</span>{" "}
				<span className="text-primary">$</span> rinthloader
			</div>
			<div className="mb-2 text-muted-foreground">
				download minecraft mods from modrinth as one zip
			</div>

			{answered("version", "minecraft version", flow.gameVersion ?? "—")}
			{answered("loader", "mod loader", flow.modLoader)}
			{answered("source", "add mods by", source === "jar" ? "dropping .jar files" : "typing names")}
			{answered("mods", "mods", `${flow.mods.length} ready`)}

			{step === "version" && (
				<div className="flex flex-col gap-1">
					{ask("minecraft version", "type to filter, ↵ to pick")}
					<div className="pl-2">
						<FuzzyPicker
							id="a-version"
							prompt="version"
							autoFocus
							items={flow.versionNames}
							value={flow.gameVersion}
							onPick={(v) => {
								flow.setVersion(v);
								next();
							}}
						/>
						<TButton className="mt-1 text-muted-foreground" onClick={() => flow.setSnapshots(!flow.snapshots)}>
							[{flow.snapshots ? "x" : " "}] include snapshots
						</TButton>
					</div>
				</div>
			)}

			{step === "loader" && (
				<div className="flex flex-col gap-1">
					{ask("mod loader", "type to filter, ↵ to pick")}
					<div className="pl-2">
						<FuzzyPicker
							id="a-loader"
							prompt="loader"
							autoFocus
							items={flow.loaderNames}
							value={flow.modLoader}
							onPick={(v) => {
								flow.setLoader(v);
								next();
							}}
						/>
					</div>
				</div>
			)}

			{step === "source" && (
				<div className="flex flex-col gap-1">
					{ask("how do you want to add mods?")}
					<div className="flex flex-col pl-2">
						{([
							["jar", "drop .jar files", "reads names from Fabric jars"],
							["names", "type mod names", "one per line"],
						] as const).map(([value, label, hint], i) => (
							<TButton
								key={value}
								className="w-fit text-left"
								onClick={() => {
									setSource(value);
									next();
								}}
							>
								<span className="text-primary">{i === 0 ? "❯" : " "}</span> {label}{" "}
								<span className="text-muted-foreground">— {hint}</span>
							</TButton>
						))}
					</div>
				</div>
			)}

			{step === "mods" && source === "jar" && (
				<div className="flex flex-col gap-1">
					{ask("drop your .jar files anywhere in this box")}
					<JarDrop onFiles={(f) => void flow.detect(f)} className="ml-2">
						{({ isDragActive, open }) => (
							<div
								className={cn(
									"flex flex-col gap-1 border border-dashed border-muted-foreground p-4",
									isDragActive && "border-primary bg-primary/10",
								)}
							>
								<div>
									{isDragActive ? "release to add" : "drop .jar files here or"}{" "}
									{!isDragActive && (
										<TButton primary onClick={open}>
											[ browse files ]
										</TButton>
									)}
								</div>
								<DetectedList flow={flow} />
							</div>
						)}
					</JarDrop>
					<div className="pl-2">
						<TButton primary disabled={!flow.mods.length} onClick={next}>
							[ ↵ continue with {flow.mods.length} mods ]
						</TButton>
					</div>
				</div>
			)}

			{step === "mods" && source === "names" && (
				<div className="flex flex-col gap-1">
					{ask("mod names", "one per line")}
					<div className="ml-2 flex border-l-2 border-primary pl-2">
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
							className="w-full resize-none bg-transparent caret-primary outline-none placeholder:text-muted-foreground"
						/>
					</div>
					<div className="pl-2">
						<TButton primary disabled={!flow.mods.length} onClick={next}>
							[ ↵ continue with {flow.mods.length} mods ]
						</TButton>
					</div>
				</div>
			)}

			{step === "download" && (
				<div className="flex flex-col gap-1">
					{ask(`download ${flow.mods.length} mods for ${flow.modLoader} ${flow.gameVersion}?`)}
					<div className="pl-2">
						<TButton primary disabled={flow.isBusy} onClick={() => void flow.download()}>
							[ ↵ download zip ]
						</TButton>
					</div>
				</div>
			)}

			<div className="mt-2">
				<LogView flow={flow} />
			</div>

			<div className="mt-6 border-t border-dashed border-muted-foreground pt-2 text-muted-foreground">
				<Key>↑↓</Key> move <Key>↵</Key> select <Key>tab</Key> next field · or click anything
			</div>
		</div>
	);
}
