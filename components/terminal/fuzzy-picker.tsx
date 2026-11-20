"use client";

import { useMemo, useState } from "react";
import { filterItems } from "@/lib/terminal/logic";
import { cn } from "@/lib/utils";

/** fzf-style filter + list. Type to filter, up/down to move, enter to pick, or click. */
export function FuzzyPicker({
	id,
	label,
	items,
	value,
	onPick,
	rows = 7,
	autoFocus,
}: {
	id: string;
	label: string;
	items: string[];
	value: string | null;
	onPick: (v: string) => void;
	rows?: number;
	autoFocus?: boolean;
}) {
	const [query, setQuery] = useState("");
	const [cursor, setCursor] = useState(() => {
		const idx = value ? items.indexOf(value) : -1;
		return idx >= 0 ? idx : 0;
	});
	const filtered = useMemo(() => filterItems(items, query), [items, query]);

	// Derived, so it stays valid when the filtered list shrinks.
	const active = Math.max(0, Math.min(cursor, filtered.length - 1));
	const start = Math.max(
		0,
		Math.min(active - Math.floor(rows / 2), filtered.length - rows),
	);
	const visible = filtered.slice(start, start + rows);
	const hasMatches = filtered.length > 0;

	return (
		<div className="flex w-full flex-col">
			<div className="flex items-center gap-2">
				<label htmlFor={id} className="text-primary">
					{label} ›
				</label>
				<input
					id={id}
					autoFocus={autoFocus}
					value={query}
					onChange={(e) => {
						setQuery(e.target.value);
						setCursor(0);
					}}
					onKeyDown={(e) => {
						if (e.key === "ArrowDown") {
							e.preventDefault();
							setCursor(Math.min(active + 1, filtered.length - 1));
						} else if (e.key === "ArrowUp") {
							e.preventDefault();
							setCursor(Math.max(active - 1, 0));
						} else if (e.key === "Enter") {
							e.preventDefault();
							if (hasMatches) onPick(filtered[active]);
						}
					}}
					placeholder="type to filter"
					role="combobox"
					aria-expanded="true"
					aria-controls={`${id}-list`}
					aria-activedescendant={hasMatches ? `${id}-${active}` : undefined}
					autoComplete="off"
					spellCheck={false}
					className="min-w-0 flex-1 bg-transparent caret-primary outline-none placeholder:text-muted-foreground"
				/>
			</div>
			<div className="text-muted-foreground">
				{"  "}
				{filtered.length}/{items.length} ────────────
			</div>
			<ul id={`${id}-list`} role="listbox" aria-label={label} className="flex flex-col">
				{visible.map((item, i) => {
					const idx = start + i;
					const isActive = idx === active;
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
							<span aria-hidden="true" className="w-2 text-primary">
								{isActive ? "▌" : " "}
							</span>
							<span className={cn(isActive && "bg-foreground text-background")}>
								{item}
							</span>
							{item === value && (
								<span aria-hidden="true" className="text-primary">
									✓
								</span>
							)}
						</li>
					);
				})}
				{!hasMatches && (
					<li role="presentation" className="text-muted-foreground">
						{"  "}no matches
					</li>
				)}
			</ul>
		</div>
	);
}
