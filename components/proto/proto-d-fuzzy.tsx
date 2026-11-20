"use client";

// THROWAWAY SPIKE — Prototype D: fzf-style finder as the whole app.
// Mods mode searches Modrinth live, filtered to the chosen version + loader.

import { useEffect, useState } from "react";
import { FuzzyPicker, JarDrop, Key, LogView, TButton, useProtoFlow } from "./shared";
import { cn } from "@/lib/utils";

type Mode = "version" | "loader" | "mods";
type Hit = { slug: string; title: string; downloads: number };

export default function ProtoFuzzy() {
	const flow = useProtoFlow();
	const [mode, setMode] = useState<Mode>("version");
	const [query, setQuery] = useState("");
	const [hits, setHits] = useState<Hit[]>([]);
	const [cursor, setCursor] = useState(0);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (mode !== "mods") return;
		const facets = JSON.stringify([
			["project_type:mod"],
			...(flow.gameVersion ? [[`versions:${flow.gameVersion}`]] : []),
			...(flow.modLoader ? [[`categories:${flow.modLoader}`]] : []),
		]);
		const ctrl = new AbortController();
		const t = setTimeout(() => {
			setLoading(true);
			fetch(
				`https://api.modrinth.com/v2/search?limit=8&query=${encodeURIComponent(query)}&facets=${encodeURIComponent(facets)}`,
				{ signal: ctrl.signal },
			)
				.then((r) => r.json())
				.then((d: { hits: Hit[] }) => {
					setHits(d.hits);
					setCursor(0);
				})
				.catch(() => {})
				.finally(() => setLoading(false));
		}, 200);
		return () => {
			clearTimeout(t);
			ctrl.abort();
		};
	}, [mode, query, flow.gameVersion, flow.modLoader]);

	const toggle = (slug: string) => {
		const has = flow.mods.includes(slug);
		flow.setManual((has ? flow.mods.filter((m) => m !== slug) : [...flow.mods, slug]).join("\n"));
	};

	const tabs: [Mode, string, string][] = [
		["version", "version", flow.gameVersion ?? "?"],
		["loader", "loader", flow.modLoader],
		["mods", "mods", String(flow.mods.length)],
	];

	return (
		<JarDrop
			onFiles={(f) => {
				void flow.detect(f);
				setMode("mods");
			}}
		>
			{({ isDragActive, open }) => (
				<div className={cn("flex flex-col gap-3", isDragActive && "outline-1 outline-dashed outline-primary")}>
					<div className="flex flex-wrap items-center gap-x-1">
						<span className="mr-2">
							<span className="text-primary">rinth</span>loader
						</span>
						{tabs.map(([m, label, val]) => (
							<TButton
								key={m}
								onClick={() => {
									setMode(m);
									setQuery("");
								}}
								className={cn(mode === m && "bg-foreground text-background")}
							>
								{label}:{val}
							</TButton>
						))}
					</div>

					<div className="min-h-64 border-l-2 border-primary pl-3">
						{mode === "version" && (
							<FuzzyPicker
								key="v"
								id="d-version"
								prompt="minecraft"
								autoFocus
								rows={8}
								items={flow.versionNames}
								value={flow.gameVersion}
								onPick={(v) => {
									flow.setVersion(v);
									setMode("loader");
								}}
							/>
						)}
						{mode === "loader" && (
							<FuzzyPicker
								key="l"
								id="d-loader"
								prompt="loader"
								autoFocus
								rows={8}
								items={flow.loaderNames}
								value={flow.modLoader}
								onPick={(v) => {
									flow.setLoader(v);
									setMode("mods");
								}}
							/>
						)}
						{mode === "mods" && (
							<div className="flex flex-col">
								<div className="flex items-center gap-2">
									<label htmlFor="d-mods" className="text-primary">
										mods ›
									</label>
									<input
										id="d-mods"
										autoFocus
										value={query}
										onChange={(e) => setQuery(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === "ArrowDown") {
												e.preventDefault();
												setCursor((c) => Math.min(c + 1, hits.length - 1));
											} else if (e.key === "ArrowUp") {
												e.preventDefault();
												setCursor((c) => Math.max(c - 1, 0));
											} else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
												e.preventDefault();
												void flow.download();
											} else if (e.key === "Enter" && hits[cursor]) {
												e.preventDefault();
												toggle(hits[cursor].slug);
											}
										}}
										placeholder="search modrinth, ↵ to add"
										className="min-w-0 flex-1 bg-transparent caret-primary outline-none placeholder:text-muted-foreground"
									/>
								</div>
								<div className="text-muted-foreground">
									{"  "}
									{loading ? "searching…" : `${hits.length} results for ${flow.modLoader} ${flow.gameVersion}`} ──────
								</div>
								<ul role="listbox" aria-label="Search results" className="flex flex-col">
									{hits.map((h, i) => {
										const on = flow.mods.includes(h.slug);
										return (
											<li
												key={h.slug}
												role="option"
												aria-selected={on}
												onMouseEnter={() => setCursor(i)}
												onClick={() => toggle(h.slug)}
												className="flex cursor-pointer gap-2"
											>
												<span className="w-2 text-primary">{i === cursor ? "▌" : " "}</span>
												<span className={on ? "text-primary" : "text-muted-foreground"}>{on ? "[x]" : "[ ]"}</span>
												<span className={cn(i === cursor && "bg-foreground text-background")}>{h.title}</span>
												<span className="text-muted-foreground">
													{h.slug} · {Intl.NumberFormat("en", { notation: "compact" }).format(h.downloads)}↓
												</span>
											</li>
										);
									})}
								</ul>
							</div>
						)}
					</div>

					<div className="flex flex-col gap-1">
						<div className="text-muted-foreground">selected ({flow.mods.length})</div>
						<div className="flex flex-wrap gap-x-2">
							{flow.mods.length === 0 && (
								<span className="text-muted-foreground">
									none yet · search above, or drop .jar files anywhere{" "}
									<TButton primary onClick={open}>
										[ browse ]
									</TButton>
								</span>
							)}
							{flow.mods.map((m) => (
								<TButton key={m} onClick={() => toggle(m)} className="text-primary" >
									{m} ✕
								</TButton>
							))}
						</div>
					</div>

					<div>
						<TButton primary disabled={flow.isBusy} onClick={() => void flow.download()}>
							[ ctrl+↵ download {flow.mods.length} mods ]
						</TButton>
						{flow.blocker && <span className="ml-2 text-muted-foreground">○ {flow.blocker}</span>}
					</div>
					<LogView flow={flow} />

					<div className="flex flex-wrap gap-x-3 text-muted-foreground">
						<span><Key>↑↓</Key> move</span>
						<span><Key>↵</Key> pick / add</span>
						<span><Key>ctrl+↵</Key> download</span>
						<span>drop .jar anywhere</span>
					</div>
				</div>
			)}
		</JarDrop>
	);
}
