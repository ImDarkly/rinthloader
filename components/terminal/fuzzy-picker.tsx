"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { filterItems } from "@/lib/terminal/logic";
import { cn } from "@/lib/utils";

/** Minimal-scroll window start that keeps `active` visible. */
function windowStart(start: number, active: number, len: number, rows: number) {
	let s = Math.max(0, Math.min(start, len - rows));
	if (active < s) s = active;
	else if (active >= s + rows) s = active - rows + 1;
	return s;
}

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
	const [winStart, setWinStart] = useState(() => {
		const idx = value ? items.indexOf(value) : -1;
		return Math.max(0, idx - Math.floor(rows / 2));
	});
	const filtered = useMemo(() => filterItems(items, query), [items, query]);

	// Derived, so it stays valid when the filtered list shrinks.
	const active = Math.max(0, Math.min(cursor, filtered.length - 1));
	const start = windowStart(winStart, active, filtered.length, rows);
	// Keyboard moves scroll the window minimally; hover never moves it.
	const move = (next: number) => {
		const c = Math.max(0, Math.min(next, filtered.length - 1));
		setCursor(c);
		setWinStart(windowStart(start, c, filtered.length, rows));
	};
	// Wheel/touch scroll the window by whole rows; the cursor is pulled along to stay visible.
	const scrollRows = (delta: number) => {
		const maxStart = Math.max(0, filtered.length - rows);
		const s = Math.max(0, Math.min(start + delta, maxStart));
		if (s === start) return;
		setWinStart(s);
		setCursor(Math.max(s, Math.min(active, s + rows - 1)));
	};
	const scrollRef = useRef(scrollRows);
	useEffect(() => {
		scrollRef.current = scrollRows;
	});

	// Native listeners: React's wheel/touch handlers are passive and can't stop the page scrolling.
	const listRef = useRef<HTMLUListElement>(null);
	useEffect(() => {
		const el = listRef.current;
		if (!el) return;
		const ROW_PX = 24;
		let acc = 0;
		let lastY: number | null = null;
		const step = (px: number) => {
			acc += px;
			const n = Math.trunc(acc / ROW_PX);
			if (n !== 0) {
				acc -= n * ROW_PX;
				scrollRef.current(n);
			}
		};
		const onWheel = (e: WheelEvent) => {
			e.preventDefault();
			step(e.deltaMode === 1 ? e.deltaY * ROW_PX : e.deltaY);
		};
		const onTouchStart = (e: TouchEvent) => {
			lastY = e.touches.item(0)?.clientY ?? null;
			acc = 0;
		};
		const onTouchMove = (e: TouchEvent) => {
			const y = e.touches.item(0)?.clientY;
			if (y === undefined || lastY === null) return;
			e.preventDefault();
			step(lastY - y);
			lastY = y;
		};
		el.addEventListener("wheel", onWheel, { passive: false });
		el.addEventListener("touchstart", onTouchStart, { passive: true });
		el.addEventListener("touchmove", onTouchMove, { passive: false });
		return () => {
			el.removeEventListener("wheel", onWheel);
			el.removeEventListener("touchstart", onTouchStart);
			el.removeEventListener("touchmove", onTouchMove);
		};
	}, []);

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
						setWinStart(0);
					}}
					onKeyDown={(e) => {
						if (e.key === "ArrowDown") {
							e.preventDefault();
							move(active + 1);
						} else if (e.key === "ArrowUp") {
							e.preventDefault();
							move(active - 1);
						} else if (e.key === "Enter") {
							e.preventDefault();
							const picked = filtered.at(active);
							if (picked !== undefined) onPick(picked);
						}
					}}
					placeholder="type to filter"
					role="combobox"
					aria-autocomplete="list"
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
				{filtered.length}/{items.length} <span aria-hidden="true">────────────</span>
			</div>
			<ul
				ref={listRef}
				id={`${id}-list`}
				role="listbox"
				aria-label={label}
				className="flex touch-none flex-col overscroll-contain"
			>
				{visible.map((item, i) => {
					const idx = start + i;
					const isActive = idx === active;
					return (
						<li
							key={item}
							id={`${id}-${idx}`}
							role="option"
							aria-selected={item === value}
							onMouseEnter={() => {
								setCursor(idx);
							}}
							onClick={() => {
								onPick(item);
							}}
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
